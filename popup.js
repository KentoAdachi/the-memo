// 現在のタブのURLを取得
function getCurrentTabUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    console.log(url);

    callback(url, tabs[0].id);
  });
}

// メモを表示する関数
function displayMemo() {
  getCurrentTabUrl(function (url) {
    chrome.storage.local.get(url, function (data) {
      if (data[url]) {
        document.getElementById("memo").value = data[url];
      }
    });
  });
}

// ページがロードされたときにメモを表示し、フォーカスを当てる
document.addEventListener("DOMContentLoaded", displayMemo);
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("memo").focus();
});

// メモを自動で保存するイベントリスナーを追加
document.getElementById("memo").addEventListener("input", function () {
  const memo = document.getElementById("memo").value;
  getCurrentTabUrl(function (url, tabid) {
    if (memo != "") {
      chrome.action.setIcon({
        path: "icon.png",
        tabId: tabid,
      });
    } else {
      chrome.action.setIcon({
        path: "icon-gray.png",
        tabId: tabid,
      });
    }
    let saveObj = { [url]: memo };
    chrome.storage.local.set(saveObj, function () {
      console.log("メモが自動保存されました");
    });
  });
});

// 免責事項を表示
document.getElementById("disclaimer").addEventListener("click", function () {
  alert(
    "この拡張機能は、chrome.storage APIを使用してブラウザのローカル領域にメモを保存します。" +
      "拡張機能を削除すると、保存したデータはすべて削除されます。" +
      "技術的な仕様については、https://developer.chrome.com/docs/extensions/reference/api/storage?hl=ja を参照ください。\n\n" +
      "可能な限りシンプルに実装していますが、拡張機能である性質上、完全な動作は保証できません。\n" +
      "データベースとしての利用は推奨しません。重要な情報は保存しないでください。\n" +
      "この拡張機能を使用することにより生じた損害について、作者は一切の責任を負いません。\n"
  );
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  if (currentTab) {
    document.getElementById("url").textContent = currentTab.url;
  }
});
