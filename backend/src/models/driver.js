const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },

    // Carrier Information
    carrierInfo: {
        companyName: { type: String, default: '' },
        dba: { type: String, default: '' },
        mcNumber: { type: String, default: '' },
        dotNumber: { type: String, default: '' },
        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            zipCode: { type: String, default: '' },
            country: { type: String, default: 'USA' }
        },
        phone: { type: String, default: '' },
        email: { type: String, default: '' }
    },

    // Owner/Driver Information
    ownerDriverInfo: {
        driverName: { type: String, default: '' },
        driverPhone: { type: String, default: '' },
        ownerName: { type: String, default: '' },
        ownerPhone: { type: String, default: '' }
    },

    // Truck & Equipment Information
    truckEquipmentInfo: {
        truckType: {
            type: String,
            default: 'Dry Van',
            enum: ['Dry Van', 'Refrigerated', 'Flatbed', 'Tanker', 'Container', 'Car Carrier', 'Other']
        },
        weightCapacity: { type: Number, default: 0 }, // in pounds
        size: {
            length: { type: Number, default: 0 }, // in feet
            width: { type: Number, default: 0 }, // in feet
            height: { type: Number, default: 0 } // in feet
        },
        licensePlate: { type: String, default: '' },
        licenseState: { type: String, default: '' },
        vin: { type: String, default: '' },
        year: { type: Number, default: 0 },
        truckNumber: { type: String, default: '' },
        model: { type: String, default: '' }
    },

    // Payment/Billing Information
    paymentBillingInfo: {
        dispatchFee: { type: Number, default: 0, min: 0, max: 100 }, // percentage
        paymentTerms: {
            type: String,
            default: 'Weekly',
            enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Per Load']
        },
        preferredPaymentMethod: {
            type: String,
            default: 'Zelle',
            enum: ['Zelle', 'Stripe', 'Cash App']
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
        cdlCopy: { type: Boolean, default: false }
    },

    // Document URLs (for file storage)
    documents: {
        mcAuthorityUrl: { type: String, default: '' },
        insuranceCertificateUrl: { type: String, default: '' },
        w9FormUrl: { type: String, default: '' },
        noaUrl: { type: String, default: '' },
        cdlCopyUrl: { type: String, default: '' }
    },

    // Loader/Carrier specific fields
    loaderInfo: {
        agentName: { type: String, default: '' },
        percentage: { type: Number, default: 0, min: 0, max: 100 },

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
        enum: ['Active', 'Approved', 'Inactive', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    registrationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    hasLoader: { type: Boolean, default: false },
    gross: { type: Number, default: 0 }, // For Active tag logic (gross > 300)

    // Load Details (Added for tracking load info)
    loadDetails: {
        from: { type: String, default: '' },
        to: { type: String, default: '' },
        dhMiles: { type: String, default: '' },
        lmMiles: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        puDate: { type: Date },
        delType: { type: String, default: '' },
        loadDetails: { type: String, default: '' }
    },

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
