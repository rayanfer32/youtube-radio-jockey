document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get([
    'geminiApiKey',
    'murfApiKey',
    'commentaryLength',
    'rjStyle',
    'voiceGender',
    'volumeDucking',
    'darkMode',
    'autoStart'
  ]);
  
  // Populate form with saved values
  if (settings.geminiApiKey) document.getElementById('geminiApiKey').value = settings.geminiApiKey;
  if (settings.murfApiKey) document.getElementById('murfApiKey').value = settings.murfApiKey;
  if (settings.commentaryLength) document.getElementById('commentaryLength').value = settings.commentaryLength;
  if (settings.rjStyle) document.getElementById('rjStyle').value = settings.rjStyle;
  if (settings.voiceGender) document.getElementById('voiceGender').value = settings.voiceGender;
  if (settings.volumeDucking) {
    document.getElementById('volumeDucking').value = settings.volumeDucking;
    document.getElementById('duckingValue').textContent = settings.volumeDucking + '%';
  }
  if (settings.darkMode) document.getElementById('darkMode').checked = settings.darkMode;
  if (settings.autoStart) document.getElementById('autoStart').checked = settings.autoStart;
  
  // Volume ducking slider update
  document.getElementById('volumeDucking').addEventListener('input', (e) => {
    document.getElementById('duckingValue').textContent = e.target.value + '%';
  });
  
  // Save settings
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const settings = {
      geminiApiKey: document.getElementById('geminiApiKey').value,
      murfApiKey: document.getElementById('murfApiKey').value,
      commentaryLength: document.getElementById('commentaryLength').value,
      rjStyle: document.getElementById('rjStyle').value,
      voiceGender: document.getElementById('voiceGender').value,
      volumeDucking: document.getElementById('volumeDucking').value,
      darkMode: document.getElementById('darkMode').checked,
      autoStart: document.getElementById('autoStart').checked
    };
    
    try {
      await chrome.storage.sync.set(settings);
      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('Error saving settings: ' + error.message, 'error');
    }
  });
  
  // Export logs
  document.getElementById('exportLogs').addEventListener('click', async () => {
    try {
      const logs = await chrome.storage.local.get(['commentaryLogs']);
      const logsData = logs.commentaryLogs || [];
      
      const blob = new Blob([JSON.stringify(logsData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youtube-rj-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showStatus('Logs exported successfully!', 'success');
    } catch (error) {
      showStatus('Error exporting logs: ' + error.message, 'error');
    }
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}