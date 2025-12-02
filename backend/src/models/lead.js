const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    // Contact information
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },

    // Meeting details
    meetingDate: { type: Date, required: true },

    // User who scheduled the meeting
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledByName: { type: String, required: true },
    scheduledByEmail: { type: String, required: true },

    // Status tracking
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },

    // Reminder tracking
    reminderSent: { type: Boolean, default: false },

    // Multi-tenancy
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },

    // Additional notes
    notes: { type: String, default: '' },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
LeadSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Lead', LeadSchema);
