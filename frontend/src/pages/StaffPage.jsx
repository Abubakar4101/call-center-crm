import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext.jsx";

export default function StaffPage() {
  const { success, error, warning } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    permissions: [],
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staffData = await apiService.getStaff();
      setStaff(staffData);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      error("Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePermission = (perm) => {
    setFormData((prev) => {
      const has = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStaff) {
        // Update existing staff
        await apiService.updateStaff(editStaff._id, formData);
        success("Staff updated successfully!");
      } else {
        // Add new staff
        await apiService.createStaff(formData);
        success("Staff created successfully!");
      }

      // Refresh the staff list
      await fetchStaff();
      setShowForm(false);
      setEditStaff(null);
      setFormData({ name: "", email: "", role: "", phone: "", password: "", permissions: [] });
    } catch (err) {
      console.error("Failed to save staff:", err);
      error("Failed to save staff: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    try {
      await apiService.deleteStaff(id);
      success("Staff deleted successfully");
      // Refresh the staff list
      await fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      error("Failed to delete staff: " + err.message);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-100">
            Staff Management
          </h3>
          <p className="text-gray-400 mt-1 text-sm lg:text-base">
            Manage your team members and their access
          </p>
        </div>
        <button
          onClick={() => {
            setEditStaff(null);
            setFormData({
              name: "",
              email: "",
              role: "",
              phone: "",
              password: "",
              permissions: []
            });
            setShowForm(true);
          }}
          className="btn btn-primary w-full sm:w-auto"
        >
          <svg
            className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Staff Member
        </button>
      </div>

      {/* Staff List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-100">Team Members</h3>
          <p className="text-sm text-gray-400 mt-1">
            All staff members in your organization
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
                <span className="text-gray-400">Loading staff...</span>
              </div>
            </div>
          ) : staff.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-100">
                No staff members
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Get started by adding your first team member.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full whitespace-nowrap min-w-[900px]">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="hidden sm:table-cell">Email</th>
                    <th>Role</th>
                    <th className="hidden md:table-cell">Phone</th>
                    <th className="hidden lg:table-cell">Calls Made</th>
                    <th className="hidden lg:table-cell">Calls Received</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 lg:mr-3">
                            <svg
                              className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600"
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
                          <div>
                            <span className="font-medium text-sm lg:text-base">
                              {s.name}
                            </span>
                            <p className="text-xs text-gray-500 sm:hidden">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell text-sm">
                        {s.email}
                      </td>
                      <td>
                        <span className="badge badge-gray text-xs">
                          {s.role}
                        </span>
                      </td>
                      <td className="hidden md:table-cell text-sm text-gray-600">
                        {s.phone || "N/A"}
                      </td>
                      <td className="hidden lg:table-cell text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-green-500 mr-1"
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
                          <span className="font-medium text-green-400">
                            {s.callsMade || 0}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-blue-500 mr-1"
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
                          <span className="font-medium text-blue-400">
                            {s.callsReceived || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setEditStaff(s);
                              setFormData({
                                name: s.name,
                                email: s.email,
                                role: s.role,
                                phone: s.phone,
                                password: "",
                                permissions: Array.isArray(s.permissions) ? s.permissions : [],
                              });
                              setShowForm(true);
                            }}
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
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-gray-700 modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  {editStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {editStaff
                    ? "Update staff member information"
                    : "Enter details for the new team member"}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200 p-2 rounded-lg cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto modal-body">
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="agent">Agent</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter phone number (optional)"
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editStaff
                        ? "Leave blank to keep current password"
                        : "Enter secure password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    required={!editStaff}
                  />
                </div>

                <div>
                  <label className="form-label">Permissions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-700 border border-gray-600 rounded-lg p-3">
                    {[
                      { key: 'payment', label: 'Payment Module' },
                      { key: 'staff', label: 'Staff Module' },
                      { key: 'files', label: 'Files Module' },
                      { key: 'dialer', label: 'Dialer Module' },
                      { key: 'scraper', label: 'Run Scraper Module' },
                    ].map((perm) => (
                      <label key={perm.key} className="inline-flex items-center space-x-2 text-gray-200">
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          checked={formData.permissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800 rounded-b-2xl modal">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary order-1 sm:order-2"
              >
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {editStaff ? "Update Staff" : "Create Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
