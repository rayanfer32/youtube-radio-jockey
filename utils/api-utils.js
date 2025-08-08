// API-related utility functions
const APIUtils = {
  // Get stored API settings
  async getAPISettings() {
    return await chrome.storage.sync.get([
      "geminiApiKey",
      "murfApiKey",
      "rjStyle",
      "commentaryLength",
      "voiceId",
      "voiceStyle",
    ]);
  },

  // Generate RJ prompt based on settings
  generateRJPrompt(
    currentSong,
    nextSong,
    style = "energetic",
    length = "medium"
  ) {
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

    const basePrompt = stylePrompts[style] || stylePrompts.energetic;
    const lengthGuide = lengthGuides[length] || lengthGuides.medium;

    return `${basePrompt} ${lengthGuide}. 
    
Current song: "${currentSong}"
${nextSong ? `Next up: "${nextSong}"` : ""}

Create engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't just read the song titles - make it conversational and fun!`;
  },

  // Call Gemini API with error handling
  async callGeminiAPI(prompt, apiKey) {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  },

  // Call Murf.ai API with error handling
  async callMurfAPI(text, apiKey, voiceId = "en-US-natalie", style = "Promo") {
    if (!apiKey) {
      throw new Error("Murf.ai API key not configured");
    }

    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceId,
        style: style,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Murf.ai API error: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    if (!data.audioFile) {
      throw new Error("No audio file returned from Murf.ai API");
    }

    // Fetch the actual audio file
    const audioResponse = await fetch(data.audioFile);
    if (!audioResponse.ok) {
      throw new Error("Failed to fetch audio file from Murf.ai");
    }

    return {
      audioBlob: await audioResponse.blob(),
      duration: data.audioLengthInSeconds,
      remainingChars: data.remainingCharacterCount,
    };
  },

  // Log commentary for export feature
  logCommentary(currentSong, nextSong, script) {
    chrome.runtime
      .sendMessage({
        action: "logCommentary",
        currentSong,
        nextSong,
        script,
      })
      .catch(console.error);
  },
};

// Make it globally available
window.APIUtils = APIUtils;
