const showLoadingIndicator = () => {
  if (document.getElementById("rj-loading")) return;

  const loading = document.createElement("div");
  loading.id = "rj-loading";
  loading.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner"></div>
        <span>🎙️ Preparing RJ commentary...</span>
      </div>
    `;

  loading.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

  // Add spinner CSS if not exists
  if (!document.getElementById("spinner-styles")) {
    const style = document.createElement("style");
    style.id = "spinner-styles";
    style.textContent = `
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
    document.head.appendChild(style);
  }

  document.body.appendChild(loading);
};

const hideLoadingIndicator = () => {
  const loading = document.getElementById("rj-loading");
  if (loading) loading.remove();
};

const showErrorMessage = (message) => {
  const error = document.createElement("div");
  error.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: #ff4757;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;
  error.textContent = `❌ ${message}`;

  document.body.appendChild(error);

  setTimeout(() => {
    error.remove();
  }, 5000);
};

const createRJModeButton = (toggleRJMode) => {
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

  button.addEventListener("click", () => toggleRJMode());
  button.addEventListener("mouseover", () => {
    button.style.transform = "scale(1.05)";
  });
  button.addEventListener("mouseout", () => {
    button.style.transform = "scale(1)";
  });

  document.body.appendChild(button);
};

const dismissNotification = () => {
  const notification = document.getElementById("rj-mode-notification");
  if (notification) {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
};

const showRJModePrompt = (toggleRJMode) => {
  // Create a more prominent notification for playlist detection
  const notification = document.createElement("div");
  notification.id = "rj-mode-notification";
  notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>🎙️</span>
        <div>
          <strong>Playlist Detected!</strong>
          <br>
          <small>Ready to add some RJ magic?</small>
        </div>
        <button id="enable-rj-mode" style="
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          margin-left: auto;
        ">Enable RJ Mode</button>
        <button id="dismiss-rj-prompt" style="
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        ">×</button>
      </div>
    `;

  notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #333;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;

  // Add CSS animation
  if (!document.getElementById("rj-mode-styles")) {
    const style = document.createElement("style");
    style.id = "rj-mode-styles";
    style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Event listeners for the notification
  document.getElementById("enable-rj-mode").addEventListener("click", () => {
    dismissNotification();
    toggleRJMode();
  });

  document.getElementById("dismiss-rj-prompt").addEventListener("click", () => {
    dismissNotification();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    dismissNotification();
  }, 10000);
};

const DomUtils = {
  showErrorMessage,
  showRJModePrompt,
  createRJModeButton,
  dismissNotification,
  showLoadingIndicator,
  hideLoadingIndicator,
};

window.DomUtils = DomUtils;
