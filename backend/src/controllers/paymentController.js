const { getTenantPayments, getDashboardStats, deletePayment } = require('../services/paymentService');


exports.listPayments = async (req, res) => {
    try {
        const { payments, pagination } = await getTenantPayments(req.user.tenantId, req.query);
        res.json({ success: true, payments, pagination });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};


exports.dashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats(req.user.tenantId);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const deleted = await deletePayment(req.user.tenantId, req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error deleting payment' });
    }
};