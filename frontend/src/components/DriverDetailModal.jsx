import React from 'react';

const DriverDetailModal = ({ isOpen, onClose, driver }) => {
  if (!isOpen || !driver) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Driver Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{driver.carrierInfo?.companyName}</h3>
                <p className="text-gray-400">{driver.ownerDriverInfo?.fullName}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                {driver.status}
              </span>
            </div>

            {/* Carrier Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Carrier Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Company Name</label>
                  <p className="text-white">{driver.carrierInfo?.companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">DBA</label>
                  <p className="text-white">{driver.carrierInfo?.dba || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">MC Number</label>
                  <p className="text-white">{driver.carrierInfo?.mcNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">DOT Number</label>
                  <p className="text-white">{driver.carrierInfo?.dotNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-white">
                    {driver.carrierInfo?.address?.street}, {driver.carrierInfo?.address?.city}, {driver.carrierInfo?.address?.state} {driver.carrierInfo?.address?.zipCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{driver.carrierInfo?.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{driver.carrierInfo?.email}</p>
                </div>
              </div>
            </div>

            {/* Owner/Driver Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Owner/Driver Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <p className="text-white">{driver.ownerDriverInfo?.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Personal Number</label>
                  <p className="text-white">{driver.ownerDriverInfo?.personalNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{driver.ownerDriverInfo?.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{driver.ownerDriverInfo?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Date of Birth</label>
                  <p className="text-white">{driver.ownerDriverInfo?.dateOfBirth ? formatDate(driver.ownerDriverInfo.dateOfBirth) : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CDL Number</label>
                  <p className="text-white">{driver.ownerDriverInfo?.cdlNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CDL Expiry</label>
                  <p className="text-white">{driver.ownerDriverInfo?.cdlExpiry ? formatDate(driver.ownerDriverInfo.cdlExpiry) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Truck & Equipment Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Truck & Equipment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Truck Type</label>
                  <p className="text-white">{driver.truckEquipmentInfo?.truckType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Weight Capacity</label>
                  <p className="text-white">{driver.truckEquipmentInfo?.weightCapacity} lbs</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Dimensions</label>
                  <p className="text-white">
                    {driver.truckEquipmentInfo?.size?.length}L x {driver.truckEquipmentInfo?.size?.width}W x {driver.truckEquipmentInfo?.size?.height}H ft
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">License Plate</label>
                  <p className="text-white">{driver.truckEquipmentInfo?.licensePlate} ({driver.truckEquipmentInfo?.licenseState})</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">VIN</label>
                  <p className="text-white">{driver.truckEquipmentInfo?.vin}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Year/Make/Model</label>
                  <p className="text-white">{driver.truckEquipmentInfo?.year} {driver.truckEquipmentInfo?.make} {driver.truckEquipmentInfo?.model}</p>
                </div>
              </div>
            </div>

            {/* Payment/Billing Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Payment/Billing Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Dispatch Fee</label>
                  <p className="text-white">{driver.paymentBillingInfo?.dispatchFee}%</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Payment Terms</label>
                  <p className="text-white">{driver.paymentBillingInfo?.paymentTerms}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Preferred Payment Method</label>
                  <p className="text-white">{driver.paymentBillingInfo?.preferredPaymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Bank Name</label>
                  <p className="text-white">{driver.paymentBillingInfo?.bankInfo?.bankName || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Preferred Routes</label>
                  <p className="text-white">{driver.preferences?.preferredRoutes?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Load Type Preferences</label>
                  <p className="text-white">{driver.preferences?.loadTypePreferences?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Minimum Rate Per Mile</label>
                  <p className="text-white">${driver.preferences?.minimumRatePerMile || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Max Miles Per Week</label>
                  <p className="text-white">{driver.preferences?.maxMilesPerWeek || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">Home Time</label>
                  <p className="text-white">{driver.preferences?.homeTime || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">Special Requirements</label>
                  <p className="text-white">{driver.preferences?.specialRequirements || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Compliance Documents</h4>
              <div className="space-y-3">
                {[
                  { key: 'mcAuthority', label: 'Copy of MC Authority' },
                  { key: 'insuranceCertificate', label: 'Copy of Insurance Certificate' },
                  { key: 'w9Form', label: 'Copy of W-9 Form' },
                  { key: 'noa', label: 'Copy of NOA (Notice of Assignment)' },
                  { key: 'dispatchServiceAgreement', label: 'Signed Dispatch Service Agreement' },
                  { key: 'cdlCopy', label: 'Copy of CDL' },
                  { key: 'medicalCard', label: 'Medical Card' },
                  { key: 'drugTestResults', label: 'Drug Test Results' }
                ].map(doc => {
                  const hasDocument = driver.complianceDocuments?.[doc.key];
                  const documentUrl = driver.documents?.[`${doc.key}Url`];
                  
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${hasDocument && documentUrl ? 'bg-green-500' : 'bg-red-600'}`}></div>
                        <span className="text-gray-300">{doc.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasDocument && documentUrl ? (
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${documentUrl}`, '_blank')}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-500 rounded-lg transition-colors"
                            title="View Document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">No document</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Registration Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Registration Date</label>
                  <p className="text-white">{formatDate(driver.registrationDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Updated</label>
                  <p className="text-white">{formatDate(driver.lastUpdated)}</p>
                </div>
                {driver.approvedBy && (
                  <div>
                    <label className="text-sm text-gray-400">Approved By</label>
                    <p className="text-white">{driver.approvedBy?.name}</p>
                  </div>
                )}
                {driver.approvedAt && (
                  <div>
                    <label className="text-sm text-gray-400">Approved At</label>
                    <p className="text-white">{formatDate(driver.approvedAt)}</p>
                  </div>
                )}
              </div>
              {driver.notes && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400">Notes</label>
                  <p className="text-white">{driver.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 cursor-pointer py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailModal;
