// YouTube-specific utility functions
const isYouTubeMusic = () =>
  window.location.hostname.includes("music.youtube.com");

const YouTubeUtils = {
  extractVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");
    return videoId || null;
  },

  isYouTubeMusic,

  getCurrentVideoTitle() {
    if (isYouTubeMusic()) {
      const items = Array.from(
        document.querySelectorAll("ytmusic-responsive-list-item-renderer")
      );

      // Prefer the item currently playing/paused in the playlist
      const current = items.find((it) => {
        const state = it.getAttribute("play-button-state");
        return state === "playing" || state === "paused";
      });
      const currentTitle = current
        ?.querySelector("yt-formatted-string.title")
        ?.textContent?.trim();
      if (currentTitle) return currentTitle;

      // Fallback: playlist item matching the current video id
      const vid = this.extractVideoId();
      if (vid) {
        const byVid = items.find((it) =>
          (it.innerHTML || "").includes(vid)
        );
        const title = byVid
          ?.querySelector("yt-formatted-string.title")
          ?.textContent?.trim();
        if (title) return title;
      }

      // Fallback: title shown in the player queue (current track)
      const queueTitle = document
        .querySelector("ytmusic-player-queue-item .song-title")
        ?.textContent?.trim();
      if (queueTitle) return queueTitle;

      // Last resort: player title link
      return (
        document.querySelector(".ytp-title-link")?.textContent?.trim() || ""
      );
    }

    const titleElement = document.querySelector(
      "h1.title.style-scope.ytd-video-primary-info-renderer"
    );
    return titleElement?.textContent?.trim() || "";
  },

  getDescription() {
    if (isYouTubeMusic()) return "";
    return (
      document?.querySelector("#description-inner")?.textContent?.trim() || ""
    );
  },

  getComments() {
    if (isYouTubeMusic()) return [];

    let allComments: string[] = [];
    document.querySelectorAll("#comment-container").forEach((item) => {
      let txt = item.querySelector("#expander")?.textContent?.trim() || "";
      allComments.push(txt);
    });
    return allComments;
  },

  getNextVideoTitle() {
    if (isYouTubeMusic()) {
      const items = Array.from(
        document.querySelectorAll("ytmusic-responsive-list-item-renderer")
      );
      if (items.length === 0) return "";

      // Find current item by play state, then by video id
      let idx = items.findIndex((it) => {
        const state = it.getAttribute("play-button-state");
        return state === "playing" || state === "paused";
      });
      if (idx === -1) {
        const vid = this.extractVideoId();
        if (vid) {
          idx = items.findIndex((it) => (it.innerHTML || "").includes(vid));
        }
      }
      if (idx === -1) idx = 0;

      const next = items[idx + 1];
      return (
        next?.querySelector("yt-formatted-string.title")?.textContent?.trim() ||
        ""
      );
    }

    const playlistItem = document.querySelector("#playlist-items[selected]");
    const nextVideoElement = (
      playlistItem?.nextSibling as Element
    )?.querySelector("#video-title");

    return nextVideoElement?.textContent?.trim() || "";
  },

  isPlaylistPage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("list");
  },

  getPlaylistId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("list");
  },

  getVideoElement() {
    return document.querySelector("video");
  },

  // Clean up YouTube video titles (remove common suffixes)
  cleanVideoTitle(title: string) {
    return title
      .replace(/\(Official.*?\)/gi, "")
      .replace(/\(Music Video\)/gi, "")
      .replace(/\[Official.*?\]/gi, "")
      .replace(/- Topic$/, "")
      .trim();
  },

  // Get video duration
  getVideoDuration() {
    const video = this.getVideoElement();
    return video ? video.duration : 0;
  },

  // Check if video is playing
  isVideoPlaying() {
    const video = this.getVideoElement();
    return video ? !video.paused && !video.ended : false;
  },
};

// Make it globally available
(window as any).YouTubeUtils = YouTubeUtils;
export default YouTubeUtils;