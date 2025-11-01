const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const User = require("../models/user");
const Staff = require("../models/staff");

exports.getProfile = async(req, res) => {
    try {
        if (req.user.role === 'staff') {
            const staff = await Staff.findById(req.user.userId).select('-passwordHash');
            if (!staff) return res.status(404).json({ error: 'User not found' });
            return res.json({
                _id: staff._id,
                name: staff.name,
                email: staff.email,
                role: 'staff',
                tenant: staff.tenant,
                profilePicture: staff.profilePicture || null,
                permissions: staff.permissions || []
            });
        }

        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Tenant/admin has all permissions on frontend
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: 'admin',
            tenant: user.tenant,
            profilePicture: user.profilePicture || null,
            permissions: ['payment','staff','files','dialer','scraper']
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async(req, res) => {
    try {
        const { name, email } = req.body;
        if (req.user.role === 'staff') {
            const staff = await Staff.findByIdAndUpdate(
                req.user.userId,
                { name, email },
                { new: true, runValidators: true }
            ).select('-passwordHash');
            return res.json({ message: 'Profile updated', user: staff });
        }
        const user = await User.findByIdAndUpdate(
            req.user.userId, { name, email }, { new: true, runValidators: true }
        ).select('-passwordHash');
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ NEW: Upload profile picture
exports.uploadProfilePicture = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const uploadDir = path.join(__dirname, "../../assets/profile-pics");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const newFileName = `${req.user.userId}-${dayjs().format("YYYYMMDDHHmmss")}${path.extname(req.file.originalname)}`;
        const newPath = path.join(uploadDir, newFileName);

        fs.renameSync(req.file.path, newPath);

        const profilePicUrl = `/assets/profile-pics/${newFileName}`;
        if (req.user.role === 'staff') {
            const staff = await Staff.findByIdAndUpdate(
                req.user.userId,
                { profilePicture: profilePicUrl },
                { new: true }
            ).select('-passwordHash');
            return res.json({ message: 'Profile picture updated', user: staff });
        }
        const user = await User.findByIdAndUpdate(
            req.user.userId, { profilePicture: profilePicUrl }, { new: true }
        ).select('-passwordHash');
        res.json({ message: 'Profile picture updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};