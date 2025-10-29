// MarketMate Chrome Extension Popup Script

document.addEventListener("DOMContentLoaded", () => {
  const openPWAButton = document.getElementById("openPWA");
  const openEditorButton = document.getElementById("openEditor");

  const PWA_URL = "http://localhost:3000"; // Update with your PWA URL

  openPWAButton?.addEventListener("click", () => {
    chrome.tabs.create({ url: PWA_URL });
    window.close();
  });

  openEditorButton?.addEventListener("click", () => {
    chrome.tabs.create({ url: `${PWA_URL}/editor` });
    window.close();
  });

  // Check if we're offline
  chrome.storage.local.get(["isOffline"], (result) => {
    if (result.isOffline) {
      const info = document.querySelector(".info");
      if (info) {
        info.innerHTML +=
          '<p style="color: #f59e0b;"><strong>⚠️ Offline Mode Active</strong></p>';
      }
    }
  });
});
