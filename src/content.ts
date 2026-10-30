import APIUtils from "./utils/api-utils";
import AudioUtils from "./utils/audio-utils";
import DomUtils from "./utils/dom-utils";
import YouTubeUtils from "./utils/youtube-utils";
import { GoogleTTS } from "./utils/google-tts";
import { FishAudioTTS } from "./utils/fish-audio";
import Logger from "./utils/logger";

type RJStatus = "standby" | "waiting" | "generating" | "ready" | "playing" | "error";

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
  status: RJStatus;
  statusMessage: string;
  generateAfterSeconds: number;
  playBeforeEndSeconds: number;
  activeAudio: HTMLAudioElement | null;
  activeAudioUrl: string;
  duckedVideo: HTMLVideoElement | null;
  duckLevel: number;
  lastAppliedVolume: number | null;
  volumeChangeHandler: (() => void) | null;

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
    this.status = "standby";
    this.statusMessage = "RJ mode is off";
    this.generateAfterSeconds = 10;
    this.playBeforeEndSeconds = 30;
    this.activeAudio = null;
    this.activeAudioUrl = "";
    this.duckedVideo = null;
    this.duckLevel = 1;
    this.lastAppliedVolume = null;
    this.volumeChangeHandler = null;

    this.init();
  }

  async init() {
    this.setupAudioContext();
    DomUtils.createRJModeButton(this.toggleRJMode.bind(this));

    const settings = await APIUtils.getAPISettings();
    this.generateAfterSeconds = settings.generateAfterSeconds ?? 10;
    this.playBeforeEndSeconds = settings.playBeforeEndSeconds ?? 30;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      if (changes.generateAfterSeconds) this.generateAfterSeconds = changes.generateAfterSeconds.newValue ?? 10;
      if (changes.playBeforeEndSeconds) this.playBeforeEndSeconds = changes.playBeforeEndSeconds.newValue ?? 30;
    });
    if (settings.autoStart && YouTubeUtils.isPlaylistPage()) {
      await this.startRJMode();
      DomUtils.updateRJModeButton(true);
      Logger.info("RJ mode started automatically for playlist");
    }
  }

  setupAudioContext() {
    this.audioContext = AudioUtils.createAudioContext();
    if (this.audioContext) {
      this.gainNode = this.audioContext.createGain();
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

  setStatus(status: RJStatus, message?: string) {
    const defaultMessages: Record<RJStatus, string> = {
      standby: "RJ mode is off",
      waiting: "Waiting for the next track",
      generating: "Preparing commentary",
      ready: "Commentary is ready to play",
      playing: "RJ commentary is on air",
      error: "Something went wrong",
    };
    const resolvedMessage = message || defaultMessages[status];
    if (this.status === status && this.statusMessage === resolvedMessage) return;
    this.status = status;
    this.statusMessage = resolvedMessage;
    chrome.runtime.sendMessage({ action: "rjStatusChanged", status, message: resolvedMessage, active: this.isRJModeActive }).catch(() => {});
  }

  async generateRJCommentary(force = false, attempt = 0): Promise<boolean> {
    // Prevent multiple simultaneous commentary generations
    if ((this.isGeneratingCommentary && attempt === 0) || this.isRJPlaying) {
      Logger.debug("Skipped commentary generation because audio work is active");
      return false;
    }

    // Check if we've already processed this video
    const videoId = YouTubeUtils.extractVideoId() || this.currentVideoTitle;
    if (!force && attempt === 0 && videoId === this.lastProcessedVideo) {
      Logger.debug("Skipped commentary generation for an already processed track");
      return false;
    }

    if (!this.currentVideoTitle || this.currentVideoTitle.trim() === "") {
      Logger.debug("Skipped commentary generation because the current track title is unavailable");
      return false;
    }

    this.isGeneratingCommentary = true;
    this.lastProcessedVideo = videoId;
    this.setStatus("generating", "Writing and preparing commentary");

    try {
      DomUtils.showLoadingIndicator();

      let currentSonglyrics: string | null = null;
      try {
        currentSonglyrics = (await APIUtils.callLyricsAPI(
          this.currentVideoTitle
        )) as string | null;
      } catch (lyricsError) {
        Logger.warn(
          "Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",
          lyricsError
        );
      }

      // Use API utility functions
      const settings = await APIUtils.getAPISettings();
      const enabledExtras: Array<"joke" | "advertisement"> = [];
      if (settings.includeJokes) enabledExtras.push("joke");
      if (settings.includeAdvertisements) enabledExtras.push("advertisement");
      const extraContentType = enabledExtras.length > 0 &&
        Math.random() * 100 < Math.max(0, Math.min(100, Number(settings.extraContentFrequency ?? 50)))
        ? enabledExtras[Math.floor(Math.random() * enabledExtras.length)]
        : null;
      const { systemPrompt, currentTask } = APIUtils.generateRJPrompt(
        this.currentVideoTitle,
        this.nextVideoTitle,
        settings.rjStyle as "energetic" | "chill" | "sarcastic" | "professional",
        settings.commentaryLength as "short" | "medium" | "long",
        settings.includeHistory ? this.scriptHistory.join("\n") : "",
        settings.includeComments ? YouTubeUtils.getComments().join("\n") : "",
        currentSonglyrics as string,
        settings.hostName,
        settings.radioStation,
        settings.customSystemPrompt,
        extraContentType
      );

      const script = await APIUtils.callLLM(systemPrompt, currentTask, settings);

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
      this.setStatus("ready", "Commentary is ready to play");
      Logger.info("Commentary audio is ready");

      DomUtils.hideLoadingIndicator();
      return true;
    } catch (error: any) {
      DomUtils.hideLoadingIndicator();
      const message = String(error?.message || error || "");
      const retryable = /\b429\b|\b5\d\d\b|failed to fetch|networkerror|network request|timed? ?out|timeout|temporarily unavailable|err_(?:connection|network)/i.test(message);
      const maxAttempts = 3;
      if (retryable && attempt < maxAttempts - 1) {
        const delayMs = 1000 * Math.pow(2, attempt);
        const retryNumber = attempt + 2;
        Logger.warn(`Commentary request failed; retrying attempt ${retryNumber}/${maxAttempts} in ${delayMs}ms`, error);
        this.setStatus("generating", `Temporary service issue. Retrying ${retryNumber}/${maxAttempts} in ${delayMs / 1000}s`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return await this.generateRJCommentary(true, attempt + 1);
      }
      Logger.error("Commentary generation failed", error);
      DomUtils.showErrorMessage(message || "Commentary generation failed");
      this.setStatus("error", message || "Commentary generation failed");
      this.lastProcessedVideo = "";
      return false;
    } finally {
      DomUtils.hideLoadingIndicator();
      this.isGeneratingCommentary = false;
    }
  }

  async playRJCommentary() {
    const audioBlob = this.generatedAudioData?.audioBlob;

    if (!audioBlob) {
      Logger.warn("Playback requested before commentary audio was ready");
      return;
    }

    if (this.isRJPlaying) {
      return;
    }

    this.isRJPlaying = true;
    this.setStatus("playing", "RJ commentary is on air");

    const video = YouTubeUtils.getVideoElement();
    try {
      if (!video) {
        Logger.error("Could not play commentary because the YouTube video element was unavailable");
        this.isRJPlaying = false;
        this.setStatus("error", "YouTube video player was not found");
        return;
      }

      // The control sets ducking depth in dB, so convert it to linear gain.
      const settings = await APIUtils.getAPISettings();
      const duckingDb =
        -(Math.max(0, Math.min(100, settings.volumeDucking)) / 100) * 24;
      const duckLevel = Math.pow(10, duckingDb / 20);
      // Save this before the asynchronous fade so stopping during the fade can
      // restore the player's volume even before the commentary audio exists.
      this.originalVolume = video.volume;
      this.duckedVideo = video;
      this.duckLevel = duckLevel;
      this.originalVolume = await AudioUtils.duckVolume(video, duckLevel);
      // stopRJMode may have cancelled the fade while it was in progress.
      if (!this.isRJPlaying) {
        this.releaseVolumeHold();
        await AudioUtils.restoreVolume(video, this.originalVolume);
        return;
      }
      this.lastAppliedVolume = video.volume;
      this.volumeChangeHandler = () => {
        if (!this.isRJPlaying || this.duckedVideo !== video) return;
        const currentVolume = video.volume;
        if (this.lastAppliedVolume !== null && Math.abs(currentVolume - this.lastAppliedVolume) < 0.005) {
          this.lastAppliedVolume = null;
          return;
        }

        // YouTube occasionally reapplies its stored player volume. Treat external
        // changes as the new user volume, then keep the configured ducking ratio.
        this.originalVolume = currentVolume;
        const heldVolume = currentVolume * this.duckLevel;
        if (Math.abs(currentVolume - heldVolume) >= 0.005) {
          this.lastAppliedVolume = heldVolume;
          video.volume = heldVolume;
        }
      };
      video.addEventListener("volumechange", this.volumeChangeHandler);

      // Create and play RJ audio using utility
      const { audio, audioUrl } = AudioUtils.createAudio(audioBlob);
      this.activeAudio = audio;
      this.activeAudioUrl = audioUrl;

      audio.addEventListener("ended", () => {
        this.restoreVolumeAndCleanup(video, audioUrl);
      });

      audio.addEventListener("error", (error) => {
        Logger.error("Commentary audio playback error", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });

      // Play audio
      await AudioUtils.playAudio(audio).catch((error) => {
        Logger.error("Commentary audio playback failed", error);
        this.restoreVolumeAndCleanup(video, audioUrl);
      });
    } catch (error) {
      Logger.error("Could not play commentary", error);
      this.isRJPlaying = false;
      this.releaseVolumeHold();

      // Restore original volume
      if (video) {
        await AudioUtils.restoreVolume(video, this.originalVolume);
      }
    } finally {
      this.generatedAudioData = null; // Clear audio data after playback
    }
  }

  async restoreVolumeAndCleanup(video: HTMLVideoElement, audioUrl: string) {
    if (!this.isRJPlaying) return;
    this.isRJPlaying = false;
    this.releaseVolumeHold();

    // Restore the latest volume observed during playback.
    await AudioUtils.restoreVolume(video, this.originalVolume);

    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    this.activeAudio = null;
    this.activeAudioUrl = "";
    this.setStatus(this.isRJModeActive ? "waiting" : "standby");
    Logger.info("Commentary playback finished");
  }

  releaseVolumeHold() {
    if (this.duckedVideo && this.volumeChangeHandler) {
      this.duckedVideo.removeEventListener("volumechange", this.volumeChangeHandler);
    }
    this.duckedVideo = null;
    this.volumeChangeHandler = null;
    this.lastAppliedVolume = null;
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
    this.isRJModeActive = true;
    this.getCurrentAndNextTitles();
    this.setupVideoEventListeners();
    Logger.info("RJ mode started");
    this.setStatus("waiting", "Waiting for the next track");
  }

  stopRJMode() {
    this.isRJModeActive = false;
    const video = this.duckedVideo || YouTubeUtils.getVideoElement();
    const wasPlaying = this.isRJPlaying;
    this.isRJPlaying = false;
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      if (this.activeAudioUrl) URL.revokeObjectURL(this.activeAudioUrl);
      this.activeAudio = null;
      this.activeAudioUrl = "";
    }
    if (wasPlaying || this.duckedVideo) {
      this.releaseVolumeHold();
      if (video) void AudioUtils.restoreVolume(video, this.originalVolume);
    }
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
    Logger.info("RJ mode stopped");
    this.setStatus("standby", "RJ mode is off");

  }

  setupVideoEventListeners() {
    // Progress check interval

    // Monitor video progress
    const checkVideoProgress = () => {
      const video = document.querySelector("video");
      if (!video || !this.isRJModeActive) return;

      const timeRemaining = video.duration - video.currentTime;

      // Generate commentary after the configured elapsed time.
      if (
        video.currentTime > this.generateAfterSeconds &&
        !this.isGeneratingCommentary &&
        !this.generatedAudioData
      ) {
        this.getCurrentAndNextTitles();
        const videoId = YouTubeUtils.extractVideoId() || this.currentVideoTitle;
        if (videoId !== this.lastProcessedVideo) {
          void this.generateRJCommentary();
        }
      }

      // Start commentary when 30 seconds remain and not already playing
      if (
        timeRemaining <= this.playBeforeEndSeconds &&
        !this.isRJPlaying &&
        !this.isGeneratingCommentary
      ) {
        this.playRJCommentary();
      } else if (!this.generatedAudioData && !this.isGeneratingCommentary && this.isRJModeActive) {
        this.setStatus("waiting", "Waiting for commentary timing window");
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
  if (["toggleRJMode", "getRJStatus", "testCommentary"].includes(request?.action)) {
    const rj = (window as any).youtubeRJ;
    if (!rj) {
      sendResponse({ success: false, error: "RJ instance not available on this page" });
      return false;
    }
    if (request.action === "getRJStatus") {
      sendResponse({ success: true, active: rj.isRJModeActive, status: rj.status, message: rj.statusMessage });
      return false;
    }
    const task = request.action === "toggleRJMode"
      ? rj.toggleRJMode().then(() => ({ active: rj.isRJModeActive, status: rj.status, message: rj.statusMessage }))
      : (async () => {
          rj.getCurrentAndNextTitles();
          if (!rj.currentVideoTitle) rj.currentVideoTitle = YouTubeUtils.cleanVideoTitle(document.title.replace(/ - YouTube$/, ""));
          const generated = await rj.generateRJCommentary(true);
          if (generated) await rj.playRJCommentary();
          return { active: rj.isRJModeActive, status: rj.status, message: rj.statusMessage };
        })();
    task.then((result: any) => sendResponse({ success: true, ...result }))
      .catch((error: any) => sendResponse({ success: false, error: error?.message || String(error) }));
    return true;
  }
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
  });
} else {
  const youtubeRJ = new YouTubeRJMode();
  (window as any).youtubeRJ = youtubeRJ;
}
