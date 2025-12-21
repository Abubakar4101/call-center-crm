// Track the Google Voice tab ID
let googleVoiceTabId = null;

// Listen for tab updates to track when Google Voice tabs are opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes('voice.google.com')) {
        googleVoiceTabId = tabId;
    }
});

// Listen for tab removal to clear our tracked tab
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === googleVoiceTabId) {
        googleVoiceTabId = null;
    }
});

// Listen for messages from content scripts or web pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'OPEN_GOOGLE_VOICE') {
        const url = request.url;
        console.log("in if-1")
        // Check if we have a tracked Google Voice tab
        if (googleVoiceTabId !== null) {
            console.log("in if")
            // Verify the tab still exists
            chrome.tabs.get(googleVoiceTabId, (tab) => {
                if (chrome.runtime.lastError || !tab) {
                    console.log("in if-2")
                    // Tab doesn't exist anymore, create a new one
                    chrome.tabs.create({ url: url, active: true }, (newTab) => {
                        googleVoiceTabId = newTab.id;
                    });
                } else {
                    console.log("in if-3")
                    // Tab exists, update it and focus it
                    chrome.tabs.update(googleVoiceTabId, { url: url, active: true }, () => {
                        // Reload after URL update to ensure new URL is loaded
                        chrome.tabs.reload(googleVoiceTabId);
                    });
                    chrome.windows.update(tab.windowId, { focused: true });
                }
            });
        } else {
            console.log("in else")
            // No tracked tab, search for any Google Voice tab
            chrome.tabs.query({ url: 'https://voice.google.com/*' }, (tabs) => {
                if (tabs.length > 0) {
                    console.log("in else-1")
                    // Found an existing Google Voice tab
                    googleVoiceTabId = tabs[0].id;
                    chrome.tabs.update(googleVoiceTabId, { url: url, active: true }, () => {
                        // Reload after URL update to ensure new URL is loaded
                        chrome.tabs.reload(googleVoiceTabId);
                    });
                    chrome.windows.update(tabs[0].windowId, { focused: true });
                } else {
                    console.log("in else-2")
                    // No Google Voice tab exists, create one
                    chrome.tabs.create({ url: url, active: true }, (newTab) => {
                        googleVoiceTabId = newTab.id;
                    });
                }
            });
        }

        sendResponse({ success: true });
        return true;
    }
});
