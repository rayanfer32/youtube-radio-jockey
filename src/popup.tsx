import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef, type PointerEvent, type KeyboardEvent } from "react";
import APIUtils from "./utils/api-utils";
import { FishAudioTTS } from "./utils/fish-audio";
import { GoogleTTS } from "./utils/google-tts";

export interface Settings {
  geminiApiKey: string;
  murfApiKey: string;
  fishApiKey: string;
  openRouterApiKey: string;
  openRouterModel: string;
  llmProvider: "openrouter" | "chatjimmy" | "gemini";
  ttsProvider: "fish-audio" | "google-tts" | "murf";
  rjStyle: string;
  commentaryLength: string;
  customSystemPrompt: string;
  includeJokes: boolean;
  includeAdvertisements: boolean;
  extraContentFrequency: number;
  voiceId: string;
  voiceStyle: string;
  includeHistory: boolean;
  includeComments: boolean;
  autoStart: boolean;
  volumeDucking: number;
  loggingEnabled: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  generateAfterSeconds: number;
  playBeforeEndSeconds: number;
  setupComplete: boolean;
  hostName: string;
  radioStation: string;
}

type TabType = "PERSONA" | "TTS" | "LLM" | "DIAGNOSTICS";
type KnobValue = string | number;

function RotaryKnob({
  label,
  options,
  value,
  valueLabel,
  accent = "#00D2C4",
  onChange,
}: {
  label: string;
  options: KnobValue[];
  value: KnobValue;
  valueLabel: string;
  accent?: string;
  onChange: (value: KnobValue) => void;
}) {
  const drag = useRef<{ startY: number; startIndex: number } | null>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));
  const range = Math.max(1, options.length - 1);
  const progress = selectedIndex / range;
  const angle = -135 + progress * 270;
  const arcOffset = 144 * (1 - progress);

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const steps = Math.trunc((drag.current.startY - event.clientY) / 18);
    const nextIndex = Math.max(0, Math.min(options.length - 1, drag.current.startIndex + steps));
    if (options[nextIndex] !== value) onChange(options[nextIndex]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = selectedIndex;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") nextIndex += 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") nextIndex -= 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else return;
    event.preventDefault();
    nextIndex = Math.max(0, Math.min(options.length - 1, nextIndex));
    onChange(options[nextIndex]);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={options.length - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={valueLabel}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startY: event.clientY, startIndex: selectedIndex };
      }}
      onPointerMove={updateFromPointer}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      className="flex flex-col items-center group cursor-ns-resize rounded outline-none focus-visible:ring-2 focus-visible:ring-white/80 touch-none select-none"
      title={`${label}: drag up or down to adjust; use arrow keys for fine control`}
      style={{ touchAction: "none" }}
    >
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60" aria-hidden="true">
          <circle cx="30" cy="30" r="23" stroke="#252830" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" />
          <circle cx="30" cy="30" r="23" stroke={accent} strokeWidth="3" fill="none" strokeDasharray="145" strokeDashoffset={arcOffset} strokeLinecap="round" className="filter drop-shadow-[0_0_4px_rgba(0,210,196,0.65)] transition-all duration-100" />
        </svg>
        <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2d34] via-[#1a1b1f] to-[#0c0d0f] border border-neutral-600 knob-radial-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center relative">
            <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
              <div className="absolute -left-px bottom-0 w-0.5 h-[14px] rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: accent, color: accent }} />
            </div>
            <div className="w-3 h-3 rounded-full bg-[#111215] border border-neutral-700" />
          </div>
        </div>
      </div>
      <div className="w-full mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-1.5 py-1 text-center font-mono ni-recessed transition-colors group-hover:border-white/30">
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate font-semibold">{label}</div>
        <div className="text-[12px] font-bold truncate" style={{ color: accent }}>{valueLabel}</div>
      </div>
    </div>
  );
}

export default function Popup() {
  const [settings, setSettings] = useState<Settings>({
    geminiApiKey: "",
    murfApiKey: "",
    fishApiKey: "",
    openRouterApiKey: "",
    openRouterModel: "recursive/flint-v1.0:free",
    llmProvider: "openrouter",
    ttsProvider: "fish-audio",
    rjStyle: "sarcastic",
    commentaryLength: "short",
    customSystemPrompt: "",
    includeJokes: true,
    includeAdvertisements: true,
    extraContentFrequency: 50,
    voiceId: "ba1a38946dea44609fc4a8fe6113ed88",
    voiceStyle: "Promo",
    includeHistory: false,
    includeComments: false,
    autoStart: false,
    volumeDucking: 50,
    loggingEnabled: true,
    logLevel: "warn",
    generateAfterSeconds: 10,
    playBeforeEndSeconds: 30,
    setupComplete: false,
    hostName: "Alexis",
    radioStation: "97.7 Youtube FM",
  });

  const [activeTab, setActiveTab] = useState<TabType>("PERSONA");
  const [isOnAir, setIsOnAir] = useState(false);
  const [rjStatus, setRjStatus] = useState("standby");
  const [rjStatusMessage, setRjStatusMessage] = useState("RJ mode is off");
  const [editingStation, setEditingStation] = useState(false);
  const [editingHost, setEditingHost] = useState(false);
  const [showKeys, setShowKeys] = useState({ gemini: false, fish: false, murf: false, openrouter: false });

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [providerTests, setProviderTests] = useState<Record<string, { success: boolean; at: string; provider: string }>>({});
  const [exportOptions, setExportOptions] = useState({ titles: true, scripts: true, timestamps: true });

  const mainRef = useRef<HTMLElement>(null);
  const restoreScrollTop = useRef(0);
  const scrollSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupPreferencesLoaded = useRef(false);
  const settingsLoaded = useRef(false);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"saved" | "saving" | "error">("saved");

  const checkScroll = () => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      setShowScrollCue(scrollHeight - scrollTop - clientHeight > 35);
      restoreScrollTop.current = scrollTop;
      if (scrollSaveTimer.current) clearTimeout(scrollSaveTimer.current);
      scrollSaveTimer.current = setTimeout(
        () => chrome.storage.local.set({ popupScrollTop: restoreScrollTop.current }),
        180
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [activeTab, settings]);

  // Load settings from chrome.storage
  useEffect(() => {
    chrome.storage.sync.get(settings, (stored) => {
      setSettings((prev) => ({
        ...prev,
        ...stored,
        llmProvider: stored.llmProvider || "openrouter",
        openRouterModel: stored.openRouterModel || "recursive/flint-v1.0:free",
        ttsProvider: stored.ttsProvider || "fish-audio",
        voiceId: stored.voiceId || (stored.ttsProvider === "murf" ? "en-US-natalie" : "ba1a38946dea44609fc4a8fe6113ed88"),
        hostName: stored.hostName || "Alexis",
        radioStation: stored.radioStation || "97.7 Youtube FM",
      }));
      settingsLoaded.current = true;
    });
    chrome.storage.local.get(["popupActiveTab", "popupScrollTop", "providerTests"], (local) => {
      if (local.popupActiveTab) setActiveTab(local.popupActiveTab as TabType);
      restoreScrollTop.current = local.popupScrollTop || 0;
      setProviderTests(local.providerTests || {});
      popupPreferencesLoaded.current = true;
      requestAnimationFrame(() => {
        if (mainRef.current) {
          mainRef.current.scrollTop = restoreScrollTop.current;
          checkScroll();
        }
      });
    });
    void refreshRJStatus();
    const onMessage = (message: any) => {
      if (message?.action === "rjStatusChanged") {
        setRjStatus(message.status || "standby");
        setRjStatusMessage(message.message || "");
        if (typeof message.active === "boolean") setIsOnAir(message.active);
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  useEffect(() => {
    if (!popupPreferencesLoaded.current) return;
    chrome.storage.local.set({ popupActiveTab: activeTab });
    requestAnimationFrame(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = restoreScrollTop.current;
        checkScroll();
      }
    });
  }, [activeTab]);

  const refreshRJStatus = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      const response: any = await chrome.tabs.sendMessage(tab.id, { action: "getRJStatus" });
      if (response?.success) {
        setIsOnAir(response.active);
        setRjStatus(response.status || (response.active ? "waiting" : "standby"));
        setRjStatusMessage(response.message || "");
      }
    } catch {
      setIsOnAir(false);
      setRjStatus("standby");
    }
  };

  const recordProviderTest = (service: string, provider: string, success: boolean) => {
    setProviderTests((current) => {
      const next = { ...current, [service]: { provider, success, at: new Date().toISOString() } };
      chrome.storage.local.set({ providerTests: next });
      return next;
    });
  };

  const toggleRJMode = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("No active tab found.");
      const response: any = await chrome.tabs.sendMessage(tab.id, { action: "toggleRJMode" });
      if (!response?.success) throw new Error(response?.error || "Could not toggle RJ mode.");
      setIsOnAir(response.active);
      setRjStatus(response.status || (response.active ? "waiting" : "standby"));
      setRjStatusMessage(response.message || (response.active ? "Waiting for the next track" : "RJ mode is off"));
    } catch (error: any) {
      showStatus(error?.message || "Open YouTube or YouTube Music to control RJ mode.", "error");
      setIsOnAir(false);
    }
  };

  const showStatus = (message: string, type: "success" | "error") => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3500);
  };

  useEffect(() => {
    if (!settingsLoaded.current) return;
    setAutoSaveState("saving");
    const timer = setTimeout(() => {
      chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          setAutoSaveState("error");
          showStatus("Autosave failed: " + chrome.runtime.lastError.message, "error");
        } else {
          setAutoSaveState("saved");
        }
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [settings]);

  const exportLogs = () => {
    chrome.storage.local.get(["commentaryLogs"], (result) => {
      const logsData = (result.commentaryLogs || []).map((entry: any) => ({
        ...(exportOptions.timestamps ? { timestamp: entry.timestamp } : {}),
        ...(exportOptions.titles ? { currentSong: entry.currentSong, nextSong: entry.nextSong } : {}),
        ...(exportOptions.scripts ? { script: entry.script } : {}),
      }));
      const blob = new Blob([JSON.stringify(logsData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `youtube-rj-logs-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus("Commentary logs exported", "success");
    });
  };

  const clearSessionLogs = () => {
    chrome.storage.local.set({ commentaryLogs: [] }, () => {
      showStatus("Commentary session logs cleared", "success");
    });
  };

  const testLyrics = async (): Promise<boolean> => {
    setIsTesting(true);
    setTestResult("Connecting to LRCLIB API: querying 'Kalax - Out of Time'...");
    try {
      const lyrics = await APIUtils.callLyricsAPI("Kalax - Out of Time");
      setTestResult(
        lyrics ? "✅ LRCLIB 200 OK: Lyrics retrieved successfully." : "⚠️ LRCLIB 200 OK: Track found but no synced lyrics."
      );
      recordProviderTest("lyrics", "LRCLIB", true);
      return true;
    } catch (e: any) {
      setTestResult("❌ LRCLIB Error: " + (e?.message || e));
      recordProviderTest("lyrics", "LRCLIB", false);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const testTTS = async (): Promise<boolean> => {
    setIsTesting(true);
    const provider = settings.ttsProvider || "fish-audio";
    setTestResult(`Initializing ${provider.toUpperCase()} TTS synthesis pipeline...`);
    try {
      if (provider === "fish-audio") {
        if (!settings.fishApiKey) {
          setTestResult("❌ Fish Audio API Key missing in CLOUD APIS tab");
          recordProviderTest("tts", provider, false);
          return false;
        }
        const tts = new FishAudioTTS();
        await tts.synthesize(
          "[excited] Live from the control room. This is your YouTube Radio Jockey speaking!",
          settings.fishApiKey,
          settings.voiceId || "ba1a38946dea44609fc4a8fe6113ed88"
        );
        const audioBlob = tts.toBlob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
        setTestResult("✅ Fish Audio: Audio stream decoded and playing.");
        recordProviderTest("tts", provider, true);
      } else if (provider === "murf") {
        if (!settings.murfApiKey) {
          setTestResult("❌ Murf.ai API Key missing in CLOUD APIS tab");
          recordProviderTest("tts", provider, false);
          return false;
        }
        const data = await APIUtils.callMurfAPI(
          "Welcome to the broadcast. This is a test of Murf.ai studio synthesis.",
          settings.murfApiKey,
          settings.voiceId || "en-US-natalie",
          settings.voiceStyle || "Promo"
        );
        const url = URL.createObjectURL(data.audioBlob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
        setTestResult("✅ Murf.ai: Audio stream synthesized and playing.");
        recordProviderTest("tts", provider, true);
      } else {
        const tts = new GoogleTTS();
        await tts.synthesize("Live from the control room. This is your YouTube Radio Jockey speaking!", settings.voiceId || "en");
        const url = URL.createObjectURL(tts.toBlob());
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
        setTestResult("✅ Google TTS: audio synthesized and playing.");
        recordProviderTest("tts", provider, true);
      }
      return true;
    } catch (e: any) {
      setTestResult("❌ TTS Synthesis Error: " + (e?.message || e));
      recordProviderTest("tts", provider, false);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const testLLM = async (): Promise<boolean> => {
    setIsTesting(true);
    const provider = settings.llmProvider || "openrouter";
    setTestResult(`Dispatching test prompt to ${provider.toUpperCase()} LLM...`);

    try {
      if (provider === "openrouter") {
        if (!settings.openRouterApiKey) {
          setTestResult("❌ OpenRouter API Key missing in CLOUD APIS tab");
          recordProviderTest("llm", provider, false);
          return false;
        }
        const response = await APIUtils.callOpenRouterAPI(
          "You are a witty radio DJ.",
          "Say hello as a radio DJ in one punchy sentence.",
          settings.openRouterApiKey,
          settings.openRouterModel
        );
        setTestResult(`✅ OpenRouter (${settings.openRouterModel}): ${response}`);
        recordProviderTest("llm", provider, true);
      } else if (provider === "gemini") {
        if (!settings.geminiApiKey) {
          setTestResult("❌ Gemini API Key missing in CLOUD APIS tab");
          recordProviderTest("llm", provider, false);
          return false;
        }
        const response = await APIUtils.callGeminiAPI(
          "Say hello as a radio DJ in one punchy sentence.",
          settings.geminiApiKey
        );
        setTestResult("✅ Gemini: " + response);
        recordProviderTest("llm", provider, true);
      } else {
        const response = await APIUtils.callChatJimmyAPI(
          "You are a witty radio DJ.",
          "Say hello as a radio DJ in one punchy sentence."
        );
        setTestResult("✅ ChatJimmy: " + response);
        recordProviderTest("llm", provider, true);
      }
      return true;
    } catch (e: any) {
      setTestResult("❌ LLM Error: " + (e?.message || e));
      recordProviderTest("llm", provider, false);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const triggerGenerateRJCommentary = async () => {
    setIsTesting(true);
    setTestResult("Dispatching generateRJCommentary to active YouTube tab...");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setTestResult("❌ No active tab found.");
        return;
      }
      const response: any = await chrome.tabs.sendMessage(tab.id, {
        action: "generateRJCommentary",
      });
      setTestResult(
        response?.success
          ? "✅ generateRJCommentary triggered on active tab."
          : "❌ " + (response?.error || "Failed to trigger generateRJCommentary.")
      );
    } catch (e: any) {
      setTestResult("❌ " + (e?.message || e));
    } finally {
      setIsTesting(false);
    }
  };

  const triggerPlayRJCommentary = async () => {
    setIsTesting(true);
    setTestResult("Dispatching playRJCommentary to active YouTube tab...");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setTestResult("❌ No active tab found.");
        return;
      }
      const response: any = await chrome.tabs.sendMessage(tab.id, {
        action: "playRJCommentary",
      });
      setTestResult(
        response?.success
          ? "✅ playRJCommentary triggered on active tab."
          : "❌ " + (response?.error || "Failed to trigger playRJCommentary.")
      );
    } catch (e: any) {
      setTestResult("❌ " + (e?.message || e));
    } finally {
      setIsTesting(false);
    }
  };

  const testCommentary = async () => {
    setIsTesting(true);
    setTestResult("Generating a one-off commentary preview for the current video...");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("No active tab found.");
      const response: any = await chrome.tabs.sendMessage(tab.id, { action: "testCommentary" });
      if (!response?.success) throw new Error(response?.error || "Commentary preview failed.");
      setTestResult("✅ Test commentary generated and played.");
    } catch (error: any) {
      setTestResult("❌ " + (error?.message || String(error)));
    } finally {
      setIsTesting(false);
    }
  };

  const runSetupChecks = async () => {
    const llmOkay = await testLLM();
    const ttsOkay = await testTTS();
    if (llmOkay && ttsOkay) {
      const completeSettings = { ...settings, setupComplete: true };
      setSettings(completeSettings);
      chrome.storage.sync.set(completeSettings);
      showStatus("Station setup complete", "success");
    }
  };

  // Rotary encoder value ranges
  const stylesList = ["sarcastic", "energetic", "chill", "professional"];
  const lengthsList = ["short", "medium", "long"];
  const enginesList: Settings["ttsProvider"][] = ["fish-audio", "murf", "google-tts"];
  const duckingOptions = Array.from({ length: 11 }, (_, index) => index * 10);
  const generateTimingOptions = [5, 10, 15, 20, 30];
  const playTimingOptions = [15, 20, 30, 40, 50, 60];
  const duckingDb = -Math.round((settings.volumeDucking / 100) * 24);

  return (
    <div className="w-[520px] h-[590px] max-h-[590px] bg-[#121316] border border-[#272B33] rounded-lg overflow-hidden ni-metal-bevel flex flex-col justify-between relative text-sm text-slate-100 select-none font-sans">

      {/* Top Hardware Fasteners Accent Strip */}
      <div className="h-1 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 w-full border-b border-[#272B33]/60 flex justify-between px-3 items-center flex-shrink-0">
        <div className="w-2 h-0.5 bg-neutral-900 rounded-full"></div>
        <div className="w-2 h-0.5 bg-neutral-900 rounded-full"></div>
      </div>

      {/* Header Section */}
      <header className="px-3.5 py-2 bg-gradient-to-b from-[#1c1e23] to-[#181A1E] border-b border-[#272B33] flex-shrink-0">
        <div className="flex items-center justify-between gap-3">

          {/* Brand & Geometric NI Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0F1012] border border-[#272B33] rounded flex items-center justify-center shadow-inner relative group">
              <svg className="w-4.5 h-4.5 text-[#00D2C4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M16.5 7.5v.01" />
                <path d="M7.5 7.5v.01" />
              </svg>
              <div className="absolute inset-0 bg-[#00D2C4]/10 rounded pointer-events-none"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14.5px] tracking-widest text-slate-100 uppercase">YouTube RJ</span>
                <span className="text-[10.5px] px-1.5 py-0.5 bg-[#272B33] text-slate-200 font-mono font-bold rounded tracking-tight">KONTROL</span>
              </div>
              <p className="text-[10.5px] text-neutral-400 font-mono tracking-wider uppercase">Series-01 // Pro Broadcast</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master ON-AIR Light Switch */}
            <button
              id="onAirBtn"
              onClick={toggleRJMode}
              aria-label={isOnAir ? "Stop RJ mode" : "Start RJ mode"}
              className={`flex items-center gap-2 px-3 py-1 bg-[#141518] hover:bg-[#1a1c21] border rounded text-slate-100 transition-all active:scale-95 cursor-pointer ${isOnAir ? "border-[#00D2C4]/70 glow-cyan-subtle" : "border-neutral-700 opacity-60"
                }`}
            >
              <span className="relative flex h-2 w-2">
                {isOnAir && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2C4] opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnAir ? "bg-[#00D2C4] shadow-[0_0_6px_#00D2C4]" : "bg-neutral-500"}`}></span>
              </span>
              <span className={`font-mono font-bold tracking-widest text-[11.5px] ${isOnAir ? "text-[#00D2C4]" : "text-neutral-400"}`}>
                {isOnAir ? "ON AIR" : "STANDBY"}
              </span>
            </button>

            <span aria-live="polite" className={`text-[10px] font-mono ${autoSaveState === "error" ? "text-rose-400" : autoSaveState === "saving" ? "text-amber-300" : "text-neutral-500"}`}>
              {autoSaveState === "saving" ? "AUTOSAVING…" : autoSaveState === "error" ? "AUTOSAVE ERROR" : "AUTOSAVED"}
            </span>
          </div>
        </div>

        {/* High-Contrast OLED Sub-Display */}
        <div className="mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-3 py-1 flex items-center justify-between font-mono ni-recessed">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9E1B] animate-pulse"></span>
            <span className="text-neutral-400 text-[10.5px] tracking-wider uppercase font-semibold">TUNER:</span>
            <span className="text-[#FF9E1B] font-bold text-[12.5px] tracking-widest truncate max-w-[200px]">
              {settings.radioStation}
            </span>
          </div>
          <div className="flex items-center gap-2 border-l border-neutral-800 pl-3">
            <span className="text-neutral-400 text-[10.5px] tracking-wider uppercase font-semibold">HOST:</span>
            <span className="text-slate-100 font-bold text-[12.5px] tracking-wider uppercase truncate max-w-[140px]">
              {settings.hostName}
            </span>
            <span className="text-[10.5px] text-[#00D2C4] font-bold">[SYNCED]</span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-neutral-400" title={rjStatusMessage}>
          <span className={`w-1.5 h-1.5 rounded-full ${rjStatus === "error" ? "bg-rose-400" : rjStatus === "playing" ? "bg-[#00D2C4] animate-pulse" : "bg-neutral-500"}`}></span>
          <span>{rjStatus.toUpperCase()}</span>
          <span className="truncate">{rjStatusMessage || "Open a playlist to begin"}</span>
        </div>
      </header>

      {/* Module Selector Tabs (NI Instrument Bank Style) */}
      <nav className="bg-[#101114] border-b border-[#272B33] px-3 flex justify-between gap-2 py-1.5 text-[12.5px] font-mono tracking-wider font-semibold flex-shrink-0">
        {(["PERSONA", "TTS", "LLM", "DIAGNOSTICS"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-2 rounded-t flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === tab
              ? "bg-[#1F2227] text-[#00D2C4] border-b-2 border-[#00D2C4] shadow-inner font-bold"
              : "text-neutral-400 hover:text-slate-200 hover:bg-neutral-800/40"
              }`}
          >
            {activeTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4] shadow-[0_0_4px_#00D2C4]"></span>}
            <span>{tab}</span>
          </button>
        ))}
      </nav>

      {/* Center Deck */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
        <main
          ref={mainRef}
          onScroll={checkScroll}
          className="p-3 pb-10 bg-[#181A1E] flex-1 rack-scrollbar"
        >
          {/* TAB 1: PERSONA */}
          {activeTab === "PERSONA" && (
            <div className="space-y-3">
              {!settings.setupComplete && (
                <section className="bg-[#10201F] border border-[#00D2C4]/50 rounded p-3 space-y-2">
                  <div className="text-[12px] text-[#00D2C4] font-bold tracking-wider">FIRST-RUN STATION SETUP</div>
                  <p className="text-[11px] text-neutral-300">Choose your LLM and voice providers, add any required API keys, then run both checks to finish setup.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveTab("LLM")} className="rounded border border-[#343840] bg-[#0b1111] px-2 py-1.5 text-[10px] font-bold">1. LLM</button>
                    <button onClick={() => setActiveTab("TTS")} className="rounded border border-[#343840] bg-[#0b1111] px-2 py-1.5 text-[10px] font-bold">2. VOICE</button>
                    <button onClick={runSetupChecks} disabled={isTesting} className="rounded border border-[#00D2C4] text-[#00D2C4] px-2 py-1.5 text-[10px] font-bold disabled:opacity-50">3. TEST</button>
                  </div>
                  <div className="text-[10px] text-neutral-400">{settings.llmProvider.toUpperCase()} LLM · {settings.ttsProvider.toUpperCase()} voice</div>
                </section>
              )}

              {/* Signature NI 4-Macro Parameter Strip (Top Hardware Row) */}
              <section className="px-3.5 py-2.5 bg-gradient-to-b from-[#14161a] to-[#0F1012] border-b border-[#272B33] flex-shrink-0">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Macro Parameter Encoders</span>
                  <span className="text-[11px] font-mono text-[#00D2C4] tracking-wider font-bold">BANK 01/04</span>
                </div>

                {/* 4 Knobs Grid */}
                <div className="grid grid-cols-4 gap-3">

                  <RotaryKnob
                    label="STYLE"
                    options={stylesList}
                    value={settings.rjStyle}
                    valueLabel={settings.rjStyle.toUpperCase()}
                    onChange={(value) => setSettings((current) => ({ ...current, rjStyle: String(value) }))}
                  />
                  <RotaryKnob
                    label="DURATION"
                    options={lengthsList}
                    value={settings.commentaryLength}
                    valueLabel={`${settings.commentaryLength === "short" ? 25 : settings.commentaryLength === "medium" ? 35 : 50} SEC`}
                    onChange={(value) => setSettings((current) => ({ ...current, commentaryLength: String(value) }))}
                  />
                  <RotaryKnob
                    label="DUCKING"
                    options={duckingOptions}
                    value={Math.max(0, Math.min(100, Math.round(settings.volumeDucking / 10) * 10))}
                    valueLabel={`${-Math.round((settings.volumeDucking / 100) * 24)} dB (${settings.volumeDucking}%)`}
                    accent="#FF9E1B"
                    onChange={(value) => setSettings((current) => ({ ...current, volumeDucking: Number(value) }))}
                  />
                  <RotaryKnob
                    label="ENGINE"
                    options={enginesList}
                    value={settings.ttsProvider}
                    valueLabel={settings.ttsProvider === "fish-audio" ? "FISH AUDIO" : settings.ttsProvider === "murf" ? "MURF.AI" : "GOOGLE TTS"}
                    onChange={(value) => {
                      const nextEngine = value as Settings["ttsProvider"];
                      setSettings((current) => ({
                        ...current,
                        ttsProvider: nextEngine,
                        voiceId: nextEngine === "fish-audio" ? "ba1a38946dea44609fc4a8fe6113ed88" : nextEngine === "murf" ? "en-US-natalie" : "en-US",
                      }));
                    }}
                  />

                </div>
              </section>
              {/* Station & Host Identifiers */}
              <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                <div className="text-[11.5px] font-mono text-neutral-400 tracking-widest uppercase mb-2 flex items-center justify-between font-bold">
                  <span>BROADCAST IDENTITY // FREQ LOCK</span>
                  <span className="text-[#00D2C4] font-bold">STATUS: OK</span>
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono">
                  {/* Station Name */}
                  <div className="bg-[#08090A] border border-[#272B33] rounded px-3 py-2 flex flex-col justify-center">
                    <span className="text-[11px] text-neutral-400 tracking-wider uppercase font-semibold">STATION CALLSIGN</span>
                    {editingStation ? (
                      <input
                        type="text"
                        value={settings.radioStation}
                        autoFocus
                        onBlur={() => setEditingStation(false)}
                        onChange={(e) => setSettings({ ...settings, radioStation: e.target.value })}
                        className="bg-transparent text-slate-100 font-bold text-[13.5px] tracking-wide outline-none border-b border-[#00D2C4] py-0.5"
                      />
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-100 font-bold text-[13.5px] tracking-wide truncate">
                          {settings.radioStation}
                        </span>
                        <span
                          onClick={() => setEditingStation(true)}
                          className="material-symbols-outlined text-neutral-400 text-[16px] hover:text-[#00D2C4] cursor-pointer"
                          title="Click to edit station callsign"
                        >
                          edit
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Host Name */}
                  <div className="bg-[#08090A] border border-[#272B33] rounded px-3 py-2 flex flex-col justify-center">
                    <span className="text-[11px] text-neutral-400 tracking-wider uppercase font-semibold">HOST PROFILE</span>
                    {editingHost ? (
                      <input
                        type="text"
                        value={settings.hostName}
                        autoFocus
                        onBlur={() => setEditingHost(false)}
                        onChange={(e) => setSettings({ ...settings, hostName: e.target.value })}
                        className="bg-transparent text-slate-100 font-bold text-[13.5px] tracking-wide outline-none border-b border-[#00D2C4] py-0.5"
                      />
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-100 font-bold text-[13.5px] tracking-wide truncate">
                          {settings.hostName}
                        </span>
                        <span
                          onClick={() => setEditingHost(true)}
                          className="material-symbols-outlined text-neutral-400 text-[16px] hover:text-[#00D2C4] cursor-pointer"
                          title="Click to edit host name"
                        >
                          edit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Persona Style Presets */}
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-[12px] font-mono tracking-widest uppercase text-neutral-400 font-bold">RJ PERSONA PRESETS</span>
                  <span className="text-[11px] font-mono text-neutral-400 font-semibold">SLOT A-D</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: "energetic", label: "ENERGETIC", sub: "+4dB DRIVE" },
                    { id: "chill", label: "CHILL", sub: "WARMTH" },
                    { id: "sarcastic", label: "SARCASTIC", sub: "-2dB SHARP" },
                    { id: "professional", label: "STUDIO PRO", sub: "COMP BAL" },
                  ].map((preset) => {
                    const isActive = settings.rjStyle.toLowerCase() === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSettings({ ...settings, rjStyle: preset.id })}
                        className={`py-2 px-2 rounded text-center transition-all active:translate-y-0.5 relative cursor-pointer ${isActive
                          ? "bg-[#122827] border border-[#00D2C4] glow-cyan-subtle"
                          : "bg-[#1A1C20] hover:bg-[#22252B] border border-neutral-700/70 ni-metal-bevel"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00D2C4] shadow-[0_0_4px_#00D2C4]"></div>
                        )}
                        <div className={`text-[12px] font-black tracking-wider ${isActive ? "text-[#00D2C4]" : "text-slate-200"}`}>
                          {preset.label}
                        </div>
                        <div className={`text-[10.5px] font-mono mt-0.5 ${isActive ? "text-[#00D2C4] font-bold" : "text-neutral-400"}`}>
                          {preset.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <section className="bg-[#0F1012] border border-[#272B33] rounded p-3 space-y-3">
                <div>
                  <div className="text-[12px] font-mono tracking-widest uppercase text-neutral-300 font-bold">COMMENTARY PROMPT</div>
                  <p className="text-[10.5px] text-neutral-500 mt-1">Add your own instructions to the RJ’s system prompt. Leave blank to use the selected persona only.</p>
                </div>
                <textarea
                  aria-label="Custom system prompt instructions"
                  value={settings.customSystemPrompt}
                  onChange={(event) => setSettings((current) => ({ ...current, customSystemPrompt: event.target.value }))}
                  placeholder="Example: Keep the humor warm and family friendly."
                  rows={4}
                  className="w-full resize-y bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[12px] text-slate-100 focus:border-[#00D2C4] outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded bg-[#08090A] border border-[#272B33] p-2 text-[11px] text-neutral-200">
                    <input type="checkbox" checked={settings.includeJokes} onChange={(event) => setSettings((current) => ({ ...current, includeJokes: event.target.checked }))} className="accent-[#00D2C4]" />
                    Allow random jokes
                  </label>
                  <label className="flex items-center gap-2 rounded bg-[#08090A] border border-[#272B33] p-2 text-[11px] text-neutral-200">
                    <input type="checkbox" checked={settings.includeAdvertisements} onChange={(event) => setSettings((current) => ({ ...current, includeAdvertisements: event.target.checked }))} className="accent-[#00D2C4]" />
                    Allow fictional ads
                  </label>
                </div>
                <label className="flex items-center justify-between gap-3 text-[11px] text-neutral-300">
                  <span>Chance per commentary</span>
                  <select
                    aria-label="Extra content frequency"
                    value={settings.extraContentFrequency}
                    onChange={(event) => setSettings((current) => ({ ...current, extraContentFrequency: Number(event.target.value) }))}
                    className="bg-[#08090A] border border-[#272B33] rounded px-2 py-1.5 text-slate-100 outline-none focus:border-[#00D2C4]"
                  >
                    <option value={10}>Rare · 10%</option>
                    <option value={25}>Occasional · 25%</option>
                    <option value={50}>Often · 50%</option>
                    <option value={100}>Every time · 100%</option>
                  </select>
                </label>
                <p className="text-[10px] text-neutral-500">When selected, the RJ randomly chooses a joke or a generic fictional ad from the enabled options. Save to apply.</p>
              </section>

              {/* Feature Switches (Maschine-style backlit hardware toggles) */}
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <span className="text-[12px] font-mono tracking-widest uppercase text-neutral-400 font-bold">HARDWARE LOGIC ROUTING</span>
                  <span className="text-[11px] font-mono text-neutral-400 font-semibold">LOGIC GATES</span>
                </div>
                <div className="grid grid-cols-3 gap-3">

                  {/* Switch 1: Comments */}
                  <div
                    onClick={() => setSettings({ ...settings, includeComments: !settings.includeComments })}
                    className="bg-[#0F1012] border border-[#272B33] rounded p-2.5 flex items-center justify-between cursor-pointer hover:border-neutral-600 transition-colors"
                  >
                    <div>
                      <div className="text-[12.5px] font-bold tracking-wider text-slate-100">COMMENTS</div>
                      <div className={`text-[11px] font-mono mt-0.5 font-bold ${settings.includeComments ? "text-[#00D2C4]" : "text-neutral-500"}`}>
                        {settings.includeComments ? "[ENGAGED]" : "[BYPASS]"}
                      </div>
                    </div>
                    <div className="w-8 h-4.5 bg-neutral-900 border border-neutral-700 rounded-full p-0.5 flex items-center">
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${settings.includeComments ? "translate-x-3.5 bg-[#00D2C4] shadow-[0_0_6px_#00D2C4]" : "bg-neutral-600"}`}></div>
                    </div>
                  </div>

                  {/* Switch 2: History */}
                  <div
                    onClick={() => setSettings({ ...settings, includeHistory: !settings.includeHistory })}
                    className="bg-[#0F1012] border border-[#272B33] rounded p-2.5 flex items-center justify-between cursor-pointer hover:border-neutral-600 transition-colors"
                  >
                    <div>
                      <div className="text-[12.5px] font-bold tracking-wider text-slate-100">HISTORY</div>
                      <div className={`text-[11px] font-mono mt-0.5 font-bold ${settings.includeHistory ? "text-[#FF9E1B]" : "text-neutral-500"}`}>
                        {settings.includeHistory ? "[BUFFERED]" : "[BYPASS]"}
                      </div>
                    </div>
                    <div className="w-8 h-4.5 bg-neutral-900 border border-neutral-700 rounded-full p-0.5 flex items-center">
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${settings.includeHistory ? "translate-x-3.5 bg-[#FF9E1B] shadow-[0_0_6px_#FF9E1B]" : "bg-neutral-600"}`}></div>
                    </div>
                  </div>

                  {/* Switch 3: Auto Start */}
                  <div
                    onClick={() => setSettings({ ...settings, autoStart: !settings.autoStart })}
                    className="bg-[#0F1012] border border-[#272B33] rounded p-2.5 flex items-center justify-between cursor-pointer hover:border-neutral-600 transition-colors"
                  >
                    <div>
                      <div className="text-[12.5px] font-bold tracking-wider text-slate-100">AUTO-PLAY</div>
                      <div className={`text-[11px] font-mono mt-0.5 font-bold ${settings.autoStart ? "text-[#00D2C4]" : "text-neutral-500"}`}>
                        {settings.autoStart ? "[ACTIVE]" : "[STANDBY]"}
                      </div>
                    </div>
                    <div className="w-8 h-4.5 bg-neutral-900 border border-neutral-700 rounded-full p-0.5 flex items-center">
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${settings.autoStart ? "translate-x-3.5 bg-[#00D2C4] shadow-[0_0_6px_#00D2C4]" : "bg-neutral-600"}`}></div>
                    </div>
                  </div>

                </div>
              </div>

              <section className="bg-[#0F1012] border border-[#272B33] rounded p-3">
                <div className="text-[11.5px] text-neutral-300 tracking-wider font-bold mb-2">COMMENTARY TIMING</div>
                <div className="grid grid-cols-2 gap-3">
                  <RotaryKnob
                    label="GENERATE AFTER"
                    options={generateTimingOptions}
                    value={settings.generateAfterSeconds}
                    valueLabel={`${settings.generateAfterSeconds} SEC`}
                    onChange={(value) => setSettings((current) => ({ ...current, generateAfterSeconds: Number(value) }))}
                  />
                  <RotaryKnob
                    label="PLAY BEFORE END"
                    options={playTimingOptions}
                    value={settings.playBeforeEndSeconds}
                    valueLabel={`${settings.playBeforeEndSeconds} SEC`}
                    accent="#FF9E1B"
                    onChange={(value) => setSettings((current) => ({ ...current, playBeforeEndSeconds: Number(value) }))}
                  />
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">Save configuration to apply timing to active playback.</div>
              </section>
            </div>
          )}

          {/* TAB 2: TTS */}
          {activeTab === "TTS" && (
            <div className="space-y-3 font-mono">
              {/* TTS Engine Switcher */}
              <div>
                <span className="text-[12px] text-neutral-400 tracking-widest uppercase mb-1.5 block font-bold">
                  TTS SYNTHESIS ENGINE
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "fish-audio" as const, name: "FISH AUDIO", sub: "Neural S2.1" },
                    { id: "murf" as const, name: "MURF.AI", sub: "Studio Voices" },
                    { id: "google-tts" as const, name: "GOOGLE TTS", sub: "Web Speech" },
                  ].map((eng) => (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          ttsProvider: eng.id,
                          voiceId:
                            eng.id === "fish-audio"
                              ? "ba1a38946dea44609fc4a8fe6113ed88"
                              : eng.id === "murf"
                                ? "en-US-natalie"
                                : "en-US",
                        })
                      }
                      className={`p-2.5 rounded text-left border transition-all cursor-pointer ${settings.ttsProvider === eng.id
                        ? "bg-[#122827] border-[#00D2C4] glow-cyan-subtle"
                        : "bg-[#0F1012] border-[#272B33] hover:border-neutral-700"
                        }`}
                    >
                      <div className={`text-[12.5px] font-bold ${settings.ttsProvider === eng.id ? "text-[#00D2C4]" : "text-slate-100"}`}>
                        {eng.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{eng.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice ID input */}
              <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">
                    {settings.ttsProvider === "fish-audio" ? "FISH AUDIO REFERENCE ID" : "VOICE MODEL / CODE"}
                  </span>
                  <button onClick={testTTS} disabled={isTesting} className="text-[10px] font-bold text-[#00D2C4] border border-[#00D2C4]/50 rounded px-2 py-1 disabled:opacity-50">PREVIEW VOICE</button>
                </div>
                <input
                  type="text"
                  value={settings.voiceId}
                  onChange={(e) => setSettings({ ...settings, voiceId: e.target.value })}
                  placeholder={
                    settings.ttsProvider === "fish-audio"
                      ? "ba1a38946dea44609fc4a8fe6113ed88"
                      : "e.g., en-US-natalie"
                  }
                  className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 font-mono focus:border-[#00D2C4] outline-none"
                />
              </div>

              {/* Voice Style (Murf) & Commentary Length Presets */}
              <div className={`grid ${settings.ttsProvider === "murf" ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                {settings.ttsProvider === "murf" && (
                  <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed flex flex-col justify-between">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase mb-1.5 block font-bold">MURF.AI VOICE STYLE</span>
                    <select
                      value={settings.voiceStyle}
                      onChange={(e) => setSettings({ ...settings, voiceStyle: e.target.value })}
                      className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[12.5px] text-slate-100 outline-none"
                    >
                      <option value="Promo">Promo (Energetic)</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Newscast">Newscast</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sad">Sad</option>
                      <option value="Angry">Angry</option>
                    </select>
                  </div>
                )}

                <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">COMMENTARY LENGTH</span>
                    <span className="text-[12px] text-[#00D2C4] font-bold">
                      {settings.commentaryLength === "short" ? "25s" : settings.commentaryLength === "medium" ? "35s" : "50s"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "short", label: "25s" },
                      { id: "medium", label: "35s" },
                      { id: "long", label: "50s" },
                    ].map((len) => (
                      <button
                        key={len.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, commentaryLength: len.id })}
                        className={`py-2 rounded text-[12px] font-bold border transition-all cursor-pointer ${settings.commentaryLength === len.id
                          ? "bg-[#122827] border-[#00D2C4] text-[#00D2C4]"
                          : "bg-[#08090A] border-[#272B33] text-neutral-300 hover:text-slate-100"
                          }`}
                      >
                        {len.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Fish Audio Key */}
              {settings.ttsProvider === "fish-audio" && (
                <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">FISH AUDIO API KEY (TTS)</span>
                    <span className={`text-[11.5px] font-bold ${settings.fishApiKey ? "text-emerald-400" : "text-[#FF9E1B]"}`}>
                      {settings.fishApiKey ? "● CONFIGURED" : "○ MISSING"}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys.fish ? "text" : "password"}
                      value={settings.fishApiKey}
                      onChange={(e) => setSettings({ ...settings, fishApiKey: e.target.value })}
                      placeholder="Enter Fish Audio Key"
                      className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 pr-10 focus:border-[#00D2C4] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys({ ...showKeys, fish: !showKeys.fish })}
                      className="absolute right-2.5 text-neutral-400 hover:text-slate-100 text-[18px] material-symbols-outlined cursor-pointer"
                    >
                      {showKeys.fish ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
              )}

              {/* Murf Key */}
              {settings.ttsProvider === "murf" && (
                <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">MURF.AI API KEY (TTS)</span>
                    <span className={`text-[11.5px] font-bold ${settings.murfApiKey ? "text-emerald-400" : "text-neutral-500"}`}>
                      {settings.murfApiKey ? "● CONFIGURED" : "○ OPTIONAL"}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys.murf ? "text" : "password"}
                      value={settings.murfApiKey}
                      onChange={(e) => setSettings({ ...settings, murfApiKey: e.target.value })}
                      placeholder="Enter Murf Key (Optional)"
                      className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 pr-10 focus:border-[#00D2C4] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys({ ...showKeys, murf: !showKeys.murf })}
                      className="absolute right-2.5 text-neutral-400 hover:text-slate-100 text-[18px] material-symbols-outlined cursor-pointer"
                    >
                      {showKeys.murf ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LLM */}
          {activeTab === "LLM" && (
            <div className="space-y-3 font-mono">
              {/* LLM Engine Switcher */}
              <div>
                <span className="text-[12px] text-neutral-400 tracking-widest uppercase mb-1.5 block font-bold">
                  LLM COMMENTARY ENGINE
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "openrouter" as const, name: "OPENROUTER", sub: "Custom Models" },
                    { id: "chatjimmy" as const, name: "CHATJIMMY", sub: "Llama 3.1 Free" },
                    { id: "gemini" as const, name: "GEMINI", sub: "Google AI Studio" },
                  ].map((llm) => (
                    <button
                      key={llm.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, llmProvider: llm.id })}
                      className={`p-2.5 rounded text-left border transition-all cursor-pointer ${settings.llmProvider === llm.id
                        ? "bg-[#122827] border-[#00D2C4] glow-cyan-subtle"
                        : "bg-[#0F1012] border-[#272B33] hover:border-neutral-700"
                        }`}
                    >
                      <div className={`text-[12.5px] font-bold ${settings.llmProvider === llm.id ? "text-[#00D2C4]" : "text-slate-100"}`}>
                        {llm.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{llm.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* If OpenRouter selected: Key + Custom Model */}
              {settings.llmProvider === "openrouter" && (
                <>
                  <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">OPENROUTER API KEY</span>
                      <span className={`text-[11.5px] font-bold ${settings.openRouterApiKey ? "text-emerald-400" : "text-[#FF9E1B]"}`}>
                        {settings.openRouterApiKey ? "● CONFIGURED" : "○ MISSING"}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type={showKeys.openrouter ? "text" : "password"}
                        value={settings.openRouterApiKey}
                        onChange={(e) => setSettings({ ...settings, openRouterApiKey: e.target.value })}
                        placeholder="sk-or-v1-..."
                        className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 pr-10 focus:border-[#00D2C4] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, openrouter: !showKeys.openrouter })}
                        className="absolute right-2.5 text-neutral-400 hover:text-slate-100 text-[18px] material-symbols-outlined cursor-pointer"
                      >
                        {showKeys.openrouter ? "visibility_off" : "visibility"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase mb-1.5 block font-bold">OPENROUTER MODEL IDENTIFIER</span>
                    <input
                      type="text"
                      value={settings.openRouterModel}
                      onChange={(e) => setSettings({ ...settings, openRouterModel: e.target.value })}
                      placeholder="recursive/flint-v1.0:free"
                      className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 focus:border-[#00D2C4] outline-none"
                    />
                  </div>
                </>
              )}

              {/* If Gemini selected: Key */}
              {settings.llmProvider === "gemini" && (
                <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-bold">GOOGLE GEMINI API KEY</span>
                    <span className={`text-[11.5px] font-bold ${settings.geminiApiKey ? "text-emerald-400" : "text-[#FF9E1B]"}`}>
                      {settings.geminiApiKey ? "● CONFIGURED" : "○ MISSING"}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys.gemini ? "text" : "password"}
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#08090A] border border-[#272B33] rounded px-3 py-2 text-[13px] text-slate-100 pr-10 focus:border-[#00D2C4] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                      className="absolute right-2.5 text-neutral-400 hover:text-slate-100 text-[18px] material-symbols-outlined cursor-pointer"
                    >
                      {showKeys.gemini ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
              )}

              {/* If ChatJimmy selected: info badge */}
              {settings.llmProvider === "chatjimmy" && (
                <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[12px] text-slate-200 font-semibold">
                    Zero-config free Llama-3.1 engine running via ChatJimmy API.
                  </span>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: DIAGNOSTICS */}
          {activeTab === "DIAGNOSTICS" && (
            <div className="space-y-3 font-mono">
              <section className="bg-[#0F1012] border border-[#272B33] rounded p-3 space-y-1.5">
                <div className="text-[11px] text-neutral-300 font-bold tracking-wider mb-2">SELECTED PROVIDER STATUS</div>
                <div className="flex justify-between text-[10.5px]">
                  <span>LLM · {settings.llmProvider.toUpperCase()}</span>
                  <span className={settings.llmProvider === "chatjimmy" || (settings.llmProvider === "openrouter" ? !!settings.openRouterApiKey : !!settings.geminiApiKey) ? "text-emerald-300" : "text-rose-300"}>
                    {settings.llmProvider === "chatjimmy" || (settings.llmProvider === "openrouter" ? !!settings.openRouterApiKey : !!settings.geminiApiKey) ? "CONFIGURED" : "API KEY NEEDED"}
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px]">
                  <span>TTS · {settings.ttsProvider.toUpperCase()}</span>
                  <span className={settings.ttsProvider === "google-tts" || (settings.ttsProvider === "fish-audio" ? !!settings.fishApiKey : !!settings.murfApiKey) ? "text-emerald-300" : "text-rose-300"}>
                    {settings.ttsProvider === "google-tts" || (settings.ttsProvider === "fish-audio" ? !!settings.fishApiKey : !!settings.murfApiKey) ? "CONFIGURED" : "API KEY NEEDED"}
                  </span>
                </div>
                {(["llm", "tts", "lyrics"] as const).map((service) => {
                  const check = providerTests[service];
                  return <div key={service} className="flex justify-between text-[10px] text-neutral-500">
                    <span>{service.toUpperCase()} LAST TEST {check ? `· ${check.provider}` : "· NEVER"}</span>
                    <span className={check?.success ? "text-emerald-400" : check ? "text-rose-300" : ""}>{check ? `${check.success ? "PASS" : "FAIL"} · ${new Date(check.at).toLocaleString()}` : ""}</span>
                  </div>;
                })}
              </section>

              <section className="bg-[#0F1012] border border-[#272B33] rounded p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-slate-100 font-bold tracking-wider">RUNTIME LOGGER</div>
                    <div className="text-[10.5px] text-neutral-400">Controls extension console output</div>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.loggingEnabled}
                      onChange={(event) => setSettings((current) => ({ ...current, loggingEnabled: event.target.checked }))}
                      className="accent-[#00D2C4]"
                    />
                    ENABLED
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-neutral-400">MINIMUM LEVEL</span>
                  <select
                    value={settings.logLevel}
                    disabled={!settings.loggingEnabled}
                    onChange={(event) => setSettings((current) => ({ ...current, logLevel: event.target.value as Settings["logLevel"] }))}
                    className="bg-[#08090A] text-slate-100 border border-[#343840] rounded px-2 py-1 text-[11px] disabled:opacity-50"
                  >
                    <option value="debug">DEBUG</option>
                    <option value="info">INFO</option>
                    <option value="warn">WARN</option>
                    <option value="error">ERROR</option>
                  </select>
                </div>
                <div className="text-[10px] text-neutral-500">Save configuration to apply logger changes to open YouTube tabs.</div>
              </section>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={testLyrics}
                  disabled={isTesting}
                  className="py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-purple-300 border border-purple-500/40 rounded text-[12px] font-bold tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  TEST LYRICS
                </button>
                <button
                  onClick={testTTS}
                  disabled={isTesting}
                  className="py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-emerald-300 border border-emerald-500/40 rounded text-[12px] font-bold tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  TEST TTS
                </button>
                <button
                  onClick={testLLM}
                  disabled={isTesting}
                  className="py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-amber-300 border border-amber-500/40 rounded text-[12px] font-bold tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  TEST LLM
                </button>
              </div>

              {/* RJ Commentary Triggers */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={triggerGenerateRJCommentary}
                  disabled={isTesting}
                  className="py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-cyan-300 border border-cyan-500/40 rounded text-[12px] font-bold tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  GENERATE RJ COMMENTARY
                </button>
                <button
                  onClick={triggerPlayRJCommentary}
                  disabled={isTesting}
                  className="py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-pink-300 border border-pink-500/40 rounded text-[12px] font-bold tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  PLAY RJ COMMENTARY
                </button>
              </div>
              <button onClick={testCommentary} disabled={isTesting} className="w-full py-2.5 px-2 bg-[#1A1C20] hover:bg-[#252830] text-cyan-200 border border-cyan-500/50 rounded text-[12px] font-bold tracking-wider disabled:opacity-50">
                GENERATE & PLAY TEST COMMENTARY
              </button>

              {/* Diagnostics Terminal Output */}
              <div className="bg-[#08090A] border border-[#272B33] rounded p-3 ni-recessed text-[12.5px] min-h-[110px] max-h-[130px] overflow-y-auto space-y-1.5">
                <div className="text-neutral-400 flex items-center justify-between border-b border-neutral-800/80 pb-1 font-bold text-[11px]">
                  <span>SYSTEM BUS LOGS</span>
                  <span>TTY-01</span>
                </div>
                {isTesting && (
                  <div className="text-[#00D2C4] animate-pulse flex items-center gap-1.5 font-semibold">
                    <span>❯ EXEC:</span>
                    <span>Executing test sequence...</span>
                  </div>
                )}
                {testResult ? (
                  <div className="text-slate-100 break-words whitespace-pre-wrap leading-relaxed text-[12px]">
                    ❯ {testResult}
                  </div>
                ) : (
                  <div className="text-neutral-400 italic text-[11.5px]">
                    Press any test trigger above to verify external API handshakes.
                  </div>
                )}
              </div>

              <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 space-y-2">
                <div className="text-[11px] text-neutral-300 font-bold tracking-wider">COMMENTARY LOG EXPORT</div>
                <div className="flex gap-3 text-[10px] text-neutral-400">
                  {(["titles", "scripts", "timestamps"] as const).map((key) => <label key={key} className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={exportOptions[key]} onChange={(event) => setExportOptions((current) => ({ ...current, [key]: event.target.checked }))} className="accent-[#00D2C4]" />
                    {key.toUpperCase()}
                  </label>)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={exportLogs} className="py-2 px-2 bg-[#15181c] text-slate-200 border border-[#343840] rounded text-[10px] font-bold">EXPORT JSON</button>
                  <button onClick={clearSessionLogs} className="py-2 px-2 bg-[#15181c] text-rose-300 border border-rose-900/70 rounded text-[10px] font-bold">CLEAR SESSION LOGS</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Master Chassis Footer */}
      <footer className="px-3.5 py-1.5 bg-gradient-to-b from-[#181A1E] to-[#0e1012] border-t border-[#272B33] space-y-1 flex-shrink-0">
        {/* Notification Status */}
        {status && (
          <div className={`text-center font-mono text-[11px] font-bold py-1 px-2 rounded border ${status.type === "success"
            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
            : "bg-rose-950/60 border-rose-500/50 text-rose-300"
            }`}>
            {status.message}
          </div>
        )}

        {/* Chassis Footer Branding */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 font-semibold">
          <span>NATIVE HARDWARE UI COMPONENT</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
            <span>FIRMWARE V2.4 // BUILD 970</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
