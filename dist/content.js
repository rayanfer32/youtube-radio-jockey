var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// src/utils/api-utils.ts
var getAPISettings = async () => {
  return await chrome.storage.sync.get();
};
var stylePrompts = {
  energetic: "You are a high-energy radio DJ who's absolutely pumped about music!",
  chill: "You are a laid-back DJ with a smooth, relaxed vibe.",
  sarcastic: "You are a witty DJ who adds clever commentary with a touch of sarcasm.",
  professional: "You are a professional radio host with polished delivery."
};
var lengthGuides = {
  short: "Keep it brief and punchy (20-30 seconds when spoken)",
  medium: "Moderate length with good flow (30-45 seconds when spoken)",
  long: "More detailed commentary (45-60 seconds when spoken)"
};
function generateRJPrompt(currentSong, nextSong, style, length, scriptHistory, comments, currentSonglyrics, hostName, radioStation) {
  const basePrompt = stylePrompts[style] || stylePrompts.energetic;
  const lengthGuide = lengthGuides[length] || lengthGuides.medium;
  const radioInfo = `Radio station: ${radioStation}
  Host name: ${hostName}`;
  return `${basePrompt} ${lengthGuide} ${radioInfo}. 

${scriptHistory && `Here's some of your previous commentary: 
` + scriptHistory}
${comments && `Here are some comments from viewers: 
` + comments}

Current song: "${currentSong}"

${currentSonglyrics ? `Current song Lyrics: ${currentSonglyrics}` : ""}

${nextSong ? `Next Song: "${nextSong}"` : ""}

Important guidelines:
AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
AVOID saying Alright and Okay okay or similar phrases at the begining. Cook up some new intros
CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
ONLY respond with the commentary text, do not include any additional instructions or explanations.
`;
}
async function callGeminiAPI(prompt2, apiKey) {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt2
            }
          ]
        }
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid response from Gemini API");
  }
  return data.candidates[0].content.parts[0].text;
}
async function callChatJimmyAPI(prompt2) {
  const payload = {
    messages: [
      {
        role: "system",
        content: "You are a commentary ai bot"
      }
    ],
    chatOptions: {
      selectedModel: "llama3.1-8B",
      systemPrompt: prompt2,
      topK: 2
    },
    attachment: null
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "callChatJimmy", payload }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call ChatJimmy API"));
      }
      const text = response.data;
      const statsIndex = text.indexOf("<|stats|>");
      let result = text;
      if (statsIndex !== -1) {
        result = text.substring(0, statsIndex);
      }
      resolve(result.trim().replace(/^"|"$/g, "").replace(/\\n/g, `
`).trim());
    });
  });
}
async function callMurfAPI(text, apiKey, voiceId = "en-US-natalie", style = "Promo") {
  if (!apiKey) {
    throw new Error("Murf.ai API key not configured");
  }
  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      voiceId,
      style
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Murf.ai API error: ${response.status} ${response.statusText} - ${errorData.message || "Unknown error"}`);
  }
  const data = await response.json();
  if (!data.audioFile) {
    throw new Error("No audio file returned from Murf.ai API");
  }
  const audioResponse = await fetch(data.audioFile);
  if (!audioResponse.ok) {
    throw new Error("Failed to fetch audio file from Murf.ai");
  }
  return {
    audioBlob: await audioResponse.blob(),
    duration: data.audioLengthInSeconds,
    remainingChars: data.remainingCharacterCount
  };
}
function logCommentary(currentSong, nextSong, script) {
  chrome.runtime.sendMessage({
    action: "logCommentary",
    currentSong,
    nextSong,
    script
  }).catch(console.error);
}
async function callLyricsAPI(query) {
  const response = await fetch(`https://lrclib.net/api/search?q=${query}`, {
    headers: {
      "Content-Type": "application/json"
    },
    referrer: "https://lrclib.net/docs",
    method: "GET"
  });
  if (!response.ok) {
    throw new Error(`Lyrics API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Lyrics API response:", data);
  return data?.[0]?.plainLyrics;
}
var APIUtils = {
  callMurfAPI,
  callGeminiAPI,
  callChatJimmyAPI,
  callLyricsAPI,
  logCommentary,
  getAPISettings,
  generateRJPrompt
};
window.APIUtils = APIUtils;
var api_utils_default = APIUtils;

// src/utils/audio-utils.ts
var AudioUtils = {
  createAudioContext() {
    try {
      return new (window.AudioContext || window.webkitAudioContext);
    } catch (error) {
      console.error("Audio context creation failed:", error);
      return null;
    }
  },
  async smoothVolumeTransition(video, targetVolume, duration = 200) {
    if (!video)
      return;
    const startVolume = video.volume;
    const steps = 20;
    const volumeStep = (targetVolume - startVolume) / steps;
    const timeStep = duration / steps;
    for (let i = 0;i < steps; i++) {
      setTimeout(() => {
        const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * (i + 1)));
        video.volume = newVolume;
      }, timeStep * i);
    }
  },
  async duckVolume(video, duckLevel = 0.3) {
    if (!video)
      return 1;
    const originalVolume = video.volume;
    await this.smoothVolumeTransition(video, duckLevel);
    return originalVolume;
  },
  async restoreVolume(video, targetVolume) {
    if (!video || targetVolume === undefined)
      return;
    await this.smoothVolumeTransition(video, targetVolume, 300);
  },
  createAudio(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.addEventListener("error", (error) => {
      console.error("Audio playback error:", error);
      URL.revokeObjectURL(audioUrl);
    });
    return { audio, audioUrl };
  },
  playAudio(audio) {
    return new Promise((resolve, reject) => {
      audio.addEventListener("ended", resolve);
      audio.addEventListener("error", reject);
      audio.play().catch(reject);
    });
  }
};
window.AudioUtils = AudioUtils;
var audio_utils_default = AudioUtils;

// src/utils/dom-utils.ts
var showLoadingIndicator = () => {
  if (document.getElementById("rj-loading"))
    return;
  const loading = document.createElement("div");
  loading.id = "rj-loading";
  loading.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner"></div>
        <span>\uD83C\uDF99️ Preparing RJ commentary...</span>
      </div>
    `;
  loading.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
  if (!document.getElementById("spinner-styles")) {
    const style = document.createElement("style");
    style.id = "spinner-styles";
    style.textContent = `
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
    document.head.appendChild(style);
  }
  document.body.appendChild(loading);
};
var hideLoadingIndicator = () => {
  const loading = document.getElementById("rj-loading");
  if (loading)
    loading.remove();
};
var showErrorMessage = (message) => {
  const error = document.createElement("div");
  error.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: #ff4757;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;
  error.textContent = `❌ ${message}`;
  document.body.appendChild(error);
  setTimeout(() => {
    error.remove();
  }, 5000);
};
var createRJModeButton = (toggleRJMode) => {
  const button = document.createElement("button");
  button.id = "rj-mode-button";
  button.innerHTML = "\uD83C\uDF99️ Start RJ Mode";
  button.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.2s ease;
    `;
  button.addEventListener("click", () => toggleRJMode());
  button.addEventListener("mouseover", () => {
    button.style.transform = "scale(1.05)";
  });
  button.addEventListener("mouseout", () => {
    button.style.transform = "scale(1)";
  });
  document.body.appendChild(button);
};
var dismissNotification = () => {
  const notification = document.getElementById("rj-mode-notification");
  if (notification) {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
};
var showRJModePrompt = (toggleRJMode) => {
  const notification = document.createElement("div");
  notification.id = "rj-mode-notification";
  notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>\uD83C\uDF99️</span>
        <div>
          <strong>Playlist Detected!</strong>
          <br>
          <small>Ready to add some RJ magic?</small>
        </div>
        <button id="enable-rj-mode" style="
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          margin-left: auto;
        ">Enable RJ Mode</button>
        <button id="dismiss-rj-prompt" style="
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        ">×</button>
      </div>
    `;
  notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #333;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;
  if (!document.getElementById("rj-mode-styles")) {
    const style = document.createElement("style");
    style.id = "rj-mode-styles";
    style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
    document.head.appendChild(style);
  }
  document.body.appendChild(notification);
  document.getElementById("enable-rj-mode")?.addEventListener("click", () => {
    dismissNotification();
    toggleRJMode();
  });
  document.getElementById("dismiss-rj-prompt")?.addEventListener("click", () => {
    dismissNotification();
  });
  setTimeout(() => {
    dismissNotification();
  }, 1e4);
};
var DomUtils = {
  showErrorMessage,
  showRJModePrompt,
  createRJModeButton,
  dismissNotification,
  showLoadingIndicator,
  hideLoadingIndicator
};
window.DomUtils = DomUtils;
var dom_utils_default = DomUtils;

// src/utils/youtube-utils.ts
var YouTubeUtils = {
  extractVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");
    return videoId || null;
  },
  getCurrentVideoTitle() {
    const titleElement = document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer");
    return titleElement?.textContent?.trim() || "";
  },
  getDescription() {
    return document?.querySelector("#description-inner")?.textContent?.trim() || "";
  },
  getComments() {
    let allComments = [];
    document.querySelectorAll("#comment-container").forEach((item) => {
      let txt = item.querySelector("#expander")?.textContent?.trim() || "";
      allComments.push(txt);
    });
    return allComments;
  },
  getNextVideoTitle() {
    const playlistItem = document.querySelector("#playlist-items[selected]");
    const nextVideoElement = playlistItem?.nextSibling?.querySelector("#video-title");
    return nextVideoElement?.textContent?.trim() || "";
  },
  isPlaylistPage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("list");
  },
  getPlaylistId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("list");
  },
  getVideoElement() {
    return document.querySelector("video");
  },
  cleanVideoTitle(title) {
    return title.replace(/\(Official.*?\)/gi, "").replace(/\(Music Video\)/gi, "").replace(/\[Official.*?\]/gi, "").replace(/- Topic$/, "").trim();
  },
  getVideoDuration() {
    const video = this.getVideoElement();
    return video ? video.duration : 0;
  },
  isVideoPlaying() {
    const video = this.getVideoElement();
    return video ? !video.paused && !video.ended : false;
  }
};
window.YouTubeUtils = YouTubeUtils;
var youtube_utils_default = YouTubeUtils;

// src/utils/edge-tts-web.ts
var CHROMIUM_FULL_VERSION = "130.0.2849.68";
var CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split(".", 1)[0];
var SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;
var Constants = {
  TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
  WSS_URL: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
  VOICES_URL: "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list"
};

class SkewAdjustmentError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "SkewAdjustmentError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}
var WIN_EPOCH = 11644473600;
var S_TO_NS = 1e9;

class DRM {
  static clock_skew_seconds = 0;
  static adj_clock_skew_seconds(skew_seconds) {
    DRM.clock_skew_seconds += skew_seconds;
  }
  static get_unix_timestamp() {
    return Date.now() / 1000 + DRM.clock_skew_seconds;
  }
  static parse_rfc2616_date(date) {
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
  static handle_client_response_error(e) {
    if (!e.headers) {
      throw new SkewAdjustmentError("No server date in headers.", { cause: e });
    }
    const server_date = e.headers["date"];
    if (!server_date || typeof server_date !== "string") {
      throw new SkewAdjustmentError("No server date in headers.", { cause: e });
    }
    const server_date_parsed = DRM.parse_rfc2616_date(server_date);
    if (server_date_parsed === null) {
      throw new SkewAdjustmentError(`Failed to parse server date: ${server_date}`, {
        cause: e
      });
    }
    const client_date = DRM.get_unix_timestamp();
    DRM.adj_clock_skew_seconds(server_date_parsed - client_date);
  }
  static async generate_sec_ms_gec() {
    let ticks = DRM.get_unix_timestamp();
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;
    const str_to_hash = `${Math.floor(ticks)}${Constants.TRUSTED_CLIENT_TOKEN}`;
    const encoder = new TextEncoder;
    const data = encoder.encode(str_to_hash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex.toUpperCase();
  }
}

class EdgeTTS {
  audio_stream = [];
  audio_format = "mp3";
  ws = null;
  async getVoices() {
    const response = await fetch(`${Constants.VOICES_URL}?trustedclienttoken=${Constants.TRUSTED_CLIENT_TOKEN}`);
    const data = await response.json();
    return data.map((voice) => {
      const { Name, ShortName, Gender, Locale, VoiceType } = voice;
      return { Name, ShortName, Gender, Locale, VoiceType };
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
    return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
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
      if (isNaN(rateValue))
        throw new Error("Invalid rate format.");
    } else {
      rateValue = rate;
    }
    return rateValue >= 0 ? `+${rateValue}%` : `${rateValue}%`;
  }
  validateVolume(volume) {
    let volumeValue;
    if (typeof volume === "string") {
      volumeValue = parseInt(volume.replace("%", ""), 10);
      if (isNaN(volumeValue))
        throw new Error("Invalid volume format.");
    } else {
      volumeValue = volume;
    }
    if (volumeValue < -100 || volumeValue > 100) {
      throw new Error("Volume out of range (-100% to 100%).");
    }
    return `${volumeValue}%`;
  }
  async synthesize(text, voice = "en-US-AnaNeural", options = {}) {
    const drmSecMS = await DRM.generate_sec_ms_gec();
    return new Promise((resolve, reject) => {
      this.audio_stream = [];
      const req_id = this.generateUUID();
      this.ws = new WebSocket(`${Constants.WSS_URL}?trustedclienttoken=${Constants.TRUSTED_CLIENT_TOKEN}&ConnectionId=${req_id}&Sec-MS-GEC=${drmSecMS}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`);
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
        const speechMessage = `X-RequestId:${req_id}\r
Content-Type:application/ssml+xml\r
` + `X-Timestamp:${new Date().toISOString()}Z\r
Path:ssml\r
\r
${SSML_text}`;
        this.ws?.send(speechMessage);
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
    return `X-Timestamp:${new Date().toISOString()}Z\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
` + `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
  }
  processAudioData(data) {
    if (typeof data === "string") {
      if (data.includes("Path:turn.end")) {
        this.ws?.close();
      }
      return;
    }
    const buffer = new Uint8Array(data);
    const needle = new TextEncoder().encode(`Path:audio\r
`);
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
    for (let i = 0;i <= haystack.length - needle.length; i++) {
      let match = true;
      for (let j = 0;j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          match = false;
          break;
        }
      }
      if (match)
        return i;
    }
    return -1;
  }
  toBlob(format = this.audio_format) {
    if (this.audio_stream.length === 0) {
      throw new Error("No audio data available. Did you run synthesize() first?");
    }
    return new Blob(this.audio_stream, { type: `audio/${format}` });
  }
  async toBase64() {
    const blob = this.toBlob();
    return new Promise((resolve) => {
      const reader = new FileReader;
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

// src/content.ts
class YouTubeRJMode {
  isRJModeActive;
  currentVideoTitle;
  nextVideoTitle;
  originalVolume;
  isRJPlaying;
  audioContext;
  gainNode;
  lastProcessedVideo;
  isGeneratingCommentary;
  videoChangeTimeout;
  progressInterval;
  scriptHistory;
  edgeTTS;
  ttsVoice;
  generatedAudioData;
  constructor() {
    this.isRJModeActive = false;
    this.currentVideoTitle = "";
    this.nextVideoTitle = "";
    this.originalVolume = 1;
    this.isRJPlaying = false;
    this.audioContext = null;
    this.gainNode = null;
    this.lastProcessedVideo = "";
    this.isGeneratingCommentary = false;
    this.videoChangeTimeout = null;
    this.progressInterval = null;
    this.scriptHistory = [];
    this.edgeTTS = new EdgeTTS;
    this.ttsVoice = "en-US-AvaMultilingualNeural";
    this.generatedAudioData = null;
    this.init();
  }
  async init() {
    await this.promptUserForAPIKeys();
    this.setupAudioContext();
    this.detectPlaylist();
    dom_utils_default.createRJModeButton(this.toggleRJMode.bind(this));
  }
  async promptUserForAPIKeys() {
    let settings = await api_utils_default.getAPISettings();
    if (!settings.geminiApiKey) {
      let geminiApiKey = prompt("Enter your Gemini API Key:");
      if (geminiApiKey) {
        chrome.storage.sync.set({ geminiApiKey });
      } else {
        alert("Get free API key from https://aistudio.google.com/apikey");
      }
    }
  }
  setupAudioContext() {
    this.audioContext = audio_utils_default.createAudioContext();
    if (this.audioContext) {
      this.gainNode = this.audioContext.createGain();
    }
  }
  detectPlaylist() {
    if (youtube_utils_default.isPlaylistPage() && !document.getElementById("rj-mode-button")) {
      dom_utils_default.showRJModePrompt(this.toggleRJMode.bind(this));
    }
  }
  getCurrentAndNextTitles() {
    this.currentVideoTitle = youtube_utils_default.cleanVideoTitle(youtube_utils_default.getCurrentVideoTitle());
    this.nextVideoTitle = youtube_utils_default.cleanVideoTitle(youtube_utils_default.getNextVideoTitle());
  }
  async generateRJCommentary() {
    if (this.isGeneratingCommentary || this.isRJPlaying) {
      console.log("Commentary already in progress, skipping...");
      return;
    }
    const videoId = youtube_utils_default.extractVideoId() || this.currentVideoTitle;
    if (videoId === this.lastProcessedVideo) {
      console.log("Already processed this video, skipping...");
      return;
    }
    if (!this.currentVideoTitle || this.currentVideoTitle.trim() === "") {
      console.log("No current video title found, skipping...");
      return;
    }
    this.isGeneratingCommentary = true;
    this.lastProcessedVideo = videoId;
    try {
      dom_utils_default.showLoadingIndicator();
      const currentSonglyrics = await api_utils_default.callLyricsAPI(this.currentVideoTitle);
      const settings = await api_utils_default.getAPISettings();
      const prompt2 = api_utils_default.generateRJPrompt(this.currentVideoTitle, this.nextVideoTitle, settings.rjStyle, settings.commentaryLength, settings.includeHistory ? this.scriptHistory.join(`
`) : "", settings.includeComments ? youtube_utils_default.getComments().join(`
`) : "", currentSonglyrics, settings.hostName, settings.radioStation);
      console.log("Generated prompt:", prompt2);
      const script = await api_utils_default.callChatJimmyAPI(prompt2);
      console.log("Generated script:", script);
      this.scriptHistory.push(script);
      let audioData = {};
      if (settings.murfApiKey) {
        audioData = await api_utils_default.callMurfAPI(script, settings.murfApiKey, settings.voiceId, settings.voiceStyle);
      } else {
        await this.edgeTTS.synthesize(script, settings.voiceId || this.ttsVoice);
        audioData = {
          audioBlob: this.edgeTTS.toBlob()
        };
      }
      api_utils_default.logCommentary(this.currentVideoTitle, this.nextVideoTitle, script);
      this.generatedAudioData = audioData;
      dom_utils_default.hideLoadingIndicator();
    } catch (error) {
      console.error("RJ Commentary generation failed:", error);
      dom_utils_default.hideLoadingIndicator();
      dom_utils_default.showErrorMessage(error.message);
    } finally {
      this.isGeneratingCommentary = false;
    }
  }
  async playRJCommentary() {
    const audioBlob = this.generatedAudioData?.audioBlob;
    if (!audioBlob) {
      console.error("No audio data available to play.");
      return;
    }
    if (this.isRJPlaying) {
      console.log("RJ already playing, skipping...");
      return;
    }
    this.isRJPlaying = true;
    const video = youtube_utils_default.getVideoElement();
    try {
      if (!video) {
        console.error("No video element found on the page.");
        this.isRJPlaying = false;
        return;
      }
      this.originalVolume = await audio_utils_default.duckVolume(video, 0.1);
      const { audio, audioUrl } = audio_utils_default.createAudio(audioBlob);
      audio.addEventListener("ended", () => {
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
      audio.addEventListener("error", (error) => {
        console.error("Audio error:", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
      await audio_utils_default.playAudio(audio).catch((error) => {
        console.error("Audio playback failed:", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
    } catch (error) {
      console.error("Error playing RJ commentary:", error);
      this.isRJPlaying = false;
      if (video) {
        await audio_utils_default.restoreVolume(video, this.originalVolume);
      }
    } finally {
      this.generatedAudioData = null;
    }
  }
  async restoreVolumeAndCleanup(video, audioUrl) {
    await audio_utils_default.restoreVolume(video, this.originalVolume);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    this.isRJPlaying = false;
    console.log("RJ commentary cleanup completed");
  }
  async toggleRJMode() {
    this.isRJModeActive = !this.isRJModeActive;
    const button = document.getElementById("rj-mode-button");
    if (!button) {
      console.error("RJ Mode button not found.");
      return;
    }
    if (this.isRJModeActive) {
      button.innerHTML = "\uD83C\uDF99️ Stop RJ Mode";
      button.style.background = "linear-gradient(45deg, #ff4757, #ff6b6b)";
      await this.startRJMode();
    } else {
      button.innerHTML = "\uD83C\uDF99️ Start RJ Mode";
      button.style.background = "linear-gradient(45deg, #ff6b6b, #4ecdc4)";
      this.stopRJMode();
    }
  }
  async startRJMode() {
    this.getCurrentAndNextTitles();
    this.setupVideoEventListeners();
  }
  stopRJMode() {
    this.isRJModeActive = false;
    this.isRJPlaying = false;
    this.isGeneratingCommentary = false;
    this.lastProcessedVideo = "";
    if (this.videoChangeTimeout) {
      clearTimeout(this.videoChangeTimeout);
      this.videoChangeTimeout = null;
    }
    clearInterval(this.progressInterval);
    dom_utils_default.hideLoadingIndicator();
    console.log("RJ Mode stopped and cleaned up");
  }
  setupVideoEventListeners() {
    const checkVideoProgress = () => {
      console.log("checkVideoProgress called");
      const video = document.querySelector("video");
      if (!video || !this.isRJModeActive)
        return;
      const timeRemaining = video.duration - video.currentTime;
      if (video.currentTime > 10 && !this.isGeneratingCommentary && !this.generatedAudioData) {
        this.getCurrentAndNextTitles();
        this.generateRJCommentary();
      }
      if (timeRemaining <= 30 && !this.isRJPlaying && !this.isGeneratingCommentary) {
        this.playRJCommentary();
      }
    };
    const setupProgressMonitoring = () => {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      this.progressInterval = setInterval(checkVideoProgress, 1000);
    };
    if (this.isRJModeActive) {
      setupProgressMonitoring();
    }
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const youtubeRJ = new YouTubeRJMode;
    window.youtubeRJ = youtubeRJ;
    console.log(youtubeRJ);
  });
} else {
  const youtubeRJ = new YouTubeRJMode;
  window.youtubeRJ = youtubeRJ;
  console.log(youtubeRJ);
}

//# debugId=2112F5A1B1AF332264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi5cXHNyY1xcdXRpbHNcXGFwaS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcYXVkaW8tdXRpbHMudHMiLCAiLi5cXHNyY1xcdXRpbHNcXGRvbS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xceW91dHViZS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcZWRnZS10dHMtd2ViLnRzIiwgIi4uXFxzcmNcXGNvbnRlbnQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy8gQVBJLXJlbGF0ZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuXHJcbi8vIEdldCBzdG9yZWQgQVBJIHNldHRpbmdzXHJcbmNvbnN0IGdldEFQSVNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xyXG4gIHJldHVybiBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgpO1xyXG59O1xyXG5cclxuY29uc3Qgc3R5bGVQcm9tcHRzID0ge1xyXG4gIGVuZXJnZXRpYzpcclxuICAgIFwiWW91IGFyZSBhIGhpZ2gtZW5lcmd5IHJhZGlvIERKIHdobydzIGFic29sdXRlbHkgcHVtcGVkIGFib3V0IG11c2ljIVwiLFxyXG4gIGNoaWxsOiBcIllvdSBhcmUgYSBsYWlkLWJhY2sgREogd2l0aCBhIHNtb290aCwgcmVsYXhlZCB2aWJlLlwiLFxyXG4gIHNhcmNhc3RpYzpcclxuICAgIFwiWW91IGFyZSBhIHdpdHR5IERKIHdobyBhZGRzIGNsZXZlciBjb21tZW50YXJ5IHdpdGggYSB0b3VjaCBvZiBzYXJjYXNtLlwiLFxyXG4gIHByb2Zlc3Npb25hbDogXCJZb3UgYXJlIGEgcHJvZmVzc2lvbmFsIHJhZGlvIGhvc3Qgd2l0aCBwb2xpc2hlZCBkZWxpdmVyeS5cIixcclxufTtcclxuXHJcbmNvbnN0IGxlbmd0aEd1aWRlcyA9IHtcclxuICBzaG9ydDogXCJLZWVwIGl0IGJyaWVmIGFuZCBwdW5jaHkgKDIwLTMwIHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbiAgbWVkaXVtOiBcIk1vZGVyYXRlIGxlbmd0aCB3aXRoIGdvb2QgZmxvdyAoMzAtNDUgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxuICBsb25nOiBcIk1vcmUgZGV0YWlsZWQgY29tbWVudGFyeSAoNDUtNjAgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxufTtcclxuXHJcbi8vIEdlbmVyYXRlIFJKIHByb21wdCBiYXNlZCBvbiBzZXR0aW5nc1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVJKUHJvbXB0KFxyXG4gIGN1cnJlbnRTb25nOiBzdHJpbmcsXHJcbiAgbmV4dFNvbmc6IHN0cmluZyB8IG51bGwsXHJcbiAgc3R5bGU6IGtleW9mIHR5cGVvZiBzdHlsZVByb21wdHMsXHJcbiAgbGVuZ3RoOiBrZXlvZiB0eXBlb2YgbGVuZ3RoR3VpZGVzLFxyXG4gIHNjcmlwdEhpc3Rvcnk6IHN0cmluZyB8IG51bGwsXHJcbiAgY29tbWVudHM6IHN0cmluZyB8IG51bGwsXHJcbiAgY3VycmVudFNvbmdseXJpY3M6IHN0cmluZyB8IG51bGwsXHJcbiAgaG9zdE5hbWU6IHN0cmluZyxcclxuICByYWRpb1N0YXRpb246IHN0cmluZ1xyXG4pIHtcclxuICBjb25zdCBiYXNlUHJvbXB0ID0gc3R5bGVQcm9tcHRzW3N0eWxlXSB8fCBzdHlsZVByb21wdHMuZW5lcmdldGljO1xyXG4gIGNvbnN0IGxlbmd0aEd1aWRlID0gbGVuZ3RoR3VpZGVzW2xlbmd0aF0gfHwgbGVuZ3RoR3VpZGVzLm1lZGl1bTtcclxuXHJcbiAgY29uc3QgcmFkaW9JbmZvID0gYFJhZGlvIHN0YXRpb246ICR7cmFkaW9TdGF0aW9ufVxyXG4gIEhvc3QgbmFtZTogJHtob3N0TmFtZX1gO1xyXG5cclxuICByZXR1cm4gYCR7YmFzZVByb21wdH0gJHtsZW5ndGhHdWlkZX0gJHtyYWRpb0luZm99LiBcclxuXHJcbiR7c2NyaXB0SGlzdG9yeSAmJiBcIkhlcmUncyBzb21lIG9mIHlvdXIgcHJldmlvdXMgY29tbWVudGFyeTogXFxuXCIgKyBzY3JpcHRIaXN0b3J5XHJcbiAgICB9XHJcbiR7Y29tbWVudHMgJiYgXCJIZXJlIGFyZSBzb21lIGNvbW1lbnRzIGZyb20gdmlld2VyczogXFxuXCIgKyBjb21tZW50c31cclxuXHJcbkN1cnJlbnQgc29uZzogXCIke2N1cnJlbnRTb25nfVwiXHJcblxyXG4ke2N1cnJlbnRTb25nbHlyaWNzID8gYEN1cnJlbnQgc29uZyBMeXJpY3M6ICR7Y3VycmVudFNvbmdseXJpY3N9YCA6IFwiXCJ9XHJcblxyXG4ke25leHRTb25nID8gYE5leHQgU29uZzogXCIke25leHRTb25nfVwiYCA6IFwiXCJ9XHJcblxyXG5JbXBvcnRhbnQgZ3VpZGVsaW5lczpcclxuQVZPSUQgdXNpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBkZXRlY3RlZCBieSBUVFMgaW4gdGhlIGNvbW1lbnRhcnksIHlvdXIgb3V0cHV0IHdpbGwgYmUgdXNlZCB0byBnZW5lcmF0ZSBhdWRpby5cclxuQVZPSUQgc2F5aW5nIEFscmlnaHQgYW5kIE9rYXkgb2theSBvciBzaW1pbGFyIHBocmFzZXMgYXQgdGhlIGJlZ2luaW5nLiBDb29rIHVwIHNvbWUgbmV3IGludHJvc1xyXG5DUkVBVEUgZW5nYWdpbmcgY29tbWVudGFyeSB0aGF0IGNvbm5lY3RzIHdpdGggbGlzdGVuZXJzLiBCZSBuYXR1cmFsLCBlbnRodXNpYXN0aWMsIGFuZCBhZGQgcGVyc29uYWxpdHkuIERvbid0IHJlYWQgdGhlIHNvbmcgdGl0bGVzIC0gbWFrZSBpdCBjb252ZXJzYXRpb25hbCBhbmQgZnVuIVxyXG5PTkxZIHJlc3BvbmQgd2l0aCB0aGUgY29tbWVudGFyeSB0ZXh0LCBkbyBub3QgaW5jbHVkZSBhbnkgYWRkaXRpb25hbCBpbnN0cnVjdGlvbnMgb3IgZXhwbGFuYXRpb25zLlxyXG5gO1xyXG59XHJcblxyXG4vLyBDYWxsIEdlbWluaSBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsR2VtaW5pQVBJKHByb21wdDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZykge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW1pbmkgQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICBcImh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLTIuMC1mbGFzaDpnZW5lcmF0ZUNvbnRlbnRcIixcclxuICAgIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIFwiWC1nb29nLWFwaS1rZXlcIjogYXBpS2V5LFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgY29udGVudHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcGFydHM6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBwcm9tcHQsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSksXHJcbiAgICB9XHJcbiAgKTtcclxuXHJcbiAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICBgR2VtaW5pIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHJcbiAgaWYgKCFkYXRhLmNhbmRpZGF0ZXMgfHwgIWRhdGEuY2FuZGlkYXRlc1swXSB8fCAhZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmVzcG9uc2UgZnJvbSBHZW1pbmkgQVBJXCIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50LnBhcnRzWzBdLnRleHQ7XHJcbn1cclxuXHJcbi8vIENhbGwgQ2hhdEppbW15IEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxDaGF0SmltbXlBUEkocHJvbXB0OiBzdHJpbmcpIHtcclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgbWVzc2FnZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJvbGU6IFwic3lzdGVtXCIsXHJcbiAgICAgICAgY29udGVudDogXCJZb3UgYXJlIGEgY29tbWVudGFyeSBhaSBib3RcIixcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBjaGF0T3B0aW9uczoge1xyXG4gICAgICBzZWxlY3RlZE1vZGVsOiBcImxsYW1hMy4xLThCXCIsXHJcbiAgICAgIHN5c3RlbVByb21wdDogcHJvbXB0LFxyXG4gICAgICB0b3BLOiAyLFxyXG4gICAgfSxcclxuICAgIGF0dGFjaG1lbnQ6IG51bGwsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHsgYWN0aW9uOiBcImNhbGxDaGF0SmltbXlcIiwgcGF5bG9hZCB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIENoYXRKaW1teSBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0ZXh0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAvLyBUaGUgcmVzcG9uc2UgbWlnaHQgY29udGFpbiBzdGF0cyBhZnRlciA8fHN0YXRzfD4uIFdlIHdhbnQgdGhlIHBhcnQgYmVmb3JlIGl0LlxyXG4gICAgICAgIGNvbnN0IHN0YXRzSW5kZXggPSB0ZXh0LmluZGV4T2YoXCI8fHN0YXRzfD5cIik7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRleHQ7XHJcbiAgICAgICAgaWYgKHN0YXRzSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICByZXN1bHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGF0c0luZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIHBvdGVudGlhbCBxdW90ZXMgYW5kIHdoaXRlc3BhY2VcclxuICAgICAgICByZXNvbHZlKHJlc3VsdC50cmltKCkucmVwbGFjZSgvXlwifFwiJC9nLCBcIlwiKS5yZXBsYWNlKC9cXFxcbi9nLCBcIlxcblwiKS50cmltKCkpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBDYWxsIE11cmYuYWkgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbE11cmZBUEkoXHJcbiAgdGV4dDogc3RyaW5nLFxyXG4gIGFwaUtleTogc3RyaW5nLFxyXG4gIHZvaWNlSWQgPSBcImVuLVVTLW5hdGFsaWVcIixcclxuICBzdHlsZSA9IFwiUHJvbW9cIlxyXG4pIHtcclxuICBpZiAoIWFwaUtleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVyZi5haSBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vYXBpLm11cmYuYWkvdjEvc3BlZWNoL2dlbmVyYXRlXCIsIHtcclxuICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgIFwiYXBpLWtleVwiOiBhcGlLZXksXHJcbiAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgfSxcclxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgdm9pY2VJZDogdm9pY2VJZCxcclxuICAgICAgc3R5bGU6IHN0eWxlLFxyXG4gICAgfSksXHJcbiAgfSk7XHJcblxyXG4gIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgYE11cmYuYWkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fSAtICR7ZXJyb3JEYXRhLm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJcclxuICAgICAgfWBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICBpZiAoIWRhdGEuYXVkaW9GaWxlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdWRpbyBmaWxlIHJldHVybmVkIGZyb20gTXVyZi5haSBBUElcIik7XHJcbiAgfVxyXG5cclxuICAvLyBGZXRjaCB0aGUgYWN0dWFsIGF1ZGlvIGZpbGVcclxuICBjb25zdCBhdWRpb1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goZGF0YS5hdWRpb0ZpbGUpO1xyXG4gIGlmICghYXVkaW9SZXNwb25zZS5vaykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZldGNoIGF1ZGlvIGZpbGUgZnJvbSBNdXJmLmFpXCIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGF1ZGlvQmxvYjogYXdhaXQgYXVkaW9SZXNwb25zZS5ibG9iKCksXHJcbiAgICBkdXJhdGlvbjogZGF0YS5hdWRpb0xlbmd0aEluU2Vjb25kcyxcclxuICAgIHJlbWFpbmluZ0NoYXJzOiBkYXRhLnJlbWFpbmluZ0NoYXJhY3RlckNvdW50LFxyXG4gIH07XHJcbn1cclxuXHJcbi8vIExvZyBjb21tZW50YXJ5IGZvciBleHBvcnQgZmVhdHVyZVxyXG5mdW5jdGlvbiBsb2dDb21tZW50YXJ5KGN1cnJlbnRTb25nOiBzdHJpbmcsIG5leHRTb25nOiBzdHJpbmcsIHNjcmlwdDogc3RyaW5nKSB7XHJcbiAgY2hyb21lLnJ1bnRpbWVcclxuICAgIC5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIGFjdGlvbjogXCJsb2dDb21tZW50YXJ5XCIsXHJcbiAgICAgIGN1cnJlbnRTb25nLFxyXG4gICAgICBuZXh0U29uZyxcclxuICAgICAgc2NyaXB0LFxyXG4gICAgfSlcclxuICAgIC5jYXRjaChjb25zb2xlLmVycm9yKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2FsbEx5cmljc0FQSShxdWVyeTogc3RyaW5nKSB7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9scmNsaWIubmV0L2FwaS9zZWFyY2g/cT0ke3F1ZXJ5fWAsIHtcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICB9LFxyXG4gICAgcmVmZXJyZXI6IFwiaHR0cHM6Ly9scmNsaWIubmV0L2RvY3NcIixcclxuICAgIG1ldGhvZDogXCJHRVRcIixcclxuICB9KTtcclxuXHJcbiAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICBgTHlyaWNzIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICBjb25zb2xlLmxvZyhcIkx5cmljcyBBUEkgcmVzcG9uc2U6XCIsIGRhdGEpO1xyXG4gIHJldHVybiBkYXRhPy5bMF0/LnBsYWluTHlyaWNzOyAvLyBhcnJheSBvZiBseXJpY3Mgb2JqZWN0cyAsIGRhdGFbMF0ucGxhaW5MeXJpY3NcclxuXHJcbiAgLy8gYXdhaXQgY2FsbEx5cmljc0FQSShcIkhvYW5nIC0gUnVuIEJhY2sgdG8gWW91XCIpO1xyXG59XHJcblxyXG5jb25zdCBBUElVdGlscyA9IHtcclxuICBjYWxsTXVyZkFQSSxcclxuICBjYWxsR2VtaW5pQVBJLFxyXG4gIGNhbGxDaGF0SmltbXlBUEksXHJcbiAgY2FsbEx5cmljc0FQSSxcclxuICBsb2dDb21tZW50YXJ5LFxyXG4gIGdldEFQSVNldHRpbmdzLFxyXG4gIGdlbmVyYXRlUkpQcm9tcHQsXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuQVBJVXRpbHMgPSBBUElVdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQVBJVXRpbHM7XHJcbiIsCiAgICAiLy8gRXh0ZW5kIFdpbmRvdyBpbnRlcmZhY2UgdG8gaW5jbHVkZSB3ZWJraXRBdWRpb0NvbnRleHRcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgd2Via2l0QXVkaW9Db250ZXh0OiB0eXBlb2YgQXVkaW9Db250ZXh0O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQXVkaW8tcmVsYXRlZCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5jb25zdCBBdWRpb1V0aWxzID0ge1xyXG4gIC8vIENyZWF0ZSBhdWRpbyBjb250ZXh0IHdpdGggZmFsbGJhY2tzXHJcbiAgY3JlYXRlQXVkaW9Db250ZXh0KCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0ICkoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBjb250ZXh0IGNyZWF0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBTbW9vdGggdm9sdW1lIHRyYW5zaXRpb25cclxuICBhc3luYyBzbW9vdGhWb2x1bWVUcmFuc2l0aW9uKFxyXG4gICAgdmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsXHJcbiAgICB0YXJnZXRWb2x1bWU6IG51bWJlcixcclxuICAgIGR1cmF0aW9uID0gMjAwXHJcbiAgKSB7XHJcbiAgICBpZiAoIXZpZGVvKSByZXR1cm47XHJcblxyXG4gICAgY29uc3Qgc3RhcnRWb2x1bWUgPSB2aWRlby52b2x1bWU7XHJcbiAgICBjb25zdCBzdGVwcyA9IDIwO1xyXG4gICAgY29uc3Qgdm9sdW1lU3RlcCA9ICh0YXJnZXRWb2x1bWUgLSBzdGFydFZvbHVtZSkgLyBzdGVwcztcclxuICAgIGNvbnN0IHRpbWVTdGVwID0gZHVyYXRpb24gLyBzdGVwcztcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ZXBzOyBpKyspIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3Vm9sdW1lID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgTWF0aC5taW4oMSwgc3RhcnRWb2x1bWUgKyB2b2x1bWVTdGVwICogKGkgKyAxKSlcclxuICAgICAgICApO1xyXG4gICAgICAgIHZpZGVvLnZvbHVtZSA9IG5ld1ZvbHVtZTtcclxuICAgICAgfSwgdGltZVN0ZXAgKiBpKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBEdWNrIHZvbHVtZSBzbW9vdGhseVxyXG4gIGFzeW5jIGR1Y2tWb2x1bWUodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIGR1Y2tMZXZlbCA9IDAuMykge1xyXG4gICAgaWYgKCF2aWRlbykgcmV0dXJuIDE7XHJcblxyXG4gICAgY29uc3Qgb3JpZ2luYWxWb2x1bWUgPSB2aWRlby52b2x1bWU7XHJcbiAgICBhd2FpdCB0aGlzLnNtb290aFZvbHVtZVRyYW5zaXRpb24odmlkZW8sIGR1Y2tMZXZlbCk7XHJcbiAgICByZXR1cm4gb3JpZ2luYWxWb2x1bWU7XHJcbiAgfSxcclxuXHJcbiAgLy8gUmVzdG9yZSB2b2x1bWUgc21vb3RobHlcclxuICBhc3luYyByZXN0b3JlVm9sdW1lKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCB0YXJnZXRWb2x1bWU6IG51bWJlcikge1xyXG4gICAgaWYgKCF2aWRlbyB8fCB0YXJnZXRWb2x1bWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG4gICAgYXdhaXQgdGhpcy5zbW9vdGhWb2x1bWVUcmFuc2l0aW9uKHZpZGVvLCB0YXJnZXRWb2x1bWUsIDMwMCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ3JlYXRlIGF1ZGlvIGVsZW1lbnQgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG4gIGNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYjogQmxvYikge1xyXG4gICAgY29uc3QgYXVkaW9VcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGF1ZGlvQmxvYik7XHJcbiAgICBjb25zdCBhdWRpbyA9IG5ldyBBdWRpbyhhdWRpb1VybCk7XHJcblxyXG4gICAgLy8gQWRkIGVycm9yIGhhbmRsaW5nXHJcbiAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBwbGF5YmFjayBlcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGF1ZGlvVXJsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7IGF1ZGlvLCBhdWRpb1VybCB9O1xyXG4gIH0sXHJcblxyXG4gIC8vIFBsYXkgYXVkaW8gd2l0aCBwcm9taXNlXHJcbiAgcGxheUF1ZGlvKGF1ZGlvOiBIVE1MQXVkaW9FbGVtZW50KSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgcmVzb2x2ZSk7XHJcbiAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCByZWplY3QpO1xyXG5cclxuICAgICAgYXVkaW8ucGxheSgpLmNhdGNoKHJlamVjdCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG59O1xyXG5cclxuLy8gTWFrZSBpdCBnbG9iYWxseSBhdmFpbGFibGVcclxuKHdpbmRvdyBhcyBhbnkpLkF1ZGlvVXRpbHMgPSBBdWRpb1V0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBBdWRpb1V0aWxzO1xyXG4iLAogICAgImNvbnN0IHNob3dMb2FkaW5nSW5kaWNhdG9yID0gKCkgPT4ge1xyXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWxvYWRpbmdcIikpIHJldHVybjtcclxuXHJcbiAgY29uc3QgbG9hZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgbG9hZGluZy5pZCA9IFwicmotbG9hZGluZ1wiO1xyXG4gIGxvYWRpbmcuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyXCI+PC9kaXY+XHJcbiAgICAgICAgPHNwYW4+8J+Ome+4jyBQcmVwYXJpbmcgUkogY29tbWVudGFyeS4uLjwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICBsb2FkaW5nLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgdG9wOiAxNDBweDtcclxuICAgICAgcmlnaHQ6IDIwcHg7XHJcbiAgICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC44KTtcclxuICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICBwYWRkaW5nOiAxMHB4IDE1cHg7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xyXG4gICAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICBgO1xyXG5cclxuICAvLyBBZGQgc3Bpbm5lciBDU1MgaWYgbm90IGV4aXN0c1xyXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcGlubmVyLXN0eWxlc1wiKSkge1xyXG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XHJcbiAgICBzdHlsZS5pZCA9IFwic3Bpbm5lci1zdHlsZXNcIjtcclxuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYFxyXG4gICAgICAgIC5zcGlubmVyIHtcclxuICAgICAgICAgIHdpZHRoOiAxNnB4O1xyXG4gICAgICAgICAgaGVpZ2h0OiAxNnB4O1xyXG4gICAgICAgICAgYm9yZGVyOiAycHggc29saWQgIzMzMztcclxuICAgICAgICAgIGJvcmRlci10b3A6IDJweCBzb2xpZCAjZmZmO1xyXG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xyXG4gICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgICAgICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgfVxyXG4gICAgICBgO1xyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRpbmcpO1xyXG59O1xyXG5cclxuY29uc3QgaGlkZUxvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XHJcbiAgY29uc3QgbG9hZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbG9hZGluZ1wiKTtcclxuICBpZiAobG9hZGluZykgbG9hZGluZy5yZW1vdmUoKTtcclxufTtcclxuXHJcbmNvbnN0IHNob3dFcnJvck1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIGVycm9yLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgdG9wOiAxNDBweDtcclxuICAgICAgcmlnaHQ6IDIwcHg7XHJcbiAgICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICAgIGJhY2tncm91bmQ6ICNmZjQ3NTc7XHJcbiAgICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgICAgcGFkZGluZzogMTBweCAxNXB4O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcclxuICAgICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgICBtYXgtd2lkdGg6IDM1MHB4O1xyXG4gICAgYDtcclxuICBlcnJvci50ZXh0Q29udGVudCA9IGDinYwgJHttZXNzYWdlfWA7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZXJyb3IpO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIGVycm9yLnJlbW92ZSgpO1xyXG4gIH0sIDUwMDApO1xyXG59O1xyXG5cclxuY29uc3QgY3JlYXRlUkpNb2RlQnV0dG9uID0gKHRvZ2dsZVJKTW9kZTogRnVuY3Rpb24pID0+IHtcclxuICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xyXG4gIGJ1dHRvbi5pZCA9IFwicmotbW9kZS1idXR0b25cIjtcclxuICBidXR0b24uaW5uZXJIVE1MID0gXCLwn46Z77iPIFN0YXJ0IFJKIE1vZGVcIjtcclxuICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICB0b3A6IDEwMHB4O1xyXG4gICAgICByaWdodDogMjBweDtcclxuICAgICAgei1pbmRleDogOTk5OTtcclxuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjZmY2YjZiLCAjNGVjZGM0KTtcclxuICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICBib3JkZXI6IG5vbmU7XHJcbiAgICAgIHBhZGRpbmc6IDEycHggMjBweDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogMjVweDtcclxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgICAgYm94LXNoYWRvdzogMCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMik7XHJcbiAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjJzIGVhc2U7XHJcbiAgICBgO1xyXG5cclxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRvZ2dsZVJKTW9kZSgpKTtcclxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCAoKSA9PiB7XHJcbiAgICBidXR0b24uc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgxLjA1KVwiO1xyXG4gIH0pO1xyXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgKCkgPT4ge1xyXG4gICAgYnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoMSlcIjtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidXR0b24pO1xyXG59O1xyXG5cclxuY29uc3QgZGlzbWlzc05vdGlmaWNhdGlvbiA9ICgpID0+IHtcclxuICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtbm90aWZpY2F0aW9uXCIpO1xyXG4gIGlmIChub3RpZmljYXRpb24pIHtcclxuICAgIG5vdGlmaWNhdGlvbi5zdHlsZS5hbmltYXRpb24gPSBcInNsaWRlT3V0UmlnaHQgMC4zcyBlYXNlLWluXCI7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xyXG4gICAgfSwgMzAwKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBzaG93UkpNb2RlUHJvbXB0ID0gKHRvZ2dsZVJKTW9kZTogRnVuY3Rpb24pID0+IHtcclxuICAvLyBDcmVhdGUgYSBtb3JlIHByb21pbmVudCBub3RpZmljYXRpb24gZm9yIHBsYXlsaXN0IGRldGVjdGlvblxyXG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgbm90aWZpY2F0aW9uLmlkID0gXCJyai1tb2RlLW5vdGlmaWNhdGlvblwiO1xyXG4gIG5vdGlmaWNhdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEwcHg7XCI+XHJcbiAgICAgICAgPHNwYW4+8J+Ome+4jzwvc3Bhbj5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPHN0cm9uZz5QbGF5bGlzdCBEZXRlY3RlZCE8L3N0cm9uZz5cclxuICAgICAgICAgIDxicj5cclxuICAgICAgICAgIDxzbWFsbD5SZWFkeSB0byBhZGQgc29tZSBSSiBtYWdpYz88L3NtYWxsPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJlbmFibGUtcmotbW9kZVwiIHN0eWxlPVwiXHJcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsICM0Q0FGNTAsICM0NWEwNDkpO1xyXG4gICAgICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICAgICAgYm9yZGVyOiBub25lO1xyXG4gICAgICAgICAgcGFkZGluZzogOHB4IDE2cHg7XHJcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAyMHB4O1xyXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XHJcbiAgICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcclxuICAgICAgICBcIj5FbmFibGUgUkogTW9kZTwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gaWQ9XCJkaXNtaXNzLXJqLXByb21wdFwiIHN0eWxlPVwiXHJcbiAgICAgICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxuICAgICAgICAgIGNvbG9yOiAjNjY2O1xyXG4gICAgICAgICAgYm9yZGVyOiBub25lO1xyXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xyXG4gICAgICAgICAgcGFkZGluZzogNXB4O1xyXG4gICAgICAgIFwiPsOXPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgbm90aWZpY2F0aW9uLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgdG9wOiA4MHB4O1xyXG4gICAgICByaWdodDogMjBweDtcclxuICAgICAgei1pbmRleDogMTAwMDA7XHJcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSk7XHJcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcclxuICAgICAgY29sb3I6ICMzMzM7XHJcbiAgICAgIHBhZGRpbmc6IDE1cHggMjBweDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcclxuICAgICAgYm94LXNoYWRvdzogMCA4cHggMzJweCByZ2JhKDAsMCwwLDAuMSk7XHJcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4yKTtcclxuICAgICAgbWF4LXdpZHRoOiAzNTBweDtcclxuICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xyXG4gICAgICBhbmltYXRpb246IHNsaWRlSW5SaWdodCAwLjNzIGVhc2Utb3V0O1xyXG4gICAgYDtcclxuXHJcbiAgLy8gQWRkIENTUyBhbmltYXRpb25cclxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1zdHlsZXNcIikpIHtcclxuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xyXG4gICAgc3R5bGUuaWQgPSBcInJqLW1vZGUtc3R5bGVzXCI7XHJcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgICBAa2V5ZnJhbWVzIHNsaWRlSW5SaWdodCB7XHJcbiAgICAgICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMCUpOyBvcGFjaXR5OiAwOyB9XHJcbiAgICAgICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgb3BhY2l0eTogMTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBAa2V5ZnJhbWVzIHNsaWRlT3V0UmlnaHQge1xyXG4gICAgICAgICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgb3BhY2l0eTogMTsgfVxyXG4gICAgICAgICAgdG8geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwJSk7IG9wYWNpdHk6IDA7IH1cclxuICAgICAgICB9XHJcbiAgICAgIGA7XHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcclxuXHJcbiAgLy8gRXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgbm90aWZpY2F0aW9uXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmFibGUtcmotbW9kZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGRpc21pc3NOb3RpZmljYXRpb24oKTtcclxuICAgIHRvZ2dsZVJKTW9kZSgpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudFxyXG4gICAgLmdldEVsZW1lbnRCeUlkKFwiZGlzbWlzcy1yai1wcm9tcHRcIilcclxuICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgZGlzbWlzc05vdGlmaWNhdGlvbigpO1xyXG4gICAgfSk7XHJcblxyXG4gIC8vIEF1dG8tZGlzbWlzcyBhZnRlciAxMCBzZWNvbmRzXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XHJcbiAgfSwgMTAwMDApO1xyXG59O1xyXG5cclxuY29uc3QgRG9tVXRpbHMgPSB7XHJcbiAgc2hvd0Vycm9yTWVzc2FnZSxcclxuICBzaG93UkpNb2RlUHJvbXB0LFxyXG4gIGNyZWF0ZVJKTW9kZUJ1dHRvbixcclxuICBkaXNtaXNzTm90aWZpY2F0aW9uLFxyXG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yLFxyXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yLFxyXG59O1xyXG5cclxuKHdpbmRvdyBhcyBhbnkpLkRvbVV0aWxzID0gRG9tVXRpbHM7XHJcbmV4cG9ydCBkZWZhdWx0IERvbVV0aWxzO1xyXG4iLAogICAgIi8vIFlvdVR1YmUtc3BlY2lmaWMgdXRpbGl0eSBmdW5jdGlvbnNcclxuY29uc3QgWW91VHViZVV0aWxzID0ge1xyXG4gIGV4dHJhY3RWaWRlb0lkKCkge1xyXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICAgIGNvbnN0IHZpZGVvSWQgPSB1cmxQYXJhbXMuZ2V0KFwidlwiKTtcclxuICAgIHJldHVybiB2aWRlb0lkIHx8IG51bGw7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q3VycmVudFZpZGVvVGl0bGUoKSB7XHJcbiAgICBjb25zdCB0aXRsZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBcImgxLnRpdGxlLnN0eWxlLXNjb3BlLnl0ZC12aWRlby1wcmltYXJ5LWluZm8tcmVuZGVyZXJcIlxyXG4gICAgKTtcclxuICAgIHJldHVybiB0aXRsZUVsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBnZXREZXNjcmlwdGlvbigpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGRvY3VtZW50Py5xdWVyeVNlbGVjdG9yKFwiI2Rlc2NyaXB0aW9uLWlubmVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCJcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q29tbWVudHMoKSB7XHJcbiAgICBsZXQgYWxsQ29tbWVudHM6IHN0cmluZ1tdID0gW107XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI2NvbW1lbnQtY29udGFpbmVyXCIpLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgbGV0IHR4dCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIiNleHBhbmRlclwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiO1xyXG4gICAgICBhbGxDb21tZW50cy5wdXNoKHR4dCk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBhbGxDb21tZW50cztcclxuICB9LFxyXG5cclxuICBnZXROZXh0VmlkZW9UaXRsZSgpIHtcclxuICAgIGNvbnN0IHBsYXlsaXN0SXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWxpc3QtaXRlbXNbc2VsZWN0ZWRdXCIpO1xyXG4gICAgY29uc3QgbmV4dFZpZGVvRWxlbWVudCA9IChcclxuICAgICAgcGxheWxpc3RJdGVtPy5uZXh0U2libGluZyBhcyBFbGVtZW50XHJcbiAgICApPy5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvLXRpdGxlXCIpO1xyXG5cclxuICAgIHJldHVybiBuZXh0VmlkZW9FbGVtZW50Py50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgfSxcclxuXHJcbiAgaXNQbGF5bGlzdFBhZ2UoKSB7XHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gICAgcmV0dXJuIHVybFBhcmFtcy5oYXMoXCJsaXN0XCIpO1xyXG4gIH0sXHJcblxyXG4gIGdldFBsYXlsaXN0SWQoKSB7XHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gICAgcmV0dXJuIHVybFBhcmFtcy5nZXQoXCJsaXN0XCIpO1xyXG4gIH0sXHJcblxyXG4gIGdldFZpZGVvRWxlbWVudCgpIHtcclxuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ2xlYW4gdXAgWW91VHViZSB2aWRlbyB0aXRsZXMgKHJlbW92ZSBjb21tb24gc3VmZml4ZXMpXHJcbiAgY2xlYW5WaWRlb1RpdGxlKHRpdGxlOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB0aXRsZVxyXG4gICAgICAucmVwbGFjZSgvXFwoT2ZmaWNpYWwuKj9cXCkvZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cXChNdXNpYyBWaWRlb1xcKS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoL1xcW09mZmljaWFsLio/XFxdL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvLSBUb3BpYyQvLCBcIlwiKVxyXG4gICAgICAudHJpbSgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIEdldCB2aWRlbyBkdXJhdGlvblxyXG4gIGdldFZpZGVvRHVyYXRpb24oKSB7XHJcbiAgICBjb25zdCB2aWRlbyA9IHRoaXMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICByZXR1cm4gdmlkZW8gPyB2aWRlby5kdXJhdGlvbiA6IDA7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ2hlY2sgaWYgdmlkZW8gaXMgcGxheWluZ1xyXG4gIGlzVmlkZW9QbGF5aW5nKCkge1xyXG4gICAgY29uc3QgdmlkZW8gPSB0aGlzLmdldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIHZpZGVvID8gIXZpZGVvLnBhdXNlZCAmJiAhdmlkZW8uZW5kZWQgOiBmYWxzZTtcclxuICB9LFxyXG59O1xyXG5cclxuLy8gTWFrZSBpdCBnbG9iYWxseSBhdmFpbGFibGVcclxuKHdpbmRvdyBhcyBhbnkpLllvdVR1YmVVdGlscyA9IFlvdVR1YmVVdGlscztcclxuZXhwb3J0IGRlZmF1bHQgWW91VHViZVV0aWxzO1xyXG4iLAogICAgIlwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgQ0hST01JVU1fRlVMTF9WRVJTSU9OID0gXCIxMzAuMC4yODQ5LjY4XCI7XHJcbmNvbnN0IENIUk9NSVVNX01BSk9SX1ZFUlNJT04gPSBDSFJPTUlVTV9GVUxMX1ZFUlNJT04uc3BsaXQoXCIuXCIsIDEpWzBdO1xyXG5jb25zdCBTRUNfTVNfR0VDX1ZFUlNJT04gPSBgMS0ke0NIUk9NSVVNX0ZVTExfVkVSU0lPTn1gO1xyXG5cclxuY29uc3QgQ29uc3RhbnRzID0ge1xyXG4gIFRSVVNURURfQ0xJRU5UX1RPS0VOOiBcIjZBNUFBMUQ0RUFGRjRFOUZCMzdFMjNENjg0OTFENkY0XCIsXHJcbiAgV1NTX1VSTDpcclxuICAgIFwid3NzOi8vc3BlZWNoLnBsYXRmb3JtLmJpbmcuY29tL2NvbnN1bWVyL3NwZWVjaC9zeW50aGVzaXplL3JlYWRhbG91ZC9lZGdlL3YxXCIsXHJcbiAgVk9JQ0VTX1VSTDpcclxuICAgIFwiaHR0cHM6Ly9zcGVlY2gucGxhdGZvcm0uYmluZy5jb20vY29uc3VtZXIvc3BlZWNoL3N5bnRoZXNpemUvcmVhZGFsb3VkL3ZvaWNlcy9saXN0XCIsXHJcbn07XHJcblxyXG4vLyAqIEN1c3RvbSBlcnJvciBmb3Igc2tldyBhZGp1c3RtZW50IGZhaWx1cmVzXHJcbmV4cG9ydCBjbGFzcyBTa2V3QWRqdXN0bWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogRXJyb3JPcHRpb25zID0ge30pIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gXCJTa2V3QWRqdXN0bWVudEVycm9yXCI7XHJcbiAgICBpZiAob3B0aW9ucz8uY2F1c2UpIHtcclxuICAgICAgdGhpcy5jYXVzZSA9IG9wdGlvbnMuY2F1c2U7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBXSU5fRVBPQ0ggPSAxMTY0NDQ3MzYwMDsgLy8gc2Vjb25kcyBiZXR3ZWVuIDE2MDEtMDEtMDEgYW5kIDE5NzAtMDEtMDFcclxuY29uc3QgU19UT19OUyA9IDFlOTtcclxuXHJcbi8vICAqIENsYXNzIHRvIGhhbmRsZSBEUk0gb3BlcmF0aW9ucyB3aXRoIGNsb2NrIHNrZXcgY29ycmVjdGlvbi5cclxuZXhwb3J0IGNsYXNzIERSTSB7XHJcbiAgc3RhdGljIGNsb2NrX3NrZXdfc2Vjb25kcyA9IDAuMDtcclxuXHJcbiAgLy8gICogQWRqdXN0IHRoZSBjbG9jayBza2V3IGluIHNlY29uZHMgaW4gY2FzZSB0aGUgc3lzdGVtIGNsb2NrIGlzIG9mZi5cclxuICBzdGF0aWMgYWRqX2Nsb2NrX3NrZXdfc2Vjb25kcyhza2V3X3NlY29uZHM6IG51bWJlcikge1xyXG4gICAgRFJNLmNsb2NrX3NrZXdfc2Vjb25kcyArPSBza2V3X3NlY29uZHM7XHJcbiAgfVxyXG5cclxuICAvLyAgKiBHZXRzIHRoZSBjdXJyZW50IHRpbWVzdGFtcCBpbiBzZWNvbmRzIChVbml4IHRpbWUpIHdpdGggY2xvY2sgc2tldyBjb3JyZWN0aW9uLlxyXG4gIHN0YXRpYyBnZXRfdW5peF90aW1lc3RhbXAoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBEYXRlLm5vdygpIC8gMTAwMCArIERSTS5jbG9ja19za2V3X3NlY29uZHM7XHJcbiAgfVxyXG5cclxuICAvLyAgKiBQYXJzZXMgYW4gUkZDIDI2MTYgZGF0ZSBzdHJpbmcgaW50byBhIFVuaXggdGltZXN0YW1wLlxyXG4gIC8vICAqIEV4YW1wbGU6IFwiU3VuLCAwNiBOb3YgMTk5NCAwODo0OTozNyBHTVRcIlxyXG4gIHN0YXRpYyBwYXJzZV9yZmMyNjE2X2RhdGUoZGF0ZTogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBwYXJzZWQgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgICAgaWYgKGlzTmFOKHBhcnNlZC5nZXRUaW1lKCkpKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHBhcnNlZC5nZXRUaW1lKCkgLyAxMDAwO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gICogQWRqdXN0cyBza2V3IGJhc2VkIG9uIHRoZSBzZXJ2ZXIgXCJEYXRlXCIgaGVhZGVyLlxyXG4gIHN0YXRpYyBoYW5kbGVfY2xpZW50X3Jlc3BvbnNlX2Vycm9yKGU6IHsgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB9KSB7XHJcbiAgICBpZiAoIWUuaGVhZGVycykge1xyXG4gICAgICB0aHJvdyBuZXcgU2tld0FkanVzdG1lbnRFcnJvcihcIk5vIHNlcnZlciBkYXRlIGluIGhlYWRlcnMuXCIsIHsgY2F1c2U6IGUgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzZXJ2ZXJfZGF0ZSA9IGUuaGVhZGVyc1tcImRhdGVcIl07XHJcbiAgICBpZiAoIXNlcnZlcl9kYXRlIHx8IHR5cGVvZiBzZXJ2ZXJfZGF0ZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICB0aHJvdyBuZXcgU2tld0FkanVzdG1lbnRFcnJvcihcIk5vIHNlcnZlciBkYXRlIGluIGhlYWRlcnMuXCIsIHsgY2F1c2U6IGUgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzZXJ2ZXJfZGF0ZV9wYXJzZWQgPSBEUk0ucGFyc2VfcmZjMjYxNl9kYXRlKHNlcnZlcl9kYXRlKTtcclxuICAgIGlmIChzZXJ2ZXJfZGF0ZV9wYXJzZWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFNrZXdBZGp1c3RtZW50RXJyb3IoXHJcbiAgICAgICAgYEZhaWxlZCB0byBwYXJzZSBzZXJ2ZXIgZGF0ZTogJHtzZXJ2ZXJfZGF0ZX1gLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNhdXNlOiBlLFxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGNsaWVudF9kYXRlID0gRFJNLmdldF91bml4X3RpbWVzdGFtcCgpO1xyXG4gICAgRFJNLmFkal9jbG9ja19za2V3X3NlY29uZHMoc2VydmVyX2RhdGVfcGFyc2VkIC0gY2xpZW50X2RhdGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gKiBHZW5lcmF0ZXMgdGhlIFNlYy1NUy1HRUMgdG9rZW4gdmFsdWUuXHJcbiAgc3RhdGljIGFzeW5jIGdlbmVyYXRlX3NlY19tc19nZWMoKSB7XHJcbiAgICAvLyBHZXQgY3VycmVudCB0aW1lc3RhbXAgd2l0aCBza2V3XHJcbiAgICBsZXQgdGlja3MgPSBEUk0uZ2V0X3VuaXhfdGltZXN0YW1wKCk7XHJcblxyXG4gICAgLy8gU3dpdGNoIHRvIFdpbmRvd3MgZXBvY2hcclxuICAgIHRpY2tzICs9IFdJTl9FUE9DSDtcclxuXHJcbiAgICAvLyBSb3VuZCBkb3duIHRvIG5lYXJlc3QgNSBtaW51dGVzICgzMDAgc2Vjb25kcylcclxuICAgIHRpY2tzIC09IHRpY2tzICUgMzAwO1xyXG5cclxuICAgIC8vIENvbnZlcnQgdG8gMTAwLW5hbm9zZWNvbmQgaW50ZXJ2YWxzXHJcbiAgICB0aWNrcyAqPSBTX1RPX05TIC8gMTAwO1xyXG5cclxuICAgIC8vIENvbmNhdGVuYXRlIHRpY2tzIGFuZCB0cnVzdGVkIHRva2VuXHJcbiAgICBjb25zdCBzdHJfdG9faGFzaCA9IGAke01hdGguZmxvb3IodGlja3MpfSR7Q29uc3RhbnRzLlRSVVNURURfQ0xJRU5UX1RPS0VOfWA7XHJcblxyXG4gICAgLy8gRW5jb2RlIGFzIFVURi04XHJcbiAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbiAgICBjb25zdCBkYXRhID0gZW5jb2Rlci5lbmNvZGUoc3RyX3RvX2hhc2gpO1xyXG5cclxuICAgIC8vIFNIQS0yNTYgaGFzaFxyXG4gICAgY29uc3QgaGFzaEJ1ZmZlciA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KFwiU0hBLTI1NlwiLCBkYXRhKTtcclxuXHJcbiAgICAvLyBDb252ZXJ0IEFycmF5QnVmZmVyIOKGkiBoZXggc3RyaW5nXHJcbiAgICBjb25zdCBoYXNoQXJyYXkgPSBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2hCdWZmZXIpKTtcclxuICAgIGNvbnN0IGhhc2hIZXggPSBoYXNoQXJyYXlcclxuICAgICAgLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKVxyXG4gICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICByZXR1cm4gaGFzaEhleC50b1VwcGVyQ2FzZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBWb2ljZSB7XHJcbiAgTmFtZTogc3RyaW5nO1xyXG4gIFNob3J0TmFtZTogc3RyaW5nO1xyXG4gIEdlbmRlcjogc3RyaW5nO1xyXG4gIExvY2FsZTogc3RyaW5nO1xyXG4gIFZvaWNlVHlwZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFZGdlVFRTT3B0aW9ucyB7XHJcbiAgcGl0Y2g/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgcmF0ZT86IHN0cmluZyB8IG51bWJlcjtcclxuICB2b2x1bWU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFZGdlVFRTIHtcclxuICBhdWRpb19zdHJlYW06IFVpbnQ4QXJyYXlbXSAmIEJsb2JQYXJ0W10gPSBbXTtcclxuICBhdWRpb19mb3JtYXQ6IHN0cmluZyA9IFwibXAzXCI7XHJcbiAgd3M6IFdlYlNvY2tldCB8IG51bGwgPSBudWxsO1xyXG5cclxuICBhc3luYyBnZXRWb2ljZXMoKTogUHJvbWlzZTxWb2ljZVtdPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICBgJHtDb25zdGFudHMuVk9JQ0VTX1VSTH0/dHJ1c3RlZGNsaWVudHRva2VuPSR7Q29uc3RhbnRzLlRSVVNURURfQ0xJRU5UX1RPS0VOfWBcclxuICAgICk7XHJcbiAgICBjb25zdCBkYXRhOiBWb2ljZVtdID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgcmV0dXJuIGRhdGEubWFwKCh2b2ljZSkgPT4ge1xyXG4gICAgICBjb25zdCB7IE5hbWUsIFNob3J0TmFtZSwgR2VuZGVyLCBMb2NhbGUsIFZvaWNlVHlwZSB9ID0gdm9pY2U7XHJcbiAgICAgIHJldHVybiB7IE5hbWUsIFNob3J0TmFtZSwgR2VuZGVyLCBMb2NhbGUsIFZvaWNlVHlwZSB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRWb2ljZXNCeUxhbmd1YWdlKGxvY2FsZTogc3RyaW5nKTogUHJvbWlzZTxWb2ljZVtdPiB7XHJcbiAgICBjb25zdCB2b2ljZXMgPSBhd2FpdCB0aGlzLmdldFZvaWNlcygpO1xyXG4gICAgcmV0dXJuIHZvaWNlcy5maWx0ZXIoKHZvaWNlKSA9PiB2b2ljZS5Mb2NhbGUuc3RhcnRzV2l0aChsb2NhbGUpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFZvaWNlc0J5R2VuZGVyKGdlbmRlcjogc3RyaW5nKTogUHJvbWlzZTxWb2ljZVtdPiB7XHJcbiAgICBjb25zdCB2b2ljZXMgPSBhd2FpdCB0aGlzLmdldFZvaWNlcygpO1xyXG4gICAgcmV0dXJuIHZvaWNlcy5maWx0ZXIoKHZvaWNlKSA9PiB2b2ljZS5HZW5kZXIgPT09IGdlbmRlcik7XHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZVVVSUQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBcInh4eHh4eHh4LXh4eHgteHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoL1t4eV0vZywgKGMpID0+IHtcclxuICAgICAgY29uc3QgciA9IChNYXRoLnJhbmRvbSgpICogMTYpIHwgMDtcclxuICAgICAgY29uc3QgdiA9IGMgPT09IFwieFwiID8gciA6IChyICYgMHgzKSB8IDB4ODtcclxuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVBpdGNoKHBpdGNoOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBwaXRjaCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICByZXR1cm4gcGl0Y2ggPj0gMCA/IGArJHtwaXRjaH1IemAgOiBgJHtwaXRjaH1IemA7XHJcbiAgICB9XHJcbiAgICBpZiAoIS9eWystXT9cXGR7MSwzfSg/OlxcLlxcZCspP0h6JC8udGVzdChwaXRjaCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgIFwiSW52YWxpZCBwaXRjaCBmb3JtYXQuIEV4cGVjdGVkICctMTAwSHogdG8gKzEwMEh6JyBvciBhIG51bWJlci5cIlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBpdGNoO1xyXG4gIH1cclxuXHJcbiAgdmFsaWRhdGVSYXRlKHJhdGU6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBsZXQgcmF0ZVZhbHVlOiBudW1iZXI7XHJcbiAgICBpZiAodHlwZW9mIHJhdGUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgcmF0ZVZhbHVlID0gcGFyc2VGbG9hdChyYXRlLnJlcGxhY2UoXCIlXCIsIFwiXCIpKTtcclxuICAgICAgaWYgKGlzTmFOKHJhdGVWYWx1ZSkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmF0ZSBmb3JtYXQuXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmF0ZVZhbHVlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHJldHVybiByYXRlVmFsdWUgPj0gMCA/IGArJHtyYXRlVmFsdWV9JWAgOiBgJHtyYXRlVmFsdWV9JWA7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVZvbHVtZSh2b2x1bWU6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBsZXQgdm9sdW1lVmFsdWU6IG51bWJlcjtcclxuICAgIGlmICh0eXBlb2Ygdm9sdW1lID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHZvbHVtZVZhbHVlID0gcGFyc2VJbnQodm9sdW1lLnJlcGxhY2UoXCIlXCIsIFwiXCIpLCAxMCk7XHJcbiAgICAgIGlmIChpc05hTih2b2x1bWVWYWx1ZSkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdm9sdW1lIGZvcm1hdC5cIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2b2x1bWVWYWx1ZSA9IHZvbHVtZTtcclxuICAgIH1cclxuICAgIGlmICh2b2x1bWVWYWx1ZSA8IC0xMDAgfHwgdm9sdW1lVmFsdWUgPiAxMDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVm9sdW1lIG91dCBvZiByYW5nZSAoLTEwMCUgdG8gMTAwJSkuXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGAke3ZvbHVtZVZhbHVlfSVgO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3ludGhlc2l6ZShcclxuICAgIHRleHQ6IHN0cmluZyxcclxuICAgIHZvaWNlOiBzdHJpbmcgPSBcImVuLVVTLUFuYU5ldXJhbFwiLFxyXG4gICAgb3B0aW9uczogRWRnZVRUU09wdGlvbnMgPSB7fVxyXG4gICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZHJtU2VjTVMgPSBhd2FpdCBEUk0uZ2VuZXJhdGVfc2VjX21zX2dlYygpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5hdWRpb19zdHJlYW0gPSBbXTtcclxuICAgICAgY29uc3QgcmVxX2lkID0gdGhpcy5nZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQoXHJcbiAgICAgICAgYCR7Q29uc3RhbnRzLldTU19VUkx9P3RydXN0ZWRjbGllbnR0b2tlbj0ke0NvbnN0YW50cy5UUlVTVEVEX0NMSUVOVF9UT0tFTn0mQ29ubmVjdGlvbklkPSR7cmVxX2lkfSZTZWMtTVMtR0VDPSR7ZHJtU2VjTVN9JlNlYy1NUy1HRUMtVmVyc2lvbj0ke1NFQ19NU19HRUNfVkVSU0lPTn1gXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMud3MuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuXHJcbiAgICAgIGNvbnN0IFNTTUxfdGV4dCA9IHRoaXMuZ2V0U1NNTCh0ZXh0LCB2b2ljZSwgb3B0aW9ucyk7XHJcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XHJcbiAgICAgICAgICB0aGlzLndzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJTeW50aGVzaXMgdGltZW91dFwiKSk7XHJcbiAgICAgIH0sIDMwMDAwKTtcclxuXHJcbiAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMud3M/LnNlbmQodGhpcy5idWlsZFRUU0NvbmZpZ01lc3NhZ2UoKSk7XHJcbiAgICAgICAgY29uc3Qgc3BlZWNoTWVzc2FnZSA9XHJcbiAgICAgICAgICBgWC1SZXF1ZXN0SWQ6JHtyZXFfaWR9XFxyXFxuQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL3NzbWwreG1sXFxyXFxuYCArXHJcbiAgICAgICAgICBgWC1UaW1lc3RhbXA6JHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9WlxcclxcblBhdGg6c3NtbFxcclxcblxcclxcbiR7U1NNTF90ZXh0fWA7XHJcbiAgICAgICAgdGhpcy53cz8uc2VuZChzcGVlY2hNZXNzYWdlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzQXVkaW9EYXRhKGV2ZW50LmRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChlcnIpID0+IHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgaWYgKHRoaXMud3MgJiYgdGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xyXG4gICAgICAgICAgdGhpcy53cy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldFNTTUwodGV4dDogc3RyaW5nLCB2b2ljZTogc3RyaW5nLCBvcHRpb25zOiBFZGdlVFRTT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5waXRjaCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBvcHRpb25zLnBpdGNoID0gb3B0aW9ucy5waXRjaC5yZXBsYWNlKFwiaHpcIiwgXCJIelwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHBpdGNoID0gdGhpcy52YWxpZGF0ZVBpdGNoKG9wdGlvbnMucGl0Y2ggPz8gMCk7XHJcbiAgICBjb25zdCByYXRlID0gdGhpcy52YWxpZGF0ZVJhdGUob3B0aW9ucy5yYXRlID8/IDApO1xyXG4gICAgY29uc3Qgdm9sdW1lID0gdGhpcy52YWxpZGF0ZVZvbHVtZShvcHRpb25zLnZvbHVtZSA/PyAwKTtcclxuICAgIHJldHVybiBgPHNwZWFrIHZlcnNpb249JzEuMCcgeG1sOmxhbmc9J2VuLVVTJz48dm9pY2UgbmFtZT0nJHt2b2ljZX0nPjxwcm9zb2R5IHBpdGNoPScke3BpdGNofScgcmF0ZT0nJHtyYXRlfScgdm9sdW1lPScke3ZvbHVtZX0nPiR7dGV4dH08L3Byb3NvZHk+PC92b2ljZT48L3NwZWFrPmA7XHJcbiAgfVxyXG5cclxuICBidWlsZFRUU0NvbmZpZ01lc3NhZ2UoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGBYLVRpbWVzdGFtcDoke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1aXFxyXFxuQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcXHJcXG5QYXRoOnNwZWVjaC5jb25maWdcXHJcXG5cXHJcXG5gICtcclxuICAgICAgYHtcImNvbnRleHRcIjp7XCJzeW50aGVzaXNcIjp7XCJhdWRpb1wiOntcIm1ldGFkYXRhb3B0aW9uc1wiOntcInNlbnRlbmNlQm91bmRhcnlFbmFibGVkXCI6ZmFsc2UsXCJ3b3JkQm91bmRhcnlFbmFibGVkXCI6dHJ1ZX0sXCJvdXRwdXRGb3JtYXRcIjpcImF1ZGlvLTI0a2h6LTQ4a2JpdHJhdGUtbW9uby1tcDNcIn19fX1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0F1ZGlvRGF0YShkYXRhOiBBcnJheUJ1ZmZlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIGlmIChkYXRhLmluY2x1ZGVzKFwiUGF0aDp0dXJuLmVuZFwiKSkge1xyXG4gICAgICAgIHRoaXMud3M/LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xyXG4gICAgY29uc3QgbmVlZGxlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiUGF0aDphdWRpb1xcclxcblwiKTtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMuaW5kZXhPZlN1YmFycmF5KGJ1ZmZlciwgbmVlZGxlKTtcclxuICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgIGNvbnN0IGF1ZGlvQ2h1bmsgPSBidWZmZXIuc3ViYXJyYXkoaWR4ICsgbmVlZGxlLmxlbmd0aCk7XHJcbiAgICAgIHRoaXMuYXVkaW9fc3RyZWFtLnB1c2goYXVkaW9DaHVuayk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJ1ZmZlcikuaW5jbHVkZXMoXCJQYXRoOnR1cm4uZW5kXCIpKSB7XHJcbiAgICAgIHRoaXMud3M/LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbmRleE9mU3ViYXJyYXkoaGF5c3RhY2s6IFVpbnQ4QXJyYXksIG5lZWRsZTogVWludDhBcnJheSk6IG51bWJlciB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBoYXlzdGFjay5sZW5ndGggLSBuZWVkbGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IG1hdGNoID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuZWVkbGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoaGF5c3RhY2tbaSArIGpdICE9PSBuZWVkbGVbal0pIHtcclxuICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hdGNoKSByZXR1cm4gaTtcclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxuICB9XHJcblxyXG4gIHRvQmxvYihmb3JtYXQ6IHN0cmluZyA9IHRoaXMuYXVkaW9fZm9ybWF0KTogQmxvYiB7XHJcbiAgICBpZiAodGhpcy5hdWRpb19zdHJlYW0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICBcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlLiBEaWQgeW91IHJ1biBzeW50aGVzaXplKCkgZmlyc3Q/XCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgQmxvYih0aGlzLmF1ZGlvX3N0cmVhbSwgeyB0eXBlOiBgYXVkaW8vJHtmb3JtYXR9YCB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHRvQmFzZTY0KCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBibG9iID0gdGhpcy50b0Jsb2IoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4gcmVzb2x2ZSgocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpLnNwbGl0KFwiLFwiKVsxXSk7XHJcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBkb3dubG9hZChmaWxlbmFtZTogc3RyaW5nID0gXCJvdXRwdXQubXAzXCIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGJsb2IgPSB0aGlzLnRvQmxvYigpO1xyXG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgIGEuaHJlZiA9IHVybDtcclxuICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcclxuICAgIGEuY2xpY2soKTtcclxuICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICB9XHJcbn1cclxuXHJcbi8vICh3aW5kb3cgYXMgdW5rbm93biBhcyB7IEVkZ2VUVFM6IHR5cGVvZiBFZGdlVFRTIH0pLkVkZ2VUVFMgPSBFZGdlVFRTO1xyXG4iLAogICAgImltcG9ydCBBUElVdGlscyBmcm9tIFwiLi91dGlscy9hcGktdXRpbHNcIjtcclxuaW1wb3J0IEF1ZGlvVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXVkaW8tdXRpbHNcIjtcclxuaW1wb3J0IERvbVV0aWxzIGZyb20gXCIuL3V0aWxzL2RvbS11dGlsc1wiO1xyXG5pbXBvcnQgWW91VHViZVV0aWxzIGZyb20gXCIuL3V0aWxzL3lvdXR1YmUtdXRpbHNcIjtcclxuaW1wb3J0IHsgRWRnZVRUUyB9IGZyb20gXCIuL3V0aWxzL2VkZ2UtdHRzLXdlYlwiO1xyXG5cclxuY2xhc3MgWW91VHViZVJKTW9kZSB7XHJcbiAgaXNSSk1vZGVBY3RpdmU6IGJvb2xlYW47XHJcbiAgY3VycmVudFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBuZXh0VmlkZW9UaXRsZTogc3RyaW5nO1xyXG4gIG9yaWdpbmFsVm9sdW1lOiBudW1iZXI7XHJcbiAgaXNSSlBsYXlpbmc6IGJvb2xlYW47XHJcbiAgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQgfCBudWxsO1xyXG4gIGdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgbGFzdFByb2Nlc3NlZFZpZGVvOiBzdHJpbmc7XHJcbiAgaXNHZW5lcmF0aW5nQ29tbWVudGFyeTogYm9vbGVhbjtcclxuICB2aWRlb0NoYW5nZVRpbWVvdXQ6IGFueTtcclxuICBwcm9ncmVzc0ludGVydmFsOiBhbnk7XHJcbiAgc2NyaXB0SGlzdG9yeTogYW55W107XHJcbiAgZWRnZVRUUzogRWRnZVRUUztcclxuICB0dHNWb2ljZTogc3RyaW5nO1xyXG4gIGdlbmVyYXRlZEF1ZGlvRGF0YTogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuaXNSSk1vZGVBY3RpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy5uZXh0VmlkZW9UaXRsZSA9IFwiXCI7XHJcbiAgICB0aGlzLm9yaWdpbmFsVm9sdW1lID0gMS4wO1xyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5nYWluTm9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbyA9IFwiXCI7XHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIHRoaXMudmlkZW9DaGFuZ2VUaW1lb3V0ID0gbnVsbDtcclxuICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IG51bGw7XHJcbiAgICB0aGlzLnNjcmlwdEhpc3RvcnkgPSBbXTtcclxuICAgIHRoaXMuZWRnZVRUUyA9IG5ldyBFZGdlVFRTKCk7IC8vIEluaXRpYWxpemUgRWRnZSBUVFMgaW5zdGFuY2VcclxuICAgIHRoaXMudHRzVm9pY2UgPSBcImVuLVVTLUF2YU11bHRpbGluZ3VhbE5ldXJhbFwiOyAvLyBcImVuLVVTLUFyaWFOZXVyYWxcIjsgLy8gRGVmYXVsdCBUVFMgdm9pY2VcclxuICAgIHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhID0gbnVsbDsgLy8gU3RvcmUgZ2VuZXJhdGVkIGF1ZGlvIGRhdGFcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGluaXQoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnByb21wdFVzZXJGb3JBUElLZXlzKCk7XHJcbiAgICB0aGlzLnNldHVwQXVkaW9Db250ZXh0KCk7XHJcbiAgICB0aGlzLmRldGVjdFBsYXlsaXN0KCk7XHJcbiAgICAvLyB0aGlzLnNldHVwVmlkZW9FdmVudExpc3RlbmVycygpO1xyXG4gICAgRG9tVXRpbHMuY3JlYXRlUkpNb2RlQnV0dG9uKHRoaXMudG9nZ2xlUkpNb2RlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcHJvbXB0VXNlckZvckFQSUtleXMoKSB7XHJcbiAgICBsZXQgc2V0dGluZ3MgPSBhd2FpdCBBUElVdGlscy5nZXRBUElTZXR0aW5ncygpO1xyXG4gICAgaWYgKCFzZXR0aW5ncy5nZW1pbmlBcGlLZXkpIHtcclxuICAgICAgbGV0IGdlbWluaUFwaUtleSA9IHByb21wdChcIkVudGVyIHlvdXIgR2VtaW5pIEFQSSBLZXk6XCIpO1xyXG4gICAgICBpZiAoZ2VtaW5pQXBpS2V5KSB7XHJcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBnZW1pbmlBcGlLZXkgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoXCJHZXQgZnJlZSBBUEkga2V5IGZyb20gaHR0cHM6Ly9haXN0dWRpby5nb29nbGUuY29tL2FwaWtleVwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0dXBBdWRpb0NvbnRleHQoKSB7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IEF1ZGlvVXRpbHMuY3JlYXRlQXVkaW9Db250ZXh0KCk7XHJcbiAgICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRldGVjdFBsYXlsaXN0KCkge1xyXG4gICAgLy8gVXNlIFlvdVR1YmUgdXRpbGl0eSBmdW5jdGlvblxyXG4gICAgaWYgKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuaXNQbGF5bGlzdFBhZ2UoKSAmJlxyXG4gICAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLWJ1dHRvblwiKVxyXG4gICAgKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dSSk1vZGVQcm9tcHQodGhpcy50b2dnbGVSSk1vZGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpIHtcclxuICAgIC8vIFVzZSBZb3VUdWJlIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldEN1cnJlbnRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgICB0aGlzLm5leHRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldE5leHRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZW5lcmF0ZVJKQ29tbWVudGFyeSgpIHtcclxuICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgc2ltdWx0YW5lb3VzIGNvbW1lbnRhcnkgZ2VuZXJhdGlvbnNcclxuICAgIGlmICh0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgfHwgdGhpcy5pc1JKUGxheWluZykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkNvbW1lbnRhcnkgYWxyZWFkeSBpbiBwcm9ncmVzcywgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB3ZSd2ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGlzIHZpZGVvXHJcbiAgICBjb25zdCB2aWRlb0lkID0gWW91VHViZVV0aWxzLmV4dHJhY3RWaWRlb0lkKCkgfHwgdGhpcy5jdXJyZW50VmlkZW9UaXRsZTtcclxuICAgIGlmICh2aWRlb0lkID09PSB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgdmlkZW8sIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRWaWRlb1RpdGxlIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gY3VycmVudCB2aWRlbyB0aXRsZSBmb3VuZCwgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSB0cnVlO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSB2aWRlb0lkO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgICBjb25zdCBjdXJyZW50U29uZ2x5cmljcyA9IGF3YWl0IEFQSVV0aWxzLmNhbGxMeXJpY3NBUEkoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gVXNlIEFQSSB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IEFQSVV0aWxzLmdldEFQSVNldHRpbmdzKCk7XHJcbiAgICAgIGNvbnN0IHByb21wdCA9IEFQSVV0aWxzLmdlbmVyYXRlUkpQcm9tcHQoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSxcclxuICAgICAgICB0aGlzLm5leHRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHNldHRpbmdzLnJqU3R5bGUsXHJcbiAgICAgICAgc2V0dGluZ3MuY29tbWVudGFyeUxlbmd0aCxcclxuICAgICAgICBzZXR0aW5ncy5pbmNsdWRlSGlzdG9yeSA/IHRoaXMuc2NyaXB0SGlzdG9yeS5qb2luKFwiXFxuXCIpIDogXCJcIixcclxuICAgICAgICBzZXR0aW5ncy5pbmNsdWRlQ29tbWVudHMgPyBZb3VUdWJlVXRpbHMuZ2V0Q29tbWVudHMoKS5qb2luKFwiXFxuXCIpIDogXCJcIixcclxuICAgICAgICBjdXJyZW50U29uZ2x5cmljcyxcclxuICAgICAgICBzZXR0aW5ncy5ob3N0TmFtZSxcclxuICAgICAgICBzZXR0aW5ncy5yYWRpb1N0YXRpb25cclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiR2VuZXJhdGVkIHByb21wdDpcIiwgcHJvbXB0KTtcclxuXHJcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGF3YWl0IEFQSVV0aWxzLmNhbGxDaGF0SmltbXlBUEkocHJvbXB0KTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiR2VuZXJhdGVkIHNjcmlwdDpcIiwgc2NyaXB0KTtcclxuXHJcbiAgICAgIHRoaXMuc2NyaXB0SGlzdG9yeS5wdXNoKHNjcmlwdCk7XHJcblxyXG4gICAgICBsZXQgYXVkaW9EYXRhID0ge307XHJcbiAgICAgIGlmIChzZXR0aW5ncy5tdXJmQXBpS2V5KSB7XHJcbiAgICAgICAgLy8gVXNlIE11cmYgQVBJIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIC8vIGF1ZGlvRGF0YSBjb250YWlucyB0aGUgYXVkaW8gYmxvYiBhbmQgb3RoZXIgbWV0YWRhdGFcclxuICAgICAgICBhdWRpb0RhdGEgPSBhd2FpdCBBUElVdGlscy5jYWxsTXVyZkFQSShcclxuICAgICAgICAgIHNjcmlwdCxcclxuICAgICAgICAgIHNldHRpbmdzLm11cmZBcGlLZXksXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkLFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VTdHlsZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgTXVyZiBBUEkgaXMgbm90IGF2YWlsYWJsZSBvciB3ZSB3YW50IHRvIGZhbGxiYWNrIHRvIEVkZ2UgVFRTXHJcbiAgICAgICAgYXdhaXQgdGhpcy5lZGdlVFRTLnN5bnRoZXNpemUoXHJcbiAgICAgICAgICBzY3JpcHQsXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkIHx8IHRoaXMudHRzVm9pY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5lZGdlVFRTLnRvQmxvYigpLFxyXG4gICAgICAgICAgLy8gYXVkaW9Vcmw6IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5lZGdlVFRTLnRvQmxvYigpKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2cgdGhlIGNvbW1lbnRhcnlcclxuICAgICAgQVBJVXRpbHMubG9nQ29tbWVudGFyeShcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHRoaXMubmV4dFZpZGVvVGl0bGUsXHJcbiAgICAgICAgc2NyaXB0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IGF1ZGlvRGF0YTsgLy8gU3RvcmUgZ2VuZXJhdGVkIGF1ZGlvIGRhdGEgZm9yIGxhdGVyIHVzZVxyXG5cclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIlJKIENvbW1lbnRhcnkgZ2VuZXJhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcGxheVJKQ29tbWVudGFyeSgpIHtcclxuICAgIGNvbnN0IGF1ZGlvQmxvYiA9IHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhPy5hdWRpb0Jsb2I7XHJcblxyXG4gICAgaWYgKCFhdWRpb0Jsb2IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlIHRvIHBsYXkuXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNSSlBsYXlpbmcpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJSSiBhbHJlYWR5IHBsYXlpbmcsIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgdmlkZW8gPSBZb3VUdWJlVXRpbHMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXZpZGVvKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIHZpZGVvIGVsZW1lbnQgZm91bmQgb24gdGhlIHBhZ2UuXCIpO1xyXG4gICAgICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIER1Y2sgdGhlIFlvdVR1YmUgdmlkZW8gdm9sdW1lIHVzaW5nIHV0aWxpdHlcclxuICAgICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IGF3YWl0IEF1ZGlvVXRpbHMuZHVja1ZvbHVtZSh2aWRlbywgMC4xKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgcGxheSBSSiBhdWRpbyB1c2luZyB1dGlsaXR5XHJcbiAgICAgIGNvbnN0IHsgYXVkaW8sIGF1ZGlvVXJsIH0gPSBBdWRpb1V0aWxzLmNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYik7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgYXdhaXQgQXVkaW9VdGlscy5wbGF5QXVkaW8oYXVkaW8pLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBwbGF5YmFjayBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBsYXlpbmcgUkogY29tbWVudGFyeTpcIiwgZXJyb3IpO1xyXG4gICAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZVxyXG4gICAgICBpZiAodmlkZW8pIHtcclxuICAgICAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG4gICAgICB9XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIENsZWFyIGF1ZGlvIGRhdGEgYWZ0ZXIgcGxheWJhY2tcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCBhdWRpb1VybDogc3RyaW5nKSB7XHJcbiAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZSB1c2luZyB1dGlsaXR5XHJcbiAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwIGF1ZGlvIFVSTFxyXG4gICAgaWYgKGF1ZGlvVXJsKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYXVkaW9VcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKFwiUkogY29tbWVudGFyeSBjbGVhbnVwIGNvbXBsZXRlZFwiKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHRvZ2dsZVJKTW9kZSgpIHtcclxuICAgIHRoaXMuaXNSSk1vZGVBY3RpdmUgPSAhdGhpcy5pc1JKTW9kZUFjdGl2ZTtcclxuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIik7XHJcbiAgICBpZiAoIWJ1dHRvbikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiUkogTW9kZSBidXR0b24gbm90IGZvdW5kLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RvcCBSSiBNb2RlXCI7XHJcbiAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoNDVkZWcsICNmZjQ3NTcsICNmZjZiNmIpXCI7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRSSk1vZGUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RhcnQgUkogTW9kZVwiO1xyXG4gICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjZmY2YjZiLCAjNGVjZGM0KVwiO1xyXG4gICAgICB0aGlzLnN0b3BSSk1vZGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHN0YXJ0UkpNb2RlKCkge1xyXG4gICAgdGhpcy5nZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpO1xyXG4gICAgdGhpcy5zZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIHN0b3BSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvID0gXCJcIjtcclxuXHJcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0cyBhbmQgaW50ZXJ2YWxzXHJcbiAgICBpZiAodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlkZW9DaGFuZ2VUaW1lb3V0KTtcclxuICAgICAgdGhpcy52aWRlb0NoYW5nZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5wcm9ncmVzc0ludGVydmFsKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCBhbnkgbG9hZGluZyBpbmRpY2F0b3JzXHJcbiAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiUkogTW9kZSBzdG9wcGVkIGFuZCBjbGVhbmVkIHVwXCIpO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgLy8gUHJvZ3Jlc3MgY2hlY2sgaW50ZXJ2YWxcclxuXHJcbiAgICAvLyBNb25pdG9yIHZpZGVvIHByb2dyZXNzXHJcbiAgICBjb25zdCBjaGVja1ZpZGVvUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tWaWRlb1Byb2dyZXNzIGNhbGxlZFwiKTtcclxuICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgICAgIGlmICghdmlkZW8gfHwgIXRoaXMuaXNSSk1vZGVBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVSZW1haW5pbmcgPSB2aWRlby5kdXJhdGlvbiAtIHZpZGVvLmN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gZ2VuZXJhdGUgY29tbWVudGFyeSBhbmQga2VlcCBpdCByZWFkeSAxMCBzZWNvbmRzIGFmZXIgdmlkZW8gc3RhcnRzXHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA+IDEwICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSAmJlxyXG4gICAgICAgICF0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVJKQ29tbWVudGFyeSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFydCBjb21tZW50YXJ5IHdoZW4gMzAgc2Vjb25kcyByZW1haW4gYW5kIG5vdCBhbHJlYWR5IHBsYXlpbmdcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRpbWVSZW1haW5pbmcgPD0gMzAgJiZcclxuICAgICAgICAhdGhpcy5pc1JKUGxheWluZyAmJlxyXG4gICAgICAgICF0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnlcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5UkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHVwIHZpZGVvIHByb2dyZXNzIG1vbml0b3JpbmdcclxuICAgIGNvbnN0IHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9ncmVzc0ludGVydmFsKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrVmlkZW9Qcm9ncmVzcywgMTAwMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENsZWFyIHByb2dyZXNzIG1vbml0b3JpbmdcclxuXHJcbiAgICAvLyBTdGFydCBtb25pdG9yaW5nIHdoZW4gUkogbW9kZSBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIHdoZW4gcGFnZSBsb2Fkc1xyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBjb25zdCB5b3V0dWJlUkogPSBuZXcgWW91VHViZVJKTW9kZSgpO1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSiA9IHlvdXR1YmVSSjtcclxuICAgIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbiAgfSk7XHJcbn0gZWxzZSB7XHJcbiAgY29uc3QgeW91dHViZVJKID0gbmV3IFlvdVR1YmVSSk1vZGUoKTtcclxuICAod2luZG93IGFzIGFueSkueW91dHViZVJKID0geW91dHViZVJKO1xyXG4gIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbn1cclxuIgogIF0sCiAgIm1h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Q3hCO0FBQUE7QUFBQSxJQUlGLE1BQU0sMEJBQTBCLE1BQU07QUFBQSxNQUNwQyxJQUFJLEtBQUssa0JBQWtCO0FBQUEsUUFDekIsY0FBYyxLQUFLLGdCQUFnQjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSxLQUFLLG1CQUFtQixZQUFZLG9CQUFvQixJQUFJO0FBQUE7QUFBQSxJQU05RCxJQUFJLEtBQUssZ0JBQWdCO0FBQUEsTUFDdkIsd0JBQXdCO0FBQUEsSUFDMUI7QUFBQTtBQUVKO0FBR0EsSUFBSSxTQUFTLGVBQWUsV0FBVztBQUFBLEVBQ3JDLFNBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBQUEsSUFDbEQsTUFBTSxZQUFZLElBQUk7QUFBQSxJQUNyQixPQUFlLFlBQVk7QUFBQSxJQUM1QixRQUFRLElBQUksU0FBUztBQUFBLEdBQ3RCO0FBQ0gsRUFBTztBQUFBLEVBQ0wsTUFBTSxZQUFZLElBQUk7QUFBQSxFQUNyQixPQUFlLFlBQVk7QUFBQSxFQUM1QixRQUFRLElBQUksU0FBUztBQUFBOyIsCiAgImRlYnVnSWQiOiAiMjExMkY1QTFCMUFGMzMyMjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
