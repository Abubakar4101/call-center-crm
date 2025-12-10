const bcrypt = require('bcrypt');
const Staff = require('../models/staff');

async function createStaff(tenantId, data, createdBy) {
    if (!data.password) throw new Error('Password is required');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const allowedPermissions = ['payment', 'staff', 'files', 'dialer', 'driver', 'scraper', 'load'];
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
    if (filters.minCallsMade !== undefined && filters.minCallsMade !== '') {
        query.callsMade = { $gte: parseInt(filters.minCallsMade) };
    }
    if (filters.maxCallsMade !== undefined && filters.maxCallsMade !== '') {
        query.callsMade = { ...query.callsMade, $lte: parseInt(filters.maxCallsMade) };
    }
    if (filters.minLeads !== undefined && filters.minLeads !== '') {
        query.leadsCreated = { $gte: parseInt(filters.minLeads) };
    }
    if (filters.maxLeads !== undefined && filters.maxLeads !== '') {
        query.leadsCreated = { ...query.leadsCreated, $lte: parseInt(filters.maxLeads) };
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
        const allowed = ['payment', 'staff', 'files', 'dialer', 'driver', 'scraper', 'load'];
        update.permissions = data.permissions.filter(p => allowed.includes(p));
    }
    return Staff.findOneAndUpdate({ _id: staffId, tenant: tenantId }, update, { new: true });
}

async function deleteStaff(tenantId, staffId) {
    return Staff.findOneAndDelete({ _id: staffId, tenant: tenantId });
}

async function updateStaffAgenda(tenantId, staffId, agendaData) {
    const update = {};
    if (agendaData.dailyAgenda) {
        update.dailyAgenda = agendaData.dailyAgenda;
    }
    if (agendaData.monthlyAgenda) {
        update.monthlyAgenda = agendaData.monthlyAgenda;
    }
    return Staff.findOneAndUpdate({ _id: staffId, tenant: tenantId }, update, { new: true });
}

async function getStaffPerformance(tenantId, filters = {}) {
    const Lead = require('../models/lead');

    // Build query with same filters as getStaffList
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
    if (filters.minCallsMade !== undefined && filters.minCallsMade !== '') {
        query.callsMade = { $gte: parseInt(filters.minCallsMade) };
    }
    if (filters.maxCallsMade !== undefined && filters.maxCallsMade !== '') {
        query.callsMade = { ...query.callsMade, $lte: parseInt(filters.maxCallsMade) };
    }
    if (filters.minLeads !== undefined && filters.minLeads !== '') {
        query.leadsCreated = { $gte: parseInt(filters.minLeads) };
    }
    if (filters.maxLeads !== undefined && filters.maxLeads !== '') {
        query.leadsCreated = { ...query.leadsCreated, $lte: parseInt(filters.maxLeads) };
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

    const staff = await Staff.find(query).select('name callsMade leadsCreated dailyAgenda monthlyAgenda');

    // Get leads count for each staff member
    const staffWithLeads = await Promise.all(staff.map(async (member) => {
        const leadsCount = await Lead.countDocuments({
            tenant: tenantId,
            scheduledBy: member._id
        });

        return {
            _id: member._id,
            name: member.name,
            callsMade: member.callsMade || 0,
            leadsCreated: leadsCount,
            dailyAgenda: member.dailyAgenda || { callsGoal: 0, leadsGoal: 0 },
            monthlyAgenda: member.monthlyAgenda || { callsGoal: 0, leadsGoal: 0 }
        };
    }));

    return staffWithLeads;
}

module.exports = { createStaff, getStaffList, updateStaff, deleteStaff, updateStaffAgenda, getStaffPerformance };