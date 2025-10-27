$(document).on('DOMContentLoaded', async function () {
  // DOM elements
  const $csvFileInput = $('#csvFile');
  const $outputList = $('#output');
  const $indexForm = $('#indexInputContainer');
  const $indexInput = $('#indexInput');
  const $indexBtn = $('#indexSubmit');

  const keysEmun = Object.freeze({
    allFiles: 'a_f',
    selectedFileId: 's_id',
    currIndex: 'c_ind',
  });

  function readStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data) => resolve(data[key]));
    });
  }

  function writeStorage(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  function removeFromStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => resolve());
    });
  }

  async function sendRefreshEvent() {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      tabs.forEach((tab) => {
        if (tab.url.startsWith('https://voice.google.com/')) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'REFRESH',
          });
        }
      });
    });
  }

  async function getFileById(id) {
    const allFiles = await readStorage(keysEmun.allFiles);
    if (!Array.isArray(allFiles)) return;
    return allFiles.find((f) => f.id === id);
  }

  async function updateFile(updatedFile) {
    const allFiles = await readStorage(keysEmun.allFiles);
    const updatedFiles = allFiles.map((f) =>
      f.id === updatedFile.id ? { ...f, ...updatedFile } : f
    );
    await writeStorage(keysEmun.allFiles, updatedFiles);
  }

  async function handleDeleteFile(fileId) {
    const allFiles = await readStorage(keysEmun.allFiles);
    const updatedFiles = allFiles.filter((f) => f.id !== fileId);
    await writeStorage(keysEmun.allFiles, updatedFiles);
    $(`#${fileId}`).remove();
  }

  async function handleFileClick(fileId) {
    const selectedFile = await getFileById(fileId);

    $('li').each(function () {
      if (this.id === fileId) {
        $(this).addClass('selected');
      } else {
        $(this).removeClass('selected');
      }
    });

    await writeStorage(keysEmun.selectedFileId, fileId);
    updateIndexValue(selectedFile?.[keysEmun.currIndex]);
  }

  async function makeFileElement(file, selected = false) {
    const $newItem = $('<li>')
      // .text(`${file.name} - ${file.size}`)
      .attr('id', file.id)
      .on('click', function () {
        console.log('clicked', $(this).attr('id'));
        handleFileClick($(this).attr('id'));
      });

    const $txtSpan = $('<span>')
      .text(file.name)
      .on('click', function (e) {
        e.stopPropagation();
        const $parent = $(this).parent();
        const fileId = $parent.attr('id');
        handleFileClick(fileId);
      });

    $newItem.append($txtSpan);

    const $deleteBtn = $('<button>')
      .addClass('delete-btn')
      .html(
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/></svg>`
      )
      .on('click', function (e) {
        e.stopPropagation();
        console.log('parent', $(this).parent());
        const fileId = $(this).parent().attr('id');
        handleDeleteFile(fileId);
      });

    $newItem.append($deleteBtn);

    if (selected) {
      $newItem.addClass('selected');
      let rowInd =
        file?.[keysEmun.currIndex] !== undefined &&
        !Number.isNaN(Number(file[keysEmun.currIndex]))
          ? file[keysEmun.currIndex]
          : 0;

      if (file?.[keysEmun.currIndex] === undefined) {
        await updateFile({ ...file, [keysEmun.currIndex]: 0 });
      }

      updateIndexValue(rowInd);
    }

    $outputList.append($newItem);
  }

  function updateIndexValue(index) {
    console.log('updating index>>>>');
    $indexInput.val(Number(index) + 2);
    $indexBtn.text('Update');
    $indexInput.prop('readonly', true);
  }

  // Load all files and render UI on first load
  chrome.storage.local.get(keysEmun.allFiles, async (data) => {
    const files = data[keysEmun.allFiles];
    const selectedId = await readStorage(keysEmun.selectedFileId);

    if (Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        await makeFileElement(
          files[i],
          selectedId ? selectedId === files[i].id : i === 0
        );
      }
    }
  });

  // File input change handler
  $csvFileInput.on('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          return;
        }
console.log("data", results)
        const refinedData = results.data.filter((f) => !!f.Phone);
        if (!refinedData.length) return;
        const allFiles = await readStorage(keysEmun.allFiles);
        const newFile = {
          name: file.name,
          size: file.size,
          id: Math.random().toString(36).substring(2, 11),
          data: refinedData,
          [keysEmun.currIndex]: 0,
        };

        if (!Array.isArray(allFiles)) {
          await writeStorage(keysEmun.allFiles, [newFile]);
        } else {
          if (allFiles.some((f) => f.name === file.name)) return;
          allFiles.push(newFile);
          await writeStorage(keysEmun.allFiles, allFiles);
        }

        await makeFileElement(newFile);
      },
      error: function (err) {
        $outputList.text(err.message);
      },
    });
  });

  // Index button click handler
  $indexForm.on('submit', async function (e) {
    e.preventDefault();
    const selectedFileId = await readStorage(keysEmun.selectedFileId);

    if (!selectedFileId) {
      return console.error('no file selected');
    }

    if ($indexBtn.text() === 'Submit') {
      const newRowNo = Number($indexInput.val());
      if (Number.isNaN(newRowNo)) {
        return console.error('invalid index');
      }
      if (newRowNo < 2) {
        return console.error('index should be greater than 1');
      }
      const fileToUpdate = await getFileById(selectedFileId);
      await updateFile({
        ...fileToUpdate,
        [keysEmun.currIndex]: newRowNo - 2,
      });

      updateIndexValue(newRowNo - 2);
      sendRefreshEvent();
    } else {
      $indexInput.prop('readonly', false);
      $indexBtn.text('Submit');
    }
  });
});
