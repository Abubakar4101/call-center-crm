// middleware/checkPermission.js
module.exports = function(requiredPermission) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        // Tenants/admins have access to all modules
        if (req.user.role !== 'staff') {
            return next();
        }

        const permissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: "You do not have permission to perform this action" });
        }
        next();
    };
};