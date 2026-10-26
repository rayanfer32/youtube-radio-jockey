// Background script for handling extension lifecycle and API management
import * as googleTTS from "google-tts-api";

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("YouTube RJ Mode extension event:", details.reason);

  // Preserve existing settings across reloads/updates; only fill in missing fields
  const existing = await chrome.storage.sync.get();
  chrome.storage.sync.set({
    commentaryLength: existing.commentaryLength ?? "short",
    rjStyle: existing.rjStyle ?? "sarcastic",
    voiceGender: existing.voiceGender ?? "male",
    volumeDucking: existing.volumeDucking ?? 70,
    darkMode: existing.darkMode ?? false,
    autoStart: existing.autoStart ?? false,
    ttsProvider: existing.ttsProvider ?? "fish-audio",
    fishApiKey: existing.fishApiKey ?? "",
    geminiApiKey: existing.geminiApiKey ?? "",
    murfApiKey: existing.murfApiKey ?? "",
    voiceId: existing.voiceId ?? "ba1a38946dea44609fc4a8fe6113ed88",
    hostName: existing.hostName ?? "Alexis",
    radioStation: existing.radioStation ?? "97.7 Youtube FM",
    llmProvider: existing.llmProvider ?? "openrouter",
    openRouterApiKey: existing.openRouterApiKey ?? "",
    openRouterModel: existing.openRouterModel ?? "recursive/flint-v1.0:free",
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logCommentary") {
    // Store commentary logs
    chrome.storage.local.get(["commentaryLogs"], (result) => {
      const logs = result.commentaryLogs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        currentSong: request.currentSong,
        nextSong: request.nextSong,
        script: request.script,
        url: sender?.tab?.url,
      });

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      chrome.storage.local.set({ commentaryLogs: logs });
    });
  } else if (request.action === "callChatJimmy") {
    fetch("https://chatjimmy.ai/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`ChatJimmy API error: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => sendResponse({ success: true, data: text }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  } else if (request.action === "getTTSAudio") {
    const { text, lang } = request.payload;
    
    try {
      const results = googleTTS.getAllAudioUrls(text, {
        lang: lang,
        slow: false,
        host: "https://translate.google.com",
        splitPunct: ". ",
      });

      Promise.all(
        results.map(async (item) => {
          const response = await fetch(item.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          
          // Convert ArrayBuffer to Base64
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          return btoa(binary);
        })
      )
        .then((base64Chunks) => {
          sendResponse({ success: true, data: base64Chunks });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
  } else if (request.action === "callLyrics") {
    fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(request.query)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Lyrics API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  } else if (request.action === "callGemini") {
    fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": request.apiKey,
        },
        body: JSON.stringify(request.payload),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callMurf") {
    fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": request.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message || `Murf API error: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(async (data) => {
        if (!data.audioFile) throw new Error("No audio file returned");
        const audioResponse = await fetch(data.audioFile);
        if (!audioResponse.ok) throw new Error("Failed to fetch audio file");
        const blob = await audioResponse.blob();
        // Convert blob to base64 to send back
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          sendResponse({ success: true, data, audioBase64: base64 });
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callFishAudio") {
    const { text, referenceId, apiKey } = request;
    fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text: text,
        reference_id: referenceId || "ba1a38946dea44609fc4a8fe6113ed88",
        format: "mp3",
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `Fish Audio API error: ${response.status} ${response.statusText} - ${errorText}`
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        sendResponse({ success: true, audioBase64: base64 });
      })
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callOpenRouter") {
    const { apiKey, model, messages } = request;
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://youtube-rj-mode.extension",
        "X-Title": "YouTube RJ Mode",
      },
      body: JSON.stringify({
        model: model || "recursive/flint-v1.0:free",
        messages: messages,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `OpenRouter API error: ${response.status} - ${errorText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No response text returned by OpenRouter model");
        }
        sendResponse({ success: true, data: content });
      })
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
