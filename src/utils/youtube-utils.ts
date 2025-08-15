// YouTube-specific utility functions
const YouTubeUtils = {
  extractVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");
    return videoId || null;
  },

  getCurrentVideoTitle() {
    const titleElement = document.querySelector(
      "h1.title.style-scope.ytd-video-primary-info-renderer"
    );
    return titleElement?.textContent?.trim() || "";
  },

  getDescription() {
    return (
      document?.querySelector("#description-inner")?.textContent?.trim() || ""
    );
  },

  getComments() {
    let allComments: string[] = [];
    document.querySelectorAll("#comment-container").forEach((item) => {
      let txt = item.querySelector("#expander")?.textContent?.trim() || "";
      allComments.push(txt);
    });
    return allComments;
  },

  getNextVideoTitle() {
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
