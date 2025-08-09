"use strict";

class EdgeTTS {
  constructor() {
    this.audio_stream = [];
    this.audio_format = "mp3";
    this.ws = null;
  }

  Constants = {
    TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
    WSS_URL: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    VOICES_URL: "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list",
  };

  async getVoices() {
    const response = await fetch(
      `${this.Constants.VOICES_URL}?trustedclienttoken=${this.Constants.TRUSTED_CLIENT_TOKEN}`
    );
    const data = await response.json();
    return data.map((voice) => {
      delete voice.VoiceTag;
      delete voice.SuggestedCodec;
      delete voice.Status;
      return voice;
    });
  }

  async getVoicesByLanguage(locale) {
    const voices = await this.getVoices();
    return voices.filter((voice) => voice.Locale.startsWith(locale));
  }

  async getVoicesByGender(gender) {
    const voices = await this.getVoices();
    return voices.filter((voice) => voice.Gender === gender);
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  validatePitch(pitch) {
    if (typeof pitch === "number") {
      return pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;
    }
    if (!/^[+-]?\d{1,3}(?:\.\d+)?Hz$/.test(pitch)) {
      throw new Error("Invalid pitch format. Expected '-100Hz to +100Hz' or a number.");
    }
    return pitch;
  }

  validateRate(rate) {
    let rateValue;
    if (typeof rate === "string") {
      rateValue = parseFloat(rate.replace("%", ""));
      if (isNaN(rateValue)) throw new Error("Invalid rate format.");
    } else {
      rateValue = rate;
    }
    return rateValue >= 0 ? `+${rateValue}%` : `${rateValue}%`;
  }

  validateVolume(volume) {
    let volumeValue;
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

  async synthesize(text, voice = "en-US-AnaNeural", options = {}) {
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
        this.ws.send(this.buildTTSConfigMessage());
        const speechMessage =
          `X-RequestId:${req_id}\r\nContent-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${new Date().toISOString()}Z\r\nPath:ssml\r\n\r\n${SSML_text}`;
        this.ws.send(speechMessage);
      });

      this.ws.addEventListener("message", (event) => {
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

  getSSML(text, voice, options = {}) {
    if (typeof options.pitch === "string") {
      options.pitch = options.pitch.replace("hz", "Hz");
    }
    const pitch = this.validatePitch(options.pitch ?? 0);
    const rate = this.validateRate(options.rate ?? 0);
    const volume = this.validateVolume(options.volume ?? 0);
    return `<speak version='1.0' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${text}</prosody></voice></speak>`;
  }

  buildTTSConfigMessage() {
    return (
      `X-Timestamp:${new Date().toISOString()}Z\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
      `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
    );
  }

  processAudioData(data) {
    if (typeof data === "string") {
      // text message, not audio
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

  indexOfSubarray(haystack, needle) {
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

  toBlob(format = this.audio_format) {
    if (this.audio_stream.length === 0) {
      throw new Error("No audio data available. Did you run synthesize() first?");
    }
    return new Blob(this.audio_stream, { type: `audio/${format}` });
  }

  toBase64() {
    return new Promise((resolve) => {
      const blob = this.toBlob();
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  download(filename = "output.mp3") {
    const blob = this.toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}


window.EdgeTTS = EdgeTTS;