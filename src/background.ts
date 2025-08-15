// Background script for handling extension lifecycle and API management
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
  }
});
