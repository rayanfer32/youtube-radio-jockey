import Logger from "./logger";

export class FishAudioTTS {
  private audioBlob: Blob | null = null;

  async synthesize(
    text: string,
    apiKey: string,
    referenceId: string = "ba1a38946dea44609fc4a8fe6113ed88"
  ): Promise<void> {
    if (!apiKey) {
      throw new Error("Fish Audio API key not configured");
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "callFishAudio",
          text,
          referenceId,
          apiKey,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            Logger.error("Fish Audio runtime messaging failed", chrome.runtime.lastError);
            return reject(new Error(chrome.runtime.lastError.message));
          }

          if (!response || !response.success) {
            Logger.error("Fish Audio request failed", response?.error);
            return reject(
              new Error(response?.error || "Failed to get Fish Audio TTS")
            );
          }

          try {
            const base64 = response.audioBase64;
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            this.audioBlob = new Blob([bytes], { type: "audio/mp3" });
            resolve();
          } catch (error) {
            Logger.error("Could not decode Fish Audio data", error);
            reject(error);
          }
        }
      );
    });
  }

  toBlob(): Blob {
    if (!this.audioBlob) {
      throw new Error("No audio data available. Did you run synthesize() first?");
    }
    return this.audioBlob;
  }
}
