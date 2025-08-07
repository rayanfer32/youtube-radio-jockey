// Background script for handling extension lifecycle and API management
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube RJ Mode extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    commentaryLength: 'short',
    rjStyle: 'sarcastic',
    voiceGender: 'male',
    volumeDucking: 10,
    darkMode: false,
    autoStart: false
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logCommentary') {
    // Store commentary logs
    chrome.storage.local.get(['commentaryLogs'], (result) => {
      const logs = result.commentaryLogs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        currentSong: request.currentSong,
        nextSong: request.nextSong,
        script: request.script,
        url: sender.tab.url
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      chrome.storage.local.set({ commentaryLogs: logs });
    });
  }
});

// Handle API rate limiting and error management
class APIManager {
  constructor() {
    this.requestCounts = {
      gemini: { count: 0, resetTime: Date.now() + 3600000 }, // 1 hour
      murf: { count: 0, resetTime: Date.now() + 3600000 }
    };
  }
  
  canMakeRequest(service, limit = 60) { // 60 requests per hour default
    const now = Date.now();
    const serviceData = this.requestCounts[service];
    
    if (now > serviceData.resetTime) {
      serviceData.count = 0;
      serviceData.resetTime = now + 3600000;
    }
    
    return serviceData.count < limit;
  }
  
  incrementRequestCount(service) {
    this.requestCounts[service].count++;
  }
}

const apiManager = new APIManager();

// Expose API manager to content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAPILimit') {
    sendResponse({
      canMakeRequest: apiManager.canMakeRequest(request.service, request.limit)
    });
  } else if (request.action === 'incrementAPICount') {
    apiManager.incrementRequestCount(request.service);
    sendResponse({ success: true });
  }
});