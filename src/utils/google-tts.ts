
export class GoogleTTS {
  private audioBlob: Blob | null = null;

  async synthesize(text: string, lang: string = "en"): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "getTTSAudio",
          payload: { text, lang },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("TTS Runtime Error:", chrome.runtime.lastError);
            return reject(new Error(chrome.runtime.lastError.message));
          }

          if (!response || !response.success) {
            console.error("TTS API Error:", response?.error);
            return reject(new Error(response?.error || "Failed to get TTS audio"));
          }

          try {
            const base64Chunks: string[] = response.data;
            const audioChunks = base64Chunks.map((base64) => {
              const binaryString = atob(base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes.buffer;
            });

            this.audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            resolve();
          } catch (error) {
            console.error("Error processing TTS audio data:", error);
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
