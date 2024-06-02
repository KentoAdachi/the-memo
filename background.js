chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "checkMemo") {
    handleCheckMemo(sendResponse);
    return true; // Ensure asynchronous response
  }
});

function handleCheckMemo(sendResponse) {
  getActiveTab().then((tab) => {
    if (tab) {
      checkMemoForTab(tab, sendResponse);
    }
  });
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs[0]);
    });
  });
}

function checkMemoForTab(tab, sendResponse) {
  const url = tab.url;
  chrome.storage.local.get(url, function (data) {
    const iconPath = data[url] ? "icon.png" : "icon-gray.png";
    updateIcon(tab.id, iconPath);
    sendResponse({ result: data[url] || "" });
  });
}

function updateIcon(tabId, path) {
  chrome.action.setIcon({
    path: path,
    tabId: tabId,
  });
}
