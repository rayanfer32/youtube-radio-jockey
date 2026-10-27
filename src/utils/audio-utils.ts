// Extend Window interface to include webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Audio-related utility functions
import Logger from "./logger";

type VolumeTransition = {
  timers: ReturnType<typeof setTimeout>[];
  finish: () => void;
};

const volumeTransitions = new WeakMap<HTMLVideoElement, VolumeTransition>();

const AudioUtils = {
  // Create audio context with fallbacks
  createAudioContext() {
    try {
      return new (window.AudioContext || window.webkitAudioContext )();
    } catch (error) {
      Logger.error("Audio context creation failed", error);
      return null;
    }
  },

  // Smooth volume transition
  async smoothVolumeTransition(
    video: HTMLVideoElement,
    targetVolume: number,
    duration = 200
  ) {
    if (!video) return;

    const startVolume = video.volume;
    const steps = 20;
    const volumeStep = (targetVolume - startVolume) / steps;
    const timeStep = duration / steps;

    const previous = volumeTransitions.get(video);
    if (previous) {
      previous.timers.forEach(clearTimeout);
      previous.finish();
    }

    await new Promise<void>((resolve) => {
      const transition: VolumeTransition = {
        timers: [],
        finish: () => {
          if (volumeTransitions.get(video) === transition) volumeTransitions.delete(video);
          resolve();
        },
      };
      volumeTransitions.set(video, transition);
      for (let i = 0; i < steps; i++) {
        const timer = setTimeout(() => {
          const newVolume = Math.max(
            0,
            Math.min(1, startVolume + volumeStep * (i + 1))
          );
          video.volume = newVolume;
          if (i === steps - 1) transition.finish();
        }, timeStep * (i + 1));
        transition.timers.push(timer);
      }
    });
  },

  // Duck volume smoothly
  async duckVolume(video: HTMLVideoElement, duckLevel = 0.3) {
    if (!video) return 1;

    const originalVolume = video.volume;
    const targetVolume = originalVolume * Math.max(0, Math.min(1, duckLevel));
    await this.smoothVolumeTransition(video, targetVolume);
    return originalVolume;
  },

  // Restore volume smoothly
  async restoreVolume(video: HTMLVideoElement, targetVolume: number) {
    if (!video || targetVolume === undefined) return;
    await this.smoothVolumeTransition(video, targetVolume, 300);
  },

  // Create audio element with error handling
  createAudio(audioBlob: Blob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Add error handling
    audio.addEventListener("error", (error) => {
      Logger.error("Commentary audio element reported an error", error);
      URL.revokeObjectURL(audioUrl);
    });

    return { audio, audioUrl };
  },

  // Play audio with promise
  playAudio(audio: HTMLAudioElement) {
    return new Promise((resolve, reject) => {
      audio.addEventListener("ended", resolve);
      audio.addEventListener("error", reject);

      audio.play().catch(reject);
    });
  },
};

// Make it globally available
(window as any).AudioUtils = AudioUtils;
export default AudioUtils;
