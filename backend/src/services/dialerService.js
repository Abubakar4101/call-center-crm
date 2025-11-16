const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const { FILES_DIR } = require("./fileService");
const File = require("../models/file");

// In-memory state
let dialerState = {
  contacts: [],
  currentIndex: 0,
  isRunning: false,
};

function loadContactsFromFile(filename) {
  return new Promise((resolve, reject) => {
    const contacts = [];
    fs.createReadStream(path.join(FILES_DIR, filename))
      .pipe(csv())
      .on("data", (row) => contacts.push(row))
      .on("end", () => resolve(contacts))
      .on("error", reject);
  });
}

// Google Voice integration would require using Puppeteer or an API workaround.
// For now, we just simulate calls.
async function callContact(contact) {
  console.log(`📞 Calling ${contact.name} at ${contact.phone}`);
  // TODO: integrate with Google Voice (via Puppeteer automation or telephony API)
}

async function startDialing(filename) {
  dialerState.contacts = await loadContactsFromFile(filename);
  dialerState.currentIndex = 0;
  dialerState.isRunning = true;
  return nextCall();
}

function stopDialing() {
  dialerState.isRunning = false;
  return { message: "Dialer stopped" };
}

function nextCall() {
  if (!dialerState.isRunning) return { message: "Dialer not running" };
  if (dialerState.currentIndex >= dialerState.contacts.length)
    return { message: "No more contacts" };
  const contact = dialerState.contacts[dialerState.currentIndex++];
  callContact(contact);
  return { message: "Calling next contact", contact };
}

function prevCall() {
  if (dialerState.currentIndex > 1) dialerState.currentIndex -= 2; // go back one step
  return nextCall();
}

async function loadDialerContacts(fileId) {
  // 1. Find file record in DB
  const file = await File.findById(fileId);
  if (!file) throw new Error("File not found");

  const filePath = path.join(file.path);
  console.log(filePath);
  if (!fs.existsSync(filePath)) throw new Error("File missing from server");

  // 2. Read file (supports both xlsx and csv)
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  // 3. Preserve all fields from the file (don't filter, just normalize)
  const contacts = rows.map((row, idx) => ({
    id: idx + 1,
    // Preserve all original fields
    ...row,
    // Ensure common fields are accessible with fallbacks
    name: row.Name || row.name || "",
    phone: row.Phone || row.phone || row.Mobile || row.mobile || "",
  }));

  return contacts;
}

module.exports = {
  startDialing,
  stopDialing,
  nextCall,
  prevCall,
  loadDialerContacts,
};
