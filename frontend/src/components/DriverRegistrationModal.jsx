import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const DriverRegistrationModal = ({ isOpen, onClose, onSuccess, driverToEdit = null }) => {
  const [formData, setFormData] = useState({
    // Carrier Information
    carrierInfo: {
      companyName: '',
      dba: '',
      mcNumber: '',
      dotNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      phone: '',
      email: ''
    },
    // Owner/Driver Information
    ownerDriverInfo: {
      fullName: '',
      personalNumber: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      ssn: '',
      cdlNumber: '',
      cdlExpiry: ''
    },
    // Truck & Equipment Information
    truckEquipmentInfo: {
      truckType: 'Dry Van',
      weightCapacity: '',
      size: {
        length: '',
        width: '',
        height: ''
      },
      licensePlate: '',
      licenseState: '',
      vin: '',
      year: '',
      make: '',
      model: ''
    },
    // Payment/Billing Information
    paymentBillingInfo: {
      dispatchFee: '',
      paymentTerms: 'Weekly',
      preferredPaymentMethod: 'Direct Deposit',
      bankInfo: {
        bankName: '',
        accountNumber: '',
        routingNumber: ''
      }
    },
    // Preferences
    preferences: {
      preferredRoutes: [],
      loadTypePreferences: [],
      minimumRatePerMile: '',
      maxMilesPerWeek: '',
      homeTime: '',
      specialRequirements: ''
    },
    // Compliance Documents
    complianceDocuments: {
      mcAuthority: false,
      insuranceCertificate: false,
      w9Form: false,
      noa: false,
      dispatchServiceAgreement: false,
      cdlCopy: false,
      medicalCard: false,
      drugTestResults: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingDocuments, setUploadingDocuments] = useState({});
  const { success, error } = useToast();

  const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Populate form data when editing
  React.useEffect(() => {
    if (driverToEdit && isOpen) {
      setFormData({
        carrierInfo: {
          companyName: driverToEdit.carrierInfo?.companyName || '',
          dba: driverToEdit.carrierInfo?.dba || '',
          mcNumber: driverToEdit.carrierInfo?.mcNumber || '',
          dotNumber: driverToEdit.carrierInfo?.dotNumber || '',
          address: {
            street: driverToEdit.carrierInfo?.address?.street || '',
            city: driverToEdit.carrierInfo?.address?.city || '',
            state: driverToEdit.carrierInfo?.address?.state || '',
            zipCode: driverToEdit.carrierInfo?.address?.zipCode || '',
            country: driverToEdit.carrierInfo?.address?.country || 'USA'
          },
          phone: driverToEdit.carrierInfo?.phone || '',
          email: driverToEdit.carrierInfo?.email || ''
        },
        ownerDriverInfo: {
          fullName: driverToEdit.ownerDriverInfo?.fullName || '',
          personalNumber: driverToEdit.ownerDriverInfo?.personalNumber || '',
          phone: driverToEdit.ownerDriverInfo?.phone || '',
          email: driverToEdit.ownerDriverInfo?.email || '',
          dateOfBirth: driverToEdit.ownerDriverInfo?.dateOfBirth || '',
          ssn: driverToEdit.ownerDriverInfo?.ssn || '',
          cdlNumber: driverToEdit.ownerDriverInfo?.cdlNumber || '',
          cdlExpiry: driverToEdit.ownerDriverInfo?.cdlExpiry || ''
        },
        truckEquipmentInfo: {
          truckType: driverToEdit.truckEquipmentInfo?.truckType || 'Dry Van',
          weightCapacity: driverToEdit.truckEquipmentInfo?.weightCapacity || '',
          size: {
            length: driverToEdit.truckEquipmentInfo?.size?.length || '',
            width: driverToEdit.truckEquipmentInfo?.size?.width || '',
            height: driverToEdit.truckEquipmentInfo?.size?.height || ''
          },
          licensePlate: driverToEdit.truckEquipmentInfo?.licensePlate || '',
          licenseState: driverToEdit.truckEquipmentInfo?.licenseState || '',
          vin: driverToEdit.truckEquipmentInfo?.vin || '',
          year: driverToEdit.truckEquipmentInfo?.year || '',
          make: driverToEdit.truckEquipmentInfo?.make || '',
          model: driverToEdit.truckEquipmentInfo?.model || ''
        },
        paymentBillingInfo: {
          dispatchFee: driverToEdit.paymentBillingInfo?.dispatchFee || '',
          paymentTerms: driverToEdit.paymentBillingInfo?.paymentTerms || 'Weekly',
          preferredPaymentMethod: driverToEdit.paymentBillingInfo?.preferredPaymentMethod || 'Direct Deposit',
          bankInfo: {
            bankName: driverToEdit.paymentBillingInfo?.bankInfo?.bankName || '',
            accountNumber: driverToEdit.paymentBillingInfo?.bankInfo?.accountNumber || '',
            routingNumber: driverToEdit.paymentBillingInfo?.bankInfo?.routingNumber || ''
          }
        },
        preferences: {
          preferredRoutes: driverToEdit.preferences?.preferredRoutes || [],
          loadTypePreferences: driverToEdit.preferences?.loadTypePreferences || [],
          minimumRatePerMile: driverToEdit.preferences?.minimumRatePerMile || '',
          maxMilesPerWeek: driverToEdit.preferences?.maxMilesPerWeek || '',
          homeTime: driverToEdit.preferences?.homeTime || '',
          specialRequirements: driverToEdit.preferences?.specialRequirements || ''
        },
        complianceDocuments: {
          mcAuthority: driverToEdit.complianceDocuments?.mcAuthority || false,
          insuranceCertificate: driverToEdit.complianceDocuments?.insuranceCertificate || false,
          w9Form: driverToEdit.complianceDocuments?.w9Form || false,
          noa: driverToEdit.complianceDocuments?.noa || false,
          dispatchServiceAgreement: driverToEdit.complianceDocuments?.dispatchServiceAgreement || false,
          cdlCopy: driverToEdit.complianceDocuments?.cdlCopy || false,
          medicalCard: driverToEdit.complianceDocuments?.medicalCard || false,
          drugTestResults: driverToEdit.complianceDocuments?.drugTestResults || false
        }
      });
    } else if (!driverToEdit && isOpen) {
      // Reset form for new driver
      setFormData({
        carrierInfo: { companyName: '', dba: '', mcNumber: '', dotNumber: '', address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }, phone: '', email: '' },
        ownerDriverInfo: { fullName: '', personalNumber: '', phone: '', email: '', dateOfBirth: '', ssn: '', cdlNumber: '', cdlExpiry: '' },
        truckEquipmentInfo: { truckType: 'Dry Van', weightCapacity: '', size: { length: '', width: '', height: '' }, licensePlate: '', licenseState: '', vin: '', year: '', make: '', model: '' },
        paymentBillingInfo: { dispatchFee: '', paymentTerms: 'Weekly', preferredPaymentMethod: 'Direct Deposit', bankInfo: { bankName: '', accountNumber: '', routingNumber: '' } },
        preferences: { preferredRoutes: [], loadTypePreferences: [], minimumRatePerMile: '', maxMilesPerWeek: '', homeTime: '', specialRequirements: '' },
        complianceDocuments: { mcAuthority: false, insuranceCertificate: false, w9Form: false, noa: false, dispatchServiceAgreement: false, cdlCopy: false, medicalCard: false, drugTestResults: false }
      });
    }
  }, [driverToEdit, isOpen]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value
        }
      }
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      complianceDocuments: {
        ...prev.complianceDocuments,
        [field]: checked
      }
    }));
  };

  const handleArrayChange = (section, field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
          ? [...prev[section][field], value]
          : prev[section][field].filter(item => item !== value)
      }
    }));
  };

  const handleDocumentUpload = async (documentType, file) => {
    if (!driverToEdit) {
      error('Please save the driver first before uploading documents');
      return;
    }

    setUploadingDocuments(prev => ({ ...prev, [documentType]: true }));

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch(`${SERVER_URL}/drivers/${driverToEdit._id}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        success(`${documentType} uploaded successfully!`);
        // Update the form data with the uploaded document
        setFormData(prev => ({
          ...prev,
          complianceDocuments: {
            ...prev.complianceDocuments,
            [documentType]: true
          }
        }));
      } else {
        error(data.error || data.message || 'Failed to upload document');
      }
    } catch (err) {
      error('Failed to upload document');
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!driverToEdit;
      const url = isEdit ? `${SERVER_URL}/drivers/${driverToEdit._id}` : `${SERVER_URL}/drivers`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        success(isEdit ? 'Driver updated successfully!' : 'Driver registered successfully!');
        onSuccess();
        onClose();
        setFormData({
          carrierInfo: { companyName: '', dba: '', mcNumber: '', dotNumber: '', address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }, phone: '', email: '' },
          ownerDriverInfo: { fullName: '', personalNumber: '', phone: '', email: '', dateOfBirth: '', ssn: '', cdlNumber: '', cdlExpiry: '' },
          truckEquipmentInfo: { truckType: 'Dry Van', weightCapacity: '', size: { length: '', width: '', height: '' }, licensePlate: '', licenseState: '', vin: '', year: '', make: '', model: '' },
          paymentBillingInfo: { dispatchFee: '', paymentTerms: 'Weekly', preferredPaymentMethod: 'Direct Deposit', bankInfo: { bankName: '', accountNumber: '', routingNumber: '' } },
          preferences: { preferredRoutes: [], loadTypePreferences: [], minimumRatePerMile: '', maxMilesPerWeek: '', homeTime: '', specialRequirements: '' },
          complianceDocuments: { mcAuthority: false, insuranceCertificate: false, w9Form: false, noa: false, dispatchServiceAgreement: false, cdlCopy: false, medicalCard: false, drugTestResults: false }
        });
        setCurrentStep(1);
      } else {
        error(data.error || data.message || (isEdit ? 'Failed to update driver' : 'Failed to register driver'));
      }
    } catch (err) {
      error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep(prev => Math.min(prev + 1, 7))
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Validation functions for each step
  const isStep1Valid = () => {
    const { carrierInfo } = formData;
    return (
      carrierInfo.companyName.trim() !== '' &&
      carrierInfo.mcNumber.trim() !== '' &&
      carrierInfo.dotNumber.trim() !== '' &&
      carrierInfo.address.street.trim() !== '' &&
      carrierInfo.address.city.trim() !== '' &&
      carrierInfo.address.state.trim() !== '' &&
      carrierInfo.address.zipCode.trim() !== '' &&
      carrierInfo.phone.trim() !== '' &&
      carrierInfo.email.trim() !== ''
    );
  };

  const isStep2Valid = () => {
    const { ownerDriverInfo } = formData;
    return (
      ownerDriverInfo.fullName.trim() !== '' &&
      ownerDriverInfo.phone.trim() !== '' &&
      ownerDriverInfo.email.trim() !== '' &&
      ownerDriverInfo.cdlNumber.trim() !== '' &&
      ownerDriverInfo.cdlExpiry.trim() !== ''
    );
  };

  const isStep3Valid = () => {
    const { truckEquipmentInfo } = formData;
    return (
      truckEquipmentInfo.truckType.trim() !== '' &&
      truckEquipmentInfo.weightCapacity.toString().trim() !== '' &&
      truckEquipmentInfo.size.length.toString().trim() !== '' &&
      truckEquipmentInfo.size.width.toString().trim() !== '' &&
      truckEquipmentInfo.size.height.toString().trim() !== '' &&
      truckEquipmentInfo.licensePlate.trim() !== '' &&
      truckEquipmentInfo.licenseState.trim() !== '' &&
      truckEquipmentInfo.vin.trim() !== '' &&
      truckEquipmentInfo.year.toString().trim() !== '' &&
      truckEquipmentInfo.make.trim() !== '' &&
      truckEquipmentInfo.model.trim() !== ''
    );
  };

  const isStep4Valid = () => {
    const { paymentBillingInfo } = formData;
    return (
      paymentBillingInfo.dispatchFee.toString().trim() !== '' &&
      paymentBillingInfo.paymentTerms.trim() !== '' &&
      paymentBillingInfo.preferredPaymentMethod.trim() !== ''
    );
  };

  const isStep5Valid = () => {
    // Step 5 (Preferences) - validate that if minimumRatePerMile is provided, it's a valid number
    const { preferences } = formData;
    if (preferences.minimumRatePerMile && (isNaN(parseFloat(preferences.minimumRatePerMile)) || parseFloat(preferences.minimumRatePerMile) < 0)) {
      return false;
    }
    if (preferences.maxMilesPerWeek && (isNaN(parseInt(preferences.maxMilesPerWeek)) || parseInt(preferences.maxMilesPerWeek) < 0)) {
      return false;
    }
    return true;
  };

  const isStep6Valid = () => {
    // Step 6 (Document Uploads) - optional step, always valid
    return true;
  };

  const isStep7Valid = () => {
    // Step 7 (Compliance Documents) - at least one document should be checked
    const { complianceDocuments } = formData;
    return Object.values(complianceDocuments).some(checked => checked === true);
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      case 5: return isStep5Valid();
      case 6: return isStep6Valid();
      case 7: return isStep7Valid();
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{driverToEdit ? 'Edit Driver' : 'Driver Registration'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep} of 7</span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / 7) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Carrier Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">1. Carrier Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.carrierInfo.companyName}
                      onChange={(e) => handleInputChange('carrierInfo', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">DBA (if any)</label>
                    <input
                      type="text"
                      value={formData.carrierInfo.dba}
                      onChange={(e) => handleInputChange('carrierInfo', 'dba', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">MC Number *</label>
                    <input
                      type="text"
                      value={formData.carrierInfo.mcNumber}
                      onChange={(e) => handleInputChange('carrierInfo', 'mcNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">DOT Number *</label>
                    <input
                      type="text"
                      value={formData.carrierInfo.dotNumber}
                      onChange={(e) => handleInputChange('carrierInfo', 'dotNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.carrierInfo.address.street}
                      onChange={(e) => handleNestedInputChange('carrierInfo', 'address', 'street', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.carrierInfo.address.city}
                      onChange={(e) => handleNestedInputChange('carrierInfo', 'address', 'city', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.carrierInfo.address.state}
                      onChange={(e) => handleNestedInputChange('carrierInfo', 'address', 'state', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.carrierInfo.address.zipCode}
                      onChange={(e) => handleNestedInputChange('carrierInfo', 'address', 'zipCode', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.carrierInfo.phone}
                      onChange={(e) => handleInputChange('carrierInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.carrierInfo.email}
                      onChange={(e) => handleInputChange('carrierInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Owner/Driver Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">2. Owner/Driver Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.ownerDriverInfo.fullName}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'fullName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Personal Number</label>
                    <input
                      type="text"
                      value={formData.ownerDriverInfo.personalNumber}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'personalNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.ownerDriverInfo.phone}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.ownerDriverInfo.email}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.ownerDriverInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SSN</label>
                    <input
                      type="text"
                      value={formData.ownerDriverInfo.ssn}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'ssn', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CDL Number *</label>
                    <input
                      type="text"
                      value={formData.ownerDriverInfo.cdlNumber}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'cdlNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CDL Expiry *</label>
                    <input
                      type="date"
                      value={formData.ownerDriverInfo.cdlExpiry}
                      onChange={(e) => handleInputChange('ownerDriverInfo', 'cdlExpiry', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Truck & Equipment Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">3. Truck & Equipment Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Truck Type *</label>
                    <select
                      value={formData.truckEquipmentInfo.truckType}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'truckType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Dry Van">Dry Van</option>
                      <option value="Refrigerated">Refrigerated</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Container">Container</option>
                      <option value="Car Carrier">Car Carrier</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Weight Capacity (lbs) *</label>
                    <input
                      type="number"
                      value={formData.truckEquipmentInfo.weightCapacity}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'weightCapacity', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Truck Dimensions (feet) *</label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Length"
                      value={formData.truckEquipmentInfo.size.length}
                      onChange={(e) => handleNestedInputChange('truckEquipmentInfo', 'size', 'length', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Width"
                      value={formData.truckEquipmentInfo.size.width}
                      onChange={(e) => handleNestedInputChange('truckEquipmentInfo', 'size', 'width', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={formData.truckEquipmentInfo.size.height}
                      onChange={(e) => handleNestedInputChange('truckEquipmentInfo', 'size', 'height', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">License Plate *</label>
                    <input
                      type="text"
                      value={formData.truckEquipmentInfo.licensePlate}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'licensePlate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">License State *</label>
                    <input
                      type="text"
                      value={formData.truckEquipmentInfo.licenseState}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'licenseState', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">VIN *</label>
                    <input
                      type="text"
                      value={formData.truckEquipmentInfo.vin}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'vin', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
                    <input
                      type="number"
                      value={formData.truckEquipmentInfo.year}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'year', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Make *</label>
                    <input
                      type="text"
                      value={formData.truckEquipmentInfo.make}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'make', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model *</label>
                    <input
                      type="text"
                      value={formData.truckEquipmentInfo.model}
                      onChange={(e) => handleInputChange('truckEquipmentInfo', 'model', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment/Billing Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">4. Payment/Billing Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dispatch Fee (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.paymentBillingInfo.dispatchFee}
                      onChange={(e) => handleInputChange('paymentBillingInfo', 'dispatchFee', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Payment Terms *</label>
                    <select
                      value={formData.paymentBillingInfo.paymentTerms}
                      onChange={(e) => handleInputChange('paymentBillingInfo', 'paymentTerms', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Per Load">Per Load</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Payment Method *</label>
                    <select
                      value={formData.paymentBillingInfo.preferredPaymentMethod}
                      onChange={(e) => handleInputChange('paymentBillingInfo', 'preferredPaymentMethod', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Direct Deposit">Direct Deposit</option>
                      <option value="Check">Check</option>
                      <option value="ACH Transfer">ACH Transfer</option>
                      <option value="Wire Transfer">Wire Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bank Information</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={formData.paymentBillingInfo.bankInfo.bankName}
                      onChange={(e) => handleNestedInputChange('paymentBillingInfo', 'bankInfo', 'bankName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={formData.paymentBillingInfo.bankInfo.accountNumber}
                      onChange={(e) => handleNestedInputChange('paymentBillingInfo', 'bankInfo', 'accountNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Routing Number"
                      value={formData.paymentBillingInfo.bankInfo.routingNumber}
                      onChange={(e) => handleNestedInputChange('paymentBillingInfo', 'bankInfo', 'routingNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preferences */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">5. Preferences</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Routes</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Local', 'Regional', 'OTR', 'Dedicated', 'Team Driving'].map(route => (
                      <label key={route} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.preferredRoutes.includes(route)}
                          onChange={(e) => handleArrayChange('preferences', 'preferredRoutes', route, e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">{route}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Load Type Preferences</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Dry Van', 'Refrigerated', 'Flatbed', 'Tanker', 'Hazmat', 'Auto Transport', 'Heavy Haul', 'Intermodal'].map(loadType => (
                      <label key={loadType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.loadTypePreferences.includes(loadType)}
                          onChange={(e) => handleArrayChange('preferences', 'loadTypePreferences', loadType, e.target.checked)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">{loadType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Rate Per Mile ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preferences.minimumRatePerMile}
                      onChange={(e) => handleInputChange('preferences', 'minimumRatePerMile', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Miles Per Week</label>
                    <input
                      type="number"
                      value={formData.preferences.maxMilesPerWeek}
                      onChange={(e) => handleInputChange('preferences', 'maxMilesPerWeek', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Home Time</label>
                  <input
                    type="text"
                    value={formData.preferences.homeTime}
                    onChange={(e) => handleInputChange('preferences', 'homeTime', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                  <textarea
                    value={formData.preferences.specialRequirements}
                    onChange={(e) => handleInputChange('preferences', 'specialRequirements', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Document Uploads */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">6. Document Uploads</h3>
                <p className="text-gray-400 mb-4">Upload the required compliance documents. You can upload documents after saving the driver.</p>

                <div className="space-y-4">
                  {[
                    { key: 'mcAuthority', label: 'Copy of MC Authority', required: true },
                    { key: 'insuranceCertificate', label: 'Copy of Insurance Certificate', required: true },
                    { key: 'w9Form', label: 'Copy of W-9 Form', required: true },
                    { key: 'noa', label: 'Copy of NOA (Notice of Assignment)', required: true },
                    { key: 'dispatchServiceAgreement', label: 'Signed Dispatch Service Agreement', required: true },
                    { key: 'cdlCopy', label: 'Copy of CDL', required: true },
                    { key: 'medicalCard', label: 'Medical Card', required: true },
                    { key: 'drugTestResults', label: 'Drug Test Results', required: true }
                  ].map(doc => (
                    <div key={doc.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${formData.complianceDocuments[doc.key] ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-300">{doc.label}</span>
                        {doc.required && <span className="text-red-400 text-sm">*</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleDocumentUpload(doc.key, file);
                            }
                          }}
                          disabled={uploadingDocuments[doc.key] || !driverToEdit}
                          className="hidden"
                          id={`upload-${doc.key}`}
                        />
                        <label
                          htmlFor={`upload-${doc.key}`}
                          className={`px-3 py-1 text-sm rounded cursor-pointer ${uploadingDocuments[doc.key]
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : !driverToEdit
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {uploadingDocuments[doc.key] ? 'Uploading...' : 'Upload'}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {!driverToEdit && (
                  <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      <strong>Note:</strong> You need to save the driver first before uploading documents. Complete the registration and then edit the driver to upload documents.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Compliance Documents */}
            {currentStep === 7 && driverToEdit && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">7. Compliance Documents Checklist</h3>

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
                  ].map(doc => (
                    <label key={doc.key} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.complianceDocuments[doc.key]}
                        onChange={(e) => handleCheckboxChange(doc.key, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{doc.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 cursor-pointer bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {(
                  (!driverToEdit && currentStep < 6)
                ) || (
                    (driverToEdit && currentStep < 7)
                  ) ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isCurrentStepValid()}
                    className="px-4 cursor-pointer py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? driverToEdit
                        ? 'Updating...'
                        : 'Registering...'
                      : driverToEdit
                        ? 'Update Driver'
                        : 'Register Driver'}
                  </button>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistrationModal;
