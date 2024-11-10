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
    chrome.storage.local.get(["memo", "globalMemo"], function (data) {
      if (data.memo && data.memo[url]) {
        document.getElementById("memo").value = data.memo[url];
      }
      if (data.globalMemo) {
        document.getElementById("globalmemo").value = data.globalMemo;
      }
      displayAllMemo(data.memo);
    });
  });
}

// すべてのメモを表示する関数
function displayAllMemo(memos) {
  let memoList = document.getElementById("allmemo");
  memoList.innerHTML = "";
  if (memos) {
    for (let key in memos) {
      // URLはaタグでリンクにする
      let a = document.createElement("a");
      a.href = key;
      a.textContent = key;
      a.target = "_blank";
      memoList.appendChild(a);

      // メモはspanタグで表示する
      let span = document.createElement("span");
      span.textContent = memos[key];
      memoList.appendChild(span);

      // メモを削除するボタンを作成
      let deleteButton = document.createElement("button");
      deleteButton.textContent = "メモを削除";
      deleteButton.addEventListener("click", function () {
        delete memos[key];
        chrome.storage.local.set({ memo: memos }, function () {
          console.log("メモが削除されました");
          displayAllMemo(memos);
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
}

// メモをエクスポートする関数
function exportMemos() {
  chrome.storage.local.get("memo", function (data) {
    if (data.memo) {
      const memoData = JSON.stringify(data.memo, null, 2);
      const blob = new Blob([memoData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memos.json";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.log("エクスポートするメモがありません");
    }
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
  getCurrentTabUrl(function (url) {
    chrome.storage.local.get("memo", function (data) {
      let memoData = data.memo || {};
      if (memo === "") {
        delete memoData[url];
      } else {
        memoData[url] = memo;
      }
      chrome.storage.local.set({ memo: memoData }, function () {
        console.log("メモが自動保存されました");
      });
      displayAllMemo(memoData);
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

// メモを検索する関数
function searchMemos() {
  const searchBox = document.getElementById("searchbox");
  const query = searchBox.value.toLowerCase();

  // Storage APIからメモ一覧を取得
  chrome.storage.local.get("memo", function (data) {
    // メモをsearchBoxの値でフィルタリング
    let filteredMemos = {};
    for (let key in data.memo) {
      if (
        key.toLowerCase().includes(query) ||
        data.memo[key].toLowerCase().includes(query)
      ) {
        filteredMemos[key] = data.memo[key];
      }
    }
    displayAllMemo(filteredMemos);
  });
}

// 検索ボックスの入力イベントにリスナーを追加
document.getElementById("searchbox").addEventListener("input", searchMemos);

// エクスポートボタンのクリックイベントにリスナーを追加
document.getElementById("exportButton").addEventListener("click", exportMemos);
