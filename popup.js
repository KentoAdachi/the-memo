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
    chrome.storage.local.get([url, "globalMemo"], function (data) {
      if (data[url]) {
        document.getElementById("memo").value = data[url];
      }
      if (data.globalMemo) {
        document.getElementById("globalmemo").value = data.globalMemo;
      }
    });
  });
  displayAllMemo();
}

// すべてのメモを表示する関数
function displayAllMemo() {
  chrome.storage.local.get(null, function (data) {
    let memoList = document.getElementById("allmemo");
    memoList.innerHTML = "";
    for (let key in data) {
      if (key !== "globalMemo") {
        // URLはaタグでリンクにする
        let a = document.createElement("a");
        a.href = key;
        a.textContent = key;
        a.target = "_blank";
        memoList.appendChild(a);

        // メモはspanタグで表示する
        let span = document.createElement("span");
        span.textContent = data[key];
        memoList.appendChild(span);

        // メモを削除するボタンを作成
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "メモを削除";
        deleteButton.addEventListener("click", function () {
          chrome.storage.local.remove(key, function () {
            console.log("メモが削除されました");
            displayAllMemo();
          });
        });
        memoList.appendChild(deleteButton);
      }
    }

    // すべてのメモを削除するボタンを作成
    let deleteAllButton = document.createElement("button");
    deleteAllButton.textContent = "すべてのメモを削除";
    deleteAllButton.id = "deleteAllButton"; // IDを追加してスタイルを適用
    deleteAllButton.addEventListener("click", function () {
      chrome.storage.local.clear(function () {
        console.log("すべてのメモが削除されました");
        displayAllMemo();
      });
    });
    memoList.appendChild(deleteAllButton);
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

// グローバルメモを自動で保存するイベントリスナーを追加
document.getElementById("globalmemo").addEventListener("input", function () {
  const globalMemo = document.getElementById("globalmemo").value;
  chrome.storage.local.set({ globalMemo: globalMemo }, function () {
    console.log("グローバルメモが自動保存されました");
  });
});

// メモとグローバルメモを切り替えるためのトグルボタン
document.getElementById("toggleButton").addEventListener("click", function () {
  const memoSection = document.getElementById("memoSection");
  const globalMemoSection = document.getElementById("globalMemoSection");
  const toggleButton = document.getElementById("toggleButton");

  if (memoSection.style.display === "none") {
    memoSection.style.display = "block";
    globalMemoSection.style.display = "none";
    toggleButton.textContent = "Show Global Memo";
  } else {
    memoSection.style.display = "none";
    globalMemoSection.style.display = "block";
    toggleButton.textContent = "Show Memo";
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currentTab = tabs[0];
  if (currentTab) {
    document.getElementById("url").textContent = currentTab.url;
  }
});
