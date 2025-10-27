// // Listen when a tab is updated
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   //   if (tab.url && tab.active) {
//   // Retrieve stored CSV data ONLY inside the event listener
//   //   chrome.storage.local.get(['csvData'], (result) => {
//   const csvData = [];

//   if (csvData.length > 0) {
//     const firstRow = csvData[0];
//     console.log('First row column "name":', firstRow['name']);
//   }

//   try {
//     // Extract query params
//     // const queryParameters = tab.url.split('?')[1];
//     // const urlParameters = new URLSearchParams(queryParameters);

//     // Example: extract a real video ID if it exists
//     const videoId = 'random';

//     // Send message to content script
//     chrome.tabs.sendMessage(tabId, {
//       type: 'NEW',
//       videoId: videoId,
//       // cookies is undefined in your original code; define if needed
//       cookies: {},
//     });
//   } catch (err) {
//     console.error('Error parsing tab.url or sending message:', err);
//   }
//   //   });
//   //   }
// });
