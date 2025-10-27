# CSV Files Extractor - Google Voice Assistant

![Extension Icon](assets/icon.png)

## Overview

CSV Files Extractor is a browser extension designed to assist users in extracting phone numbers from CSV files and automating the dialing process on Google Voice. This tool is particularly useful for users who need to make multiple calls from a list of contacts stored in CSV format.

## Features

- **CSV File Upload**: Upload CSV files containing phone numbers through an intuitive popup interface.
- **File Management**: View, select, and delete uploaded CSV files.
- **Automated Dialing**: Automatically inputs phone numbers from the selected CSV file into Google Voice and initiates calls with a simple keypress ('y').
- **Index Tracking**: Keeps track of the current row being processed in the CSV file, allowing users to resume from where they left off.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/MehmoodulHasssan/google-voice-assistant.git
   cd google-voice-assistant
   ```

2. **Load the Extension into Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top right.
   - Click on "Load unpacked" and select the folder containing the cloned repository.

## Usage

1. **Upload a CSV File**:

   - Click on the extension icon to open the popup.
   - Use the file input to upload a CSV file containing phone numbers. Ensure the CSV has a column named "Phone" with the phone numbers.

2. **Select a File**:

   - From the list of uploaded files, click on the file you want to process. The selected file will be highlighted.

3. **Set Index (Optional)**:

   - If you want to start from a specific row in the CSV, update the index in the input field provided in the popup.

4. **Automate Dialing on Google Voice**:
   - Navigate to [Google Voice](https://voice.google.com/).
   - Ensure the selected CSV file is active in the extension popup.
   - Press the 'y' key to start the automated dialing process. The extension will input the next phone number from the CSV and initiate the call.

## Permissions

This extension requires the following permissions:

- **Storage**: To save and manage CSV files locally.
- **Tabs**: To interact with Google Voice and YouTube tabs.
- **Cookies**: To ensure proper functioning on Google Voice.
- **Host Permissions**: Access to `https://*.youtube.com/*` and `https://voice.google.com/*` for content script injection.

## File Structure

- **manifest.json**: Configuration file for the browser extension.
- **background.js**: Background service worker for handling background tasks.
- **content-script.js**: Script injected into Google Voice pages to automate dialing.
- **popup.html**, **popup.js**, **popup.css**: User interface components for managing CSV files.
- **jquery.min.js**, **papaparse.min.js**: Libraries for DOM manipulation and CSV parsing.
- **assets/**: Contains icons and images used by the extension.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on the [GitHub repository](https://github.com/MehmoodulHasssan/google-voice-assistant).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension is not affiliated with Google or Google Voice. Use at your own risk and ensure compliance with Google Voice's terms of service.
