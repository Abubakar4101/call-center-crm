const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String },
    role: { type: String },
    profilePicture: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema);