const jwt = require("jsonwebtoken");
const Tenant = require("../models/tenant");
const Staff = require("../models/staff");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let staff;
    let user;

    if (decoded.role === "staff") {
      staff = await Staff.findById(decoded.userId);
      if (!staff) return res.status(404).json({ message: "Staff not found" });
      user = staff;
    } else {
      // For tenant/admin users
      const User = require("../models/user");
      user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      tenant: decoded.tenantId,
      role: decoded.role,
      name: user.name,
      email: user.email,
      permissions: decoded.role === "staff" ? staff?.permissions || [] : undefined,
    };
    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid token" });
  }
};
