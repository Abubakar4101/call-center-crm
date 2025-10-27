const Payment = require('../models/Payment');


async function getTenantPayments(tenantId, { page = 1, limit = 20 }) {
    return Payment.find({ tenant: tenantId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
}


async function getDashboardStats(tenantId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthPayments = await Payment.find({ tenant: tenantId, createdAt: { $gte: startOfMonth } });
    const totalThisMonth = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCount = await Payment.countDocuments({ tenant: tenantId });
    return { totalThisMonth, totalCount };
}


module.exports = { getTenantPayments, getDashboardStats };