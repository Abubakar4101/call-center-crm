const bcrypt = require('bcrypt');
const Staff = require('../models/Staff');

async function createStaff(tenantId, data, createdBy) {
    if (!data.password) throw new Error('Password is required');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const allowedPermissions = ['payment','staff','files','dialer','scraper'];
    const permissions = Array.isArray(data.permissions)
        ? data.permissions.filter(p => allowedPermissions.includes(p))
        : [];
    return Staff.create({
        name: data.name,
        email: data.email,
        role: data.role || 'agent',
        phone: data.phone,
        passwordHash,
        tenant: tenantId,
        createdBy,
        permissions
    });
}

async function getStaffList(tenantId) {
    return Staff.find({ tenant: tenantId }).sort({ createdAt: -1 });
}

async function updateStaff(tenantId, staffId, data) {
    const update = { ...data };
    if (data.password) {
        update.passwordHash = await bcrypt.hash(data.password, 10);
        delete update.password;
    }
    if (Array.isArray(data.permissions)) {
        const allowed = ['payment','staff','files','dialer','scraper'];
        update.permissions = data.permissions.filter(p => allowed.includes(p));
    }
    return Staff.findOneAndUpdate({ _id: staffId, tenant: tenantId }, update, { new: true });
}

async function deleteStaff(tenantId, staffId) {
    return Staff.findOneAndDelete({ _id: staffId, tenant: tenantId });
}

module.exports = { createStaff, getStaffList, updateStaff, deleteStaff };