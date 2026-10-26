import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef } from "react";
import APIUtils from "./utils/api-utils";
import { FishAudioTTS } from "./utils/fish-audio";

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
  voiceId: string;
  voiceStyle: string;
  includeHistory: boolean;
  includeComments: boolean;
  autoStart: boolean;
  volumeDucking: number;
  hostName: string;
  radioStation: string;
}

type TabType = "PERSONA" | "TTS" | "LLM" | "DIAGNOSTICS";

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
    voiceId: "ba1a38946dea44609fc4a8fe6113ed88",
    voiceStyle: "Promo",
    includeHistory: false,
    includeComments: false,
    autoStart: true,
    volumeDucking: 50,
    hostName: "Alexis",
    radioStation: "97.7 Youtube FM",
  });

  const [activeTab, setActiveTab] = useState<TabType>("PERSONA");
  const [isOnAir, setIsOnAir] = useState(true);
  const [editingStation, setEditingStation] = useState(false);
  const [editingHost, setEditingHost] = useState(false);
  const [showKeys, setShowKeys] = useState({ gemini: false, fish: false, murf: false, openrouter: false });

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);

  const checkScroll = () => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      setShowScrollCue(scrollHeight - scrollTop - clientHeight > 35);
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
    });
  }, []);

  const showStatus = (message: string, type: "success" | "error") => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3500);
  };

  const saveSettings = () => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        showStatus("Error: " + chrome.runtime.lastError.message, "error");
      } else {
        showStatus("Configuration saved to hardware memory", "success");
      }
    });
  };

  const exportLogs = () => {
    chrome.storage.local.get(["commentaryLogs"], (result) => {
      const logsData = result.commentaryLogs || [];
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

  const testLyrics = async () => {
    setIsTesting(true);
    setTestResult("Connecting to LRCLIB API: querying 'Kalax - Out of Time'...");
    try {
      const lyrics = await APIUtils.callLyricsAPI("Kalax - Out of Time");
      setTestResult(
        lyrics ? "✅ LRCLIB 200 OK: Lyrics retrieved successfully." : "⚠️ LRCLIB 200 OK: Track found but no synced lyrics."
      );
    } catch (e: any) {
      setTestResult("❌ LRCLIB Error: " + (e?.message || e));
    } finally {
      setIsTesting(false);
    }
  };

  const testTTS = async () => {
    setIsTesting(true);
    const provider = settings.ttsProvider || "fish-audio";
    setTestResult(`Initializing ${provider.toUpperCase()} TTS synthesis pipeline...`);
    try {
      if (provider === "fish-audio") {
        if (!settings.fishApiKey) {
          setTestResult("❌ Fish Audio API Key missing in CLOUD APIS tab");
          return;
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
        await audio.play();
        setTestResult("✅ Fish Audio: Audio stream decoded and playing.");
      } else if (provider === "murf") {
        if (!settings.murfApiKey) {
          setTestResult("❌ Murf.ai API Key missing in CLOUD APIS tab");
          return;
        }
        const data = await APIUtils.callMurfAPI(
          "Welcome to the broadcast. This is a test of Murf.ai studio synthesis.",
          settings.murfApiKey,
          settings.voiceId || "en-US-natalie",
          settings.voiceStyle || "Promo"
        );
        const url = URL.createObjectURL(data.audioBlob);
        const audio = new Audio(url);
        await audio.play();
        setTestResult("✅ Murf.ai: Audio stream synthesized and playing.");
      } else {
        setTestResult("✅ Google TTS is ready (native browser speech synthesis).");
      }
    } catch (e: any) {
      setTestResult("❌ TTS Synthesis Error: " + (e?.message || e));
    } finally {
      setIsTesting(false);
    }
  };

  const testLLM = async () => {
    setIsTesting(true);
    const provider = settings.llmProvider || "openrouter";
    setTestResult(`Dispatching test prompt to ${provider.toUpperCase()} LLM...`);

    try {
      if (provider === "openrouter") {
        if (!settings.openRouterApiKey) {
          setTestResult("❌ OpenRouter API Key missing in CLOUD APIS tab");
          return;
        }
        const response = await APIUtils.callOpenRouterAPI(
          "You are a witty radio DJ.",
          "Say hello as a radio DJ in one punchy sentence.",
          settings.openRouterApiKey,
          settings.openRouterModel
        );
        setTestResult(`✅ OpenRouter (${settings.openRouterModel}): ${response}`);
      } else if (provider === "gemini") {
        if (!settings.geminiApiKey) {
          setTestResult("❌ Gemini API Key missing in CLOUD APIS tab");
          return;
        }
        const response = await APIUtils.callGeminiAPI(
          "Say hello as a radio DJ in one punchy sentence.",
          settings.geminiApiKey
        );
        setTestResult("✅ Gemini: " + response);
      } else {
        const response = await APIUtils.callChatJimmyAPI(
          "You are a witty radio DJ.",
          "Say hello as a radio DJ in one punchy sentence."
        );
        setTestResult("✅ ChatJimmy: " + response);
      }
    } catch (e: any) {
      setTestResult("❌ LLM Error: " + (e?.message || e));
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

  // Macro Knob Helpers
  const stylesList = ["sarcastic", "energetic", "chill", "professional"];
  const cycleStyle = () => {
    const currentIndex = stylesList.indexOf(settings.rjStyle.toLowerCase());
    const nextStyle = stylesList[(currentIndex + 1) % stylesList.length];
    setSettings((s) => ({ ...s, rjStyle: nextStyle }));
  };

  const lengthsList = ["short", "medium", "long"];
  const cycleLength = () => {
    const currentIndex = lengthsList.indexOf(settings.commentaryLength);
    const nextLength = lengthsList[(currentIndex + 1) % lengthsList.length];
    setSettings((s) => ({ ...s, commentaryLength: nextLength }));
  };

  const enginesList: Settings["ttsProvider"][] = ["fish-audio", "murf", "google-tts"];
  const cycleEngine = () => {
    const currentIndex = enginesList.indexOf(settings.ttsProvider);
    const nextEngine = enginesList[(currentIndex + 1) % enginesList.length];
    setSettings((s) => ({
      ...s,
      ttsProvider: nextEngine,
      voiceId:
        nextEngine === "fish-audio"
          ? "ba1a38946dea44609fc4a8fe6113ed88"
          : nextEngine === "murf"
            ? "en-US-natalie"
            : "en-US",
    }));
  };

  const cycleDucking = () => {
    const step = settings.volumeDucking >= 80 ? 20 : settings.volumeDucking + 20;
    setSettings((s) => ({ ...s, volumeDucking: step }));
  };

  // Knob Arc Offsets
  const styleOffsets: Record<string, number> = {
    sarcastic: 65,
    energetic: 36,
    chill: 95,
    professional: 120,
  };
  const lengthOffsets: Record<string, number> = {
    short: 85,
    medium: 65,
    long: 36,
  };
  const duckingOffset = Math.round(144 - (settings.volumeDucking / 100) * 108);
  const engineOffsets: Record<string, number> = {
    "fish-audio": 50,
    murf: 80,
    "google-tts": 115,
  };

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
              onClick={() => setIsOnAir(!isOnAir)}
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

            {/* Save Config Button (Top Right Corner) */}
            <button
              id="saveConfigBtn"
              onClick={saveSettings}
              className="py-1 px-3 bg-[#00D2C4] hover:bg-[#12e6d8] text-neutral-950 font-bold rounded flex items-center justify-center gap-1.5 transition-all active:scale-95 glow-cyan-subtle cursor-pointer font-mono shadow-[0_0_8px_rgba(0,210,196,0.3)]"
              title="Save configuration to storage"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span className="text-[11.5px] tracking-wider uppercase font-black">SAVE</span>
            </button>
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
      {/* Signature NI 4-Macro Parameter Strip (Top Hardware Row) */}
      <section className="px-3.5 py-2.5 bg-gradient-to-b from-[#14161a] to-[#0F1012] border-b border-[#272B33] flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Macro Parameter Encoders</span>
          <span className="text-[11px] font-mono text-[#00D2C4] tracking-wider font-bold">BANK 01/04</span>
        </div>

        {/* 4 Knobs Grid */}
        <div className="grid grid-cols-4 gap-3">

          {/* Knob 1: STYLE */}
          <div onClick={cycleStyle} className="flex flex-col items-center group cursor-pointer" title="Click to cycle Style preset">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="23" stroke="#252830" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" />
                <circle cx="30" cy="30" r="23" stroke="#00D2C4" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset={styleOffsets[settings.rjStyle.toLowerCase()] || 65} strokeLinecap="round" className="filter drop-shadow-[0_0_4px_rgba(0,210,196,0.8)] transition-all duration-300" />
              </svg>
              <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2d34] via-[#1a1b1f] to-[#0c0d0f] border border-neutral-600 knob-radial-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="w-0.5 h-3 bg-[#00D2C4] rounded-full absolute top-1 shadow-[0_0_4px_#00D2C4]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#111215] border border-neutral-700"></div>
                </div>
              </div>
            </div>
            <div className="w-full mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-1.5 py-1 text-center font-mono ni-recessed transition-colors group-hover:border-[#00D2C4]/60">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate font-semibold">STYLE</div>
              <div className="text-[12px] text-[#00D2C4] font-bold truncate uppercase">{settings.rjStyle}</div>
            </div>
          </div>

          {/* Knob 2: DURATION */}
          <div onClick={cycleLength} className="flex flex-col items-center group cursor-pointer" title="Click to cycle Commentary Duration">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="23" stroke="#252830" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" />
                <circle cx="30" cy="30" r="23" stroke="#00D2C4" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset={lengthOffsets[settings.commentaryLength] || 65} strokeLinecap="round" className="filter drop-shadow-[0_0_4px_rgba(0,210,196,0.8)] transition-all duration-300" />
              </svg>
              <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2d34] via-[#1a1b1f] to-[#0c0d0f] border border-neutral-600 knob-radial-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="w-0.5 h-3 bg-[#00D2C4] rounded-full absolute top-1 shadow-[0_0_4px_#00D2C4]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#111215] border border-neutral-700"></div>
                </div>
              </div>
            </div>
            <div className="w-full mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-1.5 py-1 text-center font-mono ni-recessed transition-colors group-hover:border-[#00D2C4]/60">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate font-semibold">DURATION</div>
              <div className="text-[12px] text-slate-100 font-bold truncate uppercase">
                {settings.commentaryLength === "short" ? "25 SEC" : settings.commentaryLength === "medium" ? "35 SEC" : "50 SEC"}
              </div>
            </div>
          </div>

          {/* Knob 3: DUCKING */}
          <div onClick={cycleDucking} className="flex flex-col items-center group cursor-pointer" title="Click to step Ducking attenuation">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="23" stroke="#252830" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" />
                <circle cx="30" cy="30" r="23" stroke="#FF9E1B" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset={duckingOffset} strokeLinecap="round" className="filter drop-shadow-[0_0_4px_rgba(255,158,27,0.8)] transition-all duration-300" />
              </svg>
              <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2d34] via-[#1a1b1f] to-[#0c0d0f] border border-neutral-600 knob-radial-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="w-0.5 h-3 bg-[#FF9E1B] rounded-full absolute top-1 shadow-[0_0_4px_#FF9E1B]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#111215] border border-neutral-700"></div>
                </div>
              </div>
            </div>
            <div className="w-full mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-1.5 py-1 text-center font-mono ni-recessed transition-colors group-hover:border-[#FF9E1B]/60">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate font-semibold">DUCKING</div>
              <div className="text-[12px] text-[#FF9E1B] font-bold truncate">{duckingDb} dB ({settings.volumeDucking}%)</div>
            </div>
          </div>

          {/* Knob 4: ENGINE */}
          <div onClick={cycleEngine} className="flex flex-col items-center group cursor-pointer" title="Click to cycle TTS engine">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="23" stroke="#252830" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" />
                <circle cx="30" cy="30" r="23" stroke="#00D2C4" strokeWidth="3" fill="none" strokeDasharray="144" strokeDashoffset={engineOffsets[settings.ttsProvider] || 50} strokeLinecap="round" className="filter drop-shadow-[0_0_4px_rgba(0,210,196,0.8)] transition-all duration-300" />
              </svg>
              <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2d34] via-[#1a1b1f] to-[#0c0d0f] border border-neutral-600 knob-radial-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="w-0.5 h-3 bg-[#00D2C4] rounded-full absolute top-1 shadow-[0_0_4px_#00D2C4]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#111215] border border-neutral-700"></div>
                </div>
              </div>
            </div>
            <div className="w-full mt-1.5 bg-[#08090A] border border-[#272B33] rounded px-1.5 py-1 text-center font-mono ni-recessed transition-colors group-hover:border-[#00D2C4]/60">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider truncate font-semibold">ENGINE</div>
              <div className="text-[12px] text-[#00D2C4] font-bold truncate uppercase">
                {settings.ttsProvider === "fish-audio" ? "FISH AUDIO" : settings.ttsProvider === "murf" ? "MURF.AI" : "GOOGLE TTS"}
              </div>
            </div>
          </div>

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

              {/* Active Engine Readout (Controlled by Top Macro Knob 4) */}
              <div className="bg-[#0F1012] border border-[#272B33] rounded px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D2C4] shadow-[0_0_5px_#00D2C4]"></span>
                  <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase font-semibold">ACTIVE ENGINE:</span>
                  <span className="text-[13px] text-[#00D2C4] font-black tracking-wider uppercase">
                    {settings.ttsProvider === "fish-audio" ? "FISH AUDIO (Neural S2.1)" : settings.ttsProvider === "murf" ? "MURF.AI (Studio)" : "GOOGLE TTS (Web Speech)"}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono tracking-tight font-bold">[MACRO 4]</span>
              </div>

              {/* Voice ID input */}
              <div className="bg-[#0F1012] border border-[#272B33] rounded p-3 ni-recessed">
                <span className="text-[11.5px] text-neutral-400 tracking-wider uppercase mb-1.5 block font-bold">
                  {settings.ttsProvider === "fish-audio" ? "FISH AUDIO REFERENCE ID" : "VOICE MODEL / CODE"}
                </span>
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
              <div className="grid grid-cols-2 gap-3">
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

              {/* Murf Key */}
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

              {/* Export Commentary Logs */}
              <button
                onClick={exportLogs}
                className="w-full py-2 px-3 bg-[#0F1012] hover:bg-[#1f2229] text-slate-200 font-bold border border-[#272B33] rounded flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#00D2C4]">download</span>
                <span className="text-[12px] tracking-wider uppercase font-bold">EXPORT COMMENTARY LOGS (JSON)</span>
              </button>
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
