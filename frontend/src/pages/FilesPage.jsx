import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext.jsx";

export default function FilesPage() {
  const { success, error, warning } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renameData, setRenameData] = useState({ id: null, name: "" });

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const filesData = await apiService.getFiles();
      setFiles(filesData);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      error("Failed to fetch files data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return warning("Please select a file first.");
    setUploading(true);
    try {
      await apiService.uploadFile(selectedFile);
      success("File uploaded successfully!");
      setSelectedFile(null);
      // Refresh the files list
      await fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async () => {
    if (!renameData.id || !renameData.name.trim())
      return warning("Enter new name");

    try {
      await apiService.renameFile(renameData.id, renameData.name);
      success("File renamed!");
      setRenameData({ id: null, name: "" });
      // Refresh the files list
      await fetchFiles();
    } catch (err) {
      console.error("Rename failed:", err);
      error("Rename failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await apiService.deleteFile(id);
      success("File deleted!");
      // Refresh the files list
      await fetchFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      error("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
            File Management
          </h3>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Upload and manage your organization's files
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload New File
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select a file to upload to your organization
          </p>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="btn btn-primary w-full sm:w-auto"
            >
              {uploading ? (
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
                  Uploading...
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Files
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your organization's files
          </p>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
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
                <span className="text-gray-600">Loading files...</span>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No files uploaded
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first file.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th className="hidden sm:table-cell">Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr key={f._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                            <svg
                              className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-sm lg:text-base truncate block">
                              {f.name}
                            </span>
                            <div className="sm:hidden text-xs text-gray-500">
                              {new Date(f.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell text-sm text-gray-600">
                        {new Date(f.uploadedAt).toLocaleDateString()}
                      </td>
                      <td>
                        {renameData.id === f._id ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={renameData.name}
                              onChange={(e) =>
                                setRenameData((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="form-input text-sm"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleRename}
                                className="btn btn-success btn-sm text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() =>
                                  setRenameData({ id: null, name: "" })
                                }
                                className="btn btn-secondary btn-sm text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() =>
                                setRenameData({ id: f._id, name: f.name })
                              }
                              className="btn btn-secondary btn-sm text-xs"
                            >
                              <svg
                                className="w-3 h-3 lg:w-4 lg:h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span className="hidden sm:inline">Rename</span>
                            </button>
                            <button
                              onClick={() => handleDelete(f._id)}
                              className="btn btn-error btn-sm text-xs"
                            >
                              <svg
                                className="w-3 h-3 lg:w-4 lg:h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
