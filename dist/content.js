var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

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
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt2
          }
        ]
      }
    ]
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "callGemini", payload, apiKey }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call Gemini API"));
      }
      const data = response.data;
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return reject(new Error("Invalid response from Gemini API"));
      }
      resolve(data.candidates[0].content.parts[0].text);
    });
  });
}
async function callChatJimmyAPI(prompt2) {
  const payload = {
    messages: [
      {
        role: "system",
        content: "Generate commentary without expressions in the brackets"
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
  const payload = {
    text,
    voiceId,
    style
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "callMurf", payload, apiKey }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call Murf API"));
      }
      const data = response.data;
      const base64 = response.audioBase64;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0;i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      resolve({
        audioBlob: blob,
        duration: data.audioLengthInSeconds,
        remainingChars: data.remainingCharacterCount
      });
    });
  });
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
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "callLyrics", query }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call Lyrics API"));
      }
      const data = response.data;
      console.log("Lyrics API response:", data);
      resolve(data?.[0]?.plainLyrics);
    });
  });
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

// src/utils/google-tts.ts
class GoogleTTS {
  audioBlob = null;
  async synthesize(text, lang = "en") {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: "getTTSAudio",
        payload: { text, lang }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("TTS Runtime Error:", chrome.runtime.lastError);
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response || !response.success) {
          console.error("TTS API Error:", response?.error);
          return reject(new Error(response?.error || "Failed to get TTS audio"));
        }
        try {
          const base64Chunks = response.data;
          const audioChunks = base64Chunks.map((base64) => {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0;i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
          });
          this.audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
          resolve();
        } catch (error) {
          console.error("Error processing TTS audio data:", error);
          reject(error);
        }
      });
    });
  }
  toBlob() {
    if (!this.audioBlob) {
      throw new Error("No audio data available. Did you run synthesize() first?");
    }
    return this.audioBlob;
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
  googleTTS;
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
    this.googleTTS = new GoogleTTS;
    this.ttsVoice = "en";
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
        let lang = settings.voiceId || this.ttsVoice;
        if (lang.includes("-") && lang.split("-").length > 2) {
          lang = lang.split("-").slice(0, 2).join("-");
        }
        await this.googleTTS.synthesize(script, lang);
        audioData = {
          audioBlob: this.googleTTS.toBlob()
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

//# debugId=F45F108986E81B1364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi5cXHNyY1xcdXRpbHNcXGFwaS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcYXVkaW8tdXRpbHMudHMiLCAiLi5cXHNyY1xcdXRpbHNcXGRvbS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xceW91dHViZS11dGlscy50cyIsICIuLlxcc3JjXFx1dGlsc1xcZ29vZ2xlLXR0cy50cyIsICIuLlxcc3JjXFxjb250ZW50LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8vIEFQSS1yZWxhdGVkIHV0aWxpdHkgZnVuY3Rpb25zXHJcblxyXG4vLyBHZXQgc3RvcmVkIEFQSSBzZXR0aW5nc1xyXG5jb25zdCBnZXRBUElTZXR0aW5ncyA9IGFzeW5jICgpID0+IHtcclxuICByZXR1cm4gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoKTtcclxufTtcclxuXHJcbmNvbnN0IHN0eWxlUHJvbXB0cyA9IHtcclxuICBlbmVyZ2V0aWM6XHJcbiAgICBcIllvdSBhcmUgYSBoaWdoLWVuZXJneSByYWRpbyBESiB3aG8ncyBhYnNvbHV0ZWx5IHB1bXBlZCBhYm91dCBtdXNpYyFcIixcclxuICBjaGlsbDogXCJZb3UgYXJlIGEgbGFpZC1iYWNrIERKIHdpdGggYSBzbW9vdGgsIHJlbGF4ZWQgdmliZS5cIixcclxuICBzYXJjYXN0aWM6XHJcbiAgICBcIllvdSBhcmUgYSB3aXR0eSBESiB3aG8gYWRkcyBjbGV2ZXIgY29tbWVudGFyeSB3aXRoIGEgdG91Y2ggb2Ygc2FyY2FzbS5cIixcclxuICBwcm9mZXNzaW9uYWw6IFwiWW91IGFyZSBhIHByb2Zlc3Npb25hbCByYWRpbyBob3N0IHdpdGggcG9saXNoZWQgZGVsaXZlcnkuXCIsXHJcbn07XHJcblxyXG5jb25zdCBsZW5ndGhHdWlkZXMgPSB7XHJcbiAgc2hvcnQ6IFwiS2VlcCBpdCBicmllZiBhbmQgcHVuY2h5ICgyMC0zMCBzZWNvbmRzIHdoZW4gc3Bva2VuKVwiLFxyXG4gIG1lZGl1bTogXCJNb2RlcmF0ZSBsZW5ndGggd2l0aCBnb29kIGZsb3cgKDMwLTQ1IHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbiAgbG9uZzogXCJNb3JlIGRldGFpbGVkIGNvbW1lbnRhcnkgKDQ1LTYwIHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbn07XHJcblxyXG4vLyBHZW5lcmF0ZSBSSiBwcm9tcHQgYmFzZWQgb24gc2V0dGluZ3NcclxuZnVuY3Rpb24gZ2VuZXJhdGVSSlByb21wdChcclxuICBjdXJyZW50U29uZzogc3RyaW5nLFxyXG4gIG5leHRTb25nOiBzdHJpbmcgfCBudWxsLFxyXG4gIHN0eWxlOiBrZXlvZiB0eXBlb2Ygc3R5bGVQcm9tcHRzLFxyXG4gIGxlbmd0aDoga2V5b2YgdHlwZW9mIGxlbmd0aEd1aWRlcyxcclxuICBzY3JpcHRIaXN0b3J5OiBzdHJpbmcgfCBudWxsLFxyXG4gIGNvbW1lbnRzOiBzdHJpbmcgfCBudWxsLFxyXG4gIGN1cnJlbnRTb25nbHlyaWNzOiBzdHJpbmcgfCBudWxsLFxyXG4gIGhvc3ROYW1lOiBzdHJpbmcsXHJcbiAgcmFkaW9TdGF0aW9uOiBzdHJpbmdcclxuKSB7XHJcbiAgY29uc3QgYmFzZVByb21wdCA9IHN0eWxlUHJvbXB0c1tzdHlsZV0gfHwgc3R5bGVQcm9tcHRzLmVuZXJnZXRpYztcclxuICBjb25zdCBsZW5ndGhHdWlkZSA9IGxlbmd0aEd1aWRlc1tsZW5ndGhdIHx8IGxlbmd0aEd1aWRlcy5tZWRpdW07XHJcblxyXG4gIGNvbnN0IHJhZGlvSW5mbyA9IGBSYWRpbyBzdGF0aW9uOiAke3JhZGlvU3RhdGlvbn1cclxuICBIb3N0IG5hbWU6ICR7aG9zdE5hbWV9YDtcclxuXHJcbiAgcmV0dXJuIGAke2Jhc2VQcm9tcHR9ICR7bGVuZ3RoR3VpZGV9ICR7cmFkaW9JbmZvfS4gXHJcblxyXG4ke3NjcmlwdEhpc3RvcnkgJiYgXCJIZXJlJ3Mgc29tZSBvZiB5b3VyIHByZXZpb3VzIGNvbW1lbnRhcnk6IFxcblwiICsgc2NyaXB0SGlzdG9yeVxyXG4gICAgfVxyXG4ke2NvbW1lbnRzICYmIFwiSGVyZSBhcmUgc29tZSBjb21tZW50cyBmcm9tIHZpZXdlcnM6IFxcblwiICsgY29tbWVudHN9XHJcblxyXG5DdXJyZW50IHNvbmc6IFwiJHtjdXJyZW50U29uZ31cIlxyXG5cclxuJHtjdXJyZW50U29uZ2x5cmljcyA/IGBDdXJyZW50IHNvbmcgTHlyaWNzOiAke2N1cnJlbnRTb25nbHlyaWNzfWAgOiBcIlwifVxyXG5cclxuJHtuZXh0U29uZyA/IGBOZXh0IFNvbmc6IFwiJHtuZXh0U29uZ31cImAgOiBcIlwifVxyXG5cclxuSW1wb3J0YW50IGd1aWRlbGluZXM6XHJcbkFWT0lEIHVzaW5nIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IGFyZSBub3QgZGV0ZWN0ZWQgYnkgVFRTIGluIHRoZSBjb21tZW50YXJ5LCB5b3VyIG91dHB1dCB3aWxsIGJlIHVzZWQgdG8gZ2VuZXJhdGUgYXVkaW8uXHJcbkFWT0lEIHNheWluZyBBbHJpZ2h0IGFuZCBPa2F5IG9rYXkgb3Igc2ltaWxhciBwaHJhc2VzIGF0IHRoZSBiZWdpbmluZy4gQ29vayB1cCBzb21lIG5ldyBpbnRyb3NcclxuQ1JFQVRFIGVuZ2FnaW5nIGNvbW1lbnRhcnkgdGhhdCBjb25uZWN0cyB3aXRoIGxpc3RlbmVycy4gQmUgbmF0dXJhbCwgZW50aHVzaWFzdGljLCBhbmQgYWRkIHBlcnNvbmFsaXR5LiBEb24ndCByZWFkIHRoZSBzb25nIHRpdGxlcyAtIG1ha2UgaXQgY29udmVyc2F0aW9uYWwgYW5kIGZ1biFcclxuT05MWSByZXNwb25kIHdpdGggdGhlIGNvbW1lbnRhcnkgdGV4dCwgZG8gbm90IGluY2x1ZGUgYW55IGFkZGl0aW9uYWwgaW5zdHJ1Y3Rpb25zIG9yIGV4cGxhbmF0aW9ucy5cclxuYDtcclxufVxyXG5cclxuLy8gQ2FsbCBHZW1pbmkgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbEdlbWluaUFQSShwcm9tcHQ6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpIHtcclxuICBpZiAoIWFwaUtleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2VtaW5pIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWRcIik7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgY29udGVudHM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHBhcnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IHByb21wdCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHsgYWN0aW9uOiBcImNhbGxHZW1pbmlcIiwgcGF5bG9hZCwgYXBpS2V5IH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgR2VtaW5pIEFQSVwiKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIGlmICghZGF0YS5jYW5kaWRhdGVzIHx8ICFkYXRhLmNhbmRpZGF0ZXNbMF0gfHwgIWRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50KSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgcmVzcG9uc2UgZnJvbSBHZW1pbmkgQVBJXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc29sdmUoZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQucGFydHNbMF0udGV4dCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIENhbGwgQ2hhdEppbW15IEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxDaGF0SmltbXlBUEkocHJvbXB0OiBzdHJpbmcpIHtcclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgbWVzc2FnZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHJvbGU6IFwic3lzdGVtXCIsXHJcbiAgICAgICAgY29udGVudDogXCJHZW5lcmF0ZSBjb21tZW50YXJ5IHdpdGhvdXQgZXhwcmVzc2lvbnMgaW4gdGhlIGJyYWNrZXRzXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgY2hhdE9wdGlvbnM6IHtcclxuICAgICAgc2VsZWN0ZWRNb2RlbDogXCJsbGFtYTMuMS04QlwiLFxyXG4gICAgICBzeXN0ZW1Qcm9tcHQ6IHByb21wdCxcclxuICAgICAgdG9wSzogMixcclxuICAgIH0sXHJcbiAgICBhdHRhY2htZW50OiBudWxsLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICB7IGFjdGlvbjogXCJjYWxsQ2hhdEppbW15XCIsIHBheWxvYWQgfSxcclxuICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBDaGF0SmltbXkgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGV4dCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgLy8gVGhlIHJlc3BvbnNlIG1pZ2h0IGNvbnRhaW4gc3RhdHMgYWZ0ZXIgPHxzdGF0c3w+LiBXZSB3YW50IHRoZSBwYXJ0IGJlZm9yZSBpdC5cclxuICAgICAgICBjb25zdCBzdGF0c0luZGV4ID0gdGV4dC5pbmRleE9mKFwiPHxzdGF0c3w+XCIpO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0ZXh0O1xyXG4gICAgICAgIGlmIChzdGF0c0luZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgcmVzdWx0ID0gdGV4dC5zdWJzdHJpbmcoMCwgc3RhdHNJbmRleCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDbGVhbiB1cCBwb3RlbnRpYWwgcXVvdGVzIGFuZCB3aGl0ZXNwYWNlXHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQudHJpbSgpLnJlcGxhY2UoL15cInxcIiQvZywgXCJcIikucmVwbGFjZSgvXFxcXG4vZywgXCJcXG5cIikudHJpbSgpKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gQ2FsbCBNdXJmLmFpIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxNdXJmQVBJKFxyXG4gIHRleHQ6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICB2b2ljZUlkID0gXCJlbi1VUy1uYXRhbGllXCIsXHJcbiAgc3R5bGUgPSBcIlByb21vXCJcclxuKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIk11cmYuYWkgQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgdm9pY2VJZDogdm9pY2VJZCxcclxuICAgIHN0eWxlOiBzdHlsZSxcclxuICB9O1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8eyBhdWRpb0Jsb2I6IEJsb2I7IGR1cmF0aW9uOiBudW1iZXI7IHJlbWFpbmluZ0NoYXJzOiBudW1iZXIgfT4oXHJcbiAgICAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICAgIHsgYWN0aW9uOiBcImNhbGxNdXJmXCIsIHBheWxvYWQsIGFwaUtleSB9LFxyXG4gICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgTXVyZiBBUElcIilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IHJlc3BvbnNlLmF1ZGlvQmFzZTY0O1xyXG5cclxuICAgICAgICAgIC8vIENvbnZlcnQgYmFzZTY0IHRvIEJsb2JcclxuICAgICAgICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcclxuICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBieXRlc1tpXSA9IGJpbmFyeVN0cmluZy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtieXRlc10sIHsgdHlwZTogXCJhdWRpby9tcGVnXCIgfSk7XHJcblxyXG4gICAgICAgICAgcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgIGF1ZGlvQmxvYjogYmxvYixcclxuICAgICAgICAgICAgZHVyYXRpb246IGRhdGEuYXVkaW9MZW5ndGhJblNlY29uZHMsXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYXJzOiBkYXRhLnJlbWFpbmluZ0NoYXJhY3RlckNvdW50LFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICk7XHJcbn1cclxuXHJcbi8vIExvZyBjb21tZW50YXJ5IGZvciBleHBvcnQgZmVhdHVyZVxyXG5mdW5jdGlvbiBsb2dDb21tZW50YXJ5KGN1cnJlbnRTb25nOiBzdHJpbmcsIG5leHRTb25nOiBzdHJpbmcsIHNjcmlwdDogc3RyaW5nKSB7XHJcbiAgY2hyb21lLnJ1bnRpbWVcclxuICAgIC5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIGFjdGlvbjogXCJsb2dDb21tZW50YXJ5XCIsXHJcbiAgICAgIGN1cnJlbnRTb25nLFxyXG4gICAgICBuZXh0U29uZyxcclxuICAgICAgc2NyaXB0LFxyXG4gICAgfSlcclxuICAgIC5jYXRjaChjb25zb2xlLmVycm9yKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2FsbEx5cmljc0FQSShxdWVyeTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICB7IGFjdGlvbjogXCJjYWxsTHlyaWNzXCIsIHF1ZXJ5IH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgTHlyaWNzIEFQSVwiKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTHlyaWNzIEFQSSByZXNwb25zZTpcIiwgZGF0YSk7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhPy5bMF0/LnBsYWluTHlyaWNzKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgQVBJVXRpbHMgPSB7XHJcbiAgY2FsbE11cmZBUEksXHJcbiAgY2FsbEdlbWluaUFQSSxcclxuICBjYWxsQ2hhdEppbW15QVBJLFxyXG4gIGNhbGxMeXJpY3NBUEksXHJcbiAgbG9nQ29tbWVudGFyeSxcclxuICBnZXRBUElTZXR0aW5ncyxcclxuICBnZW5lcmF0ZVJKUHJvbXB0LFxyXG59O1xyXG5cclxuLy8gTWFrZSBpdCBnbG9iYWxseSBhdmFpbGFibGVcclxuKHdpbmRvdyBhcyBhbnkpLkFQSVV0aWxzID0gQVBJVXRpbHM7XHJcbmV4cG9ydCBkZWZhdWx0IEFQSVV0aWxzO1xyXG4iLAogICAgIi8vIEV4dGVuZCBXaW5kb3cgaW50ZXJmYWNlIHRvIGluY2x1ZGUgd2Via2l0QXVkaW9Db250ZXh0XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgIHdlYmtpdEF1ZGlvQ29udGV4dDogdHlwZW9mIEF1ZGlvQ29udGV4dDtcclxuICB9XHJcbn1cclxuXHJcbi8vIEF1ZGlvLXJlbGF0ZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuY29uc3QgQXVkaW9VdGlscyA9IHtcclxuICAvLyBDcmVhdGUgYXVkaW8gY29udGV4dCB3aXRoIGZhbGxiYWNrc1xyXG4gIGNyZWF0ZUF1ZGlvQ29udGV4dCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCApKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gY29udGV4dCBjcmVhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gU21vb3RoIHZvbHVtZSB0cmFuc2l0aW9uXHJcbiAgYXN5bmMgc21vb3RoVm9sdW1lVHJhbnNpdGlvbihcclxuICAgIHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LFxyXG4gICAgdGFyZ2V0Vm9sdW1lOiBudW1iZXIsXHJcbiAgICBkdXJhdGlvbiA9IDIwMFxyXG4gICkge1xyXG4gICAgaWYgKCF2aWRlbykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0Vm9sdW1lID0gdmlkZW8udm9sdW1lO1xyXG4gICAgY29uc3Qgc3RlcHMgPSAyMDtcclxuICAgIGNvbnN0IHZvbHVtZVN0ZXAgPSAodGFyZ2V0Vm9sdW1lIC0gc3RhcnRWb2x1bWUpIC8gc3RlcHM7XHJcbiAgICBjb25zdCB0aW1lU3RlcCA9IGR1cmF0aW9uIC8gc3RlcHM7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGVwczsgaSsrKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld1ZvbHVtZSA9IE1hdGgubWF4KFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIE1hdGgubWluKDEsIHN0YXJ0Vm9sdW1lICsgdm9sdW1lU3RlcCAqIChpICsgMSkpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB2aWRlby52b2x1bWUgPSBuZXdWb2x1bWU7XHJcbiAgICAgIH0sIHRpbWVTdGVwICogaSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gRHVjayB2b2x1bWUgc21vb3RobHlcclxuICBhc3luYyBkdWNrVm9sdW1lKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCBkdWNrTGV2ZWwgPSAwLjMpIHtcclxuICAgIGlmICghdmlkZW8pIHJldHVybiAxO1xyXG5cclxuICAgIGNvbnN0IG9yaWdpbmFsVm9sdW1lID0gdmlkZW8udm9sdW1lO1xyXG4gICAgYXdhaXQgdGhpcy5zbW9vdGhWb2x1bWVUcmFuc2l0aW9uKHZpZGVvLCBkdWNrTGV2ZWwpO1xyXG4gICAgcmV0dXJuIG9yaWdpbmFsVm9sdW1lO1xyXG4gIH0sXHJcblxyXG4gIC8vIFJlc3RvcmUgdm9sdW1lIHNtb290aGx5XHJcbiAgYXN5bmMgcmVzdG9yZVZvbHVtZSh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgdGFyZ2V0Vm9sdW1lOiBudW1iZXIpIHtcclxuICAgIGlmICghdmlkZW8gfHwgdGFyZ2V0Vm9sdW1lID09PSB1bmRlZmluZWQpIHJldHVybjtcclxuICAgIGF3YWl0IHRoaXMuc21vb3RoVm9sdW1lVHJhbnNpdGlvbih2aWRlbywgdGFyZ2V0Vm9sdW1lLCAzMDApO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0ZSBhdWRpbyBlbGVtZW50IHdpdGggZXJyb3IgaGFuZGxpbmdcclxuICBjcmVhdGVBdWRpbyhhdWRpb0Jsb2I6IEJsb2IpIHtcclxuICAgIGNvbnN0IGF1ZGlvVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChhdWRpb0Jsb2IpO1xyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oYXVkaW9VcmwpO1xyXG5cclxuICAgIC8vIEFkZCBlcnJvciBoYW5kbGluZ1xyXG4gICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChlcnJvcikgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gcGxheWJhY2sgZXJyb3I6XCIsIGVycm9yKTtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChhdWRpb1VybCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geyBhdWRpbywgYXVkaW9VcmwgfTtcclxuICB9LFxyXG5cclxuICAvLyBQbGF5IGF1ZGlvIHdpdGggcHJvbWlzZVxyXG4gIHBsYXlBdWRpbyhhdWRpbzogSFRNTEF1ZGlvRWxlbWVudCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIHJlc29sdmUpO1xyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgcmVqZWN0KTtcclxuXHJcbiAgICAgIGF1ZGlvLnBsYXkoKS5jYXRjaChyZWplY3QpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5BdWRpb1V0aWxzID0gQXVkaW9VdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQXVkaW9VdGlscztcclxuIiwKICAgICJjb25zdCBzaG93TG9hZGluZ0luZGljYXRvciA9ICgpID0+IHtcclxuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1sb2FkaW5nXCIpKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIGxvYWRpbmcuaWQgPSBcInJqLWxvYWRpbmdcIjtcclxuICBsb2FkaW5nLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2PlxyXG4gICAgICAgIDxzcGFuPvCfjpnvuI8gUHJlcGFyaW5nIFJKIGNvbW1lbnRhcnkuLi48L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgbG9hZGluZy5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICAgIHRvcDogMTQwcHg7XHJcbiAgICAgIHJpZ2h0OiAyMHB4O1xyXG4gICAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuOCk7XHJcbiAgICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgICAgcGFkZGluZzogMTBweCAxNXB4O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcclxuICAgICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgYDtcclxuXHJcbiAgLy8gQWRkIHNwaW5uZXIgQ1NTIGlmIG5vdCBleGlzdHNcclxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3Bpbm5lci1zdHlsZXNcIikpIHtcclxuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xyXG4gICAgc3R5bGUuaWQgPSBcInNwaW5uZXItc3R5bGVzXCI7XHJcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGBcclxuICAgICAgICAuc3Bpbm5lciB7XHJcbiAgICAgICAgICB3aWR0aDogMTZweDtcclxuICAgICAgICAgIGhlaWdodDogMTZweDtcclxuICAgICAgICAgIGJvcmRlcjogMnB4IHNvbGlkICMzMzM7XHJcbiAgICAgICAgICBib3JkZXItdG9wOiAycHggc29saWQgI2ZmZjtcclxuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICAgIGFuaW1hdGlvbjogc3BpbiAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgYDtcclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gIH1cclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkaW5nKTtcclxufTtcclxuXHJcbmNvbnN0IGhpZGVMb2FkaW5nSW5kaWNhdG9yID0gKCkgPT4ge1xyXG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWxvYWRpbmdcIik7XHJcbiAgaWYgKGxvYWRpbmcpIGxvYWRpbmcucmVtb3ZlKCk7XHJcbn07XHJcblxyXG5jb25zdCBzaG93RXJyb3JNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xyXG4gIGNvbnN0IGVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBlcnJvci5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICAgIHRvcDogMTQwcHg7XHJcbiAgICAgIHJpZ2h0OiAyMHB4O1xyXG4gICAgICB6LWluZGV4OiA5OTk5O1xyXG4gICAgICBiYWNrZ3JvdW5kOiAjZmY0NzU3O1xyXG4gICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgIHBhZGRpbmc6IDEwcHggMTVweDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgbWF4LXdpZHRoOiAzNTBweDtcclxuICAgIGA7XHJcbiAgZXJyb3IudGV4dENvbnRlbnQgPSBg4p2MICR7bWVzc2FnZX1gO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVycm9yKTtcclxuXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBlcnJvci5yZW1vdmUoKTtcclxuICB9LCA1MDAwKTtcclxufTtcclxuXHJcbmNvbnN0IGNyZWF0ZVJKTW9kZUJ1dHRvbiA9ICh0b2dnbGVSSk1vZGU6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcclxuICBidXR0b24uaWQgPSBcInJqLW1vZGUtYnV0dG9uXCI7XHJcbiAgYnV0dG9uLmlubmVySFRNTCA9IFwi8J+Ome+4jyBTdGFydCBSSiBNb2RlXCI7XHJcbiAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgICAgdG9wOiAxMDBweDtcclxuICAgICAgcmlnaHQ6IDIwcHg7XHJcbiAgICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgI2ZmNmI2YiwgIzRlY2RjNCk7XHJcbiAgICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgICAgYm9yZGVyOiBub25lO1xyXG4gICAgICBwYWRkaW5nOiAxMnB4IDIwcHg7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDI1cHg7XHJcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XHJcbiAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjIpO1xyXG4gICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBlYXNlO1xyXG4gICAgYDtcclxuXHJcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0b2dnbGVSSk1vZGUoKSk7XHJcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgKCkgPT4ge1xyXG4gICAgYnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoMS4wNSlcIjtcclxuICB9KTtcclxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsICgpID0+IHtcclxuICAgIGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKDEpXCI7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxufTtcclxuXHJcbmNvbnN0IGRpc21pc3NOb3RpZmljYXRpb24gPSAoKSA9PiB7XHJcbiAgY29uc3Qgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLW5vdGlmaWNhdGlvblwiKTtcclxuICBpZiAobm90aWZpY2F0aW9uKSB7XHJcbiAgICBub3RpZmljYXRpb24uc3R5bGUuYW5pbWF0aW9uID0gXCJzbGlkZU91dFJpZ2h0IDAuM3MgZWFzZS1pblwiO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcclxuICAgIH0sIDMwMCk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgc2hvd1JKTW9kZVByb21wdCA9ICh0b2dnbGVSSk1vZGU6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgLy8gQ3JlYXRlIGEgbW9yZSBwcm9taW5lbnQgbm90aWZpY2F0aW9uIGZvciBwbGF5bGlzdCBkZXRlY3Rpb25cclxuICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIG5vdGlmaWNhdGlvbi5pZCA9IFwicmotbW9kZS1ub3RpZmljYXRpb25cIjtcclxuICBub3RpZmljYXRpb24uaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxMHB4O1wiPlxyXG4gICAgICAgIDxzcGFuPvCfjpnvuI88L3NwYW4+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxzdHJvbmc+UGxheWxpc3QgRGV0ZWN0ZWQhPC9zdHJvbmc+XHJcbiAgICAgICAgICA8YnI+XHJcbiAgICAgICAgICA8c21hbGw+UmVhZHkgdG8gYWRkIHNvbWUgUkogbWFnaWM/PC9zbWFsbD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiZW5hYmxlLXJqLW1vZGVcIiBzdHlsZT1cIlxyXG4gICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjNENBRjUwLCAjNDVhMDQ5KTtcclxuICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgICAgICAgIGJvcmRlcjogbm9uZTtcclxuICAgICAgICAgIHBhZGRpbmc6IDhweCAxNnB4O1xyXG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcclxuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IGF1dG87XHJcbiAgICAgICAgXCI+RW5hYmxlIFJKIE1vZGU8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiZGlzbWlzcy1yai1wcm9tcHRcIiBzdHlsZT1cIlxyXG4gICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgICAgICAgICBjb2xvcjogIzY2NjtcclxuICAgICAgICAgIGJvcmRlcjogbm9uZTtcclxuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcclxuICAgICAgICAgIHBhZGRpbmc6IDVweDtcclxuICAgICAgICBcIj7DlzwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIGA7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICAgIHRvcDogODBweDtcclxuICAgICAgcmlnaHQ6IDIwcHg7XHJcbiAgICAgIHotaW5kZXg6IDEwMDAwO1xyXG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpO1xyXG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XHJcbiAgICAgIGNvbG9yOiAjMzMzO1xyXG4gICAgICBwYWRkaW5nOiAxNXB4IDIwcHg7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XHJcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLDAsMCwwLjEpO1xyXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMik7XHJcbiAgICAgIG1heC13aWR0aDogMzUwcHg7XHJcbiAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcclxuICAgICAgYW5pbWF0aW9uOiBzbGlkZUluUmlnaHQgMC4zcyBlYXNlLW91dDtcclxuICAgIGA7XHJcblxyXG4gIC8vIEFkZCBDU1MgYW5pbWF0aW9uXHJcbiAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtc3R5bGVzXCIpKSB7XHJcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcclxuICAgIHN0eWxlLmlkID0gXCJyai1tb2RlLXN0eWxlc1wiO1xyXG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXHJcbiAgICAgICAgQGtleWZyYW1lcyBzbGlkZUluUmlnaHQge1xyXG4gICAgICAgICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDAlKTsgb3BhY2l0eTogMDsgfVxyXG4gICAgICAgICAgdG8geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IG9wYWNpdHk6IDE7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQGtleWZyYW1lcyBzbGlkZU91dFJpZ2h0IHtcclxuICAgICAgICAgIGZyb20geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IG9wYWNpdHk6IDE7IH1cclxuICAgICAgICAgIHRvIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMCUpOyBvcGFjaXR5OiAwOyB9XHJcbiAgICAgICAgfVxyXG4gICAgICBgO1xyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XHJcblxyXG4gIC8vIEV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIG5vdGlmaWNhdGlvblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5hYmxlLXJqLW1vZGVcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XHJcbiAgICB0b2dnbGVSSk1vZGUoKTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnRcclxuICAgIC5nZXRFbGVtZW50QnlJZChcImRpc21pc3MtcmotcHJvbXB0XCIpXHJcbiAgICA/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGRpc21pc3NOb3RpZmljYXRpb24oKTtcclxuICAgIH0pO1xyXG5cclxuICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgMTAgc2Vjb25kc1xyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgZGlzbWlzc05vdGlmaWNhdGlvbigpO1xyXG4gIH0sIDEwMDAwKTtcclxufTtcclxuXHJcbmNvbnN0IERvbVV0aWxzID0ge1xyXG4gIHNob3dFcnJvck1lc3NhZ2UsXHJcbiAgc2hvd1JKTW9kZVByb21wdCxcclxuICBjcmVhdGVSSk1vZGVCdXR0b24sXHJcbiAgZGlzbWlzc05vdGlmaWNhdGlvbixcclxuICBzaG93TG9hZGluZ0luZGljYXRvcixcclxuICBoaWRlTG9hZGluZ0luZGljYXRvcixcclxufTtcclxuXHJcbih3aW5kb3cgYXMgYW55KS5Eb21VdGlscyA9IERvbVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBEb21VdGlscztcclxuIiwKICAgICIvLyBZb3VUdWJlLXNwZWNpZmljIHV0aWxpdHkgZnVuY3Rpb25zXHJcbmNvbnN0IFlvdVR1YmVVdGlscyA9IHtcclxuICBleHRyYWN0VmlkZW9JZCgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldChcInZcIik7XHJcbiAgICByZXR1cm4gdmlkZW9JZCB8fCBudWxsO1xyXG4gIH0sXHJcblxyXG4gIGdldEN1cnJlbnRWaWRlb1RpdGxlKCkge1xyXG4gICAgY29uc3QgdGl0bGVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCJoMS50aXRsZS5zdHlsZS1zY29wZS55dGQtdmlkZW8tcHJpbWFyeS1pbmZvLXJlbmRlcmVyXCJcclxuICAgICk7XHJcbiAgICByZXR1cm4gdGl0bGVFbGVtZW50Py50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGVzY3JpcHRpb24oKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBkb2N1bWVudD8ucXVlcnlTZWxlY3RvcihcIiNkZXNjcmlwdGlvbi1pbm5lclwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiXHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIGdldENvbW1lbnRzKCkge1xyXG4gICAgbGV0IGFsbENvbW1lbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNjb21tZW50LWNvbnRhaW5lclwiKS5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgIGxldCB0eHQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIjZXhwYW5kZXJcIik/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICAgICAgYWxsQ29tbWVudHMucHVzaCh0eHQpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYWxsQ29tbWVudHM7XHJcbiAgfSxcclxuXHJcbiAgZ2V0TmV4dFZpZGVvVGl0bGUoKSB7XHJcbiAgICBjb25zdCBwbGF5bGlzdEl0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXlsaXN0LWl0ZW1zW3NlbGVjdGVkXVwiKTtcclxuICAgIGNvbnN0IG5leHRWaWRlb0VsZW1lbnQgPSAoXHJcbiAgICAgIHBsYXlsaXN0SXRlbT8ubmV4dFNpYmxpbmcgYXMgRWxlbWVudFxyXG4gICAgKT8ucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZVwiKTtcclxuXHJcbiAgICByZXR1cm4gbmV4dFZpZGVvRWxlbWVudD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiO1xyXG4gIH0sXHJcblxyXG4gIGlzUGxheWxpc3RQYWdlKCkge1xyXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICAgIHJldHVybiB1cmxQYXJhbXMuaGFzKFwibGlzdFwiKTtcclxuICB9LFxyXG5cclxuICBnZXRQbGF5bGlzdElkKCkge1xyXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICAgIHJldHVybiB1cmxQYXJhbXMuZ2V0KFwibGlzdFwiKTtcclxuICB9LFxyXG5cclxuICBnZXRWaWRlb0VsZW1lbnQoKSB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInZpZGVvXCIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENsZWFuIHVwIFlvdVR1YmUgdmlkZW8gdGl0bGVzIChyZW1vdmUgY29tbW9uIHN1ZmZpeGVzKVxyXG4gIGNsZWFuVmlkZW9UaXRsZSh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGl0bGVcclxuICAgICAgLnJlcGxhY2UoL1xcKE9mZmljaWFsLio/XFwpL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvXFwoTXVzaWMgVmlkZW9cXCkvZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cXFtPZmZpY2lhbC4qP1xcXS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoLy0gVG9waWMkLywgXCJcIilcclxuICAgICAgLnRyaW0oKTtcclxuICB9LFxyXG5cclxuICAvLyBHZXQgdmlkZW8gZHVyYXRpb25cclxuICBnZXRWaWRlb0R1cmF0aW9uKCkge1xyXG4gICAgY29uc3QgdmlkZW8gPSB0aGlzLmdldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIHZpZGVvID8gdmlkZW8uZHVyYXRpb24gOiAwO1xyXG4gIH0sXHJcblxyXG4gIC8vIENoZWNrIGlmIHZpZGVvIGlzIHBsYXlpbmdcclxuICBpc1ZpZGVvUGxheWluZygpIHtcclxuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHJldHVybiB2aWRlbyA/ICF2aWRlby5wYXVzZWQgJiYgIXZpZGVvLmVuZGVkIDogZmFsc2U7XHJcbiAgfSxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5Zb3VUdWJlVXRpbHMgPSBZb3VUdWJlVXRpbHM7XHJcbmV4cG9ydCBkZWZhdWx0IFlvdVR1YmVVdGlscztcclxuIiwKICAgICJcbmV4cG9ydCBjbGFzcyBHb29nbGVUVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUodGV4dDogc3RyaW5nLCBsYW5nOiBzdHJpbmcgPSBcImVuXCIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiZ2V0VFRTQXVkaW9cIixcbiAgICAgICAgICBwYXlsb2FkOiB7IHRleHQsIGxhbmcgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRUUyBSdW50aW1lIEVycm9yOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVFRTIEFQSSBFcnJvcjpcIiwgcmVzcG9uc2U/LmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBnZXQgVFRTIGF1ZGlvXCIpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0Q2h1bmtzOiBzdHJpbmdbXSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBjb25zdCBhdWRpb0NodW5rcyA9IGJhc2U2NENodW5rcy5tYXAoKGJhc2U2NCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9CbG9iID0gbmV3IEJsb2IoYXVkaW9DaHVua3MsIHsgdHlwZTogXCJhdWRpby9tcGVnXCIgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIFRUUyBhdWRpbyBkYXRhOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRvQmxvYigpOiBCbG9iIHtcbiAgICBpZiAoIXRoaXMuYXVkaW9CbG9iKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdWRpbyBkYXRhIGF2YWlsYWJsZS4gRGlkIHlvdSBydW4gc3ludGhlc2l6ZSgpIGZpcnN0P1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXVkaW9CbG9iO1xuICB9XG59XG4iLAogICAgImltcG9ydCBBUElVdGlscyBmcm9tIFwiLi91dGlscy9hcGktdXRpbHNcIjtcclxuaW1wb3J0IEF1ZGlvVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXVkaW8tdXRpbHNcIjtcclxuaW1wb3J0IERvbVV0aWxzIGZyb20gXCIuL3V0aWxzL2RvbS11dGlsc1wiO1xyXG5pbXBvcnQgWW91VHViZVV0aWxzIGZyb20gXCIuL3V0aWxzL3lvdXR1YmUtdXRpbHNcIjtcclxuaW1wb3J0IHsgR29vZ2xlVFRTIH0gZnJvbSBcIi4vdXRpbHMvZ29vZ2xlLXR0c1wiO1xyXG5cclxuY2xhc3MgWW91VHViZVJKTW9kZSB7XHJcbiAgaXNSSk1vZGVBY3RpdmU6IGJvb2xlYW47XHJcbiAgY3VycmVudFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBuZXh0VmlkZW9UaXRsZTogc3RyaW5nO1xyXG4gIG9yaWdpbmFsVm9sdW1lOiBudW1iZXI7XHJcbiAgaXNSSlBsYXlpbmc6IGJvb2xlYW47XHJcbiAgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQgfCBudWxsO1xyXG4gIGdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgbGFzdFByb2Nlc3NlZFZpZGVvOiBzdHJpbmc7XHJcbiAgaXNHZW5lcmF0aW5nQ29tbWVudGFyeTogYm9vbGVhbjtcclxuICB2aWRlb0NoYW5nZVRpbWVvdXQ6IGFueTtcclxuICBwcm9ncmVzc0ludGVydmFsOiBhbnk7XHJcbiAgc2NyaXB0SGlzdG9yeTogYW55W107XHJcbiAgZ29vZ2xlVFRTOiBHb29nbGVUVFM7XHJcbiAgdHRzVm9pY2U6IHN0cmluZztcclxuICBnZW5lcmF0ZWRBdWRpb0RhdGE6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gXCJcIjtcclxuICAgIHRoaXMubmV4dFZpZGVvVGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IDEuMDtcclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuZ2Fpbk5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSBcIlwiO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgdGhpcy5zY3JpcHRIaXN0b3J5ID0gW107XHJcbiAgICB0aGlzLmdvb2dsZVRUUyA9IG5ldyBHb29nbGVUVFMoKTsgLy8gSW5pdGlhbGl6ZSBHb29nbGUgVFRTIGluc3RhbmNlXHJcbiAgICB0aGlzLnR0c1ZvaWNlID0gXCJlblwiOyAvLyBEZWZhdWx0IFRUUyB2b2ljZSAobGFuZ3VhZ2UgY29kZSBmb3IgR29vZ2xlIFRUUylcclxuICAgIHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhID0gbnVsbDsgLy8gU3RvcmUgZ2VuZXJhdGVkIGF1ZGlvIGRhdGFcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGluaXQoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnByb21wdFVzZXJGb3JBUElLZXlzKCk7XHJcbiAgICB0aGlzLnNldHVwQXVkaW9Db250ZXh0KCk7XHJcbiAgICB0aGlzLmRldGVjdFBsYXlsaXN0KCk7XHJcbiAgICAvLyB0aGlzLnNldHVwVmlkZW9FdmVudExpc3RlbmVycygpO1xyXG4gICAgRG9tVXRpbHMuY3JlYXRlUkpNb2RlQnV0dG9uKHRoaXMudG9nZ2xlUkpNb2RlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcHJvbXB0VXNlckZvckFQSUtleXMoKSB7XHJcbiAgICBsZXQgc2V0dGluZ3MgPSBhd2FpdCBBUElVdGlscy5nZXRBUElTZXR0aW5ncygpO1xyXG4gICAgaWYgKCFzZXR0aW5ncy5nZW1pbmlBcGlLZXkpIHtcclxuICAgICAgbGV0IGdlbWluaUFwaUtleSA9IHByb21wdChcIkVudGVyIHlvdXIgR2VtaW5pIEFQSSBLZXk6XCIpO1xyXG4gICAgICBpZiAoZ2VtaW5pQXBpS2V5KSB7XHJcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBnZW1pbmlBcGlLZXkgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWxlcnQoXCJHZXQgZnJlZSBBUEkga2V5IGZyb20gaHR0cHM6Ly9haXN0dWRpby5nb29nbGUuY29tL2FwaWtleVwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0dXBBdWRpb0NvbnRleHQoKSB7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IEF1ZGlvVXRpbHMuY3JlYXRlQXVkaW9Db250ZXh0KCk7XHJcbiAgICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRldGVjdFBsYXlsaXN0KCkge1xyXG4gICAgLy8gVXNlIFlvdVR1YmUgdXRpbGl0eSBmdW5jdGlvblxyXG4gICAgaWYgKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuaXNQbGF5bGlzdFBhZ2UoKSAmJlxyXG4gICAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLWJ1dHRvblwiKVxyXG4gICAgKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dSSk1vZGVQcm9tcHQodGhpcy50b2dnbGVSSk1vZGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpIHtcclxuICAgIC8vIFVzZSBZb3VUdWJlIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldEN1cnJlbnRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgICB0aGlzLm5leHRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldE5leHRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZW5lcmF0ZVJKQ29tbWVudGFyeSgpIHtcclxuICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgc2ltdWx0YW5lb3VzIGNvbW1lbnRhcnkgZ2VuZXJhdGlvbnNcclxuICAgIGlmICh0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgfHwgdGhpcy5pc1JKUGxheWluZykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkNvbW1lbnRhcnkgYWxyZWFkeSBpbiBwcm9ncmVzcywgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB3ZSd2ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGlzIHZpZGVvXHJcbiAgICBjb25zdCB2aWRlb0lkID0gWW91VHViZVV0aWxzLmV4dHJhY3RWaWRlb0lkKCkgfHwgdGhpcy5jdXJyZW50VmlkZW9UaXRsZTtcclxuICAgIGlmICh2aWRlb0lkID09PSB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgdmlkZW8sIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRWaWRlb1RpdGxlIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gY3VycmVudCB2aWRlbyB0aXRsZSBmb3VuZCwgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSB0cnVlO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSB2aWRlb0lkO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgICBjb25zdCBjdXJyZW50U29uZ2x5cmljcyA9IGF3YWl0IEFQSVV0aWxzLmNhbGxMeXJpY3NBUEkoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gVXNlIEFQSSB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IEFQSVV0aWxzLmdldEFQSVNldHRpbmdzKCk7XHJcbiAgICAgIGNvbnN0IHByb21wdCA9IEFQSVV0aWxzLmdlbmVyYXRlUkpQcm9tcHQoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSxcclxuICAgICAgICB0aGlzLm5leHRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHNldHRpbmdzLnJqU3R5bGUsXHJcbiAgICAgICAgc2V0dGluZ3MuY29tbWVudGFyeUxlbmd0aCxcclxuICAgICAgICBzZXR0aW5ncy5pbmNsdWRlSGlzdG9yeSA/IHRoaXMuc2NyaXB0SGlzdG9yeS5qb2luKFwiXFxuXCIpIDogXCJcIixcclxuICAgICAgICBzZXR0aW5ncy5pbmNsdWRlQ29tbWVudHMgPyBZb3VUdWJlVXRpbHMuZ2V0Q29tbWVudHMoKS5qb2luKFwiXFxuXCIpIDogXCJcIixcclxuICAgICAgICBjdXJyZW50U29uZ2x5cmljcyBhcyBzdHJpbmcsXHJcbiAgICAgICAgc2V0dGluZ3MuaG9zdE5hbWUsXHJcbiAgICAgICAgc2V0dGluZ3MucmFkaW9TdGF0aW9uXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBwcm9tcHQ6XCIsIHByb21wdCk7XHJcblxyXG4gICAgICBjb25zdCBzY3JpcHQgPSBhd2FpdCBBUElVdGlscy5jYWxsQ2hhdEppbW15QVBJKHByb21wdCk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBzY3JpcHQ6XCIsIHNjcmlwdCk7XHJcblxyXG4gICAgICB0aGlzLnNjcmlwdEhpc3RvcnkucHVzaChzY3JpcHQpO1xyXG5cclxuICAgICAgbGV0IGF1ZGlvRGF0YSA9IHt9O1xyXG4gICAgICBpZiAoc2V0dGluZ3MubXVyZkFwaUtleSkge1xyXG4gICAgICAgIC8vIFVzZSBNdXJmIEFQSSBpZiBhdmFpbGFibGVcclxuICAgICAgICAvLyBhdWRpb0RhdGEgY29udGFpbnMgdGhlIGF1ZGlvIGJsb2IgYW5kIG90aGVyIG1ldGFkYXRhXHJcbiAgICAgICAgYXVkaW9EYXRhID0gYXdhaXQgQVBJVXRpbHMuY2FsbE11cmZBUEkoXHJcbiAgICAgICAgICBzY3JpcHQsXHJcbiAgICAgICAgICBzZXR0aW5ncy5tdXJmQXBpS2V5LFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VJZCxcclxuICAgICAgICAgIHNldHRpbmdzLnZvaWNlU3R5bGVcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIE11cmYgQVBJIGlzIG5vdCBhdmFpbGFibGUgb3Igd2Ugd2FudCB0byBmYWxsYmFjayB0byBHb29nbGUgVFRTXHJcbiAgICAgICAgbGV0IGxhbmcgPSBzZXR0aW5ncy52b2ljZUlkIHx8IHRoaXMudHRzVm9pY2U7XHJcbiAgICAgICAgLy8gSWYgaXQgbG9va3MgbGlrZSBhbiBFZGdlIFRUUyB2b2ljZSBJRCAoZS5nLiwgZW4tVVMtQXJpYU5ldXJhbCksIGV4dHJhY3QgdGhlIGxhbmcgcGFydFxyXG4gICAgICAgIGlmIChsYW5nLmluY2x1ZGVzKFwiLVwiKSAmJiBsYW5nLnNwbGl0KFwiLVwiKS5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICBsYW5nID0gbGFuZy5zcGxpdChcIi1cIikuc2xpY2UoMCwgMikuam9pbihcIi1cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLmdvb2dsZVRUUy5zeW50aGVzaXplKHNjcmlwdCwgbGFuZyk7XHJcbiAgICAgICAgYXVkaW9EYXRhID0ge1xyXG4gICAgICAgICAgYXVkaW9CbG9iOiB0aGlzLmdvb2dsZVRUUy50b0Jsb2IoKSxcclxuICAgICAgICAgIC8vIGF1ZGlvVXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuZ29vZ2xlVFRTLnRvQmxvYigpKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2cgdGhlIGNvbW1lbnRhcnlcclxuICAgICAgQVBJVXRpbHMubG9nQ29tbWVudGFyeShcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHRoaXMubmV4dFZpZGVvVGl0bGUsXHJcbiAgICAgICAgc2NyaXB0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IGF1ZGlvRGF0YTsgLy8gU3RvcmUgZ2VuZXJhdGVkIGF1ZGlvIGRhdGEgZm9yIGxhdGVyIHVzZVxyXG5cclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIlJKIENvbW1lbnRhcnkgZ2VuZXJhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcGxheVJKQ29tbWVudGFyeSgpIHtcclxuICAgIGNvbnN0IGF1ZGlvQmxvYiA9IHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhPy5hdWRpb0Jsb2I7XHJcblxyXG4gICAgaWYgKCFhdWRpb0Jsb2IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlIHRvIHBsYXkuXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNSSlBsYXlpbmcpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJSSiBhbHJlYWR5IHBsYXlpbmcsIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IHRydWU7XHJcblxyXG4gICAgY29uc3QgdmlkZW8gPSBZb3VUdWJlVXRpbHMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXZpZGVvKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIHZpZGVvIGVsZW1lbnQgZm91bmQgb24gdGhlIHBhZ2UuXCIpO1xyXG4gICAgICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIER1Y2sgdGhlIFlvdVR1YmUgdmlkZW8gdm9sdW1lIHVzaW5nIHV0aWxpdHlcclxuICAgICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IGF3YWl0IEF1ZGlvVXRpbHMuZHVja1ZvbHVtZSh2aWRlbywgMC4xKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgcGxheSBSSiBhdWRpbyB1c2luZyB1dGlsaXR5XHJcbiAgICAgIGNvbnN0IHsgYXVkaW8sIGF1ZGlvVXJsIH0gPSBBdWRpb1V0aWxzLmNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYik7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIGVycm9yOlwiLCBlcnJvcik7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgYXdhaXQgQXVkaW9VdGlscy5wbGF5QXVkaW8oYXVkaW8pLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBwbGF5YmFjayBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHBsYXlpbmcgUkogY29tbWVudGFyeTpcIiwgZXJyb3IpO1xyXG4gICAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZVxyXG4gICAgICBpZiAodmlkZW8pIHtcclxuICAgICAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG4gICAgICB9XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIENsZWFyIGF1ZGlvIGRhdGEgYWZ0ZXIgcGxheWJhY2tcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCBhdWRpb1VybDogc3RyaW5nKSB7XHJcbiAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIHZvbHVtZSB1c2luZyB1dGlsaXR5XHJcbiAgICBhd2FpdCBBdWRpb1V0aWxzLnJlc3RvcmVWb2x1bWUodmlkZW8sIHRoaXMub3JpZ2luYWxWb2x1bWUpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwIGF1ZGlvIFVSTFxyXG4gICAgaWYgKGF1ZGlvVXJsKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoYXVkaW9VcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKFwiUkogY29tbWVudGFyeSBjbGVhbnVwIGNvbXBsZXRlZFwiKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHRvZ2dsZVJKTW9kZSgpIHtcclxuICAgIHRoaXMuaXNSSk1vZGVBY3RpdmUgPSAhdGhpcy5pc1JKTW9kZUFjdGl2ZTtcclxuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIik7XHJcbiAgICBpZiAoIWJ1dHRvbikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiUkogTW9kZSBidXR0b24gbm90IGZvdW5kLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RvcCBSSiBNb2RlXCI7XHJcbiAgICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJsaW5lYXItZ3JhZGllbnQoNDVkZWcsICNmZjQ3NTcsICNmZjZiNmIpXCI7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRSSk1vZGUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBcIvCfjpnvuI8gU3RhcnQgUkogTW9kZVwiO1xyXG4gICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjZmY2YjZiLCAjNGVjZGM0KVwiO1xyXG4gICAgICB0aGlzLnN0b3BSSk1vZGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHN0YXJ0UkpNb2RlKCkge1xyXG4gICAgdGhpcy5nZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpO1xyXG4gICAgdGhpcy5zZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIHN0b3BSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvID0gXCJcIjtcclxuXHJcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0cyBhbmQgaW50ZXJ2YWxzXHJcbiAgICBpZiAodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlkZW9DaGFuZ2VUaW1lb3V0KTtcclxuICAgICAgdGhpcy52aWRlb0NoYW5nZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5wcm9ncmVzc0ludGVydmFsKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCBhbnkgbG9hZGluZyBpbmRpY2F0b3JzXHJcbiAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiUkogTW9kZSBzdG9wcGVkIGFuZCBjbGVhbmVkIHVwXCIpO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgLy8gUHJvZ3Jlc3MgY2hlY2sgaW50ZXJ2YWxcclxuXHJcbiAgICAvLyBNb25pdG9yIHZpZGVvIHByb2dyZXNzXHJcbiAgICBjb25zdCBjaGVja1ZpZGVvUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tWaWRlb1Byb2dyZXNzIGNhbGxlZFwiKTtcclxuICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgICAgIGlmICghdmlkZW8gfHwgIXRoaXMuaXNSSk1vZGVBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVSZW1haW5pbmcgPSB2aWRlby5kdXJhdGlvbiAtIHZpZGVvLmN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gZ2VuZXJhdGUgY29tbWVudGFyeSBhbmQga2VlcCBpdCByZWFkeSAxMCBzZWNvbmRzIGFmZXIgdmlkZW8gc3RhcnRzXHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA+IDEwICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSAmJlxyXG4gICAgICAgICF0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVJKQ29tbWVudGFyeSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFydCBjb21tZW50YXJ5IHdoZW4gMzAgc2Vjb25kcyByZW1haW4gYW5kIG5vdCBhbHJlYWR5IHBsYXlpbmdcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRpbWVSZW1haW5pbmcgPD0gMzAgJiZcclxuICAgICAgICAhdGhpcy5pc1JKUGxheWluZyAmJlxyXG4gICAgICAgICF0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnlcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5UkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHVwIHZpZGVvIHByb2dyZXNzIG1vbml0b3JpbmdcclxuICAgIGNvbnN0IHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9ncmVzc0ludGVydmFsKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrVmlkZW9Qcm9ncmVzcywgMTAwMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENsZWFyIHByb2dyZXNzIG1vbml0b3JpbmdcclxuXHJcbiAgICAvLyBTdGFydCBtb25pdG9yaW5nIHdoZW4gUkogbW9kZSBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIHdoZW4gcGFnZSBsb2Fkc1xyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBjb25zdCB5b3V0dWJlUkogPSBuZXcgWW91VHViZVJKTW9kZSgpO1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSiA9IHlvdXR1YmVSSjtcclxuICAgIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbiAgfSk7XHJcbn0gZWxzZSB7XHJcbiAgY29uc3QgeW91dHViZVJKID0gbmV3IFlvdVR1YmVSSk1vZGUoKTtcclxuICAod2luZG93IGFzIGFueSkueW91dHViZVJKID0geW91dHViZVJKO1xyXG4gIGNvbnNvbGUubG9nKHlvdXR1YmVSSik7XHJcbn1cclxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxJQUFNLGlCQUFpQixZQUFZO0FBQUEsRUFDakMsT0FBTyxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUk7QUFBQTtBQUd2QyxJQUFNLGVBQWU7QUFBQSxFQUNuQixXQUNFO0FBQUEsRUFDRixPQUFPO0FB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
