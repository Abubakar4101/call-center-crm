// middleware/checkPermission.js
module.exports = function (requiredPermission) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        // Tenants/admins have access to all modules
        if (req.user.role !== 'staff') {
            return next();
        }

        const permissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

        // If requiredPermission is an array, check if user has ANY of them
        if (Array.isArray(requiredPermission)) {
            const hasPermission = requiredPermission.some(perm => permissions.includes(perm));
            if (!hasPermission) {
                return res.status(403).json({ message: "You do not have permission to perform this action" });
            }
        } else {
            // Single permission check
            if (!permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: "You do not have permission to perform this action" });
            }
        }

        next();
    };
};