class YouTubeRJMode {
  constructor() {
    this.isRJModeActive = false;
    this.currentVideoTitle = "";
    this.nextVideoTitle = "";
    this.originalVolume = 1.0;
    this.isRJPlaying = false;
    this.audioContext = null;
    this.gainNode = null;

    this.init();
  }

  init() {
    this.setupAudioContext();
    this.detectPlaylist();
    this.setupVideoEventListeners();
    this.createRJModeButton();
  }

  setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
    } catch (error) {
      console.error("Audio context setup failed:", error);
    }
  }

  detectPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    const isPlaylist = urlParams.has("list");

    if (isPlaylist && !document.getElementById("rj-mode-button")) {
      this.showRJModePrompt();
    }
  }

  showRJModePrompt() {
    // Create a more prominent notification for playlist detection
    const notification = document.createElement("div");
    notification.id = "rj-mode-notification";
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>🎙️</span>
        <div>
          <strong>Playlist Detected!</strong>
          <br>
          <small>Ready to add some RJ magic?</small>
        </div>
        <button id="enable-rj-mode" style="
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          margin-left: auto;
        ">Enable RJ Mode</button>
        <button id="dismiss-rj-prompt" style="
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        ">×</button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #333;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.getElementById("rj-mode-styles")) {
      const style = document.createElement("style");
      style.id = "rj-mode-styles";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Event listeners for the notification
    document.getElementById("enable-rj-mode").addEventListener("click", () => {
      this.dismissNotification();
      this.toggleRJMode();
    });

    document
      .getElementById("dismiss-rj-prompt")
      .addEventListener("click", () => {
        this.dismissNotification();
      });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.dismissNotification();
    }, 10000);
  }

  dismissNotification() {
    const notification = document.getElementById("rj-mode-notification");
    if (notification) {
      notification.style.animation = "slideOutRight 0.3s ease-in";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }

  createRJModeButton() {
    const button = document.createElement("button");
    button.id = "rj-mode-button";
    button.innerHTML = "🎙️ Start RJ Mode";
    button.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.2s ease;
    `;

    button.addEventListener("click", () => this.toggleRJMode());
    button.addEventListener("mouseover", () => {
      button.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseout", () => {
      button.style.transform = "scale(1)";
    });

    document.body.appendChild(button);
  }

  async toggleRJMode() {
    this.isRJModeActive = !this.isRJModeActive;
    const button = document.getElementById("rj-mode-button");

    if (this.isRJModeActive) {
      button.innerHTML = "🎙️ Stop RJ Mode";
      button.style.background = "linear-gradient(45deg, #ff4757, #ff6b6b)";
      await this.startRJMode();
    } else {
      button.innerHTML = "🎙️ Start RJ Mode";
      button.style.background = "linear-gradient(45deg, #ff6b6b, #4ecdc4)";
      this.stopRJMode();
    }
  }

  async startRJMode() {
    this.getCurrentAndNextTitles();

    if (this.currentVideoTitle) {
      await this.generateAndPlayRJCommentary();
    }
  }

  getCurrentAndNextTitles() {
    // Get current video title
    const currentTitleElement = document.querySelector(
      "h1.title.style-scope.ytd-video-primary-info-renderer"
    );
    this.currentVideoTitle = currentTitleElement?.textContent?.trim() || "";

    // Get next video title from playlist
    const nextVideoElement = document.querySelector(
      ".ytd-playlist-panel-video-renderer[selected] + .ytd-playlist-panel-video-renderer #video-title"
    );
    this.nextVideoTitle = nextVideoElement?.textContent?.trim() || "";
  }

  async generateAndPlayRJCommentary() {
    try {
      // Show loading indicator
      this.showLoadingIndicator();

      // Generate script using Gemini API
      const script = await this.generateRJScript();

      // Convert to speech using Murf.ai
      const audioBlob = await this.generateTTS(script);

      // Play the commentary
      await this.playRJCommentary(audioBlob);

      this.hideLoadingIndicator();
    } catch (error) {
      console.error("RJ Commentary generation failed:", error);
      this.hideLoadingIndicator();
      this.showErrorMessage(error.message);
    }
  }

  showLoadingIndicator() {
    if (document.getElementById("rj-loading")) return;

    const loading = document.createElement("div");
    loading.id = "rj-loading";
    loading.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner"></div>
        <span>🎙️ Preparing RJ commentary...</span>
      </div>
    `;

    loading.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    // Add spinner CSS if not exists
    if (!document.getElementById("spinner-styles")) {
      const style = document.createElement("style");
      style.id = "spinner-styles";
      style.textContent = `
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loading);
  }

  hideLoadingIndicator() {
    const loading = document.getElementById("rj-loading");
    if (loading) loading.remove();
  }

  showErrorMessage(message) {
    const error = document.createElement("div");
    error.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: #ff4757;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;
    error.textContent = `❌ ${message}`;

    document.body.appendChild(error);

    setTimeout(() => {
      error.remove();
    }, 5000);
  }

  async generateRJScript() {
    const { geminiApiKey, rjStyle, commentaryLength } =
      await chrome.storage.sync.get([
        "geminiApiKey",
        "rjStyle",
        "commentaryLength",
      ]);

    if (!geminiApiKey) {
      throw new Error(
        "Gemini API key not configured. Please set it in the extension popup."
      );
    }

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

    const basePrompt = stylePrompts[rjStyle || "energetic"];
    const lengthGuide = lengthGuides[commentaryLength || "medium"];

    const prompt = `${basePrompt} ${lengthGuide}. 
    
Current song: "${this.currentVideoTitle}"
${this.nextVideoTitle ? `Next up: "${this.nextVideoTitle}"` : ""}

Create engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't just read the song titles - make it conversational and fun!`;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": geminiApiKey,
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

      const script = data.candidates[0].content.parts[0].text;

      // Log the commentary for export feature
      chrome.runtime.sendMessage({
        action: "logCommentary",
        currentSong: this.currentVideoTitle,
        nextSong: this.nextVideoTitle,
        script: script,
      });

      return script;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Failed to generate RJ script: ${error.message}`);
    }
  }

  async generateTTS(text) {
    const { murfApiKey, voiceId, voiceStyle } = await chrome.storage.sync.get([
      "murfApiKey",
      "voiceId",
      "voiceStyle",
    ]);

    if (!murfApiKey) {
      throw new Error(
        "Murf.ai API key not configured. Please set it in the extension popup."
      );
    }

    try {
      const response = await fetch("https://api.murf.ai/v1/speech/generate", {
        method: "POST",
        headers: {
          "api-key": murfApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId || "en-US-natalie",
          style: voiceStyle || "Promo",
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

      // Fetch the actual audio file from the returned URL
      const audioResponse = await fetch(data.audioFile);
      if (!audioResponse.ok) {
        throw new Error("Failed to fetch audio file from Murf.ai");
      }

      // Store audio duration for UI feedback
      this.lastAudioDuration = data.audioLengthInSeconds;

      // Log remaining character count for user awareness
      if (data.remainingCharacterCount !== undefined) {
        console.log(
          `Murf.ai characters remaining: ${data.remainingCharacterCount}`
        );
      }

      return await audioResponse.blob();
    } catch (error) {
      console.error("Murf.ai TTS error:", error);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  async playRJCommentary(audioBlob) {
    // Duck the YouTube video volume
    await this.duckVolume(0.3); // Reduce to 30%

    // Create and play RJ audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.addEventListener("loadeddata", () => {
      audio.play();
    });

    audio.addEventListener("ended", async () => {
      // Restore original volume
      await this.restoreVolume();
      URL.revokeObjectURL(audioUrl);
      this.isRJPlaying = false;
    });

    this.isRJPlaying = true;
  }

  async duckVolume(targetLevel) {
    const video = document.querySelector("video");
    if (video) {
      this.originalVolume = video.volume;

      // Smooth volume transition
      const steps = 20;
      const volumeStep = (this.originalVolume - targetLevel) / steps;
      const timeStep = 200; // 200ms total transition

      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          video.volume = Math.max(
            0,
            this.originalVolume - volumeStep * (i + 1)
          );
        }, (timeStep / steps) * i);
      }
    }
  }

  async restoreVolume() {
    const video = document.querySelector("video");
    if (video) {
      // Smooth volume restoration
      const steps = 20;
      const currentVolume = video.volume;
      const volumeStep = (this.originalVolume - currentVolume) / steps;
      const timeStep = 300;

      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          video.volume = Math.min(1, currentVolume + volumeStep * (i + 1));
        }, (timeStep / steps) * i);
      }
    }
  }

  setupVideoEventListeners() {
    // Listen for video changes in playlist
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" &&
          this.isRJModeActive &&
          !this.isRJPlaying
        ) {
          // Check if video title changed (new song started)
          const newTitle = document
            .querySelector(
              "h1.title.style-scope.ytd-video-primary-info-renderer"
            )
            ?.textContent?.trim();
          if (newTitle && newTitle !== this.currentVideoTitle) {
            setTimeout(() => {
              this.getCurrentAndNextTitles();
              this.generateAndPlayRJCommentary();
            }, 2000); // Wait 2 seconds for video to start
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  stopRJMode() {
    this.isRJModeActive = false;
    this.isRJPlaying = false;
  }
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new YouTubeRJMode();
  });
} else {
  new YouTubeRJMode();
}

// Handle navigation in YouTube SPA
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      if (url.includes("youtube.com") && url.includes("list=")) {
        new YouTubeRJMode();
      }
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });
