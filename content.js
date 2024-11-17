function checkMemo() {
  chrome.runtime.sendMessage({ action: "checkMemo" });
}

setInterval(function () {
  checkMemo();
}, 1000);
