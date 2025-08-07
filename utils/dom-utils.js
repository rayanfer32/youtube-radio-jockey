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

const DomUtils = {
  showLoadingIndicator,
  hideLoadingIndicator,
  showErrorMessage,
};

window.DomUtils = DomUtils;
