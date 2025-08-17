var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
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
class EdgeTTS {
  audio_stream = [];
  audio_format = "mp3";
  ws = null;
  Constants = {
    TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
    WSS_URL: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    VOICES_URL: "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list"
  };
  async getVoices() {
    const response = await fetch(`${this.Constants.VOICES_URL}?trustedclienttoken=${this.Constants.TRUSTED_CLIENT_TOKEN}`);
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
    return new Promise((resolve, reject) => {
      this.audio_stream = [];
      const req_id = this.generateUUID();
      this.ws = new WebSocket(`${this.Constants.WSS_URL}?trustedclienttoken=${this.Constants.TRUSTED_CLIENT_TOKEN}&ConnectionId=${req_id}`);
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
window.EdgeTTS = EdgeTTS;

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
      const script = await api_utils_default.callGeminiAPI(prompt2, settings.geminiApiKey);
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

//# debugId=00C631EF48D0711664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi5cXHNyY1xcdXRpbHNcXGFwaS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcYXVkaW8tdXRpbHMudHMiLCAiLi5cXHNyY1xcdXRpbHNcXGRvbS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xceW91dHViZS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcZWRnZS10dHMtd2ViLnRzIiwgIi4uXFxzcmNcXGNvbnRlbnQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy8gQVBJLXJlbGF0ZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuXHJcbi8vIEdldCBzdG9yZWQgQVBJIHNldHRpbmdzXHJcbmNvbnN0IGdldEFQSVNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xyXG4gIHJldHVybiBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgpO1xyXG59O1xyXG5cclxuY29uc3Qgc3R5bGVQcm9tcHRzID0ge1xyXG4gIGVuZXJnZXRpYzpcclxuICAgIFwiWW91IGFyZSBhIGhpZ2gtZW5lcmd5IHJhZGlvIERKIHdobydzIGFic29sdXRlbHkgcHVtcGVkIGFib3V0IG11c2ljIVwiLFxyXG4gIGNoaWxsOiBcIllvdSBhcmUgYSBsYWlkLWJhY2sgREogd2l0aCBhIHNtb290aCwgcmVsYXhlZCB2aWJlLlwiLFxyXG4gIHNhcmNhc3RpYzpcclxuICAgIFwiWW91IGFyZSBhIHdpdHR5IERKIHdobyBhZGRzIGNsZXZlciBjb21tZW50YXJ5IHdpdGggYSB0b3VjaCBvZiBzYXJjYXNtLlwiLFxyXG4gIHByb2Zlc3Npb25hbDogXCJZb3UgYXJlIGEgcHJvZmVzc2lvbmFsIHJhZGlvIGhvc3Qgd2l0aCBwb2xpc2hlZCBkZWxpdmVyeS5cIixcclxufTtcclxuXHJcbmNvbnN0IGxlbmd0aEd1aWRlcyA9IHtcclxuICBzaG9ydDogXCJLZWVwIGl0IGJyaWVmIGFuZCBwdW5jaHkgKDIwLTMwIHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbiAgbWVkaXVtOiBcIk1vZGVyYXRlIGxlbmd0aCB3aXRoIGdvb2QgZmxvdyAoMzAtNDUgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxuICBsb25nOiBcIk1vcmUgZGV0YWlsZWQgY29tbWVudGFyeSAoNDUtNjAgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxufTtcclxuXHJcbi8vIEdlbmVyYXRlIFJKIHByb21wdCBiYXNlZCBvbiBzZXR0aW5nc1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVJKUHJvbXB0KFxyXG4gIGN1cnJlbnRTb25nOiBzdHJpbmcsXHJcbiAgbmV4dFNvbmc6IHN0cmluZyB8IG51bGwsXHJcbiAgc3R5bGU6IGtleW9mIHR5cGVvZiBzdHlsZVByb21wdHMsXHJcbiAgbGVuZ3RoOiBrZXlvZiB0eXBlb2YgbGVuZ3RoR3VpZGVzLFxyXG4gIHNjcmlwdEhpc3Rvcnk6IHN0cmluZyB8IG51bGwsXHJcbiAgY29tbWVudHM6IHN0cmluZyB8IG51bGwsXHJcbiAgY3VycmVudFNvbmdseXJpY3M6IHN0cmluZyB8IG51bGwsXHJcbiAgaG9zdE5hbWU6IHN0cmluZyxcclxuICByYWRpb1N0YXRpb246IHN0cmluZ1xyXG4pIHtcclxuICBjb25zdCBiYXNlUHJvbXB0ID0gc3R5bGVQcm9tcHRzW3N0eWxlXSB8fCBzdHlsZVByb21wdHMuZW5lcmdldGljO1xyXG4gIGNvbnN0IGxlbmd0aEd1aWRlID0gbGVuZ3RoR3VpZGVzW2xlbmd0aF0gfHwgbGVuZ3RoR3VpZGVzLm1lZGl1bTtcclxuXHJcbiAgY29uc3QgcmFkaW9JbmZvID0gYFJhZGlvIHN0YXRpb246ICR7cmFkaW9TdGF0aW9ufVxyXG4gIEhvc3QgbmFtZTogJHtob3N0TmFtZX1gO1xyXG5cclxuICByZXR1cm4gYCR7YmFzZVByb21wdH0gJHtsZW5ndGhHdWlkZX0gJHtyYWRpb0luZm99LiBcclxuXHJcbiR7XHJcbiAgc2NyaXB0SGlzdG9yeSAmJiBcIkhlcmUncyBzb21lIG9mIHlvdXIgcHJldmlvdXMgY29tbWVudGFyeTogXFxuXCIgKyBzY3JpcHRIaXN0b3J5XHJcbn1cclxuJHtjb21tZW50cyAmJiBcIkhlcmUgYXJlIHNvbWUgY29tbWVudHMgZnJvbSB2aWV3ZXJzOiBcXG5cIiArIGNvbW1lbnRzfVxyXG5cclxuQ3VycmVudCBzb25nOiBcIiR7Y3VycmVudFNvbmd9XCJcclxuXHJcbiR7Y3VycmVudFNvbmdseXJpY3MgPyBgQ3VycmVudCBzb25nIEx5cmljczogJHtjdXJyZW50U29uZ2x5cmljc31gIDogXCJcIn1cclxuXHJcbiR7bmV4dFNvbmcgPyBgTmV4dCBTb25nOiBcIiR7bmV4dFNvbmd9XCJgIDogXCJcIn1cclxuXHJcbkltcG9ydGFudCBndWlkZWxpbmVzOlxyXG5BVk9JRCB1c2luZyBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IGRldGVjdGVkIGJ5IFRUUyBpbiB0aGUgY29tbWVudGFyeSwgeW91ciBvdXRwdXQgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGF1ZGlvLlxyXG5BVk9JRCBzYXlpbmcgQWxyaWdodCBhbmQgT2theSBva2F5IG9yIHNpbWlsYXIgcGhyYXNlcyBhdCB0aGUgYmVnaW5pbmcuIENvb2sgdXAgc29tZSBuZXcgaW50cm9zXHJcbkNSRUFURSBlbmdhZ2luZyBjb21tZW50YXJ5IHRoYXQgY29ubmVjdHMgd2l0aCBsaXN0ZW5lcnMuIEJlIG5hdHVyYWwsIGVudGh1c2lhc3RpYywgYW5kIGFkZCBwZXJzb25hbGl0eS4gRG9uJ3QgcmVhZCB0aGUgc29uZyB0aXRsZXMgLSBtYWtlIGl0IGNvbnZlcnNhdGlvbmFsIGFuZCBmdW4hXHJcbk9OTFkgcmVzcG9uZCB3aXRoIHRoZSBjb21tZW50YXJ5IHRleHQsIGRvIG5vdCBpbmNsdWRlIGFueSBhZGRpdGlvbmFsIGluc3RydWN0aW9ucyBvciBleHBsYW5hdGlvbnMuXHJcbmA7XHJcbn1cclxuXHJcbi8vIENhbGwgR2VtaW5pIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxHZW1pbmlBUEkocHJvbXB0OiBzdHJpbmcsIGFwaUtleTogc3RyaW5nKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkdlbWluaSBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgIFwiaHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMi4wLWZsYXNoOmdlbmVyYXRlQ29udGVudFwiLFxyXG4gICAge1xyXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJYLWdvb2ctYXBpLWtleVwiOiBhcGlLZXksXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBjb250ZW50czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBwYXJ0czogW1xyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IHByb21wdCxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9KSxcclxuICAgIH1cclxuICApO1xyXG5cclxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIGBHZW1pbmkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWBcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICBpZiAoIWRhdGEuY2FuZGlkYXRlcyB8fCAhZGF0YS5jYW5kaWRhdGVzWzBdIHx8ICFkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXNwb25zZSBmcm9tIEdlbWluaSBBUElcIik7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQucGFydHNbMF0udGV4dDtcclxufVxyXG5cclxuLy8gQ2FsbCBNdXJmLmFpIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxNdXJmQVBJKFxyXG4gIHRleHQ6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICB2b2ljZUlkID0gXCJlbi1VUy1uYXRhbGllXCIsXHJcbiAgc3R5bGUgPSBcIlByb21vXCJcclxuKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIk11cmYuYWkgQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCJodHRwczovL2FwaS5tdXJmLmFpL3YxL3NwZWVjaC9nZW5lcmF0ZVwiLCB7XHJcbiAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICBcImFwaS1rZXlcIjogYXBpS2V5LFxyXG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgIH0sXHJcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgIHZvaWNlSWQ6IHZvaWNlSWQsXHJcbiAgICAgIHN0eWxlOiBzdHlsZSxcclxuICAgIH0pLFxyXG4gIH0pO1xyXG5cclxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICBjb25zdCBlcnJvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIGBNdXJmLmFpIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH0gLSAke1xyXG4gICAgICAgIGVycm9yRGF0YS5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwiXHJcbiAgICAgIH1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHJcbiAgaWYgKCFkYXRhLmF1ZGlvRmlsZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXVkaW8gZmlsZSByZXR1cm5lZCBmcm9tIE11cmYuYWkgQVBJXCIpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggdGhlIGFjdHVhbCBhdWRpbyBmaWxlXHJcbiAgY29uc3QgYXVkaW9SZXNwb25zZSA9IGF3YWl0IGZldGNoKGRhdGEuYXVkaW9GaWxlKTtcclxuICBpZiAoIWF1ZGlvUmVzcG9uc2Uub2spIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCBhdWRpbyBmaWxlIGZyb20gTXVyZi5haVwiKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhdWRpb0Jsb2I6IGF3YWl0IGF1ZGlvUmVzcG9uc2UuYmxvYigpLFxyXG4gICAgZHVyYXRpb246IGRhdGEuYXVkaW9MZW5ndGhJblNlY29uZHMsXHJcbiAgICByZW1haW5pbmdDaGFyczogZGF0YS5yZW1haW5pbmdDaGFyYWN0ZXJDb3VudCxcclxuICB9O1xyXG59XHJcblxyXG4vLyBMb2cgY29tbWVudGFyeSBmb3IgZXhwb3J0IGZlYXR1cmVcclxuZnVuY3Rpb24gbG9nQ29tbWVudGFyeShjdXJyZW50U29uZzogc3RyaW5nLCBuZXh0U29uZzogc3RyaW5nLCBzY3JpcHQ6IHN0cmluZykge1xyXG4gIGNocm9tZS5ydW50aW1lXHJcbiAgICAuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICBhY3Rpb246IFwibG9nQ29tbWVudGFyeVwiLFxyXG4gICAgICBjdXJyZW50U29uZyxcclxuICAgICAgbmV4dFNvbmcsXHJcbiAgICAgIHNjcmlwdCxcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goY29uc29sZS5lcnJvcik7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxMeXJpY3NBUEkocXVlcnk6IHN0cmluZykge1xyXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vbHJjbGliLm5ldC9hcGkvc2VhcmNoP3E9JHtxdWVyeX1gLCB7XHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgfSxcclxuICAgIHJlZmVycmVyOiBcImh0dHBzOi8vbHJjbGliLm5ldC9kb2NzXCIsXHJcbiAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgfSk7XHJcblxyXG4gIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgYEx5cmljcyBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgY29uc29sZS5sb2coXCJMeXJpY3MgQVBJIHJlc3BvbnNlOlwiLCBkYXRhKTtcclxuICByZXR1cm4gZGF0YT8uWzBdPy5wbGFpbkx5cmljczsgLy8gYXJyYXkgb2YgbHlyaWNzIG9iamVjdHMgLCBkYXRhWzBdLnBsYWluTHlyaWNzXHJcblxyXG4gIC8vIGF3YWl0IGNhbGxMeXJpY3NBUEkoXCJIb2FuZyAtIFJ1biBCYWNrIHRvIFlvdVwiKTtcclxufVxyXG5cclxuY29uc3QgQVBJVXRpbHMgPSB7XHJcbiAgY2FsbE11cmZBUEksXHJcbiAgY2FsbEdlbWluaUFQSSxcclxuICBjYWxsTHlyaWNzQVBJLFxyXG4gIGxvZ0NvbW1lbnRhcnksXHJcbiAgZ2V0QVBJU2V0dGluZ3MsXHJcbiAgZ2VuZXJhdGVSSlByb21wdCxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5BUElVdGlscyA9IEFQSVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBBUElVdGlscztcclxuIiwKICAgICIvLyBFeHRlbmQgV2luZG93IGludGVyZmFjZSB0byBpbmNsdWRlIHdlYmtpdEF1ZGlvQ29udGV4dFxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICB3ZWJraXRBdWRpb0NvbnRleHQ6IHR5cGVvZiBBdWRpb0NvbnRleHQ7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBBdWRpby1yZWxhdGVkIHV0aWxpdHkgZnVuY3Rpb25zXHJcbmNvbnN0IEF1ZGlvVXRpbHMgPSB7XHJcbiAgLy8gQ3JlYXRlIGF1ZGlvIGNvbnRleHQgd2l0aCBmYWxsYmFja3NcclxuICBjcmVhdGVBdWRpb0NvbnRleHQoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgKSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIGNvbnRleHQgY3JlYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vIFNtb290aCB2b2x1bWUgdHJhbnNpdGlvblxyXG4gIGFzeW5jIHNtb290aFZvbHVtZVRyYW5zaXRpb24oXHJcbiAgICB2aWRlbzogSFRNTFZpZGVvRWxlbWVudCxcclxuICAgIHRhcmdldFZvbHVtZTogbnVtYmVyLFxyXG4gICAgZHVyYXRpb24gPSAyMDBcclxuICApIHtcclxuICAgIGlmICghdmlkZW8pIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBzdGFydFZvbHVtZSA9IHZpZGVvLnZvbHVtZTtcclxuICAgIGNvbnN0IHN0ZXBzID0gMjA7XHJcbiAgICBjb25zdCB2b2x1bWVTdGVwID0gKHRhcmdldFZvbHVtZSAtIHN0YXJ0Vm9sdW1lKSAvIHN0ZXBzO1xyXG4gICAgY29uc3QgdGltZVN0ZXAgPSBkdXJhdGlvbiAvIHN0ZXBzO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RlcHM7IGkrKykge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdWb2x1bWUgPSBNYXRoLm1heChcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBNYXRoLm1pbigxLCBzdGFydFZvbHVtZSArIHZvbHVtZVN0ZXAgKiAoaSArIDEpKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdmlkZW8udm9sdW1lID0gbmV3Vm9sdW1lO1xyXG4gICAgICB9LCB0aW1lU3RlcCAqIGkpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vIER1Y2sgdm9sdW1lIHNtb290aGx5XHJcbiAgYXN5bmMgZHVja1ZvbHVtZSh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgZHVja0xldmVsID0gMC4zKSB7XHJcbiAgICBpZiAoIXZpZGVvKSByZXR1cm4gMTtcclxuXHJcbiAgICBjb25zdCBvcmlnaW5hbFZvbHVtZSA9IHZpZGVvLnZvbHVtZTtcclxuICAgIGF3YWl0IHRoaXMuc21vb3RoVm9sdW1lVHJhbnNpdGlvbih2aWRlbywgZHVja0xldmVsKTtcclxuICAgIHJldHVybiBvcmlnaW5hbFZvbHVtZTtcclxuICB9LFxyXG5cclxuICAvLyBSZXN0b3JlIHZvbHVtZSBzbW9vdGhseVxyXG4gIGFzeW5jIHJlc3RvcmVWb2x1bWUodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIHRhcmdldFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBpZiAoIXZpZGVvIHx8IHRhcmdldFZvbHVtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcbiAgICBhd2FpdCB0aGlzLnNtb290aFZvbHVtZVRyYW5zaXRpb24odmlkZW8sIHRhcmdldFZvbHVtZSwgMzAwKTtcclxuICB9LFxyXG5cclxuICAvLyBDcmVhdGUgYXVkaW8gZWxlbWVudCB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbiAgY3JlYXRlQXVkaW8oYXVkaW9CbG9iOiBCbG9iKSB7XHJcbiAgICBjb25zdCBhdWRpb1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYXVkaW9CbG9iKTtcclxuICAgIGNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKGF1ZGlvVXJsKTtcclxuXHJcbiAgICAvLyBBZGQgZXJyb3IgaGFuZGxpbmdcclxuICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIHBsYXliYWNrIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYXVkaW9VcmwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHsgYXVkaW8sIGF1ZGlvVXJsIH07XHJcbiAgfSxcclxuXHJcbiAgLy8gUGxheSBhdWRpbyB3aXRoIHByb21pc2VcclxuICBwbGF5QXVkaW8oYXVkaW86IEhUTUxBdWRpb0VsZW1lbnQpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCByZXNvbHZlKTtcclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIHJlamVjdCk7XHJcblxyXG4gICAgICBhdWRpby5wbGF5KCkuY2F0Y2gocmVqZWN0KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuQXVkaW9VdGlscyA9IEF1ZGlvVXRpbHM7XHJcbmV4cG9ydCBkZWZhdWx0IEF1ZGlvVXRpbHM7XHJcbiIsCiAgICAiY29uc3Qgc2hvd0xvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XHJcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbG9hZGluZ1wiKSkgcmV0dXJuO1xyXG5cclxuICBjb25zdCBsb2FkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBsb2FkaW5nLmlkID0gXCJyai1sb2FkaW5nXCI7XHJcbiAgbG9hZGluZy5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEwcHg7XCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj5cclxuICAgICAgICA8c3Bhbj7wn46Z77iPIFByZXBhcmluZyBSSiBjb21tZW50YXJ5Li4uPC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gIGxvYWRpbmcuc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICB0b3A6IDE0MHB4O1xyXG4gICAgICByaWdodDogMjBweDtcclxuICAgICAgei1pbmRleDogOTk5OTtcclxuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjgpO1xyXG4gICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgIHBhZGRpbmc6IDEwcHggMTVweDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgIGA7XHJcblxyXG4gIC8vIEFkZCBzcGlubmVyIENTUyBpZiBub3QgZXhpc3RzXHJcbiAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwaW5uZXItc3R5bGVzXCIpKSB7XHJcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcclxuICAgIHN0eWxlLmlkID0gXCJzcGlubmVyLXN0eWxlc1wiO1xyXG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXHJcbiAgICAgICAgLnNwaW5uZXIge1xyXG4gICAgICAgICAgd2lkdGg6IDE2cHg7XHJcbiAgICAgICAgICBoZWlnaHQ6IDE2cHg7XHJcbiAgICAgICAgICBib3JkZXI6IDJweCBzb2xpZCAjMzMzO1xyXG4gICAgICAgICAgYm9yZGVyLXRvcDogMnB4IHNvbGlkICNmZmY7XHJcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbiAgICAgICAgICBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxyXG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIGA7XHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGluZyk7XHJcbn07XHJcblxyXG5jb25zdCBoaWRlTG9hZGluZ0luZGljYXRvciA9ICgpID0+IHtcclxuICBjb25zdCBsb2FkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1sb2FkaW5nXCIpO1xyXG4gIGlmIChsb2FkaW5nKSBsb2FkaW5nLnJlbW92ZSgpO1xyXG59O1xyXG5cclxuY29uc3Qgc2hvd0Vycm9yTWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcclxuICBjb25zdCBlcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgZXJyb3Iuc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICB0b3A6IDE0MHB4O1xyXG4gICAgICByaWdodDogMjBweDtcclxuICAgICAgei1pbmRleDogOTk5OTtcclxuICAgICAgYmFja2dyb3VuZDogI2ZmNDc1NztcclxuICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICBwYWRkaW5nOiAxMHB4IDE1cHg7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xyXG4gICAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICAgIG1heC13aWR0aDogMzUwcHg7XHJcbiAgICBgO1xyXG4gIGVycm9yLnRleHRDb250ZW50ID0gYOKdjCAke21lc3NhZ2V9YDtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlcnJvcik7XHJcblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgZXJyb3IucmVtb3ZlKCk7XHJcbiAgfSwgNTAwMCk7XHJcbn07XHJcblxyXG5jb25zdCBjcmVhdGVSSk1vZGVCdXR0b24gPSAodG9nZ2xlUkpNb2RlOiBGdW5jdGlvbikgPT4ge1xyXG4gIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XHJcbiAgYnV0dG9uLmlkID0gXCJyai1tb2RlLWJ1dHRvblwiO1xyXG4gIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RhcnQgUkogTW9kZVwiO1xyXG4gIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICAgIHRvcDogMTAwcHg7XHJcbiAgICAgIHJpZ2h0OiAyMHB4O1xyXG4gICAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsICNmZjZiNmIsICM0ZWNkYzQpO1xyXG4gICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgIGJvcmRlcjogbm9uZTtcclxuICAgICAgcGFkZGluZzogMTJweCAyMHB4O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAyNXB4O1xyXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4yKTtcclxuICAgICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZTtcclxuICAgIGA7XHJcblxyXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdG9nZ2xlUkpNb2RlKCkpO1xyXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsICgpID0+IHtcclxuICAgIGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKDEuMDUpXCI7XHJcbiAgfSk7XHJcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCAoKSA9PiB7XHJcbiAgICBidXR0b24uc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZSgxKVwiO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ1dHRvbik7XHJcbn07XHJcblxyXG5jb25zdCBkaXNtaXNzTm90aWZpY2F0aW9uID0gKCkgPT4ge1xyXG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1ub3RpZmljYXRpb25cIik7XHJcbiAgaWYgKG5vdGlmaWNhdGlvbikge1xyXG4gICAgbm90aWZpY2F0aW9uLnN0eWxlLmFuaW1hdGlvbiA9IFwic2xpZGVPdXRSaWdodCAwLjNzIGVhc2UtaW5cIjtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XHJcbiAgICB9LCAzMDApO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHNob3dSSk1vZGVQcm9tcHQgPSAodG9nZ2xlUkpNb2RlOiBGdW5jdGlvbikgPT4ge1xyXG4gIC8vIENyZWF0ZSBhIG1vcmUgcHJvbWluZW50IG5vdGlmaWNhdGlvbiBmb3IgcGxheWxpc3QgZGV0ZWN0aW9uXHJcbiAgY29uc3Qgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBub3RpZmljYXRpb24uaWQgPSBcInJqLW1vZGUtbm90aWZpY2F0aW9uXCI7XHJcbiAgbm90aWZpY2F0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICA8c3Bhbj7wn46Z77iPPC9zcGFuPlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8c3Ryb25nPlBsYXlsaXN0IERldGVjdGVkITwvc3Ryb25nPlxyXG4gICAgICAgICAgPGJyPlxyXG4gICAgICAgICAgPHNtYWxsPlJlYWR5IHRvIGFkZCBzb21lIFJKIG1hZ2ljPzwvc21hbGw+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGJ1dHRvbiBpZD1cImVuYWJsZS1yai1tb2RlXCIgc3R5bGU9XCJcclxuICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgIzRDQUY1MCwgIzQ1YTA0OSk7XHJcbiAgICAgICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgICAgICBib3JkZXI6IG5vbmU7XHJcbiAgICAgICAgICBwYWRkaW5nOiA4cHggMTZweDtcclxuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7XHJcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgICAgICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xyXG4gICAgICAgIFwiPkVuYWJsZSBSSiBNb2RlPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBpZD1cImRpc21pc3MtcmotcHJvbXB0XCIgc3R5bGU9XCJcclxuICAgICAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG4gICAgICAgICAgY29sb3I6ICM2NjY7XHJcbiAgICAgICAgICBib3JkZXI6IG5vbmU7XHJcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgICBmb250LXNpemU6IDE4cHg7XHJcbiAgICAgICAgICBwYWRkaW5nOiA1cHg7XHJcbiAgICAgICAgXCI+w5c8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG5cclxuICBub3RpZmljYXRpb24uc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgICB0b3A6IDgwcHg7XHJcbiAgICAgIHJpZ2h0OiAyMHB4O1xyXG4gICAgICB6LWluZGV4OiAxMDAwMDtcclxuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcclxuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xyXG4gICAgICBjb2xvcjogIzMzMztcclxuICAgICAgcGFkZGluZzogMTVweCAyMHB4O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xyXG4gICAgICBib3gtc2hhZG93OiAwIDhweCAzMnB4IHJnYmEoMCwwLDAsMC4xKTtcclxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjIpO1xyXG4gICAgICBtYXgtd2lkdGg6IDM1MHB4O1xyXG4gICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XHJcbiAgICAgIGFuaW1hdGlvbjogc2xpZGVJblJpZ2h0IDAuM3MgZWFzZS1vdXQ7XHJcbiAgICBgO1xyXG5cclxuICAvLyBBZGQgQ1NTIGFuaW1hdGlvblxyXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLXN0eWxlc1wiKSkge1xyXG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XHJcbiAgICBzdHlsZS5pZCA9IFwicmotbW9kZS1zdHlsZXNcIjtcclxuICAgIHN0eWxlLnRleHRDb250ZW50ID0gYFxyXG4gICAgICAgIEBrZXlmcmFtZXMgc2xpZGVJblJpZ2h0IHtcclxuICAgICAgICAgIGZyb20geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwJSk7IG9wYWNpdHk6IDA7IH1cclxuICAgICAgICAgIHRvIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyBvcGFjaXR5OiAxOyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEBrZXlmcmFtZXMgc2xpZGVPdXRSaWdodCB7XHJcbiAgICAgICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyBvcGFjaXR5OiAxOyB9XHJcbiAgICAgICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDAlKTsgb3BhY2l0eTogMDsgfVxyXG4gICAgICAgIH1cclxuICAgICAgYDtcclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gIH1cclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xyXG5cclxuICAvLyBFdmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBub3RpZmljYXRpb25cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuYWJsZS1yai1tb2RlXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgZGlzbWlzc05vdGlmaWNhdGlvbigpO1xyXG4gICAgdG9nZ2xlUkpNb2RlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudEJ5SWQoXCJkaXNtaXNzLXJqLXByb21wdFwiKVxyXG4gICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIDEwIHNlY29uZHNcclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIGRpc21pc3NOb3RpZmljYXRpb24oKTtcclxuICB9LCAxMDAwMCk7XHJcbn07XHJcblxyXG5jb25zdCBEb21VdGlscyA9IHtcclxuICBzaG93RXJyb3JNZXNzYWdlLFxyXG4gIHNob3dSSk1vZGVQcm9tcHQsXHJcbiAgY3JlYXRlUkpNb2RlQnV0dG9uLFxyXG4gIGRpc21pc3NOb3RpZmljYXRpb24sXHJcbiAgc2hvd0xvYWRpbmdJbmRpY2F0b3IsXHJcbiAgaGlkZUxvYWRpbmdJbmRpY2F0b3IsXHJcbn07XHJcblxyXG4od2luZG93IGFzIGFueSkuRG9tVXRpbHMgPSBEb21VdGlscztcclxuZXhwb3J0IGRlZmF1bHQgRG9tVXRpbHM7XHJcbiIsCiAgICAiLy8gWW91VHViZS1zcGVjaWZpYyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5jb25zdCBZb3VUdWJlVXRpbHMgPSB7XHJcbiAgZXh0cmFjdFZpZGVvSWQoKSB7XHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoXCJ2XCIpO1xyXG4gICAgcmV0dXJuIHZpZGVvSWQgfHwgbnVsbDtcclxuICB9LFxyXG5cclxuICBnZXRDdXJyZW50VmlkZW9UaXRsZSgpIHtcclxuICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiaDEudGl0bGUuc3R5bGUtc2NvcGUueXRkLXZpZGVvLXByaW1hcnktaW5mby1yZW5kZXJlclwiXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHRpdGxlRWxlbWVudD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiO1xyXG4gIH0sXHJcblxyXG4gIGdldERlc2NyaXB0aW9uKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgZG9jdW1lbnQ/LnF1ZXJ5U2VsZWN0b3IoXCIjZGVzY3JpcHRpb24taW5uZXJcIik/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIlxyXG4gICAgKTtcclxuICB9LFxyXG5cclxuICBnZXRDb21tZW50cygpIHtcclxuICAgIGxldCBhbGxDb21tZW50czogc3RyaW5nW10gPSBbXTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjY29tbWVudC1jb250YWluZXJcIikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICBsZXQgdHh0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiI2V4cGFuZGVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgICAgIGFsbENvbW1lbnRzLnB1c2godHh0KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGFsbENvbW1lbnRzO1xyXG4gIH0sXHJcblxyXG4gIGdldE5leHRWaWRlb1RpdGxlKCkge1xyXG4gICAgY29uc3QgcGxheWxpc3RJdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5bGlzdC1pdGVtc1tzZWxlY3RlZF1cIik7XHJcbiAgICBjb25zdCBuZXh0VmlkZW9FbGVtZW50ID0gKFxyXG4gICAgICBwbGF5bGlzdEl0ZW0/Lm5leHRTaWJsaW5nIGFzIEVsZW1lbnRcclxuICAgICk/LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8tdGl0bGVcIik7XHJcblxyXG4gICAgcmV0dXJuIG5leHRWaWRlb0VsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBpc1BsYXlsaXN0UGFnZSgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmhhcyhcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGxheWxpc3RJZCgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmdldChcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VmlkZW9FbGVtZW50KCkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ2aWRlb1wiKTtcclxuICB9LFxyXG5cclxuICAvLyBDbGVhbiB1cCBZb3VUdWJlIHZpZGVvIHRpdGxlcyAocmVtb3ZlIGNvbW1vbiBzdWZmaXhlcylcclxuICBjbGVhblZpZGVvVGl0bGUodGl0bGU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRpdGxlXHJcbiAgICAgIC5yZXBsYWNlKC9cXChPZmZpY2lhbC4qP1xcKS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoL1xcKE11c2ljIFZpZGVvXFwpL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvXFxbT2ZmaWNpYWwuKj9cXF0vZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC8tIFRvcGljJC8sIFwiXCIpXHJcbiAgICAgIC50cmltKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gR2V0IHZpZGVvIGR1cmF0aW9uXHJcbiAgZ2V0VmlkZW9EdXJhdGlvbigpIHtcclxuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHJldHVybiB2aWRlbyA/IHZpZGVvLmR1cmF0aW9uIDogMDtcclxuICB9LFxyXG5cclxuICAvLyBDaGVjayBpZiB2aWRlbyBpcyBwbGF5aW5nXHJcbiAgaXNWaWRlb1BsYXlpbmcoKSB7XHJcbiAgICBjb25zdCB2aWRlbyA9IHRoaXMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICByZXR1cm4gdmlkZW8gPyAhdmlkZW8ucGF1c2VkICYmICF2aWRlby5lbmRlZCA6IGZhbHNlO1xyXG4gIH0sXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuWW91VHViZVV0aWxzID0gWW91VHViZVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBZb3VUdWJlVXRpbHM7XHJcbiIsCiAgICAiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFZvaWNlIHtcclxuICBOYW1lOiBzdHJpbmc7XHJcbiAgU2hvcnROYW1lOiBzdHJpbmc7XHJcbiAgR2VuZGVyOiBzdHJpbmc7XHJcbiAgTG9jYWxlOiBzdHJpbmc7XHJcbiAgVm9pY2VUeXBlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVkZ2VUVFNPcHRpb25zIHtcclxuICBwaXRjaD86IHN0cmluZyB8IG51bWJlcjtcclxuICByYXRlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gIHZvbHVtZT86IHN0cmluZyB8IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2VUVFMge1xyXG4gIGF1ZGlvX3N0cmVhbTogVWludDhBcnJheVtdICYgQmxvYlBhcnRbXSA9IFtdO1xyXG4gIGF1ZGlvX2Zvcm1hdDogc3RyaW5nID0gXCJtcDNcIjtcclxuICB3czogV2ViU29ja2V0IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIHByaXZhdGUgQ29uc3RhbnRzID0ge1xyXG4gICAgVFJVU1RFRF9DTElFTlRfVE9LRU46IFwiNkE1QUExRDRFQUZGNEU5RkIzN0UyM0Q2ODQ5MUQ2RjRcIixcclxuICAgIFdTU19VUkw6XHJcbiAgICAgIFwid3NzOi8vc3BlZWNoLnBsYXRmb3JtLmJpbmcuY29tL2NvbnN1bWVyL3NwZWVjaC9zeW50aGVzaXplL3JlYWRhbG91ZC9lZGdlL3YxXCIsXHJcbiAgICBWT0lDRVNfVVJMOlxyXG4gICAgICBcImh0dHBzOi8vc3BlZWNoLnBsYXRmb3JtLmJpbmcuY29tL2NvbnN1bWVyL3NwZWVjaC9zeW50aGVzaXplL3JlYWRhbG91ZC92b2ljZXMvbGlzdFwiLFxyXG4gIH07XHJcblxyXG4gIGFzeW5jIGdldFZvaWNlcygpOiBQcm9taXNlPFZvaWNlW10+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgIGAke3RoaXMuQ29uc3RhbnRzLlZPSUNFU19VUkx9P3RydXN0ZWRjbGllbnR0b2tlbj0ke3RoaXMuQ29uc3RhbnRzLlRSVVNURURfQ0xJRU5UX1RPS0VOfWBcclxuICAgICk7XHJcbiAgICBjb25zdCBkYXRhOiBWb2ljZVtdID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgcmV0dXJuIGRhdGEubWFwKCh2b2ljZSkgPT4ge1xyXG4gICAgICBjb25zdCB7IE5hbWUsIFNob3J0TmFtZSwgR2VuZGVyLCBMb2NhbGUsIFZvaWNlVHlwZSB9ID0gdm9pY2U7XHJcbiAgICAgIHJldHVybiB7IE5hbWUsIFNob3J0TmFtZSwgR2VuZGVyLCBMb2NhbGUsIFZvaWNlVHlwZSB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRWb2ljZXNCeUxhbmd1YWdlKGxvY2FsZTogc3RyaW5nKTogUHJvbWlzZTxWb2ljZVtdPiB7XHJcbiAgICBjb25zdCB2b2ljZXMgPSBhd2FpdCB0aGlzLmdldFZvaWNlcygpO1xyXG4gICAgcmV0dXJuIHZvaWNlcy5maWx0ZXIoKHZvaWNlKSA9PiB2b2ljZS5Mb2NhbGUuc3RhcnRzV2l0aChsb2NhbGUpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFZvaWNlc0J5R2VuZGVyKGdlbmRlcjogc3RyaW5nKTogUHJvbWlzZTxWb2ljZVtdPiB7XHJcbiAgICBjb25zdCB2b2ljZXMgPSBhd2FpdCB0aGlzLmdldFZvaWNlcygpO1xyXG4gICAgcmV0dXJuIHZvaWNlcy5maWx0ZXIoKHZvaWNlKSA9PiB2b2ljZS5HZW5kZXIgPT09IGdlbmRlcik7XHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZVVVSUQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBcInh4eHh4eHh4LXh4eHgteHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoL1t4eV0vZywgKGMpID0+IHtcclxuICAgICAgY29uc3QgciA9IChNYXRoLnJhbmRvbSgpICogMTYpIHwgMDtcclxuICAgICAgY29uc3QgdiA9IGMgPT09IFwieFwiID8gciA6IChyICYgMHgzKSB8IDB4ODtcclxuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVBpdGNoKHBpdGNoOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBwaXRjaCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICByZXR1cm4gcGl0Y2ggPj0gMCA/IGArJHtwaXRjaH1IemAgOiBgJHtwaXRjaH1IemA7XHJcbiAgICB9XHJcbiAgICBpZiAoIS9eWystXT9cXGR7MSwzfSg/OlxcLlxcZCspP0h6JC8udGVzdChwaXRjaCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgIFwiSW52YWxpZCBwaXRjaCBmb3JtYXQuIEV4cGVjdGVkICctMTAwSHogdG8gKzEwMEh6JyBvciBhIG51bWJlci5cIlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBpdGNoO1xyXG4gIH1cclxuXHJcbiAgdmFsaWRhdGVSYXRlKHJhdGU6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBsZXQgcmF0ZVZhbHVlOiBudW1iZXI7XHJcbiAgICBpZiAodHlwZW9mIHJhdGUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgcmF0ZVZhbHVlID0gcGFyc2VGbG9hdChyYXRlLnJlcGxhY2UoXCIlXCIsIFwiXCIpKTtcclxuICAgICAgaWYgKGlzTmFOKHJhdGVWYWx1ZSkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmF0ZSBmb3JtYXQuXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmF0ZVZhbHVlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHJldHVybiByYXRlVmFsdWUgPj0gMCA/IGArJHtyYXRlVmFsdWV9JWAgOiBgJHtyYXRlVmFsdWV9JWA7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVZvbHVtZSh2b2x1bWU6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBsZXQgdm9sdW1lVmFsdWU6IG51bWJlcjtcclxuICAgIGlmICh0eXBlb2Ygdm9sdW1lID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHZvbHVtZVZhbHVlID0gcGFyc2VJbnQodm9sdW1lLnJlcGxhY2UoXCIlXCIsIFwiXCIpLCAxMCk7XHJcbiAgICAgIGlmIChpc05hTih2b2x1bWVWYWx1ZSkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdm9sdW1lIGZvcm1hdC5cIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2b2x1bWVWYWx1ZSA9IHZvbHVtZTtcclxuICAgIH1cclxuICAgIGlmICh2b2x1bWVWYWx1ZSA8IC0xMDAgfHwgdm9sdW1lVmFsdWUgPiAxMDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVm9sdW1lIG91dCBvZiByYW5nZSAoLTEwMCUgdG8gMTAwJSkuXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGAke3ZvbHVtZVZhbHVlfSVgO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3ludGhlc2l6ZShcclxuICAgIHRleHQ6IHN0cmluZyxcclxuICAgIHZvaWNlOiBzdHJpbmcgPSBcImVuLVVTLUFuYU5ldXJhbFwiLFxyXG4gICAgb3B0aW9uczogRWRnZVRUU09wdGlvbnMgPSB7fVxyXG4gICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5hdWRpb19zdHJlYW0gPSBbXTtcclxuICAgICAgY29uc3QgcmVxX2lkID0gdGhpcy5nZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQoXHJcbiAgICAgICAgYCR7dGhpcy5Db25zdGFudHMuV1NTX1VSTH0/dHJ1c3RlZGNsaWVudHRva2VuPSR7dGhpcy5Db25zdGFudHMuVFJVU1RFRF9DTElFTlRfVE9LRU59JkNvbm5lY3Rpb25JZD0ke3JlcV9pZH1gXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMud3MuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcclxuXHJcbiAgICAgIGNvbnN0IFNTTUxfdGV4dCA9IHRoaXMuZ2V0U1NNTCh0ZXh0LCB2b2ljZSwgb3B0aW9ucyk7XHJcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XHJcbiAgICAgICAgICB0aGlzLndzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJTeW50aGVzaXMgdGltZW91dFwiKSk7XHJcbiAgICAgIH0sIDMwMDAwKTtcclxuXHJcbiAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMud3M/LnNlbmQodGhpcy5idWlsZFRUU0NvbmZpZ01lc3NhZ2UoKSk7XHJcbiAgICAgICAgY29uc3Qgc3BlZWNoTWVzc2FnZSA9XHJcbiAgICAgICAgICBgWC1SZXF1ZXN0SWQ6JHtyZXFfaWR9XFxyXFxuQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL3NzbWwreG1sXFxyXFxuYCArXHJcbiAgICAgICAgICBgWC1UaW1lc3RhbXA6JHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9WlxcclxcblBhdGg6c3NtbFxcclxcblxcclxcbiR7U1NNTF90ZXh0fWA7XHJcbiAgICAgICAgdGhpcy53cz8uc2VuZChzcGVlY2hNZXNzYWdlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzQXVkaW9EYXRhKGV2ZW50LmRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChlcnIpID0+IHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgaWYgKHRoaXMud3MgJiYgdGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xyXG4gICAgICAgICAgdGhpcy53cy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldFNTTUwodGV4dDogc3RyaW5nLCB2b2ljZTogc3RyaW5nLCBvcHRpb25zOiBFZGdlVFRTT3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5waXRjaCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBvcHRpb25zLnBpdGNoID0gb3B0aW9ucy5waXRjaC5yZXBsYWNlKFwiaHpcIiwgXCJIelwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHBpdGNoID0gdGhpcy52YWxpZGF0ZVBpdGNoKG9wdGlvbnMucGl0Y2ggPz8gMCk7XHJcbiAgICBjb25zdCByYXRlID0gdGhpcy52YWxpZGF0ZVJhdGUob3B0aW9ucy5yYXRlID8/IDApO1xyXG4gICAgY29uc3Qgdm9sdW1lID0gdGhpcy52YWxpZGF0ZVZvbHVtZShvcHRpb25zLnZvbHVtZSA/PyAwKTtcclxuICAgIHJldHVybiBgPHNwZWFrIHZlcnNpb249JzEuMCcgeG1sOmxhbmc9J2VuLVVTJz48dm9pY2UgbmFtZT0nJHt2b2ljZX0nPjxwcm9zb2R5IHBpdGNoPScke3BpdGNofScgcmF0ZT0nJHtyYXRlfScgdm9sdW1lPScke3ZvbHVtZX0nPiR7dGV4dH08L3Byb3NvZHk+PC92b2ljZT48L3NwZWFrPmA7XHJcbiAgfVxyXG5cclxuICBidWlsZFRUU0NvbmZpZ01lc3NhZ2UoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGBYLVRpbWVzdGFtcDoke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1aXFxyXFxuQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcXHJcXG5QYXRoOnNwZWVjaC5jb25maWdcXHJcXG5cXHJcXG5gICtcclxuICAgICAgYHtcImNvbnRleHRcIjp7XCJzeW50aGVzaXNcIjp7XCJhdWRpb1wiOntcIm1ldGFkYXRhb3B0aW9uc1wiOntcInNlbnRlbmNlQm91bmRhcnlFbmFibGVkXCI6ZmFsc2UsXCJ3b3JkQm91bmRhcnlFbmFibGVkXCI6dHJ1ZX0sXCJvdXRwdXRGb3JtYXRcIjpcImF1ZGlvLTI0a2h6LTQ4a2JpdHJhdGUtbW9uby1tcDNcIn19fX1gXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0F1ZGlvRGF0YShkYXRhOiBBcnJheUJ1ZmZlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIGlmIChkYXRhLmluY2x1ZGVzKFwiUGF0aDp0dXJuLmVuZFwiKSkge1xyXG4gICAgICAgIHRoaXMud3M/LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xyXG4gICAgY29uc3QgbmVlZGxlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFwiUGF0aDphdWRpb1xcclxcblwiKTtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMuaW5kZXhPZlN1YmFycmF5KGJ1ZmZlciwgbmVlZGxlKTtcclxuICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgIGNvbnN0IGF1ZGlvQ2h1bmsgPSBidWZmZXIuc3ViYXJyYXkoaWR4ICsgbmVlZGxlLmxlbmd0aCk7XHJcbiAgICAgIHRoaXMuYXVkaW9fc3RyZWFtLnB1c2goYXVkaW9DaHVuayk7XHJcbiAgICB9XHJcbiAgICBpZiAobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJ1ZmZlcikuaW5jbHVkZXMoXCJQYXRoOnR1cm4uZW5kXCIpKSB7XHJcbiAgICAgIHRoaXMud3M/LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbmRleE9mU3ViYXJyYXkoaGF5c3RhY2s6IFVpbnQ4QXJyYXksIG5lZWRsZTogVWludDhBcnJheSk6IG51bWJlciB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBoYXlzdGFjay5sZW5ndGggLSBuZWVkbGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IG1hdGNoID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuZWVkbGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoaGF5c3RhY2tbaSArIGpdICE9PSBuZWVkbGVbal0pIHtcclxuICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hdGNoKSByZXR1cm4gaTtcclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxuICB9XHJcblxyXG4gIHRvQmxvYihmb3JtYXQ6IHN0cmluZyA9IHRoaXMuYXVkaW9fZm9ybWF0KTogQmxvYiB7XHJcbiAgICBpZiAodGhpcy5hdWRpb19zdHJlYW0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlLiBEaWQgeW91IHJ1biBzeW50aGVzaXplKCkgZmlyc3Q/XCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBCbG9iKHRoaXMuYXVkaW9fc3RyZWFtLCB7IHR5cGU6IGBhdWRpby8ke2Zvcm1hdH1gIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgdG9CYXNlNjQoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IGJsb2IgPSB0aGlzLnRvQmxvYigpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PlxyXG4gICAgICAgIHJlc29sdmUoKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5zcGxpdChcIixcIilbMV0pO1xyXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZG93bmxvYWQoZmlsZW5hbWU6IHN0cmluZyA9IFwib3V0cHV0Lm1wM1wiKTogdm9pZCB7XHJcbiAgICBjb25zdCBibG9iID0gdGhpcy50b0Jsb2IoKTtcclxuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICBhLmhyZWYgPSB1cmw7XHJcbiAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XHJcbiAgICBhLmNsaWNrKCk7XHJcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbiAgfVxyXG59XHJcblxyXG4od2luZG93IGFzIHVua25vd24gYXMgeyBFZGdlVFRTOiB0eXBlb2YgRWRnZVRUUyB9KS5FZGdlVFRTID0gRWRnZVRUUztcclxuIiwKICAgICJpbXBvcnQgQVBJVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXBpLXV0aWxzXCI7XHJcbmltcG9ydCBBdWRpb1V0aWxzIGZyb20gXCIuL3V0aWxzL2F1ZGlvLXV0aWxzXCI7XHJcbmltcG9ydCBEb21VdGlscyBmcm9tIFwiLi91dGlscy9kb20tdXRpbHNcIjtcclxuaW1wb3J0IFlvdVR1YmVVdGlscyBmcm9tIFwiLi91dGlscy95b3V0dWJlLXV0aWxzXCI7XHJcbmltcG9ydCB7IEVkZ2VUVFMgfSBmcm9tIFwiLi91dGlscy9lZGdlLXR0cy13ZWJcIjtcclxuXHJcbmNsYXNzIFlvdVR1YmVSSk1vZGUge1xyXG4gIGlzUkpNb2RlQWN0aXZlOiBib29sZWFuO1xyXG4gIGN1cnJlbnRWaWRlb1RpdGxlOiBzdHJpbmc7XHJcbiAgbmV4dFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBvcmlnaW5hbFZvbHVtZTogbnVtYmVyO1xyXG4gIGlzUkpQbGF5aW5nOiBib29sZWFuO1xyXG4gIGF1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0IHwgbnVsbDtcclxuICBnYWluTm9kZTogR2Fpbk5vZGUgfCBudWxsO1xyXG4gIGxhc3RQcm9jZXNzZWRWaWRlbzogc3RyaW5nO1xyXG4gIGlzR2VuZXJhdGluZ0NvbW1lbnRhcnk6IGJvb2xlYW47XHJcbiAgdmlkZW9DaGFuZ2VUaW1lb3V0OiBhbnk7XHJcbiAgcHJvZ3Jlc3NJbnRlcnZhbDogYW55O1xyXG4gIHNjcmlwdEhpc3Rvcnk6IGFueVtdO1xyXG4gIGVkZ2VUVFM6IEVkZ2VUVFM7XHJcbiAgdHRzVm9pY2U6IHN0cmluZztcclxuICBnZW5lcmF0ZWRBdWRpb0RhdGE6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gXCJcIjtcclxuICAgIHRoaXMubmV4dFZpZGVvVGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IDEuMDtcclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuZ2Fpbk5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSBcIlwiO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgdGhpcy5zY3JpcHRIaXN0b3J5ID0gW107XHJcbiAgICB0aGlzLmVkZ2VUVFMgPSBuZXcgRWRnZVRUUygpOyAvLyBJbml0aWFsaXplIEVkZ2UgVFRTIGluc3RhbmNlXHJcbiAgICB0aGlzLnR0c1ZvaWNlID0gXCJlbi1VUy1BdmFNdWx0aWxpbmd1YWxOZXVyYWxcIjsgLy8gXCJlbi1VUy1BcmlhTmV1cmFsXCI7IC8vIERlZmF1bHQgVFRTIHZvaWNlXHJcbiAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIFN0b3JlIGdlbmVyYXRlZCBhdWRpbyBkYXRhXHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0KCkge1xyXG4gICAgYXdhaXQgdGhpcy5wcm9tcHRVc2VyRm9yQVBJS2V5cygpO1xyXG4gICAgdGhpcy5zZXR1cEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5kZXRlY3RQbGF5bGlzdCgpO1xyXG4gICAgLy8gdGhpcy5zZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIERvbVV0aWxzLmNyZWF0ZVJKTW9kZUJ1dHRvbih0aGlzLnRvZ2dsZVJKTW9kZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHByb21wdFVzZXJGb3JBUElLZXlzKCkge1xyXG4gICAgbGV0IHNldHRpbmdzID0gYXdhaXQgQVBJVXRpbHMuZ2V0QVBJU2V0dGluZ3MoKTtcclxuICAgIGlmICghc2V0dGluZ3MuZ2VtaW5pQXBpS2V5KSB7XHJcbiAgICAgIGxldCBnZW1pbmlBcGlLZXkgPSBwcm9tcHQoXCJFbnRlciB5b3VyIEdlbWluaSBBUEkgS2V5OlwiKTtcclxuICAgICAgaWYgKGdlbWluaUFwaUtleSkge1xyXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgZ2VtaW5pQXBpS2V5IH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KFwiR2V0IGZyZWUgQVBJIGtleSBmcm9tIGh0dHBzOi8vYWlzdHVkaW8uZ29vZ2xlLmNvbS9hcGlrZXlcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldHVwQXVkaW9Db250ZXh0KCkge1xyXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBBdWRpb1V0aWxzLmNyZWF0ZUF1ZGlvQ29udGV4dCgpO1xyXG4gICAgaWYgKHRoaXMuYXVkaW9Db250ZXh0KSB7XHJcbiAgICAgIHRoaXMuZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkZXRlY3RQbGF5bGlzdCgpIHtcclxuICAgIC8vIFVzZSBZb3VUdWJlIHV0aWxpdHkgZnVuY3Rpb25cclxuICAgIGlmIChcclxuICAgICAgWW91VHViZVV0aWxzLmlzUGxheWxpc3RQYWdlKCkgJiZcclxuICAgICAgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIilcclxuICAgICkge1xyXG4gICAgICBEb21VdGlscy5zaG93UkpNb2RlUHJvbXB0KHRoaXMudG9nZ2xlUkpNb2RlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0Q3VycmVudEFuZE5leHRUaXRsZXMoKSB7XHJcbiAgICAvLyBVc2UgWW91VHViZSB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSA9IFlvdVR1YmVVdGlscy5jbGVhblZpZGVvVGl0bGUoXHJcbiAgICAgIFlvdVR1YmVVdGlscy5nZXRDdXJyZW50VmlkZW9UaXRsZSgpXHJcbiAgICApO1xyXG4gICAgdGhpcy5uZXh0VmlkZW9UaXRsZSA9IFlvdVR1YmVVdGlscy5jbGVhblZpZGVvVGl0bGUoXHJcbiAgICAgIFlvdVR1YmVVdGlscy5nZXROZXh0VmlkZW9UaXRsZSgpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2VuZXJhdGVSSkNvbW1lbnRhcnkoKSB7XHJcbiAgICAvLyBQcmV2ZW50IG11bHRpcGxlIHNpbXVsdGFuZW91cyBjb21tZW50YXJ5IGdlbmVyYXRpb25zXHJcbiAgICBpZiAodGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5IHx8IHRoaXMuaXNSSlBsYXlpbmcpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJDb21tZW50YXJ5IGFscmVhZHkgaW4gcHJvZ3Jlc3MsIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgd2UndmUgYWxyZWFkeSBwcm9jZXNzZWQgdGhpcyB2aWRlb1xyXG4gICAgY29uc3QgdmlkZW9JZCA9IFlvdVR1YmVVdGlscy5leHRyYWN0VmlkZW9JZCgpIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGU7XHJcbiAgICBpZiAodmlkZW9JZCA9PT0gdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8pIHtcclxuICAgICAgY29uc29sZS5sb2coXCJBbHJlYWR5IHByb2Nlc3NlZCB0aGlzIHZpZGVvLCBza2lwcGluZy4uLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5jdXJyZW50VmlkZW9UaXRsZSB8fCB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlLnRyaW0oKSA9PT0gXCJcIikge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk5vIGN1cnJlbnQgdmlkZW8gdGl0bGUgZm91bmQsIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gdHJ1ZTtcclxuICAgIHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvID0gdmlkZW9JZDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBEb21VdGlscy5zaG93TG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuICAgICAgY29uc3QgY3VycmVudFNvbmdseXJpY3MgPSBhd2FpdCBBUElVdGlscy5jYWxsTHlyaWNzQVBJKFxyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGVcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFVzZSBBUEkgdXRpbGl0eSBmdW5jdGlvbnNcclxuICAgICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBBUElVdGlscy5nZXRBUElTZXR0aW5ncygpO1xyXG4gICAgICBjb25zdCBwcm9tcHQgPSBBUElVdGlscy5nZW5lcmF0ZVJKUHJvbXB0KFxyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUsXHJcbiAgICAgICAgdGhpcy5uZXh0VmlkZW9UaXRsZSxcclxuICAgICAgICBzZXR0aW5ncy5yalN0eWxlLFxyXG4gICAgICAgIHNldHRpbmdzLmNvbW1lbnRhcnlMZW5ndGgsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUhpc3RvcnkgPyB0aGlzLnNjcmlwdEhpc3Rvcnkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUNvbW1lbnRzID8gWW91VHViZVV0aWxzLmdldENvbW1lbnRzKCkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgY3VycmVudFNvbmdseXJpY3MsXHJcbiAgICAgICAgc2V0dGluZ3MuaG9zdE5hbWUsXHJcbiAgICAgICAgc2V0dGluZ3MucmFkaW9TdGF0aW9uXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBwcm9tcHQ6XCIsIHByb21wdCk7XHJcblxyXG4gICAgICBjb25zdCBzY3JpcHQgPSBhd2FpdCBBUElVdGlscy5jYWxsR2VtaW5pQVBJKFxyXG4gICAgICAgIHByb21wdCxcclxuICAgICAgICBzZXR0aW5ncy5nZW1pbmlBcGlLZXlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiR2VuZXJhdGVkIHNjcmlwdDpcIiwgc2NyaXB0KTtcclxuXHJcbiAgICAgIHRoaXMuc2NyaXB0SGlzdG9yeS5wdXNoKHNjcmlwdCk7XHJcblxyXG4gICAgICBsZXQgYXVkaW9EYXRhID0ge307XHJcbiAgICAgIGlmIChzZXR0aW5ncy5tdXJmQXBpS2V5KSB7XHJcbiAgICAgICAgLy8gVXNlIE11cmYgQVBJIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIC8vIGF1ZGlvRGF0YSBjb250YWlucyB0aGUgYXVkaW8gYmxvYiBhbmQgb3RoZXIgbWV0YWRhdGFcclxuICAgICAgICBhdWRpb0RhdGEgPSBhd2FpdCBBUElVdGlscy5jYWxsTXVyZkFQSShcclxuICAgICAgICAgIHNjcmlwdCxcclxuICAgICAgICAgIHNldHRpbmdzLm11cmZBcGlLZXksXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkLFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VTdHlsZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgTXVyZiBBUEkgaXMgbm90IGF2YWlsYWJsZSBvciB3ZSB3YW50IHRvIGZhbGxiYWNrIHRvIEVkZ2UgVFRTXHJcbiAgICAgICAgYXdhaXQgdGhpcy5lZGdlVFRTLnN5bnRoZXNpemUoXHJcbiAgICAgICAgICBzY3JpcHQsXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkIHx8IHRoaXMudHRzVm9pY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5lZGdlVFRTLnRvQmxvYigpLFxyXG4gICAgICAgICAgLy8gYXVkaW9Vcmw6IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5lZGdlVFRTLnRvQmxvYigpKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2cgdGhlIGNvbW1lbnRhcnlcclxuICAgICAgQVBJVXRpbHMubG9nQ29tbWVudGFyeShcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHRoaXMubmV4dFZpZGVvVGl0bGUsXHJcbiAgICAgICAgc2NyaXB0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IGF1ZGlvRGF0YTsgLy8gU3RvcmUgZ2VuZXJhdGVkIGF1ZGlvIGRhdGEgZm9yIGxhdGVyIHVzZVxyXG5cclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIlJKIENvbW1lbnRhcnkgZ2VuZXJhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcGxheVJKQ29tbWVudGFyeSgpIHtcclxuICAgIGNvbnN0IGF1ZGlvQmxvYiA9IHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhPy5hdWRpb0Jsb2I7XHJcblxyXG4gICAgaWYgKCFhdWRpb0Jsb2IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlIHRvIHBsYXkuXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNSSlBsYXlpbmcpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJSSiBhbHJlYWR5IHBsYXlpbmcsIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgdmlkZW8gPSBZb3VUdWJlVXRpbHMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXZpZGVvKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIHZpZGVvIGVsZW1lbnQgZm91bmQgb24gdGhlIHBhZ2UuXCIpO1xyXG4gICAgICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIER1Y2sgdGhlIFlvdVR1YmUgdmlkZW8gdm9sdW1lIHVzaW5nIHV0aWxpdHlcclxuICAgICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IGF3YWl0IEF1ZGlvVXRpbHMuZHVja1ZvbHVtZSh2aWRlbywgMC4xKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgcGxheSBSSiBhdWRpbyB1c2luZyB1dGlsaXR5XHJcbiAgICAgIGNvbnN0IHsgYXVkaW8sIGF1ZGlvVXJsIH0gPSBBdWRpb1V0aWxzLmNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYik7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgYXdhaXQgQXVkaW9VdGlscy5wbGF5QXVkaW8oYXVkaW8pLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBwbGF5YmFjayBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBsYXlpbmcgUkogY29tbWVudGFyeTpcIiwgZXJyb3IpO1xyXG4gICAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZVxyXG4gICAgICBpZiAodmlkZW8pIHtcclxuICAgICAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG4gICAgICB9XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIENsZWFyIGF1ZGlvIGRhdGEgYWZ0ZXIgcGxheWJhY2tcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCBhdWRpb1VybDogc3RyaW5nKSB7XHJcbiAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZSB1c2luZyB1dGlsaXR5XHJcbiAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwIGF1ZGlvIFVSTFxyXG4gICAgaWYgKGF1ZGlvVXJsKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYXVkaW9VcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKFwiUkogY29tbWVudGFyeSBjbGVhbnVwIGNvbXBsZXRlZFwiKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHRvZ2dsZVJKTW9kZSgpIHtcclxuICAgIHRoaXMuaXNSSk1vZGVBY3RpdmUgPSAhdGhpcy5pc1JKTW9kZUFjdGl2ZTtcclxuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIik7XHJcbiAgICBpZiAoIWJ1dHRvbikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiUkogTW9kZSBidXR0b24gbm90IGZvdW5kLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RvcCBSSiBNb2RlXCI7XHJcbiAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoNDVkZWcsICNmZjQ3NTcsICNmZjZiNmIpXCI7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRSSk1vZGUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RhcnQgUkogTW9kZVwiO1xyXG4gICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjZmY2YjZiLCAjNGVjZGM0KVwiO1xyXG4gICAgICB0aGlzLnN0b3BSSk1vZGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHN0YXJ0UkpNb2RlKCkge1xyXG4gICAgdGhpcy5nZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpO1xyXG4gICAgdGhpcy5zZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIHN0b3BSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvID0gXCJcIjtcclxuXHJcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0cyBhbmQgaW50ZXJ2YWxzXHJcbiAgICBpZiAodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlkZW9DaGFuZ2VUaW1lb3V0KTtcclxuICAgICAgdGhpcy52aWRlb0NoYW5nZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5wcm9ncmVzc0ludGVydmFsKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCBhbnkgbG9hZGluZyBpbmRpY2F0b3JzXHJcbiAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiUkogTW9kZSBzdG9wcGVkIGFuZCBjbGVhbmVkIHVwXCIpO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgLy8gUHJvZ3Jlc3MgY2hlY2sgaW50ZXJ2YWxcclxuXHJcbiAgICAvLyBNb25pdG9yIHZpZGVvIHByb2dyZXNzXHJcbiAgICBjb25zdCBjaGVja1ZpZGVvUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tWaWRlb1Byb2dyZXNzIGNhbGxlZFwiKTtcclxuICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgICAgIGlmICghdmlkZW8gfHwgIXRoaXMuaXNSSk1vZGVBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVSZW1haW5pbmcgPSB2aWRlby5kdXJhdGlvbiAtIHZpZGVvLmN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gZ2VuZXJhdGUgY29tbWVudGFyeSBhbmQga2VlcCBpdCByZWFkeSAxMCBzZWNvbmRzIGFmZXIgdmlkZW8gc3RhcnRzXHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA+IDEwICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSAmJlxyXG4gICAgICAgICF0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVJKQ29tbWVudGFyeSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFydCBjb21tZW50YXJ5IHdoZW4gMzAgc2Vjb25kcyByZW1haW4gYW5kIG5vdCBhbHJlYWR5IHBsYXlpbmdcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRpbWVSZW1haW5pbmcgPD0gMzAgJiZcclxuICAgICAgICAhdGhpcy5pc1JKUGxheWluZyAmJlxyXG4gICAgICAgICF0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnlcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5UkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHVwIHZpZGVvIHByb2dyZXNzIG1vbml0b3JpbmdcclxuICAgIGNvbnN0IHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9ncmVzc0ludGVydmFsKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrVmlkZW9Qcm9ncmVzcywgMTAwMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENsZWFyIHByb2dyZXNzIG1vbml0b3JpbmdcclxuXHJcbiAgICAvLyBTdGFydCBtb25pdG9yaW5nIHdoZW4gUkogbW9kZSBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIHdoZW4gcGFnZSBsb2Fkc1xyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBjb25zdCB5b3V0dWJlUkogPSBuZXcgWW91VHViZVJKTW9kZSgpO1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSiA9IHlvdXR1YmVSSjtcclxuICAgIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbiAgfSk7XHJcbn0gZWxzZSB7XHJcbiAgY29uc3QgeW91dHViZVJKID0gbmV3IFlvdVR1YmVSSk1vZGUoKTtcclxuICAod2luZG93IGFzIGFueSkueW91dHViZVJKID0geW91dHViZVJKO1xyXG4gIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbn1cclxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU0saUJBQWlCLFlBQVk7QUFBQSxFQUNqQyxPQUFPLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSTtBQUFBO0FBR3ZDLElBQU0sZUFBZTtBQUFBLEVBQ25CLFdBQ0U7QUFBQSxFQUNGLE9BQU87QUFBQSxFQUNQLFdBQ0U7QUFBQSxFQUNGLGNBQWM7QUFDaEI7QUFFQSxJQUFNLGVBQWU7QUFBQSxFQUNuQixPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixNQUFNO0FBQ1I7QUFHQSxTQUFTLGdCQUFnQixDQUN2QixhQUNBLFVBQ0EsT0FDQSxRQUNBLGVBQ0EsVUFDQSxtQkFDQSxVQUNBLGNBQ0E7QUFBQSxFQUNBLE1BQU0sYUFBYSxhQUFhLFVBQVUsYUFBYTtBQUFBLEVBQ3ZELE1BQU0sY0FBYyxhQUFhLFdBQVcsYUFBYTtBQUFBLEVBRXpELE1BQU0sWUFBWSxrQkFBa0I7QUFBQSxlQUN2QjtBQUFBLEVBRWIsT0FBTyxHQUFHLGNBQWMsZUFBZTtBQUFBO0FBQUEsRUFH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
