// util functions
function setDomValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    if (element.type === "checkbox") {
      element.checked = value;
    } else {
      element.value = value;
    }
  }
}

function getDomValue(id) {
  const element = document.getElementById(id);
  if (element) {
    if (element.type === "checkbox") {
      return element.checked;
    } else {
      return element.value;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get({
    geminiApiKey: "",
    murfApiKey: "",
    rjStyle: "sarcastic",
    commentaryLength: "short",
    voiceId: "en-US-AvaMultilingualNeural",
    voiceStyle: "default",
    includeHistory: false,
    includeComments: false,
    volumeDucking: 50, // Default value for volume ducking
    hostName: "Alexis",
    radioStation: "97.7 Youtube FM",
  });

  // Set values for each setting
  Object.keys(settings).forEach((key) => {
    setDomValue(key, settings[key]);
  });

  // Volume ducking slider update
  document.getElementById("volumeDucking").addEventListener("input", (e) => {
    document.getElementById("duckingValue").textContent = e.target.value + "%";
  });

  // Save settings
  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      // Collect all settings

      const _settings = {};
      Object.keys(settings).forEach((key) => {
        _settings[key] = getDomValue(key);
      });

      try {
        console.log("Saving settings:", _settings);
        await chrome.storage.sync.set(_settings);
        showStatus("Settings saved successfully!", "success");
      } catch (error) {
        showStatus("Error saving settings: " + error.message, "error");
      }
    });

  // Export logs
  document.getElementById("exportLogs").addEventListener("click", async () => {
    try {
      const logs = await chrome.storage.local.get(["commentaryLogs"]);
      const logsData = logs.commentaryLogs || [];

      const blob = new Blob([JSON.stringify(logsData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `youtube-rj-logs-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      showStatus("Logs exported successfully!", "success");
    } catch (error) {
      showStatus("Error exporting logs: " + error.message, "error");
    }
  });

  // setup click event listeners
  document
    .querySelector("#apiKeysCollapse")
    .addEventListener("click", function () {
      let apiKeysContent = document.getElementById("apiKeysContent");

      apiKeysContent.style.display =
        apiKeysContent.style.display === "none" ? "block" : "none";
    });
});

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}
