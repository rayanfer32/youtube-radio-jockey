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
      // Generate script using Gemini API
      const script = await this.generateRJScript();

      // Convert to speech using Murf.ai
      const audioBlob = await this.generateTTS(script);

      // Play the commentary
      await this.playRJCommentary(audioBlob);
    } catch (error) {
      console.error("RJ Commentary generation failed:", error);
    }
  }

  async generateRJScript() {
    const { geminiApiKey } = await chrome.storage.sync.get(["geminiApiKey"]);

    const prompt = `You are an energetic radio DJ. Create a short, upbeat commentary (30-45 seconds when spoken) about the current song "${
      this.currentVideoTitle
    }"${
      this.nextVideoTitle
        ? ` and briefly mention the next song "${this.nextVideoTitle}"`
        : ""
    }. Be enthusiastic, add some humor, and keep it engaging. Don't be too long-winded.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateTTS(text) {
    const { murfApiKey, voiceId, voiceStyle } = await chrome.storage.sync.get([
      "murfApiKey",
      "voiceId",
      "voiceStyle",
    ]);

    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${murfApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voiceId: voiceId || "en-US-davis",
        style: voiceStyle || "Conversational",
        text: text,
        rate: 0,
        pitch: 0,
        sampleRate: 48000,
        format: "MP3",
        channelType: "MONO",
      }),
    });

    return await response.blob();
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
        console.log('Navigated to YouTube playlist');
        new YouTubeRJMode();
      }
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

function generateRJPrompt(currentSong, nextSong, style, length) {
  const basePrompts = {
    energetic:
      "You're a high-energy radio DJ who's absolutely pumped about music!",
    chill: "You're a laid-back DJ with a smooth, relaxed vibe.",
    sarcastic:
      "You're a witty DJ who adds clever commentary with a touch of sarcasm.",
    professional: "You're a professional radio host with polished delivery.",
  };

  const lengthGuides = {
    short: "Keep it brief and punchy (20-30 seconds when spoken)",
    medium: "Moderate length with good flow (30-45 seconds when spoken)",
    long: "More detailed commentary (45-60 seconds when spoken)",
  };

  return `${basePrompts[style]} ${lengthGuides[length]}. 
          Current song: "${currentSong}"
          ${nextSong ? `Next up: "${nextSong}"` : ""}
          Create engaging commentary that connects with listeners.`;
}
