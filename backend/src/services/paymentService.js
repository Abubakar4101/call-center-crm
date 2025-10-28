const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


async function getTenantPayments(tenantId, { page = 1, limit = 20 }) {
  
    const payments = await Payment.find({ tenant: tenantId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
  
    // 🔄 Check Stripe for recent payment statuses
    for (const payment of payments) {
      try {
        // Fetch session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(payment.stripePaymentId);
  
        if (session.payment_status && session.payment_status !== payment.status) {
          // Update local DB if status changed
          payment.status = session.payment_status;
          await payment.save();
        }
      } catch (err) {
        console.log(`⚠️ Could not refresh payment ${payment.stripePaymentId}:`, err.message);
      }
    }
  
    return payments;
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