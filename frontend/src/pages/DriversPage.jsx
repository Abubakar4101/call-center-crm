import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import DriverRegistrationModal from '../components/DriverRegistrationModal';
import DriverDetailModal from '../components/DriverDetailModal';
import BookLoadModal from '../components/BookLoadModal';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookLoadModal, setShowBookLoadModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToEdit, setDriverToEdit] = useState(null);
  const [stats, setStats] = useState({});
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [searchTerm, statusFilter]);

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const url = `${SERVER_URL}/drivers${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (err) {
      error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/drivers/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleStatusUpdate = async (driverId, newStatus) => {
    try {
      const response = await fetch(`${SERVER_URL}/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        success(`Driver status updated to ${newStatus}`);
        fetchDrivers();
        fetchStats();
      } else {
        error(data.message || 'Failed to update status');
      }
    } catch (err) {
      error(err);
    }
  };

  const handleDelete = async (driverId) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const response = await fetch(`${SERVER_URL}/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        success('Driver deleted successfully');
        fetchDrivers();
        fetchStats();
      } else {
        error(data.message || 'Failed to delete driver');
      }
    } catch (err) {
      error(err);
    }
  };

  const handleDriverAdded = () => {
    fetchDrivers();
    fetchStats();
  };

  const handleEditDriver = (driver) => {
    setDriverToEdit(driver);
    setShowEditModal(true);
  };

  const handleDriverUpdated = () => {
    fetchDrivers();
    fetchStats();
    setShowEditModal(false);
    setDriverToEdit(null);
  };

  // Since backend now handles filtering, we use drivers directly
  const filteredDrivers = drivers;

  const getStatusColor = (driver) => {
    const status = driver.status;
    // Custom logic for Active vs Approved
    if (status === 'Approved') {
      if (driver.gross > 300) {
        return 'bg-green-100 text-green-800'; // Active color
      }
      return 'bg-blue-100 text-blue-800'; // Approved color
    }

    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate pie chart data (based on loads per driver)
  const getPieChartData = () => {
    // Filter drivers who have loads
    const driversWithLoads = drivers.filter(d => d.loadDetails && d.loadDetails.puDate);

    // Calculate total loads
    const totalLoads = driversWithLoads.length;

    // Map each driver to pie chart data
    const pieData = driversWithLoads.map(driver => {
      const driverName = driver.carrierInfo?.companyName || driver.ownerDriverInfo?.driverName || 'Unknown';
      // Calculate agent percentage amount = (loadDetails.amount * loaderInfo.percentage) / 100
      const driverStatus = window.isActiveDriver(driver.loadDetails?.amount, driver.loaderInfo?.percentage, driver.status) ? 'Active' : driver.status;
      const loads = 1; // Each driver has 1 load in current implementation
      const loadRatio = totalLoads > 0 ? ((loads / totalLoads) * 100).toFixed(1) : 0;

      return {
        name: driverName,
        status: driverStatus,
        loads: loads,
        loadRatio: parseFloat(loadRatio),
        value: loads // For pie chart segment size
      };
    });

    return pieData;
  };

  // Color palette for pie chart - matching app color scheme
  const COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#A855F7', // purple-500
    '#84CC16'  // lime-500
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Drivers</h1>
          <p className="text-gray-400">Manage driver registrations and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Driver</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Performance Graph */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Driver Performance Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 mt-2">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{stats.totalDrivers || 0}</div>
            <div className="text-gray-400 text-sm">Total Drivers</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{stats.statusCounts?.Pending || 0}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{stats.statusCounts?.Approved || 0}</div>
            <div className="text-gray-400 text-sm">Approved</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.statusCounts?.Active || 0}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{stats.statusCounts?.Rejected || 0}</div>
            <div className="text-gray-400 text-sm">Rejected</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">{stats.statusCounts?.Inactive || 0}</div>
            <div className="text-gray-400 text-sm">Inactive</div>
          </div>
        </div>
        {/* Pie Chart and Top 5 Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart - Left Side */}
          <div className="lg:col-span-2">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-semibold mb-2">{data.name}</p>
                            <p className="text-gray-300 text-sm">Status: <span className="text-blue-400">{data.status}</span></p>
                            <p className="text-gray-300 text-sm">No. of Loads: <span className="text-green-400">{data.loads}</span></p>
                            <p className="text-gray-300 text-sm">Load Ratio: <span className="text-yellow-400">{data.loadRatio}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Drivers - Right Side */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Drivers</h3>
            <div className="space-y-3 mt-2">
              {getPieChartData()
                .sort((a, b) => b.loads - a.loads)
                .slice(0, 5)
                .map((driver, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm truncate">{driver.name}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.status === 'Active' ? 'bg-green-100 text-green-800' :
                        driver.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          driver.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            driver.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {driver.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Loads:</span>
                      <span className="text-green-400 font-semibold">{driver.loads}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Drivers with Loads</div>
            <div className="text-2xl font-bold text-green-400">
              {drivers.filter(d => d.loadDetails && d.loadDetails.puDate).length}
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Drivers Without Loads</div>
            <div className="text-2xl font-bold text-gray-400">
              {drivers.filter(d => !d.loadDetails || !d.loadDetails.puDate).length}
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver._id}
            onClick={() => {
              setSelectedDriver(driver);
              setShowDetailModal(true);
            }}
            className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {driver.ownerDriverInfo?.driverName || driver.ownerDriverInfo?.fullName}
                </h3>
                <p className="text-sm text-gray-400">
                  {driver.carrierInfo?.companyName}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={window.isActiveDriver(driver?.loaderInfo?.totalPayment, driver?.loaderInfo?.percentage, driver.status) ? 'Active' : driver.status}
                    onChange={(e) => handleStatusUpdate(driver._id, e.target.value)}
                    className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(driver)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-300">
                <span className="text-gray-500 mr-2">MC:</span>
                <span>{driver.carrierInfo?.mcNumber}</span>
              </div>
              {driver.carrierInfo?.dotNumber && (
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-gray-500 mr-2">DOT:</span>
                  <span>{driver.carrierInfo?.dotNumber}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-300">
                <span className="text-gray-500 mr-2">Truck:</span>
                <span>{driver.truckEquipmentInfo?.truckType}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <span className="text-gray-500 mr-2">Plate:</span>
                <span>{driver.truckEquipmentInfo?.licensePlate} ({driver.truckEquipmentInfo?.licenseState})</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="text-gray-500 mr-2">Registered:</span>
                <span>{new Date(driver.registrationDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleEditDriver(driver)}
                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
              >
                Edit
              </button>
              {driver.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(driver._id, 'Approved')}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(driver._id, 'Rejected')}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(driver._id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No drivers found</div>
          <div className="text-gray-500 text-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No drivers registered yet'}
          </div>
        </div>
      )}

      {/* Driver Registration Modal */}
      <DriverRegistrationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleDriverAdded}
      />

      {/* Driver Edit Modal */}
      <DriverRegistrationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setDriverToEdit(null);
        }}
        onSuccess={handleDriverUpdated}
        driverToEdit={driverToEdit}
      />

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        driver={selectedDriver}
        onBookLoad={(driver) => {
          setSelectedDriver(driver);
          setShowBookLoadModal(true);
        }}
      />

      {/* Book Load Modal */}
      <BookLoadModal
        isOpen={showBookLoadModal}
        onClose={() => {
          setShowBookLoadModal(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
      />
    </div>
  );
};

export default DriversPage;
