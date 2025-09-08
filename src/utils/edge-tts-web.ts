"use strict";

const CHROMIUM_FULL_VERSION = "130.0.2849.68";
const CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split(".", 1)[0];
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;

const Constants = {
  TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
  WSS_URL:
    "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
  VOICES_URL:
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list",
};

// * Custom error for skew adjustment failures
export class SkewAdjustmentError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = "SkewAdjustmentError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

const WIN_EPOCH = 11644473600; // seconds between 1601-01-01 and 1970-01-01
const S_TO_NS = 1e9;

//  * Class to handle DRM operations with clock skew correction.
export class DRM {
  static clock_skew_seconds = 0.0;

  //  * Adjust the clock skew in seconds in case the system clock is off.
  static adj_clock_skew_seconds(skew_seconds: number) {
    DRM.clock_skew_seconds += skew_seconds;
  }

  //  * Gets the current timestamp in seconds (Unix time) with clock skew correction.
  static get_unix_timestamp(): number {
    return Date.now() / 1000 + DRM.clock_skew_seconds;
  }

  //  * Parses an RFC 2616 date string into a Unix timestamp.
  //  * Example: "Sun, 06 Nov 1994 08:49:37 GMT"
  static parse_rfc2616_date(date: string): number | null {
    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return null;
      }
      return parsed.getTime() / 1000;
    } catch (err) {
      return null;
    }
  }

  //  * Adjusts skew based on the server "Date" header.
  static handle_client_response_error(e: { headers: Record<string, string> }) {
    if (!e.headers) {
      throw new SkewAdjustmentError("No server date in headers.", { cause: e });
    }
    const server_date = e.headers["date"];
    if (!server_date || typeof server_date !== "string") {
      throw new SkewAdjustmentError("No server date in headers.", { cause: e });
    }
    const server_date_parsed = DRM.parse_rfc2616_date(server_date);
    if (server_date_parsed === null) {
      throw new SkewAdjustmentError(
        `Failed to parse server date: ${server_date}`,
        {
          cause: e,
        }
      );
    }
    const client_date = DRM.get_unix_timestamp();
    DRM.adj_clock_skew_seconds(server_date_parsed - client_date);
  }

  // * Generates the Sec-MS-GEC token value.
  static async generate_sec_ms_gec() {
    // Get current timestamp with skew
    let ticks = DRM.get_unix_timestamp();

    // Switch to Windows epoch
    ticks += WIN_EPOCH;

    // Round down to nearest 5 minutes (300 seconds)
    ticks -= ticks % 300;

    // Convert to 100-nanosecond intervals
    ticks *= S_TO_NS / 100;

    // Concatenate ticks and trusted token
    const str_to_hash = `${Math.floor(ticks)}${Constants.TRUSTED_CLIENT_TOKEN}`;

    // Encode as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(str_to_hash);

    // SHA-256 hash
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert ArrayBuffer → hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex.toUpperCase();
  }
}

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

  async getVoices(): Promise<Voice[]> {
    const response = await fetch(
      `${Constants.VOICES_URL}?trustedclienttoken=${Constants.TRUSTED_CLIENT_TOKEN}`
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
    const drmSecMS = await DRM.generate_sec_ms_gec();
    return new Promise((resolve, reject) => {
      this.audio_stream = [];
      const req_id = this.generateUUID();
      this.ws = new WebSocket(
        `${Constants.WSS_URL}?trustedclienttoken=${Constants.TRUSTED_CLIENT_TOKEN}&ConnectionId=${req_id}&Sec-MS-GEC=${drmSecMS}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`
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
      throw new Error(
        "No audio data available. Did you run synthesize() first?"
      );
    }
    return new Blob(this.audio_stream, { type: `audio/${format}` });
  }

  async toBase64(): Promise<string> {
    const blob = this.toBlob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
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

// (window as unknown as { EdgeTTS: typeof EdgeTTS }).EdgeTTS = EdgeTTS;
