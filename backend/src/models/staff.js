const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const staffSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['agent', 'supervisor', 'manager'], default: 'agent' },
    phone: String,
    profilePicture: { type: String, default: null },
    callsMade: { type: Number, default: 0 },
    callsReceived: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: {
        type: [String],
        default: [] // Example: ["view_payments", "create_checkout", "manage_staff"]
    }
}, { timestamps: true });

// helper to hash password before save
staffSchema.pre('save', async function(next) {
    if (this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
});

module.exports = mongoose.model('Staff', staffSchema);