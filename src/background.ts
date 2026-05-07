// Background script for handling extension lifecycle and API management
import * as googleTTS from "google-tts-api";

chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube RJ Mode extension installed");

  // Set default settings
  chrome.storage.sync.set({
    commentaryLength: "short",
    rjStyle: "sarcastic",
    voiceGender: "male",
    volumeDucking: 70,
    darkMode: false,
    autoStart: false,
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
  }
});
