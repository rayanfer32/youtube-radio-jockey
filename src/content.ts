import APIUtils from "./utils/api-utils";
import AudioUtils from "./utils/audio-utils";
import DomUtils from "./utils/dom-utils";
import YouTubeUtils from "./utils/youtube-utils";
import { GoogleTTS } from "../tests/google-tts";
import { FishAudioTTS } from "./utils/fish-audio";

class YouTubeRJMode {
  isRJModeActive: boolean;
  currentVideoTitle: string;
  nextVideoTitle: string;
  originalVolume: number;
  isRJPlaying: boolean;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  lastProcessedVideo: string;
  isGeneratingCommentary: boolean;
  videoChangeTimeout: any;
  progressInterval: any;
  scriptHistory: any[];
  googleTTS: GoogleTTS;
  fishAudioTTS: FishAudioTTS;
  ttsVoice: string;
  generatedAudioData: any;

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
    this.scriptHistory = [];
    this.googleTTS = new GoogleTTS(); // Initialize Google TTS instance
    this.fishAudioTTS = new FishAudioTTS(); // Initialize Fish Audio TTS instance
    this.ttsVoice = "en"; // Default TTS voice (language code for Google TTS)
    this.generatedAudioData = null; // Store generated audio data

    this.init();
  }

  async init() {
    await this.promptUserForAPIKeys();
    this.setupAudioContext();
    this.detectPlaylist();
    // this.setupVideoEventListeners();
    DomUtils.createRJModeButton(this.toggleRJMode.bind(this));
  }

  async promptUserForAPIKeys() {
    let settings = await APIUtils.getAPISettings();
    if (!settings.geminiApiKey) {
      let geminiApiKey = prompt("Enter your Gemini API Key:");
      if (geminiApiKey) {
        chrome.storage.sync.set({ geminiApiKey });
      } else {
        alert("Get free API key from https://aistudio.google.com/apikey");
      }
    }
    const provider =
      settings.ttsProvider ||
      (settings.fishApiKey
        ? "fish-audio"
        : settings.murfApiKey
          ? "murf"
          : "fish-audio");
    if (provider === "fish-audio" && !settings.fishApiKey) {
      let fishApiKey = prompt("Enter your Fish Audio API Key:");
      if (fishApiKey) {
        chrome.storage.sync.set({ fishApiKey });
      }
    }
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

  async generateRJCommentary() {
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

      let currentSonglyrics: string | null = null;
      try {
        currentSonglyrics = (await APIUtils.callLyricsAPI(
          this.currentVideoTitle
        )) as string | null;
      } catch (lyricsError) {
        console.warn(
          "Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",
          lyricsError
        );
      }

      // Use API utility functions
      const settings = await APIUtils.getAPISettings();
      const { systemPrompt, currentTask } = APIUtils.generateRJPrompt(
        this.currentVideoTitle,
        this.nextVideoTitle,
        settings.rjStyle,
        settings.commentaryLength,
        settings.includeHistory ? this.scriptHistory.join("\n") : "",
        settings.includeComments ? YouTubeUtils.getComments().join("\n") : "",
        currentSonglyrics as string,
        settings.hostName,
        settings.radioStation
      );

      console.log("Generated systemPrompt:", systemPrompt);
      console.log("Generated currentTask:", currentTask);

      const script = await APIUtils.callLLM(systemPrompt, currentTask, settings);

      console.log("Generated script:", script);

      this.scriptHistory.push(script);

      let audioData = {};
      const provider =
        settings.ttsProvider ||
        (settings.fishApiKey
          ? "fish-audio"
          : settings.murfApiKey
            ? "murf"
            : "fish-audio");

      if (provider === "fish-audio") {
        if (!settings.fishApiKey) {
          throw new Error(
            "Fish Audio API key not configured. Please add it in extension settings."
          );
        }
        const refId = settings.voiceId || "ba1a38946dea44609fc4a8fe6113ed88";
        await this.fishAudioTTS.synthesize(script, settings.fishApiKey, refId);
        audioData = {
          audioBlob: this.fishAudioTTS.toBlob(),
        };
      } else if (provider === "murf") {
        if (!settings.murfApiKey) {
          throw new Error(
            "Murf.ai API key not configured. Please add it in extension settings."
          );
        }
        audioData = await APIUtils.callMurfAPI(
          script,
          settings.murfApiKey,
          settings.voiceId,
          settings.voiceStyle
        );
      } else {
        // Fallback to Google TTS
        let lang = settings.voiceId || this.ttsVoice;
        // If it looks like an Edge TTS voice ID (e.g., en-US-AriaNeural), extract the lang part
        if (lang.includes("-") && lang.split("-").length > 2) {
          lang = lang.split("-").slice(0, 2).join("-");
        }

        await this.googleTTS.synthesize(script, lang);
        audioData = {
          audioBlob: this.googleTTS.toBlob(),
          // audioUrl: URL.createObjectURL(this.googleTTS.toBlob()),
        };
      }

      // Log the commentary
      APIUtils.logCommentary(
        this.currentVideoTitle,
        this.nextVideoTitle,
        script
      );

      this.generatedAudioData = audioData; // Store generated audio data for later use

      DomUtils.hideLoadingIndicator();
    } catch (error: any) {
      console.error("RJ Commentary generation failed:", error);
      DomUtils.hideLoadingIndicator();
      DomUtils.showErrorMessage(error.message);
    } finally {
      this.isGeneratingCommentary = false;
    }
  }

  async playRJCommentary() {
    const audioBlob = this.generatedAudioData?.audioBlob;

    if (!audioBlob) {
      console.error("No audio data available to play.");
      return;
    }

    if (this.isRJPlaying) {
      console.log("RJ already playing, skipping...");
      return;
    }

    this.isRJPlaying = true;

    const video = YouTubeUtils.getVideoElement();
    try {
      if (!video) {
        console.error("No video element found on the page.");
        this.isRJPlaying = false;
        return;
      }

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

      // Restore original volume
      if (video) {
        await AudioUtils.restoreVolume(video, this.originalVolume);
      }
    } finally {
      this.generatedAudioData = null; // Clear audio data after playback
    }
  }

  async restoreVolumeAndCleanup(video: HTMLVideoElement, audioUrl: string) {
    // Restore original volume using utility
    await AudioUtils.restoreVolume(video, this.originalVolume);

    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    this.isRJPlaying = false;
    console.log("RJ commentary cleanup completed");
  }

  async toggleRJMode() {
    this.isRJModeActive = !this.isRJModeActive;
    DomUtils.updateRJModeButton(this.isRJModeActive);

    if (this.isRJModeActive) {
      await this.startRJMode();
    } else {
      this.stopRJMode();
    }
  }

  async startRJMode() {
    this.getCurrentAndNextTitles();
    this.setupVideoEventListeners();
  }

  stopRJMode() {
    this.isRJModeActive = false;
    this.isRJPlaying = false;
    this.isGeneratingCommentary = false;
    this.lastProcessedVideo = "";
    DomUtils.updateRJModeButton(false);

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
      console.log("checkVideoProgress called");
      const video = document.querySelector("video");
      if (!video || !this.isRJModeActive) return;

      const timeRemaining = video.duration - video.currentTime;

      // generate commentary and keep it ready 10 seconds afer video starts
      if (
        video.currentTime > 10 &&
        !this.isGeneratingCommentary &&
        !this.generatedAudioData
      ) {
        this.getCurrentAndNextTitles();
        this.generateRJCommentary();
      }

      // Start commentary when 30 seconds remain and not already playing
      if (
        timeRemaining <= 30 &&
        !this.isRJPlaying &&
        !this.isGeneratingCommentary
      ) {
        this.playRJCommentary();
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

    // Start monitoring when RJ mode is active
    if (this.isRJModeActive) {
      setupProgressMonitoring();
    }
  }
}

// Listen for diagnostics triggers from the extension popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (
    request?.action === "generateRJCommentary" ||
    request?.action === "playRJCommentary"
  ) {
    const rj = (window as any).youtubeRJ;
    if (!rj) {
      sendResponse({ success: false, error: "RJ instance not available on this page" });
      return false;
    }
    const fn =
      request.action === "generateRJCommentary"
        ? rj.generateRJCommentary.bind(rj)
        : rj.playRJCommentary.bind(rj);
    fn()
      .then(() => sendResponse({ success: true }))
      .catch((err: any) =>
        sendResponse({ success: false, error: err?.message || String(err) })
      );
    return true;
  }
  return false;
});

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const youtubeRJ = new YouTubeRJMode();
    (window as any).youtubeRJ = youtubeRJ;
    console.log(youtubeRJ);
  });
} else {
  const youtubeRJ = new YouTubeRJMode();
  (window as any).youtubeRJ = youtubeRJ;
  console.log(youtubeRJ);
}
