import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext.jsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StaffPage() {
  const { success, error, warning } = useToast();
  const [staff, setStaff] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    permissions: [],
  });
  const [agendaData, setAgendaData] = useState({
    dailyAgenda: { callsGoal: 0, leadsGoal: 0 },
    monthlyAgenda: { callsGoal: 0, leadsGoal: 0 }
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    minCallsMade: "",
    maxCallsMade: "",
    minLeads: "",
    maxLeads: "",
    callDateFrom: "",
    callDateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStaff = async (filterParams = {}) => {
    try {
      setLoading(true);
      const staffData = await apiService.getStaff(filterParams);
      setStaff(staffData);

      // Fetch performance data with same filters
      const performanceData = await apiService.getStaffPerformance(filterParams);
      setPerformance(performanceData);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    fetchStaff(activeFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minCallsMade: "",
      maxCallsMade: "",
      minLeads: "",
      maxLeads: "",
      callDateFrom: "",
      callDateTo: "",
    });
    fetchStaff();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStaff) {
        await apiService.updateStaff(editStaff._id, formData);
        success("Staff updated successfully!");
      } else {
        await apiService.createStaff(formData);
        success("Staff created successfully!");
      }

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
      await fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      error("Failed to delete staff: " + err.message);
    }
  };

  const handleAgendaSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateStaffAgenda(selectedStaff._id, agendaData);
      success("Agenda updated successfully!");
      setShowAgendaModal(false);
      await fetchStaff();
    } catch (err) {
      console.error("Failed to update agenda:", err);
      error("Failed to update agenda: " + err.message);
    }
  };

  const openAgendaModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setAgendaData({
      dailyAgenda: staffMember.dailyAgenda || { callsGoal: 0, leadsGoal: 0 },
      monthlyAgenda: staffMember.monthlyAgenda || { callsGoal: 0, leadsGoal: 0 }
    });
    setShowAgendaModal(true);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  const calculateProgress = (actual, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((actual / goal) * 100, 100);
  };

  // Get performance data for a staff member
  const getStaffPerformance = (staffId) => {
    return performance.find(p => p._id === staffId) || {
      callsMade: 0,
      leadsCreated: 0,
      dailyAgenda: { callsGoal: 0, leadsGoal: 0 },
      monthlyAgenda: { callsGoal: 0, leadsGoal: 0 }
    };
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary w-full sm:w-auto"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              />
            </svg>
            Filters
          </button>
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
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-300 pb-4">Advanced Filters</h4>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name, email, or role..."
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="border-t border-gray-700 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Call Metrics */}
                <div>
                  <label className="form-label text-xs">Min Calls Made</label>
                  <input
                    type="number"
                    name="minCallsMade"
                    value={filters.minCallsMade}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Max Calls Made</label>
                  <input
                    type="number"
                    name="maxCallsMade"
                    value={filters.maxCallsMade}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="100"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Min Leads</label>
                  <input
                    type="number"
                    name="minLeads"
                    value={filters.minLeads}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Max Leads</label>
                  <input
                    type="number"
                    name="maxLeads"
                    value={filters.maxLeads}
                    onChange={handleFilterChange}
                    className="form-input"
                    placeholder="100"
                    min="0"
                  />
                </div>

                {/* Date Filters */}
                <div>
                  <label className="form-label text-xs">Call Date From</label>
                  <input
                    type="date"
                    name="callDateFrom"
                    value={filters.callDateFrom}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Call Date To</label>
                  <input
                    type="date"
                    name="callDateTo"
                    value={filters.callDateTo}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5 gap-4">
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="btn btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Graph */}
      {performance.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-100">Team Performance</h3>
            <p className="text-sm text-gray-400 mt-1">
              Calls made and leads created by team members
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={performance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Bar
                  dataKey="callsMade"
                  fill="#10B981"
                  name="Calls Made"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="leadsCreated"
                  fill="#3B82F6"
                  name="Leads Created"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Staff Cards */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-100">Team Members</h3>
          <p className="text-sm text-gray-400 mt-1">
            All staff members in your organization
          </p>
        </div>
        <div className="card-body">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((s) => {
                const perf = getStaffPerformance(s._id);
                const dailyCallsProgress = calculateProgress(perf.callsMade, perf.dailyAgenda.callsGoal);
                const dailyLeadsProgress = calculateProgress(perf.leadsCreated, perf.dailyAgenda.leadsGoal);
                const monthlyCallsProgress = calculateProgress(perf.callsMade, perf.monthlyAgenda.callsGoal);
                const monthlyLeadsProgress = calculateProgress(perf.leadsCreated, perf.monthlyAgenda.leadsGoal);

                return (
                  <div
                    key={s._id}
                    className="bg-gray-700 h-[435px] relative border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-all cursor-pointer"
                    onClick={() => openAgendaModal(s)}
                  >
                    {/* Card Header */}
                    <div className="p-4 bg-gray-750">
                      <div className="flex items-center space-x-3">
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-100 truncate">{s.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{s.email}</p>
                        </div>
                        <span className="badge badge-gray text-xs">{s.role}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Phone */}
                      {s.phone && (
                        <div className="flex items-center text-sm text-gray-300">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {s.phone}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-300">{perf.callsMade} calls</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-gray-300">{perf.leadsCreated} leads</span>
                        </div>
                      </div>
                      {/* Daily Progress */}
                      {(perf.dailyAgenda.callsGoal > 0 || perf.dailyAgenda.leadsGoal > 0) && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400">Daily Progress</p>
                          {perf.dailyAgenda.callsGoal > 0 && (
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-1">
                                <span>Calls</span>
                                <span>{perf.callsMade}/{perf.dailyAgenda.callsGoal}</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(dailyCallsProgress)} transition-all duration-300`}
                                  style={{ width: `${dailyCallsProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {perf.dailyAgenda.leadsGoal > 0 && (
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-1">
                                <span>Leads</span>
                                <span>{perf.leadsCreated}/{perf.dailyAgenda.leadsGoal}</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(dailyLeadsProgress)} transition-all duration-300`}
                                  style={{ width: `${dailyLeadsProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Monthly Progress */}
                      {(perf.monthlyAgenda.callsGoal > 0 || perf.monthlyAgenda.leadsGoal > 0) && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400">Monthly Progress</p>
                          {perf.monthlyAgenda.callsGoal > 0 && (
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-1">
                                <span>Calls</span>
                                <span>{perf.callsMade}/{perf.monthlyAgenda.callsGoal}</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(monthlyCallsProgress)} transition-all duration-300`}
                                  style={{ width: `${monthlyCallsProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {perf.monthlyAgenda.leadsGoal > 0 && (
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-1">
                                <span>Leads</span>
                                <span>{perf.leadsCreated}/{perf.monthlyAgenda.leadsGoal}</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(monthlyLeadsProgress)} transition-all duration-300`}
                                  style={{ width: `${monthlyLeadsProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 bg-gray-750 border-t border-gray-600 flex gap-2 absolute bottom-0 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
                        className="btn btn-secondary btn-sm flex-1 text-xs"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s._id);
                        }}
                        className="btn btn-error btn-sm flex-1 text-xs"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Agenda Modal */}
      {showAgendaModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  Set Agenda for {selectedStaff.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Define daily and monthly goals
                </p>
              </div>
              <button
                onClick={() => setShowAgendaModal(false)}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200 p-2 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAgendaSubmit} className="p-6 space-y-6">
              {/* Daily Agenda */}
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Daily Goals</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Calls Goal</label>
                    <input
                      type="number"
                      min="0"
                      value={agendaData.dailyAgenda.callsGoal}
                      onChange={(e) => setAgendaData(prev => ({
                        ...prev,
                        dailyAgenda: { ...prev.dailyAgenda, callsGoal: parseInt(e.target.value) || 0 }
                      }))}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Leads Goal</label>
                    <input
                      type="number"
                      min="0"
                      value={agendaData.dailyAgenda.leadsGoal}
                      onChange={(e) => setAgendaData(prev => ({
                        ...prev,
                        dailyAgenda: { ...prev.dailyAgenda, leadsGoal: parseInt(e.target.value) || 0 }
                      }))}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Agenda */}
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Monthly Goals</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Calls Goal</label>
                    <input
                      type="number"
                      min="0"
                      value={agendaData.monthlyAgenda.callsGoal}
                      onChange={(e) => setAgendaData(prev => ({
                        ...prev,
                        monthlyAgenda: { ...prev.monthlyAgenda, callsGoal: parseInt(e.target.value) || 0 }
                      }))}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Leads Goal</label>
                    <input
                      type="number"
                      min="0"
                      value={agendaData.monthlyAgenda.leadsGoal}
                      onChange={(e) => setAgendaData(prev => ({
                        ...prev,
                        monthlyAgenda: { ...prev.monthlyAgenda, leadsGoal: parseInt(e.target.value) || 0 }
                      }))}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Form Modal (existing) */}
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
                      { key: 'dialer', label: 'Dialer/Lead Module' },
                      { key: 'driver', label: 'Driver Module' },
                      { key: 'load', label: 'Load Module' },
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
