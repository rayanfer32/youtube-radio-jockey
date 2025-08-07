class YouTubeRJMode {
  constructor() {
    this.isRJModeActive = false;
    this.currentVideoTitle = "";
    this.nextVideoTitle = "";
    this.originalVolume = 1.0;
    this.isRJPlaying = false;
    this.audioContext = null;
    this.gainNode = null;
    this.lastProcessedVideo = "";
    this.isGeneratingCommentary = false;
    this.videoChangeTimeout = null;

    this.init();
  }

  init() {
    this.setupAudioContext();
    this.detectPlaylist();
    this.setupVideoEventListeners();
    this.createRJModeButton();
  }

  setupAudioContext() {
    this.audioContext = AudioUtils.createAudioContext();
    if (this.audioContext) {
      this.gainNode = this.audioContext.createGain();
    }
  }

  detectPlaylist() {
    // Use YouTube utility function
    if (
      YouTubeUtils.isPlaylistPage() &&
      !document.getElementById("rj-mode-button")
    ) {
      this.showRJModePrompt();
    }
  }

  getCurrentAndNextTitles() {
    // Use YouTube utility functions
    this.currentVideoTitle = YouTubeUtils.cleanVideoTitle(
      YouTubeUtils.getCurrentVideoTitle()
    );
    this.nextVideoTitle = YouTubeUtils.cleanVideoTitle(
      YouTubeUtils.getNextVideoTitle()
    );
  }

  async generateAndPlayRJCommentary() {
    // Prevent multiple simultaneous commentary generations
    if (this.isGeneratingCommentary || this.isRJPlaying) {
      console.log("Commentary already in progress, skipping...");
      return;
    }

    // Check if we've already processed this video
    const videoId = YouTubeUtils.extractVideoId() || this.currentVideoTitle;
    if (videoId === this.lastProcessedVideo) {
      console.log("Already processed this video, skipping...");
      return;
    }

    if (!this.currentVideoTitle || this.currentVideoTitle.trim() === "") {
      console.log("No current video title found, skipping...");
      return;
    }

    this.isGeneratingCommentary = true;
    this.lastProcessedVideo = videoId;

    try {
      DomUtils.showLoadingIndicator();

      // Use API utility functions
      const settings = await APIUtils.getAPISettings();
      const prompt = APIUtils.generateRJPrompt(
        this.currentVideoTitle,
        this.nextVideoTitle,
        settings.rjStyle,
        settings.commentaryLength
      );

      const script = await APIUtils.callGeminiAPI(
        prompt,
        settings.geminiApiKey
      );
      const audioData = await APIUtils.callMurfAPI(
        script,
        settings.murfApiKey,
        settings.voiceId,
        settings.voiceStyle
      );

      // Log the commentary
      APIUtils.logCommentary(
        this.currentVideoTitle,
        this.nextVideoTitle,
        script
      );

      // Play the commentary
      await this.playRJCommentary(audioData.audioBlob);

      DomUtils.hideLoadingIndicator();
    } catch (error) {
      console.error("RJ Commentary generation failed:", error);
      DomUtils.hideLoadingIndicator();
      DomUtils.showErrorMessage(error.message);
    } finally {
      this.isGeneratingCommentary = false;
    }
  }

  async playRJCommentary(audioBlob) {
    if (this.isRJPlaying) {
      console.log("RJ already playing, skipping...");
      return;
    }

    this.isRJPlaying = true;

    try {
      const video = YouTubeUtils.getVideoElement();

      // Duck the YouTube video volume using utility
      this.originalVolume = await AudioUtils.duckVolume(video, 0.3);

      // Create and play RJ audio using utility
      const { audio, audioUrl } = AudioUtils.createAudio(audioBlob);

      audio.addEventListener("ended", () => {
        this.restoreVolumeAndCleanup(video, audioUrl);
      });

      audio.addEventListener("error", (error) => {
        console.error("Audio error:", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });

      // Play audio
      await AudioUtils.playAudio(audio).catch((error) => {
        console.error("Audio playback failed:", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
    } catch (error) {
      console.error("Error playing RJ commentary:", error);
      this.isRJPlaying = false;
      await AudioUtils.restoreVolume(
        YouTubeUtils.getVideoElement(),
        this.originalVolume
      );
    }
  }

  async restoreVolumeAndCleanup(video, audioUrl) {
    // Restore original volume using utility
    await AudioUtils.restoreVolume(video, this.originalVolume);

    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    this.isRJPlaying = false;
    console.log("RJ commentary cleanup completed");
  }

  handleVideoChange() {
    // Use YouTube utility functions
    const newTitle = YouTubeUtils.getCurrentVideoTitle();
    const newVideoId = YouTubeUtils.extractVideoId() || newTitle;

    if (
      newTitle &&
      newTitle !== this.currentVideoTitle &&
      newVideoId !== this.lastProcessedVideo
    ) {
      console.log("New video detected:", newTitle);
      this.getCurrentAndNextTitles();
      this.generateAndPlayRJCommentary();
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

    // ! video progress listener will take care of this
    // if (this.currentVideoTitle) {
    //   await this.generateAndPlayRJCommentary();
    // }
  }

  stopRJMode() {
    this.isRJModeActive = false;
    this.isRJPlaying = false;
    this.isGeneratingCommentary = false;
    this.lastProcessedVideo = "";

    // Clear any pending timeouts and intervals
    if (this.videoChangeTimeout) {
      clearTimeout(this.videoChangeTimeout);
      this.videoChangeTimeout = null;
    }

    // Clear all intervals (including progress monitoring)
    const maxIntervalId = setInterval(() => {}, 0);
    for (let i = 1; i <= maxIntervalId; i++) {
      clearInterval(i);
    }

    // Clean up any loading indicators
    DomUtils.hideLoadingIndicator();

    logger.log("RJ Mode stopped and cleaned up");
  }

  setupVideoEventListeners() {
    // Progress check interval
    let progressInterval = null;

    // Monitor video progress
    const checkVideoProgress = () => {
      const video = document.querySelector("video");
      if (!video || !this.isRJModeActive) return;

      const timeRemaining = video.duration - video.currentTime;

      // Start commentary when 30 seconds remain and not already playing
      if (
        timeRemaining <= 30 &&
        !this.isRJPlaying &&
        !this.isGeneratingCommentary
      ) {
        this.getCurrentAndNextTitles();
        this.generateAndPlayRJCommentary();
      }
    };

    // Set up video progress monitoring
    const setupProgressMonitoring = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      progressInterval = setInterval(checkVideoProgress, 1000);
    };

    // Clear progress monitoring
    const clearProgressMonitoring = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

    // Video change detection with debouncing
    const observer = new MutationObserver(() => {
      if (!this.isRJModeActive) return;

      // Clear existing timeout and monitoring
      if (this.videoChangeTimeout) {
        clearTimeout(this.videoChangeTimeout);
      }
      clearProgressMonitoring();

      // Debounce video changes
      this.videoChangeTimeout = setTimeout(() => {
        setupProgressMonitoring();
      }, 3000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Start monitoring when RJ mode is active
    if (this.isRJModeActive) {
      setupProgressMonitoring();
    }

    // Also listen for URL changes (YouTube SPA navigation)
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;

        // Clear timeout and reset state on URL change
        if (this.videoChangeTimeout) {
          clearTimeout(this.videoChangeTimeout);
        }

        setTimeout(() => {
          if (
            this.isRJModeActive &&
            !this.isRJPlaying &&
            !this.isGeneratingCommentary
          ) {
            this.handleVideoChange();
          }
        }, 2000);
      }
    });

    urlObserver.observe(document, { subtree: true, childList: true });
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
