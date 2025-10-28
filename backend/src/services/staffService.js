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

async function getStaffList(tenantId, filters = {}) {
    const query = { tenant: tenantId };
    
    // Add search functionality
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } },
            { role: { $regex: filters.search, $options: 'i' } }
        ];
    }
    
    // Add call metrics filtering
    if (filters.minCallsMade !== undefined) {
        query.callsMade = { $gte: parseInt(filters.minCallsMade) };
    }
    if (filters.maxCallsMade !== undefined) {
        query.callsMade = { ...query.callsMade, $lte: parseInt(filters.maxCallsMade) };
    }
    if (filters.minCallsReceived !== undefined) {
        query.callsReceived = { $gte: parseInt(filters.minCallsReceived) };
    }
    if (filters.maxCallsReceived !== undefined) {
        query.callsReceived = { ...query.callsReceived, $lte: parseInt(filters.maxCallsReceived) };
    }
    
    // Add date filtering for calls
    if (filters.callDateFrom || filters.callDateTo) {
        const dateQuery = {};
        if (filters.callDateFrom) {
            dateQuery.$gte = new Date(filters.callDateFrom);
        }
        if (filters.callDateTo) {
            dateQuery.$lte = new Date(filters.callDateTo);
        }
        query.createdAt = dateQuery;
    }
    
    return Staff.find(query).sort({ createdAt: -1 });
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