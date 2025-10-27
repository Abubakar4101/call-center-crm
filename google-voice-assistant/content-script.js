(() => {
  console.log("content script loaded.");
  const keysEmun = Object.freeze({
    allFiles: "a_f",
    selectedFileId: "s_id",
    currIndex: "c_ind",
  });

  const funKeys = Object.freeze({
    next: "n",
    prev: "p",
    call: "c",
  });
  async function readStorage(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (data) => {
        resolve(data[key]);
      });
    });
  }

  async function writeStorage(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async function removeFromStorage(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  }

  async function updateFile(updatedFile) {
    const allFiles = await readStorage(keysEmun.allFiles);
    const updatedFiles = allFiles.map((f) =>
      f.id === updatedFile.id ? updatedFile : f
    );
    await writeStorage(keysEmun.allFiles, updatedFiles);
  }

  async function getFileById(id) {
    const allFiles = await readStorage(keysEmun.allFiles);
    if (!Array.isArray(allFiles)) return;
    return allFiles.find((f) => f.id === id);
  }

  // Parse hash like #autocall=1234567890
  function getAutoCallNumberFromHash() {
    try {
      const hash = window.location.hash || "";
      if (!hash) return "";
      const cleaned = hash.replace(/^#/, "");
      const params = new URLSearchParams(cleaned);
      return params.get("autocall") || "";
    } catch (e) {
      return "";
    }
  }

  function getTokenFromHash() {
    try {
      const hash = window.location.hash || "";
      if (!hash) return "";
      const cleaned = hash.replace(/^#/, "");
      const params = new URLSearchParams(cleaned);
      return params.get("token") || "";
    } catch (e) {
      return "";
    }
  }

  // Dial a number using Google Voice keypad and press call
  function dialNumberViaDom(phoneNo) {
    if (!phoneNo) return;
    const dialBtn = document.querySelector('[gv-test-id="new-call-button"]');
    const dialerButtons = document.querySelectorAll('[role="grid"] button[gv-a11y-grid-cell]');
    if (!dialBtn || !dialerButtons || dialerButtons.length === 0) {
      console.error("Dialer elements not ready yet");
      return;
    }
    const buttonsMap = new Map();
    Array.from(dialerButtons).forEach((btn) => {
      const firstDiv = btn.querySelector("div");
      const btnTxt = firstDiv?.innerText.trim();
      if (btnTxt) {
        buttonsMap.set(btnTxt, btn);
      }
    });
    const charArray = String(phoneNo).replace(/\D+/g, "").split("");
    charArray.forEach((char) => {
      const numBtn = buttonsMap.get(char);
      numBtn?.click();
    });
    setTimeout(() => {
      if (dialBtn && dialBtn.disabled === false) {
        dialBtn.click();
      } else {
        console.error("Dial button disabled or missing");
      }
    }, 800);
  }

  // Fire-and-forget metrics call when a call is answered
  function postCallReceived() {
    const token = getTokenFromHash();
    if (!token) return;
    const apiBase = (function() {
      try {
        // Default to local; can accept any host via manifest host_permissions
        const u = new URL(window.location.href);
        return "http://localhost:5000/api";
      } catch (e) {
        return "http://localhost:5000/api";
      }
    })();
    fetch(`${apiBase}/dialer/metrics/received`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: "{}",
      mode: "cors",
      credentials: "omit",
    }).catch(() => {});
  }

  // Observe Google Voice DOM to detect answered call
  function installAnsweredObserver() {
    const root = document.getElementById("gvPageRoot") || document.body;
    if (!root) return;
    const observer = new MutationObserver(() => {
      // Heuristic: look for in-call UI elements (class names/attributes may change)
      const inCallTimer = document.querySelector('[gv-test-id="ongoing-call-timer"], .gv-call-timer, .incomingCallDuration');
      const ongoingBanner = document.querySelector('[gv-test-id="ongoing-call-banner"], .gv-active-call, .gv-call-actions');
      if (inCallTimer || ongoingBanner) {
        postCallReceived();
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  async function appendListRow(row) {
    if (!row || typeof row !== "object") return;
    const headerEle = document.getElementById("gb");
    const absoluteBody = document.getElementById("gvPageRoot");
    const values = Object.values(row);

    headerEle.style.top = "20px";
    absoluteBody.style.top = "20px";
    // Create a div element
    if (document.getElementById("fileRow")) {
      document.getElementById("fileRow").remove();
    }
    const container = document.createElement("div");
    container.id = "fileRow";

    // Populate the div with the string values
    values.forEach((value) => {
      const p = document.createElement("p");
      p.textContent = value;
      p.style.fontSize = "14px";
      container.appendChild(p);
    });

    // Style the div
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: lightgreen;
      padding: 0px;
      z-index: 1000;
      text-align: center;
      display: flex;
      justify-content: space-around;
      color: black;
    `;

    // Append the div to the body
    document.body.prepend(container);
  }

  window.addEventListener("load", async () => {
    // If opened with #autocall=NUMBER, attempt to dial automatically
    const initialAutoCall = getAutoCallNumberFromHash();
    if (initialAutoCall) {
      // Give GV time to render the keypad
      setTimeout(() => dialNumberViaDom(initialAutoCall), 1200);
    }

    // Install answered call observer
    installAnsweredObserver();

    // Also respond to runtime hash changes (same tab reuse)
    window.addEventListener("hashchange", () => {
      const hashNumber = getAutoCallNumberFromHash();
      if (hashNumber) {
        setTimeout(() => dialNumberViaDom(hashNumber), 500);
      }
    });

    chrome.storage.local.get(keysEmun.allFiles, async (data) => {
      if (data[keysEmun.allFiles] && Array.isArray(data[keysEmun.allFiles])) {
        let selFileId = "";
        selFileId = await readStorage(keysEmun.selectedFileId);
        if (!selFileId) {
          await writeStorage(
            keysEmun.selectedFileId,
            data[keysEmun.allFiles][0].id
          );
          selFileId = data[keysEmun.allFiles][0].id;
        }
        const file = await getFileById(selFileId);
        if (file) {
          let currIndex = file?.[keysEmun.currIndex] || 0;
          if (currIndex === undefined || Number(currIndex) === NaN) {
            await updateFile({ ...file, [keysEmun.currIndex]: 0 });
            currIndex = 0;
          }
          await appendListRow(file.data[currIndex]);
        }
      }
    });

    document.addEventListener("keydown", async (e) => {
      if (e.altKey && Object.values(funKeys).includes(e.key)) {
        const allFiles = await readStorage(keysEmun.allFiles);
        if (!allFiles || !Array.isArray(allFiles)) {
          return console.error("no files added yet");
        }
        const selFileId = await readStorage(keysEmun.selectedFileId);
        if (!selFileId) {
          return console.error("no file selected");
        }
        const file = allFiles.find((f) => f.id === selFileId);
        if (!file) {
          return console.error("selected file id is incorrect");
        }
        console.log("FILE found....");
        let currIndex = file?.[keysEmun.currIndex];
        if (currIndex === undefined || Number(currIndex) === NaN) {
          await updateFile({ ...file, [keysEmun.currIndex]: 0 });
          currIndex = 0;
        }
        switch (e.key) {
          case funKeys.call:
            console.log("pressed call button....");
            const phoneNo = file.data?.[currIndex]?.Phone;
            if (phoneNo) {
              dialNumberViaDom(phoneNo);
            }
            break;
          case funKeys.next:
            console.log("pressed next button....", currIndex);
            if (currIndex < file.data.length - 1) {
              await updateFile({
                ...file,
                [keysEmun.currIndex]: currIndex + 1,
              });
              await appendListRow(file.data[currIndex + 1]);
            }
            break;
          case funKeys.prev:
            console.log("pressed prev button....", currIndex);
            if (currIndex > 0) {
              await updateFile({
                ...file,
                [keysEmun.currIndex]: currIndex - 1,
              });
              await appendListRow(file.data[currIndex - 1]);
            }
            break;
        }
      }
    });

    chrome.runtime.onMessage.addListener(
      async (request, sender, sendResponse) => {
        if (request.type === "REFRESH") {
          const selFileId = await readStorage(keysEmun.selectedFileId);
          const file = await getFileById(selFileId);
          if (file) {
            let currIndex = file?.[keysEmun.currIndex] || 0;
            if (currIndex === undefined || Number(currIndex) === NaN) {
              await updateFile({ ...file, [keysEmun.currIndex]: 0 });
              currIndex = 0;
            }
            await appendListRow(file.data[currIndex]);
          }
        }
      }
    );
  });
})();
