import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import APIUtils from "./utils/api-utils";
import { GoogleTTS } from "./utils/google-tts";


export default function Popup() {

  const [settings, setSettings] = useState<Settings>({
    geminiApiKey: "",
    murfApiKey: "",
    rjStyle: "sarcastic",
    commentaryLength: "short",
    voiceId: 'en-GB',
    voiceStyle: "default",
    includeHistory: false,
    includeComments: false,
    autoStart: false,
    volumeDucking: 50,
    hostName: "Alexis",
    radioStation: "97.7 Youtube FM",
  });

  const [status, setStatus] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [apiOpen, setApiOpen] = useState(true);

  // Load settings from chrome.storage
  useEffect(() => {
    chrome.storage.sync.get(settings, (stored) => {
      setSettings((prev) => ({ ...prev, ...stored }));
    });
  }, []);

  // Temporary status message
  const showStatus = (message: string, type: string) => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };

  // Save settings to chrome.storage
  const saveSettings = () => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        showStatus(
          "Error saving settings: " + chrome.runtime.lastError.message,
          "error"
        );
      } else {
        showStatus("Settings saved successfully!", "success");
      }
    });
  };

  // Export logs from chrome.storage.local
  const exportLogs = () => {
    chrome.storage.local.get(["commentaryLogs"], (result) => {
      const logsData = result.commentaryLogs || [];
      const blob = new Blob([JSON.stringify(logsData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `youtube-rj-logs-${new Date().toISOString().split("T")[0]
        }.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus("Logs exported successfully!", "success");
    });
  };

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testLyrics = async () => {
    setIsTesting(true);
    setTestResult("Testing Lyrics API...");
    try {
      const lyrics = await APIUtils.callLyricsAPI("Kalax - Out of Time");
      setTestResult(
        lyrics ? "✅ Lyrics found!" : "❌ No lyrics found (but API worked)"
      );
    } catch (e: any) {
      setTestResult("❌ Error: " + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const testTTS = async () => {
    setIsTesting(true);
    setTestResult("Testing TTS API...");
    try {
      const tts = new GoogleTTS();
      await tts.synthesize(
        "Welcome to the show! This is a test of the Google TTS system.",
        settings.voiceId || "en-US"
      );
      const audioBlob = tts.toBlob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
      setTestResult("✅ TTS Audio generated and playing...");
    } catch (e: any) {
      setTestResult("❌ Error: " + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const testLLM = async () => {
    if (!settings.geminiApiKey) {
      setTestResult("❌ Please enter and save Gemini API Key first");
      return;
    }
    setIsTesting(true);
    setTestResult("Testing LLM API...");
    try {
      const response = await APIUtils.callGeminiAPI(
        "Say hello as a radio DJ in one short sentence.",
        settings.geminiApiKey
      );
      setTestResult("✅ LLM: " + response);
    } catch (e: any) {
      setTestResult("❌ Error: " + e.message);
    } finally {
      setIsTesting(false);
    }
  };


  return (
    <div className="w-[400px] mb-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎙️ YouTube RJ Mode</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure your radio jockey experience!
          </p>
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h3 className="text-xl font-semibold mb-4">🎛️ RJ Settings</h3>

          {/* Commentary Length */}
          <div>
            <label className="block font-medium">Commentary Length:</label>
            <select
              value={settings.commentaryLength}
              onChange={(e) =>
                setSettings({ ...settings, commentaryLength: e.target.value })
              }
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short (20-30s)</option>
              <option value="medium">Medium (30-45s)</option>
              <option value="long">Long (45-60s)</option>
            </select>
          </div>

          {/* RJ Style */}
          <div>
            <label className="block font-medium">RJ Style:</label>
            <select
              value={settings.rjStyle}
              onChange={(e) =>
                setSettings({ ...settings, rjStyle: e.target.value })
              }
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="energetic">Energetic</option>
              <option value="chill">Chill</option>
              <option value="sarcastic">Sarcastic</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Voice ID */}
          <div>
            <label className="block font-medium">Voice ID:</label>
            <input
              type="text"
              value={settings.voiceId}
              onChange={(e) =>
                setSettings({ ...settings, voiceId: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter language code (e.g., en, hi, bn)"
            />
          </div>

          {/* Host Name */}
          <div>
            <label className="block font-medium">Radio Host:</label>
            <input
              type="text"
              value={settings.hostName}
              onChange={(e) =>
                setSettings({ ...settings, hostName: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the radio host name (e.g., Alexis Quinn)"
            />
          </div>

          {/* Radio Station */}
          <div>
            <label className="block font-medium">Radio Station:</label>
            <input
              type="text"
              value={settings.radioStation}
              onChange={(e) =>
                setSettings({ ...settings, radioStation: e.target.value })
              }
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the radio station name"
            />
          </div>

          {/* Voice Style */}
          <div>
            <label className="block font-medium">Voice Style:</label>
            <select
              value={settings.voiceStyle}
              onChange={(e) =>
                setSettings({ ...settings, voiceStyle: e.target.value })
              }
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Promo">Promo (Energetic)</option>
              <option value="Conversational">Conversational</option>
              <option value="Newscast">Newscast</option>
              <option value="Friendly">Friendly</option>
              <option value="Luxury">Luxury</option>
              <option value="Sad">Sad</option>
              <option value="Angry">Angry</option>
              <option value="Fearful">Fearful</option>
              <option value="Disgusted">Disgusted</option>
            </select>
          </div>

          {/* Volume Ducking */}
          <div>
            <label className="block font-medium">Volume Ducking:</label>
            <input
              type="range"
              min={10}
              max={90}
              value={settings.volumeDucking}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  volumeDucking: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <span className="text-sm font-medium text-blue-600">
              {settings.volumeDucking}%
            </span>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h3 className="text-xl font-semibold mb-4">🧪 Features</h3>

          <label className="flex items-center justify-between font-medium">
            Include Comments
            <input
              type="checkbox"
              checked={settings.includeComments}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  includeComments: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between font-medium">
            Include History
            <input
              type="checkbox"
              checked={settings.includeHistory}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  includeHistory: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between font-medium">
            Auto-start on Playlists
            <input
              type="checkbox"
              checked={settings.autoStart}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  autoStart: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setApiOpen(!apiOpen)}
          >
            <h3 className="text-xl font-semibold">🔐 API Configuration</h3>
            <span>{apiOpen ? "▼" : "▲"}</span>
          </div>

          {apiOpen && (
            <>
              <div>
                <label className="block text-sm font-medium">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, geminiApiKey: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Murf.ai API Key:
                </label>
                <input
                  type="password"
                  value={settings.murfApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, murfApiKey: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Test Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h3 className="text-xl font-semibold mb-4">🧪 API Diagnostics</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={testLyrics}
              disabled={isTesting}
              className="px-3 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Test Lyrics
            </button>
            <button
              onClick={testTTS}
              disabled={isTesting}
              className="px-3 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test TTS
            </button>
            <button
              onClick={testLLM}
              disabled={isTesting}
              className="px-3 py-2 text-xs font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Test LLM
            </button>
          </div>
          {testResult && (
            <div className="mt-4 p-3 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 break-words">
              {testResult}
            </div>
          )}
        </div>
      </div>


      {/* Footer Actions */}
      <div className="fixed p-1 bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {status && (
          <div
            className={`text-center text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"
              }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={exportLogs}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            📁 Export Commentary Logs
          </button>

          <button
            onClick={saveSettings}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-md transition"
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);

// types
export interface Settings {
  geminiApiKey: string;
  murfApiKey: string;
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
