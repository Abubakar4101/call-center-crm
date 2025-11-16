import React, { useEffect, useState, useRef } from "react";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext.jsx";

export default function DialerPage() {
  const { success, error, warning } = useToast();
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callLogs, setCallLogs] = useState([]); // store attempts / results
  const [contactHeaders, setContactHeaders] = useState([]); // store all field names from loaded file


  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoadingFiles(true);
    try {
      const filesData = await apiService.getFiles();
      setFiles(filesData);
    } catch (err) {
      console.error("fetchFiles error:", err);
      setFiles([]);
      error("Failed to fetch files");
    } finally {
      setLoadingFiles(false);
    }
  }

  async function loadContacts() {
    if (!selectedFileId) return warning("Select a file first.");
    setLoadingContacts(true);
    try {
      const response = await apiService.loadContacts(selectedFileId);
      const loadedContacts = response.contacts || [];
      setContacts(loadedContacts);
      setIndex(0);
      setCallLogs([]);
      
      // Extract all unique field names from the first contact (or all contacts)
      if (loadedContacts.length > 0) {
        const allKeys = new Set();
        loadedContacts.forEach(contact => {
          Object.keys(contact).forEach(key => {
            // Exclude internal fields like 'id'
            if (key !== 'id') {
              allKeys.add(key);
            }
          });
        });
        setContactHeaders(Array.from(allKeys));
      } else {
        setContactHeaders([]);
      }
    } catch (err) {
      console.error("loadContacts error:", err);
      setContacts([]);
      setContactHeaders([]);
      error("Failed to load contacts: " + err.message);
    } finally {
      setLoadingContacts(false);
    }
  }

  // Start call for current contact
  async function handleCall() {
    const contact = contacts[index];
    if (!contact) return;
    setCalling(true);

    try {
      const rawNumber = contact.phone || contact.mobile;
      if (!rawNumber) throw new Error("No phone number on contact");
      const digitsOnly = String(rawNumber).replace(/\D+/g, "");
      const token = localStorage.getItem("token") || "";
      const url = `https://voice.google.com/u/0/messages#autocall=${digitsOnly}&token=${encodeURIComponent(token)}`;

        try {
          window.open(url, "google-voice").focus();
        } catch (e) {
          console.error("Error opening Google Voice:", e);
        }

      setCallLogs((l) => [
        { contact, result: { message: "Opened Google Voice for auto-call" }, time: new Date().toISOString() },
        ...l,
      ]);
      // Record call made metric (non-blocking)
      apiService.incrementCallsMade().catch(() => { });
    } catch (err) {
      setCallLogs((l) => [
        { contact, error: err.response?.data?.error || err.response?.data?.message || err.message || err.error || 'An error occurred', time: new Date().toISOString() },
        ...l,
      ]);
    } finally {
      setCalling(false);
    }
  }

  // Stop dialing (ask backend to stop any running process if you have one)
  async function handleStop() {
    setCalling(false);
    try {
      await apiService.stopDialing();
      console.log("Dialing stopped");
    } catch (err) {
      console.warn(
        "stop request failed (maybe not implemented on server):",
        err
      );
    }
  }

  function handleNext() {
    setIndex((i) => Math.min(i + 1, contacts.length - 1));
  }
  function handlePrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  const current = contacts[index] || null;

  // Function to humanize field names (e.g., operating_status -> Operating Status)
  function humanizeFieldName(fieldName) {
    if (!fieldName) return "";
    // Convert snake_case and camelCase to Title Case
    return fieldName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase: add space before capital
      .replace(/_/g, " ") // snake_case: replace underscore with space
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  }

  return (
    <div className="space-y-4 lg:space-y-6 dialer-page">
      {/* Header */}
      <div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-100">
          Auto Dialer
        </h3>
        <p className="text-gray-400 mt-1 text-sm lg:text-base">
          Automate your calling process with contact lists
        </p>
      </div>

      <div className="grid">
        {/* Left: Controls */}
        <div className="space-y-4 lg:space-y-6">
          {/* File Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-100">
                File Selection
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Choose a contact file to load
              </p>
            </div>
            <div className="card-body space-y-4">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm text-gray-400">
                      Loading files...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    className="form-input appearance-none pr-12 bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Choose a file --</option>
                    {files.map((f) => {
                      const displayName =
                        f.name.length > 24
                          ? f.name.substring(0, 24) + "..."
                          : f.name;
                      return (
                        <option key={f._id} value={f._id}>
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={loadContacts}
                  disabled={!selectedFileId || loadingContacts}
                  className="btn btn-primary flex-1"
                >
                  {loadingContacts ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Load Contacts
                    </>
                  )}
                </button>
                <button onClick={fetchFiles} className="btn btn-secondary">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Dialer Controls */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-100">
                Dialer Controls
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Navigate and control your calls
              </p>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePrev}
                  disabled={index === 0 || contacts.length === 0}
                  className="btn btn-secondary"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                {!calling ? (
                  <button
                    onClick={handleCall}
                    disabled={!current}
                    className="btn btn-success"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call
                  </button>
                ) : (
                  <button onClick={handleStop} className="btn btn-error">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      />
                    </svg>
                    Stop
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={
                    index >= contacts.length - 1 || contacts.length === 0
                  }
                  className="btn btn-secondary"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Contacts loaded:</span>
                    <span className="font-semibold">{contacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current position:</span>
                    <span className="font-semibold">
                      {contacts.length ? index + 1 : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Info & Logs */}
        <div className="space-y-6">
          {/* Current Contact */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Contact
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Information for the selected contact
              </p>
            </div>
            <div className="card-body">
              {current ? (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <div className="space-y-4">
                    {/* Header with avatar and basic info */}
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-600">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-100">
                          {current.name || current.Name || "— (No name)"}
                        </h4>
                        <p className="text-blue-400 font-medium">
                          {current.phone || current.Phone || current.mobile || current.Mobile || "— (No phone)"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Contact {index + 1} of {contacts.length}
                        </p>
                      </div>
                    </div>
                    
                    {/* All contact fields */}
                    <div className="space-y-3">
                      {contactHeaders.length > 0 ? (
                        contactHeaders.map((header) => {
                          const value = current[header];
                          // Skip if value is empty or if it's the id field
                          if (header === 'id' || (value === null || value === undefined || value === '')) {
                            return null;
                          }
                          return (
                            <div key={header} className="flex flex-col">
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                {humanizeFieldName(header)}
                              </span>
                              <span className="text-sm text-gray-100 break-words">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-400">No additional fields available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-100">
                    No contact selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Load a file and select a contact to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Call Logs */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-100">Call Logs</h3>
              <p className="text-sm text-gray-400 mt-1">
                Recent call attempts and results
              </p>
            </div>
            <div className="card-body">
              {callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-100">
                    No calls yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Call logs will appear here after you make your first call.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {callLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-100">
                            {log.contact?.name ||
                              log.contact?.phone ||
                              "Unknown Contact"}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(log.time).toLocaleString()}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.error
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              {log.error ? "Failed" : "Success"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {log.error ? (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        {log.result?.message ||
                          JSON.stringify(log.result) ||
                          log.error ||
                          "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
