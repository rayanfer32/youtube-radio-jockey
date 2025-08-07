// Audio-related utility functions
const AudioUtils = {
  
  // Create audio context with fallbacks
  createAudioContext() {
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Audio context creation failed:', error);
      return null;
    }
  },

  // Smooth volume transition
  async smoothVolumeTransition(video, targetVolume, duration = 200) {
    if (!video) return;
    
    const startVolume = video.volume;
    const steps = 20;
    const volumeStep = (targetVolume - startVolume) / steps;
    const timeStep = duration / steps;
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        const newVolume = Math.max(0, Math.min(1, startVolume + (volumeStep * (i + 1))));
        video.volume = newVolume;
      }, timeStep * i);
    }
  },

  // Duck volume smoothly
  async duckVolume(video, duckLevel = 0.3) {
    if (!video) return video?.volume || 1;
    
    const originalVolume = video.volume;
    await this.smoothVolumeTransition(video, duckLevel);
    return originalVolume;
  },

  // Restore volume smoothly
  async restoreVolume(video, targetVolume) {
    if (!video || targetVolume === undefined) return;
    await this.smoothVolumeTransition(video, targetVolume, 300);
  },

  // Create audio element with error handling
  createAudio(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Add error handling
    audio.addEventListener('error', (error) => {
      console.error('Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
    });
    
    return { audio, audioUrl };
  },

  // Play audio with promise
  playAudio(audio) {
    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', resolve);
      audio.addEventListener('error', reject);
      
      audio.play().catch(reject);
    });
  }
};

// Make it globally available
window.AudioUtils = AudioUtils;