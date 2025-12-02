import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import AddLoaderModal from '../components/AddLoaderModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoaderCarrierPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all'); // New month filter
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
      driver.loaderInfo?.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.loadDetails?.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.loadDetails?.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.loadDetails?.loadDetails?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by month if not 'all'
    let matchesMonth = true;
    if (monthFilter !== 'all' && driver.loadDetails?.puDate) {
      const loadDate = new Date(driver.loadDetails.puDate);
      const now = new Date();

      switch (monthFilter) {
        case 'current':
          matchesMonth = loadDate.getMonth() === now.getMonth() && loadDate.getFullYear() === now.getFullYear();
          break;
        case 'last':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesMonth = loadDate.getMonth() === lastMonth.getMonth() && loadDate.getFullYear() === lastMonth.getFullYear();
          break;
        case 'last3':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          matchesMonth = loadDate >= threeMonthsAgo;
          break;
        case 'last6':
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          matchesMonth = loadDate >= sixMonthsAgo;
          break;
        default:
          matchesMonth = true;
      }
    }

    return matchesSearch && driver.hasLoader && matchesMonth;
  });

  const getStatusColor = (driver) => {
    // Since this page only shows active drivers (Approved + Gross > 300), 
    // we can default to green if it meets criteria
    if (driver.status === 'Approved' && driver.gross > 300) {
      return 'bg-green-100 text-green-800';
    }
    const colors = {
      Active: 'bg-green-100 text-green-800',
      'N/A': 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      'Truck out of Order': 'bg-orange-100 text-orange-800',
      'Inactive MC': 'bg-gray-100 text-gray-800'
    };
    return colors[driver.status] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentsColor = (documents) => {
    const colors = {
      'No Docs': 'bg-red-100 text-red-800',
      'Partial Docs': 'bg-yellow-100 text-yellow-800',
      'All Docs': 'bg-green-100 text-green-800',
    };
    return colors[documents] || 'bg-gray-100 text-gray-800';
  };

  const getReviewsColor = (reviews) => {
    const colors = {
      'Average Response': 'bg-yellow-100 text-yellow-800',
      'Not Responsing': 'bg-red-100 text-red-800',
      'Good Response': 'bg-green-100 text-green-800',
    };
    return colors[reviews] || 'bg-gray-100 text-gray-800';
  };

  // Calculate monthly loads ratio based on filtered drivers
  const getMonthlyLoadsRatio = () => {
    const last6Months = [];
    const now = new Date();

    // Use filteredDrivers instead of all drivers
    const driversToUse = filteredDrivers;

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      // Count loads (drivers with loadDetails) in this month
      const loadsInMonth = driversToUse.filter(driver => {
        if (!driver.loadDetails || !driver.loadDetails.puDate) return false;
        const loadDate = new Date(driver.loadDetails.puDate);
        return loadDate.getMonth() === date.getMonth() &&
          loadDate.getFullYear() === date.getFullYear();
      }).length;

      // Count total active drivers in this month
      let allDriversCount = 0;
      let activeDriversCount = 0;

      driversToUse.forEach(d => {
        const r = new Date(d.registrationDate);
        if (r.getFullYear() > date.getFullYear() || (r.getFullYear() === date.getFullYear() && r.getMonth() > date.getMonth())) return;

        allDriversCount++;

        if (window.isActiveDriver(d.loadDetails?.amount, d.loaderInfo?.percentage, d.status)) activeDriversCount++;
      });


      const ratio = allDriversCount > 0
        ? Math.round((loadsInMonth / allDriversCount) * 100)
        : 0;

      last6Months.push({
        month: monthName,
        loads: loadsInMonth,
        allDrivers: allDriversCount,
        activeDrivers: activeDriversCount,
        ratio: ratio
      });
    }

    return last6Months;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Loads</h1>
          <p className="text-gray-400">Manage loader details for active drivers</p>
        </div>
        {/* <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Set Loader Details</span>
        </button> */}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by driver, company, MC, agent, or load location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="current">Current Month</option>
          <option value="last">Last Month</option>
          <option value="last3">Last 3 Months</option>
          <option value="last6">Last 6 Months</option>
        </select>
      </div>

      {/* Total Gross Amount and Agent Earning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Total Gross Amount</div>
          <div className="text-3xl font-bold text-green-400">
            ${filteredDrivers
              .filter(d => d.loadDetails && d.loadDetails.amount)
              .reduce((sum, d) => sum + (parseFloat(d.loadDetails.amount) || 0), 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Sum of all load amounts
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Agent Earning</div>
          <div className="text-3xl font-bold text-blue-400">
            ${filteredDrivers
              .filter(d => d.loadDetails && d.loadDetails.amount && d.loaderInfo?.percentage)
              .reduce((sum, d) => {
                const loadAmount = parseFloat(d.loadDetails.amount) || 0;
                const percentage = parseFloat(d.loaderInfo.percentage) || 0;
                const earning = (loadAmount * percentage) / 100;
                return sum + earning;
              }, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Total commission from all loads
          </div>
        </div>
      </div>

      {/* Monthly Loads Ratio */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Loads Ratio</h2>
        <div className="h-80 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyLoadsRatio()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend wrapperStyle={{ color: '#F3F4F6' }} />
              <Bar dataKey="loads" fill="#3B82F6" name="Loads" />
              <Bar dataKey="activeDrivers" fill="#10B981" name="Active Drivers" />
              <Bar dataKey="ratio" fill="#F59E0B" name="Ratio %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Loads</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredDrivers.filter(d => d.loadDetails && d.loadDetails.puDate).length}
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Active Drivers with Loads</div>
            <div className="text-2xl font-bold text-green-400">
              {filteredDrivers.filter(d => {
                return d.hasLoader && d.loadDetails && d.loadDetails.puDate && window.isActiveDriver(d.loadDetails?.amount, d.loaderInfo?.percentage, d.status);
              }).length}
            </div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Overall Load Ratio</div>
            <div className="text-2xl font-bold text-yellow-400">
              {filteredDrivers.length > 0
                ? Math.round((filteredDrivers.filter(d => d.hasLoader && d.loadDetails && d.loadDetails.puDate).length / filteredDrivers.length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading drivers...</div>
      ) : (
        <>
          {/* Loader/Carrier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {
              filteredDrivers.map((driver, index) => (
                <div
                  key={driver._id}
                  onClick={() => {
                    setEditingDriver(driver);
                    setShowAddModal(true);
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver)}`}>
                      {window.isActiveDriver(driver.loadDetails?.amount, driver.loaderInfo?.percentage, driver.status) ? 'Active' : driver.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-gray-500 mr-2">Agent:</span>
                      <span>{driver.loaderInfo?.agentName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-gray-500 mr-2">Percentage:</span>
                      <span>{driver.loaderInfo?.percentage || 0}%</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-gray-500 mr-2">MC:</span>
                      <span>{driver.carrierInfo?.mcNumber}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-gray-500 mr-2">Truck:</span>
                      <span>{driver.truckEquipmentInfo?.truckType}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-gray-500 mr-2">Carrier Packet:</span>
                      <span className="truncate">{driver.loaderInfo?.carrierPacket || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="text-gray-500 mr-2">Date:</span>
                      <span>{new Date(driver.registrationDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDocumentsColor(driver.loaderInfo?.documents || 'No Docs')}`}>
                      {driver.loaderInfo?.documents || 'No Docs'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReviewsColor(driver.loaderInfo?.reviews || 'Average Response')}`}>
                      {driver.loaderInfo?.reviews || 'Average Response'}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>

          {
            filteredDrivers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No active drivers found</div>
                <div className="text-gray-500 text-sm">Only active drivers from the Drivers tab are shown here</div>
              </div>
            )
          }
        </>
      )}

      {/* Add Loader Modal */}
      <AddLoaderModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingDriver(null);
        }}
        onSuccess={handleLoaderAdded}
        driverToEdit={editingDriver}
      />
    </div>
  );
};

export default LoaderCarrierPage;
