const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    
    // Carrier Information
    carrierInfo: {
        companyName: { type: String, required: true },
        dba: { type: String, default: '' },
        mcNumber: { type: String, required: true },
        dotNumber: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, default: 'USA' }
        },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },

    // Owner/Driver Information
    ownerDriverInfo: {
        fullName: { type: String, required: true },
        personalNumber: { type: String, default: '' },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        dateOfBirth: { type: Date },
        ssn: { type: String, default: '' },
        cdlNumber: { type: String, required: true },
        cdlExpiry: { type: Date, required: true }
    },

    // Truck & Equipment Information
    truckEquipmentInfo: {
        truckType: { 
            type: String, 
            required: true,
            enum: ['Dry Van', 'Refrigerated', 'Flatbed', 'Tanker', 'Container', 'Car Carrier', 'Other']
        },
        weightCapacity: { type: Number, required: true }, // in pounds
        size: {
            length: { type: Number, required: true }, // in feet
            width: { type: Number, required: true }, // in feet
            height: { type: Number, required: true } // in feet
        },
        licensePlate: { type: String, required: true },
        licenseState: { type: String, required: true },
        vin: { type: String, required: true },
        year: { type: Number, required: true },
        make: { type: String, required: true },
        model: { type: String, required: true }
    },

    // Payment/Billing Information
    paymentBillingInfo: {
        dispatchFee: { type: Number, required: true, min: 0, max: 100 }, // percentage
        paymentTerms: { 
            type: String, 
            required: true,
            enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Per Load']
        },
        preferredPaymentMethod: { 
            type: String, 
            required: true,
            enum: ['Direct Deposit', 'Check', 'ACH Transfer', 'Wire Transfer']
        },
        bankInfo: {
            bankName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            routingNumber: { type: String, default: '' }
        }
    },

    // Preferences
    preferences: {
        preferredRoutes: [{
            type: String,
            enum: ['Local', 'Regional', 'OTR', 'Dedicated', 'Team Driving']
        }],
        loadTypePreferences: [{
            type: String,
            enum: ['Dry Van', 'Refrigerated', 'Flatbed', 'Tanker', 'Hazmat', 'Auto Transport', 'Heavy Haul', 'Intermodal']
        }],
        minimumRatePerMile: { type: Number, default: 0 },
        maxMilesPerWeek: { type: Number, default: 0 },
        homeTime: { type: String, default: '' },
        specialRequirements: { type: String, default: '' }
    },

    // Compliance Documents Checklist
    complianceDocuments: {
        mcAuthority: { type: Boolean, default: false },
        insuranceCertificate: { type: Boolean, default: false },
        w9Form: { type: Boolean, default: false },
        noa: { type: Boolean, default: false }, // Notice of Assignment
        dispatchServiceAgreement: { type: Boolean, default: false },
        cdlCopy: { type: Boolean, default: false },
        medicalCard: { type: Boolean, default: false },
        drugTestResults: { type: Boolean, default: false }
    },

    // Document URLs (for file storage)
    documents: {
        mcAuthorityUrl: { type: String, default: '' },
        insuranceCertificateUrl: { type: String, default: '' },
        w9FormUrl: { type: String, default: '' },
        noaUrl: { type: String, default: '' },
        dispatchServiceAgreementUrl: { type: String, default: '' },
        cdlCopyUrl: { type: String, default: '' },
        medicalCardUrl: { type: String, default: '' },
        drugTestResultsUrl: { type: String, default: '' }
    },

    // Loader/Carrier specific fields
    loaderInfo: {
        agentName: { type: String, default: '' },
        percentage: { type: Number, default: 0, min: 0, max: 100 },
        totalPayment: { type: Number, default: 0, min: 0 },
        documents: { 
            type: String, 
            enum: ['Received', 'Missing', 'No Docs'], 
            default: 'No Docs' 
        },
        carrierPacket: { type: String, default: '' },
        reviews: { 
            type: String, 
            enum: ['Average Response', 'Booked for this week', 'Good Response', 'Not Responsing', 'Truck out of Order', 'Inactive MC'], 
            default: 'Average Response' 
        },
        paymentLink: { type: String, default: '' }
    },

    // Status and tracking
    status: { 
        type: String, 
        enum: ['Active', 'N/A', 'Pending', 'Rejected'], 
        default: 'Pending' 
    },
    registrationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    hasLoader: { type: Boolean, default: false},
    
    // Created by tracking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, { timestamps: true });

// Index for better query performance
driverSchema.index({ tenant: 1, status: 1 });
driverSchema.index({ 'carrierInfo.mcNumber': 1 });
driverSchema.index({ 'carrierInfo.dotNumber': 1 });
driverSchema.index({ 'ownerDriverInfo.cdlNumber': 1 });

module.exports = mongoose.model('Driver', driverSchema);
