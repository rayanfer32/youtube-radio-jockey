// API-related utility functions

// Get stored API settings
const getAPISettings = async () => {
  return await chrome.storage.sync.get();
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
  hostName: string,
  radioStation: string
) {
  const basePrompt = stylePrompts[style] || stylePrompts.energetic;
  const lengthGuide = lengthGuides[length] || lengthGuides.medium;

  const radioInfo = `Radio station: ${radioStation}
  Host name: ${hostName}`;

  return `${basePrompt} ${lengthGuide} ${radioInfo}. 

${scriptHistory && "Here's some of your previous commentary: \n" + scriptHistory
    }
${comments && "Here are some comments from viewers: \n" + comments}

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
async function callChatJimmyAPI(prompt: string) {
  const payload = {
    messages: [
      {
        role: "system",
        content: "Generate commentary without expressions in the brackets",
      },
    ],
    chatOptions: {
      selectedModel: "llama3.1-8B",
      systemPrompt: prompt,
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

// Log commentary for export feature
function logCommentary(currentSong: string, nextSong: string, script: string) {
  chrome.runtime
    .sendMessage({
      action: "logCommentary",
      currentSong,
      nextSong,
      script,
    })
    .catch(console.error);
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
        console.log("Lyrics API response:", data);
        resolve(data?.[0]?.plainLyrics);
      }
    );
  });
}

const APIUtils = {
  callMurfAPI,
  callGeminiAPI,
  callChatJimmyAPI,
  callLyricsAPI,
  logCommentary,
  getAPISettings,
  generateRJPrompt,
};

// Make it globally available
(window as any).APIUtils = APIUtils;
export default APIUtils;
