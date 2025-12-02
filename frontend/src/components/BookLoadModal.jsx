import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';

const BookLoadModal = ({ isOpen, onClose, driver }) => {
  const [formData, setFormData] = useState({
    agentName: '',
    percentage: 0,
    carrierPacket: '',
    // Load details
    from: '',
    to: '',
    dhMiles: '',
    lmMiles: '',
    amount: '',
    puDate: '',
    delType: 'Direct',
    loadDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState('');
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  React.useEffect(() => {
    if (isOpen && driver) {
      // Pre-fill with existing loader info if available
      setFormData({
        agentName: driver.loaderInfo?.agentName || '',
        percentage: driver.loaderInfo?.percentage || 0,
        carrierPacket: driver.loaderInfo?.carrierPacket || '',
        from: '',
        to: '',
        dhMiles: '',
        lmMiles: '',
        amount: '',
        puDate: '',
        delType: 'Direct',
        loadDetails: ''
      });
    }
  }, [isOpen, driver]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total payment from amount
      const totalPayment = parseFloat(formData.amount) || 0;
      const percentage = parseFloat(formData.percentage) || 0;
      const shouldSendInvoice = formData.percentage != 0 && 
                formData.amount != 0
      // Update driver with loader info and load details
      const updatePayload = {
        loaderInfo: {
          agentName: formData.agentName,
          percentage: percentage,
          totalPayment: totalPayment,
          carrierPacket: formData.carrierPacket,
          documents: driver.loaderInfo?.documents || 'No Docs',
          reviews: driver.loaderInfo?.reviews || 'Average Response'
        },
        hasLoader: true,
        shouldSendInvoice: shouldSendInvoice,
        // Store load details (we'll create a proper Load model later)
        loadDetails: {
          from: formData.from,
          to: formData.to,
          dhMiles: formData.dhMiles,
          lmMiles: formData.lmMiles,
          amount: formData.amount,
          puDate: formData.puDate,
          delType: formData.delType,
          loadDetails: formData.loadDetails
        }
      };

      const response = await fetch(`${SERVER_URL}/drivers/${driver._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      
      if (data.success) {
        success('Load booked successfully!');
        
        // Generate payment link if percentage and amount are provided
        if (percentage > 0 && totalPayment > 0) {
          try {
            // const paymentAmount = (totalPayment * percentage) / 100;
            // const customer_email = driver.carrierInfo?.email || driver.ownerDriverInfo?.driverPhone || '';
            // const title = `Loader Commission - ${driver.carrierInfo?.companyName || 'Load Payment'}`;

            // const paymentResponse = await apiService.createPayment({
            //   amount: paymentAmount,
            //   title,
            //   customer_email,
            //   currency: 'usd',
            // });

            setCheckoutLink(data.data.loaderInfo.paymentLink || '');
            if(
                shouldSendInvoice
              )
                setShowCheckoutModal(true);
          } catch (err) {
            console.error('Payment link creation failed:', err);
            error('Load booked but payment link creation failed');
            onClose();
          }
        } else {
          onClose();
        }
      } else {
        error(data.error || data.message || 'Failed to book load');
      }
    } catch (err) {
      error('Failed to book load');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Book a Load</h2>
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
              {/* Loader Information */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Loader Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={formData.agentName}
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
                      value={formData.percentage}
                      onChange={(e) => handleInputChange('percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Carrier Packet</label>
                    <input
                      type="text"
                      value={formData.carrierPacket}
                      onChange={(e) => handleInputChange('carrierPacket', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      value={formData.from}
                      onChange={(e) => handleInputChange('from', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Wooster, OH"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cuyahoga Falls, OH"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">DH Miles</label>
                    <input
                      type="number"
                      value={formData.dhMiles}
                      onChange={(e) => handleInputChange('dhMiles', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LM Miles</label>
                    <input
                      type="number"
                      value={formData.lmMiles}
                      onChange={(e) => handleInputChange('lmMiles', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 150"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">PU Date</label>
                    <input
                      type="date"
                      value={formData.puDate}
                      onChange={(e) => handleInputChange('puDate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Type</label>
                    <select
                      value={formData.delType}
                      onChange={(e) => handleInputChange('delType', e.target.value)}
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
                      value={formData.loadDetails}
                      onChange={(e) => handleInputChange('loadDetails', e.target.value)}
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
                  {loading ? 'Booking...' : 'Book Load'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Checkout Link Modal */}
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
    </>
  );
};

export default BookLoadModal;

