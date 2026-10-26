// In-page DOM overlays styled with Native Instruments Komplete Broadcast Hardware Aesthetic

const injectHardwareStyles = () => {
  if (document.getElementById("rj-hardware-styles")) return;

  const style = document.createElement("style");
  style.id = "rj-hardware-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;700&display=swap');

    .rj-hw-root {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
    }

    .rj-hw-mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }

    .rj-hw-bevel {
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85);
    }

    .rj-hw-recessed {
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.05);
    }

    .rj-glow-cyan {
      box-shadow: 0 0 12px rgba(0, 210, 196, 0.5), inset 0 0 6px rgba(0, 210, 196, 0.3);
    }

    .rj-glow-amber {
      box-shadow: 0 0 12px rgba(255, 158, 27, 0.5), inset 0 0 6px rgba(255, 158, 27, 0.3);
    }

    @keyframes rjPing {
      0% { transform: scale(1); opacity: 0.8; }
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }

    @keyframes rjSlideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes rjSlideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(120%); opacity: 0; }
    }

    @keyframes rjEqualizer {
      0%, 100% { height: 4px; }
      50% { height: 14px; }
    }

    .rj-eq-bar-1 { animation: rjEqualizer 0.8s ease-in-out infinite; }
    .rj-eq-bar-2 { animation: rjEqualizer 0.8s ease-in-out 0.25s infinite; }
    .rj-eq-bar-3 { animation: rjEqualizer 0.8s ease-in-out 0.5s infinite; }
  `;
  document.head.appendChild(style);
};

const createRJModeButton = (toggleRJMode: Function) => {
  injectHardwareStyles();

  if (document.getElementById("rj-mode-button")) return;

  const button = document.createElement("button");
  button.id = "rj-mode-button";
  button.className = "rj-hw-root rj-hw-bevel";
  button.style.cssText = `
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 99999;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  `;

  button.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 22px; height: 22px; border-radius: 4px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 11px;">🎙️</span>
      </div>
      <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #94a3b8; letter-spacing: 0.14em; text-transform: uppercase;">YOUTUBE RJ // KONTROL</span>
        <span id="rj-btn-label" style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #f8fafc;">START RJ MODE</span>
      </div>
    </div>
    <div style="position: relative; width: 10px; height: 10px; margin-left: 4px; display: flex; align-items: center; justify-content: center;">
      <div id="rj-btn-ping" style="display: none; position: absolute; inset: 0; border-radius: 50%; background: #00D2C4; animation: rjPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div id="rj-btn-led" style="width: 7px; height: 7px; border-radius: 50%; background: #475569; border: 1px solid #334155;"></div>
    </div>
  `;

  button.addEventListener("click", () => toggleRJMode());
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-1px)";
    button.style.borderColor = "#363C47";
  });
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    if (!button.dataset.active) {
      button.style.borderColor = "#272B33";
    }
  });

  document.body.appendChild(button);
};

const updateRJModeButton = (isActive: boolean) => {
  const button = document.getElementById("rj-mode-button");
  if (!button) return;

  const label = document.getElementById("rj-btn-label");
  const led = document.getElementById("rj-btn-led");
  const ping = document.getElementById("rj-btn-ping");

  if (isActive) {
    button.dataset.active = "true";
    button.style.background = "linear-gradient(180deg, #101c20 0%, #0a1316 100%)";
    button.style.borderColor = "#00D2C4";
    button.style.boxShadow = "0 0 16px rgba(0,210,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)";

    if (label) {
      label.textContent = "ON AIR // ACTIVE";
      label.style.color = "#00D2C4";
    }
    if (led) {
      led.style.background = "#00D2C4";
      led.style.borderColor = "#fff";
      led.style.boxShadow = "0 0 8px #00D2C4";
    }
    if (ping) ping.style.display = "block";
  } else {
    delete button.dataset.active;
    button.style.background = "linear-gradient(180deg, #181A1E 0%, #111215 100%)";
    button.style.borderColor = "#272B33";
    button.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)";

    if (label) {
      label.textContent = "START RJ MODE";
      label.style.color = "#f8fafc";
    }
    if (led) {
      led.style.background = "#475569";
      led.style.borderColor = "#334155";
      led.style.boxShadow = "none";
    }
    if (ping) ping.style.display = "none";
  }
};

const showLoadingIndicator = () => {
  injectHardwareStyles();

  if (document.getElementById("rj-loading")) return;

  const loading = document.createElement("div");
  loading.id = "rj-loading";
  loading.className = "rj-hw-root rj-hw-bevel";
  loading.style.cssText = `
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 99999;
    background: #08090A;
    border: 1px solid #272B33;
    border-radius: 6px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    animation: rjSlideInRight 0.25s ease-out;
  `;

  loading.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 2.5px; height: 16px; padding-bottom: 1px;">
      <div class="rj-eq-bar-1" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-2" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-3" style="width: 3px; background: #FF9E1B; border-radius: 1px; box-shadow: 0 0 4px #FF9E1B;"></div>
    </div>
    <div style="display: flex; flex-direction: column; line-height: 1.2;">
      <span class="rj-hw-mono" style="font-size: 7.5px; color: #00D2C4; letter-spacing: 0.12em; text-transform: uppercase;">SYNTHESIZING COMMENTARY</span>
      <span class="rj-hw-mono" style="font-size: 9.5px; font-weight: 700; color: #f1f5f9; letter-spacing: 0.04em;">BUFFERING NEXT TRACK...</span>
    </div>
  `;

  document.body.appendChild(loading);
};

const hideLoadingIndicator = () => {
  const loading = document.getElementById("rj-loading");
  if (loading) loading.remove();
};

const showErrorMessage = (message: string) => {
  injectHardwareStyles();

  // Remove existing errors if present
  const existing = document.getElementById("rj-error-message");
  if (existing) existing.remove();

  const error = document.createElement("div");
  error.id = "rj-error-message";
  error.className = "rj-hw-root rj-hw-bevel";
  error.style.cssText = `
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 100000;
    background: #14080a;
    border: 1px solid #ef4444;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    color: #fecaca;
    padding: 10px 16px;
    border-radius: 8px;
    max-width: 360px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    animation: rjSlideInRight 0.25s ease-out;
  `;

  error.innerHTML = `
    <span style="font-size: 14px; line-height: 1; margin-top: 2px;">⚠️</span>
    <div style="display: flex; flex-direction: column; line-height: 1.25; flex: 1;">
      <span class="rj-hw-mono" style="font-size: 8px; color: #f87171; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">BROADCAST ENGINE FAULT</span>
      <span style="font-size: 10.5px; color: #f8fafc; margin-top: 3px; word-break: break-word;">${message}</span>
    </div>
  `;

  document.body.appendChild(error);

  setTimeout(() => {
    error.style.animation = "rjSlideOutRight 0.25s ease-in forwards";
    setTimeout(() => error.remove(), 250);
  }, 5000);
};

const dismissNotification = () => {
  const notification = document.getElementById("rj-mode-notification");
  if (notification) {
    notification.style.animation = "rjSlideOutRight 0.25s ease-in forwards";
    setTimeout(() => {
      notification.remove();
    }, 250);
  }
};

const showRJModePrompt = (toggleRJMode: Function) => {
  injectHardwareStyles();

  if (document.getElementById("rj-mode-notification")) return;

  const notification = document.createElement("div");
  notification.id = "rj-mode-notification";
  notification.className = "rj-hw-root rj-hw-bevel";
  notification.style.cssText = `
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 100000;
    width: 350px;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    overflow: hidden;
    color: #f1f5f9;
    animation: rjSlideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  notification.innerHTML = `
    <!-- Top Hardware Accent Bar -->
    <div style="background: #08090A; border-bottom: 1px solid #272B33; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 5px; height: 5px; border-radius: 50%; background: #FF9E1B; box-shadow: 0 0 4px #FF9E1B;"></span>
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #FF9E1B; font-weight: 700; letter-spacing: 0.12em;">PLAYLIST DETECTED // FREQ LOCK</span>
      </div>
      <button id="dismiss-rj-prompt" style="background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; padding: 0 2px; line-height: 1;">✕</button>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 6px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 16px;">🎙️</span>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #f8fafc; letter-spacing: 0.02em;">YOUTUBE RJ READY</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">Auto-transition commentary engine</div>
        </div>
      </div>

      <button id="enable-rj-mode" style="
        background: #00D2C4;
        color: #060709;
        border: none;
        padding: 6px 12px;
        border-radius: 5px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0,210,196,0.35);
        transition: all 0.15s ease;
        white-space: nowrap;
      ">ENABLE RJ</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Button interaction styling
  const enableBtn = document.getElementById("enable-rj-mode");
  enableBtn?.addEventListener("mouseenter", () => {
    enableBtn.style.background = "#12e6d8";
    enableBtn.style.boxShadow = "0 0 14px rgba(0,210,196,0.55)";
  });
  enableBtn?.addEventListener("mouseleave", () => {
    enableBtn.style.background = "#00D2C4";
    enableBtn.style.boxShadow = "0 0 10px rgba(0,210,196,0.35)";
  });

  enableBtn?.addEventListener("click", () => {
    dismissNotification();
    toggleRJMode();
  });

  document.getElementById("dismiss-rj-prompt")?.addEventListener("click", () => {
    dismissNotification();
  });

  // Auto-dismiss after 12 seconds
  setTimeout(() => {
    dismissNotification();
  }, 12000);
};

const DomUtils = {
  showErrorMessage,
  showRJModePrompt,
  createRJModeButton,
  updateRJModeButton,
  dismissNotification,
  showLoadingIndicator,
  hideLoadingIndicator,
};

(window as any).DomUtils = DomUtils;
export default DomUtils;
