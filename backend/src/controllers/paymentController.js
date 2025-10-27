const { getTenantPayments, getDashboardStats } = require('../services/paymentService');


exports.listPayments = async(req, res) => {
    try {
        const payments = await getTenantPayments(req.user.tenantId, req.query);
        res.json({ payments });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Error fetching payments' });
    }
};


exports.dashboard = async(req, res) => {
    try {
        const stats = await getDashboardStats(req.user.tenantId);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};