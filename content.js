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
    this.progressInterval = null;

    this.init();
  }

  init() {
    this.setupAudioContext();
    this.detectPlaylist();
    this.setupVideoEventListeners();
    DomUtils.createRJModeButton(this.toggleRJMode.bind(this));
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
      DomUtils.showRJModePrompt(this.toggleRJMode.bind(this));
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
      this.originalVolume = await AudioUtils.duckVolume(video, 0.1);

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

  // ! disable this method for now
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
      // this.getCurrentAndNextTitles();
      // this.generateAndPlayRJCommentary();
    }
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

    clearInterval(this.progressInterval);

    // Clean up any loading indicators
    DomUtils.hideLoadingIndicator();

    console.log("RJ Mode stopped and cleaned up");
  }

  setupVideoEventListeners() {
    // Progress check interval

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
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      this.progressInterval = setInterval(checkVideoProgress, 1000);
    };

    // Clear progress monitoring
    const clearProgressMonitoring = () => {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
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
  }
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const youtubeRJ = new YouTubeRJMode();
    window.youtubeRJ = youtubeRJ;
    console.log(youtubeRJ);
  });
} else {
  const youtubeRJ = new YouTubeRJMode();
  window.youtubeRJ = youtubeRJ;
  console.log(youtubeRJ);
}
