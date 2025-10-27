import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

const AddLoaderModal = ({ isOpen, onClose, onSuccess }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [formData, setFormData] = useState({
    // Loader specific fields only
    loaderInfo: {
      agentName: '',
      percentage: 0,
      documents: 'No Docs',
      carrierPacket: '',
      reviews: 'Average Response'
    }
  });

  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen) {
      fetchActiveDrivers();
    }
  }, [isOpen]);

  const fetchActiveDrivers = async () => {
    try {
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
      error(err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      loaderInfo: {
        ...prev.loaderInfo,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDriverId) {
      error('Please select a driver');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/drivers/${selectedDriverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        success('Loader details updated successfully');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          loaderInfo: {
            agentName: '',
            percentage: 0,
            documents: 'No Docs',
            carrierPacket: '',
            reviews: 'Average Response'
          }
        });
        setSelectedDriverId('');
      } else {
        error(data.error || data.message || 'Failed to update loader details');
      }
    } catch (err) {
      error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Set Loader Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Driver Selection */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Select Active Driver</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Driver *</label>
                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.carrierInfo?.companyName} - {driver.ownerDriverInfo?.fullName} (MC: {driver.carrierInfo?.mcNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Loader Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Loader Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.loaderInfo.agentName}
                    onChange={(e) => handleInputChange('agentName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.loaderInfo.percentage}
                    onChange={(e) => handleInputChange('percentage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Documents</label>
                  <select
                    value={formData.loaderInfo.documents}
                    onChange={(e) => handleInputChange('documents', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Missing">Missing</option>
                    <option value="No Docs">No Docs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Carrier Packet</label>
                  <input
                    type="text"
                    value={formData.loaderInfo.carrierPacket}
                    onChange={(e) => handleInputChange('carrierPacket', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reviews</label>
                  <select
                    value={formData.loaderInfo.reviews}
                    onChange={(e) => handleInputChange('reviews', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Average Response">Average Response</option>
                    <option value="Booked for this week">Booked for this week</option>
                    <option value="Good Response">Good Response</option>
                    <option value="Not Responsing">Not Responsing</option>
                    <option value="Truck out of Order">Truck out of Order</option>
                    <option value="Inactive MC">Inactive MC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Loader Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLoaderModal;
