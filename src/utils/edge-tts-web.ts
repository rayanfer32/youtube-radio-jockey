"use strict";

export interface Voice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
  VoiceType?: string;
}

export interface EdgeTTSOptions {
  pitch?: string | number;
  rate?: string | number;
  volume?: string | number;
}

export class EdgeTTS {
  audio_stream: Uint8Array[] & BlobPart[] = [];
  audio_format: string = "mp3";
  ws: WebSocket | null = null;

  private Constants = {
    TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
    WSS_URL:
      "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    VOICES_URL:
      "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list",
  };

  async getVoices(): Promise<Voice[]> {
    const response = await fetch(
      `${this.Constants.VOICES_URL}?trustedclienttoken=${this.Constants.TRUSTED_CLIENT_TOKEN}`
    );
    const data: Voice[] = await response.json();
    return data.map((voice) => {
      const { Name, ShortName, Gender, Locale, VoiceType } = voice;
      return { Name, ShortName, Gender, Locale, VoiceType };
    });
  }

  async getVoicesByLanguage(locale: string): Promise<Voice[]> {
    const voices = await this.getVoices();
    return voices.filter((voice) => voice.Locale.startsWith(locale));
  }

  async getVoicesByGender(gender: string): Promise<Voice[]> {
    const voices = await this.getVoices();
    return voices.filter((voice) => voice.Gender === gender);
  }

  generateUUID(): string {
    return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  validatePitch(pitch: string | number): string {
    if (typeof pitch === "number") {
      return pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;
    }
    if (!/^[+-]?\d{1,3}(?:\.\d+)?Hz$/.test(pitch)) {
      throw new Error(
        "Invalid pitch format. Expected '-100Hz to +100Hz' or a number."
      );
    }
    return pitch;
  }

  validateRate(rate: string | number): string {
    let rateValue: number;
    if (typeof rate === "string") {
      rateValue = parseFloat(rate.replace("%", ""));
      if (isNaN(rateValue)) throw new Error("Invalid rate format.");
    } else {
      rateValue = rate;
    }
    return rateValue >= 0 ? `+${rateValue}%` : `${rateValue}%`;
  }

  validateVolume(volume: string | number): string {
    let volumeValue: number;
    if (typeof volume === "string") {
      volumeValue = parseInt(volume.replace("%", ""), 10);
      if (isNaN(volumeValue)) throw new Error("Invalid volume format.");
    } else {
      volumeValue = volume;
    }
    if (volumeValue < -100 || volumeValue > 100) {
      throw new Error("Volume out of range (-100% to 100%).");
    }
    return `${volumeValue}%`;
  }

  async synthesize(
    text: string,
    voice: string = "en-US-AnaNeural",
    options: EdgeTTSOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audio_stream = [];
      const req_id = this.generateUUID();
      this.ws = new WebSocket(
        `${this.Constants.WSS_URL}?trustedclienttoken=${this.Constants.TRUSTED_CLIENT_TOKEN}&ConnectionId=${req_id}`
      );
      this.ws.binaryType = "arraybuffer";

      const SSML_text = this.getSSML(text, voice, options);
      const timeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
        reject(new Error("Synthesis timeout"));
      }, 30000);

      this.ws.addEventListener("open", () => {
        this.ws?.send(this.buildTTSConfigMessage());
        const speechMessage =
          `X-RequestId:${req_id}\r\nContent-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${new Date().toISOString()}Z\r\nPath:ssml\r\n\r\n${SSML_text}`;
        this.ws?.send(speechMessage);
      });

      this.ws.addEventListener("message", (event: MessageEvent) => {
        this.processAudioData(event.data);
      });

      this.ws.addEventListener("error", (err) => {
        clearTimeout(timeout);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
        reject(err);
      });

      this.ws.addEventListener("close", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  getSSML(text: string, voice: string, options: EdgeTTSOptions = {}): string {
    if (typeof options.pitch === "string") {
      options.pitch = options.pitch.replace("hz", "Hz");
    }
    const pitch = this.validatePitch(options.pitch ?? 0);
    const rate = this.validateRate(options.rate ?? 0);
    const volume = this.validateVolume(options.volume ?? 0);
    return `<speak version='1.0' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${text}</prosody></voice></speak>`;
  }

  buildTTSConfigMessage(): string {
    return (
      `X-Timestamp:${new Date().toISOString()}Z\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
      `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
    );
  }

  processAudioData(data: ArrayBuffer | string): void {
    if (typeof data === "string") {
      if (data.includes("Path:turn.end")) {
        this.ws?.close();
      }
      return;
    }

    const buffer = new Uint8Array(data);
    const needle = new TextEncoder().encode("Path:audio\r\n");
    const idx = this.indexOfSubarray(buffer, needle);
    if (idx !== -1) {
      const audioChunk = buffer.subarray(idx + needle.length);
      this.audio_stream.push(audioChunk);
    }
    if (new TextDecoder().decode(buffer).includes("Path:turn.end")) {
      this.ws?.close();
    }
  }

  indexOfSubarray(haystack: Uint8Array, needle: Uint8Array): number {
    for (let i = 0; i <= haystack.length - needle.length; i++) {
      let match = true;
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
    return -1;
  }

  toBlob(format: string = this.audio_format): Blob {
    if (this.audio_stream.length === 0) {
      throw new Error("No audio data available. Did you run synthesize() first?");
    }
    return new Blob(this.audio_stream, { type: `audio/${format}` });
  }

  async toBase64(): Promise<string> {
    const blob = this.toBlob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  download(filename: string = "output.mp3"): void {
    const blob = this.toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

(window as unknown as { EdgeTTS: typeof EdgeTTS }).EdgeTTS = EdgeTTS;
