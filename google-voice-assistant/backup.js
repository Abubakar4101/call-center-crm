// all dom elements
const csvFileInput = document.getElementById('csvFile');
const outputList = document.getElementById('output');
const indexContainer = document.getElementById('indexInputContainer');
const indexInput = document.getElementById('indexInput');
const indexBtn = document.getElementById('indexSubmit');
// keys enum for chrome local storage
const keysEmun = Object.freeze({
  allFiles: 'a_f',
  selectedFileId: 's_id',
  currIndex: 'c_ind',
});

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });

//global utils
async function handleFileClick(e) {
  const selectedFileId = e.target.id;
  const selectedFile = await getFileFromId(selectedFileId);
  const allLists = document.querySelectorAll('li');
  if (allLists) {
    allLists.forEach((el) => {
      if (el.id === selectedFileId) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
    await writeStorage(keysEmun.selectedFileId, selectedFileId);
    updateIndexValue(selectedFile?.[keysEmun.currIndex]);
  }
}

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

async function removeFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      resolve();
    });
  });
}

async function getFileFromId(id) {
  const allFiles = await readStorage(keysEmun.allFiles);
  if (!allFiles || !Array.isArray(allFiles)) return;
  return allFiles.find((f) => f.id === id);
}

async function updateFile(updatedFile) {
  const allFiles = await readStorage(keysEmun.allFiles);
  const updatedFiles = allFiles.map((f) =>
    f.id === updatedFile.id ? updatedFile : f
  );
  await writeStorage(keysEmun.allFiles, updatedFiles);
}

async function handleDeleteFile(fileId) {
  const allFiles = await readStorage(keysEmun.allFiles);
  const updatedFiles = allFiles.filter((f) => f.id !== fileId);
  await writeStorage(keysEmun.allFiles, updatedFiles);
  document.getElementById(fileId).remove();
}

async function makeFileElement(file, selected = false) {
  const newItem = document.createElement('li');
  newItem.textContent = `${file.name} - ${file.size}`;
  newItem.id = file.id;
  newItem.onclick = handleFileClick;

  const txtSpan = document.createElement('span');
  txtSpan.textContent = file.name;
  newItem.appendChild(txtSpan);
  // Create delete button with SVG icon
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  deleteButton.onclick = () => handleDeleteFile(file.id);
  newItem.appendChild(deleteButton);

  if (selected) {
    newItem.classList.add('selected');
    let rowInd;
    if (
      file?.[keysEmun.currIndex] !== undefined &&
      Number(file?.[keysEmun.currIndex]) !== NaN
    ) {
      rowInd = file?.[keysEmun.currIndex];
    } else {
      await updateFile({ ...file, [keysEmun.currIndex]: 0 });
      rowInd = 0;
    }
    updateIndexValue(rowInd);
  }
  outputList.appendChild(newItem);
}

const updateIndexValue = (index) => {
  indexInput.value = index;
  indexBtn.innerText = 'Update';
  indexInput.readOnly = true;
};

function printLn(attribute) {
  chrome.storage.local.set({ attribute });
}

//on first execution
chrome.storage.local.get(keysEmun.allFiles, async (data) => {
  if (data[keysEmun.allFiles] && Array.isArray(data[keysEmun.allFiles])) {
    const selectedId = await readStorage(keysEmun.selectedFileId);
    for (let i = 0; i < data[keysEmun.allFiles].length; i++) {
      await makeFileElement(
        data[keysEmun.allFiles][i],
        selectedId ? selectedId === data[keysEmun.allFiles][i].id : i === 0
      );
    }
  }
});

//event listeners
csvFileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log('results', results);
      const allFiles = await readStorage(keysEmun.allFiles);
      if (!allFiles || !Array.isArray(allFiles)) {
        await writeStorage(keysEmun.allFiles, [
          {
            name: file.name,
            size: file.size,
            id: Math.random().toString(36).substring(2, 11),
            data: results.data,
            [keysEmun.currIndex]: 0,
          },
        ]);
      } else {
        if (allFiles.some((f) => f.name === file.name)) return;
        allFiles.push({
          name: file.name,
          size: file.size,
          id: Math.random().toString(36).substring(2, 11),
          data: results.data,
          [keysEmun.currIndex]: 0,
        });
        await writeStorage(keysEmun.allFiles, allFiles);
      }
      makeFileElement({
        name: file.name,
        size: file.size,
        id: Math.random().toString(36).substr(2, 9),
        data: results.data,
      });
    },
    error: function (err) {
      outputList.textContent = err.message;
    },
  });
});

indexBtn.addEventListener('click', async (e) => {
  console.log('clicked', e.target.innerText);
  const selectedFileId = await readStorage(keysEmun.selectedFileId);

  if (!selectedFileId) {
    return console.error('no file selected');
  }

  if (e.target.innerText === 'Submit') {
    if (indexInput.value && Number(indexInput.value) !== NaN) {
      if (selectedFileId) {
        await updateFile({
          id: selectedFileId,
          [keysEmun.currIndex]: indexInput.value,
        });
        updateIndexValue(indexInput.value);
      }
    }
  } else {
    indexInput.readOnly = false;
    e.target.innerText = 'Submit';
  }
});
