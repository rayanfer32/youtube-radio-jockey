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
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
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
var DEFAULT_SETTINGS = {
  geminiApiKey: "",
  murfApiKey: "",
  fishApiKey: "",
  openRouterApiKey: "",
  openRouterModel: "recursive/flint-v1.0:free",
  llmProvider: "openrouter",
  ttsProvider: "fish-audio",
  rjStyle: "sarcastic",
  commentaryLength: "short",
  voiceId: "ba1a38946dea44609fc4a8fe6113ed88",
  voiceStyle: "Promo",
  includeHistory: false,
  includeComments: false,
  autoStart: false,
  volumeDucking: 50,
  hostName: "Alexis",
  radioStation: "97.7 Youtube FM"
};
var getAPISettings = async () => {
  const stored = await chrome.storage.sync.get();
  return { ...DEFAULT_SETTINGS, ...stored };
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
  const resolvedHostName = hostName || DEFAULT_SETTINGS.hostName;
  const resolvedRadioStation = radioStation || DEFAULT_SETTINGS.radioStation;
  const radioInfo = `Radio station: ${resolvedRadioStation}
Host name: ${resolvedHostName}`;
  const systemPrompt = `${basePrompt} ${lengthGuide}. ${radioInfo}.

Important guidelines:
- AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
- AVOID expressions in brackets or parentheses.
- AVOID saying Alright and Okay okay or similar phrases at the beginning. Cook up new intros.
- CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
- ONLY respond with the commentary text, do not include any additional instructions or explanations.`.trim();
  let currentTask = `Current song: "${currentSong}"`;
  if (currentSonglyrics) {
    currentTask += `
Current song Lyrics: ${currentSonglyrics}`;
  }
  if (nextSong) {
    currentTask += `
Upcoming Song: "${nextSong}"`;
  }
  if (comments) {
    currentTask += `
Viewer comments: ${comments}`;
  }
  if (scriptHistory) {
    currentTask += `
Previous commentary history:
${scriptHistory}`;
  }
  return { systemPrompt, currentTask };
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
async function callChatJimmyAPI(systemPromptOrObj, currentTaskArg) {
  let systemPrompt;
  let currentTask;
  if (typeof systemPromptOrObj === "object") {
    systemPrompt = systemPromptOrObj.systemPrompt;
    currentTask = systemPromptOrObj.currentTask;
  } else if (currentTaskArg !== undefined) {
    systemPrompt = systemPromptOrObj;
    currentTask = currentTaskArg;
  } else {
    systemPrompt = systemPromptOrObj;
    currentTask = systemPromptOrObj;
  }
  const payload = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: currentTask }
    ],
    chatOptions: {
      selectedModel: "llama3.1-8B",
      systemPrompt,
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
async function callFishAudioAPI(text, apiKey, referenceId = "ba1a38946dea44609fc4a8fe6113ed88") {
  if (!apiKey) {
    throw new Error("Fish Audio API key not configured");
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: "callFishAudio",
      text,
      referenceId,
      apiKey
    }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call Fish Audio API"));
      }
      const base64 = response.audioBase64;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0;i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mp3" });
      resolve({ audioBlob: blob });
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
async function callOpenRouterAPI(systemPrompt, currentTask, apiKey, model) {
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured. Please add it in extension settings.");
  }
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: currentTask }
  ];
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: "callOpenRouter",
      apiKey,
      model: model || "recursive/flint-v1.0:free",
      messages
    }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response || !response.success) {
        return reject(new Error(response?.error || "Failed to call OpenRouter API"));
      }
      resolve(response.data.trim().replace(/^"|"$/g, "").replace(/\\n/g, `
`).trim());
    });
  });
}
async function callLLM(systemPrompt, currentTask, settings) {
  const currentSettings = settings || await getAPISettings();
  const provider = currentSettings.llmProvider || "openrouter";
  if (provider === "openrouter") {
    return callOpenRouterAPI(systemPrompt, currentTask, currentSettings.openRouterApiKey, currentSettings.openRouterModel);
  } else if (provider === "gemini") {
    return callGeminiAPI(`${systemPrompt}

${currentTask}`, currentSettings.geminiApiKey);
  } else {
    return callChatJimmyAPI(systemPrompt, currentTask);
  }
}
var APIUtils = {
  callMurfAPI,
  callFishAudioAPI,
  callGeminiAPI,
  callChatJimmyAPI,
  callOpenRouterAPI,
  callLLM,
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
var injectHardwareStyles = () => {
  if (document.getElementById("rj-hardware-styles"))
    return;
  const style = document.createElement("style");
  style.id = "rj-hardware-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;700&display=swap');

    .rj-hw-root {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
    }

    .rj-hw-mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }

    .rj-hw-bevel {
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85);
    }

    .rj-hw-recessed {
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.05);
    }

    .rj-glow-cyan {
      box-shadow: 0 0 12px rgba(0, 210, 196, 0.5), inset 0 0 6px rgba(0, 210, 196, 0.3);
    }

    .rj-glow-amber {
      box-shadow: 0 0 12px rgba(255, 158, 27, 0.5), inset 0 0 6px rgba(255, 158, 27, 0.3);
    }

    @keyframes rjPing {
      0% { transform: scale(1); opacity: 0.8; }
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }

    @keyframes rjSlideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes rjSlideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(120%); opacity: 0; }
    }

    @keyframes rjEqualizer {
      0%, 100% { height: 4px; }
      50% { height: 14px; }
    }

    .rj-eq-bar-1 { animation: rjEqualizer 0.8s ease-in-out infinite; }
    .rj-eq-bar-2 { animation: rjEqualizer 0.8s ease-in-out 0.25s infinite; }
    .rj-eq-bar-3 { animation: rjEqualizer 0.8s ease-in-out 0.5s infinite; }
  `;
  document.head.appendChild(style);
};
var createRJModeButton = (toggleRJMode) => {
  injectHardwareStyles();
  if (document.getElementById("rj-mode-button"))
    return;
  const button = document.createElement("button");
  button.id = "rj-mode-button";
  button.className = "rj-hw-root rj-hw-bevel";
  button.style.cssText = `
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 99999;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  `;
  button.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 22px; height: 22px; border-radius: 4px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 11px;">\uD83C\uDF99️</span>
      </div>
      <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #94a3b8; letter-spacing: 0.14em; text-transform: uppercase;">YOUTUBE RJ // KONTROL</span>
        <span id="rj-btn-label" style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #f8fafc;">START RJ MODE</span>
      </div>
    </div>
    <div style="position: relative; width: 10px; height: 10px; margin-left: 4px; display: flex; align-items: center; justify-content: center;">
      <div id="rj-btn-ping" style="display: none; position: absolute; inset: 0; border-radius: 50%; background: #00D2C4; animation: rjPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div id="rj-btn-led" style="width: 7px; height: 7px; border-radius: 50%; background: #475569; border: 1px solid #334155;"></div>
    </div>
  `;
  button.addEventListener("click", () => toggleRJMode());
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-1px)";
    button.style.borderColor = "#363C47";
  });
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    if (!button.dataset.active) {
      button.style.borderColor = "#272B33";
    }
  });
  document.body.appendChild(button);
};
var updateRJModeButton = (isActive) => {
  const button = document.getElementById("rj-mode-button");
  if (!button)
    return;
  const label = document.getElementById("rj-btn-label");
  const led = document.getElementById("rj-btn-led");
  const ping = document.getElementById("rj-btn-ping");
  if (isActive) {
    button.dataset.active = "true";
    button.style.background = "linear-gradient(180deg, #101c20 0%, #0a1316 100%)";
    button.style.borderColor = "#00D2C4";
    button.style.boxShadow = "0 0 16px rgba(0,210,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)";
    if (label) {
      label.textContent = "ON AIR // ACTIVE";
      label.style.color = "#00D2C4";
    }
    if (led) {
      led.style.background = "#00D2C4";
      led.style.borderColor = "#fff";
      led.style.boxShadow = "0 0 8px #00D2C4";
    }
    if (ping)
      ping.style.display = "block";
  } else {
    delete button.dataset.active;
    button.style.background = "linear-gradient(180deg, #181A1E 0%, #111215 100%)";
    button.style.borderColor = "#272B33";
    button.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)";
    if (label) {
      label.textContent = "START RJ MODE";
      label.style.color = "#f8fafc";
    }
    if (led) {
      led.style.background = "#475569";
      led.style.borderColor = "#334155";
      led.style.boxShadow = "none";
    }
    if (ping)
      ping.style.display = "none";
  }
};
var showLoadingIndicator = () => {
  injectHardwareStyles();
  if (document.getElementById("rj-loading"))
    return;
  const loading = document.createElement("div");
  loading.id = "rj-loading";
  loading.className = "rj-hw-root rj-hw-bevel";
  loading.style.cssText = `
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 99999;
    background: #08090A;
    border: 1px solid #272B33;
    border-radius: 6px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    animation: rjSlideInRight 0.25s ease-out;
  `;
  loading.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 2.5px; height: 16px; padding-bottom: 1px;">
      <div class="rj-eq-bar-1" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-2" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-3" style="width: 3px; background: #FF9E1B; border-radius: 1px; box-shadow: 0 0 4px #FF9E1B;"></div>
    </div>
    <div style="display: flex; flex-direction: column; line-height: 1.2;">
      <span class="rj-hw-mono" style="font-size: 7.5px; color: #00D2C4; letter-spacing: 0.12em; text-transform: uppercase;">SYNTHESIZING COMMENTARY</span>
      <span class="rj-hw-mono" style="font-size: 9.5px; font-weight: 700; color: #f1f5f9; letter-spacing: 0.04em;">BUFFERING NEXT TRACK...</span>
    </div>
  `;
  document.body.appendChild(loading);
};
var hideLoadingIndicator = () => {
  const loading = document.getElementById("rj-loading");
  if (loading)
    loading.remove();
};
var showErrorMessage = (message) => {
  injectHardwareStyles();
  const existing = document.getElementById("rj-error-message");
  if (existing)
    existing.remove();
  const error = document.createElement("div");
  error.id = "rj-error-message";
  error.className = "rj-hw-root rj-hw-bevel";
  error.style.cssText = `
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 100000;
    background: #14080a;
    border: 1px solid #ef4444;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    color: #fecaca;
    padding: 10px 16px;
    border-radius: 8px;
    max-width: 360px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    animation: rjSlideInRight 0.25s ease-out;
  `;
  error.innerHTML = `
    <span style="font-size: 14px; line-height: 1; margin-top: 2px;">⚠️</span>
    <div style="display: flex; flex-direction: column; line-height: 1.25; flex: 1;">
      <span class="rj-hw-mono" style="font-size: 8px; color: #f87171; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">BROADCAST ENGINE FAULT</span>
      <span style="font-size: 10.5px; color: #f8fafc; margin-top: 3px; word-break: break-word;">${message}</span>
    </div>
  `;
  document.body.appendChild(error);
  setTimeout(() => {
    error.style.animation = "rjSlideOutRight 0.25s ease-in forwards";
    setTimeout(() => error.remove(), 250);
  }, 5000);
};
var dismissNotification = () => {
  const notification = document.getElementById("rj-mode-notification");
  if (notification) {
    notification.style.animation = "rjSlideOutRight 0.25s ease-in forwards";
    setTimeout(() => {
      notification.remove();
    }, 250);
  }
};
var showRJModePrompt = (toggleRJMode) => {
  injectHardwareStyles();
  if (document.getElementById("rj-mode-notification"))
    return;
  const notification = document.createElement("div");
  notification.id = "rj-mode-notification";
  notification.className = "rj-hw-root rj-hw-bevel";
  notification.style.cssText = `
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 100000;
    width: 350px;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    overflow: hidden;
    color: #f1f5f9;
    animation: rjSlideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  notification.innerHTML = `
    <!-- Top Hardware Accent Bar -->
    <div style="background: #08090A; border-bottom: 1px solid #272B33; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 5px; height: 5px; border-radius: 50%; background: #FF9E1B; box-shadow: 0 0 4px #FF9E1B;"></span>
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #FF9E1B; font-weight: 700; letter-spacing: 0.12em;">PLAYLIST DETECTED // FREQ LOCK</span>
      </div>
      <button id="dismiss-rj-prompt" style="background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; padding: 0 2px; line-height: 1;">✕</button>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 6px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 16px;">\uD83C\uDF99️</span>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #f8fafc; letter-spacing: 0.02em;">YOUTUBE RJ READY</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">Auto-transition commentary engine</div>
        </div>
      </div>

      <button id="enable-rj-mode" style="
        background: #00D2C4;
        color: #060709;
        border: none;
        padding: 6px 12px;
        border-radius: 5px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0,210,196,0.35);
        transition: all 0.15s ease;
        white-space: nowrap;
      ">ENABLE RJ</button>
    </div>
  `;
  document.body.appendChild(notification);
  const enableBtn = document.getElementById("enable-rj-mode");
  enableBtn?.addEventListener("mouseenter", () => {
    enableBtn.style.background = "#12e6d8";
    enableBtn.style.boxShadow = "0 0 14px rgba(0,210,196,0.55)";
  });
  enableBtn?.addEventListener("mouseleave", () => {
    enableBtn.style.background = "#00D2C4";
    enableBtn.style.boxShadow = "0 0 10px rgba(0,210,196,0.35)";
  });
  enableBtn?.addEventListener("click", () => {
    dismissNotification();
    toggleRJMode();
  });
  document.getElementById("dismiss-rj-prompt")?.addEventListener("click", () => {
    dismissNotification();
  });
  setTimeout(() => {
    dismissNotification();
  }, 12000);
};
var DomUtils = {
  showErrorMessage,
  showRJModePrompt,
  createRJModeButton,
  updateRJModeButton,
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

// tests/google-tts.ts
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

// src/utils/fish-audio.ts
class FishAudioTTS {
  audioBlob = null;
  async synthesize(text, apiKey, referenceId = "ba1a38946dea44609fc4a8fe6113ed88") {
    if (!apiKey) {
      throw new Error("Fish Audio API key not configured");
    }
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: "callFishAudio",
        text,
        referenceId,
        apiKey
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Fish Audio Runtime Error:", chrome.runtime.lastError);
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response || !response.success) {
          console.error("Fish Audio API Error:", response?.error);
          return reject(new Error(response?.error || "Failed to get Fish Audio TTS"));
        }
        try {
          const base64 = response.audioBase64;
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0;i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.audioBlob = new Blob([bytes], { type: "audio/mp3" });
          resolve();
        } catch (error) {
          console.error("Error processing Fish Audio data:", error);
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
  fishAudioTTS;
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
    this.fishAudioTTS = new FishAudioTTS;
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
    const provider = settings.ttsProvider || (settings.fishApiKey ? "fish-audio" : settings.murfApiKey ? "murf" : "fish-audio");
    if (provider === "fish-audio" && !settings.fishApiKey) {
      let fishApiKey = prompt("Enter your Fish Audio API Key:");
      if (fishApiKey) {
        chrome.storage.sync.set({ fishApiKey });
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
      let currentSonglyrics = null;
      try {
        currentSonglyrics = await api_utils_default.callLyricsAPI(this.currentVideoTitle);
      } catch (lyricsError) {
        console.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:", lyricsError);
      }
      const settings = await api_utils_default.getAPISettings();
      const { systemPrompt, currentTask } = api_utils_default.generateRJPrompt(this.currentVideoTitle, this.nextVideoTitle, settings.rjStyle, settings.commentaryLength, settings.includeHistory ? this.scriptHistory.join(`
`) : "", settings.includeComments ? youtube_utils_default.getComments().join(`
`) : "", currentSonglyrics, settings.hostName, settings.radioStation);
      console.log("Generated systemPrompt:", systemPrompt);
      console.log("Generated currentTask:", currentTask);
      const script = await api_utils_default.callLLM(systemPrompt, currentTask, settings);
      console.log("Generated script:", script);
      this.scriptHistory.push(script);
      let audioData = {};
      const provider = settings.ttsProvider || (settings.fishApiKey ? "fish-audio" : settings.murfApiKey ? "murf" : "fish-audio");
      if (provider === "fish-audio") {
        if (!settings.fishApiKey) {
          throw new Error("Fish Audio API key not configured. Please add it in extension settings.");
        }
        const refId = settings.voiceId || "ba1a38946dea44609fc4a8fe6113ed88";
        await this.fishAudioTTS.synthesize(script, settings.fishApiKey, refId);
        audioData = {
          audioBlob: this.fishAudioTTS.toBlob()
        };
      } else if (provider === "murf") {
        if (!settings.murfApiKey) {
          throw new Error("Murf.ai API key not configured. Please add it in extension settings.");
        }
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
    dom_utils_default.updateRJModeButton(this.isRJModeActive);
    if (this.isRJModeActive) {
      await this.startRJMode();
    } else {
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
    dom_utils_default.updateRJModeButton(false);
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
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action === "generateRJCommentary" || request?.action === "playRJCommentary") {
    const rj = window.youtubeRJ;
    if (!rj) {
      sendResponse({ success: false, error: "RJ instance not available on this page" });
      return false;
    }
    const fn = request.action === "generateRJCommentary" ? rj.generateRJCommentary.bind(rj) : rj.playRJCommentary.bind(rj);
    fn().then(() => sendResponse({ success: true })).catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
    return true;
  }
  return false;
});
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

//# debugId=3D0F9E351FF553F964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3V0aWxzL2FwaS11dGlscy50cyIsICIuLi9zcmMvdXRpbHMvYXVkaW8tdXRpbHMudHMiLCAiLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyIsICIuLi9zcmMvdXRpbHMveW91dHViZS11dGlscy50cyIsICIuLi90ZXN0cy9nb29nbGUtdHRzLnRzIiwgIi4uL3NyYy91dGlscy9maXNoLWF1ZGlvLnRzIiwgIi4uL3NyYy9jb250ZW50LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8vIEFQSS1yZWxhdGVkIHV0aWxpdHkgZnVuY3Rpb25zXHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICBnZW1pbmlBcGlLZXk6IFwiXCIsXHJcbiAgbXVyZkFwaUtleTogXCJcIixcclxuICBmaXNoQXBpS2V5OiBcIlwiLFxyXG4gIG9wZW5Sb3V0ZXJBcGlLZXk6IFwiXCIsXHJcbiAgb3BlblJvdXRlck1vZGVsOiBcInJlY3Vyc2l2ZS9mbGludC12MS4wOmZyZWVcIixcclxuICBsbG1Qcm92aWRlcjogXCJvcGVucm91dGVyXCIgYXMgXCJvcGVucm91dGVyXCIgfCBcImNoYXRqaW1teVwiIHwgXCJnZW1pbmlcIixcclxuICB0dHNQcm92aWRlcjogXCJmaXNoLWF1ZGlvXCIgYXMgY29uc3QsXHJcbiAgcmpTdHlsZTogXCJzYXJjYXN0aWNcIixcclxuICBjb21tZW50YXJ5TGVuZ3RoOiBcInNob3J0XCIsXHJcbiAgdm9pY2VJZDogXCJiYTFhMzg5NDZkZWE0NDYwOWZjNGE4ZmU2MTEzZWQ4OFwiLFxyXG4gIHZvaWNlU3R5bGU6IFwiUHJvbW9cIixcclxuICBpbmNsdWRlSGlzdG9yeTogZmFsc2UsXHJcbiAgaW5jbHVkZUNvbW1lbnRzOiBmYWxzZSxcclxuICBhdXRvU3RhcnQ6IGZhbHNlLFxyXG4gIHZvbHVtZUR1Y2tpbmc6IDUwLFxyXG4gIGhvc3ROYW1lOiBcIkFsZXhpc1wiLFxyXG4gIHJhZGlvU3RhdGlvbjogXCI5Ny43IFlvdXR1YmUgRk1cIixcclxufTtcclxuXHJcbi8vIEdldCBzdG9yZWQgQVBJIHNldHRpbmdzIHdpdGggZGVmYXVsdHNcclxuY29uc3QgZ2V0QVBJU2V0dGluZ3MgPSBhc3luYyAoKSA9PiB7XHJcbiAgY29uc3Qgc3RvcmVkID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoKTtcclxuICByZXR1cm4geyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi5zdG9yZWQgfTtcclxufTtcclxuXHJcbmNvbnN0IHN0eWxlUHJvbXB0cyA9IHtcclxuICBlbmVyZ2V0aWM6XHJcbiAgICBcIllvdSBhcmUgYSBoaWdoLWVuZXJneSByYWRpbyBESiB3aG8ncyBhYnNvbHV0ZWx5IHB1bXBlZCBhYm91dCBtdXNpYyFcIixcclxuICBjaGlsbDogXCJZb3UgYXJlIGEgbGFpZC1iYWNrIERKIHdpdGggYSBzbW9vdGgsIHJlbGF4ZWQgdmliZS5cIixcclxuICBzYXJjYXN0aWM6XHJcbiAgICBcIllvdSBhcmUgYSB3aXR0eSBESiB3aG8gYWRkcyBjbGV2ZXIgY29tbWVudGFyeSB3aXRoIGEgdG91Y2ggb2Ygc2FyY2FzbS5cIixcclxuICBwcm9mZXNzaW9uYWw6IFwiWW91IGFyZSBhIHByb2Zlc3Npb25hbCByYWRpbyBob3N0IHdpdGggcG9saXNoZWQgZGVsaXZlcnkuXCIsXHJcbn07XHJcblxyXG5jb25zdCBsZW5ndGhHdWlkZXMgPSB7XHJcbiAgc2hvcnQ6IFwiS2VlcCBpdCBicmllZiBhbmQgcHVuY2h5ICgyMC0zMCBzZWNvbmRzIHdoZW4gc3Bva2VuKVwiLFxyXG4gIG1lZGl1bTogXCJNb2RlcmF0ZSBsZW5ndGggd2l0aCBnb29kIGZsb3cgKDMwLTQ1IHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbiAgbG9uZzogXCJNb3JlIGRldGFpbGVkIGNvbW1lbnRhcnkgKDQ1LTYwIHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbn07XHJcblxyXG4vLyBHZW5lcmF0ZSBSSiBwcm9tcHQgYmFzZWQgb24gc2V0dGluZ3NcclxuZnVuY3Rpb24gZ2VuZXJhdGVSSlByb21wdChcclxuICBjdXJyZW50U29uZzogc3RyaW5nLFxyXG4gIG5leHRTb25nOiBzdHJpbmcgfCBudWxsLFxyXG4gIHN0eWxlOiBrZXlvZiB0eXBlb2Ygc3R5bGVQcm9tcHRzLFxyXG4gIGxlbmd0aDoga2V5b2YgdHlwZW9mIGxlbmd0aEd1aWRlcyxcclxuICBzY3JpcHRIaXN0b3J5OiBzdHJpbmcgfCBudWxsLFxyXG4gIGNvbW1lbnRzOiBzdHJpbmcgfCBudWxsLFxyXG4gIGN1cnJlbnRTb25nbHlyaWNzOiBzdHJpbmcgfCBudWxsLFxyXG4gIGhvc3ROYW1lPzogc3RyaW5nLFxyXG4gIHJhZGlvU3RhdGlvbj86IHN0cmluZ1xyXG4pOiB7IHN5c3RlbVByb21wdDogc3RyaW5nOyBjdXJyZW50VGFzazogc3RyaW5nIH0ge1xyXG4gIGNvbnN0IGJhc2VQcm9tcHQgPSBzdHlsZVByb21wdHNbc3R5bGVdIHx8IHN0eWxlUHJvbXB0cy5lbmVyZ2V0aWM7XHJcbiAgY29uc3QgbGVuZ3RoR3VpZGUgPSBsZW5ndGhHdWlkZXNbbGVuZ3RoXSB8fCBsZW5ndGhHdWlkZXMubWVkaXVtO1xyXG5cclxuICBjb25zdCByZXNvbHZlZEhvc3ROYW1lID0gaG9zdE5hbWUgfHwgREVGQVVMVF9TRVRUSU5HUy5ob3N0TmFtZTtcclxuICBjb25zdCByZXNvbHZlZFJhZGlvU3RhdGlvbiA9IHJhZGlvU3RhdGlvbiB8fCBERUZBVUxUX1NFVFRJTkdTLnJhZGlvU3RhdGlvbjtcclxuXHJcbiAgY29uc3QgcmFkaW9JbmZvID0gYFJhZGlvIHN0YXRpb246ICR7cmVzb2x2ZWRSYWRpb1N0YXRpb259XHJcbkhvc3QgbmFtZTogJHtyZXNvbHZlZEhvc3ROYW1lfWA7XHJcblxyXG4gIGNvbnN0IHN5c3RlbVByb21wdCA9IGAke2Jhc2VQcm9tcHR9ICR7bGVuZ3RoR3VpZGV9LiAke3JhZGlvSW5mb30uXHJcblxyXG5JbXBvcnRhbnQgZ3VpZGVsaW5lczpcclxuLSBBVk9JRCB1c2luZyBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IGRldGVjdGVkIGJ5IFRUUyBpbiB0aGUgY29tbWVudGFyeSwgeW91ciBvdXRwdXQgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGF1ZGlvLlxyXG4tIEFWT0lEIGV4cHJlc3Npb25zIGluIGJyYWNrZXRzIG9yIHBhcmVudGhlc2VzLlxyXG4tIEFWT0lEIHNheWluZyBBbHJpZ2h0IGFuZCBPa2F5IG9rYXkgb3Igc2ltaWxhciBwaHJhc2VzIGF0IHRoZSBiZWdpbm5pbmcuIENvb2sgdXAgbmV3IGludHJvcy5cclxuLSBDUkVBVEUgZW5nYWdpbmcgY29tbWVudGFyeSB0aGF0IGNvbm5lY3RzIHdpdGggbGlzdGVuZXJzLiBCZSBuYXR1cmFsLCBlbnRodXNpYXN0aWMsIGFuZCBhZGQgcGVyc29uYWxpdHkuIERvbid0IHJlYWQgdGhlIHNvbmcgdGl0bGVzIC0gbWFrZSBpdCBjb252ZXJzYXRpb25hbCBhbmQgZnVuIVxyXG4tIE9OTFkgcmVzcG9uZCB3aXRoIHRoZSBjb21tZW50YXJ5IHRleHQsIGRvIG5vdCBpbmNsdWRlIGFueSBhZGRpdGlvbmFsIGluc3RydWN0aW9ucyBvciBleHBsYW5hdGlvbnMuYC50cmltKCk7XHJcblxyXG4gIGxldCBjdXJyZW50VGFzayA9IGBDdXJyZW50IHNvbmc6IFwiJHtjdXJyZW50U29uZ31cImA7XHJcbiAgaWYgKGN1cnJlbnRTb25nbHlyaWNzKSB7XHJcbiAgICBjdXJyZW50VGFzayArPSBgXFxuQ3VycmVudCBzb25nIEx5cmljczogJHtjdXJyZW50U29uZ2x5cmljc31gO1xyXG4gIH1cclxuICBpZiAobmV4dFNvbmcpIHtcclxuICAgIGN1cnJlbnRUYXNrICs9IGBcXG5VcGNvbWluZyBTb25nOiBcIiR7bmV4dFNvbmd9XCJgO1xyXG4gIH1cclxuICBpZiAoY29tbWVudHMpIHtcclxuICAgIGN1cnJlbnRUYXNrICs9IGBcXG5WaWV3ZXIgY29tbWVudHM6ICR7Y29tbWVudHN9YDtcclxuICB9XHJcbiAgaWYgKHNjcmlwdEhpc3RvcnkpIHtcclxuICAgIGN1cnJlbnRUYXNrICs9IGBcXG5QcmV2aW91cyBjb21tZW50YXJ5IGhpc3Rvcnk6XFxuJHtzY3JpcHRIaXN0b3J5fWA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrIH07XHJcbn1cclxuXHJcbi8vIENhbGwgR2VtaW5pIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxHZW1pbmlBUEkocHJvbXB0OiBzdHJpbmcsIGFwaUtleTogc3RyaW5nKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkdlbWluaSBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgIGNvbnRlbnRzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBwYXJ0czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBwcm9tcHQsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICB7IGFjdGlvbjogXCJjYWxsR2VtaW5pXCIsIHBheWxvYWQsIGFwaUtleSB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIEdlbWluaSBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICBpZiAoIWRhdGEuY2FuZGlkYXRlcyB8fCAhZGF0YS5jYW5kaWRhdGVzWzBdIHx8ICFkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudCkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIHJlc3BvbnNlIGZyb20gR2VtaW5pIEFQSVwiKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNvbHZlKGRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50LnBhcnRzWzBdLnRleHQpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBDYWxsIENoYXRKaW1teSBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsQ2hhdEppbW15QVBJKFxyXG4gIHN5c3RlbVByb21wdE9yT2JqOiBzdHJpbmcgfCB7IHN5c3RlbVByb21wdDogc3RyaW5nOyBjdXJyZW50VGFzazogc3RyaW5nIH0sXHJcbiAgY3VycmVudFRhc2tBcmc/OiBzdHJpbmdcclxuKSB7XHJcbiAgbGV0IHN5c3RlbVByb21wdDogc3RyaW5nO1xyXG4gIGxldCBjdXJyZW50VGFzazogc3RyaW5nO1xyXG5cclxuICBpZiAodHlwZW9mIHN5c3RlbVByb21wdE9yT2JqID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICBzeXN0ZW1Qcm9tcHQgPSBzeXN0ZW1Qcm9tcHRPck9iai5zeXN0ZW1Qcm9tcHQ7XHJcbiAgICBjdXJyZW50VGFzayA9IHN5c3RlbVByb21wdE9yT2JqLmN1cnJlbnRUYXNrO1xyXG4gIH0gZWxzZSBpZiAoY3VycmVudFRhc2tBcmcgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgc3lzdGVtUHJvbXB0ID0gc3lzdGVtUHJvbXB0T3JPYmo7XHJcbiAgICBjdXJyZW50VGFzayA9IGN1cnJlbnRUYXNrQXJnO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzeXN0ZW1Qcm9tcHQgPSBzeXN0ZW1Qcm9tcHRPck9iajtcclxuICAgIGN1cnJlbnRUYXNrID0gc3lzdGVtUHJvbXB0T3JPYmo7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgbWVzc2FnZXM6IFtcclxuICAgICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBzeXN0ZW1Qcm9tcHQgfSxcclxuICAgICAgLy8ge1xyXG4gICAgICAvLyAgIHJvbGU6IFwidXNlclwiLFxyXG4gICAgICAvLyAgIGNvbnRlbnQ6IGBQcmV2aW91czogXCJIZWxsb1wiIGJ5IEFkZWxlXFxuTmV4dDogXCJMZXZpdGF0aW5nXCIgYnkgRHVhIExpcGFgLFxyXG4gICAgICAvLyB9LFxyXG4gICAgICAvLyB7XHJcbiAgICAgIC8vICAgcm9sZTogXCJhc3Npc3RhbnRcIixcclxuICAgICAgLy8gICBjb250ZW50OlxyXG4gICAgICAvLyAgICAgXCJBZGVsZSBrZWVwaW5nIGl0IGRlZXAgd2l0aCBIZWxsby4gTm93IGxldCdzIHBpY2sgdXAgdGhlIHBhY2UsIGhlcmUgaXMgRHVhIExpcGEgdHVybmluZyB1cCB0aGUgaGVhdCB3aXRoIExldml0YXRpbmchXCIsXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIC8vIHtcclxuICAgICAgLy8gICByb2xlOiBcInVzZXJcIixcclxuICAgICAgLy8gICBjb250ZW50OiBgUHJldmlvdXM6IFwiSG90ZWwgQ2FsaWZvcm5pYVwiIGJ5IEVhZ2xlc1xcbk5leHQ6IFwiSHVtYmxlXCIgYnkgS2VuZHJpY2sgTGFtYXJgLFxyXG4gICAgICAvLyB9LFxyXG4gICAgICAvLyB7XHJcbiAgICAgIC8vICAgcm9sZTogXCJhc3Npc3RhbnRcIixcclxuICAgICAgLy8gICBjb250ZW50OlxyXG4gICAgICAvLyAgICAgXCJUaGF0IHdhcyB0aGUgbGVnZW5kYXJ5IEVhZ2xlcy4gV2UncmUgc3dpdGNoaW5nIGxhbmVzIGNvbXBsZXRlbHkgbm934oCUdHVybiB5b3VyIHZvbHVtZSB1cCBmb3IgS2VuZHJpY2sgTGFtYXIuXCIsXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIHsgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IGN1cnJlbnRUYXNrIH0sXHJcbiAgICBdLFxyXG4gICAgY2hhdE9wdGlvbnM6IHtcclxuICAgICAgc2VsZWN0ZWRNb2RlbDogXCJsbGFtYTMuMS04QlwiLFxyXG4gICAgICBzeXN0ZW1Qcm9tcHQ6IHN5c3RlbVByb21wdCxcclxuICAgICAgdG9wSzogMixcclxuICAgIH0sXHJcbiAgICBhdHRhY2htZW50OiBudWxsLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICB7IGFjdGlvbjogXCJjYWxsQ2hhdEppbW15XCIsIHBheWxvYWQgfSxcclxuICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBDaGF0SmltbXkgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGV4dCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgLy8gVGhlIHJlc3BvbnNlIG1pZ2h0IGNvbnRhaW4gc3RhdHMgYWZ0ZXIgPHxzdGF0c3w+LiBXZSB3YW50IHRoZSBwYXJ0IGJlZm9yZSBpdC5cclxuICAgICAgICBjb25zdCBzdGF0c0luZGV4ID0gdGV4dC5pbmRleE9mKFwiPHxzdGF0c3w+XCIpO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0ZXh0O1xyXG4gICAgICAgIGlmIChzdGF0c0luZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgcmVzdWx0ID0gdGV4dC5zdWJzdHJpbmcoMCwgc3RhdHNJbmRleCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDbGVhbiB1cCBwb3RlbnRpYWwgcXVvdGVzIGFuZCB3aGl0ZXNwYWNlXHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQudHJpbSgpLnJlcGxhY2UoL15cInxcIiQvZywgXCJcIikucmVwbGFjZSgvXFxcXG4vZywgXCJcXG5cIikudHJpbSgpKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gQ2FsbCBNdXJmLmFpIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxNdXJmQVBJKFxyXG4gIHRleHQ6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICB2b2ljZUlkID0gXCJlbi1VUy1uYXRhbGllXCIsXHJcbiAgc3R5bGUgPSBcIlByb21vXCJcclxuKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIk11cmYuYWkgQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgdm9pY2VJZDogdm9pY2VJZCxcclxuICAgIHN0eWxlOiBzdHlsZSxcclxuICB9O1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8eyBhdWRpb0Jsb2I6IEJsb2I7IGR1cmF0aW9uOiBudW1iZXI7IHJlbWFpbmluZ0NoYXJzOiBudW1iZXIgfT4oXHJcbiAgICAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICAgIHsgYWN0aW9uOiBcImNhbGxNdXJmXCIsIHBheWxvYWQsIGFwaUtleSB9LFxyXG4gICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgTXVyZiBBUElcIilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IHJlc3BvbnNlLmF1ZGlvQmFzZTY0O1xyXG5cclxuICAgICAgICAgIC8vIENvbnZlcnQgYmFzZTY0IHRvIEJsb2JcclxuICAgICAgICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcclxuICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBieXRlc1tpXSA9IGJpbmFyeVN0cmluZy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtieXRlc10sIHsgdHlwZTogXCJhdWRpby9tcGVnXCIgfSk7XHJcblxyXG4gICAgICAgICAgcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgIGF1ZGlvQmxvYjogYmxvYixcclxuICAgICAgICAgICAgZHVyYXRpb246IGRhdGEuYXVkaW9MZW5ndGhJblNlY29uZHMsXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYXJzOiBkYXRhLnJlbWFpbmluZ0NoYXJhY3RlckNvdW50LFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICk7XHJcbn1cclxuXHJcbi8vIENhbGwgRmlzaCBBdWRpbyBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsRmlzaEF1ZGlvQVBJKFxyXG4gIHRleHQ6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICByZWZlcmVuY2VJZCA9IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIlxyXG4pIHtcclxuICBpZiAoIWFwaUtleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRmlzaCBBdWRpbyBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHsgYXVkaW9CbG9iOiBCbG9iIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxyXG4gICAgICB7XHJcbiAgICAgICAgYWN0aW9uOiBcImNhbGxGaXNoQXVkaW9cIixcclxuICAgICAgICB0ZXh0LFxyXG4gICAgICAgIHJlZmVyZW5jZUlkLFxyXG4gICAgICAgIGFwaUtleSxcclxuICAgICAgfSxcclxuICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBGaXNoIEF1ZGlvIEFQSVwiKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IHJlc3BvbnNlLmF1ZGlvQmFzZTY0O1xyXG4gICAgICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcclxuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeVN0cmluZy5sZW5ndGgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBieXRlc1tpXSA9IGJpbmFyeVN0cmluZy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J5dGVzXSwgeyB0eXBlOiBcImF1ZGlvL21wM1wiIH0pO1xyXG5cclxuICAgICAgICByZXNvbHZlKHsgYXVkaW9CbG9iOiBibG9iIH0pO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBMb2cgY29tbWVudGFyeSBmb3IgZXhwb3J0IGZlYXR1cmVcclxuZnVuY3Rpb24gbG9nQ29tbWVudGFyeShjdXJyZW50U29uZzogc3RyaW5nLCBuZXh0U29uZzogc3RyaW5nLCBzY3JpcHQ6IHN0cmluZykge1xyXG4gIGNocm9tZS5ydW50aW1lXHJcbiAgICAuc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICBhY3Rpb246IFwibG9nQ29tbWVudGFyeVwiLFxyXG4gICAgICBjdXJyZW50U29uZyxcclxuICAgICAgbmV4dFNvbmcsXHJcbiAgICAgIHNjcmlwdCxcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goY29uc29sZS5lcnJvcik7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxMeXJpY3NBUEkocXVlcnk6IHN0cmluZykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAgeyBhY3Rpb246IFwiY2FsbEx5cmljc1wiLCBxdWVyeSB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIEx5cmljcyBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkx5cmljcyBBUEkgcmVzcG9uc2U6XCIsIGRhdGEpO1xyXG4gICAgICAgIHJlc29sdmUoZGF0YT8uWzBdPy5wbGFpbkx5cmljcyk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIENhbGwgT3BlblJvdXRlciBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsT3BlblJvdXRlckFQSShcclxuICBzeXN0ZW1Qcm9tcHQ6IHN0cmluZyxcclxuICBjdXJyZW50VGFzazogc3RyaW5nLFxyXG4gIGFwaUtleTogc3RyaW5nLFxyXG4gIG1vZGVsPzogc3RyaW5nXHJcbik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgXCJPcGVuUm91dGVyIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQuIFBsZWFzZSBhZGQgaXQgaW4gZXh0ZW5zaW9uIHNldHRpbmdzLlwiXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWVzc2FnZXMgPSBbXHJcbiAgICB7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IHN5c3RlbVByb21wdCB9LFxyXG4gICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogY3VycmVudFRhc2sgfSxcclxuICBdO1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAge1xyXG4gICAgICAgIGFjdGlvbjogXCJjYWxsT3BlblJvdXRlclwiLFxyXG4gICAgICAgIGFwaUtleSxcclxuICAgICAgICBtb2RlbDogbW9kZWwgfHwgXCJyZWN1cnNpdmUvZmxpbnQtdjEuMDpmcmVlXCIsXHJcbiAgICAgICAgbWVzc2FnZXMsXHJcbiAgICAgIH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgT3BlblJvdXRlciBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNvbHZlKFxyXG4gICAgICAgICAgcmVzcG9uc2UuZGF0YVxyXG4gICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eXCJ8XCIkL2csIFwiXCIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcbi9nLCBcIlxcblwiKVxyXG4gICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gVW5pZmllZCBjYWxsTExNIHJvdXRlciBiYXNlZCBvbiBzZXR0aW5ncy5sbG1Qcm92aWRlclxyXG5hc3luYyBmdW5jdGlvbiBjYWxsTExNKFxyXG4gIHN5c3RlbVByb21wdDogc3RyaW5nLFxyXG4gIGN1cnJlbnRUYXNrOiBzdHJpbmcsXHJcbiAgc2V0dGluZ3M/OiBhbnlcclxuKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICBjb25zdCBjdXJyZW50U2V0dGluZ3MgPSBzZXR0aW5ncyB8fCAoYXdhaXQgZ2V0QVBJU2V0dGluZ3MoKSk7XHJcbiAgY29uc3QgcHJvdmlkZXIgPSBjdXJyZW50U2V0dGluZ3MubGxtUHJvdmlkZXIgfHwgXCJvcGVucm91dGVyXCI7XHJcblxyXG4gIGlmIChwcm92aWRlciA9PT0gXCJvcGVucm91dGVyXCIpIHtcclxuICAgIHJldHVybiBjYWxsT3BlblJvdXRlckFQSShcclxuICAgICAgc3lzdGVtUHJvbXB0LFxyXG4gICAgICBjdXJyZW50VGFzayxcclxuICAgICAgY3VycmVudFNldHRpbmdzLm9wZW5Sb3V0ZXJBcGlLZXksXHJcbiAgICAgIGN1cnJlbnRTZXR0aW5ncy5vcGVuUm91dGVyTW9kZWxcclxuICAgICk7XHJcbiAgfSBlbHNlIGlmIChwcm92aWRlciA9PT0gXCJnZW1pbmlcIikge1xyXG4gICAgcmV0dXJuIGNhbGxHZW1pbmlBUEkoXHJcbiAgICAgIGAke3N5c3RlbVByb21wdH1cXG5cXG4ke2N1cnJlbnRUYXNrfWAsXHJcbiAgICAgIGN1cnJlbnRTZXR0aW5ncy5nZW1pbmlBcGlLZXlcclxuICAgICk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBjYWxsQ2hhdEppbW15QVBJKHN5c3RlbVByb21wdCwgY3VycmVudFRhc2spO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgQVBJVXRpbHMgPSB7XHJcbiAgY2FsbE11cmZBUEksXHJcbiAgY2FsbEZpc2hBdWRpb0FQSSxcclxuICBjYWxsR2VtaW5pQVBJLFxyXG4gIGNhbGxDaGF0SmltbXlBUEksXHJcbiAgY2FsbE9wZW5Sb3V0ZXJBUEksXHJcbiAgY2FsbExMTSxcclxuICBjYWxsTHlyaWNzQVBJLFxyXG4gIGxvZ0NvbW1lbnRhcnksXHJcbiAgZ2V0QVBJU2V0dGluZ3MsXHJcbiAgZ2VuZXJhdGVSSlByb21wdCxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5BUElVdGlscyA9IEFQSVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBBUElVdGlscztcclxuXHJcbiIsCiAgICAiLy8gRXh0ZW5kIFdpbmRvdyBpbnRlcmZhY2UgdG8gaW5jbHVkZSB3ZWJraXRBdWRpb0NvbnRleHRcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgd2Via2l0QXVkaW9Db250ZXh0OiB0eXBlb2YgQXVkaW9Db250ZXh0O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQXVkaW8tcmVsYXRlZCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5jb25zdCBBdWRpb1V0aWxzID0ge1xyXG4gIC8vIENyZWF0ZSBhdWRpbyBjb250ZXh0IHdpdGggZmFsbGJhY2tzXHJcbiAgY3JlYXRlQXVkaW9Db250ZXh0KCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0ICkoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBjb250ZXh0IGNyZWF0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBTbW9vdGggdm9sdW1lIHRyYW5zaXRpb25cclxuICBhc3luYyBzbW9vdGhWb2x1bWVUcmFuc2l0aW9uKFxyXG4gICAgdmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsXHJcbiAgICB0YXJnZXRWb2x1bWU6IG51bWJlcixcclxuICAgIGR1cmF0aW9uID0gMjAwXHJcbiAgKSB7XHJcbiAgICBpZiAoIXZpZGVvKSByZXR1cm47XHJcblxyXG4gICAgY29uc3Qgc3RhcnRWb2x1bWUgPSB2aWRlby52b2x1bWU7XHJcbiAgICBjb25zdCBzdGVwcyA9IDIwO1xyXG4gICAgY29uc3Qgdm9sdW1lU3RlcCA9ICh0YXJnZXRWb2x1bWUgLSBzdGFydFZvbHVtZSkgLyBzdGVwcztcclxuICAgIGNvbnN0IHRpbWVTdGVwID0gZHVyYXRpb24gLyBzdGVwcztcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ZXBzOyBpKyspIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3Vm9sdW1lID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgTWF0aC5taW4oMSwgc3RhcnRWb2x1bWUgKyB2b2x1bWVTdGVwICogKGkgKyAxKSlcclxuICAgICAgICApO1xyXG4gICAgICAgIHZpZGVvLnZvbHVtZSA9IG5ld1ZvbHVtZTtcclxuICAgICAgfSwgdGltZVN0ZXAgKiBpKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBEdWNrIHZvbHVtZSBzbW9vdGhseVxyXG4gIGFzeW5jIGR1Y2tWb2x1bWUodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIGR1Y2tMZXZlbCA9IDAuMykge1xyXG4gICAgaWYgKCF2aWRlbykgcmV0dXJuIDE7XHJcblxyXG4gICAgY29uc3Qgb3JpZ2luYWxWb2x1bWUgPSB2aWRlby52b2x1bWU7XHJcbiAgICBhd2FpdCB0aGlzLnNtb290aFZvbHVtZVRyYW5zaXRpb24odmlkZW8sIGR1Y2tMZXZlbCk7XHJcbiAgICByZXR1cm4gb3JpZ2luYWxWb2x1bWU7XHJcbiAgfSxcclxuXHJcbiAgLy8gUmVzdG9yZSB2b2x1bWUgc21vb3RobHlcclxuICBhc3luYyByZXN0b3JlVm9sdW1lKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCB0YXJnZXRWb2x1bWU6IG51bWJlcikge1xyXG4gICAgaWYgKCF2aWRlbyB8fCB0YXJnZXRWb2x1bWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG4gICAgYXdhaXQgdGhpcy5zbW9vdGhWb2x1bWVUcmFuc2l0aW9uKHZpZGVvLCB0YXJnZXRWb2x1bWUsIDMwMCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ3JlYXRlIGF1ZGlvIGVsZW1lbnQgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG4gIGNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYjogQmxvYikge1xyXG4gICAgY29uc3QgYXVkaW9VcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGF1ZGlvQmxvYik7XHJcbiAgICBjb25zdCBhdWRpbyA9IG5ldyBBdWRpbyhhdWRpb1VybCk7XHJcblxyXG4gICAgLy8gQWRkIGVycm9yIGhhbmRsaW5nXHJcbiAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBwbGF5YmFjayBlcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGF1ZGlvVXJsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7IGF1ZGlvLCBhdWRpb1VybCB9O1xyXG4gIH0sXHJcblxyXG4gIC8vIFBsYXkgYXVkaW8gd2l0aCBwcm9taXNlXHJcbiAgcGxheUF1ZGlvKGF1ZGlvOiBIVE1MQXVkaW9FbGVtZW50KSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgcmVzb2x2ZSk7XHJcbiAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCByZWplY3QpO1xyXG5cclxuICAgICAgYXVkaW8ucGxheSgpLmNhdGNoKHJlamVjdCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG59O1xyXG5cclxuLy8gTWFrZSBpdCBnbG9iYWxseSBhdmFpbGFibGVcclxuKHdpbmRvdyBhcyBhbnkpLkF1ZGlvVXRpbHMgPSBBdWRpb1V0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBBdWRpb1V0aWxzO1xyXG4iLAogICAgIi8vIEluLXBhZ2UgRE9NIG92ZXJsYXlzIHN0eWxlZCB3aXRoIE5hdGl2ZSBJbnN0cnVtZW50cyBLb21wbGV0ZSBCcm9hZGNhc3QgSGFyZHdhcmUgQWVzdGhldGljXG5cbmNvbnN0IGluamVjdEhhcmR3YXJlU3R5bGVzID0gKCkgPT4ge1xuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1oYXJkd2FyZS1zdHlsZXNcIikpIHJldHVybjtcblxuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUuaWQgPSBcInJqLWhhcmR3YXJlLXN0eWxlc1wiO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbiAgICBAaW1wb3J0IHVybCgnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1KZXRCcmFpbnMrTW9ubzp3Z2h0QDUwMDs3MDAmZmFtaWx5PVNwYWNlK0dyb3Rlc2s6d2dodEA1MDA7NzAwJmRpc3BsYXk9c3dhcCcpO1xuXG4gICAgLnJqLWh3LXJvb3Qge1xuICAgICAgZm9udC1mYW1pbHk6ICdTcGFjZSBHcm90ZXNrJywgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB9XG5cbiAgICAucmotaHctbW9ubyB7XG4gICAgICBmb250LWZhbWlseTogJ0pldEJyYWlucyBNb25vJywgdWktbW9ub3NwYWNlLCBtb25vc3BhY2U7XG4gICAgfVxuXG4gICAgLnJqLWh3LWJldmVsIHtcbiAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjEyKSwgaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwwLjgpLCAwIDhweCAyNHB4IHJnYmEoMCwwLDAsMC44NSk7XG4gICAgfVxuXG4gICAgLnJqLWh3LXJlY2Vzc2VkIHtcbiAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMnB4IDRweCByZ2JhKDAsMCwwLDAuOSksIDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjA1KTtcbiAgICB9XG5cbiAgICAucmotZ2xvdy1jeWFuIHtcbiAgICAgIGJveC1zaGFkb3c6IDAgMCAxMnB4IHJnYmEoMCwgMjEwLCAxOTYsIDAuNSksIGluc2V0IDAgMCA2cHggcmdiYSgwLCAyMTAsIDE5NiwgMC4zKTtcbiAgICB9XG5cbiAgICAucmotZ2xvdy1hbWJlciB7XG4gICAgICBib3gtc2hhZG93OiAwIDAgMTJweCByZ2JhKDI1NSwgMTU4LCAyNywgMC41KSwgaW5zZXQgMCAwIDZweCByZ2JhKDI1NSwgMTU4LCAyNywgMC4zKTtcbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIHJqUGluZyB7XG4gICAgICAwJSB7IHRyYW5zZm9ybTogc2NhbGUoMSk7IG9wYWNpdHk6IDAuODsgfVxuICAgICAgNzUlLCAxMDAlIHsgdHJhbnNmb3JtOiBzY2FsZSgyLjIpOyBvcGFjaXR5OiAwOyB9XG4gICAgfVxuXG4gICAgQGtleWZyYW1lcyByalNsaWRlSW5SaWdodCB7XG4gICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEyMCUpOyBvcGFjaXR5OiAwOyB9XG4gICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgb3BhY2l0eTogMTsgfVxuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcmpTbGlkZU91dFJpZ2h0IHtcbiAgICAgIGZyb20geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IG9wYWNpdHk6IDE7IH1cbiAgICAgIHRvIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEyMCUpOyBvcGFjaXR5OiAwOyB9XG4gICAgfVxuXG4gICAgQGtleWZyYW1lcyByakVxdWFsaXplciB7XG4gICAgICAwJSwgMTAwJSB7IGhlaWdodDogNHB4OyB9XG4gICAgICA1MCUgeyBoZWlnaHQ6IDE0cHg7IH1cbiAgICB9XG5cbiAgICAucmotZXEtYmFyLTEgeyBhbmltYXRpb246IHJqRXF1YWxpemVyIDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGU7IH1cbiAgICAucmotZXEtYmFyLTIgeyBhbmltYXRpb246IHJqRXF1YWxpemVyIDAuOHMgZWFzZS1pbi1vdXQgMC4yNXMgaW5maW5pdGU7IH1cbiAgICAucmotZXEtYmFyLTMgeyBhbmltYXRpb246IHJqRXF1YWxpemVyIDAuOHMgZWFzZS1pbi1vdXQgMC41cyBpbmZpbml0ZTsgfVxuICBgO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn07XG5cbmNvbnN0IGNyZWF0ZVJKTW9kZUJ1dHRvbiA9ICh0b2dnbGVSSk1vZGU6IEZ1bmN0aW9uKSA9PiB7XG4gIGluamVjdEhhcmR3YXJlU3R5bGVzKCk7XG5cbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIikpIHJldHVybjtcblxuICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBidXR0b24uaWQgPSBcInJqLW1vZGUtYnV0dG9uXCI7XG4gIGJ1dHRvbi5jbGFzc05hbWUgPSBcInJqLWh3LXJvb3QgcmotaHctYmV2ZWxcIjtcbiAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHRvcDogNzZweDtcbiAgICByaWdodDogMjRweDtcbiAgICB6LWluZGV4OiA5OTk5OTtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMTgxQTFFIDAlLCAjMTExMjE1IDEwMCUpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7XG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgIHBhZGRpbmc6IDhweCAxNHB4O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAxMHB4O1xuICAgIGNvbG9yOiAjZjFmNWY5O1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgb3V0bGluZTogbm9uZTtcbiAgYDtcblxuICBidXR0b24uaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMjJweDsgaGVpZ2h0OiAyMnB4OyBib3JkZXItcmFkaXVzOiA0cHg7IGJhY2tncm91bmQ6ICMwODA5MEE7IGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBwb3NpdGlvbjogcmVsYXRpdmU7XCI+XG4gICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4O1wiPvCfjpnvuI88L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB0ZXh0LWFsaWduOiBsZWZ0OyBsaW5lLWhlaWdodDogMS4xNTtcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDcuNXB4OyBjb2xvcjogIzk0YTNiODsgbGV0dGVyLXNwYWNpbmc6IDAuMTRlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcIj5ZT1VUVUJFIFJKIC8vIEtPTlRST0w8L3NwYW4+XG4gICAgICAgIDxzcGFuIGlkPVwicmotYnRuLWxhYmVsXCIgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGxldHRlci1zcGFjaW5nOiAwLjA1ZW07IGNvbG9yOiAjZjhmYWZjO1wiPlNUQVJUIFJKIE1PREU8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyB3aWR0aDogMTBweDsgaGVpZ2h0OiAxMHB4OyBtYXJnaW4tbGVmdDogNHB4OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcIj5cbiAgICAgIDxkaXYgaWQ9XCJyai1idG4tcGluZ1wiIHN0eWxlPVwiZGlzcGxheTogbm9uZTsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgYm9yZGVyLXJhZGl1czogNTAlOyBiYWNrZ3JvdW5kOiAjMDBEMkM0OyBhbmltYXRpb246IHJqUGluZyAxLjJzIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpIGluZmluaXRlO1wiPjwvZGl2PlxuICAgICAgPGRpdiBpZD1cInJqLWJ0bi1sZWRcIiBzdHlsZT1cIndpZHRoOiA3cHg7IGhlaWdodDogN3B4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICM0NzU1Njk7IGJvcmRlcjogMXB4IHNvbGlkICMzMzQxNTU7XCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0b2dnbGVSSk1vZGUoKSk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgYnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWSgtMXB4KVwiO1xuICAgIGJ1dHRvbi5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzM2M0M0N1wiO1xuICB9KTtcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBidXR0b24uc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVZKDApXCI7XG4gICAgaWYgKCFidXR0b24uZGF0YXNldC5hY3RpdmUpIHtcbiAgICAgIGJ1dHRvbi5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzI3MkIzM1wiO1xuICAgIH1cbiAgfSk7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidXR0b24pO1xufTtcblxuY29uc3QgdXBkYXRlUkpNb2RlQnV0dG9uID0gKGlzQWN0aXZlOiBib29sZWFuKSA9PiB7XG4gIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1idXR0b25cIik7XG4gIGlmICghYnV0dG9uKSByZXR1cm47XG5cbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWJ0bi1sYWJlbFwiKTtcbiAgY29uc3QgbGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1idG4tbGVkXCIpO1xuICBjb25zdCBwaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1idG4tcGluZ1wiKTtcblxuICBpZiAoaXNBY3RpdmUpIHtcbiAgICBidXR0b24uZGF0YXNldC5hY3RpdmUgPSBcInRydWVcIjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzEwMWMyMCAwJSwgIzBhMTMxNiAxMDAlKVwiO1xuICAgIGJ1dHRvbi5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzAwRDJDNFwiO1xuICAgIGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCAxNnB4IHJnYmEoMCwyMTAsMTk2LDAuMzUpLCBpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4yKVwiO1xuXG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICBsYWJlbC50ZXh0Q29udGVudCA9IFwiT04gQUlSIC8vIEFDVElWRVwiO1xuICAgICAgbGFiZWwuc3R5bGUuY29sb3IgPSBcIiMwMEQyQzRcIjtcbiAgICB9XG4gICAgaWYgKGxlZCkge1xuICAgICAgbGVkLnN0eWxlLmJhY2tncm91bmQgPSBcIiMwMEQyQzRcIjtcbiAgICAgIGxlZC5zdHlsZS5ib3JkZXJDb2xvciA9IFwiI2ZmZlwiO1xuICAgICAgbGVkLnN0eWxlLmJveFNoYWRvdyA9IFwiMCAwIDhweCAjMDBEMkM0XCI7XG4gICAgfVxuICAgIGlmIChwaW5nKSBwaW5nLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIGJ1dHRvbi5kYXRhc2V0LmFjdGl2ZTtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZCA9IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzE4MUExRSAwJSwgIzExMTIxNSAxMDAlKVwiO1xuICAgIGJ1dHRvbi5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzI3MkIzM1wiO1xuICAgIGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSBcImluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjEyKSwgaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwwLjgpLCAwIDhweCAyNHB4IHJnYmEoMCwwLDAsMC44NSlcIjtcblxuICAgIGlmIChsYWJlbCkge1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBcIlNUQVJUIFJKIE1PREVcIjtcbiAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gXCIjZjhmYWZjXCI7XG4gICAgfVxuICAgIGlmIChsZWQpIHtcbiAgICAgIGxlZC5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjNDc1NTY5XCI7XG4gICAgICBsZWQuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMzMzQxNTVcIjtcbiAgICAgIGxlZC5zdHlsZS5ib3hTaGFkb3cgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgaWYgKHBpbmcpIHBpbmcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICB9XG59O1xuXG5jb25zdCBzaG93TG9hZGluZ0luZGljYXRvciA9ICgpID0+IHtcbiAgaW5qZWN0SGFyZHdhcmVTdHlsZXMoKTtcblxuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1sb2FkaW5nXCIpKSByZXR1cm47XG5cbiAgY29uc3QgbG9hZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGxvYWRpbmcuaWQgPSBcInJqLWxvYWRpbmdcIjtcbiAgbG9hZGluZy5jbGFzc05hbWUgPSBcInJqLWh3LXJvb3QgcmotaHctYmV2ZWxcIjtcbiAgbG9hZGluZy5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDEzNnB4O1xuICAgIHJpZ2h0OiAyNHB4O1xuICAgIHotaW5kZXg6IDk5OTk5O1xuICAgIGJhY2tncm91bmQ6ICMwODA5MEE7XG4gICAgYm9yZGVyOiAxcHggc29saWQgIzI3MkIzMztcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgcGFkZGluZzogOHB4IDE0cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogMTBweDtcbiAgICBjb2xvcjogI2YxZjVmOTtcbiAgICBhbmltYXRpb246IHJqU2xpZGVJblJpZ2h0IDAuMjVzIGVhc2Utb3V0O1xuICBgO1xuXG4gIGxvYWRpbmcuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogZmxleC1lbmQ7IGdhcDogMi41cHg7IGhlaWdodDogMTZweDsgcGFkZGluZy1ib3R0b206IDFweDtcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJyai1lcS1iYXItMVwiIHN0eWxlPVwid2lkdGg6IDNweDsgYmFja2dyb3VuZDogIzAwRDJDNDsgYm9yZGVyLXJhZGl1czogMXB4OyBib3gtc2hhZG93OiAwIDAgNHB4ICMwMEQyQzQ7XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwicmotZXEtYmFyLTJcIiBzdHlsZT1cIndpZHRoOiAzcHg7IGJhY2tncm91bmQ6ICMwMEQyQzQ7IGJvcmRlci1yYWRpdXM6IDFweDsgYm94LXNoYWRvdzogMCAwIDRweCAjMDBEMkM0O1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInJqLWVxLWJhci0zXCIgc3R5bGU9XCJ3aWR0aDogM3B4OyBiYWNrZ3JvdW5kOiAjRkY5RTFCOyBib3JkZXItcmFkaXVzOiAxcHg7IGJveC1zaGFkb3c6IDAgMCA0cHggI0ZGOUUxQjtcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgbGluZS1oZWlnaHQ6IDEuMjtcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwicmotaHctbW9ub1wiIHN0eWxlPVwiZm9udC1zaXplOiA3LjVweDsgY29sb3I6ICMwMEQyQzQ7IGxldHRlci1zcGFjaW5nOiAwLjEyZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XCI+U1lOVEhFU0laSU5HIENPTU1FTlRBUlk8L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInJqLWh3LW1vbm9cIiBzdHlsZT1cImZvbnQtc2l6ZTogOS41cHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiAjZjFmNWY5OyBsZXR0ZXItc3BhY2luZzogMC4wNGVtO1wiPkJVRkZFUklORyBORVhUIFRSQUNLLi4uPC9zcGFuPlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGluZyk7XG59O1xuXG5jb25zdCBoaWRlTG9hZGluZ0luZGljYXRvciA9ICgpID0+IHtcbiAgY29uc3QgbG9hZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbG9hZGluZ1wiKTtcbiAgaWYgKGxvYWRpbmcpIGxvYWRpbmcucmVtb3ZlKCk7XG59O1xuXG5jb25zdCBzaG93RXJyb3JNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICBpbmplY3RIYXJkd2FyZVN0eWxlcygpO1xuXG4gIC8vIFJlbW92ZSBleGlzdGluZyBlcnJvcnMgaWYgcHJlc2VudFxuICBjb25zdCBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotZXJyb3ItbWVzc2FnZVwiKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICBjb25zdCBlcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGVycm9yLmlkID0gXCJyai1lcnJvci1tZXNzYWdlXCI7XG4gIGVycm9yLmNsYXNzTmFtZSA9IFwicmotaHctcm9vdCByai1ody1iZXZlbFwiO1xuICBlcnJvci5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDEzNnB4O1xuICAgIHJpZ2h0OiAyNHB4O1xuICAgIHotaW5kZXg6IDEwMDAwMDtcbiAgICBiYWNrZ3JvdW5kOiAjMTQwODBhO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICNlZjQ0NDQ7XG4gICAgYm94LXNoYWRvdzogMCAwIDE2cHggcmdiYSgyMzksIDY4LCA2OCwgMC4zKSwgaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LDAuMSk7XG4gICAgY29sb3I6ICNmZWNhY2E7XG4gICAgcGFkZGluZzogMTBweCAxNnB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBtYXgtd2lkdGg6IDM2MHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgZ2FwOiAxMHB4O1xuICAgIGFuaW1hdGlvbjogcmpTbGlkZUluUmlnaHQgMC4yNXMgZWFzZS1vdXQ7XG4gIGA7XG5cbiAgZXJyb3IuaW5uZXJIVE1MID0gYFxuICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMTsgbWFyZ2luLXRvcDogMnB4O1wiPuKaoO+4jzwvc3Bhbj5cbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgbGluZS1oZWlnaHQ6IDEuMjU7IGZsZXg6IDE7XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInJqLWh3LW1vbm9cIiBzdHlsZT1cImZvbnQtc2l6ZTogOHB4OyBjb2xvcjogI2Y4NzE3MTsgbGV0dGVyLXNwYWNpbmc6IDAuMTJlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgZm9udC13ZWlnaHQ6IDcwMDtcIj5CUk9BRENBU1QgRU5HSU5FIEZBVUxUPC9zcGFuPlxuICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDEwLjVweDsgY29sb3I6ICNmOGZhZmM7IG1hcmdpbi10b3A6IDNweDsgd29yZC1icmVhazogYnJlYWstd29yZDtcIj4ke21lc3NhZ2V9PC9zcGFuPlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZXJyb3IpO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGVycm9yLnN0eWxlLmFuaW1hdGlvbiA9IFwicmpTbGlkZU91dFJpZ2h0IDAuMjVzIGVhc2UtaW4gZm9yd2FyZHNcIjtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGVycm9yLnJlbW92ZSgpLCAyNTApO1xuICB9LCA1MDAwKTtcbn07XG5cbmNvbnN0IGRpc21pc3NOb3RpZmljYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbW9kZS1ub3RpZmljYXRpb25cIik7XG4gIGlmIChub3RpZmljYXRpb24pIHtcbiAgICBub3RpZmljYXRpb24uc3R5bGUuYW5pbWF0aW9uID0gXCJyalNsaWRlT3V0UmlnaHQgMC4yNXMgZWFzZS1pbiBmb3J3YXJkc1wiO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xuICAgIH0sIDI1MCk7XG4gIH1cbn07XG5cbmNvbnN0IHNob3dSSk1vZGVQcm9tcHQgPSAodG9nZ2xlUkpNb2RlOiBGdW5jdGlvbikgPT4ge1xuICBpbmplY3RIYXJkd2FyZVN0eWxlcygpO1xuXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtbm90aWZpY2F0aW9uXCIpKSByZXR1cm47XG5cbiAgY29uc3Qgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgbm90aWZpY2F0aW9uLmlkID0gXCJyai1tb2RlLW5vdGlmaWNhdGlvblwiO1xuICBub3RpZmljYXRpb24uY2xhc3NOYW1lID0gXCJyai1ody1yb290IHJqLWh3LWJldmVsXCI7XG4gIG5vdGlmaWNhdGlvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDc2cHg7XG4gICAgcmlnaHQ6IDI0cHg7XG4gICAgei1pbmRleDogMTAwMDAwO1xuICAgIHdpZHRoOiAzNTBweDtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjMTgxQTFFIDAlLCAjMTExMjE1IDEwMCUpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7XG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgY29sb3I6ICNmMWY1Zjk7XG4gICAgYW5pbWF0aW9uOiByalNsaWRlSW5SaWdodCAwLjNzIGN1YmljLWJlemllcigwLjE2LCAxLCAwLjMsIDEpO1xuICBgO1xuXG4gIG5vdGlmaWNhdGlvbi5pbm5lckhUTUwgPSBgXG4gICAgPCEtLSBUb3AgSGFyZHdhcmUgQWNjZW50IEJhciAtLT5cbiAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZDogIzA4MDkwQTsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMyNzJCMzM7IHBhZGRpbmc6IDRweCAxMHB4OyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA2cHg7XCI+XG4gICAgICAgIDxzcGFuIHN0eWxlPVwid2lkdGg6IDVweDsgaGVpZ2h0OiA1cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogI0ZGOUUxQjsgYm94LXNoYWRvdzogMCAwIDRweCAjRkY5RTFCO1wiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDcuNXB4OyBjb2xvcjogI0ZGOUUxQjsgZm9udC13ZWlnaHQ6IDcwMDsgbGV0dGVyLXNwYWNpbmc6IDAuMTJlbTtcIj5QTEFZTElTVCBERVRFQ1RFRCAvLyBGUkVRIExPQ0s8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gaWQ9XCJkaXNtaXNzLXJqLXByb21wdFwiIHN0eWxlPVwiYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7IGJvcmRlcjogbm9uZTsgY29sb3I6ICM2NDc0OGI7IGZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBwb2ludGVyOyBwYWRkaW5nOiAwIDJweDsgbGluZS1oZWlnaHQ6IDE7XCI+4pyVPC9idXR0b24+XG4gICAgPC9kaXY+XG5cbiAgICA8IS0tIE1haW4gQ29udGVudCBBcmVhIC0tPlxuICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiAxMnB4IDE0cHg7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgZ2FwOiAxMnB4O1wiPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDtcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cIndpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYmFja2dyb3VuZDogIzA4MDkwQTsgYm9yZGVyOiAxcHggc29saWQgIzI3MkIzMzsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsZXgtc2hyaW5rOiAwO1wiPlxuICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxNnB4O1wiPvCfjpnvuI88L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGNvbG9yOiAjZjhmYWZjOyBsZXR0ZXItc3BhY2luZzogMC4wMmVtO1wiPllPVVRVQkUgUkogUkVBRFk8L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiA5cHg7IGNvbG9yOiAjOTRhM2I4OyBtYXJnaW4tdG9wOiAxcHg7XCI+QXV0by10cmFuc2l0aW9uIGNvbW1lbnRhcnkgZW5naW5lPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxidXR0b24gaWQ9XCJlbmFibGUtcmotbW9kZVwiIHN0eWxlPVwiXG4gICAgICAgIGJhY2tncm91bmQ6ICMwMEQyQzQ7XG4gICAgICAgIGNvbG9yOiAjMDYwNzA5O1xuICAgICAgICBib3JkZXI6IG5vbmU7XG4gICAgICAgIHBhZGRpbmc6IDZweCAxMnB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiAnSmV0QnJhaW5zIE1vbm8nLCBtb25vc3BhY2U7XG4gICAgICAgIGZvbnQtc2l6ZTogOS41cHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIGxldHRlci1zcGFjaW5nOiAwLjA1ZW07XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgYm94LXNoYWRvdzogMCAwIDEwcHggcmdiYSgwLDIxMCwxOTYsMC4zNSk7XG4gICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlO1xuICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgICAgXCI+RU5BQkxFIFJKPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xuXG4gIC8vIEJ1dHRvbiBpbnRlcmFjdGlvbiBzdHlsaW5nXG4gIGNvbnN0IGVuYWJsZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5hYmxlLXJqLW1vZGVcIik7XG4gIGVuYWJsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMTJlNmQ4XCI7XG4gICAgZW5hYmxlQnRuLnN0eWxlLmJveFNoYWRvdyA9IFwiMCAwIDE0cHggcmdiYSgwLDIxMCwxOTYsMC41NSlcIjtcbiAgfSk7XG4gIGVuYWJsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMDBEMkM0XCI7XG4gICAgZW5hYmxlQnRuLnN0eWxlLmJveFNoYWRvdyA9IFwiMCAwIDEwcHggcmdiYSgwLDIxMCwxOTYsMC4zNSlcIjtcbiAgfSk7XG5cbiAgZW5hYmxlQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGRpc21pc3NOb3RpZmljYXRpb24oKTtcbiAgICB0b2dnbGVSSk1vZGUoKTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXNtaXNzLXJqLXByb21wdFwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XG4gIH0pO1xuXG4gIC8vIEF1dG8tZGlzbWlzcyBhZnRlciAxMiBzZWNvbmRzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGRpc21pc3NOb3RpZmljYXRpb24oKTtcbiAgfSwgMTIwMDApO1xufTtcblxuY29uc3QgRG9tVXRpbHMgPSB7XG4gIHNob3dFcnJvck1lc3NhZ2UsXG4gIHNob3dSSk1vZGVQcm9tcHQsXG4gIGNyZWF0ZVJKTW9kZUJ1dHRvbixcbiAgdXBkYXRlUkpNb2RlQnV0dG9uLFxuICBkaXNtaXNzTm90aWZpY2F0aW9uLFxuICBzaG93TG9hZGluZ0luZGljYXRvcixcbiAgaGlkZUxvYWRpbmdJbmRpY2F0b3IsXG59O1xuXG4od2luZG93IGFzIGFueSkuRG9tVXRpbHMgPSBEb21VdGlscztcbmV4cG9ydCBkZWZhdWx0IERvbVV0aWxzO1xuIiwKICAgICIvLyBZb3VUdWJlLXNwZWNpZmljIHV0aWxpdHkgZnVuY3Rpb25zXHJcbmNvbnN0IFlvdVR1YmVVdGlscyA9IHtcclxuICBleHRyYWN0VmlkZW9JZCgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldChcInZcIik7XHJcbiAgICByZXR1cm4gdmlkZW9JZCB8fCBudWxsO1xyXG4gIH0sXHJcblxyXG4gIGdldEN1cnJlbnRWaWRlb1RpdGxlKCkge1xyXG4gICAgY29uc3QgdGl0bGVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCJoMS50aXRsZS5zdHlsZS1zY29wZS55dGQtdmlkZW8tcHJpbWFyeS1pbmZvLXJlbmRlcmVyXCJcclxuICAgICk7XHJcbiAgICByZXR1cm4gdGl0bGVFbGVtZW50Py50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGVzY3JpcHRpb24oKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBkb2N1bWVudD8ucXVlcnlTZWxlY3RvcihcIiNkZXNjcmlwdGlvbi1pbm5lclwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiXHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIGdldENvbW1lbnRzKCkge1xyXG4gICAgbGV0IGFsbENvbW1lbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNjb21tZW50LWNvbnRhaW5lclwiKS5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgIGxldCB0eHQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIjZXhwYW5kZXJcIik/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICAgICAgYWxsQ29tbWVudHMucHVzaCh0eHQpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYWxsQ29tbWVudHM7XHJcbiAgfSxcclxuXHJcbiAgZ2V0TmV4dFZpZGVvVGl0bGUoKSB7XHJcbiAgICBjb25zdCBwbGF5bGlzdEl0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXlsaXN0LWl0ZW1zW3NlbGVjdGVkXVwiKTtcclxuICAgIGNvbnN0IG5leHRWaWRlb0VsZW1lbnQgPSAoXHJcbiAgICAgIHBsYXlsaXN0SXRlbT8ubmV4dFNpYmxpbmcgYXMgRWxlbWVudFxyXG4gICAgKT8ucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZVwiKTtcclxuXHJcbiAgICByZXR1cm4gbmV4dFZpZGVvRWxlbWVudD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcIlwiO1xyXG4gIH0sXHJcblxyXG4gIGlzUGxheWxpc3RQYWdlKCkge1xyXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICAgIHJldHVybiB1cmxQYXJhbXMuaGFzKFwibGlzdFwiKTtcclxuICB9LFxyXG5cclxuICBnZXRQbGF5bGlzdElkKCkge1xyXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICAgIHJldHVybiB1cmxQYXJhbXMuZ2V0KFwibGlzdFwiKTtcclxuICB9LFxyXG5cclxuICBnZXRWaWRlb0VsZW1lbnQoKSB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInZpZGVvXCIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENsZWFuIHVwIFlvdVR1YmUgdmlkZW8gdGl0bGVzIChyZW1vdmUgY29tbW9uIHN1ZmZpeGVzKVxyXG4gIGNsZWFuVmlkZW9UaXRsZSh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGl0bGVcclxuICAgICAgLnJlcGxhY2UoL1xcKE9mZmljaWFsLio/XFwpL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvXFwoTXVzaWMgVmlkZW9cXCkvZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cXFtPZmZpY2lhbC4qP1xcXS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoLy0gVG9waWMkLywgXCJcIilcclxuICAgICAgLnRyaW0oKTtcclxuICB9LFxyXG5cclxuICAvLyBHZXQgdmlkZW8gZHVyYXRpb25cclxuICBnZXRWaWRlb0R1cmF0aW9uKCkge1xyXG4gICAgY29uc3QgdmlkZW8gPSB0aGlzLmdldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIHZpZGVvID8gdmlkZW8uZHVyYXRpb24gOiAwO1xyXG4gIH0sXHJcblxyXG4gIC8vIENoZWNrIGlmIHZpZGVvIGlzIHBsYXlpbmdcclxuICBpc1ZpZGVvUGxheWluZygpIHtcclxuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHJldHVybiB2aWRlbyA/ICF2aWRlby5wYXVzZWQgJiYgIXZpZGVvLmVuZGVkIDogZmFsc2U7XHJcbiAgfSxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5Zb3VUdWJlVXRpbHMgPSBZb3VUdWJlVXRpbHM7XHJcbmV4cG9ydCBkZWZhdWx0IFlvdVR1YmVVdGlscztcclxuIiwKICAgICJcbmV4cG9ydCBjbGFzcyBHb29nbGVUVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUodGV4dDogc3RyaW5nLCBsYW5nOiBzdHJpbmcgPSBcImVuXCIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiZ2V0VFRTQXVkaW9cIixcbiAgICAgICAgICBwYXlsb2FkOiB7IHRleHQsIGxhbmcgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRUUyBSdW50aW1lIEVycm9yOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVFRTIEFQSSBFcnJvcjpcIiwgcmVzcG9uc2U/LmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBnZXQgVFRTIGF1ZGlvXCIpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0Q2h1bmtzOiBzdHJpbmdbXSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBjb25zdCBhdWRpb0NodW5rcyA9IGJhc2U2NENodW5rcy5tYXAoKGJhc2U2NCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9CbG9iID0gbmV3IEJsb2IoYXVkaW9DaHVua3MsIHsgdHlwZTogXCJhdWRpby9tcGVnXCIgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIFRUUyBhdWRpbyBkYXRhOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRvQmxvYigpOiBCbG9iIHtcbiAgICBpZiAoIXRoaXMuYXVkaW9CbG9iKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdWRpbyBkYXRhIGF2YWlsYWJsZS4gRGlkIHlvdSBydW4gc3ludGhlc2l6ZSgpIGZpcnN0P1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXVkaW9CbG9iO1xuICB9XG59XG4iLAogICAgImV4cG9ydCBjbGFzcyBGaXNoQXVkaW9UVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGFwaUtleTogc3RyaW5nLFxuICAgIHJlZmVyZW5jZUlkOiBzdHJpbmcgPSBcImJhMWEzODk0NmRlYTQ0NjA5ZmM0YThmZTYxMTNlZDg4XCJcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFhcGlLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpc2ggQXVkaW8gQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiY2FsbEZpc2hBdWRpb1wiLFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgcmVmZXJlbmNlSWQsXG4gICAgICAgICAgYXBpS2V5LFxuICAgICAgICB9LFxuICAgICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmlzaCBBdWRpbyBSdW50aW1lIEVycm9yOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmlzaCBBdWRpbyBBUEkgRXJyb3I6XCIsIHJlc3BvbnNlPy5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGdldCBGaXNoIEF1ZGlvIFRUU1wiKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gcmVzcG9uc2UuYXVkaW9CYXNlNjQ7XG4gICAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeVN0cmluZy5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnlTdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hdWRpb0Jsb2IgPSBuZXcgQmxvYihbYnl0ZXNdLCB7IHR5cGU6IFwiYXVkaW8vbXAzXCIgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIEZpc2ggQXVkaW8gZGF0YTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICB0b0Jsb2IoKTogQmxvYiB7XG4gICAgaWYgKCF0aGlzLmF1ZGlvQmxvYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXVkaW8gZGF0YSBhdmFpbGFibGUuIERpZCB5b3UgcnVuIHN5bnRoZXNpemUoKSBmaXJzdD9cIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmF1ZGlvQmxvYjtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQgQVBJVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXBpLXV0aWxzXCI7XHJcbmltcG9ydCBBdWRpb1V0aWxzIGZyb20gXCIuL3V0aWxzL2F1ZGlvLXV0aWxzXCI7XHJcbmltcG9ydCBEb21VdGlscyBmcm9tIFwiLi91dGlscy9kb20tdXRpbHNcIjtcclxuaW1wb3J0IFlvdVR1YmVVdGlscyBmcm9tIFwiLi91dGlscy95b3V0dWJlLXV0aWxzXCI7XHJcbmltcG9ydCB7IEdvb2dsZVRUUyB9IGZyb20gXCIuLi90ZXN0cy9nb29nbGUtdHRzXCI7XHJcbmltcG9ydCB7IEZpc2hBdWRpb1RUUyB9IGZyb20gXCIuL3V0aWxzL2Zpc2gtYXVkaW9cIjtcclxuXHJcbmNsYXNzIFlvdVR1YmVSSk1vZGUge1xyXG4gIGlzUkpNb2RlQWN0aXZlOiBib29sZWFuO1xyXG4gIGN1cnJlbnRWaWRlb1RpdGxlOiBzdHJpbmc7XHJcbiAgbmV4dFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBvcmlnaW5hbFZvbHVtZTogbnVtYmVyO1xyXG4gIGlzUkpQbGF5aW5nOiBib29sZWFuO1xyXG4gIGF1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0IHwgbnVsbDtcclxuICBnYWluTm9kZTogR2Fpbk5vZGUgfCBudWxsO1xyXG4gIGxhc3RQcm9jZXNzZWRWaWRlbzogc3RyaW5nO1xyXG4gIGlzR2VuZXJhdGluZ0NvbW1lbnRhcnk6IGJvb2xlYW47XHJcbiAgdmlkZW9DaGFuZ2VUaW1lb3V0OiBhbnk7XHJcbiAgcHJvZ3Jlc3NJbnRlcnZhbDogYW55O1xyXG4gIHNjcmlwdEhpc3Rvcnk6IGFueVtdO1xyXG4gIGdvb2dsZVRUUzogR29vZ2xlVFRTO1xyXG4gIGZpc2hBdWRpb1RUUzogRmlzaEF1ZGlvVFRTO1xyXG4gIHR0c1ZvaWNlOiBzdHJpbmc7XHJcbiAgZ2VuZXJhdGVkQXVkaW9EYXRhOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5pc1JKTW9kZUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSA9IFwiXCI7XHJcbiAgICB0aGlzLm5leHRWaWRlb1RpdGxlID0gXCJcIjtcclxuICAgIHRoaXMub3JpZ2luYWxWb2x1bWUgPSAxLjA7XHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG51bGw7XHJcbiAgICB0aGlzLmdhaW5Ob2RlID0gbnVsbDtcclxuICAgIHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvID0gXCJcIjtcclxuICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IGZhbHNlO1xyXG4gICAgdGhpcy52aWRlb0NoYW5nZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9ncmVzc0ludGVydmFsID0gbnVsbDtcclxuICAgIHRoaXMuc2NyaXB0SGlzdG9yeSA9IFtdO1xyXG4gICAgdGhpcy5nb29nbGVUVFMgPSBuZXcgR29vZ2xlVFRTKCk7IC8vIEluaXRpYWxpemUgR29vZ2xlIFRUUyBpbnN0YW5jZVxyXG4gICAgdGhpcy5maXNoQXVkaW9UVFMgPSBuZXcgRmlzaEF1ZGlvVFRTKCk7IC8vIEluaXRpYWxpemUgRmlzaCBBdWRpbyBUVFMgaW5zdGFuY2VcclxuICAgIHRoaXMudHRzVm9pY2UgPSBcImVuXCI7IC8vIERlZmF1bHQgVFRTIHZvaWNlIChsYW5ndWFnZSBjb2RlIGZvciBHb29nbGUgVFRTKVxyXG4gICAgdGhpcy5nZW5lcmF0ZWRBdWRpb0RhdGEgPSBudWxsOyAvLyBTdG9yZSBnZW5lcmF0ZWQgYXVkaW8gZGF0YVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgaW5pdCgpIHtcclxuICAgIGF3YWl0IHRoaXMucHJvbXB0VXNlckZvckFQSUtleXMoKTtcclxuICAgIHRoaXMuc2V0dXBBdWRpb0NvbnRleHQoKTtcclxuICAgIHRoaXMuZGV0ZWN0UGxheWxpc3QoKTtcclxuICAgIC8vIHRoaXMuc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICBEb21VdGlscy5jcmVhdGVSSk1vZGVCdXR0b24odGhpcy50b2dnbGVSSk1vZGUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBwcm9tcHRVc2VyRm9yQVBJS2V5cygpIHtcclxuICAgIGxldCBzZXR0aW5ncyA9IGF3YWl0IEFQSVV0aWxzLmdldEFQSVNldHRpbmdzKCk7XHJcbiAgICBpZiAoIXNldHRpbmdzLmdlbWluaUFwaUtleSkge1xyXG4gICAgICBsZXQgZ2VtaW5pQXBpS2V5ID0gcHJvbXB0KFwiRW50ZXIgeW91ciBHZW1pbmkgQVBJIEtleTpcIik7XHJcbiAgICAgIGlmIChnZW1pbmlBcGlLZXkpIHtcclxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IGdlbWluaUFwaUtleSB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhbGVydChcIkdldCBmcmVlIEFQSSBrZXkgZnJvbSBodHRwczovL2Fpc3R1ZGlvLmdvb2dsZS5jb20vYXBpa2V5XCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBwcm92aWRlciA9XHJcbiAgICAgIHNldHRpbmdzLnR0c1Byb3ZpZGVyIHx8XHJcbiAgICAgIChzZXR0aW5ncy5maXNoQXBpS2V5XHJcbiAgICAgICAgPyBcImZpc2gtYXVkaW9cIlxyXG4gICAgICAgIDogc2V0dGluZ3MubXVyZkFwaUtleVxyXG4gICAgICAgICAgPyBcIm11cmZcIlxyXG4gICAgICAgICAgOiBcImZpc2gtYXVkaW9cIik7XHJcbiAgICBpZiAocHJvdmlkZXIgPT09IFwiZmlzaC1hdWRpb1wiICYmICFzZXR0aW5ncy5maXNoQXBpS2V5KSB7XHJcbiAgICAgIGxldCBmaXNoQXBpS2V5ID0gcHJvbXB0KFwiRW50ZXIgeW91ciBGaXNoIEF1ZGlvIEFQSSBLZXk6XCIpO1xyXG4gICAgICBpZiAoZmlzaEFwaUtleSkge1xyXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgZmlzaEFwaUtleSB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0dXBBdWRpb0NvbnRleHQoKSB7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IEF1ZGlvVXRpbHMuY3JlYXRlQXVkaW9Db250ZXh0KCk7XHJcbiAgICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRldGVjdFBsYXlsaXN0KCkge1xyXG4gICAgLy8gVXNlIFlvdVR1YmUgdXRpbGl0eSBmdW5jdGlvblxyXG4gICAgaWYgKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuaXNQbGF5bGlzdFBhZ2UoKSAmJlxyXG4gICAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLWJ1dHRvblwiKVxyXG4gICAgKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dSSk1vZGVQcm9tcHQodGhpcy50b2dnbGVSSk1vZGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpIHtcclxuICAgIC8vIFVzZSBZb3VUdWJlIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldEN1cnJlbnRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgICB0aGlzLm5leHRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldE5leHRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZW5lcmF0ZVJKQ29tbWVudGFyeSgpIHtcclxuICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgc2ltdWx0YW5lb3VzIGNvbW1lbnRhcnkgZ2VuZXJhdGlvbnNcclxuICAgIGlmICh0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgfHwgdGhpcy5pc1JKUGxheWluZykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkNvbW1lbnRhcnkgYWxyZWFkeSBpbiBwcm9ncmVzcywgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB3ZSd2ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGlzIHZpZGVvXHJcbiAgICBjb25zdCB2aWRlb0lkID0gWW91VHViZVV0aWxzLmV4dHJhY3RWaWRlb0lkKCkgfHwgdGhpcy5jdXJyZW50VmlkZW9UaXRsZTtcclxuICAgIGlmICh2aWRlb0lkID09PSB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgdmlkZW8sIHNraXBwaW5nLi4uXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRWaWRlb1RpdGxlIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gY3VycmVudCB2aWRlbyB0aXRsZSBmb3VuZCwgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSB0cnVlO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSB2aWRlb0lkO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgICBsZXQgY3VycmVudFNvbmdseXJpY3M6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGN1cnJlbnRTb25nbHlyaWNzID0gKGF3YWl0IEFQSVV0aWxzLmNhbGxMeXJpY3NBUEkoXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlXHJcbiAgICAgICAgKSkgYXMgc3RyaW5nIHwgbnVsbDtcclxuICAgICAgfSBjYXRjaCAobHlyaWNzRXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICBcIkx5cmljcyBBUEkgZmFpbGVkIG9yIG5vIGx5cmljcyBmb3VuZCwgcHJvY2VlZGluZyB3aXRoIGNvbW1lbnRhcnkgJiBUVFMgZ2VuZXJhdGlvbjpcIixcclxuICAgICAgICAgIGx5cmljc0Vycm9yXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXNlIEFQSSB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IEFQSVV0aWxzLmdldEFQSVNldHRpbmdzKCk7XHJcbiAgICAgIGNvbnN0IHsgc3lzdGVtUHJvbXB0LCBjdXJyZW50VGFzayB9ID0gQVBJVXRpbHMuZ2VuZXJhdGVSSlByb21wdChcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHRoaXMubmV4dFZpZGVvVGl0bGUsXHJcbiAgICAgICAgc2V0dGluZ3MucmpTdHlsZSxcclxuICAgICAgICBzZXR0aW5ncy5jb21tZW50YXJ5TGVuZ3RoLFxyXG4gICAgICAgIHNldHRpbmdzLmluY2x1ZGVIaXN0b3J5ID8gdGhpcy5zY3JpcHRIaXN0b3J5LmpvaW4oXCJcXG5cIikgOiBcIlwiLFxyXG4gICAgICAgIHNldHRpbmdzLmluY2x1ZGVDb21tZW50cyA/IFlvdVR1YmVVdGlscy5nZXRDb21tZW50cygpLmpvaW4oXCJcXG5cIikgOiBcIlwiLFxyXG4gICAgICAgIGN1cnJlbnRTb25nbHlyaWNzIGFzIHN0cmluZyxcclxuICAgICAgICBzZXR0aW5ncy5ob3N0TmFtZSxcclxuICAgICAgICBzZXR0aW5ncy5yYWRpb1N0YXRpb25cclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiR2VuZXJhdGVkIHN5c3RlbVByb21wdDpcIiwgc3lzdGVtUHJvbXB0KTtcclxuICAgICAgY29uc29sZS5sb2coXCJHZW5lcmF0ZWQgY3VycmVudFRhc2s6XCIsIGN1cnJlbnRUYXNrKTtcclxuXHJcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGF3YWl0IEFQSVV0aWxzLmNhbGxMTE0oc3lzdGVtUHJvbXB0LCBjdXJyZW50VGFzaywgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coXCJHZW5lcmF0ZWQgc2NyaXB0OlwiLCBzY3JpcHQpO1xyXG5cclxuICAgICAgdGhpcy5zY3JpcHRIaXN0b3J5LnB1c2goc2NyaXB0KTtcclxuXHJcbiAgICAgIGxldCBhdWRpb0RhdGEgPSB7fTtcclxuICAgICAgY29uc3QgcHJvdmlkZXIgPVxyXG4gICAgICAgIHNldHRpbmdzLnR0c1Byb3ZpZGVyIHx8XHJcbiAgICAgICAgKHNldHRpbmdzLmZpc2hBcGlLZXlcclxuICAgICAgICAgID8gXCJmaXNoLWF1ZGlvXCJcclxuICAgICAgICAgIDogc2V0dGluZ3MubXVyZkFwaUtleVxyXG4gICAgICAgICAgICA/IFwibXVyZlwiXHJcbiAgICAgICAgICAgIDogXCJmaXNoLWF1ZGlvXCIpO1xyXG5cclxuICAgICAgaWYgKHByb3ZpZGVyID09PSBcImZpc2gtYXVkaW9cIikge1xyXG4gICAgICAgIGlmICghc2V0dGluZ3MuZmlzaEFwaUtleSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBcIkZpc2ggQXVkaW8gQVBJIGtleSBub3QgY29uZmlndXJlZC4gUGxlYXNlIGFkZCBpdCBpbiBleHRlbnNpb24gc2V0dGluZ3MuXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlZklkID0gc2V0dGluZ3Mudm9pY2VJZCB8fCBcImJhMWEzODk0NmRlYTQ0NjA5ZmM0YThmZTYxMTNlZDg4XCI7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5maXNoQXVkaW9UVFMuc3ludGhlc2l6ZShzY3JpcHQsIHNldHRpbmdzLmZpc2hBcGlLZXksIHJlZklkKTtcclxuICAgICAgICBhdWRpb0RhdGEgPSB7XHJcbiAgICAgICAgICBhdWRpb0Jsb2I6IHRoaXMuZmlzaEF1ZGlvVFRTLnRvQmxvYigpLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgPT09IFwibXVyZlwiKSB7XHJcbiAgICAgICAgaWYgKCFzZXR0aW5ncy5tdXJmQXBpS2V5KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIFwiTXVyZi5haSBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBQbGVhc2UgYWRkIGl0IGluIGV4dGVuc2lvbiBzZXR0aW5ncy5cIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXVkaW9EYXRhID0gYXdhaXQgQVBJVXRpbHMuY2FsbE11cmZBUEkoXHJcbiAgICAgICAgICBzY3JpcHQsXHJcbiAgICAgICAgICBzZXR0aW5ncy5tdXJmQXBpS2V5LFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VJZCxcclxuICAgICAgICAgIHNldHRpbmdzLnZvaWNlU3R5bGVcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEZhbGxiYWNrIHRvIEdvb2dsZSBUVFNcclxuICAgICAgICBsZXQgbGFuZyA9IHNldHRpbmdzLnZvaWNlSWQgfHwgdGhpcy50dHNWb2ljZTtcclxuICAgICAgICAvLyBJZiBpdCBsb29rcyBsaWtlIGFuIEVkZ2UgVFRTIHZvaWNlIElEIChlLmcuLCBlbi1VUy1BcmlhTmV1cmFsKSwgZXh0cmFjdCB0aGUgbGFuZyBwYXJ0XHJcbiAgICAgICAgaWYgKGxhbmcuaW5jbHVkZXMoXCItXCIpICYmIGxhbmcuc3BsaXQoXCItXCIpLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgIGxhbmcgPSBsYW5nLnNwbGl0KFwiLVwiKS5zbGljZSgwLCAyKS5qb2luKFwiLVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMuZ29vZ2xlVFRTLnN5bnRoZXNpemUoc2NyaXB0LCBsYW5nKTtcclxuICAgICAgICBhdWRpb0RhdGEgPSB7XHJcbiAgICAgICAgICBhdWRpb0Jsb2I6IHRoaXMuZ29vZ2xlVFRTLnRvQmxvYigpLFxyXG4gICAgICAgICAgLy8gYXVkaW9Vcmw6IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5nb29nbGVUVFMudG9CbG9iKCkpLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExvZyB0aGUgY29tbWVudGFyeVxyXG4gICAgICBBUElVdGlscy5sb2dDb21tZW50YXJ5KFxyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUsXHJcbiAgICAgICAgdGhpcy5uZXh0VmlkZW9UaXRsZSxcclxuICAgICAgICBzY3JpcHRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhID0gYXVkaW9EYXRhOyAvLyBTdG9yZSBnZW5lcmF0ZWQgYXVkaW8gZGF0YSBmb3IgbGF0ZXIgdXNlXHJcblxyXG4gICAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiUkogQ29tbWVudGFyeSBnZW5lcmF0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICBEb21VdGlscy5zaG93RXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBwbGF5UkpDb21tZW50YXJ5KCkge1xyXG4gICAgY29uc3QgYXVkaW9CbG9iID0gdGhpcy5nZW5lcmF0ZWRBdWRpb0RhdGE/LmF1ZGlvQmxvYjtcclxuXHJcbiAgICBpZiAoIWF1ZGlvQmxvYikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiTm8gYXVkaW8gZGF0YSBhdmFpbGFibGUgdG8gcGxheS5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc1JKUGxheWluZykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIlJKIGFscmVhZHkgcGxheWluZywgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCB2aWRlbyA9IFlvdVR1YmVVdGlscy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICghdmlkZW8pIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiTm8gdmlkZW8gZWxlbWVudCBmb3VuZCBvbiB0aGUgcGFnZS5cIik7XHJcbiAgICAgICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRHVjayB0aGUgWW91VHViZSB2aWRlbyB2b2x1bWUgdXNpbmcgdXRpbGl0eVxyXG4gICAgICB0aGlzLm9yaWdpbmFsVm9sdW1lID0gYXdhaXQgQXVkaW9VdGlscy5kdWNrVm9sdW1lKHZpZGVvLCAwLjEpO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBwbGF5IFJKIGF1ZGlvIHVzaW5nIHV0aWxpdHlcclxuICAgICAgY29uc3QgeyBhdWRpbywgYXVkaW9VcmwgfSA9IEF1ZGlvVXRpbHMuY3JlYXRlQXVkaW8oYXVkaW9CbG9iKTtcclxuXHJcbiAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gZXJyb3I6XCIsIGVycm9yKTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUGxheSBhdWRpb1xyXG4gICAgICBhd2FpdCBBdWRpb1V0aWxzLnBsYXlBdWRpbyhhdWRpbykuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIHBsYXliYWNrIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcGxheWluZyBSSiBjb21tZW50YXJ5OlwiLCBlcnJvcik7XHJcbiAgICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdm9sdW1lXHJcbiAgICAgIGlmICh2aWRlbykge1xyXG4gICAgICAgIGF3YWl0IEF1ZGlvVXRpbHMucmVzdG9yZVZvbHVtZSh2aWRlbywgdGhpcy5vcmlnaW5hbFZvbHVtZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhID0gbnVsbDsgLy8gQ2xlYXIgYXVkaW8gZGF0YSBhZnRlciBwbGF5YmFja1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIGF1ZGlvVXJsOiBzdHJpbmcpIHtcclxuICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdm9sdW1lIHVzaW5nIHV0aWxpdHlcclxuICAgIGF3YWl0IEF1ZGlvVXRpbHMucmVzdG9yZVZvbHVtZSh2aWRlbywgdGhpcy5vcmlnaW5hbFZvbHVtZSk7XHJcblxyXG4gICAgLy8gQ2xlYW4gdXAgYXVkaW8gVVJMXHJcbiAgICBpZiAoYXVkaW9VcmwpIHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChhdWRpb1VybCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgY29uc29sZS5sb2coXCJSSiBjb21tZW50YXJ5IGNsZWFudXAgY29tcGxldGVkXCIpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgdG9nZ2xlUkpNb2RlKCkge1xyXG4gICAgdGhpcy5pc1JKTW9kZUFjdGl2ZSA9ICF0aGlzLmlzUkpNb2RlQWN0aXZlO1xyXG4gICAgRG9tVXRpbHMudXBkYXRlUkpNb2RlQnV0dG9uKHRoaXMuaXNSSk1vZGVBY3RpdmUpO1xyXG5cclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRSSk1vZGUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcFJKTW9kZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RhcnRSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICB0aGlzLnNldHVwVmlkZW9FdmVudExpc3RlbmVycygpO1xyXG4gIH1cclxuXHJcbiAgc3RvcFJKTW9kZSgpIHtcclxuICAgIHRoaXMuaXNSSk1vZGVBY3RpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IGZhbHNlO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSBcIlwiO1xyXG4gICAgRG9tVXRpbHMudXBkYXRlUkpNb2RlQnV0dG9uKGZhbHNlKTtcclxuXHJcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0cyBhbmQgaW50ZXJ2YWxzXHJcbiAgICBpZiAodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlkZW9DaGFuZ2VUaW1lb3V0KTtcclxuICAgICAgdGhpcy52aWRlb0NoYW5nZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5wcm9ncmVzc0ludGVydmFsKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCBhbnkgbG9hZGluZyBpbmRpY2F0b3JzXHJcbiAgICBEb21VdGlscy5oaWRlTG9hZGluZ0luZGljYXRvcigpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiUkogTW9kZSBzdG9wcGVkIGFuZCBjbGVhbmVkIHVwXCIpO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgLy8gUHJvZ3Jlc3MgY2hlY2sgaW50ZXJ2YWxcclxuXHJcbiAgICAvLyBNb25pdG9yIHZpZGVvIHByb2dyZXNzXHJcbiAgICBjb25zdCBjaGVja1ZpZGVvUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tWaWRlb1Byb2dyZXNzIGNhbGxlZFwiKTtcclxuICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgICAgIGlmICghdmlkZW8gfHwgIXRoaXMuaXNSSk1vZGVBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVSZW1haW5pbmcgPSB2aWRlby5kdXJhdGlvbiAtIHZpZGVvLmN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gZ2VuZXJhdGUgY29tbWVudGFyeSBhbmQga2VlcCBpdCByZWFkeSAxMCBzZWNvbmRzIGFmZXIgdmlkZW8gc3RhcnRzXHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA+IDEwICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSAmJlxyXG4gICAgICAgICF0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVJKQ29tbWVudGFyeSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFydCBjb21tZW50YXJ5IHdoZW4gMzAgc2Vjb25kcyByZW1haW4gYW5kIG5vdCBhbHJlYWR5IHBsYXlpbmdcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRpbWVSZW1haW5pbmcgPD0gMzAgJiZcclxuICAgICAgICAhdGhpcy5pc1JKUGxheWluZyAmJlxyXG4gICAgICAgICF0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnlcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5UkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHVwIHZpZGVvIHByb2dyZXNzIG1vbml0b3JpbmdcclxuICAgIGNvbnN0IHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9ncmVzc0ludGVydmFsKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrVmlkZW9Qcm9ncmVzcywgMTAwMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENsZWFyIHByb2dyZXNzIG1vbml0b3JpbmdcclxuXHJcbiAgICAvLyBTdGFydCBtb25pdG9yaW5nIHdoZW4gUkogbW9kZSBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIGRpYWdub3N0aWNzIHRyaWdnZXJzIGZyb20gdGhlIGV4dGVuc2lvbiBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIF9zZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmIChcclxuICAgIHJlcXVlc3Q/LmFjdGlvbiA9PT0gXCJnZW5lcmF0ZVJKQ29tbWVudGFyeVwiIHx8XHJcbiAgICByZXF1ZXN0Py5hY3Rpb24gPT09IFwicGxheVJKQ29tbWVudGFyeVwiXHJcbiAgKSB7XHJcbiAgICBjb25zdCByaiA9ICh3aW5kb3cgYXMgYW55KS55b3V0dWJlUko7XHJcbiAgICBpZiAoIXJqKSB7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJSSiBpbnN0YW5jZSBub3QgYXZhaWxhYmxlIG9uIHRoaXMgcGFnZVwiIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBmbiA9XHJcbiAgICAgIHJlcXVlc3QuYWN0aW9uID09PSBcImdlbmVyYXRlUkpDb21tZW50YXJ5XCJcclxuICAgICAgICA/IHJqLmdlbmVyYXRlUkpDb21tZW50YXJ5LmJpbmQocmopXHJcbiAgICAgICAgOiByai5wbGF5UkpDb21tZW50YXJ5LmJpbmQocmopO1xyXG4gICAgZm4oKVxyXG4gICAgICAudGhlbigoKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pKVxyXG4gICAgICAuY2F0Y2goKGVycjogYW55KSA9PlxyXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyPy5tZXNzYWdlIHx8IFN0cmluZyhlcnIpIH0pXHJcbiAgICAgICk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuXHJcbi8vIEluaXRpYWxpemUgd2hlbiBwYWdlIGxvYWRzXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgIGNvbnN0IHlvdXR1YmVSSiA9IG5ldyBZb3VUdWJlUkpNb2RlKCk7XHJcbiAgICAod2luZG93IGFzIGFueSkueW91dHViZVJKID0geW91dHViZVJKO1xyXG4gICAgY29uc29sZS5sb2coeW91dHViZVJKKTtcclxuICB9KTtcclxufSBlbHNlIHtcclxuICBjb25zdCB5b3V0dWJlUkogPSBuZXcgWW91VHViZVJKTW9kZSgpO1xyXG4gICh3aW5kb3cgYXMgYW55KS55b3V0dWJlUkogPSB5b3V0dWJlUko7XHJcbiAgY29uc29sZS5sb2coeW91dHViZVJKKTtcclxufVxyXG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRU8sSUFBTSxtQkFBbUI7QUFBQSxFQUM5QixjQUFjO0FBQUEsRUFDZCxZQUFZO0FBQUEsRUFDWixZQUFZO0FBQUEsRUFDWixrQkFBa0I7QUFBQSxFQUNsQixpQkFBaUI7QUFBQSxFQUNqQixhQUFhO0FBQUEsRUFDYixhQUFhO0FBQUEsRUFDYixTQUFTO0FBQUEsRUFDVCxrQkFBa0I7QUFBQSxFQUNsQixTQUFTO0FBQUEsRUFDVCxZQUFZO0FBQUEsRUFDWixnQkFBZ0I7QUFBQSxFQUNoQixpQkFBaUI7QUFBQSxFQUNqQixXQUFXO0FBQUEsRUFDWCxlQUFlO0FBQUEsRUFDZixVQUFVO0FBQUEsRUFDVixjQUFjO0FBQ2hCO0FBR0EsSUFBTSxpQkFBaUIsWUFBWTtBQUFBLEVBQ2pDLE1BQU0sU0FBUyxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUk7QUFBQSxFQUM3QyxPQUFPLEtBQUsscUJB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QUFBLFFBQzdCLEtBQUsscUJBQXFCO0FBQUEsTUFDNUI7QUFBQSxNQUdBLElBQ0UsaUJBQWlCLE1BQ2pCLENBQUMsS0FBSyxlQUNOLENBQUMsS0FBSyx3QkFDTjtBQUFBLFFBQ0EsS0FBSyxpQkFBaUI7QUFBQSxNQUN4QjtBQUFBO0FBQUEsSUFJRixNQUFNLDBCQUEwQixNQUFNO0FBQUEsTUFDcEMsSUFBSSxLQUFLLGtCQUFrQjtBQUFBLFFBQ3pCLGNBQWMsS0FBSyxnQkFBZ0I7QUFBQSxNQUNyQztBQUFBLE1BQ0EsS0FBSyxtQkFBbUIsWUFBWSxvQkFBb0IsSUFBSTtBQUFBO0FBQUEsSUFNOUQsSUFBSSxLQUFLLGdCQUFnQjtBQUFBLE1BQ3ZCLHdCQUF3QjtBQUFBLElBQzFCO0FBQUE7QUFFSjtBQUdBLE9BQU8sUUFBUSxVQUFVLFlBQVksQ0FBQyxTQUFTLFNBQVMsaUJBQWlCO0FBQUEsRUFDdkUsSUFDRSxTQUFTLFdBQVcsMEJBQ3BCLFNBQVMsV0FBVyxvQkFDcEI7QUFBQSxJQUNBLE1BQU0sS0FBTSxPQUFlO0FBQUEsSUFDM0IsSUFBSSxDQUFDLElBQUk7QUFBQSxNQUNQLGFBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyx5Q0FBeUMsQ0FBQztBQUFBLE1BQ2hGLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLEtBQ0osUUFBUSxXQUFXLHlCQUNmLEdBQUcscUJBQXFCLEtBQUssRUFBRSxJQUMvQixHQUFHLGlCQUFpQixLQUFLLEVBQUU7QUFBQSxJQUNqQyxHQUFHLEVBQ0EsS0FBSyxNQUFNLGFBQWEsRUFBRSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQzFDLE1BQU0sQ0FBQyxRQUNOLGFBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxLQUFLLFdBQVcsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUNyRTtBQUFBLElBQ0YsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxDQUNSO0FBR0QsSUFBSSxTQUFTLGVBQWUsV0FBVztBQUFBLEVBQ3JDLFNBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBQUEsSUFDbEQsTUFBTSxZQUFZLElBQUk7QUFBQSxJQUNyQixPQUFlLFlBQVk7QUFBQSxJQUM1QixRQUFRLElBQUksU0FBUztBQUFBLEdBQ3RCO0FBQ0gsRUFBTztBQUFBLEVBQ0wsTUFBTSxZQUFZLElBQUk7QUFBQSxFQUNyQixPQUFlLFlBQVk7QUFBQSxFQUM1QixRQUFRLElBQUksU0FBUztBQUFBOyIsCiAgImRlYnVnSWQiOiAiM0QwRjlFMzUxRkY1NTNGOTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
