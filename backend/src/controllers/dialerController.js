const dialerService = require("../services/dialerService");
const Staff = require("../models/Staff");

exports.start = async (req, res) => {
  try {
    const { filename } = req.body;
    const result = await dialerService.startDialing(filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stop = (req, res) => res.json(dialerService.stopDialing());
exports.next = (req, res) => res.json(dialerService.nextCall());
exports.prev = (req, res) => res.json(dialerService.prevCall());
exports.loadContacts = async (req, res) => {
  try {
    const contacts = await dialerService.loadDialerContacts(req.params.id);
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.incrementCallsMade = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const updated = await Staff.findOneAndUpdate(
      { _id: staffId, tenant: req.user.tenantId },
      { $inc: { callsMade: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json({ success: true, callsMade: updated.callsMade });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.incrementCallsReceived = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const updated = await Staff.findOneAndUpdate(
      { _id: staffId, tenant: req.user.tenantId },
      { $inc: { callsReceived: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json({ success: true, callsReceived: updated.callsReceived });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
