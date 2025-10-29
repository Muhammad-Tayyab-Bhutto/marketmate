// MarketMate Chrome Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("MarketMate extension installed");
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkOffline") {
    sendResponse({ isOffline: !navigator.onLine });
  }
  return true;
});

// Track online/offline status
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isOffline) {
    console.log("Offline status changed:", changes.isOffline.newValue);
  }
});

// Set initial offline status
if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.set({ isOffline: !navigator.onLine });

  window.addEventListener("online", () => {
    chrome.storage.local.set({ isOffline: false });
  });

  window.addEventListener("offline", () => {
    chrome.storage.local.set({ isOffline: true });
  });
}
