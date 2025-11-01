const Payment = require('../models/payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


async function getTenantPayments(tenantId, { page = 1, limit = 20 } = {}) {
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    const query = { tenant: tenantId };

    const [totalItems, payments] = await Promise.all([
        Payment.countDocuments(query),
        Payment.find(query)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
    ]);

    // 🔄 Check Stripe for recent payment statuses
    for (const payment of payments) {
        try {
            const session = await stripe.checkout.sessions.retrieve(payment.stripePaymentId);
            if (session.payment_status && session.payment_status !== payment.status) {
                payment.status = session.payment_status;
                await payment.save();
            }
        } catch (err) {
            console.log(`⚠️ Could not refresh payment ${payment.stripePaymentId}:`, err.message);
        }
    }

    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

    return {
        payments,
        pagination: {
            currentPage,
            pageSize,
            totalItems,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
        }
    };
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