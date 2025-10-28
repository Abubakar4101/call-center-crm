const staffService = require('../services/staffService');

exports.addStaff = async(req, res) => {
    try {
        console.log(req.user)
        const staff = await staffService.createStaff(req.user.tenantId, req.body, req.user.userId);
        console.log('----2')
        res.status(201).json(staff);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.listStaff = async(req, res) => {
    try {
        const staff = await staffService.getStaffList(req.user.tenantId, req.query);
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStaff = async(req, res) => {
    try {
        const updated = await staffService.updateStaff(req.user.tenantId, req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Staff not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteStaff = async(req, res) => {
    try {
        const deleted = await staffService.deleteStaff(req.user.tenantId, req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Staff not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};