chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "checkMemo") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        const url = tabs[0].url;
        chrome.storage.local.get(url, function (data) {
          if (data[url]) {
            chrome.action.setIcon({
              path: "icon.png",
              tabId: tabs[0].id,
            });
            sendResponse({ result: data[url] });
          } else {
            chrome.action.setIcon({
              path: "icon-gray.png",
              tabId: tabs[0].id,
            });
            sendResponse({ result: "" });
          }
        });
      }
    });
    return true;
  }
});
