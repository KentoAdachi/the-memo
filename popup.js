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
    });
  });
  displayAllMemo();
}

// すべてのメモを表示する関数
function displayAllMemo() {
  chrome.storage.local.get(null, function (data) {
    let memoList = document.getElementById("allmemo");
    memoList.innerHTML = "";
    if (data.memo) {
      for (let key in data.memo) {
        // URLはaタグでリンクにする
        let a = document.createElement("a");
        a.href = key;
        a.textContent = key;
        a.target = "_blank";
        memoList.appendChild(a);

        // メモはspanタグで表示する
        let span = document.createElement("span");
        span.textContent = data.memo[key];
        memoList.appendChild(span);

        // メモを削除するボタンを作���
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "メモを削除";
        deleteButton.addEventListener("click", function () {
          delete data.memo[key];
          chrome.storage.local.set({ memo: data.memo }, function () {
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

// ペ���ジがロードされたときにメモを表示し、フォーカスを当てる
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
    chrome.storage.local.get("memo", function (data) {
      let memoData = data.memo || {};
      memoData[url] = memo;
      chrome.storage.local.set({ memo: memoData }, function () {
        console.log("メモが自動保存されました");
      });
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
  const allMemoDiv = document.getElementById("allmemo");
  const query = searchBox.value.toLowerCase();

  // Storage APIからメモ一覧を取得
  let memos = [];
  chrome.storage.local.get("memo", function (data) {
    if (data.memo) {
      for (let key in data.memo) {
        memos.push(data.memo[key]);
      }
    }

    // 検索結果をフィルタリング
    const filteredMemos = memos.filter(memo => memo.toLowerCase().includes(query));

    // 検索結果を表示
    allMemoDiv.innerHTML = "";
    filteredMemos.forEach(memo => {
      const memoElement = document.createElement("div");
      memoElement.textContent = memo;
      allMemoDiv.appendChild(memoElement);
    });
  });
}

// 検索ボックスの入力イベントにリスナーを追加
document.getElementById("searchbox").addEventListener("input", searchMemos);