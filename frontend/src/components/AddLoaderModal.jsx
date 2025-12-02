import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

const AddLoaderModal = ({ isOpen, onClose, onSuccess, driverToEdit = null }) => {
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
    },
    loadDetails: {
      from: '',
      to: '',
      dhMiles: '',
      lmMiles: '',
      amount: '',
      puDate: '',
      delType: 'Direct',
      loadDetails: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen) {
      if (driverToEdit) {
        // Editing mode - pre-fill form with driver data
        setSelectedDriverId(driverToEdit._id);
        setFormData({
          loaderInfo: {
            agentName: driverToEdit.loaderInfo?.agentName || '',
            percentage: driverToEdit.loaderInfo?.percentage || 0,
            documents: driverToEdit.loaderInfo?.documents || 'No Docs',
            carrierPacket: driverToEdit.loaderInfo?.carrierPacket || '',
            reviews: driverToEdit.loaderInfo?.reviews || 'Average Response'
          },
          loadDetails: {
            from: driverToEdit.loadDetails?.from || '',
            to: driverToEdit.loadDetails?.to || '',
            dhMiles: driverToEdit.loadDetails?.dhMiles || '',
            lmMiles: driverToEdit.loadDetails?.lmMiles || '',
            amount: driverToEdit.loadDetails?.amount || '',
            puDate: driverToEdit.loadDetails?.puDate ? new Date(driverToEdit.loadDetails.puDate).toISOString().split('T')[0] : '',
            delType: driverToEdit.loadDetails?.delType || 'Direct',
            loadDetails: driverToEdit.loadDetails?.loadDetails || ''
          }
        });
      } else {
        // New mode - reset form
        setSelectedDriverId('');
        setFormData({
          loaderInfo: {
            agentName: '',
            percentage: 0,
            documents: 'No Docs',
            carrierPacket: '',
            reviews: 'Average Response'
          },
          loadDetails: {
            from: '',
            to: '',
            dhMiles: '',
            lmMiles: '',
            amount: '',
            puDate: '',
            delType: 'Direct',
            loadDetails: ''
          }
        });
      }
      fetchActiveDrivers();
    }
  }, [isOpen, driverToEdit]);

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
    if (field.startsWith('loaderInfo.')) {
      const key = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        loaderInfo: {
          ...prev.loaderInfo,
          [key]: value
        }
      }));
    } else if (field.startsWith('loadDetails.')) {
      const key = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        loadDetails: {
          ...prev.loadDetails,
          [key]: value
        }
      }));
    } else {
      // Fallback or other fields
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDriverId) {
      error('Please select a driver');
      return;
    }
    const shouldSendInvoice = formData.loaderInfo.percentage != 0 &&
      formData.loadDetails.amount != 0 &&
      (formData.loadDetails.amount != driverToEdit.loadDetails?.amount ||
        formData.loaderInfo.percentage != driverToEdit.loaderInfo?.percentage)

    const preparePayload = {
      ...formData,
      hasLoader: true,
      shouldSendInvoice: shouldSendInvoice,
      loadDetails: formData.loadDetails
    }
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/drivers/${selectedDriverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(preparePayload),
      });

      const data = await response.json();

      if (data.success) {
        success('Loader details updated successfully');
        setCheckoutLink(data.data.loaderInfo.paymentLink || '');
        if (shouldSendInvoice)
          setShowCheckoutModal(true);
        else onClose()
        onSuccess();
        // onClose();
        // Reset form
        setFormData({
          loaderInfo: {
            agentName: '',
            percentage: 0,
            documents: 'No Docs',
            carrierPacket: '',
            reviews: 'Average Response'
          },
          loadDetails: {
            from: '',
            to: '',
            dhMiles: '',
            lmMiles: '',
            amount: '',
            puDate: '',
            delType: 'Direct',
            loadDetails: ''
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
            <h2 className="text-2xl font-bold text-white">{driverToEdit ? 'Edit Loader Details' : 'Set Loader Details'}</h2>
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
                  disabled={!!driverToEdit}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.carrierInfo?.companyName} - {driver.ownerDriverInfo?.driverName || driver.ownerDriverInfo?.fullName} (MC: {driver.carrierInfo?.mcNumber})
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
                    onChange={(e) => handleInputChange('loaderInfo.agentName', e.target.value)}
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
                    onChange={(e) => handleInputChange('loaderInfo.percentage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Documents</label>
                  <select
                    value={formData.loaderInfo.documents}
                    onChange={(e) => handleInputChange('loaderInfo.documents', e.target.value)}
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
                    onChange={(e) => handleInputChange('loaderInfo.carrierPacket', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reviews</label>
                  <select
                    value={formData.loaderInfo.reviews}
                    onChange={(e) => handleInputChange('loaderInfo.reviews', e.target.value)}
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

            {/* Load Details */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Load Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
                  <input
                    type="text"
                    value={formData.loadDetails.from}
                    onChange={(e) => handleInputChange('loadDetails.from', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Wooster, OH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                  <input
                    type="text"
                    value={formData.loadDetails.to}
                    onChange={(e) => handleInputChange('loadDetails.to', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cuyahoga Falls, OH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DH Miles</label>
                  <input
                    type="number"
                    value={formData.loadDetails.dhMiles}
                    onChange={(e) => handleInputChange('loadDetails.dhMiles', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 55"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LM Miles</label>
                  <input
                    type="number"
                    value={formData.loadDetails.lmMiles}
                    onChange={(e) => handleInputChange('loadDetails.lmMiles', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.loadDetails.amount}
                    onChange={(e) => handleInputChange('loadDetails.amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PU Date</label>
                  <input
                    type="date"
                    value={formData.loadDetails.puDate}
                    onChange={(e) => handleInputChange('loadDetails.puDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Type</label>
                  <select
                    value={formData.loadDetails.delType}
                    onChange={(e) => handleInputChange('loadDetails.delType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Direct">Direct</option>
                    <option value="LTL">LTL</option>
                    <option value="FTL">FTL</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Load Details (Additional Info)</label>
                  <textarea
                    value={formData.loadDetails.loadDetails}
                    onChange={(e) => handleInputChange('loadDetails.loadDetails', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional load information..."
                  />
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
                {loading ? (driverToEdit ? 'Updating...' : 'Creating...') : (driverToEdit ? 'Update Loader Details' : 'Create Loader Details')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">Checkout Link</h3>
                <p className="text-sm text-gray-400 mt-1">Share this link with the customer to complete payment</p>
              </div>
              <button
                onClick={() => { setShowCheckoutModal(false); onClose(); }}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200 p-2 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-400">Payment link created successfully!</h3>
                  <p className="text-sm text-gray-300 mt-1">Use the link below to proceed with payment.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Checkout Link</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={checkoutLink}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:rounded-r-none"
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(checkoutLink); success('Link copied to clipboard!'); }}
                      className="px-4 py-2 bg-gray-600 text-white rounded sm:rounded-l-none sm:border-l-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.open(checkoutLink, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Open Link
                  </button>
                  <button
                    onClick={() => { setShowCheckoutModal(false); onClose(); }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLoaderModal;
