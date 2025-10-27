import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import DriverRegistrationModal from '../components/DriverRegistrationModal';
import DriverDetailModal from '../components/DriverDetailModal';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToEdit, setDriverToEdit] = useState(null);
  const [stats, setStats] = useState({});
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/drivers`, {
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

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.carrierInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.carrierInfo?.mcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.ownerDriverInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.truckEquipmentInfo?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.totalDrivers || 0}</div>
          <div className="text-gray-400 text-sm">Total Drivers</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{stats.statusCounts?.Pending || 0}</div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.statusCounts?.Active || 0}</div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-400">{stats.statusCounts?.Suspended || 0}</div>
          <div className="text-gray-400 text-sm">Suspended</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-400">{stats.statusCounts?.Inactive || 0}</div>
          <div className="text-gray-400 text-sm">Inactive</div>
        </div>
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Drivers Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Company/Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  MC/DOT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Truck Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDrivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {driver.carrierInfo?.companyName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {driver.ownerDriverInfo?.fullName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      MC: {driver.carrierInfo?.mcNumber}
                    </div>
                    <div className="text-sm text-gray-400">
                      DOT: {driver.carrierInfo?.dotNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {driver.truckEquipmentInfo?.truckType}
                    </div>
                    <div className="text-sm text-gray-400">
                      {driver.truckEquipmentInfo?.licensePlate} ({driver.truckEquipmentInfo?.licenseState})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(driver.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditDriver(driver)}
                        className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      {driver.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(driver._id, 'Active')}
                            className="text-green-400 hover:text-green-300 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(driver._id, 'Rejected')}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(driver._id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No drivers found</div>
          <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
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
      />
    </div>
  );
};

export default DriversPage;
