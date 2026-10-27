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

// src/utils/logger.ts
var levelPriority = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};
var config = { enabled: true, level: "warn" };
var applySettings = (settings) => {
  const level = settings.logLevel;
  config = {
    enabled: typeof settings.loggingEnabled === "boolean" ? settings.loggingEnabled : true,
    level: typeof level === "string" && level in levelPriority ? level : "warn"
  };
};
chrome.storage.sync.get(["loggingEnabled", "logLevel"], applySettings);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync")
    return;
  if (changes.loggingEnabled || changes.logLevel) {
    applySettings({
      loggingEnabled: changes.loggingEnabled?.newValue ?? config.enabled,
      logLevel: changes.logLevel?.newValue ?? config.level
    });
  }
});
var write = (level, message, ...details) => {
  if (!config.enabled || levelPriority[level] < levelPriority[config.level])
    return;
  if (level === "debug")
    console.debug(`[YouTube RJ][DEBUG] ${message}`, ...details);
  else if (level === "info")
    console.info(`[YouTube RJ][INFO] ${message}`, ...details);
  else if (level === "warn")
    console.warn(`[YouTube RJ][WARN] ${message}`, ...details);
  else
    console.error(`[YouTube RJ][ERROR] ${message}`, ...details);
};
var Logger = {
  debug: (message, ...details) => write("debug", message, ...details),
  info: (message, ...details) => write("info", message, ...details),
  warn: (message, ...details) => write("warn", message, ...details),
  error: (message, ...details) => write("error", message, ...details)
};
var logger_default = Logger;

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
  loggingEnabled: true,
  logLevel: "warn",
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
async function callGeminiAPI(prompt, apiKey) {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
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
  }).catch((error) => logger_default.error("Failed to save commentary log", error));
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
      logger_default.error("Audio context creation failed", error);
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
    await new Promise((resolve) => {
      for (let i = 0;i < steps; i++) {
        setTimeout(() => {
          const newVolume = Math.max(0, Math.min(1, startVolume + volumeStep * (i + 1)));
          video.volume = newVolume;
          if (i === steps - 1)
            resolve();
        }, timeStep * (i + 1));
      }
    });
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
      logger_default.error("Commentary audio element reported an error", error);
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
var isYouTubeMusic = () => window.location.hostname.includes("music.youtube.com");
var YouTubeUtils = {
  extractVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");
    return videoId || null;
  },
  isYouTubeMusic,
  getCurrentVideoTitle() {
    if (isYouTubeMusic()) {
      const playerBarTitleEl = document.querySelector(".title.style-scope.ytmusic-player-bar");
      const subtitle = playerBarTitleEl?.nextElementSibling?.textContent?.trim().split(/\n/).map((s) => s.trim()).join(" ");
      const playerBarTitle = playerBarTitleEl?.textContent?.trim();
      if (playerBarTitle)
        return `${playerBarTitle} - ${subtitle}`;
      const items = Array.from(document.querySelectorAll("ytmusic-responsive-list-item-renderer"));
      const current = items.find((it) => {
        const state = it.getAttribute("play-button-state");
        return state === "playing" || state === "paused";
      });
      const currentTitle = current?.querySelector("yt-formatted-string.title")?.textContent?.trim();
      if (currentTitle)
        return currentTitle;
      const vid = this.extractVideoId();
      if (vid) {
        const byVid = items.find((it) => (it.innerHTML || "").includes(vid));
        const title = byVid?.querySelector("yt-formatted-string.title")?.textContent?.trim();
        if (title)
          return title;
      }
      const queueTitle = document.querySelector("ytmusic-player-queue-item .song-title")?.textContent?.trim();
      if (queueTitle)
        return queueTitle;
      return document.querySelector(".ytp-title-link")?.textContent?.trim() || "";
    }
    const titleElement = document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer");
    return titleElement?.textContent?.trim() || "";
  },
  getDescription() {
    if (isYouTubeMusic())
      return "";
    return document?.querySelector("#description-inner")?.textContent?.trim() || "";
  },
  getComments() {
    if (isYouTubeMusic())
      return [];
    let allComments = [];
    document.querySelectorAll("#comment-container").forEach((item) => {
      let txt = item.querySelector("#expander")?.textContent?.trim() || "";
      allComments.push(txt);
    });
    return allComments;
  },
  getNextVideoTitle() {
    if (isYouTubeMusic()) {
      const playingItem = document.querySelectorAll('[play-button-state="playing"]')[1];
      const text = (playingItem?.nextSibling?.textContent || "").trim().split(/\n/).map((s) => s.trim()).filter(Boolean).join(" | ");
      return text;
    }
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
          logger_default.error("Google TTS runtime messaging failed", chrome.runtime.lastError);
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response || !response.success) {
          logger_default.error("Google TTS request failed", response?.error);
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
          logger_default.error("Could not decode Google TTS audio", error);
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
          logger_default.error("Fish Audio runtime messaging failed", chrome.runtime.lastError);
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response || !response.success) {
          logger_default.error("Fish Audio request failed", response?.error);
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
          logger_default.error("Could not decode Fish Audio data", error);
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
    this.setupAudioContext();
    this.detectPlaylist();
    dom_utils_default.createRJModeButton(this.toggleRJMode.bind(this));
    const settings = await api_utils_default.getAPISettings();
    if (settings.autoStart && youtube_utils_default.isPlaylistPage()) {
      await this.startRJMode();
      dom_utils_default.updateRJModeButton(true);
      logger_default.info("RJ mode started automatically for playlist");
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
      logger_default.debug("Skipped commentary generation because audio work is active");
      return;
    }
    const videoId = youtube_utils_default.extractVideoId() || this.currentVideoTitle;
    if (videoId === this.lastProcessedVideo) {
      logger_default.debug("Skipped commentary generation for an already processed track");
      return;
    }
    if (!this.currentVideoTitle || this.currentVideoTitle.trim() === "") {
      logger_default.debug("Skipped commentary generation because the current track title is unavailable");
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
        logger_default.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:", lyricsError);
      }
      const settings = await api_utils_default.getAPISettings();
      const { systemPrompt, currentTask } = api_utils_default.generateRJPrompt(this.currentVideoTitle, this.nextVideoTitle, settings.rjStyle, settings.commentaryLength, settings.includeHistory ? this.scriptHistory.join(`
`) : "", settings.includeComments ? youtube_utils_default.getComments().join(`
`) : "", currentSonglyrics, settings.hostName, settings.radioStation);
      const script = await api_utils_default.callLLM(systemPrompt, currentTask, settings);
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
      logger_default.info("Commentary audio is ready");
      dom_utils_default.hideLoadingIndicator();
    } catch (error) {
      logger_default.error("Commentary generation failed", error);
      dom_utils_default.hideLoadingIndicator();
      dom_utils_default.showErrorMessage(error.message);
    } finally {
      this.isGeneratingCommentary = false;
    }
  }
  async playRJCommentary() {
    const audioBlob = this.generatedAudioData?.audioBlob;
    if (!audioBlob) {
      logger_default.warn("Playback requested before commentary audio was ready");
      return;
    }
    if (this.isRJPlaying) {
      return;
    }
    this.isRJPlaying = true;
    const video = youtube_utils_default.getVideoElement();
    try {
      if (!video) {
        logger_default.error("Could not play commentary because the YouTube video element was unavailable");
        this.isRJPlaying = false;
        return;
      }
      const settings = await api_utils_default.getAPISettings();
      const duckingDb = -(Math.max(0, Math.min(100, settings.volumeDucking)) / 100) * 24;
      const duckLevel = Math.pow(10, duckingDb / 20);
      this.originalVolume = await audio_utils_default.duckVolume(video, duckLevel);
      const { audio, audioUrl } = audio_utils_default.createAudio(audioBlob);
      audio.addEventListener("ended", () => {
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
      audio.addEventListener("error", (error) => {
        logger_default.error("Commentary audio playback error", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
      await audio_utils_default.playAudio(audio).catch((error) => {
        logger_default.error("Commentary audio playback failed", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
    } catch (error) {
      logger_default.error("Could not play commentary", error);
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
    logger_default.info("Commentary playback finished");
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
    logger_default.info("RJ mode started");
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
    logger_default.info("RJ mode stopped");
  }
  setupVideoEventListeners() {
    const checkVideoProgress = () => {
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
  });
} else {
  const youtubeRJ = new YouTubeRJMode;
  window.youtubeRJ = youtubeRJ;
}

//# debugId=0709B918D5F1B05C64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3V0aWxzL2xvZ2dlci50cyIsICIuLi9zcmMvdXRpbHMvYXBpLXV0aWxzLnRzIiwgIi4uL3NyYy91dGlscy9hdWRpby11dGlscy50cyIsICIuLi9zcmMvdXRpbHMvZG9tLXV0aWxzLnRzIiwgIi4uL3NyYy91dGlscy95b3V0dWJlLXV0aWxzLnRzIiwgIi4uL3NyYy91dGlscy9nb29nbGUtdHRzLnRzIiwgIi4uL3NyYy91dGlscy9maXNoLWF1ZGlvLnRzIiwgIi4uL3NyYy9jb250ZW50LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImV4cG9ydCB0eXBlIExvZ0xldmVsID0gXCJkZWJ1Z1wiIHwgXCJpbmZvXCIgfCBcIndhcm5cIiB8IFwiZXJyb3JcIjtcblxudHlwZSBMb2dnZXJDb25maWcgPSB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIGxldmVsOiBMb2dMZXZlbDtcbn07XG5cbmNvbnN0IGxldmVsUHJpb3JpdHk6IFJlY29yZDxMb2dMZXZlbCwgbnVtYmVyPiA9IHtcbiAgZGVidWc6IDEwLFxuICBpbmZvOiAyMCxcbiAgd2FybjogMzAsXG4gIGVycm9yOiA0MCxcbn07XG5cbmxldCBjb25maWc6IExvZ2dlckNvbmZpZyA9IHsgZW5hYmxlZDogdHJ1ZSwgbGV2ZWw6IFwid2FyblwiIH07XG5cbmNvbnN0IGFwcGx5U2V0dGluZ3MgPSAoc2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gIGNvbnN0IGxldmVsID0gc2V0dGluZ3MubG9nTGV2ZWw7XG4gIGNvbmZpZyA9IHtcbiAgICBlbmFibGVkOlxuICAgICAgdHlwZW9mIHNldHRpbmdzLmxvZ2dpbmdFbmFibGVkID09PSBcImJvb2xlYW5cIiA/IHNldHRpbmdzLmxvZ2dpbmdFbmFibGVkIDogdHJ1ZSxcbiAgICBsZXZlbDpcbiAgICAgIHR5cGVvZiBsZXZlbCA9PT0gXCJzdHJpbmdcIiAmJiBsZXZlbCBpbiBsZXZlbFByaW9yaXR5XG4gICAgICAgID8gKGxldmVsIGFzIExvZ0xldmVsKVxuICAgICAgICA6IFwid2FyblwiLFxuICB9O1xufTtcblxuY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoW1wibG9nZ2luZ0VuYWJsZWRcIiwgXCJsb2dMZXZlbFwiXSwgYXBwbHlTZXR0aW5ncyk7XG5jaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gIGlmIChhcmVhTmFtZSAhPT0gXCJzeW5jXCIpIHJldHVybjtcbiAgaWYgKGNoYW5nZXMubG9nZ2luZ0VuYWJsZWQgfHwgY2hhbmdlcy5sb2dMZXZlbCkge1xuICAgIGFwcGx5U2V0dGluZ3Moe1xuICAgICAgbG9nZ2luZ0VuYWJsZWQ6IGNoYW5nZXMubG9nZ2luZ0VuYWJsZWQ/Lm5ld1ZhbHVlID8/IGNvbmZpZy5lbmFibGVkLFxuICAgICAgbG9nTGV2ZWw6IGNoYW5nZXMubG9nTGV2ZWw/Lm5ld1ZhbHVlID8/IGNvbmZpZy5sZXZlbCxcbiAgICB9KTtcbiAgfVxufSk7XG5cbmNvbnN0IHdyaXRlID0gKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCAuLi5kZXRhaWxzOiB1bmtub3duW10pID0+IHtcbiAgaWYgKCFjb25maWcuZW5hYmxlZCB8fCBsZXZlbFByaW9yaXR5W2xldmVsXSA8IGxldmVsUHJpb3JpdHlbY29uZmlnLmxldmVsXSkgcmV0dXJuO1xuICBpZiAobGV2ZWwgPT09IFwiZGVidWdcIikgY29uc29sZS5kZWJ1ZyhgW1lvdVR1YmUgUkpdW0RFQlVHXSAke21lc3NhZ2V9YCwgLi4uZGV0YWlscyk7XG4gIGVsc2UgaWYgKGxldmVsID09PSBcImluZm9cIikgY29uc29sZS5pbmZvKGBbWW91VHViZSBSSl1bSU5GT10gJHttZXNzYWdlfWAsIC4uLmRldGFpbHMpO1xuICBlbHNlIGlmIChsZXZlbCA9PT0gXCJ3YXJuXCIpIGNvbnNvbGUud2FybihgW1lvdVR1YmUgUkpdW1dBUk5dICR7bWVzc2FnZX1gLCAuLi5kZXRhaWxzKTtcbiAgZWxzZSBjb25zb2xlLmVycm9yKGBbWW91VHViZSBSSl1bRVJST1JdICR7bWVzc2FnZX1gLCAuLi5kZXRhaWxzKTtcbn07XG5cbmNvbnN0IExvZ2dlciA9IHtcbiAgZGVidWc6IChtZXNzYWdlOiBzdHJpbmcsIC4uLmRldGFpbHM6IHVua25vd25bXSkgPT4gd3JpdGUoXCJkZWJ1Z1wiLCBtZXNzYWdlLCAuLi5kZXRhaWxzKSxcbiAgaW5mbzogKG1lc3NhZ2U6IHN0cmluZywgLi4uZGV0YWlsczogdW5rbm93bltdKSA9PiB3cml0ZShcImluZm9cIiwgbWVzc2FnZSwgLi4uZGV0YWlscyksXG4gIHdhcm46IChtZXNzYWdlOiBzdHJpbmcsIC4uLmRldGFpbHM6IHVua25vd25bXSkgPT4gd3JpdGUoXCJ3YXJuXCIsIG1lc3NhZ2UsIC4uLmRldGFpbHMpLFxuICBlcnJvcjogKG1lc3NhZ2U6IHN0cmluZywgLi4uZGV0YWlsczogdW5rbm93bltdKSA9PiB3cml0ZShcImVycm9yXCIsIG1lc3NhZ2UsIC4uLmRldGFpbHMpLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgTG9nZ2VyO1xuIiwKICAgICIvLyBBUEktcmVsYXRlZCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuL2xvZ2dlclwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgZ2VtaW5pQXBpS2V5OiBcIlwiLFxyXG4gIG11cmZBcGlLZXk6IFwiXCIsXHJcbiAgZmlzaEFwaUtleTogXCJcIixcclxuICBvcGVuUm91dGVyQXBpS2V5OiBcIlwiLFxyXG4gIG9wZW5Sb3V0ZXJNb2RlbDogXCJyZWN1cnNpdmUvZmxpbnQtdjEuMDpmcmVlXCIsXHJcbiAgbGxtUHJvdmlkZXI6IFwib3BlbnJvdXRlclwiIGFzIFwib3BlbnJvdXRlclwiIHwgXCJjaGF0amltbXlcIiB8IFwiZ2VtaW5pXCIsXHJcbiAgdHRzUHJvdmlkZXI6IFwiZmlzaC1hdWRpb1wiIGFzIGNvbnN0LFxyXG4gIHJqU3R5bGU6IFwic2FyY2FzdGljXCIsXHJcbiAgY29tbWVudGFyeUxlbmd0aDogXCJzaG9ydFwiLFxyXG4gIHZvaWNlSWQ6IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIixcclxuICB2b2ljZVN0eWxlOiBcIlByb21vXCIsXHJcbiAgaW5jbHVkZUhpc3Rvcnk6IGZhbHNlLFxyXG4gIGluY2x1ZGVDb21tZW50czogZmFsc2UsXHJcbiAgYXV0b1N0YXJ0OiBmYWxzZSxcclxuICB2b2x1bWVEdWNraW5nOiA1MCxcclxuICBsb2dnaW5nRW5hYmxlZDogdHJ1ZSxcclxuICBsb2dMZXZlbDogXCJ3YXJuXCIgYXMgY29uc3QsXHJcbiAgaG9zdE5hbWU6IFwiQWxleGlzXCIsXHJcbiAgcmFkaW9TdGF0aW9uOiBcIjk3LjcgWW91dHViZSBGTVwiLFxyXG59O1xyXG5cclxuLy8gR2V0IHN0b3JlZCBBUEkgc2V0dGluZ3Mgd2l0aCBkZWZhdWx0c1xyXG5jb25zdCBnZXRBUElTZXR0aW5ncyA9IGFzeW5jICgpID0+IHtcclxuICBjb25zdCBzdG9yZWQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgpO1xyXG4gIHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIC4uLnN0b3JlZCB9O1xyXG59O1xyXG5cclxuY29uc3Qgc3R5bGVQcm9tcHRzID0ge1xyXG4gIGVuZXJnZXRpYzpcclxuICAgIFwiWW91IGFyZSBhIGhpZ2gtZW5lcmd5IHJhZGlvIERKIHdobydzIGFic29sdXRlbHkgcHVtcGVkIGFib3V0IG11c2ljIVwiLFxyXG4gIGNoaWxsOiBcIllvdSBhcmUgYSBsYWlkLWJhY2sgREogd2l0aCBhIHNtb290aCwgcmVsYXhlZCB2aWJlLlwiLFxyXG4gIHNhcmNhc3RpYzpcclxuICAgIFwiWW91IGFyZSBhIHdpdHR5IERKIHdobyBhZGRzIGNsZXZlciBjb21tZW50YXJ5IHdpdGggYSB0b3VjaCBvZiBzYXJjYXNtLlwiLFxyXG4gIHByb2Zlc3Npb25hbDogXCJZb3UgYXJlIGEgcHJvZmVzc2lvbmFsIHJhZGlvIGhvc3Qgd2l0aCBwb2xpc2hlZCBkZWxpdmVyeS5cIixcclxufTtcclxuXHJcbmNvbnN0IGxlbmd0aEd1aWRlcyA9IHtcclxuICBzaG9ydDogXCJLZWVwIGl0IGJyaWVmIGFuZCBwdW5jaHkgKDIwLTMwIHNlY29uZHMgd2hlbiBzcG9rZW4pXCIsXHJcbiAgbWVkaXVtOiBcIk1vZGVyYXRlIGxlbmd0aCB3aXRoIGdvb2QgZmxvdyAoMzAtNDUgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxuICBsb25nOiBcIk1vcmUgZGV0YWlsZWQgY29tbWVudGFyeSAoNDUtNjAgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxufTtcclxuXHJcbi8vIEdlbmVyYXRlIFJKIHByb21wdCBiYXNlZCBvbiBzZXR0aW5nc1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVJKUHJvbXB0KFxyXG4gIGN1cnJlbnRTb25nOiBzdHJpbmcsXHJcbiAgbmV4dFNvbmc6IHN0cmluZyB8IG51bGwsXHJcbiAgc3R5bGU6IGtleW9mIHR5cGVvZiBzdHlsZVByb21wdHMsXHJcbiAgbGVuZ3RoOiBrZXlvZiB0eXBlb2YgbGVuZ3RoR3VpZGVzLFxyXG4gIHNjcmlwdEhpc3Rvcnk6IHN0cmluZyB8IG51bGwsXHJcbiAgY29tbWVudHM6IHN0cmluZyB8IG51bGwsXHJcbiAgY3VycmVudFNvbmdseXJpY3M6IHN0cmluZyB8IG51bGwsXHJcbiAgaG9zdE5hbWU/OiBzdHJpbmcsXHJcbiAgcmFkaW9TdGF0aW9uPzogc3RyaW5nXHJcbik6IHsgc3lzdGVtUHJvbXB0OiBzdHJpbmc7IGN1cnJlbnRUYXNrOiBzdHJpbmcgfSB7XHJcbiAgY29uc3QgYmFzZVByb21wdCA9IHN0eWxlUHJvbXB0c1tzdHlsZV0gfHwgc3R5bGVQcm9tcHRzLmVuZXJnZXRpYztcclxuICBjb25zdCBsZW5ndGhHdWlkZSA9IGxlbmd0aEd1aWRlc1tsZW5ndGhdIHx8IGxlbmd0aEd1aWRlcy5tZWRpdW07XHJcblxyXG4gIGNvbnN0IHJlc29sdmVkSG9zdE5hbWUgPSBob3N0TmFtZSB8fCBERUZBVUxUX1NFVFRJTkdTLmhvc3ROYW1lO1xyXG4gIGNvbnN0IHJlc29sdmVkUmFkaW9TdGF0aW9uID0gcmFkaW9TdGF0aW9uIHx8IERFRkFVTFRfU0VUVElOR1MucmFkaW9TdGF0aW9uO1xyXG5cclxuICBjb25zdCByYWRpb0luZm8gPSBgUmFkaW8gc3RhdGlvbjogJHtyZXNvbHZlZFJhZGlvU3RhdGlvbn1cclxuSG9zdCBuYW1lOiAke3Jlc29sdmVkSG9zdE5hbWV9YDtcclxuXHJcbiAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYCR7YmFzZVByb21wdH0gJHtsZW5ndGhHdWlkZX0uICR7cmFkaW9JbmZvfS5cclxuXHJcbkltcG9ydGFudCBndWlkZWxpbmVzOlxyXG4tIEFWT0lEIHVzaW5nIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IGFyZSBub3QgZGV0ZWN0ZWQgYnkgVFRTIGluIHRoZSBjb21tZW50YXJ5LCB5b3VyIG91dHB1dCB3aWxsIGJlIHVzZWQgdG8gZ2VuZXJhdGUgYXVkaW8uXHJcbi0gQVZPSUQgZXhwcmVzc2lvbnMgaW4gYnJhY2tldHMgb3IgcGFyZW50aGVzZXMuXHJcbi0gQVZPSUQgc2F5aW5nIEFscmlnaHQgYW5kIE9rYXkgb2theSBvciBzaW1pbGFyIHBocmFzZXMgYXQgdGhlIGJlZ2lubmluZy4gQ29vayB1cCBuZXcgaW50cm9zLlxyXG4tIENSRUFURSBlbmdhZ2luZyBjb21tZW50YXJ5IHRoYXQgY29ubmVjdHMgd2l0aCBsaXN0ZW5lcnMuIEJlIG5hdHVyYWwsIGVudGh1c2lhc3RpYywgYW5kIGFkZCBwZXJzb25hbGl0eS4gRG9uJ3QgcmVhZCB0aGUgc29uZyB0aXRsZXMgLSBtYWtlIGl0IGNvbnZlcnNhdGlvbmFsIGFuZCBmdW4hXHJcbi0gT05MWSByZXNwb25kIHdpdGggdGhlIGNvbW1lbnRhcnkgdGV4dCwgZG8gbm90IGluY2x1ZGUgYW55IGFkZGl0aW9uYWwgaW5zdHJ1Y3Rpb25zIG9yIGV4cGxhbmF0aW9ucy5gLnRyaW0oKTtcclxuXHJcbiAgbGV0IGN1cnJlbnRUYXNrID0gYEN1cnJlbnQgc29uZzogXCIke2N1cnJlbnRTb25nfVwiYDtcclxuICBpZiAoY3VycmVudFNvbmdseXJpY3MpIHtcclxuICAgIGN1cnJlbnRUYXNrICs9IGBcXG5DdXJyZW50IHNvbmcgTHlyaWNzOiAke2N1cnJlbnRTb25nbHlyaWNzfWA7XHJcbiAgfVxyXG4gIGlmIChuZXh0U29uZykge1xyXG4gICAgY3VycmVudFRhc2sgKz0gYFxcblVwY29taW5nIFNvbmc6IFwiJHtuZXh0U29uZ31cImA7XHJcbiAgfVxyXG4gIGlmIChjb21tZW50cykge1xyXG4gICAgY3VycmVudFRhc2sgKz0gYFxcblZpZXdlciBjb21tZW50czogJHtjb21tZW50c31gO1xyXG4gIH1cclxuICBpZiAoc2NyaXB0SGlzdG9yeSkge1xyXG4gICAgY3VycmVudFRhc2sgKz0gYFxcblByZXZpb3VzIGNvbW1lbnRhcnkgaGlzdG9yeTpcXG4ke3NjcmlwdEhpc3Rvcnl9YDtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IHN5c3RlbVByb21wdCwgY3VycmVudFRhc2sgfTtcclxufVxyXG5cclxuLy8gQ2FsbCBHZW1pbmkgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbEdlbWluaUFQSShwcm9tcHQ6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpIHtcclxuICBpZiAoIWFwaUtleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2VtaW5pIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWRcIik7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgY29udGVudHM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHBhcnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IHByb21wdCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHsgYWN0aW9uOiBcImNhbGxHZW1pbmlcIiwgcGF5bG9hZCwgYXBpS2V5IH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgR2VtaW5pIEFQSVwiKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIGlmICghZGF0YS5jYW5kaWRhdGVzIHx8ICFkYXRhLmNhbmRpZGF0ZXNbMF0gfHwgIWRhdGEuY2FuZGlkYXRlc1swXS5jb250ZW50KSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgcmVzcG9uc2UgZnJvbSBHZW1pbmkgQVBJXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc29sdmUoZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQucGFydHNbMF0udGV4dCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIENhbGwgQ2hhdEppbW15IEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxDaGF0SmltbXlBUEkoXHJcbiAgc3lzdGVtUHJvbXB0T3JPYmo6IHN0cmluZyB8IHsgc3lzdGVtUHJvbXB0OiBzdHJpbmc7IGN1cnJlbnRUYXNrOiBzdHJpbmcgfSxcclxuICBjdXJyZW50VGFza0FyZz86IHN0cmluZ1xyXG4pIHtcclxuICBsZXQgc3lzdGVtUHJvbXB0OiBzdHJpbmc7XHJcbiAgbGV0IGN1cnJlbnRUYXNrOiBzdHJpbmc7XHJcblxyXG4gIGlmICh0eXBlb2Ygc3lzdGVtUHJvbXB0T3JPYmogPT09IFwib2JqZWN0XCIpIHtcclxuICAgIHN5c3RlbVByb21wdCA9IHN5c3RlbVByb21wdE9yT2JqLnN5c3RlbVByb21wdDtcclxuICAgIGN1cnJlbnRUYXNrID0gc3lzdGVtUHJvbXB0T3JPYmouY3VycmVudFRhc2s7XHJcbiAgfSBlbHNlIGlmIChjdXJyZW50VGFza0FyZyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICBzeXN0ZW1Qcm9tcHQgPSBzeXN0ZW1Qcm9tcHRPck9iajtcclxuICAgIGN1cnJlbnRUYXNrID0gY3VycmVudFRhc2tBcmc7XHJcbiAgfSBlbHNlIHtcclxuICAgIHN5c3RlbVByb21wdCA9IHN5c3RlbVByb21wdE9yT2JqO1xyXG4gICAgY3VycmVudFRhc2sgPSBzeXN0ZW1Qcm9tcHRPck9iajtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICBtZXNzYWdlczogW1xyXG4gICAgICB7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IHN5c3RlbVByb21wdCB9LFxyXG4gICAgICAvLyB7XHJcbiAgICAgIC8vICAgcm9sZTogXCJ1c2VyXCIsXHJcbiAgICAgIC8vICAgY29udGVudDogYFByZXZpb3VzOiBcIkhlbGxvXCIgYnkgQWRlbGVcXG5OZXh0OiBcIkxldml0YXRpbmdcIiBieSBEdWEgTGlwYWAsXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIC8vIHtcclxuICAgICAgLy8gICByb2xlOiBcImFzc2lzdGFudFwiLFxyXG4gICAgICAvLyAgIGNvbnRlbnQ6XHJcbiAgICAgIC8vICAgICBcIkFkZWxlIGtlZXBpbmcgaXQgZGVlcCB3aXRoIEhlbGxvLiBOb3cgbGV0J3MgcGljayB1cCB0aGUgcGFjZSwgaGVyZSBpcyBEdWEgTGlwYSB0dXJuaW5nIHVwIHRoZSBoZWF0IHdpdGggTGV2aXRhdGluZyFcIixcclxuICAgICAgLy8gfSxcclxuICAgICAgLy8ge1xyXG4gICAgICAvLyAgIHJvbGU6IFwidXNlclwiLFxyXG4gICAgICAvLyAgIGNvbnRlbnQ6IGBQcmV2aW91czogXCJIb3RlbCBDYWxpZm9ybmlhXCIgYnkgRWFnbGVzXFxuTmV4dDogXCJIdW1ibGVcIiBieSBLZW5kcmljayBMYW1hcmAsXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIC8vIHtcclxuICAgICAgLy8gICByb2xlOiBcImFzc2lzdGFudFwiLFxyXG4gICAgICAvLyAgIGNvbnRlbnQ6XHJcbiAgICAgIC8vICAgICBcIlRoYXQgd2FzIHRoZSBsZWdlbmRhcnkgRWFnbGVzLiBXZSdyZSBzd2l0Y2hpbmcgbGFuZXMgY29tcGxldGVseSBub3figJR0dXJuIHlvdXIgdm9sdW1lIHVwIGZvciBLZW5kcmljayBMYW1hci5cIixcclxuICAgICAgLy8gfSxcclxuICAgICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogY3VycmVudFRhc2sgfSxcclxuICAgIF0sXHJcbiAgICBjaGF0T3B0aW9uczoge1xyXG4gICAgICBzZWxlY3RlZE1vZGVsOiBcImxsYW1hMy4xLThCXCIsXHJcbiAgICAgIHN5c3RlbVByb21wdDogc3lzdGVtUHJvbXB0LFxyXG4gICAgICB0b3BLOiAyLFxyXG4gICAgfSxcclxuICAgIGF0dGFjaG1lbnQ6IG51bGwsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHsgYWN0aW9uOiBcImNhbGxDaGF0SmltbXlcIiwgcGF5bG9hZCB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIENoYXRKaW1teSBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0ZXh0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAvLyBUaGUgcmVzcG9uc2UgbWlnaHQgY29udGFpbiBzdGF0cyBhZnRlciA8fHN0YXRzfD4uIFdlIHdhbnQgdGhlIHBhcnQgYmVmb3JlIGl0LlxyXG4gICAgICAgIGNvbnN0IHN0YXRzSW5kZXggPSB0ZXh0LmluZGV4T2YoXCI8fHN0YXRzfD5cIik7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRleHQ7XHJcbiAgICAgICAgaWYgKHN0YXRzSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICByZXN1bHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGF0c0luZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIHBvdGVudGlhbCBxdW90ZXMgYW5kIHdoaXRlc3BhY2VcclxuICAgICAgICByZXNvbHZlKHJlc3VsdC50cmltKCkucmVwbGFjZSgvXlwifFwiJC9nLCBcIlwiKS5yZXBsYWNlKC9cXFxcbi9nLCBcIlxcblwiKS50cmltKCkpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBDYWxsIE11cmYuYWkgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbE11cmZBUEkoXHJcbiAgdGV4dDogc3RyaW5nLFxyXG4gIGFwaUtleTogc3RyaW5nLFxyXG4gIHZvaWNlSWQgPSBcImVuLVVTLW5hdGFsaWVcIixcclxuICBzdHlsZSA9IFwiUHJvbW9cIlxyXG4pIHtcclxuICBpZiAoIWFwaUtleSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTXVyZi5haSBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgIHRleHQ6IHRleHQsXHJcbiAgICB2b2ljZUlkOiB2b2ljZUlkLFxyXG4gICAgc3R5bGU6IHN0eWxlLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZTx7IGF1ZGlvQmxvYjogQmxvYjsgZHVyYXRpb246IG51bWJlcjsgcmVtYWluaW5nQ2hhcnM6IG51bWJlciB9PihcclxuICAgIChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgICAgeyBhY3Rpb246IFwiY2FsbE11cmZcIiwgcGF5bG9hZCwgYXBpS2V5IH0sXHJcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBNdXJmIEFQSVwiKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgY29uc3QgYmFzZTY0ID0gcmVzcG9uc2UuYXVkaW9CYXNlNjQ7XHJcblxyXG4gICAgICAgICAgLy8gQ29udmVydCBiYXNlNjQgdG8gQmxvYlxyXG4gICAgICAgICAgY29uc3QgYmluYXJ5U3RyaW5nID0gYXRvYihiYXNlNjQpO1xyXG4gICAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnlTdHJpbmcubGVuZ3RoKTtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J5dGVzXSwgeyB0eXBlOiBcImF1ZGlvL21wZWdcIiB9KTtcclxuXHJcbiAgICAgICAgICByZXNvbHZlKHtcclxuICAgICAgICAgICAgYXVkaW9CbG9iOiBibG9iLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogZGF0YS5hdWRpb0xlbmd0aEluU2Vjb25kcyxcclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhcnM6IGRhdGEucmVtYWluaW5nQ2hhcmFjdGVyQ291bnQsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgKTtcclxufVxyXG5cclxuLy8gQ2FsbCBGaXNoIEF1ZGlvIEFQSSB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxGaXNoQXVkaW9BUEkoXHJcbiAgdGV4dDogc3RyaW5nLFxyXG4gIGFwaUtleTogc3RyaW5nLFxyXG4gIHJlZmVyZW5jZUlkID0gXCJiYTFhMzg5NDZkZWE0NDYwOWZjNGE4ZmU2MTEzZWQ4OFwiXHJcbikge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGaXNoIEF1ZGlvIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWRcIik7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8eyBhdWRpb0Jsb2I6IEJsb2IgfT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHtcclxuICAgICAgICBhY3Rpb246IFwiY2FsbEZpc2hBdWRpb1wiLFxyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgcmVmZXJlbmNlSWQsXHJcbiAgICAgICAgYXBpS2V5LFxyXG4gICAgICB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIEZpc2ggQXVkaW8gQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gcmVzcG9uc2UuYXVkaW9CYXNlNjQ7XHJcbiAgICAgICAgY29uc3QgYmluYXJ5U3RyaW5nID0gYXRvYihiYXNlNjQpO1xyXG4gICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnlTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnl0ZXNdLCB7IHR5cGU6IFwiYXVkaW8vbXAzXCIgfSk7XHJcblxyXG4gICAgICAgIHJlc29sdmUoeyBhdWRpb0Jsb2I6IGJsb2IgfSk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIExvZyBjb21tZW50YXJ5IGZvciBleHBvcnQgZmVhdHVyZVxyXG5mdW5jdGlvbiBsb2dDb21tZW50YXJ5KGN1cnJlbnRTb25nOiBzdHJpbmcsIG5leHRTb25nOiBzdHJpbmcsIHNjcmlwdDogc3RyaW5nKSB7XHJcbiAgY2hyb21lLnJ1bnRpbWVcclxuICAgIC5zZW5kTWVzc2FnZSh7XHJcbiAgICAgIGFjdGlvbjogXCJsb2dDb21tZW50YXJ5XCIsXHJcbiAgICAgIGN1cnJlbnRTb25nLFxyXG4gICAgICBuZXh0U29uZyxcclxuICAgICAgc2NyaXB0LFxyXG4gICAgfSlcclxuICAgIC5jYXRjaCgoZXJyb3IpID0+IExvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBzYXZlIGNvbW1lbnRhcnkgbG9nXCIsIGVycm9yKSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNhbGxMeXJpY3NBUEkocXVlcnk6IHN0cmluZykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAgeyBhY3Rpb246IFwiY2FsbEx5cmljc1wiLCBxdWVyeSB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIEx5cmljcyBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICByZXNvbHZlKGRhdGE/LlswXT8ucGxhaW5MeXJpY3MpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBDYWxsIE9wZW5Sb3V0ZXIgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbE9wZW5Sb3V0ZXJBUEkoXHJcbiAgc3lzdGVtUHJvbXB0OiBzdHJpbmcsXHJcbiAgY3VycmVudFRhc2s6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICBtb2RlbD86IHN0cmluZ1xyXG4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIFwiT3BlblJvdXRlciBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBQbGVhc2UgYWRkIGl0IGluIGV4dGVuc2lvbiBzZXR0aW5ncy5cIlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1lc3NhZ2VzID0gW1xyXG4gICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBzeXN0ZW1Qcm9tcHQgfSxcclxuICAgIHsgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IGN1cnJlbnRUYXNrIH0sXHJcbiAgXTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHtcclxuICAgICAgICBhY3Rpb246IFwiY2FsbE9wZW5Sb3V0ZXJcIixcclxuICAgICAgICBhcGlLZXksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsIHx8IFwicmVjdXJzaXZlL2ZsaW50LXYxLjA6ZnJlZVwiLFxyXG4gICAgICAgIG1lc3NhZ2VzLFxyXG4gICAgICB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIE9wZW5Sb3V0ZXIgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzb2x2ZShcclxuICAgICAgICAgIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlwifFwiJC9nLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXG4vZywgXCJcXG5cIilcclxuICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFVuaWZpZWQgY2FsbExMTSByb3V0ZXIgYmFzZWQgb24gc2V0dGluZ3MubGxtUHJvdmlkZXJcclxuYXN5bmMgZnVuY3Rpb24gY2FsbExMTShcclxuICBzeXN0ZW1Qcm9tcHQ6IHN0cmluZyxcclxuICBjdXJyZW50VGFzazogc3RyaW5nLFxyXG4gIHNldHRpbmdzPzogYW55XHJcbik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgY29uc3QgY3VycmVudFNldHRpbmdzID0gc2V0dGluZ3MgfHwgKGF3YWl0IGdldEFQSVNldHRpbmdzKCkpO1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gY3VycmVudFNldHRpbmdzLmxsbVByb3ZpZGVyIHx8IFwib3BlbnJvdXRlclwiO1xyXG5cclxuICBpZiAocHJvdmlkZXIgPT09IFwib3BlbnJvdXRlclwiKSB7XHJcbiAgICByZXR1cm4gY2FsbE9wZW5Sb3V0ZXJBUEkoXHJcbiAgICAgIHN5c3RlbVByb21wdCxcclxuICAgICAgY3VycmVudFRhc2ssXHJcbiAgICAgIGN1cnJlbnRTZXR0aW5ncy5vcGVuUm91dGVyQXBpS2V5LFxyXG4gICAgICBjdXJyZW50U2V0dGluZ3Mub3BlblJvdXRlck1vZGVsXHJcbiAgICApO1xyXG4gIH0gZWxzZSBpZiAocHJvdmlkZXIgPT09IFwiZ2VtaW5pXCIpIHtcclxuICAgIHJldHVybiBjYWxsR2VtaW5pQVBJKFxyXG4gICAgICBgJHtzeXN0ZW1Qcm9tcHR9XFxuXFxuJHtjdXJyZW50VGFza31gLFxyXG4gICAgICBjdXJyZW50U2V0dGluZ3MuZ2VtaW5pQXBpS2V5XHJcbiAgICApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gY2FsbENoYXRKaW1teUFQSShzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEFQSVV0aWxzID0ge1xyXG4gIGNhbGxNdXJmQVBJLFxyXG4gIGNhbGxGaXNoQXVkaW9BUEksXHJcbiAgY2FsbEdlbWluaUFQSSxcclxuICBjYWxsQ2hhdEppbW15QVBJLFxyXG4gIGNhbGxPcGVuUm91dGVyQVBJLFxyXG4gIGNhbGxMTE0sXHJcbiAgY2FsbEx5cmljc0FQSSxcclxuICBsb2dDb21tZW50YXJ5LFxyXG4gIGdldEFQSVNldHRpbmdzLFxyXG4gIGdlbmVyYXRlUkpQcm9tcHQsXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuQVBJVXRpbHMgPSBBUElVdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQVBJVXRpbHM7XHJcblxyXG4iLAogICAgIi8vIEV4dGVuZCBXaW5kb3cgaW50ZXJmYWNlIHRvIGluY2x1ZGUgd2Via2l0QXVkaW9Db250ZXh0XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgIHdlYmtpdEF1ZGlvQ29udGV4dDogdHlwZW9mIEF1ZGlvQ29udGV4dDtcclxuICB9XHJcbn1cclxuXHJcbi8vIEF1ZGlvLXJlbGF0ZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi9sb2dnZXJcIjtcclxuY29uc3QgQXVkaW9VdGlscyA9IHtcclxuICAvLyBDcmVhdGUgYXVkaW8gY29udGV4dCB3aXRoIGZhbGxiYWNrc1xyXG4gIGNyZWF0ZUF1ZGlvQ29udGV4dCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCApKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBMb2dnZXIuZXJyb3IoXCJBdWRpbyBjb250ZXh0IGNyZWF0aW9uIGZhaWxlZFwiLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vIFNtb290aCB2b2x1bWUgdHJhbnNpdGlvblxyXG4gIGFzeW5jIHNtb290aFZvbHVtZVRyYW5zaXRpb24oXHJcbiAgICB2aWRlbzogSFRNTFZpZGVvRWxlbWVudCxcclxuICAgIHRhcmdldFZvbHVtZTogbnVtYmVyLFxyXG4gICAgZHVyYXRpb24gPSAyMDBcclxuICApIHtcclxuICAgIGlmICghdmlkZW8pIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBzdGFydFZvbHVtZSA9IHZpZGVvLnZvbHVtZTtcclxuICAgIGNvbnN0IHN0ZXBzID0gMjA7XHJcbiAgICBjb25zdCB2b2x1bWVTdGVwID0gKHRhcmdldFZvbHVtZSAtIHN0YXJ0Vm9sdW1lKSAvIHN0ZXBzO1xyXG4gICAgY29uc3QgdGltZVN0ZXAgPSBkdXJhdGlvbiAvIHN0ZXBzO1xyXG5cclxuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RlcHM7IGkrKykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgbmV3Vm9sdW1lID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIE1hdGgubWluKDEsIHN0YXJ0Vm9sdW1lICsgdm9sdW1lU3RlcCAqIChpICsgMSkpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdmlkZW8udm9sdW1lID0gbmV3Vm9sdW1lO1xyXG4gICAgICAgICAgaWYgKGkgPT09IHN0ZXBzIC0gMSkgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIHRpbWVTdGVwICogKGkgKyAxKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIC8vIER1Y2sgdm9sdW1lIHNtb290aGx5XHJcbiAgYXN5bmMgZHVja1ZvbHVtZSh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgZHVja0xldmVsID0gMC4zKSB7XHJcbiAgICBpZiAoIXZpZGVvKSByZXR1cm4gMTtcclxuXHJcbiAgICBjb25zdCBvcmlnaW5hbFZvbHVtZSA9IHZpZGVvLnZvbHVtZTtcclxuICAgIGF3YWl0IHRoaXMuc21vb3RoVm9sdW1lVHJhbnNpdGlvbih2aWRlbywgZHVja0xldmVsKTtcclxuICAgIHJldHVybiBvcmlnaW5hbFZvbHVtZTtcclxuICB9LFxyXG5cclxuICAvLyBSZXN0b3JlIHZvbHVtZSBzbW9vdGhseVxyXG4gIGFzeW5jIHJlc3RvcmVWb2x1bWUodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIHRhcmdldFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBpZiAoIXZpZGVvIHx8IHRhcmdldFZvbHVtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcbiAgICBhd2FpdCB0aGlzLnNtb290aFZvbHVtZVRyYW5zaXRpb24odmlkZW8sIHRhcmdldFZvbHVtZSwgMzAwKTtcclxuICB9LFxyXG5cclxuICAvLyBDcmVhdGUgYXVkaW8gZWxlbWVudCB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbiAgY3JlYXRlQXVkaW8oYXVkaW9CbG9iOiBCbG9iKSB7XHJcbiAgICBjb25zdCBhdWRpb1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYXVkaW9CbG9iKTtcclxuICAgIGNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKGF1ZGlvVXJsKTtcclxuXHJcbiAgICAvLyBBZGQgZXJyb3IgaGFuZGxpbmdcclxuICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgTG9nZ2VyLmVycm9yKFwiQ29tbWVudGFyeSBhdWRpbyBlbGVtZW50IHJlcG9ydGVkIGFuIGVycm9yXCIsIGVycm9yKTtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChhdWRpb1VybCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geyBhdWRpbywgYXVkaW9VcmwgfTtcclxuICB9LFxyXG5cclxuICAvLyBQbGF5IGF1ZGlvIHdpdGggcHJvbWlzZVxyXG4gIHBsYXlBdWRpbyhhdWRpbzogSFRNTEF1ZGlvRWxlbWVudCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIHJlc29sdmUpO1xyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgcmVqZWN0KTtcclxuXHJcbiAgICAgIGF1ZGlvLnBsYXkoKS5jYXRjaChyZWplY3QpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5BdWRpb1V0aWxzID0gQXVkaW9VdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQXVkaW9VdGlscztcclxuIiwKICAgICIvLyBJbi1wYWdlIERPTSBvdmVybGF5cyBzdHlsZWQgd2l0aCBOYXRpdmUgSW5zdHJ1bWVudHMgS29tcGxldGUgQnJvYWRjYXN0IEhhcmR3YXJlIEFlc3RoZXRpY1xuXG5jb25zdCBpbmplY3RIYXJkd2FyZVN0eWxlcyA9ICgpID0+IHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotaGFyZHdhcmUtc3R5bGVzXCIpKSByZXR1cm47XG5cbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIHN0eWxlLmlkID0gXCJyai1oYXJkd2FyZS1zdHlsZXNcIjtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SmV0QnJhaW5zK01vbm86d2dodEA1MDA7NzAwJmZhbWlseT1TcGFjZStHcm90ZXNrOndnaHRANTAwOzcwMCZkaXNwbGF5PXN3YXAnKTtcblxuICAgIC5yai1ody1yb290IHtcbiAgICAgIGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuXG4gICAgLnJqLWh3LW1vbm8ge1xuICAgICAgZm9udC1mYW1pbHk6ICdKZXRCcmFpbnMgTW9ubycsIHVpLW1vbm9zcGFjZSwgbW9ub3NwYWNlO1xuICAgIH1cblxuICAgIC5yai1ody1iZXZlbCB7XG4gICAgICBib3gtc2hhZG93OiBpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsMC44KSwgMCA4cHggMjRweCByZ2JhKDAsMCwwLDAuODUpO1xuICAgIH1cblxuICAgIC5yai1ody1yZWNlc3NlZCB7XG4gICAgICBib3gtc2hhZG93OiBpbnNldCAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjkpLCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4wNSk7XG4gICAgfVxuXG4gICAgLnJqLWdsb3ctY3lhbiB7XG4gICAgICBib3gtc2hhZG93OiAwIDAgMTJweCByZ2JhKDAsIDIxMCwgMTk2LCAwLjUpLCBpbnNldCAwIDAgNnB4IHJnYmEoMCwgMjEwLCAxOTYsIDAuMyk7XG4gICAgfVxuXG4gICAgLnJqLWdsb3ctYW1iZXIge1xuICAgICAgYm94LXNoYWRvdzogMCAwIDEycHggcmdiYSgyNTUsIDE1OCwgMjcsIDAuNSksIGluc2V0IDAgMCA2cHggcmdiYSgyNTUsIDE1OCwgMjcsIDAuMyk7XG4gICAgfVxuXG4gICAgQGtleWZyYW1lcyByalBpbmcge1xuICAgICAgMCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEpOyBvcGFjaXR5OiAwLjg7IH1cbiAgICAgIDc1JSwgMTAwJSB7IHRyYW5zZm9ybTogc2NhbGUoMi4yKTsgb3BhY2l0eTogMDsgfVxuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcmpTbGlkZUluUmlnaHQge1xuICAgICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMjAlKTsgb3BhY2l0eTogMDsgfVxuICAgICAgdG8geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IG9wYWNpdHk6IDE7IH1cbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIHJqU2xpZGVPdXRSaWdodCB7XG4gICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyBvcGFjaXR5OiAxOyB9XG4gICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMjAlKTsgb3BhY2l0eTogMDsgfVxuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcmpFcXVhbGl6ZXIge1xuICAgICAgMCUsIDEwMCUgeyBoZWlnaHQ6IDRweDsgfVxuICAgICAgNTAlIHsgaGVpZ2h0OiAxNHB4OyB9XG4gICAgfVxuXG4gICAgLnJqLWVxLWJhci0xIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlOyB9XG4gICAgLnJqLWVxLWJhci0yIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IDAuMjVzIGluZmluaXRlOyB9XG4gICAgLnJqLWVxLWJhci0zIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IDAuNXMgaW5maW5pdGU7IH1cbiAgYDtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59O1xuXG5jb25zdCBjcmVhdGVSSk1vZGVCdXR0b24gPSAodG9nZ2xlUkpNb2RlOiBGdW5jdGlvbikgPT4ge1xuICBpbmplY3RIYXJkd2FyZVN0eWxlcygpO1xuXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtYnV0dG9uXCIpKSByZXR1cm47XG5cbiAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnV0dG9uLmlkID0gXCJyai1tb2RlLWJ1dHRvblwiO1xuICBidXR0b24uY2xhc3NOYW1lID0gXCJyai1ody1yb290IHJqLWh3LWJldmVsXCI7XG4gIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDc2cHg7XG4gICAgcmlnaHQ6IDI0cHg7XG4gICAgei1pbmRleDogOTk5OTk7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzE4MUExRSAwJSwgIzExMTIxNSAxMDAlKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBwYWRkaW5nOiA4cHggMTRweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogMTBweDtcbiAgICBjb2xvcjogI2YxZjVmOTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIG91dGxpbmU6IG5vbmU7XG4gIGA7XG5cbiAgYnV0dG9uLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA4cHg7XCI+XG4gICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDIycHg7IGhlaWdodDogMjJweDsgYm9yZGVyLXJhZGl1czogNHB4OyBiYWNrZ3JvdW5kOiAjMDgwOTBBOyBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgcG9zaXRpb246IHJlbGF0aXZlO1wiPlxuICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDtcIj7wn46Z77iPPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgdGV4dC1hbGlnbjogbGVmdDsgbGluZS1oZWlnaHQ6IDEuMTU7XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicmotaHctbW9ub1wiIHN0eWxlPVwiZm9udC1zaXplOiA3LjVweDsgY29sb3I6ICM5NGEzYjg7IGxldHRlci1zcGFjaW5nOiAwLjE0ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XCI+WU9VVFVCRSBSSiAvLyBLT05UUk9MPC9zcGFuPlxuICAgICAgICA8c3BhbiBpZD1cInJqLWJ0bi1sYWJlbFwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyBsZXR0ZXItc3BhY2luZzogMC4wNWVtOyBjb2xvcjogI2Y4ZmFmYztcIj5TVEFSVCBSSiBNT0RFPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgd2lkdGg6IDEwcHg7IGhlaWdodDogMTBweDsgbWFyZ2luLWxlZnQ6IDRweDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XCI+XG4gICAgICA8ZGl2IGlkPVwicmotYnRuLXBpbmdcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogIzAwRDJDNDsgYW5pbWF0aW9uOiByalBpbmcgMS4ycyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKSBpbmZpbml0ZTtcIj48L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJyai1idG4tbGVkXCIgc3R5bGU9XCJ3aWR0aDogN3B4OyBoZWlnaHQ6IDdweDsgYm9yZGVyLXJhZGl1czogNTAlOyBiYWNrZ3JvdW5kOiAjNDc1NTY5OyBib3JkZXI6IDFweCBzb2xpZCAjMzM0MTU1O1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdG9nZ2xlUkpNb2RlKCkpO1xuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVkoLTFweClcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMzNjNDNDdcIjtcbiAgfSk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgYnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWSgwKVwiO1xuICAgIGlmICghYnV0dG9uLmRhdGFzZXQuYWN0aXZlKSB7XG4gICAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMyNzJCMzNcIjtcbiAgICB9XG4gIH0pO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbn07XG5cbmNvbnN0IHVwZGF0ZVJKTW9kZUJ1dHRvbiA9IChpc0FjdGl2ZTogYm9vbGVhbikgPT4ge1xuICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtYnV0dG9uXCIpO1xuICBpZiAoIWJ1dHRvbikgcmV0dXJuO1xuXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1idG4tbGFiZWxcIik7XG4gIGNvbnN0IGxlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotYnRuLWxlZFwiKTtcbiAgY29uc3QgcGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotYnRuLXBpbmdcIik7XG5cbiAgaWYgKGlzQWN0aXZlKSB7XG4gICAgYnV0dG9uLmRhdGFzZXQuYWN0aXZlID0gXCJ0cnVlXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMxMDFjMjAgMCUsICMwYTEzMTYgMTAwJSlcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMwMEQyQzRcIjtcbiAgICBidXR0b24uc3R5bGUuYm94U2hhZG93ID0gXCIwIDAgMTZweCByZ2JhKDAsMjEwLDE5NiwwLjM1KSwgaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LDAuMilcIjtcblxuICAgIGlmIChsYWJlbCkge1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBcIk9OIEFJUiAvLyBBQ1RJVkVcIjtcbiAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gXCIjMDBEMkM0XCI7XG4gICAgfVxuICAgIGlmIChsZWQpIHtcbiAgICAgIGxlZC5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMDBEMkM0XCI7XG4gICAgICBsZWQuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiNmZmZcIjtcbiAgICAgIGxlZC5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCA4cHggIzAwRDJDNFwiO1xuICAgIH1cbiAgICBpZiAocGluZykgcGluZy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBidXR0b24uZGF0YXNldC5hY3RpdmU7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMxODFBMUUgMCUsICMxMTEyMTUgMTAwJSlcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMyNzJCMzNcIjtcbiAgICBidXR0b24uc3R5bGUuYm94U2hhZG93ID0gXCJpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsMC44KSwgMCA4cHggMjRweCByZ2JhKDAsMCwwLDAuODUpXCI7XG5cbiAgICBpZiAobGFiZWwpIHtcbiAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gXCJTVEFSVCBSSiBNT0RFXCI7XG4gICAgICBsYWJlbC5zdHlsZS5jb2xvciA9IFwiI2Y4ZmFmY1wiO1xuICAgIH1cbiAgICBpZiAobGVkKSB7XG4gICAgICBsZWQuc3R5bGUuYmFja2dyb3VuZCA9IFwiIzQ3NTU2OVwiO1xuICAgICAgbGVkLnN0eWxlLmJvcmRlckNvbG9yID0gXCIjMzM0MTU1XCI7XG4gICAgICBsZWQuc3R5bGUuYm94U2hhZG93ID0gXCJub25lXCI7XG4gICAgfVxuICAgIGlmIChwaW5nKSBwaW5nLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxufTtcblxuY29uc3Qgc2hvd0xvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XG4gIGluamVjdEhhcmR3YXJlU3R5bGVzKCk7XG5cbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbG9hZGluZ1wiKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBsb2FkaW5nLmlkID0gXCJyai1sb2FkaW5nXCI7XG4gIGxvYWRpbmcuY2xhc3NOYW1lID0gXCJyai1ody1yb290IHJqLWh3LWJldmVsXCI7XG4gIGxvYWRpbmcuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiAxMzZweDtcbiAgICByaWdodDogMjRweDtcbiAgICB6LWluZGV4OiA5OTk5OTtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwOTBBO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7XG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgIHBhZGRpbmc6IDhweCAxNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDEwcHg7XG4gICAgY29sb3I6ICNmMWY1Zjk7XG4gICAgYW5pbWF0aW9uOiByalNsaWRlSW5SaWdodCAwLjI1cyBlYXNlLW91dDtcbiAgYDtcblxuICBsb2FkaW5nLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBnYXA6IDIuNXB4OyBoZWlnaHQ6IDE2cHg7IHBhZGRpbmctYm90dG9tOiAxcHg7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwicmotZXEtYmFyLTFcIiBzdHlsZT1cIndpZHRoOiAzcHg7IGJhY2tncm91bmQ6ICMwMEQyQzQ7IGJvcmRlci1yYWRpdXM6IDFweDsgYm94LXNoYWRvdzogMCAwIDRweCAjMDBEMkM0O1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInJqLWVxLWJhci0yXCIgc3R5bGU9XCJ3aWR0aDogM3B4OyBiYWNrZ3JvdW5kOiAjMDBEMkM0OyBib3JkZXItcmFkaXVzOiAxcHg7IGJveC1zaGFkb3c6IDAgMCA0cHggIzAwRDJDNDtcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJyai1lcS1iYXItM1wiIHN0eWxlPVwid2lkdGg6IDNweDsgYmFja2dyb3VuZDogI0ZGOUUxQjsgYm9yZGVyLXJhZGl1czogMXB4OyBib3gtc2hhZG93OiAwIDAgNHB4ICNGRjlFMUI7XCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGxpbmUtaGVpZ2h0OiAxLjI7XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInJqLWh3LW1vbm9cIiBzdHlsZT1cImZvbnQtc2l6ZTogNy41cHg7IGNvbG9yOiAjMDBEMkM0OyBsZXR0ZXItc3BhY2luZzogMC4xMmVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1wiPlNZTlRIRVNJWklORyBDT01NRU5UQVJZPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDkuNXB4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogI2YxZjVmOTsgbGV0dGVyLXNwYWNpbmc6IDAuMDRlbTtcIj5CVUZGRVJJTkcgTkVYVCBUUkFDSy4uLjwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRpbmcpO1xufTtcblxuY29uc3QgaGlkZUxvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWxvYWRpbmdcIik7XG4gIGlmIChsb2FkaW5nKSBsb2FkaW5nLnJlbW92ZSgpO1xufTtcblxuY29uc3Qgc2hvd0Vycm9yTWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgaW5qZWN0SGFyZHdhcmVTdHlsZXMoKTtcblxuICAvLyBSZW1vdmUgZXhpc3RpbmcgZXJyb3JzIGlmIHByZXNlbnRcbiAgY29uc3QgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWVycm9yLW1lc3NhZ2VcIik7XG4gIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKCk7XG5cbiAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBlcnJvci5pZCA9IFwicmotZXJyb3ItbWVzc2FnZVwiO1xuICBlcnJvci5jbGFzc05hbWUgPSBcInJqLWh3LXJvb3QgcmotaHctYmV2ZWxcIjtcbiAgZXJyb3Iuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiAxMzZweDtcbiAgICByaWdodDogMjRweDtcbiAgICB6LWluZGV4OiAxMDAwMDA7XG4gICAgYmFja2dyb3VuZDogIzE0MDgwYTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjZWY0NDQ0O1xuICAgIGJveC1zaGFkb3c6IDAgMCAxNnB4IHJnYmEoMjM5LCA2OCwgNjgsIDAuMyksIGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjEpO1xuICAgIGNvbG9yOiAjZmVjYWNhO1xuICAgIHBhZGRpbmc6IDEwcHggMTZweDtcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgbWF4LXdpZHRoOiAzNjBweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIGdhcDogMTBweDtcbiAgICBhbmltYXRpb246IHJqU2xpZGVJblJpZ2h0IDAuMjVzIGVhc2Utb3V0O1xuICBgO1xuXG4gIGVycm9yLmlubmVySFRNTCA9IGBcbiAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTRweDsgbGluZS1oZWlnaHQ6IDE7IG1hcmdpbi10b3A6IDJweDtcIj7imqDvuI88L3NwYW4+XG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGxpbmUtaGVpZ2h0OiAxLjI1OyBmbGV4OiAxO1wiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDhweDsgY29sb3I6ICNmODcxNzE7IGxldHRlci1zcGFjaW5nOiAwLjEyZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGZvbnQtd2VpZ2h0OiA3MDA7XCI+QlJPQURDQVNUIEVOR0lORSBGQVVMVDwvc3Bhbj5cbiAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMC41cHg7IGNvbG9yOiAjZjhmYWZjOyBtYXJnaW4tdG9wOiAzcHg7IHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XCI+JHttZXNzYWdlfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVycm9yKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBlcnJvci5zdHlsZS5hbmltYXRpb24gPSBcInJqU2xpZGVPdXRSaWdodCAwLjI1cyBlYXNlLWluIGZvcndhcmRzXCI7XG4gICAgc2V0VGltZW91dCgoKSA9PiBlcnJvci5yZW1vdmUoKSwgMjUwKTtcbiAgfSwgNTAwMCk7XG59O1xuXG5jb25zdCBkaXNtaXNzTm90aWZpY2F0aW9uID0gKCkgPT4ge1xuICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtbm90aWZpY2F0aW9uXCIpO1xuICBpZiAobm90aWZpY2F0aW9uKSB7XG4gICAgbm90aWZpY2F0aW9uLnN0eWxlLmFuaW1hdGlvbiA9IFwicmpTbGlkZU91dFJpZ2h0IDAuMjVzIGVhc2UtaW4gZm9yd2FyZHNcIjtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcbiAgICB9LCAyNTApO1xuICB9XG59O1xuXG5jb25zdCBzaG93UkpNb2RlUHJvbXB0ID0gKHRvZ2dsZVJKTW9kZTogRnVuY3Rpb24pID0+IHtcbiAgaW5qZWN0SGFyZHdhcmVTdHlsZXMoKTtcblxuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLW5vdGlmaWNhdGlvblwiKSkgcmV0dXJuO1xuXG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG5vdGlmaWNhdGlvbi5pZCA9IFwicmotbW9kZS1ub3RpZmljYXRpb25cIjtcbiAgbm90aWZpY2F0aW9uLmNsYXNzTmFtZSA9IFwicmotaHctcm9vdCByai1ody1iZXZlbFwiO1xuICBub3RpZmljYXRpb24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiA3NnB4O1xuICAgIHJpZ2h0OiAyNHB4O1xuICAgIHotaW5kZXg6IDEwMDAwMDtcbiAgICB3aWR0aDogMzUwcHg7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzE4MUExRSAwJSwgIzExMTIxNSAxMDAlKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGNvbG9yOiAjZjFmNWY5O1xuICAgIGFuaW1hdGlvbjogcmpTbGlkZUluUmlnaHQgMC4zcyBjdWJpYy1iZXppZXIoMC4xNiwgMSwgMC4zLCAxKTtcbiAgYDtcblxuICBub3RpZmljYXRpb24uaW5uZXJIVE1MID0gYFxuICAgIDwhLS0gVG9wIEhhcmR3YXJlIEFjY2VudCBCYXIgLS0+XG4gICAgPGRpdiBzdHlsZT1cImJhY2tncm91bmQ6ICMwODA5MEE7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMjcyQjMzOyBwYWRkaW5nOiA0cHggMTBweDsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyO1wiPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4O1wiPlxuICAgICAgICA8c3BhbiBzdHlsZT1cIndpZHRoOiA1cHg7IGhlaWdodDogNXB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICNGRjlFMUI7IGJveC1zaGFkb3c6IDAgMCA0cHggI0ZGOUUxQjtcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicmotaHctbW9ub1wiIHN0eWxlPVwiZm9udC1zaXplOiA3LjVweDsgY29sb3I6ICNGRjlFMUI7IGZvbnQtd2VpZ2h0OiA3MDA7IGxldHRlci1zcGFjaW5nOiAwLjEyZW07XCI+UExBWUxJU1QgREVURUNURUQgLy8gRlJFUSBMT0NLPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGlkPVwiZGlzbWlzcy1yai1wcm9tcHRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjNjQ3NDhiOyBmb250LXNpemU6IDEzcHg7IGN1cnNvcjogcG9pbnRlcjsgcGFkZGluZzogMCAycHg7IGxpbmUtaGVpZ2h0OiAxO1wiPuKclTwvYnV0dG9uPlxuICAgIDwvZGl2PlxuXG4gICAgPCEtLSBNYWluIENvbnRlbnQgQXJlYSAtLT5cbiAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzogMTJweCAxNHB4OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGdhcDogMTJweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEwcHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJhY2tncm91bmQ6ICMwODA5MEE7IGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbGV4LXNocmluazogMDtcIj5cbiAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTZweDtcIj7wn46Z77iPPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogI2Y4ZmFmYzsgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTtcIj5ZT1VUVUJFIFJKIFJFQURZPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogOXB4OyBjb2xvcjogIzk0YTNiODsgbWFyZ2luLXRvcDogMXB4O1wiPkF1dG8tdHJhbnNpdGlvbiBjb21tZW50YXJ5IGVuZ2luZTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8YnV0dG9uIGlkPVwiZW5hYmxlLXJqLW1vZGVcIiBzdHlsZT1cIlxuICAgICAgICBiYWNrZ3JvdW5kOiAjMDBEMkM0O1xuICAgICAgICBjb2xvcjogIzA2MDcwOTtcbiAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICBwYWRkaW5nOiA2cHggMTJweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBmb250LWZhbWlseTogJ0pldEJyYWlucyBNb25vJywgbW9ub3NwYWNlO1xuICAgICAgICBmb250LXNpemU6IDkuNXB4O1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMCAxMHB4IHJnYmEoMCwyMTAsMTk2LDAuMzUpO1xuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcbiAgICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIFwiPkVOQUJMRSBSSjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcblxuICAvLyBCdXR0b24gaW50ZXJhY3Rpb24gc3R5bGluZ1xuICBjb25zdCBlbmFibGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuYWJsZS1yai1tb2RlXCIpO1xuICBlbmFibGVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBlbmFibGVCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzEyZTZkOFwiO1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCAxNHB4IHJnYmEoMCwyMTAsMTk2LDAuNTUpXCI7XG4gIH0pO1xuICBlbmFibGVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBlbmFibGVCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzAwRDJDNFwiO1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCAxMHB4IHJnYmEoMCwyMTAsMTk2LDAuMzUpXCI7XG4gIH0pO1xuXG4gIGVuYWJsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XG4gICAgdG9nZ2xlUkpNb2RlKCk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlzbWlzcy1yai1wcm9tcHRcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZGlzbWlzc05vdGlmaWNhdGlvbigpO1xuICB9KTtcblxuICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgMTIgc2Vjb25kc1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XG4gIH0sIDEyMDAwKTtcbn07XG5cbmNvbnN0IERvbVV0aWxzID0ge1xuICBzaG93RXJyb3JNZXNzYWdlLFxuICBzaG93UkpNb2RlUHJvbXB0LFxuICBjcmVhdGVSSk1vZGVCdXR0b24sXG4gIHVwZGF0ZVJKTW9kZUJ1dHRvbixcbiAgZGlzbWlzc05vdGlmaWNhdGlvbixcbiAgc2hvd0xvYWRpbmdJbmRpY2F0b3IsXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yLFxufTtcblxuKHdpbmRvdyBhcyBhbnkpLkRvbVV0aWxzID0gRG9tVXRpbHM7XG5leHBvcnQgZGVmYXVsdCBEb21VdGlscztcbiIsCiAgICAiLy8gWW91VHViZS1zcGVjaWZpYyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5jb25zdCBpc1lvdVR1YmVNdXNpYyA9ICgpID0+XHJcbiAgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwibXVzaWMueW91dHViZS5jb21cIik7XHJcblxyXG5jb25zdCBZb3VUdWJlVXRpbHMgPSB7XHJcbiAgZXh0cmFjdFZpZGVvSWQoKSB7XHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoXCJ2XCIpO1xyXG4gICAgcmV0dXJuIHZpZGVvSWQgfHwgbnVsbDtcclxuICB9LFxyXG5cclxuICBpc1lvdVR1YmVNdXNpYyxcclxuXHJcbiAgZ2V0Q3VycmVudFZpZGVvVGl0bGUoKSB7XHJcbiAgICBpZiAoaXNZb3VUdWJlTXVzaWMoKSkge1xyXG4gICAgICAvLyBNb3N0IHJlbGlhYmxlOiB0aGUgdGl0bGUgc2hvd24gaW4gdGhlIHBsYXllciBiYXJcclxuICAgICAgY29uc3QgcGxheWVyQmFyVGl0bGVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGUuc3R5bGUtc2NvcGUueXRtdXNpYy1wbGF5ZXItYmFyXCIpXHJcbiAgICAgIGNvbnN0IHN1YnRpdGxlID0gcGxheWVyQmFyVGl0bGVFbD8ubmV4dEVsZW1lbnRTaWJsaW5nPy50ZXh0Q29udGVudD8udHJpbSgpXHJcbiAgICAgICAgLnNwbGl0KC9cXG4vKVxyXG4gICAgICAgIC5tYXAoKHMpID0+IHMudHJpbSgpKVxyXG4gICAgICAgIC5qb2luKCcgJylcclxuICAgICAgY29uc3QgcGxheWVyQmFyVGl0bGUgPSBwbGF5ZXJCYXJUaXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAocGxheWVyQmFyVGl0bGUpIHJldHVybiBgJHtwbGF5ZXJCYXJUaXRsZX0gLSAke3N1YnRpdGxlfWA7XHJcblxyXG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmZyb20oXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInl0bXVzaWMtcmVzcG9uc2l2ZS1saXN0LWl0ZW0tcmVuZGVyZXJcIilcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFByZWZlciB0aGUgaXRlbSBjdXJyZW50bHkgcGxheWluZy9wYXVzZWQgaW4gdGhlIHBsYXlsaXN0XHJcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBpdGVtcy5maW5kKChpdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gaXQuZ2V0QXR0cmlidXRlKFwicGxheS1idXR0b24tc3RhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlID09PSBcInBsYXlpbmdcIiB8fCBzdGF0ZSA9PT0gXCJwYXVzZWRcIjtcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRUaXRsZSA9IGN1cnJlbnRcclxuICAgICAgICA/LnF1ZXJ5U2VsZWN0b3IoXCJ5dC1mb3JtYXR0ZWQtc3RyaW5nLnRpdGxlXCIpXHJcbiAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAoY3VycmVudFRpdGxlKSByZXR1cm4gY3VycmVudFRpdGxlO1xyXG5cclxuICAgICAgLy8gRmFsbGJhY2s6IHBsYXlsaXN0IGl0ZW0gbWF0Y2hpbmcgdGhlIGN1cnJlbnQgdmlkZW8gaWRcclxuICAgICAgY29uc3QgdmlkID0gdGhpcy5leHRyYWN0VmlkZW9JZCgpO1xyXG4gICAgICBpZiAodmlkKSB7XHJcbiAgICAgICAgY29uc3QgYnlWaWQgPSBpdGVtcy5maW5kKChpdCkgPT5cclxuICAgICAgICAgIChpdC5pbm5lckhUTUwgfHwgXCJcIikuaW5jbHVkZXModmlkKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgdGl0bGUgPSBieVZpZFxyXG4gICAgICAgICAgPy5xdWVyeVNlbGVjdG9yKFwieXQtZm9ybWF0dGVkLXN0cmluZy50aXRsZVwiKVxyXG4gICAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICAgIGlmICh0aXRsZSkgcmV0dXJuIHRpdGxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGYWxsYmFjazogdGl0bGUgc2hvd24gaW4gdGhlIHBsYXllciBxdWV1ZSAoY3VycmVudCB0cmFjaylcclxuICAgICAgY29uc3QgcXVldWVUaXRsZSA9IGRvY3VtZW50XHJcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCJ5dG11c2ljLXBsYXllci1xdWV1ZS1pdGVtIC5zb25nLXRpdGxlXCIpXHJcbiAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAocXVldWVUaXRsZSkgcmV0dXJuIHF1ZXVlVGl0bGU7XHJcblxyXG4gICAgICAvLyBMYXN0IHJlc29ydDogcGxheWVyIHRpdGxlIGxpbmtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnl0cC10aXRsZS1saW5rXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aXRsZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBcImgxLnRpdGxlLnN0eWxlLXNjb3BlLnl0ZC12aWRlby1wcmltYXJ5LWluZm8tcmVuZGVyZXJcIlxyXG4gICAgKTtcclxuICAgIHJldHVybiB0aXRsZUVsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBnZXREZXNjcmlwdGlvbigpIHtcclxuICAgIGlmIChpc1lvdVR1YmVNdXNpYygpKSByZXR1cm4gXCJcIjtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGRvY3VtZW50Py5xdWVyeVNlbGVjdG9yKFwiI2Rlc2NyaXB0aW9uLWlubmVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCJcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q29tbWVudHMoKSB7XHJcbiAgICBpZiAoaXNZb3VUdWJlTXVzaWMoKSkgcmV0dXJuIFtdO1xyXG5cclxuICAgIGxldCBhbGxDb21tZW50czogc3RyaW5nW10gPSBbXTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjY29tbWVudC1jb250YWluZXJcIikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICBsZXQgdHh0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiI2V4cGFuZGVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgICAgIGFsbENvbW1lbnRzLnB1c2godHh0KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGFsbENvbW1lbnRzO1xyXG4gIH0sXHJcblxyXG4gIGdldE5leHRWaWRlb1RpdGxlKCkge1xyXG4gICAgaWYgKGlzWW91VHViZU11c2ljKCkpIHtcclxuICAgICAgLy8gUHJlZmVyIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIGN1cnJlbnRseSBwbGF5aW5nIHBsYXlsaXN0IGl0ZW1cclxuICAgICAgY29uc3QgcGxheWluZ0l0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcGxheS1idXR0b24tc3RhdGU9XCJwbGF5aW5nXCJdJylbMV1cclxuICAgICAgY29uc3QgdGV4dCA9IChwbGF5aW5nSXRlbT8ubmV4dFNpYmxpbmc/LnRleHRDb250ZW50IHx8IFwiXCIpXHJcbiAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgIC5zcGxpdCgvXFxuLylcclxuICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcclxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAgICAgLmpvaW4oJyB8ICcpXHJcbiAgICAgIHJldHVybiB0ZXh0XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGxheWxpc3RJdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5bGlzdC1pdGVtc1tzZWxlY3RlZF1cIik7XHJcbiAgICBjb25zdCBuZXh0VmlkZW9FbGVtZW50ID0gKFxyXG4gICAgICBwbGF5bGlzdEl0ZW0/Lm5leHRTaWJsaW5nIGFzIEVsZW1lbnRcclxuICAgICk/LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8tdGl0bGVcIik7XHJcblxyXG4gICAgcmV0dXJuIG5leHRWaWRlb0VsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBpc1BsYXlsaXN0UGFnZSgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmhhcyhcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGxheWxpc3RJZCgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmdldChcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VmlkZW9FbGVtZW50KCkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ2aWRlb1wiKTtcclxuICB9LFxyXG5cclxuICAvLyBDbGVhbiB1cCBZb3VUdWJlIHZpZGVvIHRpdGxlcyAocmVtb3ZlIGNvbW1vbiBzdWZmaXhlcylcclxuICBjbGVhblZpZGVvVGl0bGUodGl0bGU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRpdGxlXHJcbiAgICAgIC5yZXBsYWNlKC9cXChPZmZpY2lhbC4qP1xcKS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoL1xcKE11c2ljIFZpZGVvXFwpL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvXFxbT2ZmaWNpYWwuKj9cXF0vZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC8tIFRvcGljJC8sIFwiXCIpXHJcbiAgICAgIC50cmltKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gR2V0IHZpZGVvIGR1cmF0aW9uXHJcbiAgZ2V0VmlkZW9EdXJhdGlvbigpIHtcclxuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHJldHVybiB2aWRlbyA/IHZpZGVvLmR1cmF0aW9uIDogMDtcclxuICB9LFxyXG5cclxuICAvLyBDaGVjayBpZiB2aWRlbyBpcyBwbGF5aW5nXHJcbiAgaXNWaWRlb1BsYXlpbmcoKSB7XHJcbiAgICBjb25zdCB2aWRlbyA9IHRoaXMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICByZXR1cm4gdmlkZW8gPyAhdmlkZW8ucGF1c2VkICYmICF2aWRlby5lbmRlZCA6IGZhbHNlO1xyXG4gIH0sXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuWW91VHViZVV0aWxzID0gWW91VHViZVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBZb3VUdWJlVXRpbHM7IiwKICAgICJcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4vbG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBHb29nbGVUVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUodGV4dDogc3RyaW5nLCBsYW5nOiBzdHJpbmcgPSBcImVuXCIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiZ2V0VFRTQXVkaW9cIixcbiAgICAgICAgICBwYXlsb2FkOiB7IHRleHQsIGxhbmcgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiR29vZ2xlIFRUUyBydW50aW1lIG1lc3NhZ2luZyBmYWlsZWRcIiwgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiR29vZ2xlIFRUUyByZXF1ZXN0IGZhaWxlZFwiLCByZXNwb25zZT8uZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGdldCBUVFMgYXVkaW9cIikpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlNjRDaHVua3M6IHN0cmluZ1tdID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGF1ZGlvQ2h1bmtzID0gYmFzZTY0Q2h1bmtzLm1hcCgoYmFzZTY0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcbiAgICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnlTdHJpbmcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnlTdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBieXRlc1tpXSA9IGJpbmFyeVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBieXRlcy5idWZmZXI7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb0Jsb2IgPSBuZXcgQmxvYihhdWRpb0NodW5rcywgeyB0eXBlOiBcImF1ZGlvL21wZWdcIiB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiQ291bGQgbm90IGRlY29kZSBHb29nbGUgVFRTIGF1ZGlvXCIsIGVycm9yKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgdG9CbG9iKCk6IEJsb2Ige1xuICAgIGlmICghdGhpcy5hdWRpb0Jsb2IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGF1ZGlvIGRhdGEgYXZhaWxhYmxlLiBEaWQgeW91IHJ1biBzeW50aGVzaXplKCkgZmlyc3Q/XCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hdWRpb0Jsb2I7XG4gIH1cbn1cbiIsCiAgICAiaW1wb3J0IExvZ2dlciBmcm9tIFwiLi9sb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIEZpc2hBdWRpb1RUUyB7XG4gIHByaXZhdGUgYXVkaW9CbG9iOiBCbG9iIHwgbnVsbCA9IG51bGw7XG5cbiAgYXN5bmMgc3ludGhlc2l6ZShcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgYXBpS2V5OiBzdHJpbmcsXG4gICAgcmVmZXJlbmNlSWQ6IHN0cmluZyA9IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIlxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWFwaUtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmlzaCBBdWRpbyBBUEkga2V5IG5vdCBjb25maWd1cmVkXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcbiAgICAgICAge1xuICAgICAgICAgIGFjdGlvbjogXCJjYWxsRmlzaEF1ZGlvXCIsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICByZWZlcmVuY2VJZCxcbiAgICAgICAgICBhcGlLZXksXG4gICAgICAgIH0sXG4gICAgICAgIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIkZpc2ggQXVkaW8gcnVudGltZSBtZXNzYWdpbmcgZmFpbGVkXCIsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIExvZ2dlci5lcnJvcihcIkZpc2ggQXVkaW8gcmVxdWVzdCBmYWlsZWRcIiwgcmVzcG9uc2U/LmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoXG4gICAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gZ2V0IEZpc2ggQXVkaW8gVFRTXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlNjQgPSByZXNwb25zZS5hdWRpb0Jhc2U2NDtcbiAgICAgICAgICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBieXRlc1tpXSA9IGJpbmFyeVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvQmxvYiA9IG5ldyBCbG9iKFtieXRlc10sIHsgdHlwZTogXCJhdWRpby9tcDNcIiB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKFwiQ291bGQgbm90IGRlY29kZSBGaXNoIEF1ZGlvIGRhdGFcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICB0b0Jsb2IoKTogQmxvYiB7XG4gICAgaWYgKCF0aGlzLmF1ZGlvQmxvYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXVkaW8gZGF0YSBhdmFpbGFibGUuIERpZCB5b3UgcnVuIHN5bnRoZXNpemUoKSBmaXJzdD9cIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmF1ZGlvQmxvYjtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQgQVBJVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXBpLXV0aWxzXCI7XHJcbmltcG9ydCBBdWRpb1V0aWxzIGZyb20gXCIuL3V0aWxzL2F1ZGlvLXV0aWxzXCI7XHJcbmltcG9ydCBEb21VdGlscyBmcm9tIFwiLi91dGlscy9kb20tdXRpbHNcIjtcclxuaW1wb3J0IFlvdVR1YmVVdGlscyBmcm9tIFwiLi91dGlscy95b3V0dWJlLXV0aWxzXCI7XHJcbmltcG9ydCB7IEdvb2dsZVRUUyB9IGZyb20gXCIuL3V0aWxzL2dvb2dsZS10dHNcIjtcclxuaW1wb3J0IHsgRmlzaEF1ZGlvVFRTIH0gZnJvbSBcIi4vdXRpbHMvZmlzaC1hdWRpb1wiO1xyXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuL3V0aWxzL2xvZ2dlclwiO1xyXG5cclxuY2xhc3MgWW91VHViZVJKTW9kZSB7XHJcbiAgaXNSSk1vZGVBY3RpdmU6IGJvb2xlYW47XHJcbiAgY3VycmVudFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBuZXh0VmlkZW9UaXRsZTogc3RyaW5nO1xyXG4gIG9yaWdpbmFsVm9sdW1lOiBudW1iZXI7XHJcbiAgaXNSSlBsYXlpbmc6IGJvb2xlYW47XHJcbiAgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQgfCBudWxsO1xyXG4gIGdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgbGFzdFByb2Nlc3NlZFZpZGVvOiBzdHJpbmc7XHJcbiAgaXNHZW5lcmF0aW5nQ29tbWVudGFyeTogYm9vbGVhbjtcclxuICB2aWRlb0NoYW5nZVRpbWVvdXQ6IGFueTtcclxuICBwcm9ncmVzc0ludGVydmFsOiBhbnk7XHJcbiAgc2NyaXB0SGlzdG9yeTogYW55W107XHJcbiAgZ29vZ2xlVFRTOiBHb29nbGVUVFM7XHJcbiAgZmlzaEF1ZGlvVFRTOiBGaXNoQXVkaW9UVFM7XHJcbiAgdHRzVm9pY2U6IHN0cmluZztcclxuICBnZW5lcmF0ZWRBdWRpb0RhdGE6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gXCJcIjtcclxuICAgIHRoaXMubmV4dFZpZGVvVGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IDEuMDtcclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuZ2Fpbk5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSBcIlwiO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgdGhpcy5zY3JpcHRIaXN0b3J5ID0gW107XHJcbiAgICB0aGlzLmdvb2dsZVRUUyA9IG5ldyBHb29nbGVUVFMoKTsgLy8gSW5pdGlhbGl6ZSBHb29nbGUgVFRTIGluc3RhbmNlXHJcbiAgICB0aGlzLmZpc2hBdWRpb1RUUyA9IG5ldyBGaXNoQXVkaW9UVFMoKTsgLy8gSW5pdGlhbGl6ZSBGaXNoIEF1ZGlvIFRUUyBpbnN0YW5jZVxyXG4gICAgdGhpcy50dHNWb2ljZSA9IFwiZW5cIjsgLy8gRGVmYXVsdCBUVFMgdm9pY2UgKGxhbmd1YWdlIGNvZGUgZm9yIEdvb2dsZSBUVFMpXHJcbiAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIFN0b3JlIGdlbmVyYXRlZCBhdWRpbyBkYXRhXHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0KCkge1xyXG4gICAgdGhpcy5zZXR1cEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5kZXRlY3RQbGF5bGlzdCgpO1xyXG4gICAgRG9tVXRpbHMuY3JlYXRlUkpNb2RlQnV0dG9uKHRoaXMudG9nZ2xlUkpNb2RlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgQVBJVXRpbHMuZ2V0QVBJU2V0dGluZ3MoKTtcclxuICAgIGlmIChzZXR0aW5ncy5hdXRvU3RhcnQgJiYgWW91VHViZVV0aWxzLmlzUGxheWxpc3RQYWdlKCkpIHtcclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFJKTW9kZSgpO1xyXG4gICAgICBEb21VdGlscy51cGRhdGVSSk1vZGVCdXR0b24odHJ1ZSk7XHJcbiAgICAgIExvZ2dlci5pbmZvKFwiUkogbW9kZSBzdGFydGVkIGF1dG9tYXRpY2FsbHkgZm9yIHBsYXlsaXN0XCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0dXBBdWRpb0NvbnRleHQoKSB7XHJcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IEF1ZGlvVXRpbHMuY3JlYXRlQXVkaW9Db250ZXh0KCk7XHJcbiAgICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgICAgdGhpcy5nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRldGVjdFBsYXlsaXN0KCkge1xyXG4gICAgLy8gVXNlIFlvdVR1YmUgdXRpbGl0eSBmdW5jdGlvblxyXG4gICAgaWYgKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuaXNQbGF5bGlzdFBhZ2UoKSAmJlxyXG4gICAgICAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLWJ1dHRvblwiKVxyXG4gICAgKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dSSk1vZGVQcm9tcHQodGhpcy50b2dnbGVSSk1vZGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDdXJyZW50QW5kTmV4dFRpdGxlcygpIHtcclxuICAgIC8vIFVzZSBZb3VUdWJlIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldEN1cnJlbnRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgICB0aGlzLm5leHRWaWRlb1RpdGxlID0gWW91VHViZVV0aWxzLmNsZWFuVmlkZW9UaXRsZShcclxuICAgICAgWW91VHViZVV0aWxzLmdldE5leHRWaWRlb1RpdGxlKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZW5lcmF0ZVJKQ29tbWVudGFyeSgpIHtcclxuICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgc2ltdWx0YW5lb3VzIGNvbW1lbnRhcnkgZ2VuZXJhdGlvbnNcclxuICAgIGlmICh0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgfHwgdGhpcy5pc1JKUGxheWluZykge1xyXG4gICAgICBMb2dnZXIuZGVidWcoXCJTa2lwcGVkIGNvbW1lbnRhcnkgZ2VuZXJhdGlvbiBiZWNhdXNlIGF1ZGlvIHdvcmsgaXMgYWN0aXZlXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgd2UndmUgYWxyZWFkeSBwcm9jZXNzZWQgdGhpcyB2aWRlb1xyXG4gICAgY29uc3QgdmlkZW9JZCA9IFlvdVR1YmVVdGlscy5leHRyYWN0VmlkZW9JZCgpIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGU7XHJcbiAgICBpZiAodmlkZW9JZCA9PT0gdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8pIHtcclxuICAgICAgTG9nZ2VyLmRlYnVnKFwiU2tpcHBlZCBjb21tZW50YXJ5IGdlbmVyYXRpb24gZm9yIGFuIGFscmVhZHkgcHJvY2Vzc2VkIHRyYWNrXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRWaWRlb1RpdGxlIHx8IHRoaXMuY3VycmVudFZpZGVvVGl0bGUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIExvZ2dlci5kZWJ1ZyhcIlNraXBwZWQgY29tbWVudGFyeSBnZW5lcmF0aW9uIGJlY2F1c2UgdGhlIGN1cnJlbnQgdHJhY2sgdGl0bGUgaXMgdW5hdmFpbGFibGVcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSB0cnVlO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSB2aWRlb0lkO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgICBsZXQgY3VycmVudFNvbmdseXJpY3M6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGN1cnJlbnRTb25nbHlyaWNzID0gKGF3YWl0IEFQSVV0aWxzLmNhbGxMeXJpY3NBUEkoXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlXHJcbiAgICAgICAgKSkgYXMgc3RyaW5nIHwgbnVsbDtcclxuICAgICAgfSBjYXRjaCAobHlyaWNzRXJyb3IpIHtcclxuICAgICAgICBMb2dnZXIud2FybihcclxuICAgICAgICAgIFwiTHlyaWNzIEFQSSBmYWlsZWQgb3Igbm8gbHlyaWNzIGZvdW5kLCBwcm9jZWVkaW5nIHdpdGggY29tbWVudGFyeSAmIFRUUyBnZW5lcmF0aW9uOlwiLFxyXG4gICAgICAgICAgbHlyaWNzRXJyb3JcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2UgQVBJIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgQVBJVXRpbHMuZ2V0QVBJU2V0dGluZ3MoKTtcclxuICAgICAgY29uc3QgeyBzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrIH0gPSBBUElVdGlscy5nZW5lcmF0ZVJKUHJvbXB0KFxyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUsXHJcbiAgICAgICAgdGhpcy5uZXh0VmlkZW9UaXRsZSxcclxuICAgICAgICBzZXR0aW5ncy5yalN0eWxlLFxyXG4gICAgICAgIHNldHRpbmdzLmNvbW1lbnRhcnlMZW5ndGgsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUhpc3RvcnkgPyB0aGlzLnNjcmlwdEhpc3Rvcnkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUNvbW1lbnRzID8gWW91VHViZVV0aWxzLmdldENvbW1lbnRzKCkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgY3VycmVudFNvbmdseXJpY3MgYXMgc3RyaW5nLFxyXG4gICAgICAgIHNldHRpbmdzLmhvc3ROYW1lLFxyXG4gICAgICAgIHNldHRpbmdzLnJhZGlvU3RhdGlvblxyXG4gICAgICApO1xyXG5cclxuICAgICAgY29uc3Qgc2NyaXB0ID0gYXdhaXQgQVBJVXRpbHMuY2FsbExMTShzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICB0aGlzLnNjcmlwdEhpc3RvcnkucHVzaChzY3JpcHQpO1xyXG5cclxuICAgICAgbGV0IGF1ZGlvRGF0YSA9IHt9O1xyXG4gICAgICBjb25zdCBwcm92aWRlciA9XHJcbiAgICAgICAgc2V0dGluZ3MudHRzUHJvdmlkZXIgfHxcclxuICAgICAgICAoc2V0dGluZ3MuZmlzaEFwaUtleVxyXG4gICAgICAgICAgPyBcImZpc2gtYXVkaW9cIlxyXG4gICAgICAgICAgOiBzZXR0aW5ncy5tdXJmQXBpS2V5XHJcbiAgICAgICAgICAgID8gXCJtdXJmXCJcclxuICAgICAgICAgICAgOiBcImZpc2gtYXVkaW9cIik7XHJcblxyXG4gICAgICBpZiAocHJvdmlkZXIgPT09IFwiZmlzaC1hdWRpb1wiKSB7XHJcbiAgICAgICAgaWYgKCFzZXR0aW5ncy5maXNoQXBpS2V5KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIFwiRmlzaCBBdWRpbyBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBQbGVhc2UgYWRkIGl0IGluIGV4dGVuc2lvbiBzZXR0aW5ncy5cIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVmSWQgPSBzZXR0aW5ncy52b2ljZUlkIHx8IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIjtcclxuICAgICAgICBhd2FpdCB0aGlzLmZpc2hBdWRpb1RUUy5zeW50aGVzaXplKHNjcmlwdCwgc2V0dGluZ3MuZmlzaEFwaUtleSwgcmVmSWQpO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5maXNoQXVkaW9UVFMudG9CbG9iKCksXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIGlmIChwcm92aWRlciA9PT0gXCJtdXJmXCIpIHtcclxuICAgICAgICBpZiAoIXNldHRpbmdzLm11cmZBcGlLZXkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgXCJNdXJmLmFpIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQuIFBsZWFzZSBhZGQgaXQgaW4gZXh0ZW5zaW9uIHNldHRpbmdzLlwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhdWRpb0RhdGEgPSBhd2FpdCBBUElVdGlscy5jYWxsTXVyZkFQSShcclxuICAgICAgICAgIHNjcmlwdCxcclxuICAgICAgICAgIHNldHRpbmdzLm11cmZBcGlLZXksXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkLFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VTdHlsZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRmFsbGJhY2sgdG8gR29vZ2xlIFRUU1xyXG4gICAgICAgIGxldCBsYW5nID0gc2V0dGluZ3Mudm9pY2VJZCB8fCB0aGlzLnR0c1ZvaWNlO1xyXG4gICAgICAgIC8vIElmIGl0IGxvb2tzIGxpa2UgYW4gRWRnZSBUVFMgdm9pY2UgSUQgKGUuZy4sIGVuLVVTLUFyaWFOZXVyYWwpLCBleHRyYWN0IHRoZSBsYW5nIHBhcnRcclxuICAgICAgICBpZiAobGFuZy5pbmNsdWRlcyhcIi1cIikgJiYgbGFuZy5zcGxpdChcIi1cIikubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgbGFuZyA9IGxhbmcuc3BsaXQoXCItXCIpLnNsaWNlKDAsIDIpLmpvaW4oXCItXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5nb29nbGVUVFMuc3ludGhlc2l6ZShzY3JpcHQsIGxhbmcpO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5nb29nbGVUVFMudG9CbG9iKCksXHJcbiAgICAgICAgICAvLyBhdWRpb1VybDogVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLmdvb2dsZVRUUy50b0Jsb2IoKSksXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9nIHRoZSBjb21tZW50YXJ5XHJcbiAgICAgIEFQSVV0aWxzLmxvZ0NvbW1lbnRhcnkoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSxcclxuICAgICAgICB0aGlzLm5leHRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHNjcmlwdFxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5nZW5lcmF0ZWRBdWRpb0RhdGEgPSBhdWRpb0RhdGE7IC8vIFN0b3JlIGdlbmVyYXRlZCBhdWRpbyBkYXRhIGZvciBsYXRlciB1c2VcclxuICAgICAgTG9nZ2VyLmluZm8oXCJDb21tZW50YXJ5IGF1ZGlvIGlzIHJlYWR5XCIpO1xyXG5cclxuICAgICAgRG9tVXRpbHMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgTG9nZ2VyLmVycm9yKFwiQ29tbWVudGFyeSBnZW5lcmF0aW9uIGZhaWxlZFwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHBsYXlSSkNvbW1lbnRhcnkoKSB7XHJcbiAgICBjb25zdCBhdWRpb0Jsb2IgPSB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YT8uYXVkaW9CbG9iO1xyXG5cclxuICAgIGlmICghYXVkaW9CbG9iKSB7XHJcbiAgICAgIExvZ2dlci53YXJuKFwiUGxheWJhY2sgcmVxdWVzdGVkIGJlZm9yZSBjb21tZW50YXJ5IGF1ZGlvIHdhcyByZWFkeVwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzUkpQbGF5aW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCB2aWRlbyA9IFlvdVR1YmVVdGlscy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICghdmlkZW8pIHtcclxuICAgICAgICBMb2dnZXIuZXJyb3IoXCJDb3VsZCBub3QgcGxheSBjb21tZW50YXJ5IGJlY2F1c2UgdGhlIFlvdVR1YmUgdmlkZW8gZWxlbWVudCB3YXMgdW5hdmFpbGFibGVcIik7XHJcbiAgICAgICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVGhlIGNvbnRyb2wgc2V0cyBkdWNraW5nIGRlcHRoIGluIGRCLCBzbyBjb252ZXJ0IGl0IHRvIGxpbmVhciBnYWluLlxyXG4gICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IEFQSVV0aWxzLmdldEFQSVNldHRpbmdzKCk7XHJcbiAgICAgIGNvbnN0IGR1Y2tpbmdEYiA9XHJcbiAgICAgICAgLShNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHNldHRpbmdzLnZvbHVtZUR1Y2tpbmcpKSAvIDEwMCkgKiAyNDtcclxuICAgICAgY29uc3QgZHVja0xldmVsID0gTWF0aC5wb3coMTAsIGR1Y2tpbmdEYiAvIDIwKTtcclxuICAgICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IGF3YWl0IEF1ZGlvVXRpbHMuZHVja1ZvbHVtZSh2aWRlbywgZHVja0xldmVsKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgcGxheSBSSiBhdWRpbyB1c2luZyB1dGlsaXR5XHJcbiAgICAgIGNvbnN0IHsgYXVkaW8sIGF1ZGlvVXJsIH0gPSBBdWRpb1V0aWxzLmNyZWF0ZUF1ZGlvKGF1ZGlvQmxvYik7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgTG9nZ2VyLmVycm9yKFwiQ29tbWVudGFyeSBhdWRpbyBwbGF5YmFjayBlcnJvclwiLCBlcnJvcik7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgYXdhaXQgQXVkaW9VdGlscy5wbGF5QXVkaW8oYXVkaW8pLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgIExvZ2dlci5lcnJvcihcIkNvbW1lbnRhcnkgYXVkaW8gcGxheWJhY2sgZmFpbGVkXCIsIGVycm9yKTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgTG9nZ2VyLmVycm9yKFwiQ291bGQgbm90IHBsYXkgY29tbWVudGFyeVwiLCBlcnJvcik7XHJcbiAgICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdm9sdW1lXHJcbiAgICAgIGlmICh2aWRlbykge1xyXG4gICAgICAgIGF3YWl0IEF1ZGlvVXRpbHMucmVzdG9yZVZvbHVtZSh2aWRlbywgdGhpcy5vcmlnaW5hbFZvbHVtZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhID0gbnVsbDsgLy8gQ2xlYXIgYXVkaW8gZGF0YSBhZnRlciBwbGF5YmFja1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW86IEhUTUxWaWRlb0VsZW1lbnQsIGF1ZGlvVXJsOiBzdHJpbmcpIHtcclxuICAgIC8vIFJlc3RvcmUgb3JpZ2luYWwgdm9sdW1lIHVzaW5nIHV0aWxpdHlcclxuICAgIGF3YWl0IEF1ZGlvVXRpbHMucmVzdG9yZVZvbHVtZSh2aWRlbywgdGhpcy5vcmlnaW5hbFZvbHVtZSk7XHJcblxyXG4gICAgLy8gQ2xlYW4gdXAgYXVkaW8gVVJMXHJcbiAgICBpZiAoYXVkaW9VcmwpIHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChhdWRpb1VybCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgTG9nZ2VyLmluZm8oXCJDb21tZW50YXJ5IHBsYXliYWNrIGZpbmlzaGVkXCIpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgdG9nZ2xlUkpNb2RlKCkge1xyXG4gICAgdGhpcy5pc1JKTW9kZUFjdGl2ZSA9ICF0aGlzLmlzUkpNb2RlQWN0aXZlO1xyXG4gICAgRG9tVXRpbHMudXBkYXRlUkpNb2RlQnV0dG9uKHRoaXMuaXNSSk1vZGVBY3RpdmUpO1xyXG5cclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRSSk1vZGUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcFJKTW9kZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RhcnRSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICB0aGlzLnNldHVwVmlkZW9FdmVudExpc3RlbmVycygpO1xyXG4gICAgTG9nZ2VyLmluZm8oXCJSSiBtb2RlIHN0YXJ0ZWRcIik7XHJcbiAgfVxyXG5cclxuICBzdG9wUkpNb2RlKCkge1xyXG4gICAgdGhpcy5pc1JKTW9kZUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbyA9IFwiXCI7XHJcbiAgICBEb21VdGlscy51cGRhdGVSSk1vZGVCdXR0b24oZmFsc2UpO1xyXG5cclxuICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIHRpbWVvdXRzIGFuZCBpbnRlcnZhbHNcclxuICAgIGlmICh0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpO1xyXG4gICAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwIGFueSBsb2FkaW5nIGluZGljYXRvcnNcclxuICAgIERvbVV0aWxzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICBMb2dnZXIuaW5mbyhcIlJKIG1vZGUgc3RvcHBlZFwiKTtcclxuXHJcbiAgfVxyXG5cclxuICBzZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAvLyBQcm9ncmVzcyBjaGVjayBpbnRlcnZhbFxyXG5cclxuICAgIC8vIE1vbml0b3IgdmlkZW8gcHJvZ3Jlc3NcclxuICAgIGNvbnN0IGNoZWNrVmlkZW9Qcm9ncmVzcyA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XHJcbiAgICAgIGlmICghdmlkZW8gfHwgIXRoaXMuaXNSSk1vZGVBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHRpbWVSZW1haW5pbmcgPSB2aWRlby5kdXJhdGlvbiAtIHZpZGVvLmN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgLy8gZ2VuZXJhdGUgY29tbWVudGFyeSBhbmQga2VlcCBpdCByZWFkeSAxMCBzZWNvbmRzIGFmZXIgdmlkZW8gc3RhcnRzXHJcbiAgICAgIGlmIChcclxuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA+IDEwICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSAmJlxyXG4gICAgICAgICF0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVJKQ29tbWVudGFyeSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGFydCBjb21tZW50YXJ5IHdoZW4gMzAgc2Vjb25kcyByZW1haW4gYW5kIG5vdCBhbHJlYWR5IHBsYXlpbmdcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRpbWVSZW1haW5pbmcgPD0gMzAgJiZcclxuICAgICAgICAhdGhpcy5pc1JKUGxheWluZyAmJlxyXG4gICAgICAgICF0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnlcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5UkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHVwIHZpZGVvIHByb2dyZXNzIG1vbml0b3JpbmdcclxuICAgIGNvbnN0IHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5wcm9ncmVzc0ludGVydmFsKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrVmlkZW9Qcm9ncmVzcywgMTAwMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENsZWFyIHByb2dyZXNzIG1vbml0b3JpbmdcclxuXHJcbiAgICAvLyBTdGFydCBtb25pdG9yaW5nIHdoZW4gUkogbW9kZSBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmlzUkpNb2RlQWN0aXZlKSB7XHJcbiAgICAgIHNldHVwUHJvZ3Jlc3NNb25pdG9yaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBMaXN0ZW4gZm9yIGRpYWdub3N0aWNzIHRyaWdnZXJzIGZyb20gdGhlIGV4dGVuc2lvbiBwb3B1cFxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIF9zZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmIChcclxuICAgIHJlcXVlc3Q/LmFjdGlvbiA9PT0gXCJnZW5lcmF0ZVJKQ29tbWVudGFyeVwiIHx8XHJcbiAgICByZXF1ZXN0Py5hY3Rpb24gPT09IFwicGxheVJKQ29tbWVudGFyeVwiXHJcbiAgKSB7XHJcbiAgICBjb25zdCByaiA9ICh3aW5kb3cgYXMgYW55KS55b3V0dWJlUko7XHJcbiAgICBpZiAoIXJqKSB7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJSSiBpbnN0YW5jZSBub3QgYXZhaWxhYmxlIG9uIHRoaXMgcGFnZVwiIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBmbiA9XHJcbiAgICAgIHJlcXVlc3QuYWN0aW9uID09PSBcImdlbmVyYXRlUkpDb21tZW50YXJ5XCJcclxuICAgICAgICA/IHJqLmdlbmVyYXRlUkpDb21tZW50YXJ5LmJpbmQocmopXHJcbiAgICAgICAgOiByai5wbGF5UkpDb21tZW50YXJ5LmJpbmQocmopO1xyXG4gICAgZm4oKVxyXG4gICAgICAudGhlbigoKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pKVxyXG4gICAgICAuY2F0Y2goKGVycjogYW55KSA9PlxyXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyPy5tZXNzYWdlIHx8IFN0cmluZyhlcnIpIH0pXHJcbiAgICAgICk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuXHJcbi8vIEluaXRpYWxpemUgd2hlbiBwYWdlIGxvYWRzXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgIGNvbnN0IHlvdXR1YmVSSiA9IG5ldyBZb3VUdWJlUkpNb2RlKCk7XHJcbiAgICAod2luZG93IGFzIGFueSkueW91dHViZVJKID0geW91dHViZVJKO1xyXG4gIH0pO1xyXG59IGVsc2Uge1xyXG4gIGNvbnN0IHlvdXR1YmVSSiA9IG5ldyBZb3VUdWJlUkpNb2RlKCk7XHJcbiAgKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSiA9IHlvdXR1YmVSSjtcclxufVxyXG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT0EsSUFBTSxnQkFBMEM7QUFBQSxFQUM5QyxPQUFPO0FBQUEsRUFDUCxNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQ1Q7QUFFQSxJQUFJLFNBQXVCLEVBQUUsU0FBUyxNQUFNLE9BQU8sT0FBTztBQUUxRCxJQUFNLGdCQUFnQixDQUFDLGFBQXNDO0FBQUEsRUFDM0QsTUFBTSxRQUFRLFNBQVM7QUFBQSxFQUN2QixTQUFTO0FBQUEsSUFDUCxTQUNFLE9BQU8sU0FBUyxtQkFBbUIsWUFBWSxTQUFTLGlCQUFpQjtBQUFBLElBQzNFLE9BQ0UsT0FBTyxVQUFVLFlBQVksU0FBUyxnQkFDakMsUUFDRDtBQUFBLEVBQ1I7QUFBQTtBQUdGLE9BQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxrQkFBa0IsVUFBVSxHQUFHLGFBQWE7QUFDckUsT0FBTyxRQUFRLFVBQVUsWUFBWSxDQUFDLFNBQVMsYUFBYTtB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QVcsMEJBQ3BCLFNBQVMsV0FBVyxvQkFDcEI7QUFBQSxJQUNBLE1BQU0sS0FBTSxPQUFlO0FBQUEsSUFDM0IsSUFBSSxDQUFDLElBQUk7QUFBQSxNQUNQLGFBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyx5Q0FBeUMsQ0FBQztBQUFBLE1BQ2hGLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLEtBQ0osUUFBUSxXQUFXLHlCQUNmLEdBQUcscUJBQXFCLEtBQUssRUFBRSxJQUMvQixHQUFHLGlCQUFpQixLQUFLLEVBQUU7QUFBQSxJQUNqQyxHQUFHLEVBQ0EsS0FBSyxNQUFNLGFBQWEsRUFBRSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQzFDLE1BQU0sQ0FBQyxRQUNOLGFBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxLQUFLLFdBQVcsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUNyRTtBQUFBLElBQ0YsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxDQUNSO0FBR0QsSUFBSSxTQUFTLGVBQWUsV0FBVztBQUFBLEVBQ3JDLFNBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBQUEsSUFDbEQsTUFBTSxZQUFZLElBQUk7QUFBQSxJQUNyQixPQUFlLFlBQVk7QUFBQSxHQUM3QjtBQUNILEVBQU87QUFBQSxFQUNMLE1BQU0sWUFBWSxJQUFJO0FBQUEsRUFDckIsT0FBZSxZQUFZO0FBQUE7IiwKICAiZGVidWdJZCI6ICIwNzA5QjkxOEQ1RjFCMDVDNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
