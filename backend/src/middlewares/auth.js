const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");
const Staff = require("../models/Staff");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let staff;
    if (decoded.role === "staff") {
      staff = await Staff.findById(decoded.userId);
      if (!staff) return res.status(404).json({ message: "Staff not found" });
    }

    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      permissions: decoded.role === "staff" ? staff.permissions || [] : undefined,
    };
    const tenant = await Tenant.findById(decoded.tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid token" });
  }
};
