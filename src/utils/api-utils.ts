// API-related utility functions
import Logger from "./logger";

export const DEFAULT_SETTINGS = {
  geminiApiKey: "",
  murfApiKey: "",
  fishApiKey: "",
  openRouterApiKey: "",
  openRouterModel: "recursive/flint-v1.0:free",
  llmProvider: "openrouter" as "openrouter" | "chatjimmy" | "gemini",
  ttsProvider: "fish-audio" as const,
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
  generateAfterSeconds: 10,
  playBeforeEndSeconds: 30,
  setupComplete: false,
  loggingEnabled: true,
  logLevel: "warn" as const,
  hostName: "Alexis",
  radioStation: "97.7 Youtube FM",
};

// Get stored API settings with defaults
const getAPISettings = async () => {
  const stored = await chrome.storage.sync.get();
  return { ...DEFAULT_SETTINGS, ...stored };
};

const stylePrompts = {
  energetic:
    "You are a high-energy radio DJ who's absolutely pumped about music!",
  chill: "You are a laid-back DJ with a smooth, relaxed vibe.",
  sarcastic:
    "You are a witty DJ who adds clever commentary with a touch of sarcasm.",
  professional: "You are a professional radio host with polished delivery.",
};

const lengthGuides = {
  short: "Keep it brief and punchy (20-30 seconds when spoken)",
  medium: "Moderate length with good flow (30-45 seconds when spoken)",
  long: "More detailed commentary (45-60 seconds when spoken)",
};

// Generate RJ prompt based on settings
function generateRJPrompt(
  currentSong: string,
  nextSong: string | null,
  style: keyof typeof stylePrompts,
  length: keyof typeof lengthGuides,
  scriptHistory: string | null,
  comments: string | null,
  currentSonglyrics: string | null,
  hostName?: string,
  radioStation?: string,
  customSystemPrompt?: string,
  extraContentType?: "joke" | "advertisement" | null
): { systemPrompt: string; currentTask: string } {
  const basePrompt = stylePrompts[style] || stylePrompts.energetic;
  const lengthGuide = lengthGuides[length] || lengthGuides.medium;

  const resolvedHostName = hostName || DEFAULT_SETTINGS.hostName;
  const resolvedRadioStation = radioStation || DEFAULT_SETTINGS.radioStation;

  const radioInfo = `Radio station: ${resolvedRadioStation}
Host name: ${resolvedHostName}`;

  const extraContentGuide = extraContentType === "joke"
    ? "Include one brief, original joke naturally in the commentary."
    : extraContentType === "advertisement"
      ? "Include one brief, clearly fictional advertisement for a generic product or service. Keep it playful and do not imply a real brand or endorsement."
      : "Do not add a joke or advertisement in this commentary.";
  const customInstructions = customSystemPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customSystemPrompt.trim()}`
    : "";

  const systemPrompt = `${basePrompt} ${lengthGuide}. ${radioInfo}.

Important guidelines:
- ${extraContentGuide}
- AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
- AVOID expressions in brackets or parentheses.
- AVOID saying Alright and Okay okay or similar phrases at the beginning. Cook up new intros.
- CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
- ONLY respond with the commentary text, do not include any additional instructions or explanations.${customInstructions}`.trim();

  let currentTask = `Current song: "${currentSong}"`;
  if (currentSonglyrics) {
    currentTask += `\nCurrent song Lyrics: ${currentSonglyrics}`;
  }
  if (nextSong) {
    currentTask += `\nUpcoming Song: "${nextSong}"`;
  }
  if (comments) {
    currentTask += `\nViewer comments: ${comments}`;
  }
  if (scriptHistory) {
    currentTask += `\nPrevious commentary history:\n${scriptHistory}`;
  }

  return { systemPrompt, currentTask };
}

// Call Gemini API with error handling
async function callGeminiAPI(prompt: string, apiKey: string) {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  return new Promise<string>((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "callGemini", payload, apiKey },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!response || !response.success) {
          return reject(
            new Error(response?.error || "Failed to call Gemini API")
          );
        }

        const data = response.data;
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          return reject(new Error("Invalid response from Gemini API"));
        }

        resolve(data.candidates[0].content.parts[0].text);
      }
    );
  });
}

// Call ChatJimmy API with error handling
async function callChatJimmyAPI(
  systemPromptOrObj: string | { systemPrompt: string; currentTask: string },
  currentTaskArg?: string
) {
  let systemPrompt: string;
  let currentTask: string;

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
      // {
      //   role: "user",
      //   content: `Previous: "Hello" by Adele\nNext: "Levitating" by Dua Lipa`,
      // },
      // {
      //   role: "assistant",
      //   content:
      //     "Adele keeping it deep with Hello. Now let's pick up the pace, here is Dua Lipa turning up the heat with Levitating!",
      // },
      // {
      //   role: "user",
      //   content: `Previous: "Hotel California" by Eagles\nNext: "Humble" by Kendrick Lamar`,
      // },
      // {
      //   role: "assistant",
      //   content:
      //     "That was the legendary Eagles. We're switching lanes completely now—turn your volume up for Kendrick Lamar.",
      // },
      { role: "user", content: currentTask },
    ],
    chatOptions: {
      selectedModel: "llama3.1-8B",
      systemPrompt: systemPrompt,
      topK: 2,
    },
    attachment: null,
  };

  return new Promise<string>((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "callChatJimmy", payload },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!response || !response.success) {
          return reject(
            new Error(response?.error || "Failed to call ChatJimmy API")
          );
        }

        const text = response.data;
        // The response might contain stats after <|stats|>. We want the part before it.
        const statsIndex = text.indexOf("<|stats|>");
        let result = text;
        if (statsIndex !== -1) {
          result = text.substring(0, statsIndex);
        }

        // Clean up potential quotes and whitespace
        resolve(result.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n").trim());
      }
    );
  });
}

// Call Murf.ai API with error handling
async function callMurfAPI(
  text: string,
  apiKey: string,
  voiceId = "en-US-natalie",
  style = "Promo"
) {
  if (!apiKey) {
    throw new Error("Murf.ai API key not configured");
  }

  const payload = {
    text: text,
    voiceId: voiceId,
    style: style,
  };

  return new Promise<{ audioBlob: Blob; duration: number; remainingChars: number }>(
    (resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "callMurf", payload, apiKey },
        (response) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }

          if (!response || !response.success) {
            return reject(
              new Error(response?.error || "Failed to call Murf API")
            );
          }

          const data = response.data;
          const base64 = response.audioBase64;

          // Convert base64 to Blob
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "audio/mpeg" });

          resolve({
            audioBlob: blob,
            duration: data.audioLengthInSeconds,
            remainingChars: data.remainingCharacterCount,
          });
        }
      );
    }
  );
}

// Call Fish Audio API with error handling
async function callFishAudioAPI(
  text: string,
  apiKey: string,
  referenceId = "ba1a38946dea44609fc4a8fe6113ed88"
) {
  if (!apiKey) {
    throw new Error("Fish Audio API key not configured");
  }

  return new Promise<{ audioBlob: Blob }>((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "callFishAudio",
        text,
        referenceId,
        apiKey,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!response || !response.success) {
          return reject(
            new Error(response?.error || "Failed to call Fish Audio API")
          );
        }

        const base64 = response.audioBase64;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mp3" });

        resolve({ audioBlob: blob });
      }
    );
  });
}

// Log commentary for export feature
function logCommentary(currentSong: string, nextSong: string, script: string) {
  chrome.runtime
    .sendMessage({
      action: "logCommentary",
      currentSong,
      nextSong,
      script,
    })
    .catch((error) => Logger.error("Failed to save commentary log", error));
}

async function callLyricsAPI(query: string) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "callLyrics", query },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!response || !response.success) {
          return reject(
            new Error(response?.error || "Failed to call Lyrics API")
          );
        }

        const data = response.data;
        resolve(data?.[0]?.plainLyrics);
      }
    );
  });
}

// Call OpenRouter API with error handling
async function callOpenRouterAPI(
  systemPrompt: string,
  currentTask: string,
  apiKey: string,
  model?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "OpenRouter API key not configured. Please add it in extension settings."
    );
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: currentTask },
  ];

  return new Promise<string>((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "callOpenRouter",
        apiKey,
        model: model || "recursive/flint-v1.0:free",
        messages,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        if (!response || !response.success) {
          return reject(
            new Error(response?.error || "Failed to call OpenRouter API")
          );
        }

        resolve(
          response.data
            .trim()
            .replace(/^"|"$/g, "")
            .replace(/\\n/g, "\n")
            .trim()
        );
      }
    );
  });
}

// Unified callLLM router based on settings.llmProvider
async function callLLM(
  systemPrompt: string,
  currentTask: string,
  settings?: any
): Promise<string> {
  const currentSettings = settings || (await getAPISettings());
  const provider = currentSettings.llmProvider || "openrouter";

  if (provider === "openrouter") {
    return callOpenRouterAPI(
      systemPrompt,
      currentTask,
      currentSettings.openRouterApiKey,
      currentSettings.openRouterModel
    );
  } else if (provider === "gemini") {
    return callGeminiAPI(
      `${systemPrompt}\n\n${currentTask}`,
      currentSettings.geminiApiKey
    );
  } else {
    return callChatJimmyAPI(systemPrompt, currentTask);
  }
}

const APIUtils = {
  callMurfAPI,
  callFishAudioAPI,
  callGeminiAPI,
  callChatJimmyAPI,
  callOpenRouterAPI,
  callLLM,
  callLyricsAPI,
  logCommentary,
  getAPISettings,
  generateRJPrompt,
};

// Make it globally available
(window as any).APIUtils = APIUtils;
export default APIUtils;

