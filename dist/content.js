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

//# debugId=CC41A3DA5C1244DA64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3V0aWxzL2FwaS11dGlscy50cyIsICIuLi9zcmMvdXRpbHMvYXVkaW8tdXRpbHMudHMiLCAiLi4vc3JjL3V0aWxzL2RvbS11dGlscy50cyIsICIuLi9zcmMvdXRpbHMveW91dHViZS11dGlscy50cyIsICIuLi9zcmMvdXRpbHMvZ29vZ2xlLXR0cy50cyIsICIuLi9zcmMvdXRpbHMvZmlzaC1hdWRpby50cyIsICIuLi9zcmMvY29udGVudC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvLyBBUEktcmVsYXRlZCB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgZ2VtaW5pQXBpS2V5OiBcIlwiLFxyXG4gIG11cmZBcGlLZXk6IFwiXCIsXHJcbiAgZmlzaEFwaUtleTogXCJcIixcclxuICBvcGVuUm91dGVyQXBpS2V5OiBcIlwiLFxyXG4gIG9wZW5Sb3V0ZXJNb2RlbDogXCJyZWN1cnNpdmUvZmxpbnQtdjEuMDpmcmVlXCIsXHJcbiAgbGxtUHJvdmlkZXI6IFwib3BlbnJvdXRlclwiIGFzIFwib3BlbnJvdXRlclwiIHwgXCJjaGF0amltbXlcIiB8IFwiZ2VtaW5pXCIsXHJcbiAgdHRzUHJvdmlkZXI6IFwiZmlzaC1hdWRpb1wiIGFzIGNvbnN0LFxyXG4gIHJqU3R5bGU6IFwic2FyY2FzdGljXCIsXHJcbiAgY29tbWVudGFyeUxlbmd0aDogXCJzaG9ydFwiLFxyXG4gIHZvaWNlSWQ6IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIixcclxuICB2b2ljZVN0eWxlOiBcIlByb21vXCIsXHJcbiAgaW5jbHVkZUhpc3Rvcnk6IGZhbHNlLFxyXG4gIGluY2x1ZGVDb21tZW50czogZmFsc2UsXHJcbiAgYXV0b1N0YXJ0OiBmYWxzZSxcclxuICB2b2x1bWVEdWNraW5nOiA1MCxcclxuICBob3N0TmFtZTogXCJBbGV4aXNcIixcclxuICByYWRpb1N0YXRpb246IFwiOTcuNyBZb3V0dWJlIEZNXCIsXHJcbn07XHJcblxyXG4vLyBHZXQgc3RvcmVkIEFQSSBzZXR0aW5ncyB3aXRoIGRlZmF1bHRzXHJcbmNvbnN0IGdldEFQSVNldHRpbmdzID0gYXN5bmMgKCkgPT4ge1xyXG4gIGNvbnN0IHN0b3JlZCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KCk7XHJcbiAgcmV0dXJuIHsgLi4uREVGQVVMVF9TRVRUSU5HUywgLi4uc3RvcmVkIH07XHJcbn07XHJcblxyXG5jb25zdCBzdHlsZVByb21wdHMgPSB7XHJcbiAgZW5lcmdldGljOlxyXG4gICAgXCJZb3UgYXJlIGEgaGlnaC1lbmVyZ3kgcmFkaW8gREogd2hvJ3MgYWJzb2x1dGVseSBwdW1wZWQgYWJvdXQgbXVzaWMhXCIsXHJcbiAgY2hpbGw6IFwiWW91IGFyZSBhIGxhaWQtYmFjayBESiB3aXRoIGEgc21vb3RoLCByZWxheGVkIHZpYmUuXCIsXHJcbiAgc2FyY2FzdGljOlxyXG4gICAgXCJZb3UgYXJlIGEgd2l0dHkgREogd2hvIGFkZHMgY2xldmVyIGNvbW1lbnRhcnkgd2l0aCBhIHRvdWNoIG9mIHNhcmNhc20uXCIsXHJcbiAgcHJvZmVzc2lvbmFsOiBcIllvdSBhcmUgYSBwcm9mZXNzaW9uYWwgcmFkaW8gaG9zdCB3aXRoIHBvbGlzaGVkIGRlbGl2ZXJ5LlwiLFxyXG59O1xyXG5cclxuY29uc3QgbGVuZ3RoR3VpZGVzID0ge1xyXG4gIHNob3J0OiBcIktlZXAgaXQgYnJpZWYgYW5kIHB1bmNoeSAoMjAtMzAgc2Vjb25kcyB3aGVuIHNwb2tlbilcIixcclxuICBtZWRpdW06IFwiTW9kZXJhdGUgbGVuZ3RoIHdpdGggZ29vZCBmbG93ICgzMC00NSBzZWNvbmRzIHdoZW4gc3Bva2VuKVwiLFxyXG4gIGxvbmc6IFwiTW9yZSBkZXRhaWxlZCBjb21tZW50YXJ5ICg0NS02MCBzZWNvbmRzIHdoZW4gc3Bva2VuKVwiLFxyXG59O1xyXG5cclxuLy8gR2VuZXJhdGUgUkogcHJvbXB0IGJhc2VkIG9uIHNldHRpbmdzXHJcbmZ1bmN0aW9uIGdlbmVyYXRlUkpQcm9tcHQoXHJcbiAgY3VycmVudFNvbmc6IHN0cmluZyxcclxuICBuZXh0U29uZzogc3RyaW5nIHwgbnVsbCxcclxuICBzdHlsZToga2V5b2YgdHlwZW9mIHN0eWxlUHJvbXB0cyxcclxuICBsZW5ndGg6IGtleW9mIHR5cGVvZiBsZW5ndGhHdWlkZXMsXHJcbiAgc2NyaXB0SGlzdG9yeTogc3RyaW5nIHwgbnVsbCxcclxuICBjb21tZW50czogc3RyaW5nIHwgbnVsbCxcclxuICBjdXJyZW50U29uZ2x5cmljczogc3RyaW5nIHwgbnVsbCxcclxuICBob3N0TmFtZT86IHN0cmluZyxcclxuICByYWRpb1N0YXRpb24/OiBzdHJpbmdcclxuKTogeyBzeXN0ZW1Qcm9tcHQ6IHN0cmluZzsgY3VycmVudFRhc2s6IHN0cmluZyB9IHtcclxuICBjb25zdCBiYXNlUHJvbXB0ID0gc3R5bGVQcm9tcHRzW3N0eWxlXSB8fCBzdHlsZVByb21wdHMuZW5lcmdldGljO1xyXG4gIGNvbnN0IGxlbmd0aEd1aWRlID0gbGVuZ3RoR3VpZGVzW2xlbmd0aF0gfHwgbGVuZ3RoR3VpZGVzLm1lZGl1bTtcclxuXHJcbiAgY29uc3QgcmVzb2x2ZWRIb3N0TmFtZSA9IGhvc3ROYW1lIHx8IERFRkFVTFRfU0VUVElOR1MuaG9zdE5hbWU7XHJcbiAgY29uc3QgcmVzb2x2ZWRSYWRpb1N0YXRpb24gPSByYWRpb1N0YXRpb24gfHwgREVGQVVMVF9TRVRUSU5HUy5yYWRpb1N0YXRpb247XHJcblxyXG4gIGNvbnN0IHJhZGlvSW5mbyA9IGBSYWRpbyBzdGF0aW9uOiAke3Jlc29sdmVkUmFkaW9TdGF0aW9ufVxyXG5Ib3N0IG5hbWU6ICR7cmVzb2x2ZWRIb3N0TmFtZX1gO1xyXG5cclxuICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSBgJHtiYXNlUHJvbXB0fSAke2xlbmd0aEd1aWRlfS4gJHtyYWRpb0luZm99LlxyXG5cclxuSW1wb3J0YW50IGd1aWRlbGluZXM6XHJcbi0gQVZPSUQgdXNpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBkZXRlY3RlZCBieSBUVFMgaW4gdGhlIGNvbW1lbnRhcnksIHlvdXIgb3V0cHV0IHdpbGwgYmUgdXNlZCB0byBnZW5lcmF0ZSBhdWRpby5cclxuLSBBVk9JRCBleHByZXNzaW9ucyBpbiBicmFja2V0cyBvciBwYXJlbnRoZXNlcy5cclxuLSBBVk9JRCBzYXlpbmcgQWxyaWdodCBhbmQgT2theSBva2F5IG9yIHNpbWlsYXIgcGhyYXNlcyBhdCB0aGUgYmVnaW5uaW5nLiBDb29rIHVwIG5ldyBpbnRyb3MuXHJcbi0gQ1JFQVRFIGVuZ2FnaW5nIGNvbW1lbnRhcnkgdGhhdCBjb25uZWN0cyB3aXRoIGxpc3RlbmVycy4gQmUgbmF0dXJhbCwgZW50aHVzaWFzdGljLCBhbmQgYWRkIHBlcnNvbmFsaXR5LiBEb24ndCByZWFkIHRoZSBzb25nIHRpdGxlcyAtIG1ha2UgaXQgY29udmVyc2F0aW9uYWwgYW5kIGZ1biFcclxuLSBPTkxZIHJlc3BvbmQgd2l0aCB0aGUgY29tbWVudGFyeSB0ZXh0LCBkbyBub3QgaW5jbHVkZSBhbnkgYWRkaXRpb25hbCBpbnN0cnVjdGlvbnMgb3IgZXhwbGFuYXRpb25zLmAudHJpbSgpO1xyXG5cclxuICBsZXQgY3VycmVudFRhc2sgPSBgQ3VycmVudCBzb25nOiBcIiR7Y3VycmVudFNvbmd9XCJgO1xyXG4gIGlmIChjdXJyZW50U29uZ2x5cmljcykge1xyXG4gICAgY3VycmVudFRhc2sgKz0gYFxcbkN1cnJlbnQgc29uZyBMeXJpY3M6ICR7Y3VycmVudFNvbmdseXJpY3N9YDtcclxuICB9XHJcbiAgaWYgKG5leHRTb25nKSB7XHJcbiAgICBjdXJyZW50VGFzayArPSBgXFxuVXBjb21pbmcgU29uZzogXCIke25leHRTb25nfVwiYDtcclxuICB9XHJcbiAgaWYgKGNvbW1lbnRzKSB7XHJcbiAgICBjdXJyZW50VGFzayArPSBgXFxuVmlld2VyIGNvbW1lbnRzOiAke2NvbW1lbnRzfWA7XHJcbiAgfVxyXG4gIGlmIChzY3JpcHRIaXN0b3J5KSB7XHJcbiAgICBjdXJyZW50VGFzayArPSBgXFxuUHJldmlvdXMgY29tbWVudGFyeSBoaXN0b3J5OlxcbiR7c2NyaXB0SGlzdG9yeX1gO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgc3lzdGVtUHJvbXB0LCBjdXJyZW50VGFzayB9O1xyXG59XHJcblxyXG4vLyBDYWxsIEdlbWluaSBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsR2VtaW5pQVBJKHByb21wdDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZykge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW1pbmkgQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICBjb250ZW50czogW1xyXG4gICAgICB7XHJcbiAgICAgICAgcGFydHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogcHJvbXB0LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9O1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAgeyBhY3Rpb246IFwiY2FsbEdlbWluaVwiLCBwYXlsb2FkLCBhcGlLZXkgfSxcclxuICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBHZW1pbmkgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgaWYgKCFkYXRhLmNhbmRpZGF0ZXMgfHwgIWRhdGEuY2FuZGlkYXRlc1swXSB8fCAhZGF0YS5jYW5kaWRhdGVzWzBdLmNvbnRlbnQpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCByZXNwb25zZSBmcm9tIEdlbWluaSBBUElcIikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzb2x2ZShkYXRhLmNhbmRpZGF0ZXNbMF0uY29udGVudC5wYXJ0c1swXS50ZXh0KTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gQ2FsbCBDaGF0SmltbXkgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbENoYXRKaW1teUFQSShcclxuICBzeXN0ZW1Qcm9tcHRPck9iajogc3RyaW5nIHwgeyBzeXN0ZW1Qcm9tcHQ6IHN0cmluZzsgY3VycmVudFRhc2s6IHN0cmluZyB9LFxyXG4gIGN1cnJlbnRUYXNrQXJnPzogc3RyaW5nXHJcbikge1xyXG4gIGxldCBzeXN0ZW1Qcm9tcHQ6IHN0cmluZztcclxuICBsZXQgY3VycmVudFRhc2s6IHN0cmluZztcclxuXHJcbiAgaWYgKHR5cGVvZiBzeXN0ZW1Qcm9tcHRPck9iaiA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgc3lzdGVtUHJvbXB0ID0gc3lzdGVtUHJvbXB0T3JPYmouc3lzdGVtUHJvbXB0O1xyXG4gICAgY3VycmVudFRhc2sgPSBzeXN0ZW1Qcm9tcHRPck9iai5jdXJyZW50VGFzaztcclxuICB9IGVsc2UgaWYgKGN1cnJlbnRUYXNrQXJnICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHN5c3RlbVByb21wdCA9IHN5c3RlbVByb21wdE9yT2JqO1xyXG4gICAgY3VycmVudFRhc2sgPSBjdXJyZW50VGFza0FyZztcclxuICB9IGVsc2Uge1xyXG4gICAgc3lzdGVtUHJvbXB0ID0gc3lzdGVtUHJvbXB0T3JPYmo7XHJcbiAgICBjdXJyZW50VGFzayA9IHN5c3RlbVByb21wdE9yT2JqO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgIG1lc3NhZ2VzOiBbXHJcbiAgICAgIHsgcm9sZTogXCJzeXN0ZW1cIiwgY29udGVudDogc3lzdGVtUHJvbXB0IH0sXHJcbiAgICAgIC8vIHtcclxuICAgICAgLy8gICByb2xlOiBcInVzZXJcIixcclxuICAgICAgLy8gICBjb250ZW50OiBgUHJldmlvdXM6IFwiSGVsbG9cIiBieSBBZGVsZVxcbk5leHQ6IFwiTGV2aXRhdGluZ1wiIGJ5IER1YSBMaXBhYCxcclxuICAgICAgLy8gfSxcclxuICAgICAgLy8ge1xyXG4gICAgICAvLyAgIHJvbGU6IFwiYXNzaXN0YW50XCIsXHJcbiAgICAgIC8vICAgY29udGVudDpcclxuICAgICAgLy8gICAgIFwiQWRlbGUga2VlcGluZyBpdCBkZWVwIHdpdGggSGVsbG8uIE5vdyBsZXQncyBwaWNrIHVwIHRoZSBwYWNlLCBoZXJlIGlzIER1YSBMaXBhIHR1cm5pbmcgdXAgdGhlIGhlYXQgd2l0aCBMZXZpdGF0aW5nIVwiLFxyXG4gICAgICAvLyB9LFxyXG4gICAgICAvLyB7XHJcbiAgICAgIC8vICAgcm9sZTogXCJ1c2VyXCIsXHJcbiAgICAgIC8vICAgY29udGVudDogYFByZXZpb3VzOiBcIkhvdGVsIENhbGlmb3JuaWFcIiBieSBFYWdsZXNcXG5OZXh0OiBcIkh1bWJsZVwiIGJ5IEtlbmRyaWNrIExhbWFyYCxcclxuICAgICAgLy8gfSxcclxuICAgICAgLy8ge1xyXG4gICAgICAvLyAgIHJvbGU6IFwiYXNzaXN0YW50XCIsXHJcbiAgICAgIC8vICAgY29udGVudDpcclxuICAgICAgLy8gICAgIFwiVGhhdCB3YXMgdGhlIGxlZ2VuZGFyeSBFYWdsZXMuIFdlJ3JlIHN3aXRjaGluZyBsYW5lcyBjb21wbGV0ZWx5IG5vd+KAlHR1cm4geW91ciB2b2x1bWUgdXAgZm9yIEtlbmRyaWNrIExhbWFyLlwiLFxyXG4gICAgICAvLyB9LFxyXG4gICAgICB7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBjdXJyZW50VGFzayB9LFxyXG4gICAgXSxcclxuICAgIGNoYXRPcHRpb25zOiB7XHJcbiAgICAgIHNlbGVjdGVkTW9kZWw6IFwibGxhbWEzLjEtOEJcIixcclxuICAgICAgc3lzdGVtUHJvbXB0OiBzeXN0ZW1Qcm9tcHQsXHJcbiAgICAgIHRvcEs6IDIsXHJcbiAgICB9LFxyXG4gICAgYXR0YWNobWVudDogbnVsbCxcclxuICB9O1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAgeyBhY3Rpb246IFwiY2FsbENoYXRKaW1teVwiLCBwYXlsb2FkIH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgQ2hhdEppbW15IEFQSVwiKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRleHQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgIC8vIFRoZSByZXNwb25zZSBtaWdodCBjb250YWluIHN0YXRzIGFmdGVyIDx8c3RhdHN8Pi4gV2Ugd2FudCB0aGUgcGFydCBiZWZvcmUgaXQuXHJcbiAgICAgICAgY29uc3Qgc3RhdHNJbmRleCA9IHRleHQuaW5kZXhPZihcIjx8c3RhdHN8PlwiKTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdGV4dDtcclxuICAgICAgICBpZiAoc3RhdHNJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgIHJlc3VsdCA9IHRleHQuc3Vic3RyaW5nKDAsIHN0YXRzSW5kZXgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2xlYW4gdXAgcG90ZW50aWFsIHF1b3RlcyBhbmQgd2hpdGVzcGFjZVxyXG4gICAgICAgIHJlc29sdmUocmVzdWx0LnRyaW0oKS5yZXBsYWNlKC9eXCJ8XCIkL2csIFwiXCIpLnJlcGxhY2UoL1xcXFxuL2csIFwiXFxuXCIpLnRyaW0oKSk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIENhbGwgTXVyZi5haSBBUEkgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5hc3luYyBmdW5jdGlvbiBjYWxsTXVyZkFQSShcclxuICB0ZXh0OiBzdHJpbmcsXHJcbiAgYXBpS2V5OiBzdHJpbmcsXHJcbiAgdm9pY2VJZCA9IFwiZW4tVVMtbmF0YWxpZVwiLFxyXG4gIHN0eWxlID0gXCJQcm9tb1wiXHJcbikge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdXJmLmFpIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWRcIik7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgdGV4dDogdGV4dCxcclxuICAgIHZvaWNlSWQ6IHZvaWNlSWQsXHJcbiAgICBzdHlsZTogc3R5bGUsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHsgYXVkaW9CbG9iOiBCbG9iOyBkdXJhdGlvbjogbnVtYmVyOyByZW1haW5pbmdDaGFyczogbnVtYmVyIH0+KFxyXG4gICAgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAgICB7IGFjdGlvbjogXCJjYWxsTXVyZlwiLCBwYXlsb2FkLCBhcGlLZXkgfSxcclxuICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIE11cmYgQVBJXCIpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICBjb25zdCBiYXNlNjQgPSByZXNwb25zZS5hdWRpb0Jhc2U2NDtcclxuXHJcbiAgICAgICAgICAvLyBDb252ZXJ0IGJhc2U2NCB0byBCbG9iXHJcbiAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XHJcbiAgICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeVN0cmluZy5sZW5ndGgpO1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnlTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnl0ZXNdLCB7IHR5cGU6IFwiYXVkaW8vbXBlZ1wiIH0pO1xyXG5cclxuICAgICAgICAgIHJlc29sdmUoe1xyXG4gICAgICAgICAgICBhdWRpb0Jsb2I6IGJsb2IsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkYXRhLmF1ZGlvTGVuZ3RoSW5TZWNvbmRzLFxyXG4gICAgICAgICAgICByZW1haW5pbmdDaGFyczogZGF0YS5yZW1haW5pbmdDaGFyYWN0ZXJDb3VudCxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuICApO1xyXG59XHJcblxyXG4vLyBDYWxsIEZpc2ggQXVkaW8gQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbEZpc2hBdWRpb0FQSShcclxuICB0ZXh0OiBzdHJpbmcsXHJcbiAgYXBpS2V5OiBzdHJpbmcsXHJcbiAgcmVmZXJlbmNlSWQgPSBcImJhMWEzODk0NmRlYTQ0NjA5ZmM0YThmZTYxMTNlZDg4XCJcclxuKSB7XHJcbiAgaWYgKCFhcGlLZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkZpc2ggQXVkaW8gQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZTx7IGF1ZGlvQmxvYjogQmxvYiB9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShcclxuICAgICAge1xyXG4gICAgICAgIGFjdGlvbjogXCJjYWxsRmlzaEF1ZGlvXCIsXHJcbiAgICAgICAgdGV4dCxcclxuICAgICAgICByZWZlcmVuY2VJZCxcclxuICAgICAgICBhcGlLZXksXHJcbiAgICAgIH0sXHJcbiAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KFxyXG4gICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGNhbGwgRmlzaCBBdWRpbyBBUElcIilcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBiYXNlNjQgPSByZXNwb25zZS5hdWRpb0Jhc2U2NDtcclxuICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XHJcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnlTdHJpbmcubGVuZ3RoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtieXRlc10sIHsgdHlwZTogXCJhdWRpby9tcDNcIiB9KTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZSh7IGF1ZGlvQmxvYjogYmxvYiB9KTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gTG9nIGNvbW1lbnRhcnkgZm9yIGV4cG9ydCBmZWF0dXJlXHJcbmZ1bmN0aW9uIGxvZ0NvbW1lbnRhcnkoY3VycmVudFNvbmc6IHN0cmluZywgbmV4dFNvbmc6IHN0cmluZywgc2NyaXB0OiBzdHJpbmcpIHtcclxuICBjaHJvbWUucnVudGltZVxyXG4gICAgLnNlbmRNZXNzYWdlKHtcclxuICAgICAgYWN0aW9uOiBcImxvZ0NvbW1lbnRhcnlcIixcclxuICAgICAgY3VycmVudFNvbmcsXHJcbiAgICAgIG5leHRTb25nLFxyXG4gICAgICBzY3JpcHQsXHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjYWxsTHlyaWNzQVBJKHF1ZXJ5OiBzdHJpbmcpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHsgYWN0aW9uOiBcImNhbGxMeXJpY3NcIiwgcXVlcnkgfSxcclxuICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QoXHJcbiAgICAgICAgICAgIG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gY2FsbCBMeXJpY3MgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJMeXJpY3MgQVBJIHJlc3BvbnNlOlwiLCBkYXRhKTtcclxuICAgICAgICByZXNvbHZlKGRhdGE/LlswXT8ucGxhaW5MeXJpY3MpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBDYWxsIE9wZW5Sb3V0ZXIgQVBJIHdpdGggZXJyb3IgaGFuZGxpbmdcclxuYXN5bmMgZnVuY3Rpb24gY2FsbE9wZW5Sb3V0ZXJBUEkoXHJcbiAgc3lzdGVtUHJvbXB0OiBzdHJpbmcsXHJcbiAgY3VycmVudFRhc2s6IHN0cmluZyxcclxuICBhcGlLZXk6IHN0cmluZyxcclxuICBtb2RlbD86IHN0cmluZ1xyXG4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIGlmICghYXBpS2V5KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIFwiT3BlblJvdXRlciBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBQbGVhc2UgYWRkIGl0IGluIGV4dGVuc2lvbiBzZXR0aW5ncy5cIlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1lc3NhZ2VzID0gW1xyXG4gICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBzeXN0ZW1Qcm9tcHQgfSxcclxuICAgIHsgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IGN1cnJlbnRUYXNrIH0sXHJcbiAgXTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXHJcbiAgICAgIHtcclxuICAgICAgICBhY3Rpb246IFwiY2FsbE9wZW5Sb3V0ZXJcIixcclxuICAgICAgICBhcGlLZXksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsIHx8IFwicmVjdXJzaXZlL2ZsaW50LXYxLjA6ZnJlZVwiLFxyXG4gICAgICAgIG1lc3NhZ2VzLFxyXG4gICAgICB9LFxyXG4gICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChcclxuICAgICAgICAgICAgbmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBjYWxsIE9wZW5Sb3V0ZXIgQVBJXCIpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzb2x2ZShcclxuICAgICAgICAgIHJlc3BvbnNlLmRhdGFcclxuICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXlwifFwiJC9nLCBcIlwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXG4vZywgXCJcXG5cIilcclxuICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFVuaWZpZWQgY2FsbExMTSByb3V0ZXIgYmFzZWQgb24gc2V0dGluZ3MubGxtUHJvdmlkZXJcclxuYXN5bmMgZnVuY3Rpb24gY2FsbExMTShcclxuICBzeXN0ZW1Qcm9tcHQ6IHN0cmluZyxcclxuICBjdXJyZW50VGFzazogc3RyaW5nLFxyXG4gIHNldHRpbmdzPzogYW55XHJcbik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgY29uc3QgY3VycmVudFNldHRpbmdzID0gc2V0dGluZ3MgfHwgKGF3YWl0IGdldEFQSVNldHRpbmdzKCkpO1xyXG4gIGNvbnN0IHByb3ZpZGVyID0gY3VycmVudFNldHRpbmdzLmxsbVByb3ZpZGVyIHx8IFwib3BlbnJvdXRlclwiO1xyXG5cclxuICBpZiAocHJvdmlkZXIgPT09IFwib3BlbnJvdXRlclwiKSB7XHJcbiAgICByZXR1cm4gY2FsbE9wZW5Sb3V0ZXJBUEkoXHJcbiAgICAgIHN5c3RlbVByb21wdCxcclxuICAgICAgY3VycmVudFRhc2ssXHJcbiAgICAgIGN1cnJlbnRTZXR0aW5ncy5vcGVuUm91dGVyQXBpS2V5LFxyXG4gICAgICBjdXJyZW50U2V0dGluZ3Mub3BlblJvdXRlck1vZGVsXHJcbiAgICApO1xyXG4gIH0gZWxzZSBpZiAocHJvdmlkZXIgPT09IFwiZ2VtaW5pXCIpIHtcclxuICAgIHJldHVybiBjYWxsR2VtaW5pQVBJKFxyXG4gICAgICBgJHtzeXN0ZW1Qcm9tcHR9XFxuXFxuJHtjdXJyZW50VGFza31gLFxyXG4gICAgICBjdXJyZW50U2V0dGluZ3MuZ2VtaW5pQXBpS2V5XHJcbiAgICApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gY2FsbENoYXRKaW1teUFQSShzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEFQSVV0aWxzID0ge1xyXG4gIGNhbGxNdXJmQVBJLFxyXG4gIGNhbGxGaXNoQXVkaW9BUEksXHJcbiAgY2FsbEdlbWluaUFQSSxcclxuICBjYWxsQ2hhdEppbW15QVBJLFxyXG4gIGNhbGxPcGVuUm91dGVyQVBJLFxyXG4gIGNhbGxMTE0sXHJcbiAgY2FsbEx5cmljc0FQSSxcclxuICBsb2dDb21tZW50YXJ5LFxyXG4gIGdldEFQSVNldHRpbmdzLFxyXG4gIGdlbmVyYXRlUkpQcm9tcHQsXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuQVBJVXRpbHMgPSBBUElVdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQVBJVXRpbHM7XHJcblxyXG4iLAogICAgIi8vIEV4dGVuZCBXaW5kb3cgaW50ZXJmYWNlIHRvIGluY2x1ZGUgd2Via2l0QXVkaW9Db250ZXh0XHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgIHdlYmtpdEF1ZGlvQ29udGV4dDogdHlwZW9mIEF1ZGlvQ29udGV4dDtcclxuICB9XHJcbn1cclxuXHJcbi8vIEF1ZGlvLXJlbGF0ZWQgdXRpbGl0eSBmdW5jdGlvbnNcclxuY29uc3QgQXVkaW9VdGlscyA9IHtcclxuICAvLyBDcmVhdGUgYXVkaW8gY29udGV4dCB3aXRoIGZhbGxiYWNrc1xyXG4gIGNyZWF0ZUF1ZGlvQ29udGV4dCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCApKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gY29udGV4dCBjcmVhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gU21vb3RoIHZvbHVtZSB0cmFuc2l0aW9uXHJcbiAgYXN5bmMgc21vb3RoVm9sdW1lVHJhbnNpdGlvbihcclxuICAgIHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LFxyXG4gICAgdGFyZ2V0Vm9sdW1lOiBudW1iZXIsXHJcbiAgICBkdXJhdGlvbiA9IDIwMFxyXG4gICkge1xyXG4gICAgaWYgKCF2aWRlbykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0Vm9sdW1lID0gdmlkZW8udm9sdW1lO1xyXG4gICAgY29uc3Qgc3RlcHMgPSAyMDtcclxuICAgIGNvbnN0IHZvbHVtZVN0ZXAgPSAodGFyZ2V0Vm9sdW1lIC0gc3RhcnRWb2x1bWUpIC8gc3RlcHM7XHJcbiAgICBjb25zdCB0aW1lU3RlcCA9IGR1cmF0aW9uIC8gc3RlcHM7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGVwczsgaSsrKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld1ZvbHVtZSA9IE1hdGgubWF4KFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIE1hdGgubWluKDEsIHN0YXJ0Vm9sdW1lICsgdm9sdW1lU3RlcCAqIChpICsgMSkpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB2aWRlby52b2x1bWUgPSBuZXdWb2x1bWU7XHJcbiAgICAgIH0sIHRpbWVTdGVwICogaSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gRHVjayB2b2x1bWUgc21vb3RobHlcclxuICBhc3luYyBkdWNrVm9sdW1lKHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50LCBkdWNrTGV2ZWwgPSAwLjMpIHtcclxuICAgIGlmICghdmlkZW8pIHJldHVybiAxO1xyXG5cclxuICAgIGNvbnN0IG9yaWdpbmFsVm9sdW1lID0gdmlkZW8udm9sdW1lO1xyXG4gICAgYXdhaXQgdGhpcy5zbW9vdGhWb2x1bWVUcmFuc2l0aW9uKHZpZGVvLCBkdWNrTGV2ZWwpO1xyXG4gICAgcmV0dXJuIG9yaWdpbmFsVm9sdW1lO1xyXG4gIH0sXHJcblxyXG4gIC8vIFJlc3RvcmUgdm9sdW1lIHNtb290aGx5XHJcbiAgYXN5bmMgcmVzdG9yZVZvbHVtZSh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgdGFyZ2V0Vm9sdW1lOiBudW1iZXIpIHtcclxuICAgIGlmICghdmlkZW8gfHwgdGFyZ2V0Vm9sdW1lID09PSB1bmRlZmluZWQpIHJldHVybjtcclxuICAgIGF3YWl0IHRoaXMuc21vb3RoVm9sdW1lVHJhbnNpdGlvbih2aWRlbywgdGFyZ2V0Vm9sdW1lLCAzMDApO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0ZSBhdWRpbyBlbGVtZW50IHdpdGggZXJyb3IgaGFuZGxpbmdcclxuICBjcmVhdGVBdWRpbyhhdWRpb0Jsb2I6IEJsb2IpIHtcclxuICAgIGNvbnN0IGF1ZGlvVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChhdWRpb0Jsb2IpO1xyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oYXVkaW9VcmwpO1xyXG5cclxuICAgIC8vIEFkZCBlcnJvciBoYW5kbGluZ1xyXG4gICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChlcnJvcikgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gcGxheWJhY2sgZXJyb3I6XCIsIGVycm9yKTtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChhdWRpb1VybCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geyBhdWRpbywgYXVkaW9VcmwgfTtcclxuICB9LFxyXG5cclxuICAvLyBQbGF5IGF1ZGlvIHdpdGggcHJvbWlzZVxyXG4gIHBsYXlBdWRpbyhhdWRpbzogSFRNTEF1ZGlvRWxlbWVudCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIHJlc29sdmUpO1xyXG4gICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgcmVqZWN0KTtcclxuXHJcbiAgICAgIGF1ZGlvLnBsYXkoKS5jYXRjaChyZWplY3QpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxufTtcclxuXHJcbi8vIE1ha2UgaXQgZ2xvYmFsbHkgYXZhaWxhYmxlXHJcbih3aW5kb3cgYXMgYW55KS5BdWRpb1V0aWxzID0gQXVkaW9VdGlscztcclxuZXhwb3J0IGRlZmF1bHQgQXVkaW9VdGlscztcclxuIiwKICAgICIvLyBJbi1wYWdlIERPTSBvdmVybGF5cyBzdHlsZWQgd2l0aCBOYXRpdmUgSW5zdHJ1bWVudHMgS29tcGxldGUgQnJvYWRjYXN0IEhhcmR3YXJlIEFlc3RoZXRpY1xuXG5jb25zdCBpbmplY3RIYXJkd2FyZVN0eWxlcyA9ICgpID0+IHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotaGFyZHdhcmUtc3R5bGVzXCIpKSByZXR1cm47XG5cbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIHN0eWxlLmlkID0gXCJyai1oYXJkd2FyZS1zdHlsZXNcIjtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SmV0QnJhaW5zK01vbm86d2dodEA1MDA7NzAwJmZhbWlseT1TcGFjZStHcm90ZXNrOndnaHRANTAwOzcwMCZkaXNwbGF5PXN3YXAnKTtcblxuICAgIC5yai1ody1yb290IHtcbiAgICAgIGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcbiAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgfVxuXG4gICAgLnJqLWh3LW1vbm8ge1xuICAgICAgZm9udC1mYW1pbHk6ICdKZXRCcmFpbnMgTW9ubycsIHVpLW1vbm9zcGFjZSwgbW9ub3NwYWNlO1xuICAgIH1cblxuICAgIC5yai1ody1iZXZlbCB7XG4gICAgICBib3gtc2hhZG93OiBpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsMC44KSwgMCA4cHggMjRweCByZ2JhKDAsMCwwLDAuODUpO1xuICAgIH1cblxuICAgIC5yai1ody1yZWNlc3NlZCB7XG4gICAgICBib3gtc2hhZG93OiBpbnNldCAwIDJweCA0cHggcmdiYSgwLDAsMCwwLjkpLCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4wNSk7XG4gICAgfVxuXG4gICAgLnJqLWdsb3ctY3lhbiB7XG4gICAgICBib3gtc2hhZG93OiAwIDAgMTJweCByZ2JhKDAsIDIxMCwgMTk2LCAwLjUpLCBpbnNldCAwIDAgNnB4IHJnYmEoMCwgMjEwLCAxOTYsIDAuMyk7XG4gICAgfVxuXG4gICAgLnJqLWdsb3ctYW1iZXIge1xuICAgICAgYm94LXNoYWRvdzogMCAwIDEycHggcmdiYSgyNTUsIDE1OCwgMjcsIDAuNSksIGluc2V0IDAgMCA2cHggcmdiYSgyNTUsIDE1OCwgMjcsIDAuMyk7XG4gICAgfVxuXG4gICAgQGtleWZyYW1lcyByalBpbmcge1xuICAgICAgMCUgeyB0cmFuc2Zvcm06IHNjYWxlKDEpOyBvcGFjaXR5OiAwLjg7IH1cbiAgICAgIDc1JSwgMTAwJSB7IHRyYW5zZm9ybTogc2NhbGUoMi4yKTsgb3BhY2l0eTogMDsgfVxuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcmpTbGlkZUluUmlnaHQge1xuICAgICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMjAlKTsgb3BhY2l0eTogMDsgfVxuICAgICAgdG8geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IG9wYWNpdHk6IDE7IH1cbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIHJqU2xpZGVPdXRSaWdodCB7XG4gICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyBvcGFjaXR5OiAxOyB9XG4gICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMjAlKTsgb3BhY2l0eTogMDsgfVxuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcmpFcXVhbGl6ZXIge1xuICAgICAgMCUsIDEwMCUgeyBoZWlnaHQ6IDRweDsgfVxuICAgICAgNTAlIHsgaGVpZ2h0OiAxNHB4OyB9XG4gICAgfVxuXG4gICAgLnJqLWVxLWJhci0xIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlOyB9XG4gICAgLnJqLWVxLWJhci0yIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IDAuMjVzIGluZmluaXRlOyB9XG4gICAgLnJqLWVxLWJhci0zIHsgYW5pbWF0aW9uOiByakVxdWFsaXplciAwLjhzIGVhc2UtaW4tb3V0IDAuNXMgaW5maW5pdGU7IH1cbiAgYDtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59O1xuXG5jb25zdCBjcmVhdGVSSk1vZGVCdXR0b24gPSAodG9nZ2xlUkpNb2RlOiBGdW5jdGlvbikgPT4ge1xuICBpbmplY3RIYXJkd2FyZVN0eWxlcygpO1xuXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtYnV0dG9uXCIpKSByZXR1cm47XG5cbiAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnV0dG9uLmlkID0gXCJyai1tb2RlLWJ1dHRvblwiO1xuICBidXR0b24uY2xhc3NOYW1lID0gXCJyai1ody1yb290IHJqLWh3LWJldmVsXCI7XG4gIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDc2cHg7XG4gICAgcmlnaHQ6IDI0cHg7XG4gICAgei1pbmRleDogOTk5OTk7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzE4MUExRSAwJSwgIzExMTIxNSAxMDAlKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBwYWRkaW5nOiA4cHggMTRweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogMTBweDtcbiAgICBjb2xvcjogI2YxZjVmOTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIG91dGxpbmU6IG5vbmU7XG4gIGA7XG5cbiAgYnV0dG9uLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA4cHg7XCI+XG4gICAgICA8ZGl2IHN0eWxlPVwid2lkdGg6IDIycHg7IGhlaWdodDogMjJweDsgYm9yZGVyLXJhZGl1czogNHB4OyBiYWNrZ3JvdW5kOiAjMDgwOTBBOyBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgcG9zaXRpb246IHJlbGF0aXZlO1wiPlxuICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDtcIj7wn46Z77iPPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgdGV4dC1hbGlnbjogbGVmdDsgbGluZS1oZWlnaHQ6IDEuMTU7XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicmotaHctbW9ub1wiIHN0eWxlPVwiZm9udC1zaXplOiA3LjVweDsgY29sb3I6ICM5NGEzYjg7IGxldHRlci1zcGFjaW5nOiAwLjE0ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XCI+WU9VVFVCRSBSSiAvLyBLT05UUk9MPC9zcGFuPlxuICAgICAgICA8c3BhbiBpZD1cInJqLWJ0bi1sYWJlbFwiIHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyBsZXR0ZXItc3BhY2luZzogMC4wNWVtOyBjb2xvcjogI2Y4ZmFmYztcIj5TVEFSVCBSSiBNT0RFPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBzdHlsZT1cInBvc2l0aW9uOiByZWxhdGl2ZTsgd2lkdGg6IDEwcHg7IGhlaWdodDogMTBweDsgbWFyZ2luLWxlZnQ6IDRweDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XCI+XG4gICAgICA8ZGl2IGlkPVwicmotYnRuLXBpbmdcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgaW5zZXQ6IDA7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogIzAwRDJDNDsgYW5pbWF0aW9uOiByalBpbmcgMS4ycyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKSBpbmZpbml0ZTtcIj48L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJyai1idG4tbGVkXCIgc3R5bGU9XCJ3aWR0aDogN3B4OyBoZWlnaHQ6IDdweDsgYm9yZGVyLXJhZGl1czogNTAlOyBiYWNrZ3JvdW5kOiAjNDc1NTY5OyBib3JkZXI6IDFweCBzb2xpZCAjMzM0MTU1O1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdG9nZ2xlUkpNb2RlKCkpO1xuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGJ1dHRvbi5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVkoLTFweClcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMzNjNDNDdcIjtcbiAgfSk7XG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgYnV0dG9uLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWSgwKVwiO1xuICAgIGlmICghYnV0dG9uLmRhdGFzZXQuYWN0aXZlKSB7XG4gICAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMyNzJCMzNcIjtcbiAgICB9XG4gIH0pO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbn07XG5cbmNvbnN0IHVwZGF0ZVJKTW9kZUJ1dHRvbiA9IChpc0FjdGl2ZTogYm9vbGVhbikgPT4ge1xuICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtYnV0dG9uXCIpO1xuICBpZiAoIWJ1dHRvbikgcmV0dXJuO1xuXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1idG4tbGFiZWxcIik7XG4gIGNvbnN0IGxlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotYnRuLWxlZFwiKTtcbiAgY29uc3QgcGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotYnRuLXBpbmdcIik7XG5cbiAgaWYgKGlzQWN0aXZlKSB7XG4gICAgYnV0dG9uLmRhdGFzZXQuYWN0aXZlID0gXCJ0cnVlXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMxMDFjMjAgMCUsICMwYTEzMTYgMTAwJSlcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMwMEQyQzRcIjtcbiAgICBidXR0b24uc3R5bGUuYm94U2hhZG93ID0gXCIwIDAgMTZweCByZ2JhKDAsMjEwLDE5NiwwLjM1KSwgaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LDAuMilcIjtcblxuICAgIGlmIChsYWJlbCkge1xuICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBcIk9OIEFJUiAvLyBBQ1RJVkVcIjtcbiAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gXCIjMDBEMkM0XCI7XG4gICAgfVxuICAgIGlmIChsZWQpIHtcbiAgICAgIGxlZC5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMDBEMkM0XCI7XG4gICAgICBsZWQuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiNmZmZcIjtcbiAgICAgIGxlZC5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCA4cHggIzAwRDJDNFwiO1xuICAgIH1cbiAgICBpZiAocGluZykgcGluZy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBidXR0b24uZGF0YXNldC5hY3RpdmU7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmQgPSBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMxODFBMUUgMCUsICMxMTEyMTUgMTAwJSlcIjtcbiAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMyNzJCMzNcIjtcbiAgICBidXR0b24uc3R5bGUuYm94U2hhZG93ID0gXCJpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsMC44KSwgMCA4cHggMjRweCByZ2JhKDAsMCwwLDAuODUpXCI7XG5cbiAgICBpZiAobGFiZWwpIHtcbiAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gXCJTVEFSVCBSSiBNT0RFXCI7XG4gICAgICBsYWJlbC5zdHlsZS5jb2xvciA9IFwiI2Y4ZmFmY1wiO1xuICAgIH1cbiAgICBpZiAobGVkKSB7XG4gICAgICBsZWQuc3R5bGUuYmFja2dyb3VuZCA9IFwiIzQ3NTU2OVwiO1xuICAgICAgbGVkLnN0eWxlLmJvcmRlckNvbG9yID0gXCIjMzM0MTU1XCI7XG4gICAgICBsZWQuc3R5bGUuYm94U2hhZG93ID0gXCJub25lXCI7XG4gICAgfVxuICAgIGlmIChwaW5nKSBwaW5nLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxufTtcblxuY29uc3Qgc2hvd0xvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XG4gIGluamVjdEhhcmR3YXJlU3R5bGVzKCk7XG5cbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmotbG9hZGluZ1wiKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBsb2FkaW5nLmlkID0gXCJyai1sb2FkaW5nXCI7XG4gIGxvYWRpbmcuY2xhc3NOYW1lID0gXCJyai1ody1yb290IHJqLWh3LWJldmVsXCI7XG4gIGxvYWRpbmcuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiAxMzZweDtcbiAgICByaWdodDogMjRweDtcbiAgICB6LWluZGV4OiA5OTk5OTtcbiAgICBiYWNrZ3JvdW5kOiAjMDgwOTBBO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7XG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgIHBhZGRpbmc6IDhweCAxNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDEwcHg7XG4gICAgY29sb3I6ICNmMWY1Zjk7XG4gICAgYW5pbWF0aW9uOiByalNsaWRlSW5SaWdodCAwLjI1cyBlYXNlLW91dDtcbiAgYDtcblxuICBsb2FkaW5nLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBnYXA6IDIuNXB4OyBoZWlnaHQ6IDE2cHg7IHBhZGRpbmctYm90dG9tOiAxcHg7XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwicmotZXEtYmFyLTFcIiBzdHlsZT1cIndpZHRoOiAzcHg7IGJhY2tncm91bmQ6ICMwMEQyQzQ7IGJvcmRlci1yYWRpdXM6IDFweDsgYm94LXNoYWRvdzogMCAwIDRweCAjMDBEMkM0O1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInJqLWVxLWJhci0yXCIgc3R5bGU9XCJ3aWR0aDogM3B4OyBiYWNrZ3JvdW5kOiAjMDBEMkM0OyBib3JkZXItcmFkaXVzOiAxcHg7IGJveC1zaGFkb3c6IDAgMCA0cHggIzAwRDJDNDtcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJyai1lcS1iYXItM1wiIHN0eWxlPVwid2lkdGg6IDNweDsgYmFja2dyb3VuZDogI0ZGOUUxQjsgYm9yZGVyLXJhZGl1czogMXB4OyBib3gtc2hhZG93OiAwIDAgNHB4ICNGRjlFMUI7XCI+PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGxpbmUtaGVpZ2h0OiAxLjI7XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInJqLWh3LW1vbm9cIiBzdHlsZT1cImZvbnQtc2l6ZTogNy41cHg7IGNvbG9yOiAjMDBEMkM0OyBsZXR0ZXItc3BhY2luZzogMC4xMmVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1wiPlNZTlRIRVNJWklORyBDT01NRU5UQVJZPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDkuNXB4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogI2YxZjVmOTsgbGV0dGVyLXNwYWNpbmc6IDAuMDRlbTtcIj5CVUZGRVJJTkcgTkVYVCBUUkFDSy4uLjwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRpbmcpO1xufTtcblxuY29uc3QgaGlkZUxvYWRpbmdJbmRpY2F0b3IgPSAoKSA9PiB7XG4gIGNvbnN0IGxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWxvYWRpbmdcIik7XG4gIGlmIChsb2FkaW5nKSBsb2FkaW5nLnJlbW92ZSgpO1xufTtcblxuY29uc3Qgc2hvd0Vycm9yTWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgaW5qZWN0SGFyZHdhcmVTdHlsZXMoKTtcblxuICAvLyBSZW1vdmUgZXhpc3RpbmcgZXJyb3JzIGlmIHByZXNlbnRcbiAgY29uc3QgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLWVycm9yLW1lc3NhZ2VcIik7XG4gIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKCk7XG5cbiAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBlcnJvci5pZCA9IFwicmotZXJyb3ItbWVzc2FnZVwiO1xuICBlcnJvci5jbGFzc05hbWUgPSBcInJqLWh3LXJvb3QgcmotaHctYmV2ZWxcIjtcbiAgZXJyb3Iuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiAxMzZweDtcbiAgICByaWdodDogMjRweDtcbiAgICB6LWluZGV4OiAxMDAwMDA7XG4gICAgYmFja2dyb3VuZDogIzE0MDgwYTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjZWY0NDQ0O1xuICAgIGJveC1zaGFkb3c6IDAgMCAxNnB4IHJnYmEoMjM5LCA2OCwgNjgsIDAuMyksIGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjEpO1xuICAgIGNvbG9yOiAjZmVjYWNhO1xuICAgIHBhZGRpbmc6IDEwcHggMTZweDtcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgbWF4LXdpZHRoOiAzNjBweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIGdhcDogMTBweDtcbiAgICBhbmltYXRpb246IHJqU2xpZGVJblJpZ2h0IDAuMjVzIGVhc2Utb3V0O1xuICBgO1xuXG4gIGVycm9yLmlubmVySFRNTCA9IGBcbiAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTRweDsgbGluZS1oZWlnaHQ6IDE7IG1hcmdpbi10b3A6IDJweDtcIj7imqDvuI88L3NwYW4+XG4gICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGxpbmUtaGVpZ2h0OiAxLjI1OyBmbGV4OiAxO1wiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJyai1ody1tb25vXCIgc3R5bGU9XCJmb250LXNpemU6IDhweDsgY29sb3I6ICNmODcxNzE7IGxldHRlci1zcGFjaW5nOiAwLjEyZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGZvbnQtd2VpZ2h0OiA3MDA7XCI+QlJPQURDQVNUIEVOR0lORSBGQVVMVDwvc3Bhbj5cbiAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMC41cHg7IGNvbG9yOiAjZjhmYWZjOyBtYXJnaW4tdG9wOiAzcHg7IHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XCI+JHttZXNzYWdlfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVycm9yKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBlcnJvci5zdHlsZS5hbmltYXRpb24gPSBcInJqU2xpZGVPdXRSaWdodCAwLjI1cyBlYXNlLWluIGZvcndhcmRzXCI7XG4gICAgc2V0VGltZW91dCgoKSA9PiBlcnJvci5yZW1vdmUoKSwgMjUwKTtcbiAgfSwgNTAwMCk7XG59O1xuXG5jb25zdCBkaXNtaXNzTm90aWZpY2F0aW9uID0gKCkgPT4ge1xuICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtbm90aWZpY2F0aW9uXCIpO1xuICBpZiAobm90aWZpY2F0aW9uKSB7XG4gICAgbm90aWZpY2F0aW9uLnN0eWxlLmFuaW1hdGlvbiA9IFwicmpTbGlkZU91dFJpZ2h0IDAuMjVzIGVhc2UtaW4gZm9yd2FyZHNcIjtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcbiAgICB9LCAyNTApO1xuICB9XG59O1xuXG5jb25zdCBzaG93UkpNb2RlUHJvbXB0ID0gKHRvZ2dsZVJKTW9kZTogRnVuY3Rpb24pID0+IHtcbiAgaW5qZWN0SGFyZHdhcmVTdHlsZXMoKTtcblxuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyai1tb2RlLW5vdGlmaWNhdGlvblwiKSkgcmV0dXJuO1xuXG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG5vdGlmaWNhdGlvbi5pZCA9IFwicmotbW9kZS1ub3RpZmljYXRpb25cIjtcbiAgbm90aWZpY2F0aW9uLmNsYXNzTmFtZSA9IFwicmotaHctcm9vdCByai1ody1iZXZlbFwiO1xuICBub3RpZmljYXRpb24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgdG9wOiA3NnB4O1xuICAgIHJpZ2h0OiAyNHB4O1xuICAgIHotaW5kZXg6IDEwMDAwMDtcbiAgICB3aWR0aDogMzUwcHg7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzE4MUExRSAwJSwgIzExMTIxNSAxMDAlKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjcyQjMzO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGNvbG9yOiAjZjFmNWY5O1xuICAgIGFuaW1hdGlvbjogcmpTbGlkZUluUmlnaHQgMC4zcyBjdWJpYy1iZXppZXIoMC4xNiwgMSwgMC4zLCAxKTtcbiAgYDtcblxuICBub3RpZmljYXRpb24uaW5uZXJIVE1MID0gYFxuICAgIDwhLS0gVG9wIEhhcmR3YXJlIEFjY2VudCBCYXIgLS0+XG4gICAgPGRpdiBzdHlsZT1cImJhY2tncm91bmQ6ICMwODA5MEE7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMjcyQjMzOyBwYWRkaW5nOiA0cHggMTBweDsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyO1wiPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4O1wiPlxuICAgICAgICA8c3BhbiBzdHlsZT1cIndpZHRoOiA1cHg7IGhlaWdodDogNXB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICNGRjlFMUI7IGJveC1zaGFkb3c6IDAgMCA0cHggI0ZGOUUxQjtcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicmotaHctbW9ub1wiIHN0eWxlPVwiZm9udC1zaXplOiA3LjVweDsgY29sb3I6ICNGRjlFMUI7IGZvbnQtd2VpZ2h0OiA3MDA7IGxldHRlci1zcGFjaW5nOiAwLjEyZW07XCI+UExBWUxJU1QgREVURUNURUQgLy8gRlJFUSBMT0NLPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGlkPVwiZGlzbWlzcy1yai1wcm9tcHRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjNjQ3NDhiOyBmb250LXNpemU6IDEzcHg7IGN1cnNvcjogcG9pbnRlcjsgcGFkZGluZzogMCAycHg7IGxpbmUtaGVpZ2h0OiAxO1wiPuKclTwvYnV0dG9uPlxuICAgIDwvZGl2PlxuXG4gICAgPCEtLSBNYWluIENvbnRlbnQgQXJlYSAtLT5cbiAgICA8ZGl2IHN0eWxlPVwicGFkZGluZzogMTJweCAxNHB4OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGdhcDogMTJweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEwcHg7XCI+XG4gICAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJhY2tncm91bmQ6ICMwODA5MEE7IGJvcmRlcjogMXB4IHNvbGlkICMyNzJCMzM7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbGV4LXNocmluazogMDtcIj5cbiAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTZweDtcIj7wn46Z77iPPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxMXB4OyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogI2Y4ZmFmYzsgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTtcIj5ZT1VUVUJFIFJKIFJFQURZPC9kaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogOXB4OyBjb2xvcjogIzk0YTNiODsgbWFyZ2luLXRvcDogMXB4O1wiPkF1dG8tdHJhbnNpdGlvbiBjb21tZW50YXJ5IGVuZ2luZTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8YnV0dG9uIGlkPVwiZW5hYmxlLXJqLW1vZGVcIiBzdHlsZT1cIlxuICAgICAgICBiYWNrZ3JvdW5kOiAjMDBEMkM0O1xuICAgICAgICBjb2xvcjogIzA2MDcwOTtcbiAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICBwYWRkaW5nOiA2cHggMTJweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBmb250LWZhbWlseTogJ0pldEJyYWlucyBNb25vJywgbW9ub3NwYWNlO1xuICAgICAgICBmb250LXNpemU6IDkuNXB4O1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMCAxMHB4IHJnYmEoMCwyMTAsMTk2LDAuMzUpO1xuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcbiAgICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIFwiPkVOQUJMRSBSSjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcblxuICAvLyBCdXR0b24gaW50ZXJhY3Rpb24gc3R5bGluZ1xuICBjb25zdCBlbmFibGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuYWJsZS1yai1tb2RlXCIpO1xuICBlbmFibGVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBlbmFibGVCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzEyZTZkOFwiO1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCAxNHB4IHJnYmEoMCwyMTAsMTk2LDAuNTUpXCI7XG4gIH0pO1xuICBlbmFibGVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBlbmFibGVCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzAwRDJDNFwiO1xuICAgIGVuYWJsZUJ0bi5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCAxMHB4IHJnYmEoMCwyMTAsMTk2LDAuMzUpXCI7XG4gIH0pO1xuXG4gIGVuYWJsZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XG4gICAgdG9nZ2xlUkpNb2RlKCk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlzbWlzcy1yai1wcm9tcHRcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgZGlzbWlzc05vdGlmaWNhdGlvbigpO1xuICB9KTtcblxuICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgMTIgc2Vjb25kc1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uKCk7XG4gIH0sIDEyMDAwKTtcbn07XG5cbmNvbnN0IERvbVV0aWxzID0ge1xuICBzaG93RXJyb3JNZXNzYWdlLFxuICBzaG93UkpNb2RlUHJvbXB0LFxuICBjcmVhdGVSSk1vZGVCdXR0b24sXG4gIHVwZGF0ZVJKTW9kZUJ1dHRvbixcbiAgZGlzbWlzc05vdGlmaWNhdGlvbixcbiAgc2hvd0xvYWRpbmdJbmRpY2F0b3IsXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yLFxufTtcblxuKHdpbmRvdyBhcyBhbnkpLkRvbVV0aWxzID0gRG9tVXRpbHM7XG5leHBvcnQgZGVmYXVsdCBEb21VdGlscztcbiIsCiAgICAiLy8gWW91VHViZS1zcGVjaWZpYyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5jb25zdCBpc1lvdVR1YmVNdXNpYyA9ICgpID0+XHJcbiAgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwibXVzaWMueW91dHViZS5jb21cIik7XHJcblxyXG5jb25zdCBZb3VUdWJlVXRpbHMgPSB7XHJcbiAgZXh0cmFjdFZpZGVvSWQoKSB7XHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoXCJ2XCIpO1xyXG4gICAgcmV0dXJuIHZpZGVvSWQgfHwgbnVsbDtcclxuICB9LFxyXG5cclxuICBpc1lvdVR1YmVNdXNpYyxcclxuXHJcbiAgZ2V0Q3VycmVudFZpZGVvVGl0bGUoKSB7XHJcbiAgICBpZiAoaXNZb3VUdWJlTXVzaWMoKSkge1xyXG4gICAgICAvLyBNb3N0IHJlbGlhYmxlOiB0aGUgdGl0bGUgc2hvd24gaW4gdGhlIHBsYXllciBiYXJcclxuICAgICAgY29uc3QgcGxheWVyQmFyVGl0bGVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGUuc3R5bGUtc2NvcGUueXRtdXNpYy1wbGF5ZXItYmFyXCIpXHJcbiAgICAgIGNvbnN0IHN1YnRpdGxlID0gcGxheWVyQmFyVGl0bGVFbD8ubmV4dEVsZW1lbnRTaWJsaW5nPy50ZXh0Q29udGVudD8udHJpbSgpXHJcbiAgICAgICAgLnNwbGl0KC9cXG4vKVxyXG4gICAgICAgIC5tYXAoKHMpID0+IHMudHJpbSgpKVxyXG4gICAgICAgIC5qb2luKCcgJylcclxuICAgICAgY29uc3QgcGxheWVyQmFyVGl0bGUgPSBwbGF5ZXJCYXJUaXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAocGxheWVyQmFyVGl0bGUpIHJldHVybiBgJHtwbGF5ZXJCYXJUaXRsZX0gLSAke3N1YnRpdGxlfWA7XHJcblxyXG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmZyb20oXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInl0bXVzaWMtcmVzcG9uc2l2ZS1saXN0LWl0ZW0tcmVuZGVyZXJcIilcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFByZWZlciB0aGUgaXRlbSBjdXJyZW50bHkgcGxheWluZy9wYXVzZWQgaW4gdGhlIHBsYXlsaXN0XHJcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBpdGVtcy5maW5kKChpdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gaXQuZ2V0QXR0cmlidXRlKFwicGxheS1idXR0b24tc3RhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlID09PSBcInBsYXlpbmdcIiB8fCBzdGF0ZSA9PT0gXCJwYXVzZWRcIjtcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRUaXRsZSA9IGN1cnJlbnRcclxuICAgICAgICA/LnF1ZXJ5U2VsZWN0b3IoXCJ5dC1mb3JtYXR0ZWQtc3RyaW5nLnRpdGxlXCIpXHJcbiAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAoY3VycmVudFRpdGxlKSByZXR1cm4gY3VycmVudFRpdGxlO1xyXG5cclxuICAgICAgLy8gRmFsbGJhY2s6IHBsYXlsaXN0IGl0ZW0gbWF0Y2hpbmcgdGhlIGN1cnJlbnQgdmlkZW8gaWRcclxuICAgICAgY29uc3QgdmlkID0gdGhpcy5leHRyYWN0VmlkZW9JZCgpO1xyXG4gICAgICBpZiAodmlkKSB7XHJcbiAgICAgICAgY29uc3QgYnlWaWQgPSBpdGVtcy5maW5kKChpdCkgPT5cclxuICAgICAgICAgIChpdC5pbm5lckhUTUwgfHwgXCJcIikuaW5jbHVkZXModmlkKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgdGl0bGUgPSBieVZpZFxyXG4gICAgICAgICAgPy5xdWVyeVNlbGVjdG9yKFwieXQtZm9ybWF0dGVkLXN0cmluZy50aXRsZVwiKVxyXG4gICAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICAgIGlmICh0aXRsZSkgcmV0dXJuIHRpdGxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGYWxsYmFjazogdGl0bGUgc2hvd24gaW4gdGhlIHBsYXllciBxdWV1ZSAoY3VycmVudCB0cmFjaylcclxuICAgICAgY29uc3QgcXVldWVUaXRsZSA9IGRvY3VtZW50XHJcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCJ5dG11c2ljLXBsYXllci1xdWV1ZS1pdGVtIC5zb25nLXRpdGxlXCIpXHJcbiAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xyXG4gICAgICBpZiAocXVldWVUaXRsZSkgcmV0dXJuIHF1ZXVlVGl0bGU7XHJcblxyXG4gICAgICAvLyBMYXN0IHJlc29ydDogcGxheWVyIHRpdGxlIGxpbmtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnl0cC10aXRsZS1saW5rXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aXRsZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBcImgxLnRpdGxlLnN0eWxlLXNjb3BlLnl0ZC12aWRlby1wcmltYXJ5LWluZm8tcmVuZGVyZXJcIlxyXG4gICAgKTtcclxuICAgIHJldHVybiB0aXRsZUVsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBnZXREZXNjcmlwdGlvbigpIHtcclxuICAgIGlmIChpc1lvdVR1YmVNdXNpYygpKSByZXR1cm4gXCJcIjtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIGRvY3VtZW50Py5xdWVyeVNlbGVjdG9yKFwiI2Rlc2NyaXB0aW9uLWlubmVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCJcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0Q29tbWVudHMoKSB7XHJcbiAgICBpZiAoaXNZb3VUdWJlTXVzaWMoKSkgcmV0dXJuIFtdO1xyXG5cclxuICAgIGxldCBhbGxDb21tZW50czogc3RyaW5nW10gPSBbXTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjY29tbWVudC1jb250YWluZXJcIikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICBsZXQgdHh0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiI2V4cGFuZGVyXCIpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCI7XHJcbiAgICAgIGFsbENvbW1lbnRzLnB1c2godHh0KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGFsbENvbW1lbnRzO1xyXG4gIH0sXHJcblxyXG4gIGdldE5leHRWaWRlb1RpdGxlKCkge1xyXG4gICAgaWYgKGlzWW91VHViZU11c2ljKCkpIHtcclxuICAgICAgLy8gUHJlZmVyIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIGN1cnJlbnRseSBwbGF5aW5nIHBsYXlsaXN0IGl0ZW1cclxuICAgICAgY29uc3QgcGxheWluZ0l0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcGxheS1idXR0b24tc3RhdGU9XCJwbGF5aW5nXCJdJylbMV1cclxuICAgICAgY29uc3QgdGV4dCA9IChwbGF5aW5nSXRlbT8ubmV4dFNpYmxpbmc/LnRleHRDb250ZW50IHx8IFwiXCIpXHJcbiAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgIC5zcGxpdCgvXFxuLylcclxuICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcclxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAgICAgLmpvaW4oJyB8ICcpXHJcbiAgICAgIHJldHVybiB0ZXh0XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGxheWxpc3RJdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5bGlzdC1pdGVtc1tzZWxlY3RlZF1cIik7XHJcbiAgICBjb25zdCBuZXh0VmlkZW9FbGVtZW50ID0gKFxyXG4gICAgICBwbGF5bGlzdEl0ZW0/Lm5leHRTaWJsaW5nIGFzIEVsZW1lbnRcclxuICAgICk/LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8tdGl0bGVcIik7XHJcblxyXG4gICAgcmV0dXJuIG5leHRWaWRlb0VsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIjtcclxuICB9LFxyXG5cclxuICBpc1BsYXlsaXN0UGFnZSgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmhhcyhcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGxheWxpc3RJZCgpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICByZXR1cm4gdXJsUGFyYW1zLmdldChcImxpc3RcIik7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VmlkZW9FbGVtZW50KCkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ2aWRlb1wiKTtcclxuICB9LFxyXG5cclxuICAvLyBDbGVhbiB1cCBZb3VUdWJlIHZpZGVvIHRpdGxlcyAocmVtb3ZlIGNvbW1vbiBzdWZmaXhlcylcclxuICBjbGVhblZpZGVvVGl0bGUodGl0bGU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRpdGxlXHJcbiAgICAgIC5yZXBsYWNlKC9cXChPZmZpY2lhbC4qP1xcKS9naSwgXCJcIilcclxuICAgICAgLnJlcGxhY2UoL1xcKE11c2ljIFZpZGVvXFwpL2dpLCBcIlwiKVxyXG4gICAgICAucmVwbGFjZSgvXFxbT2ZmaWNpYWwuKj9cXF0vZ2ksIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC8tIFRvcGljJC8sIFwiXCIpXHJcbiAgICAgIC50cmltKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gR2V0IHZpZGVvIGR1cmF0aW9uXHJcbiAgZ2V0VmlkZW9EdXJhdGlvbigpIHtcclxuICAgIGNvbnN0IHZpZGVvID0gdGhpcy5nZXRWaWRlb0VsZW1lbnQoKTtcclxuICAgIHJldHVybiB2aWRlbyA/IHZpZGVvLmR1cmF0aW9uIDogMDtcclxuICB9LFxyXG5cclxuICAvLyBDaGVjayBpZiB2aWRlbyBpcyBwbGF5aW5nXHJcbiAgaXNWaWRlb1BsYXlpbmcoKSB7XHJcbiAgICBjb25zdCB2aWRlbyA9IHRoaXMuZ2V0VmlkZW9FbGVtZW50KCk7XHJcbiAgICByZXR1cm4gdmlkZW8gPyAhdmlkZW8ucGF1c2VkICYmICF2aWRlby5lbmRlZCA6IGZhbHNlO1xyXG4gIH0sXHJcbn07XHJcblxyXG4vLyBNYWtlIGl0IGdsb2JhbGx5IGF2YWlsYWJsZVxyXG4od2luZG93IGFzIGFueSkuWW91VHViZVV0aWxzID0gWW91VHViZVV0aWxzO1xyXG5leHBvcnQgZGVmYXVsdCBZb3VUdWJlVXRpbHM7IiwKICAgICJcbmV4cG9ydCBjbGFzcyBHb29nbGVUVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUodGV4dDogc3RyaW5nLCBsYW5nOiBzdHJpbmcgPSBcImVuXCIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiZ2V0VFRTQXVkaW9cIixcbiAgICAgICAgICBwYXlsb2FkOiB7IHRleHQsIGxhbmcgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRUUyBSdW50aW1lIEVycm9yOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVFRTIEFQSSBFcnJvcjpcIiwgcmVzcG9uc2U/LmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkZhaWxlZCB0byBnZXQgVFRTIGF1ZGlvXCIpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0Q2h1bmtzOiBzdHJpbmdbXSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBjb25zdCBhdWRpb0NodW5rcyA9IGJhc2U2NENodW5rcy5tYXAoKGJhc2U2NCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9CbG9iID0gbmV3IEJsb2IoYXVkaW9DaHVua3MsIHsgdHlwZTogXCJhdWRpby9tcGVnXCIgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIFRUUyBhdWRpbyBkYXRhOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRvQmxvYigpOiBCbG9iIHtcbiAgICBpZiAoIXRoaXMuYXVkaW9CbG9iKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdWRpbyBkYXRhIGF2YWlsYWJsZS4gRGlkIHlvdSBydW4gc3ludGhlc2l6ZSgpIGZpcnN0P1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXVkaW9CbG9iO1xuICB9XG59XG4iLAogICAgImV4cG9ydCBjbGFzcyBGaXNoQXVkaW9UVFMge1xuICBwcml2YXRlIGF1ZGlvQmxvYjogQmxvYiB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIHN5bnRoZXNpemUoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGFwaUtleTogc3RyaW5nLFxuICAgIHJlZmVyZW5jZUlkOiBzdHJpbmcgPSBcImJhMWEzODk0NmRlYTQ0NjA5ZmM0YThmZTYxMTNlZDg4XCJcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFhcGlLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpc2ggQXVkaW8gQVBJIGtleSBub3QgY29uZmlndXJlZFwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwiY2FsbEZpc2hBdWRpb1wiLFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgcmVmZXJlbmNlSWQsXG4gICAgICAgICAgYXBpS2V5LFxuICAgICAgICB9LFxuICAgICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmlzaCBBdWRpbyBSdW50aW1lIEVycm9yOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmlzaCBBdWRpbyBBUEkgRXJyb3I6XCIsIHJlc3BvbnNlPy5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KFxuICAgICAgICAgICAgICBuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiRmFpbGVkIHRvIGdldCBGaXNoIEF1ZGlvIFRUU1wiKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gcmVzcG9uc2UuYXVkaW9CYXNlNjQ7XG4gICAgICAgICAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeVN0cmluZy5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnlTdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hdWRpb0Jsb2IgPSBuZXcgQmxvYihbYnl0ZXNdLCB7IHR5cGU6IFwiYXVkaW8vbXAzXCIgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIEZpc2ggQXVkaW8gZGF0YTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICB0b0Jsb2IoKTogQmxvYiB7XG4gICAgaWYgKCF0aGlzLmF1ZGlvQmxvYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYXVkaW8gZGF0YSBhdmFpbGFibGUuIERpZCB5b3UgcnVuIHN5bnRoZXNpemUoKSBmaXJzdD9cIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmF1ZGlvQmxvYjtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQgQVBJVXRpbHMgZnJvbSBcIi4vdXRpbHMvYXBpLXV0aWxzXCI7XHJcbmltcG9ydCBBdWRpb1V0aWxzIGZyb20gXCIuL3V0aWxzL2F1ZGlvLXV0aWxzXCI7XHJcbmltcG9ydCBEb21VdGlscyBmcm9tIFwiLi91dGlscy9kb20tdXRpbHNcIjtcclxuaW1wb3J0IFlvdVR1YmVVdGlscyBmcm9tIFwiLi91dGlscy95b3V0dWJlLXV0aWxzXCI7XHJcbmltcG9ydCB7IEdvb2dsZVRUUyB9IGZyb20gXCIuL3V0aWxzL2dvb2dsZS10dHNcIjtcclxuaW1wb3J0IHsgRmlzaEF1ZGlvVFRTIH0gZnJvbSBcIi4vdXRpbHMvZmlzaC1hdWRpb1wiO1xyXG5cclxuY2xhc3MgWW91VHViZVJKTW9kZSB7XHJcbiAgaXNSSk1vZGVBY3RpdmU6IGJvb2xlYW47XHJcbiAgY3VycmVudFZpZGVvVGl0bGU6IHN0cmluZztcclxuICBuZXh0VmlkZW9UaXRsZTogc3RyaW5nO1xyXG4gIG9yaWdpbmFsVm9sdW1lOiBudW1iZXI7XHJcbiAgaXNSSlBsYXlpbmc6IGJvb2xlYW47XHJcbiAgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQgfCBudWxsO1xyXG4gIGdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgbGFzdFByb2Nlc3NlZFZpZGVvOiBzdHJpbmc7XHJcbiAgaXNHZW5lcmF0aW5nQ29tbWVudGFyeTogYm9vbGVhbjtcclxuICB2aWRlb0NoYW5nZVRpbWVvdXQ6IGFueTtcclxuICBwcm9ncmVzc0ludGVydmFsOiBhbnk7XHJcbiAgc2NyaXB0SGlzdG9yeTogYW55W107XHJcbiAgZ29vZ2xlVFRTOiBHb29nbGVUVFM7XHJcbiAgZmlzaEF1ZGlvVFRTOiBGaXNoQXVkaW9UVFM7XHJcbiAgdHRzVm9pY2U6IHN0cmluZztcclxuICBnZW5lcmF0ZWRBdWRpb0RhdGE6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlID0gXCJcIjtcclxuICAgIHRoaXMubmV4dFZpZGVvVGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy5vcmlnaW5hbFZvbHVtZSA9IDEuMDtcclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuZ2Fpbk5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0UHJvY2Vzc2VkVmlkZW8gPSBcIlwiO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgdGhpcy5zY3JpcHRIaXN0b3J5ID0gW107XHJcbiAgICB0aGlzLmdvb2dsZVRUUyA9IG5ldyBHb29nbGVUVFMoKTsgLy8gSW5pdGlhbGl6ZSBHb29nbGUgVFRTIGluc3RhbmNlXHJcbiAgICB0aGlzLmZpc2hBdWRpb1RUUyA9IG5ldyBGaXNoQXVkaW9UVFMoKTsgLy8gSW5pdGlhbGl6ZSBGaXNoIEF1ZGlvIFRUUyBpbnN0YW5jZVxyXG4gICAgdGhpcy50dHNWb2ljZSA9IFwiZW5cIjsgLy8gRGVmYXVsdCBUVFMgdm9pY2UgKGxhbmd1YWdlIGNvZGUgZm9yIEdvb2dsZSBUVFMpXHJcbiAgICB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YSA9IG51bGw7IC8vIFN0b3JlIGdlbmVyYXRlZCBhdWRpbyBkYXRhXHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0KCkge1xyXG4gICAgYXdhaXQgdGhpcy5wcm9tcHRVc2VyRm9yQVBJS2V5cygpO1xyXG4gICAgdGhpcy5zZXR1cEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5kZXRlY3RQbGF5bGlzdCgpO1xyXG4gICAgLy8gdGhpcy5zZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIERvbVV0aWxzLmNyZWF0ZVJKTW9kZUJ1dHRvbih0aGlzLnRvZ2dsZVJKTW9kZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHByb21wdFVzZXJGb3JBUElLZXlzKCkge1xyXG4gICAgbGV0IHNldHRpbmdzID0gYXdhaXQgQVBJVXRpbHMuZ2V0QVBJU2V0dGluZ3MoKTtcclxuICAgIGlmICghc2V0dGluZ3MuZ2VtaW5pQXBpS2V5KSB7XHJcbiAgICAgIGxldCBnZW1pbmlBcGlLZXkgPSBwcm9tcHQoXCJFbnRlciB5b3VyIEdlbWluaSBBUEkgS2V5OlwiKTtcclxuICAgICAgaWYgKGdlbWluaUFwaUtleSkge1xyXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgZ2VtaW5pQXBpS2V5IH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KFwiR2V0IGZyZWUgQVBJIGtleSBmcm9tIGh0dHBzOi8vYWlzdHVkaW8uZ29vZ2xlLmNvbS9hcGlrZXlcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IHByb3ZpZGVyID1cclxuICAgICAgc2V0dGluZ3MudHRzUHJvdmlkZXIgfHxcclxuICAgICAgKHNldHRpbmdzLmZpc2hBcGlLZXlcclxuICAgICAgICA/IFwiZmlzaC1hdWRpb1wiXHJcbiAgICAgICAgOiBzZXR0aW5ncy5tdXJmQXBpS2V5XHJcbiAgICAgICAgICA/IFwibXVyZlwiXHJcbiAgICAgICAgICA6IFwiZmlzaC1hdWRpb1wiKTtcclxuICAgIGlmIChwcm92aWRlciA9PT0gXCJmaXNoLWF1ZGlvXCIgJiYgIXNldHRpbmdzLmZpc2hBcGlLZXkpIHtcclxuICAgICAgbGV0IGZpc2hBcGlLZXkgPSBwcm9tcHQoXCJFbnRlciB5b3VyIEZpc2ggQXVkaW8gQVBJIEtleTpcIik7XHJcbiAgICAgIGlmIChmaXNoQXBpS2V5KSB7XHJcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBmaXNoQXBpS2V5IH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXR1cEF1ZGlvQ29udGV4dCgpIHtcclxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gQXVkaW9VdGlscy5jcmVhdGVBdWRpb0NvbnRleHQoKTtcclxuICAgIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgICB0aGlzLmdhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZGV0ZWN0UGxheWxpc3QoKSB7XHJcbiAgICAvLyBVc2UgWW91VHViZSB1dGlsaXR5IGZ1bmN0aW9uXHJcbiAgICBpZiAoXHJcbiAgICAgIFlvdVR1YmVVdGlscy5pc1BsYXlsaXN0UGFnZSgpICYmXHJcbiAgICAgICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJqLW1vZGUtYnV0dG9uXCIpXHJcbiAgICApIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd1JKTW9kZVByb21wdCh0aGlzLnRvZ2dsZVJKTW9kZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEN1cnJlbnRBbmROZXh0VGl0bGVzKCkge1xyXG4gICAgLy8gVXNlIFlvdVR1YmUgdXRpbGl0eSBmdW5jdGlvbnNcclxuICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUgPSBZb3VUdWJlVXRpbHMuY2xlYW5WaWRlb1RpdGxlKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuZ2V0Q3VycmVudFZpZGVvVGl0bGUoKVxyXG4gICAgKTtcclxuICAgIHRoaXMubmV4dFZpZGVvVGl0bGUgPSBZb3VUdWJlVXRpbHMuY2xlYW5WaWRlb1RpdGxlKFxyXG4gICAgICBZb3VUdWJlVXRpbHMuZ2V0TmV4dFZpZGVvVGl0bGUoKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdlbmVyYXRlUkpDb21tZW50YXJ5KCkge1xyXG4gICAgLy8gUHJldmVudCBtdWx0aXBsZSBzaW11bHRhbmVvdXMgY29tbWVudGFyeSBnZW5lcmF0aW9uc1xyXG4gICAgaWYgKHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSB8fCB0aGlzLmlzUkpQbGF5aW5nKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiQ29tbWVudGFyeSBhbHJlYWR5IGluIHByb2dyZXNzLCBza2lwcGluZy4uLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHdlJ3ZlIGFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgdmlkZW9cclxuICAgIGNvbnN0IHZpZGVvSWQgPSBZb3VUdWJlVXRpbHMuZXh0cmFjdFZpZGVvSWQoKSB8fCB0aGlzLmN1cnJlbnRWaWRlb1RpdGxlO1xyXG4gICAgaWYgKHZpZGVvSWQgPT09IHRoaXMubGFzdFByb2Nlc3NlZFZpZGVvKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiQWxyZWFkeSBwcm9jZXNzZWQgdGhpcyB2aWRlbywgc2tpcHBpbmcuLi5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuY3VycmVudFZpZGVvVGl0bGUgfHwgdGhpcy5jdXJyZW50VmlkZW9UaXRsZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJObyBjdXJyZW50IHZpZGVvIHRpdGxlIGZvdW5kLCBza2lwcGluZy4uLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeSA9IHRydWU7XHJcbiAgICB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbyA9IHZpZGVvSWQ7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0xvYWRpbmdJbmRpY2F0b3IoKTtcclxuXHJcbiAgICAgIGxldCBjdXJyZW50U29uZ2x5cmljczogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY3VycmVudFNvbmdseXJpY3MgPSAoYXdhaXQgQVBJVXRpbHMuY2FsbEx5cmljc0FQSShcclxuICAgICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGVcclxuICAgICAgICApKSBhcyBzdHJpbmcgfCBudWxsO1xyXG4gICAgICB9IGNhdGNoIChseXJpY3NFcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgIFwiTHlyaWNzIEFQSSBmYWlsZWQgb3Igbm8gbHlyaWNzIGZvdW5kLCBwcm9jZWVkaW5nIHdpdGggY29tbWVudGFyeSAmIFRUUyBnZW5lcmF0aW9uOlwiLFxyXG4gICAgICAgICAgbHlyaWNzRXJyb3JcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2UgQVBJIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAgICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgQVBJVXRpbHMuZ2V0QVBJU2V0dGluZ3MoKTtcclxuICAgICAgY29uc3QgeyBzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrIH0gPSBBUElVdGlscy5nZW5lcmF0ZVJKUHJvbXB0KFxyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZGVvVGl0bGUsXHJcbiAgICAgICAgdGhpcy5uZXh0VmlkZW9UaXRsZSxcclxuICAgICAgICBzZXR0aW5ncy5yalN0eWxlLFxyXG4gICAgICAgIHNldHRpbmdzLmNvbW1lbnRhcnlMZW5ndGgsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUhpc3RvcnkgPyB0aGlzLnNjcmlwdEhpc3Rvcnkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgc2V0dGluZ3MuaW5jbHVkZUNvbW1lbnRzID8gWW91VHViZVV0aWxzLmdldENvbW1lbnRzKCkuam9pbihcIlxcblwiKSA6IFwiXCIsXHJcbiAgICAgICAgY3VycmVudFNvbmdseXJpY3MgYXMgc3RyaW5nLFxyXG4gICAgICAgIHNldHRpbmdzLmhvc3ROYW1lLFxyXG4gICAgICAgIHNldHRpbmdzLnJhZGlvU3RhdGlvblxyXG4gICAgICApO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coXCJHZW5lcmF0ZWQgc3lzdGVtUHJvbXB0OlwiLCBzeXN0ZW1Qcm9tcHQpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBjdXJyZW50VGFzazpcIiwgY3VycmVudFRhc2spO1xyXG5cclxuICAgICAgY29uc3Qgc2NyaXB0ID0gYXdhaXQgQVBJVXRpbHMuY2FsbExMTShzeXN0ZW1Qcm9tcHQsIGN1cnJlbnRUYXNrLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBzY3JpcHQ6XCIsIHNjcmlwdCk7XHJcblxyXG4gICAgICB0aGlzLnNjcmlwdEhpc3RvcnkucHVzaChzY3JpcHQpO1xyXG5cclxuICAgICAgbGV0IGF1ZGlvRGF0YSA9IHt9O1xyXG4gICAgICBjb25zdCBwcm92aWRlciA9XHJcbiAgICAgICAgc2V0dGluZ3MudHRzUHJvdmlkZXIgfHxcclxuICAgICAgICAoc2V0dGluZ3MuZmlzaEFwaUtleVxyXG4gICAgICAgICAgPyBcImZpc2gtYXVkaW9cIlxyXG4gICAgICAgICAgOiBzZXR0aW5ncy5tdXJmQXBpS2V5XHJcbiAgICAgICAgICAgID8gXCJtdXJmXCJcclxuICAgICAgICAgICAgOiBcImZpc2gtYXVkaW9cIik7XHJcblxyXG4gICAgICBpZiAocHJvdmlkZXIgPT09IFwiZmlzaC1hdWRpb1wiKSB7XHJcbiAgICAgICAgaWYgKCFzZXR0aW5ncy5maXNoQXBpS2V5KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIFwiRmlzaCBBdWRpbyBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBQbGVhc2UgYWRkIGl0IGluIGV4dGVuc2lvbiBzZXR0aW5ncy5cIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVmSWQgPSBzZXR0aW5ncy52b2ljZUlkIHx8IFwiYmExYTM4OTQ2ZGVhNDQ2MDlmYzRhOGZlNjExM2VkODhcIjtcclxuICAgICAgICBhd2FpdCB0aGlzLmZpc2hBdWRpb1RUUy5zeW50aGVzaXplKHNjcmlwdCwgc2V0dGluZ3MuZmlzaEFwaUtleSwgcmVmSWQpO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5maXNoQXVkaW9UVFMudG9CbG9iKCksXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIGlmIChwcm92aWRlciA9PT0gXCJtdXJmXCIpIHtcclxuICAgICAgICBpZiAoIXNldHRpbmdzLm11cmZBcGlLZXkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgXCJNdXJmLmFpIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQuIFBsZWFzZSBhZGQgaXQgaW4gZXh0ZW5zaW9uIHNldHRpbmdzLlwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhdWRpb0RhdGEgPSBhd2FpdCBBUElVdGlscy5jYWxsTXVyZkFQSShcclxuICAgICAgICAgIHNjcmlwdCxcclxuICAgICAgICAgIHNldHRpbmdzLm11cmZBcGlLZXksXHJcbiAgICAgICAgICBzZXR0aW5ncy52b2ljZUlkLFxyXG4gICAgICAgICAgc2V0dGluZ3Mudm9pY2VTdHlsZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRmFsbGJhY2sgdG8gR29vZ2xlIFRUU1xyXG4gICAgICAgIGxldCBsYW5nID0gc2V0dGluZ3Mudm9pY2VJZCB8fCB0aGlzLnR0c1ZvaWNlO1xyXG4gICAgICAgIC8vIElmIGl0IGxvb2tzIGxpa2UgYW4gRWRnZSBUVFMgdm9pY2UgSUQgKGUuZy4sIGVuLVVTLUFyaWFOZXVyYWwpLCBleHRyYWN0IHRoZSBsYW5nIHBhcnRcclxuICAgICAgICBpZiAobGFuZy5pbmNsdWRlcyhcIi1cIikgJiYgbGFuZy5zcGxpdChcIi1cIikubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgbGFuZyA9IGxhbmcuc3BsaXQoXCItXCIpLnNsaWNlKDAsIDIpLmpvaW4oXCItXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5nb29nbGVUVFMuc3ludGhlc2l6ZShzY3JpcHQsIGxhbmcpO1xyXG4gICAgICAgIGF1ZGlvRGF0YSA9IHtcclxuICAgICAgICAgIGF1ZGlvQmxvYjogdGhpcy5nb29nbGVUVFMudG9CbG9iKCksXHJcbiAgICAgICAgICAvLyBhdWRpb1VybDogVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLmdvb2dsZVRUUy50b0Jsb2IoKSksXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9nIHRoZSBjb21tZW50YXJ5XHJcbiAgICAgIEFQSVV0aWxzLmxvZ0NvbW1lbnRhcnkoXHJcbiAgICAgICAgdGhpcy5jdXJyZW50VmlkZW9UaXRsZSxcclxuICAgICAgICB0aGlzLm5leHRWaWRlb1RpdGxlLFxyXG4gICAgICAgIHNjcmlwdFxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5nZW5lcmF0ZWRBdWRpb0RhdGEgPSBhdWRpb0RhdGE7IC8vIFN0b3JlIGdlbmVyYXRlZCBhdWRpbyBkYXRhIGZvciBsYXRlciB1c2VcclxuXHJcbiAgICAgIERvbVV0aWxzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJSSiBDb21tZW50YXJ5IGdlbmVyYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLmlzR2VuZXJhdGluZ0NvbW1lbnRhcnkgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHBsYXlSSkNvbW1lbnRhcnkoKSB7XHJcbiAgICBjb25zdCBhdWRpb0Jsb2IgPSB0aGlzLmdlbmVyYXRlZEF1ZGlvRGF0YT8uYXVkaW9CbG9iO1xyXG5cclxuICAgIGlmICghYXVkaW9CbG9iKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBhdWRpbyBkYXRhIGF2YWlsYWJsZSB0byBwbGF5LlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzUkpQbGF5aW5nKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiUkogYWxyZWFkeSBwbGF5aW5nLCBza2lwcGluZy4uLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNSSlBsYXlpbmcgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IHZpZGVvID0gWW91VHViZVV0aWxzLmdldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCF2aWRlbykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyB2aWRlbyBlbGVtZW50IGZvdW5kIG9uIHRoZSBwYWdlLlwiKTtcclxuICAgICAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBEdWNrIHRoZSBZb3VUdWJlIHZpZGVvIHZvbHVtZSB1c2luZyB1dGlsaXR5XHJcbiAgICAgIHRoaXMub3JpZ2luYWxWb2x1bWUgPSBhd2FpdCBBdWRpb1V0aWxzLmR1Y2tWb2x1bWUodmlkZW8sIDAuMSk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYW5kIHBsYXkgUkogYXVkaW8gdXNpbmcgdXRpbGl0eVxyXG4gICAgICBjb25zdCB7IGF1ZGlvLCBhdWRpb1VybCB9ID0gQXVkaW9VdGlscy5jcmVhdGVBdWRpbyhhdWRpb0Jsb2IpO1xyXG5cclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlc3RvcmVWb2x1bWVBbmRDbGVhbnVwKHZpZGVvLCBhdWRpb1VybCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpbyBlcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVZvbHVtZUFuZENsZWFudXAodmlkZW8sIGF1ZGlvVXJsKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBQbGF5IGF1ZGlvXHJcbiAgICAgIGF3YWl0IEF1ZGlvVXRpbHMucGxheUF1ZGlvKGF1ZGlvKS5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW8gcGxheWJhY2sgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbywgYXVkaW9VcmwpO1xyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwbGF5aW5nIFJKIGNvbW1lbnRhcnk6XCIsIGVycm9yKTtcclxuICAgICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVzdG9yZSBvcmlnaW5hbCB2b2x1bWVcclxuICAgICAgaWYgKHZpZGVvKSB7XHJcbiAgICAgICAgYXdhaXQgQXVkaW9VdGlscy5yZXN0b3JlVm9sdW1lKHZpZGVvLCB0aGlzLm9yaWdpbmFsVm9sdW1lKTtcclxuICAgICAgfVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5nZW5lcmF0ZWRBdWRpb0RhdGEgPSBudWxsOyAvLyBDbGVhciBhdWRpbyBkYXRhIGFmdGVyIHBsYXliYWNrXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyByZXN0b3JlVm9sdW1lQW5kQ2xlYW51cCh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgYXVkaW9Vcmw6IHN0cmluZykge1xyXG4gICAgLy8gUmVzdG9yZSBvcmlnaW5hbCB2b2x1bWUgdXNpbmcgdXRpbGl0eVxyXG4gICAgYXdhaXQgQXVkaW9VdGlscy5yZXN0b3JlVm9sdW1lKHZpZGVvLCB0aGlzLm9yaWdpbmFsVm9sdW1lKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cCBhdWRpbyBVUkxcclxuICAgIGlmIChhdWRpb1VybCkge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGF1ZGlvVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzUkpQbGF5aW5nID0gZmFsc2U7XHJcbiAgICBjb25zb2xlLmxvZyhcIlJKIGNvbW1lbnRhcnkgY2xlYW51cCBjb21wbGV0ZWRcIik7XHJcbiAgfVxyXG5cclxuICBhc3luYyB0b2dnbGVSSk1vZGUoKSB7XHJcbiAgICB0aGlzLmlzUkpNb2RlQWN0aXZlID0gIXRoaXMuaXNSSk1vZGVBY3RpdmU7XHJcbiAgICBEb21VdGlscy51cGRhdGVSSk1vZGVCdXR0b24odGhpcy5pc1JKTW9kZUFjdGl2ZSk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNSSk1vZGVBY3RpdmUpIHtcclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFJKTW9kZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdG9wUkpNb2RlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydFJKTW9kZSgpIHtcclxuICAgIHRoaXMuZ2V0Q3VycmVudEFuZE5leHRUaXRsZXMoKTtcclxuICAgIHRoaXMuc2V0dXBWaWRlb0V2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfVxyXG5cclxuICBzdG9wUkpNb2RlKCkge1xyXG4gICAgdGhpcy5pc1JKTW9kZUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1JKUGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmxhc3RQcm9jZXNzZWRWaWRlbyA9IFwiXCI7XHJcbiAgICBEb21VdGlscy51cGRhdGVSSk1vZGVCdXR0b24oZmFsc2UpO1xyXG5cclxuICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIHRpbWVvdXRzIGFuZCBpbnRlcnZhbHNcclxuICAgIGlmICh0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy52aWRlb0NoYW5nZVRpbWVvdXQpO1xyXG4gICAgICB0aGlzLnZpZGVvQ2hhbmdlVGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpO1xyXG5cclxuICAgIC8vIENsZWFuIHVwIGFueSBsb2FkaW5nIGluZGljYXRvcnNcclxuICAgIERvbVV0aWxzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJSSiBNb2RlIHN0b3BwZWQgYW5kIGNsZWFuZWQgdXBcIik7XHJcbiAgfVxyXG5cclxuICBzZXR1cFZpZGVvRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAvLyBQcm9ncmVzcyBjaGVjayBpbnRlcnZhbFxyXG5cclxuICAgIC8vIE1vbml0b3IgdmlkZW8gcHJvZ3Jlc3NcclxuICAgIGNvbnN0IGNoZWNrVmlkZW9Qcm9ncmVzcyA9ICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJjaGVja1ZpZGVvUHJvZ3Jlc3MgY2FsbGVkXCIpO1xyXG4gICAgICBjb25zdCB2aWRlbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ2aWRlb1wiKTtcclxuICAgICAgaWYgKCF2aWRlbyB8fCAhdGhpcy5pc1JKTW9kZUFjdGl2ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgdGltZVJlbWFpbmluZyA9IHZpZGVvLmR1cmF0aW9uIC0gdmlkZW8uY3VycmVudFRpbWU7XHJcblxyXG4gICAgICAvLyBnZW5lcmF0ZSBjb21tZW50YXJ5IGFuZCBrZWVwIGl0IHJlYWR5IDEwIHNlY29uZHMgYWZlciB2aWRlbyBzdGFydHNcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHZpZGVvLmN1cnJlbnRUaW1lID4gMTAgJiZcclxuICAgICAgICAhdGhpcy5pc0dlbmVyYXRpbmdDb21tZW50YXJ5ICYmXHJcbiAgICAgICAgIXRoaXMuZ2VuZXJhdGVkQXVkaW9EYXRhXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuZ2V0Q3VycmVudEFuZE5leHRUaXRsZXMoKTtcclxuICAgICAgICB0aGlzLmdlbmVyYXRlUkpDb21tZW50YXJ5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0YXJ0IGNvbW1lbnRhcnkgd2hlbiAzMCBzZWNvbmRzIHJlbWFpbiBhbmQgbm90IGFscmVhZHkgcGxheWluZ1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgdGltZVJlbWFpbmluZyA8PSAzMCAmJlxyXG4gICAgICAgICF0aGlzLmlzUkpQbGF5aW5nICYmXHJcbiAgICAgICAgIXRoaXMuaXNHZW5lcmF0aW5nQ29tbWVudGFyeVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLnBsYXlSSkNvbW1lbnRhcnkoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdmlkZW8gcHJvZ3Jlc3MgbW9uaXRvcmluZ1xyXG4gICAgY29uc3Qgc2V0dXBQcm9ncmVzc01vbml0b3JpbmcgPSAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnByb2dyZXNzSW50ZXJ2YWwpIHtcclxuICAgICAgICBjbGVhckludGVydmFsKHRoaXMucHJvZ3Jlc3NJbnRlcnZhbCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wcm9ncmVzc0ludGVydmFsID0gc2V0SW50ZXJ2YWwoY2hlY2tWaWRlb1Byb2dyZXNzLCAxMDAwKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ2xlYXIgcHJvZ3Jlc3MgbW9uaXRvcmluZ1xyXG5cclxuICAgIC8vIFN0YXJ0IG1vbml0b3Jpbmcgd2hlbiBSSiBtb2RlIGlzIGFjdGl2ZVxyXG4gICAgaWYgKHRoaXMuaXNSSk1vZGVBY3RpdmUpIHtcclxuICAgICAgc2V0dXBQcm9ncmVzc01vbml0b3JpbmcoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIExpc3RlbiBmb3IgZGlhZ25vc3RpY3MgdHJpZ2dlcnMgZnJvbSB0aGUgZXh0ZW5zaW9uIHBvcHVwXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgX3NlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgaWYgKFxyXG4gICAgcmVxdWVzdD8uYWN0aW9uID09PSBcImdlbmVyYXRlUkpDb21tZW50YXJ5XCIgfHxcclxuICAgIHJlcXVlc3Q/LmFjdGlvbiA9PT0gXCJwbGF5UkpDb21tZW50YXJ5XCJcclxuICApIHtcclxuICAgIGNvbnN0IHJqID0gKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSjtcclxuICAgIGlmICghcmopIHtcclxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIlJKIGluc3RhbmNlIG5vdCBhdmFpbGFibGUgb24gdGhpcyBwYWdlXCIgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZuID1cclxuICAgICAgcmVxdWVzdC5hY3Rpb24gPT09IFwiZ2VuZXJhdGVSSkNvbW1lbnRhcnlcIlxyXG4gICAgICAgID8gcmouZ2VuZXJhdGVSSkNvbW1lbnRhcnkuYmluZChyailcclxuICAgICAgICA6IHJqLnBsYXlSSkNvbW1lbnRhcnkuYmluZChyaik7XHJcbiAgICBmbigpXHJcbiAgICAgIC50aGVuKCgpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSkpXHJcbiAgICAgIC5jYXRjaCgoZXJyOiBhbnkpID0+XHJcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnI/Lm1lc3NhZ2UgfHwgU3RyaW5nKGVycikgfSlcclxuICAgICAgKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn0pO1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB3aGVuIHBhZ2UgbG9hZHNcclxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgY29uc3QgeW91dHViZVJKID0gbmV3IFlvdVR1YmVSSk1vZGUoKTtcclxuICAgICh3aW5kb3cgYXMgYW55KS55b3V0dWJlUkogPSB5b3V0dWJlUko7XHJcbiAgICBjb25zb2xlLmxvZyh5b3V0dWJlUkopO1xyXG4gIH0pO1xyXG59IGVsc2Uge1xyXG4gIGNvbnN0IHlvdXR1YmVSSiA9IG5ldyBZb3VUdWJlUkpNb2RlKCk7XHJcbiAgKHdpbmRvdyBhcyBhbnkpLnlvdXR1YmVSSiA9IHlvdXR1YmVSSjtcclxuICBjb25zb2xlLmxvZyh5b3V0dWJlUkopO1xyXG59XHJcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTyxJQUFNLG1CQUFtQjtBQUFBLEVBQzlCLGNBQWM7QUFBQSxFQUNkLFlBQVk7QUFBQSxFQUNaLFlBQVk7QUFBQSxFQUNaLGtCQUFrQjtBQUFBLEVBQ2xCLGlCQUFpQjtBQUFBLEVBQ2pCLGFBQWE7QUFBQSxFQUNiLGFBQWE7QUFBQSxFQUNiLFNBQVM7QUFBQSxFQUNULGtCQUFrQjtBQUFBLEVBQ2xCLFNBQVM7QUFBQSxFQUNULFlBQVk7QUFBQSxFQUNaLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLFdBQVc7QUFBQSxFQUNYLGVBQWU7QUFBQSxFQUNmLFVBQVU7QUFBQSxFQUNWLGNBQWM7QUFDaEI7QUFHQSxJQUFNLGlCQUFpQixZQUFZO0FBQUEsRUFDakMsTUFBTSxTQUFTLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSTtBQUFBLEVBQzdDLE9BQU8sS0FBSyxxQkFBcUIsT0FBTztBQUFBO0FBRzFDLElBQU0sZUFBZTtBQUFBLEVBQ25CLFdBQ0U7QUFBQSxFQUNGLE9BQU87QUFBQSxFQUNQLFdBQ0U7QUFBQSxFQUNGLGNBQWM7QUFDaEI7QUFFQSxJQUFNLGVBQWU7QUFBQSxFQUNuQixPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixNQUFNO0FBQ1I7QUFHQSxTQUFTLGdCQUFnQixDQUN2QixhQUNBLFVBQ0EsT0FDQSxRQUNBLGVBQ0EsVUFDQSxtQkFDQSxVQUNBLGNBQytDO0FBQUEsRUFDL0MsTUFBTSxhQUFhLGFBQWEsVUFBVSxhQUFhO0FBQUEsRUFDdkQsTUFBTSxjQUFjLGFBQWEsV0FBVyxhQUFhO0FBQUEsRUFFekQsTUFBTSxtQkFBbUIsWUFBWSxpQkFBaUI7QUFBQSxFQUN0RCxNQUFNLHVCQUF1QixnQkFBZ0IsaUJBQWlCO0FBQUEsRUFFOUQsTUFBTSxZQUFZLGtCQUFrQjtBQUFBLGFBQ3pCO0FBQUEsRUFFWCxNQUFNLGVBQWUsR0FBRyxjQUFjLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNHQU84QyxLQUFLO0FBQUEsRUFFekcsSUFBSSxjQUFjLGtCQUFrQjtBQUFBLEVBQ3BDLElBQUksbUJBQW1CO0FBQUEsSUFDckIsZUFBZTtBQUFBLHVCQUEwQjtBQUFBLEVBQzNDO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFBQSxJQUNaLGVBQWU7QUFBQSxrQkFBcUI7QUFBQSxFQUN0QztBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQUEsSUFDWixlQUFlO0FBQUEsbUJBQXNCO0FBQUEsRUFDdkM7QUFBQSxFQUNBLElBQUksZUFBZTtBQUFBLElBQ2pCLGVBQWU7QUFBQTtBQUFBLEVBQW1DO0FBQUEsRUFDcEQ7QUFBQSxFQUVBLE9BQU8sRUFBRSxjQUFjLFlBQVk7QUFBQTtBQUlyQyxlQUFlLGFBQWEsQ0FBQyxTQUFnQixRQUFnQjtBQUFBLEVBQzNELElBQUksQ0FBQyxRQUFRO0FBQUEsSUFDWCxNQUFNLElBQUksTUFBTSwrQkFBK0I7QUFBQSxFQUNqRDtBQUFBLEVBRUEsTUFBTSxVQUFVO0FBQUEsSUFDZCxVQUFVO0FBQUEsTUFDUjtBQUFBLFFBQ0UsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTyxJQUFJLFFBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDOUMsT0FBTyxRQUFRLFlBQ2IsRUFBRSxRQUFRLGNBQWMsU0FBUyxPQUFPLEdBQ3hDLENBQUMsYUFBYTtBQUFBLE1BQ1osSUFBSSxPQUFPLFFBQVEsV0FBVztBQUFBLFFBQzVCLE9BQU8sT0FBTyxJQUFJLE1BQU0sT0FBTyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsTUFDM0Q7QUFBQSxNQUVBLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxTQUFTO0FBQUEsUUFDbEMsT0FBTyxPQUNMLElBQUksTUFBTSxVQUFVLFNBQVMsMkJBQTJCLENBQzFEO0FBQUEsTUFDRjtBQUFBLE1BRUEsTUFBTSxPQUFPLFNBQVM7QUFBQSxNQUN0QixJQUFJLENBQUMsS0FBSyxjQUFjLENBQUMsS0FBSyxXQUFXLE1BQU0sQ0FBQyxLQUFLLFdBQVcsR0FBRyxTQUFTO0FBQUEsUUFDMUUsT0FBTyxPQUFPLElBQUksTUFBTSxrQ0FBa0MsQ0FBQztBQUFBLE1BQzdEO0FBQUEsTUFFQSxRQUFRLEtBQUssV0FBVyxHQUFHLFFBQVEsTUFBTSxHQUFHLElBQUk7QUFBQSxLQUVwRDtBQUFBLEdBQ0Q7QUFBQTtBQUlILGVBQWUsZ0JBQWdCLENBQzdCLG1CQUNBLGdCQUNBO0FBQUEsRUFDQSxJQUFJO0FBQUEsRUFDSixJQUFJO0FBQUEsRUFFSixJQUFJLE9BQU8sc0JBQXNCLFVBQVU7QUFBQSxJQUN6QyxlQUFlLGtCQUFrQjtBQUFBLElBQ2pDLGNBQWMsa0JBQWtCO0FBQUEsRUFDbEMsRUFBTyxTQUFJLG1CQUFtQixXQUFXO0FBQUEsSUFDdkMsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLEVBQ2hCLEVBQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQTtBQUFBLEVBR2hCLE1BQU0sVUFBVTtBQUFBLElBQ2QsVUFBVTtBQUFBLE1BQ1IsRUFBRSxNQUFNLFVBQVUsU0FBUyxhQUFhO0FBQUEsTUFtQnhDLEVBQUUsTUFBTSxRQUFRLFNBQVMsWUFBWTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxhQUFhO0FBQUEsTUFDWCxlQUFlO0FBQUEsTUFDZjtBQUFBLE1BQ0EsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFFQSxPQUFPLElBQUksUUFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUM5QyxPQUFPLFFBQVEsWUFDYixFQUFFLFFBQVEsaUJBQWlCLFFBQVEsR0FDbkMsQ0FBQyxhQUFhO0FBQUEsTUFDWixJQUFJLE9BQU8sUUFBUSxXQUFXO0FBQUEsUUFDNUIsT0FBTyxPQUFPLElBQUksTUFBTSxPQUFPLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxNQUMzRDtBQUFBLE1BRUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLFNBQVM7QUFBQSxRQUNsQyxPQUFPLE9BQ0wsSUFBSSxNQUFNLFVBQVUsU0FBUyw4QkFBOEIsQ0FDN0Q7QUFBQSxNQUNGO0FBQUEsTUFFQSxNQUFNLE9BQU8sU0FBUztBQUFBLE1BRXRCLE1BQU0sYUFBYSxLQUFLLFFBQVEsV0FBVztBQUFBLE1BQzNDLElBQUksU0FBUztBQUFBLE1BQ2IsSUFBSSxlQUFlLElBQUk7QUFBQSxRQUNyQixTQUFTLEtBQUssVUFBVSxHQUFHLFVBQVU7QUFBQSxNQUN2QztBQUFBLE1BR0EsUUFBUSxPQUFPLEtBQUssRUFBRSxRQUFRLFVBQVUsRUFBRSxFQUFFLFFBQVEsUUFBUTtBQUFBLENBQUksRUFBRSxLQUFLLENBQUM7QUFBQSxLQUU1RTtBQUFBLEdBQ0Q7QUFBQTtBQUlILGVBQWUsV0FBVyxDQUN4QixNQUNBLFFBQ0EsVUFBVSxpQkFDVixRQUFRLFNBQ1I7QUFBQSxFQUNBLElBQUksQ0FBQyxRQUFRO0FBQUEsSUFDWCxNQUFNLElBQUksTUFBTSxnQ0FBZ0M7QUFBQSxFQUNsRDtBQUFBLEVBRUEsTUFBTSxVQUFVO0FBQUEsSUFDZDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTyxJQUFJLFFBQ1QsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUNuQixPQUFPLFFBQVEsWUFDYixFQUFFLFFBQVEsWUFBWSxTQUFTLE9BQU8sR0FDdEMsQ0FBQyxhQUFhO0FBQUEsTUFDWixJQUFJLE9BQU8sUUFBUSxXQUFXO0FBQUEsUUFDNUIsT0FBTyxPQUFPLElBQUksTUFBTSxPQUFPLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxNQUMzRDtBQUFBLE1BRUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLFNBQVM7QUFBQSxRQUNsQyxPQUFPLE9BQ0wsSUFBSSxNQUFNLFVBQVUsU0FBUyx5QkFBeUIsQ0FDeEQ7QUFBQSxNQUNGO0FBQUEsTUFFQSxNQUFNLE9BQU8sU0FBUztBQUFBLE1BQ3RCLE1BQU0sU0FBUyxTQUFTO0FBQUEsTUFHeEIsTUFBTSxlQUFlLEtBQUssTUFBTTtBQUFBLE1BQ2hDLE1BQU0sUUFBUSxJQUFJLFdBQVcsYUFBYSxNQUFNO0FBQUEsTUFDaEQsU0FBUyxJQUFJLEVBQUcsSUFBSSxhQUFhLFFBQVEsS0FBSztBQUFBLFFBQzVDLE1BQU0sS0FBSyxhQUFhLFdBQVcsQ0FBQztBQUFBLE1BQ3RDO0FBQUEsTUFDQSxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFBQSxNQUVyRCxRQUFRO0FBQUEsUUFDTixXQUFXO0FBQUEsUUFDWCxVQUFVLEtBQUs7QUFBQSxRQUNmLGdCQUFnQixLQUFLO0FBQUEsTUFDdkIsQ0FBQztBQUFBLEtBRUw7QUFBQSxHQUVKO0FBQUE7QUFJRixlQUFlLGdCQUFnQixDQUM3QixNQUNBLFFBQ0EsY0FBYyxvQ0FDZDtBQUFBLEVBQ0EsSUFBSSxDQUFDLFFBQVE7QUFBQSxJQUNYLE1BQU0sSUFBSSxNQUFNLG1DQUFtQztBQUFBLEVBQ3JEO0FBQUEsRUFFQSxPQUFPLElBQUksUUFBNkIsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUMzRCxPQUFPLFFBQVEsWUFDYjtBQUFBLE1BQ0UsUUFBUTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0YsR0FDQSxDQUFDLGFBQWE7QUFBQSxNQUNaLElBQUksT0FBTyxRQUFRLFdBQVc7QUFBQSxRQUM1QixPQUFPLE9BQU8sSUFBSSxNQUFNLE9BQU8sUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLE1BQzNEO0FBQUEsTUFFQSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsU0FBUztBQUFBLFFBQ2xDLE9BQU8sT0FDTCxJQUFJLE1BQU0sVUFBVSxTQUFTLCtCQUErQixDQUM5RDtBQUFBLE1BQ0Y7QUFBQSxNQUVBLE1BQU0sU0FBUyxTQUFTO0FBQUEsTUFDeEIsTUFBTSxlQUFlLEtBQUssTUFBTTtBQUFBLE1BQ2hDLE1BQU0sUUFBUSxJQUFJLFdBQVcsYUFBYSxNQUFNO0FBQUEsTUFDaEQsU0FBUyxJQUFJLEVBQUcsSUFBSSxhQUFhLFFBQVEsS0FBSztBQUFBLFFBQzVDLE1BQU0sS0FBSyxhQUFhLFdBQVcsQ0FBQztBQUFBLE1BQ3RDO0FBQUEsTUFDQSxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxNQUVwRCxRQUFRLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxLQUUvQjtBQUFBLEdBQ0Q7QUFBQTtBQUlILFNBQVMsYUFBYSxDQUFDLGFBQXFCLFVBQWtCLFFBQWdCO0FBQUEsRUFDNUUsT0FBTyxRQUNKLFlBQVk7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUMsRUFDQSxNQUFNLFFBQVEsS0FBSztBQUFBO0FBR3hCLGVBQWUsYUFBYSxDQUFDLE9BQWU7QUFBQSxFQUMxQyxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLElBQ3RDLE9BQU8sUUFBUSxZQUNiLEVBQUUsUUFBUSxjQUFjLE1BQU0sR0FDOUIsQ0FBQyxhQUFhO0FBQUEsTUFDWixJQUFJLE9BQU8sUUFBUSxXQUFXO0FBQUEsUUFDNUIsT0FBTyxPQUFPLElBQUksTUFBTSxPQUFPLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxNQUMzRDtBQUFBLE1BRUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLFNBQVM7QUFBQSxRQUNsQyxPQUFPLE9BQ0wsSUFBSSxNQUFNLFVBQVUsU0FBUywyQkFBMkIsQ0FDMUQ7QUFBQSxNQUNGO0FBQUEsTUFFQSxNQUFNLE9BQU8sU0FBUztBQUFBLE1BQ3RCLFFBQVEsSUFBSSx3QkFBd0IsSUFBSTtBQUFBLE1BQ3hDLFFBQVEsT0FBTyxJQUFJLFdBQVc7QUFBQSxLQUVsQztBQUFBLEdBQ0Q7QUFBQTtBQUlILGVBQWUsaUJBQWlCLENBQzlCLGNBQ0EsYUFDQSxRQUNBLE9BQ2lCO0FBQUEsRUFDakIsSUFBSSxDQUFDLFFBQVE7QUFBQSxJQUNYLE1BQU0sSUFBSSxNQUNSLHlFQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxXQUFXO0FBQUEsSUFDZixFQUFFLE1BQU0sVUFBVSxTQUFTLGFBQWE7QUFBQSxJQUN4QyxFQUFFLE1BQU0sUUFBUSxTQUFTLFlBQVk7QUFBQSxFQUN2QztBQUFBLEVBRUEsT0FBTyxJQUFJLFFBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDOUMsT0FBTyxRQUFRLFlBQ2I7QUFBQSxNQUNFLFFBQVE7QUFBQSxNQUNSO0FBQUEsTUFDQSxPQUFPLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0YsR0FDQSxDQUFDLGFBQWE7QUFBQSxNQUNaLElBQUksT0FBTyxRQUFRLFdBQVc7QUFBQSxRQUM1QixPQUFPLE9BQU8sSUFBSSxNQUFNLE9BQU8sUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLE1BQzNEO0FBQUEsTUFFQSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsU0FBUztBQUFBLFFBQ2xDLE9BQU8sT0FDTCxJQUFJLE1BQU0sVUFBVSxTQUFTLCtCQUErQixDQUM5RDtBQUFBLE1BQ0Y7QUFBQSxNQUVBLFFBQ0UsU0FBUyxLQUNOLEtBQUssRUFDTCxRQUFRLFVBQVUsRUFBRSxFQUNwQixRQUFRLFFBQVE7QUFBQSxDQUFJLEVBQ3BCLEtBQUssQ0FDVjtBQUFBLEtBRUo7QUFBQSxHQUNEO0FBQUE7QUFJSCxlQUFlLE9BQU8sQ0FDcEIsY0FDQSxhQUNBLFVBQ2lCO0FBQUEsRUFDakIsTUFBTSxrQkFBa0IsWUFBYSxNQUFNLGVBQWU7QUFBQSxFQUMxRCxNQUFNLFdBQVcsZ0JBQWdCLGVBQWU7QUFBQSxFQUVoRCxJQUFJLGFBQWEsY0FBYztBQUFBLElBQzdCLE9BQU8sa0JBQ0wsY0FDQSxhQUNBLGdCQUFnQixrQkFDaEIsZ0JBQWdCLGVBQ2xCO0FBQUEsRUFDRixFQUFPLFNBQUksYUFBYSxVQUFVO0FBQUEsSUFDaEMsT0FBTyxjQUNMLEdBQUc7QUFBQTtBQUFBLEVBQW1CLGVBQ3RCLGdCQUFnQixZQUNsQjtBQUFBLEVBQ0YsRUFBTztBQUFBLElBQ0wsT0FBTyxpQkFBaUIsY0FBYyxXQUFXO0FBQUE7QUFBQTtBQUlyRCxJQUFNLFdBQVc7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFHQyxPQUFlLFdBQVc7QUFDM0IsSUFBZTs7O0FDMWFmLElBQU0sYUFBYTtBQUFBLEVBRWpCLGtCQUFrQixHQUFHO0FBQUEsSUFDbkIsSUFBSTtBQUFBLE1BQ0YsT0FBTyxLQUFLLE9BQU8sZ0JBQWdCLE9BQU87QUFBQSxNQUMxQyxPQUFPLE9BQU87QUFBQSxNQUNkLFFBQVEsTUFBTSxrQ0FBa0MsS0FBSztBQUFBLE1BQ3JELE9BQU87QUFBQTtBQUFBO0FBQUEsT0FLTCx1QkFBc0IsQ0FDMUIsT0FDQSxjQUNBLFdBQVcsS0FDWDtBQUFBLElBQ0EsSUFBSSxDQUFDO0FBQUEsTUFBTztBQUFBLElBRVosTUFBTSxjQUFjLE1BQU07QUFBQSxJQUMxQixNQUFNLFFBQVE7QUFBQSxJQUNkLE1BQU0sY0FBYyxlQUFlLGVBQWU7QUFBQSxJQUNsRCxNQUFNLFdBQVcsV0FBVztBQUFBLElBRTVCLFNBQVMsSUFBSSxFQUFHLElBQUksT0FBTyxLQUFLO0FBQUEsTUFDOUIsV0FBVyxNQUFNO0FBQUEsUUFDZixNQUFNLFlBQVksS0FBSyxJQUNyQixHQUNBLEtBQUssSUFBSSxHQUFHLGNBQWMsY0FBYyxJQUFJLEVBQUUsQ0FDaEQ7QUFBQSxRQUNBLE1BQU0sU0FBUztBQUFBLFNBQ2QsV0FBVyxDQUFDO0FBQUEsSUFDakI7QUFBQTtBQUFBLE9BSUksV0FBVSxDQUFDLE9BQXlCLFlBQVksS0FBSztBQUFBLElBQ3pELElBQUksQ0FBQztBQUFBLE1BQU8sT0FBTztBQUFBLElBRW5CLE1BQU0saUJBQWlCLE1BQU07QUFBQSxJQUM3QixNQUFNLEtBQUssdUJBQXVCLE9BQU8sU0FBUztBQUFBLElBQ2xELE9BQU87QUFBQTtBQUFBLE9BSUgsY0FBYSxDQUFDLE9BQXlCLGNBQXNCO0FBQUEsSUFDakUsSUFBSSxDQUFDLFNBQVMsaUJBQWlCO0FBQUEsTUFBVztBQUFBLElBQzFDLE1BQU0sS0FBSyx1QkFBdUIsT0FBTyxjQUFjLEdBQUc7QUFBQTtBQUFBLEVBSTVELFdBQVcsQ0FBQyxXQUFpQjtBQUFBLElBQzNCLE1BQU0sV0FBVyxJQUFJLGdCQUFnQixTQUFTO0FBQUEsSUFDOUMsTUFBTSxRQUFRLElBQUksTUFBTSxRQUFRO0FBQUEsSUFHaEMsTUFBTSxpQkFBaUIsU0FBUyxDQUFDLFVBQVU7QUFBQSxNQUN6QyxRQUFRLE1BQU0seUJBQXlCLEtBQUs7QUFBQSxNQUM1QyxJQUFJLGdCQUFnQixRQUFRO0FBQUEsS0FDN0I7QUFBQSxJQUVELE9BQU8sRUFBRSxPQUFPLFNBQVM7QUFBQTtBQUFBLEVBSTNCLFNBQVMsQ0FBQyxPQUF5QjtBQUFBLElBQ2pDLE9BQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsTUFDdEMsTUFBTSxpQkFBaUIsU0FBUyxPQUFPO0FBQUEsTUFDdkMsTUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsTUFFdEMsTUFBTSxLQUFLLEVBQUUsTUFBTSxNQUFNO0FBQUEsS0FDMUI7QUFBQTtBQUVMO0FBR0MsT0FBZSxhQUFhO0FBQzdCLElBQWU7OztBQ25GZixJQUFNLHVCQUF1QixNQUFNO0FBQUEsRUFDakMsSUFBSSxTQUFTLGVBQWUsb0JBQW9CO0FBQUEsSUFBRztBQUFBLEVBRW5ELE1BQU0sUUFBUSxTQUFTLGNBQWMsT0FBTztBQUFBLEVBQzVDLE1BQU0sS0FBSztBQUFBLEVBQ1gsTUFBTSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBc0RwQixTQUFTLEtBQUssWUFBWSxLQUFLO0FBQUE7QUFHakMsSUFBTSxxQkFBcUIsQ0FBQyxpQkFBMkI7QUFBQSxFQUNyRCxxQkFBcUI7QUFBQSxFQUVyQixJQUFJLFNBQVMsZUFBZSxnQkFBZ0I7QUFBQSxJQUFHO0FBQUEsRUFFL0MsTUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQUEsRUFDOUMsT0FBTyxLQUFLO0FBQUEsRUFDWixPQUFPLFlBQVk7QUFBQSxFQUNuQixPQUFPLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFrQnZCLE9BQU8sWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWdCbkIsT0FBTyxpQkFBaUIsU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUFBLEVBQ3JELE9BQU8saUJBQWlCLGNBQWMsTUFBTTtBQUFBLElBQzFDLE9BQU8sTUFBTSxZQUFZO0FBQUEsSUFDekIsT0FBTyxNQUFNLGNBQWM7QUFBQSxHQUM1QjtBQUFBLEVBQ0QsT0FBTyxpQkFBaUIsY0FBYyxNQUFNO0FBQUEsSUFDMUMsT0FBTyxNQUFNLFlBQVk7QUFBQSxJQUN6QixJQUFJLENBQUMsT0FBTyxRQUFRLFFBQVE7QUFBQSxNQUMxQixPQUFPLE1BQU0sY0FBYztBQUFBLElBQzdCO0FBQUEsR0FDRDtBQUFBLEVBRUQsU0FBUyxLQUFLLFlBQVksTUFBTTtBQUFBO0FBR2xDLElBQU0scUJBQXFCLENBQUMsYUFBc0I7QUFBQSxFQUNoRCxNQUFNLFNBQVMsU0FBUyxlQUFlLGdCQUFnQjtBQUFBLEVBQ3ZELElBQUksQ0FBQztBQUFBLElBQVE7QUFBQSxFQUViLE1BQU0sUUFBUSxTQUFTLGVBQWUsY0FBYztBQUFBLEVBQ3BELE1BQU0sTUFBTSxTQUFTLGVBQWUsWUFBWTtBQUFBLEVBQ2hELE1BQU0sT0FBTyxTQUFTLGVBQWUsYUFBYTtBQUFBLEVBRWxELElBQUksVUFBVTtBQUFBLElBQ1osT0FBTyxRQUFRLFNBQVM7QUFBQSxJQUN4QixPQUFPLE1BQU0sYUFBYTtBQUFBLElBQzFCLE9BQU8sTUFBTSxjQUFjO0FBQUEsSUFDM0IsT0FBTyxNQUFNLFlBQVk7QUFBQSxJQUV6QixJQUFJLE9BQU87QUFBQSxNQUNULE1BQU0sY0FBYztBQUFBLE1BQ3BCLE1BQU0sTUFBTSxRQUFRO0FBQUEsSUFDdEI7QUFBQSxJQUNBLElBQUksS0FBSztBQUFBLE1BQ1AsSUFBSSxNQUFNLGFBQWE7QUFBQSxNQUN2QixJQUFJLE1BQU0sY0FBYztBQUFBLE1BQ3hCLElBQUksTUFBTSxZQUFZO0FBQUEsSUFDeEI7QUFBQSxJQUNBLElBQUk7QUFBQSxNQUFNLEtBQUssTUFBTSxVQUFVO0FBQUEsRUFDakMsRUFBTztBQUFBLElBQ0wsT0FBTyxPQUFPLFFBQVE7QUFBQSxJQUN0QixPQUFPLE1BQU0sYUFBYTtBQUFBLElBQzFCLE9BQU8sTUFBTSxjQUFjO0FBQUEsSUFDM0IsT0FBTyxNQUFNLFlBQVk7QUFBQSxJQUV6QixJQUFJLE9BQU87QUFBQSxNQUNULE1BQU0sY0FBYztBQUFBLE1BQ3BCLE1BQU0sTUFBTSxRQUFRO0FBQUEsSUFDdEI7QUFBQSxJQUNBLElBQUksS0FBSztBQUFBLE1BQ1AsSUFBSSxNQUFNLGFBQWE7QUFBQSxNQUN2QixJQUFJLE1BQU0sY0FBYztBQUFBLE1BQ3hCLElBQUksTUFBTSxZQUFZO0FBQUEsSUFDeEI7QUFBQSxJQUNBLElBQUk7QUFBQSxNQUFNLEtBQUssTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUluQyxJQUFNLHVCQUF1QixNQUFNO0FBQUEsRUFDakMscUJBQXFCO0FBQUEsRUFFckIsSUFBSSxTQUFTLGVBQWUsWUFBWTtBQUFBLElBQUc7QUFBQSxFQUUzQyxNQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFBQSxFQUM1QyxRQUFRLEtBQUs7QUFBQSxFQUNiLFFBQVEsWUFBWTtBQUFBLEVBQ3BCLFFBQVEsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBZ0J4QixRQUFRLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBWXBCLFNBQVMsS0FBSyxZQUFZLE9BQU87QUFBQTtBQUduQyxJQUFNLHVCQUF1QixNQUFNO0FBQUEsRUFDakMsTUFBTSxVQUFVLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDcEQsSUFBSTtBQUFBLElBQVMsUUFBUSxPQUFPO0FBQUE7QUFHOUIsSUFBTSxtQkFBbUIsQ0FBQyxZQUFvQjtBQUFBLEVBQzVDLHFCQUFxQjtBQUFBLEVBR3JCLE1BQU0sV0FBVyxTQUFTLGVBQWUsa0JBQWtCO0FBQUEsRUFDM0QsSUFBSTtBQUFBLElBQVUsU0FBUyxPQUFPO0FBQUEsRUFFOUIsTUFBTSxRQUFRLFNBQVMsY0FBYyxLQUFLO0FBQUEsRUFDMUMsTUFBTSxLQUFLO0FBQUEsRUFDWCxNQUFNLFlBQVk7QUFBQSxFQUNsQixNQUFNLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFrQnRCLE1BQU0sWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtHQUk4RTtBQUFBO0FBQUE7QUFBQSxFQUloRyxTQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsRUFFL0IsV0FBVyxNQUFNO0FBQUEsSUFDZixNQUFNLE1BQU0sWUFBWTtBQUFBLElBQ3hCLFdBQVcsTUFBTSxNQUFNLE9BQU8sR0FBRyxHQUFHO0FBQUEsS0FDbkMsSUFBSTtBQUFBO0FBR1QsSUFBTSxzQkFBc0IsTUFBTTtBQUFBLEVBQ2hDLE1BQU0sZUFBZSxTQUFTLGVBQWUsc0JBQXNCO0FBQUEsRUFDbkUsSUFBSSxjQUFjO0FBQUEsSUFDaEIsYUFBYSxNQUFNLFlBQVk7QUFBQSxJQUMvQixXQUFXLE1BQU07QUFBQSxNQUNmLGFBQWEsT0FBTztBQUFBLE9BQ25CLEdBQUc7QUFBQSxFQUNSO0FBQUE7QUFHRixJQUFNLG1CQUFtQixDQUFDLGlCQUEyQjtBQUFBLEVBQ25ELHFCQUFxQjtBQUFBLEVBRXJCLElBQUksU0FBUyxlQUFlLHNCQUFzQjtBQUFBLElBQUc7QUFBQSxFQUVyRCxNQUFNLGVBQWUsU0FBUyxjQUFjLEtBQUs7QUFBQSxFQUNqRCxhQUFhLEtBQUs7QUFBQSxFQUNsQixhQUFhLFlBQVk7QUFBQSxFQUN6QixhQUFhLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBYzdCLGFBQWEsWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXdDekIsU0FBUyxLQUFLLFlBQVksWUFBWTtBQUFBLEVBR3RDLE1BQU0sWUFBWSxTQUFTLGVBQWUsZ0JBQWdCO0FBQUEsRUFDMUQsV0FBVyxpQkFBaUIsY0FBYyxNQUFNO0FBQUEsSUFDOUMsVUFBVSxNQUFNLGFBQWE7QUFBQSxJQUM3QixVQUFVLE1BQU0sWUFBWTtBQUFBLEdBQzdCO0FBQUEsRUFDRCxXQUFXLGlCQUFpQixjQUFjLE1BQU07QUFBQSxJQUM5QyxVQUFVLE1BQU0sYUFBYTtBQUFBLElBQzdCLFVBQVUsTUFBTSxZQUFZO0FBQUEsR0FDN0I7QUFBQSxFQUVELFdBQVcsaUJBQWlCLFNBQVMsTUFBTTtBQUFBLElBQ3pDLG9CQUFvQjtBQUFBLElBQ3BCLGFBQWE7QUFBQSxHQUNkO0FBQUEsRUFFRCxTQUFTLGVBQWUsbUJBQW1CLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUFBLElBQzVFLG9CQUFvQjtBQUFBLEdBQ3JCO0FBQUEsRUFHRCxXQUFXLE1BQU07QUFBQSxJQUNmLG9CQUFvQjtBQUFBLEtBQ25CLEtBQUs7QUFBQTtBQUdWLElBQU0sV0FBVztBQUFBLEVBQ2Y7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUVDLE9BQWUsV0FBVztBQUMzQixJQUFlOzs7QUMxV2YsSUFBTSxpQkFBaUIsTUFDckIsT0FBTyxTQUFTLFNBQVMsU0FBUyxtQkFBbUI7QUFFdkQsSUFBTSxlQUFlO0FBQUEsRUFDbkIsY0FBYyxHQUFHO0FBQUEsSUFDZixNQUFNLFlBQVksSUFBSSxnQkFBZ0IsT0FBTyxTQUFTLE1BQU07QUFBQSxJQUM1RCxNQUFNLFVBQVUsVUFBVSxJQUFJLEdBQUc7QUFBQSxJQUNqQyxPQUFPLFdBQVc7QUFBQTtBQUFBLEVBR3BCO0FBQUEsRUFFQSxvQkFBb0IsR0FBRztBQUFBLElBQ3JCLElBQUksZUFBZSxHQUFHO0FBQUEsTUFFcEIsTUFBTSxtQkFBbUIsU0FBUyxjQUFjLHVDQUF1QztBQUFBLE1BQ3ZGLE1BQU0sV0FBVyxrQkFBa0Isb0JBQW9CLGFBQWEsS0FBSyxFQUN0RSxNQUFNLElBQUksRUFDVixJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUNuQixLQUFLLEdBQUc7QUFBQSxNQUNYLE1BQU0saUJBQWlCLGtCQUFrQixhQUFhLEtBQUs7QUFBQSxNQUMzRCxJQUFJO0FBQUEsUUFBZ0IsT0FBTyxHQUFHLG9CQUFvQjtBQUFBLE1BRWxELE1BQU0sUUFBUSxNQUFNLEtBQ2xCLFNBQVMsaUJBQWlCLHVDQUF1QyxDQUNuRTtBQUFBLE1BR0EsTUFBTSxVQUFVLE1BQU0sS0FBSyxDQUFDLE9BQU87QUFBQSxRQUNqQyxNQUFNLFFBQVEsR0FBRyxhQUFhLG1CQUFtQjtBQUFBLFFBQ2pELE9BQU8sVUFBVSxhQUFhLFVBQVU7QUFBQSxPQUN6QztBQUFBLE1BQ0QsTUFBTSxlQUFlLFNBQ2pCLGNBQWMsMkJBQTJCLEdBQ3pDLGFBQWEsS0FBSztBQUFBLE1BQ3RCLElBQUk7QUFBQSxRQUFjLE9BQU87QUFBQSxNQUd6QixNQUFNLE1BQU0sS0FBSyxlQUFlO0FBQUEsTUFDaEMsSUFBSSxLQUFLO0FBQUEsUUFDUCxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsUUFDdkIsR0FBRyxhQUFhLElBQUksU0FBUyxHQUFHLENBQ25DO0FBQUEsUUFDQSxNQUFNLFFBQVEsT0FDVixjQUFjLDJCQUEyQixHQUN6QyxhQUFhLEtBQUs7QUFBQSxRQUN0QixJQUFJO0FBQUEsVUFBTyxPQUFPO0FBQUEsTUFDcEI7QUFBQSxNQUdBLE1BQU0sYUFBYSxTQUNoQixjQUFjLHVDQUF1QyxHQUNwRCxhQUFhLEtBQUs7QUFBQSxNQUN0QixJQUFJO0FBQUEsUUFBWSxPQUFPO0FBQUEsTUFHdkIsT0FDRSxTQUFTLGNBQWMsaUJBQWlCLEdBQUcsYUFBYSxLQUFLLEtBQUs7QUFBQSxJQUV0RTtBQUFBLElBRUEsTUFBTSxlQUFlLFNBQVMsY0FDNUIsc0RBQ0Y7QUFBQSxJQUNBLE9BQU8sY0FBYyxhQUFhLEtBQUssS0FBSztBQUFBO0FBQUEsRUFHOUMsY0FBYyxHQUFHO0FBQUEsSUFDZixJQUFJLGVBQWU7QUFBQSxNQUFHLE9BQU87QUFBQSxJQUM3QixPQUNFLFVBQVUsY0FBYyxvQkFBb0IsR0FBRyxhQUFhLEtBQUssS0FBSztBQUFBO0FBQUEsRUFJMUUsV0FBVyxHQUFHO0FBQUEsSUFDWixJQUFJLGVBQWU7QUFBQSxNQUFHLE9BQU8sQ0FBQztBQUFBLElBRTlCLElBQUksY0FBd0IsQ0FBQztBQUFBLElBQzdCLFNBQVMsaUJBQWlCLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQUEsTUFDaEUsSUFBSSxNQUFNLEtBQUssY0FBYyxXQUFXLEdBQUcsYUFBYSxLQUFLLEtBQUs7QUFBQSxNQUNsRSxZQUFZLEtBQUssR0FBRztBQUFBLEtBQ3JCO0FBQUEsSUFDRCxPQUFPO0FBQUE7QUFBQSxFQUdULGlCQUFpQixHQUFHO0FBQUEsSUFDbEIsSUFBSSxlQUFlLEdBQUc7QUFBQSxNQUVwQixNQUFNLGNBQWMsU0FBUyxpQkFBaUIsK0JBQStCLEVBQUU7QUFBQSxNQUMvRSxNQUFNLFFBQVEsYUFBYSxhQUFhLGVBQWUsSUFDcEQsS0FBSyxFQUNMLE1BQU0sSUFBSSxFQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQ25CLE9BQU8sT0FBTyxFQUNkLEtBQUssS0FBSztBQUFBLE1BQ2IsT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLE1BQU0sZUFBZSxTQUFTLGNBQWMsMkJBQTJCO0FBQUEsSUFDdkUsTUFBTSxtQkFDSixjQUFjLGFBQ2IsY0FBYyxjQUFjO0FBQUEsSUFFL0IsT0FBTyxrQkFBa0IsYUFBYSxLQUFLLEtBQUs7QUFBQTtBQUFBLEVBR2xELGNBQWMsR0FBRztBQUFBLElBQ2YsTUFBTSxZQUFZLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNO0FBQUEsSUFDNUQsT0FBTyxVQUFVLElBQUksTUFBTTtBQUFBO0FBQUEsRUFHN0IsYUFBYSxHQUFHO0FBQUEsSUFDZCxNQUFNLFlBQVksSUFBSSxnQkFBZ0IsT0FBTyxTQUFTLE1BQU07QUFBQSxJQUM1RCxPQUFPLFVBQVUsSUFBSSxNQUFNO0FBQUE7QUFBQSxFQUc3QixlQUFlLEdBQUc7QUFBQSxJQUNoQixPQUFPLFNBQVMsY0FBYyxPQUFPO0FBQUE7QUFBQSxFQUl2QyxlQUFlLENBQUMsT0FBZTtBQUFBLElBQzdCLE9BQU8sTUFDSixRQUFRLHFCQUFxQixFQUFFLEVBQy9CLFFBQVEscUJBQXFCLEVBQUUsRUFDL0IsUUFBUSxxQkFBcUIsRUFBRSxFQUMvQixRQUFRLFlBQVksRUFBRSxFQUN0QixLQUFLO0FBQUE7QUFBQSxFQUlWLGdCQUFnQixHQUFHO0FBQUEsSUFDakIsTUFBTSxRQUFRLEtBQUssZ0JBQWdCO0FBQUEsSUFDbkMsT0FBTyxRQUFRLE1BQU0sV0FBVztBQUFBO0FBQUEsRUFJbEMsY0FBYyxHQUFHO0FBQUEsSUFDZixNQUFNLFFBQVEsS0FBSyxnQkFBZ0I7QUFBQSxJQUNuQyxPQUFPLFFBQVEsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxNQUFNLFFBQVE7QUFBQTtBQUVuRDtBQUdDLE9BQWUsZUFBZTtBQUMvQixJQUFlOzs7QUNqSlIsTUFBTSxVQUFVO0FBQUEsRUFDYixZQUF5QjtBQUFBLE9BRTNCLFdBQVUsQ0FBQyxNQUFjLE9BQWUsTUFBcUI7QUFBQSxJQUNqRSxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLE1BQ3RDLE9BQU8sUUFBUSxZQUNiO0FBQUEsUUFDRSxRQUFRO0FBQUEsUUFDUixTQUFTLEVBQUUsTUFBTSxLQUFLO0FBQUEsTUFDeEIsR0FDQSxDQUFDLGFBQWE7QUFBQSxRQUNaLElBQUksT0FBTyxRQUFRLFdBQVc7QUFBQSxVQUM1QixRQUFRLE1BQU0sc0JBQXNCLE9BQU8sUUFBUSxTQUFTO0FBQUEsVUFDNUQsT0FBTyxPQUFPLElBQUksTUFBTSxPQUFPLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxRQUMzRDtBQUFBLFFBRUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLFNBQVM7QUFBQSxVQUNsQyxRQUFRLE1BQU0sa0JBQWtCLFVBQVUsS0FBSztBQUFBLFVBQy9DLE9BQU8sT0FBTyxJQUFJLE1BQU0sVUFBVSxTQUFTLHlCQUF5QixDQUFDO0FBQUEsUUFDdkU7QUFBQSxRQUVBLElBQUk7QUFBQSxVQUNGLE1BQU0sZUFBeUIsU0FBUztBQUFBLFVBQ3hDLE1BQU0sY0FBYyxhQUFhLElBQUksQ0FBQyxXQUFXO0FBQUEsWUFDL0MsTUFBTSxlQUFlLEtBQUssTUFBTTtBQUFBLFlBQ2hDLE1BQU0sUUFBUSxJQUFJLFdBQVcsYUFBYSxNQUFNO0FBQUEsWUFDaEQsU0FBUyxJQUFJLEVBQUcsSUFBSSxhQUFhLFFBQVEsS0FBSztBQUFBLGNBQzVDLE1BQU0sS0FBSyxhQUFhLFdBQVcsQ0FBQztBQUFBLFlBQ3RDO0FBQUEsWUFDQSxPQUFPLE1BQU07QUFBQSxXQUNkO0FBQUEsVUFFRCxLQUFLLFlBQVksSUFBSSxLQUFLLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUFBLFVBQzdELFFBQVE7QUFBQSxVQUNSLE9BQU8sT0FBTztBQUFBLFVBQ2QsUUFBUSxNQUFNLG9DQUFvQyxLQUFLO0FBQUEsVUFDdkQsT0FBTyxLQUFLO0FBQUE7QUFBQSxPQUdsQjtBQUFBLEtBQ0Q7QUFBQTtBQUFBLEVBR0gsTUFBTSxHQUFTO0FBQUEsSUFDYixJQUFJLENBQUMsS0FBSyxXQUFXO0FBQUEsTUFDbkIsTUFBTSxJQUFJLE1BQU0sMERBQTBEO0FBQUEsSUFDNUU7QUFBQSxJQUNBLE9BQU8sS0FBSztBQUFBO0FBRWhCOzs7QUNsRE8sTUFBTSxhQUFhO0FBQUEsRUFDaEIsWUFBeUI7QUFBQSxPQUUzQixXQUFVLENBQ2QsTUFDQSxRQUNBLGNBQXNCLG9DQUNQO0FBQUEsSUFDZixJQUFJLENBQUMsUUFBUTtBQUFBLE1BQ1gsTUFBTSxJQUFJLE1BQU0sbUNBQW1DO0FBQUEsSUFDckQ7QUFBQSxJQUVBLE9BQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsTUFDdEMsT0FBTyxRQUFRLFlBQ2I7QUFBQSxRQUNFLFFBQVE7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGLEdBQ0EsQ0FBQyxhQUFhO0FBQUEsUUFDWixJQUFJLE9BQU8sUUFBUSxXQUFXO0FBQUEsVUFDNUIsUUFBUSxNQUFNLDZCQUE2QixPQUFPLFFBQVEsU0FBUztBQUFBLFVBQ25FLE9BQU8sT0FBTyxJQUFJLE1BQU0sT0FBTyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsUUFDM0Q7QUFBQSxRQUVBLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxTQUFTO0FBQUEsVUFDbEMsUUFBUSxNQUFNLHlCQUF5QixVQUFVLEtBQUs7QUFBQSxVQUN0RCxPQUFPLE9BQ0wsSUFBSSxNQUFNLFVBQVUsU0FBUyw4QkFBOEIsQ0FDN0Q7QUFBQSxRQUNGO0FBQUEsUUFFQSxJQUFJO0FBQUEsVUFDRixNQUFNLFNBQVMsU0FBUztBQUFBLFVBQ3hCLE1BQU0sZUFBZSxLQUFLLE1BQU07QUFBQSxVQUNoQyxNQUFNLFFBQVEsSUFBSSxXQUFXLGFBQWEsTUFBTTtBQUFBLFVBQ2hELFNBQVMsSUFBSSxFQUFHLElBQUksYUFBYSxRQUFRLEtBQUs7QUFBQSxZQUM1QyxNQUFNLEtBQUssYUFBYSxXQUFXLENBQUM7QUFBQSxVQUN0QztBQUFBLFVBRUEsS0FBSyxZQUFZLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQUEsVUFDeEQsUUFBUTtBQUFBLFVBQ1IsT0FBTyxPQUFPO0FBQUEsVUFDZCxRQUFRLE1BQU0scUNBQXFDLEtBQUs7QUFBQSxVQUN4RCxPQUFPLEtBQUs7QUFBQTtBQUFBLE9BR2xCO0FBQUEsS0FDRDtBQUFBO0FBQUEsRUFHSCxNQUFNLEdBQVM7QUFBQSxJQUNiLElBQUksQ0FBQyxLQUFLLFdBQVc7QUFBQSxNQUNuQixNQUFNLElBQUksTUFBTSwwREFBMEQ7QUFBQSxJQUM1RTtBQUFBLElBQ0EsT0FBTyxLQUFLO0FBQUE7QUFFaEI7OztBQ25EQSxNQUFNLGNBQWM7QUFBQSxFQUNsQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBRUEsV0FBVyxHQUFHO0FBQUEsSUFDWixLQUFLLGlCQUFpQjtBQUFBLElBQ3RCLEtBQUssb0JBQW9CO0FBQUEsSUFDekIsS0FBSyxpQkFBaUI7QUFBQSxJQUN0QixLQUFLLGlCQUFpQjtBQUFBLElBQ3RCLEtBQUssY0FBYztBQUFBLElBQ25CLEtBQUssZUFBZTtBQUFBLElBQ3BCLEtBQUssV0FBVztBQUFBLElBQ2hCLEtBQUsscUJBQXFCO0FBQUEsSUFDMUIsS0FBSyx5QkFBeUI7QUFBQSxJQUM5QixLQUFLLHFCQUFxQjtBQUFBLElBQzFCLEtBQUssbUJBQW1CO0FBQUEsSUFDeEIsS0FBSyxnQkFBZ0IsQ0FBQztBQUFBLElBQ3RCLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDckIsS0FBSyxlQUFlLElBQUk7QUFBQSxJQUN4QixLQUFLLFdBQVc7QUFBQSxJQUNoQixLQUFLLHFCQUFxQjtBQUFBLElBRTFCLEtBQUssS0FBSztBQUFBO0FBQUEsT0FHTixLQUFJLEdBQUc7QUFBQSxJQUNYLE1BQU0sS0FBSyxxQkFBcUI7QUFBQSxJQUNoQyxLQUFLLGtCQUFrQjtBQUFBLElBQ3ZCLEtBQUssZUFBZTtBQUFBLElBRXBCLGtCQUFTLG1CQUFtQixLQUFLLGFBQWEsS0FBSyxJQUFJLENBQUM7QUFBQTtBQUFBLE9BR3BELHFCQUFvQixHQUFHO0FBQUEsSUFDM0IsSUFBSSxXQUFXLE1BQU0sa0JBQVMsZUFBZTtBQUFBLElBQzdDLElBQUksQ0FBQyxTQUFTLGNBQWM7QUFBQSxNQUMxQixJQUFJLGVBQWUsT0FBTyw0QkFBNEI7QUFBQSxNQUN0RCxJQUFJLGNBQWM7QUFBQSxRQUNoQixPQUFPLFFBQVEsS0FBSyxJQUFJLEVBQUUsYUFBYSxDQUFDO0FBQUEsTUFDMUMsRUFBTztBQUFBLFFBQ0wsTUFBTSwwREFBMEQ7QUFBQTtBQUFBLElBRXBFO0FBQUEsSUFDQSxNQUFNLFdBQ0osU0FBUyxnQkFDUixTQUFTLGFBQ04sZUFDQSxTQUFTLGFBQ1AsU0FDQTtBQUFBLElBQ1IsSUFBSSxhQUFhLGdCQUFnQixDQUFDLFNBQVMsWUFBWTtBQUFBLE1BQ3JELElBQUksYUFBYSxPQUFPLGdDQUFnQztBQUFBLE1BQ3hELElBQUksWUFBWTtBQUFBLFFBQ2QsT0FBTyxRQUFRLEtBQUssSUFBSSxFQUFFLFdBQVcsQ0FBQztBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBO0FBQUEsRUFHRixpQkFBaUIsR0FBRztBQUFBLElBQ2xCLEtBQUssZUFBZSxvQkFBVyxtQkFBbUI7QUFBQSxJQUNsRCxJQUFJLEtBQUssY0FBYztBQUFBLE1BQ3JCLEtBQUssV0FBVyxLQUFLLGFBQWEsV0FBVztBQUFBLElBQy9DO0FBQUE7QUFBQSxFQUdGLGNBQWMsR0FBRztBQUFBLElBRWYsSUFDRSxzQkFBYSxlQUFlLEtBQzVCLENBQUMsU0FBUyxlQUFlLGdCQUFnQixHQUN6QztBQUFBLE1BQ0Esa0JBQVMsaUJBQWlCLEtBQUssYUFBYSxLQUFLLElBQUksQ0FBQztBQUFBLElBQ3hEO0FBQUE7QUFBQSxFQUdGLHVCQUF1QixHQUFHO0FBQUEsSUFFeEIsS0FBSyxvQkFBb0Isc0JBQWEsZ0JBQ3BDLHNCQUFhLHFCQUFxQixDQUNwQztBQUFBLElBQ0EsS0FBSyxpQkFBaUIsc0JBQWEsZ0JBQ2pDLHNCQUFhLGtCQUFrQixDQUNqQztBQUFBO0FBQUEsT0FHSSxxQkFBb0IsR0FBRztBQUFBLElBRTNCLElBQUksS0FBSywwQkFBMEIsS0FBSyxhQUFhO0FBQUEsTUFDbkQsUUFBUSxJQUFJLDZDQUE2QztBQUFBLE1BQ3pEO0FBQUEsSUFDRjtBQUFBLElBR0EsTUFBTSxVQUFVLHNCQUFhLGVBQWUsS0FBSyxLQUFLO0FBQUEsSUFDdEQsSUFBSSxZQUFZLEtBQUssb0JBQW9CO0FBQUEsTUFDdkMsUUFBUSxJQUFJLDJDQUEyQztBQUFBLE1BQ3ZEO0FBQUEsSUFDRjtBQUFBLElBRUEsSUFBSSxDQUFDLEtBQUsscUJBQXFCLEtBQUssa0JBQWtCLEtBQUssTUFBTSxJQUFJO0FBQUEsTUFDbkUsUUFBUSxJQUFJLDJDQUEyQztBQUFBLE1BQ3ZEO0FBQUEsSUFDRjtBQUFBLElBRUEsS0FBSyx5QkFBeUI7QUFBQSxJQUM5QixLQUFLLHFCQUFxQjtBQUFBLElBRTFCLElBQUk7QUFBQSxNQUNGLGtCQUFTLHFCQUFxQjtBQUFBLE1BRTlCLElBQUksb0JBQW1DO0FBQUEsTUFDdkMsSUFBSTtBQUFBLFFBQ0Ysb0JBQXFCLE1BQU0sa0JBQVMsY0FDbEMsS0FBSyxpQkFDUDtBQUFBLFFBQ0EsT0FBTyxhQUFhO0FBQUEsUUFDcEIsUUFBUSxLQUNOLHNGQUNBLFdBQ0Y7QUFBQTtBQUFBLE1BSUYsTUFBTSxXQUFXLE1BQU0sa0JBQVMsZUFBZTtBQUFBLE1BQy9DLFFBQVEsY0FBYyxnQkFBZ0Isa0JBQVMsaUJBQzdDLEtBQUssbUJBQ0wsS0FBSyxnQkFDTCxTQUFTLFNBQ1QsU0FBUyxrQkFDVCxTQUFTLGlCQUFpQixLQUFLLGNBQWMsS0FBSztBQUFBLENBQUksSUFBSSxJQUMxRCxTQUFTLGtCQUFrQixzQkFBYSxZQUFZLEVBQUUsS0FBSztBQUFBLENBQUksSUFBSSxJQUNuRSxtQkFDQSxTQUFTLFVBQ1QsU0FBUyxZQUNYO0FBQUEsTUFFQSxRQUFRLElBQUksMkJBQTJCLFlBQVk7QUFBQSxNQUNuRCxRQUFRLElBQUksMEJBQTBCLFdBQVc7QUFBQSxNQUVqRCxNQUFNLFNBQVMsTUFBTSxrQkFBUyxRQUFRLGNBQWMsYUFBYSxRQUFRO0FBQUEsTUFFekUsUUFBUSxJQUFJLHFCQUFxQixNQUFNO0FBQUEsTUFFdkMsS0FBSyxjQUFjLEtBQUssTUFBTTtBQUFBLE1BRTlCLElBQUksWUFBWSxDQUFDO0FBQUEsTUFDakIsTUFBTSxXQUNKLFNBQVMsZ0JBQ1IsU0FBUyxhQUNOLGVBQ0EsU0FBUyxhQUNQLFNBQ0E7QUFBQSxNQUVSLElBQUksYUFBYSxjQUFjO0FBQUEsUUFDN0IsSUFBSSxDQUFDLFNBQVMsWUFBWTtBQUFBLFVBQ3hCLE1BQU0sSUFBSSxNQUNSLHlFQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0EsTUFBTSxRQUFRLFNBQVMsV0FBVztBQUFBLFFBQ2xDLE1BQU0sS0FBSyxhQUFhLFdBQVcsUUFBUSxTQUFTLFlBQVksS0FBSztBQUFBLFFBQ3JFLFlBQVk7QUFBQSxVQUNWLFdBQVcsS0FBSyxhQUFhLE9BQU87QUFBQSxRQUN0QztBQUFBLE1BQ0YsRUFBTyxTQUFJLGFBQWEsUUFBUTtBQUFBLFFBQzlCLElBQUksQ0FBQyxTQUFTLFlBQVk7QUFBQSxVQUN4QixNQUFNLElBQUksTUFDUixzRUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFlBQVksTUFBTSxrQkFBUyxZQUN6QixRQUNBLFNBQVMsWUFDVCxTQUFTLFNBQ1QsU0FBUyxVQUNYO0FBQUEsTUFDRixFQUFPO0FBQUEsUUFFTCxJQUFJLE9BQU8sU0FBUyxXQUFXLEtBQUs7QUFBQSxRQUVwQyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUssS0FBSyxNQUFNLEdBQUcsRUFBRSxTQUFTLEdBQUc7QUFBQSxVQUNwRCxPQUFPLEtBQUssTUFBTSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFBQSxRQUM3QztBQUFBLFFBRUEsTUFBTSxLQUFLLFVBQVUsV0FBVyxRQUFRLElBQUk7QUFBQSxRQUM1QyxZQUFZO0FBQUEsVUFDVixXQUFXLEtBQUssVUFBVSxPQUFPO0FBQUEsUUFFbkM7QUFBQTtBQUFBLE1BSUYsa0JBQVMsY0FDUCxLQUFLLG1CQUNMLEtBQUssZ0JBQ0wsTUFDRjtBQUFBLE1BRUEsS0FBSyxxQkFBcUI7QUFBQSxNQUUxQixrQkFBUyxxQkFBcUI7QUFBQSxNQUM5QixPQUFPLE9BQVk7QUFBQSxNQUNuQixRQUFRLE1BQU0sb0NBQW9DLEtBQUs7QUFBQSxNQUN2RCxrQkFBUyxxQkFBcUI7QUFBQSxNQUM5QixrQkFBUyxpQkFBaUIsTUFBTSxPQUFPO0FBQUEsY0FDdkM7QUFBQSxNQUNBLEtBQUsseUJBQXlCO0FBQUE7QUFBQTtBQUFBLE9BSTVCLGlCQUFnQixHQUFHO0FBQUEsSUFDdkIsTUFBTSxZQUFZLEtBQUssb0JBQW9CO0FBQUEsSUFFM0MsSUFBSSxDQUFDLFdBQVc7QUFBQSxNQUNkLFFBQVEsTUFBTSxrQ0FBa0M7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxJQUVBLElBQUksS0FBSyxhQUFhO0FBQUEsTUFDcEIsUUFBUSxJQUFJLGlDQUFpQztBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUFBLElBRUEsS0FBSyxjQUFjO0FBQUEsSUFFbkIsTUFBTSxRQUFRLHNCQUFhLGdCQUFnQjtBQUFBLElBQzNDLElBQUk7QUFBQSxNQUNGLElBQUksQ0FBQyxPQUFPO0FBQUEsUUFDVixRQUFRLE1BQU0scUNBQXFDO0FBQUEsUUFDbkQsS0FBSyxjQUFjO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsTUFHQSxLQUFLLGlCQUFpQixNQUFNLG9CQUFXLFdBQVcsT0FBTyxHQUFHO0FBQUEsTUFHNUQsUUFBUSxPQUFPLGFBQWEsb0JBQVcsWUFBWSxTQUFTO0FBQUEsTUFFNUQsTUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsUUFDcEMsS0FBSyx3QkFBd0IsT0FBTyxRQUFRO0FBQUEsT0FDN0M7QUFBQSxNQUVELE1BQU0saUJBQWlCLFNBQVMsQ0FBQyxVQUFVO0FBQUEsUUFDekMsUUFBUSxNQUFNLGdCQUFnQixLQUFLO0FBQUEsUUFDbkMsS0FBSyx3QkFBd0IsT0FBTyxRQUFRO0FBQUEsT0FDN0M7QUFBQSxNQUdELE1BQU0sb0JBQVcsVUFBVSxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVU7QUFBQSxRQUNqRCxRQUFRLE1BQU0sMEJBQTBCLEtBQUs7QUFBQSxRQUM3QyxLQUFLLHdCQUF3QixPQUFPLFFBQVE7QUFBQSxPQUM3QztBQUFBLE1BQ0QsT0FBTyxPQUFPO0FBQUEsTUFDZCxRQUFRLE1BQU0sZ0NBQWdDLEtBQUs7QUFBQSxNQUNuRCxLQUFLLGNBQWM7QUFBQSxNQUduQixJQUFJLE9BQU87QUFBQSxRQUNULE1BQU0sb0JBQVcsY0FBYyxPQUFPLEtBQUssY0FBYztBQUFBLE1BQzNEO0FBQUEsY0FDQTtBQUFBLE1BQ0EsS0FBSyxxQkFBcUI7QUFBQTtBQUFBO0FBQUEsT0FJeEIsd0JBQXVCLENBQUMsT0FBeUIsVUFBa0I7QUFBQSxJQUV2RSxNQUFNLG9CQUFXLGNBQWMsT0FBTyxLQUFLLGNBQWM7QUFBQSxJQUd6RCxJQUFJLFVBQVU7QUFBQSxNQUNaLElBQUksZ0JBQWdCLFFBQVE7QUFBQSxJQUM5QjtBQUFBLElBRUEsS0FBSyxjQUFjO0FBQUEsSUFDbkIsUUFBUSxJQUFJLGlDQUFpQztBQUFBO0FBQUEsT0FHekMsYUFBWSxHQUFHO0FBQUEsSUFDbkIsS0FBSyxpQkFBaUIsQ0FBQyxLQUFLO0FBQUEsSUFDNUIsa0JBQVMsbUJBQW1CLEtBQUssY0FBYztBQUFBLElBRS9DLElBQUksS0FBSyxnQkFBZ0I7QUFBQSxNQUN2QixNQUFNLEtBQUssWUFBWTtBQUFBLElBQ3pCLEVBQU87QUFBQSxNQUNMLEtBQUssV0FBVztBQUFBO0FBQUE7QUFBQSxPQUlkLFlBQVcsR0FBRztBQUFBLElBQ2xCLEtBQUssd0JBQXdCO0FBQUEsSUFDN0IsS0FBSyx5QkFBeUI7QUFBQTtBQUFBLEVBR2hDLFVBQVUsR0FBRztBQUFBLElBQ1gsS0FBSyxpQkFBaUI7QUFBQSxJQUN0QixLQUFLLGNBQWM7QUFBQSxJQUNuQixLQUFLLHlCQUF5QjtBQUFBLElBQzlCLEtBQUsscUJBQXFCO0FBQUEsSUFDMUIsa0JBQVMsbUJBQW1CLEtBQUs7QUFBQSxJQUdqQyxJQUFJLEtBQUssb0JBQW9CO0FBQUEsTUFDM0IsYUFBYSxLQUFLLGtCQUFrQjtBQUFBLE1BQ3BDLEtBQUsscUJBQXFCO0FBQUEsSUFDNUI7QUFBQSxJQUVBLGNBQWMsS0FBSyxnQkFBZ0I7QUFBQSxJQUduQyxrQkFBUyxxQkFBcUI7QUFBQSxJQUU5QixRQUFRLElBQUksZ0NBQWdDO0FBQUE7QUFBQSxFQUc5Qyx3QkFBd0IsR0FBRztBQUFBLElBSXpCLE1BQU0scUJBQXFCLE1BQU07QUFBQSxNQUMvQixRQUFRLElBQUksMkJBQTJCO0FBQUEsTUFDdkMsTUFBTSxRQUFRLFNBQVMsY0FBYyxPQUFPO0FBQUEsTUFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLO0FBQUEsUUFBZ0I7QUFBQSxNQUVwQyxNQUFNLGdCQUFnQixNQUFNLFdBQVcsTUFBTTtBQUFBLE1BRzdDLElBQ0UsTUFBTSxjQUFjLE1BQ3BCLENBQUMsS0FBSywwQkFDTixDQUFDLEtBQUssb0JBQ047QUFBQSxRQUNBLEtBQUssd0JBQXdCO0FBQUEsUUFDN0IsS0FBSyxxQkFBcUI7QUFBQSxNQUM1QjtBQUFBLE1BR0EsSUFDRSxpQkFBaUIsTUFDakIsQ0FBQyxLQUFLLGVBQ04sQ0FBQyxLQUFLLHdCQUNOO0FBQUEsUUFDQSxLQUFLLGlCQUFpQjtBQUFBLE1BQ3hCO0FBQUE7QUFBQSxJQUlGLE1BQU0sMEJBQTBCLE1BQU07QUFBQSxNQUNwQyxJQUFJLEtBQUssa0JBQWtCO0FBQUEsUUFDekIsY0FBYyxLQUFLLGdCQUFnQjtBQUFBLE1BQ3JDO0FBQUEsTUFDQSxLQUFLLG1CQUFtQixZQUFZLG9CQUFvQixJQUFJO0FBQUE7QUFBQSxJQU05RCxJQUFJLEtBQUssZ0JBQWdCO0FBQUEsTUFDdkIsd0JBQXdCO0FBQUEsSUFDMUI7QUFBQTtBQUVKO0FBR0EsT0FBTyxRQUFRLFVBQVUsWUFBWSxDQUFDLFNBQVMsU0FBUyxpQkFBaUI7QUFBQSxFQUN2RSxJQUNFLFNBQVMsV0FBVywwQkFDcEIsU0FBUyxXQUFXLG9CQUNwQjtBQUFBLElBQ0EsTUFBTSxLQUFNLE9BQWU7QUFBQSxJQUMzQixJQUFJLENBQUMsSUFBSTtBQUFBLE1BQ1AsYUFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLHlDQUF5QyxDQUFDO0FBQUEsTUFDaEYsT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLE1BQU0sS0FDSixRQUFRLFdBQVcseUJBQ2YsR0FBRyxxQkFBcUIsS0FBSyxFQUFFLElBQy9CLEdBQUcsaUJBQWlCLEtBQUssRUFBRTtBQUFBLElBQ2pDLEdBQUcsRUFDQSxLQUFLLE1BQU0sYUFBYSxFQUFFLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFDMUMsTUFBTSxDQUFDLFFBQ04sYUFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLEtBQUssV0FBVyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQ3JFO0FBQUEsSUFDRixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLENBQ1I7QUFHRCxJQUFJLFNBQVMsZUFBZSxXQUFXO0FBQUEsRUFDckMsU0FBUyxpQkFBaUIsb0JBQW9CLE1BQU07QUFBQSxJQUNsRCxNQUFNLFlBQVksSUFBSTtBQUFBLElBQ3JCLE9BQWUsWUFBWTtBQUFBLElBQzVCLFFBQVEsSUFBSSxTQUFTO0FBQUEsR0FDdEI7QUFDSCxFQUFPO0FBQUEsRUFDTCxNQUFNLFlBQVksSUFBSTtBQUFBLEVBQ3JCLE9BQWUsWUFBWTtBQUFBLEVBQzVCLFFBQVEsSUFBSSxTQUFTO0FBQUE7IiwKICAiZGVidWdJZCI6ICJDQzQxQTNEQTVDMTI0NERBNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
