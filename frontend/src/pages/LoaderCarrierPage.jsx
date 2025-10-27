import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import AddLoaderModal from '../components/AddLoaderModal';

const LoaderCarrierPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      // Fetch only active drivers for the loader tab
      const response = await fetch(`${SERVER_URL}/drivers?status=Active`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (err) {
      error('Failed to fetch active drivers');
    } finally {
      setLoading(false);
    }
  };

  // Debounced update function
  const debouncedUpdate = useCallback(
    (() => {
      let timeoutId;
      return (driverId, field, value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performUpdate(driverId, field, value);
        }, 1000); // 1 second debounce
      };
    })(),
    []
  );

  const performUpdate = async (driverId, field, value) => {
    try {
      const response = await fetch(`${SERVER_URL}/drivers/${driverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      
      const data = await response.json();
      if (data.success) {
        success('Field updated successfully');
        // Remove from pending updates
        setPendingUpdates(prev => {
          const newPending = { ...prev };
          delete newPending[`${driverId}-${field}`];
          return newPending;
        });
        fetchDrivers();
      } else {
        error(data.message || 'Failed to update field');
      }
    } catch (err) {
      error(err);
    }
  };

  const handleFieldUpdate = (driverId, field, value) => {
    // For debounced fields, use debounced update
    const debouncedFields = ['loaderInfo.agentName', 'loaderInfo.percentage', 'loaderInfo.carrierPacket'];
    
    if (debouncedFields.includes(field)) {
      // Update local state immediately for UI responsiveness
      setDrivers(prev => prev.map(driver => {
        if (driver._id === driverId) {
          const newDriver = { ...driver };
          if (field === 'loaderInfo.agentName') {
            newDriver.loaderInfo = { ...newDriver.loaderInfo, agentName: value };
          } else if (field === 'loaderInfo.percentage') {
            newDriver.loaderInfo = { ...newDriver.loaderInfo, percentage: value };
          } else if (field === 'loaderInfo.carrierPacket') {
            newDriver.loaderInfo = { ...newDriver.loaderInfo, carrierPacket: value };
          }
          return newDriver;
        }
        return driver;
      }));

      // Mark as pending update
      setPendingUpdates(prev => ({
        ...prev,
        [`${driverId}-${field}`]: true
      }));

      // Debounced API call
      debouncedUpdate(driverId, field, value);
    } else {
      // For non-debounced fields, update immediately
      performUpdate(driverId, field, value);
    }
  };

  const handleLoaderAdded = () => {
    fetchDrivers();
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.carrierInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.carrierInfo?.mcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.ownerDriverInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.loaderInfo?.agentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Since we're only showing active drivers, we don't need status filter
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      'N/A': 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentsColor = (documents) => {
    const colors = {
      Received: 'bg-green-100 text-green-800',
      Missing: 'bg-red-100 text-red-800',
      'No Docs': 'bg-gray-100 text-gray-800'
    };
    return colors[documents] || 'bg-gray-100 text-gray-800';
  };

  const getReviewsColor = (reviews) => {
    const colors = {
      'Good Response': 'bg-green-100 text-green-800',
      'Booked for this week': 'bg-blue-100 text-blue-800',
      'Average Response': 'bg-yellow-100 text-yellow-800',
      'Not Responsing': 'bg-red-100 text-red-800',
      'Truck out of Order': 'bg-orange-100 text-orange-800',
      'Inactive MC': 'bg-gray-100 text-gray-800'
    };
    return colors[reviews] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-100">Loader/Carrier</h1>
          <p className="text-gray-400">Manage loader details for active drivers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Set Loader Details</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search active drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Loader/Carrier Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">Sr#</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">Date</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Agent Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">Driver Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">Truck Type</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">%</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">Company Name</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">State</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">M.C</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Phone No.</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">Email</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Documents</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Carrier Packet</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">Status</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-48">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDrivers.map((driver, index) => (
                <tr key={driver._id} className="hover:bg-gray-700">
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                    {index + 1}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(driver.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="text"
                        value={driver.loaderInfo?.agentName || ''}
                        onChange={(e) => handleFieldUpdate(driver._id, 'loaderInfo.agentName', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter agent name"
                      />
                      {pendingUpdates[`${driver._id}-loaderInfo.agentName`] && (
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.ownerDriverInfo?.fullName}>
                      {driver.ownerDriverInfo?.fullName}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.truckEquipmentInfo?.truckType}>
                      {driver.truckEquipmentInfo?.truckType}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={driver.loaderInfo?.percentage || 0}
                        onChange={(e) => handleFieldUpdate(driver._id, 'loaderInfo.percentage', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {pendingUpdates[`${driver._id}-loaderInfo.percentage`] && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.carrierInfo?.companyName}>
                      {driver.carrierInfo?.companyName}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.carrierInfo?.address?.state}>
                      {driver.carrierInfo?.address?.state}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.carrierInfo?.mcNumber}>
                      {driver.carrierInfo?.mcNumber}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.carrierInfo?.phone}>
                      {driver.carrierInfo?.phone}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="truncate" title={driver.carrierInfo?.email}>
                      {driver.carrierInfo?.email}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <select
                      value={driver.loaderInfo?.documents || 'No Docs'}
                      onChange={(e) => handleFieldUpdate(driver._id, 'loaderInfo.documents', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px] z-10"
                    >
                      <option value="Received">Received</option>
                      <option value="Missing">Missing</option>
                      <option value="No Docs">No Docs</option>
                    </select>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="text"
                        value={driver.loaderInfo?.carrierPacket || ''}
                        onChange={(e) => handleFieldUpdate(driver._id, 'loaderInfo.carrierPacket', e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter carrier packet"
                      />
                      {pendingUpdates[`${driver._id}-loaderInfo.carrierPacket`] && (
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <select
                      value={driver.status}
                      onChange={(e) => handleFieldUpdate(driver._id, 'status', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px] z-10"
                    >
                      <option value="Active">Active</option>
                      <option value="N/A">N/A</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <select
                      value={driver.loaderInfo?.reviews || 'Average Response'}
                      onChange={(e) => handleFieldUpdate(driver._id, 'loaderInfo.reviews', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px] z-10"
                    >
                      <option value="Average Response">Average Response</option>
                      <option value="Booked for this week">Booked for this week</option>
                      <option value="Good Response">Good Response</option>
                      <option value="Not Responsing">Not Responsing</option>
                      <option value="Truck out of Order">Truck out of Order</option>
                      <option value="Inactive MC">Inactive MC</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No active drivers found</div>
          <div className="text-gray-500 text-sm">Only active drivers from the Drivers tab are shown here</div>
        </div>
      )}

      {/* Add Loader Modal */}
      <AddLoaderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleLoaderAdded}
      />
    </div>
  );
};

export default LoaderCarrierPage;
