// Bridge script - runs on localhost CRM pages
// Forwards messages from the web page to the extension

console.log('Google Voice Assistant Bridge loaded');

// Listen for messages from the web page
window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

    if (event.data.type === 'DIAL_GOOGLE_VOICE') {
        console.log('Bridge received dial request:', event.data.url);

        // Check if chrome.runtime is available
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('Chrome extension API not available');
            return;
        }

        // Forward to extension background script
        try {
            chrome.runtime.sendMessage({
                type: 'OPEN_GOOGLE_VOICE',
                url: event.data.url
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Extension communication error:', chrome.runtime.lastError);
                } else {
                    console.log('Successfully sent to extension');
                }
            });
        } catch (error) {
            console.error('Error sending message to extension:', error);
        }
    }
});
