const express = require("express");
const dialerController = require("../controllers/dialerController");
const auth = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

const router = express.Router();

// Permission: Dialer Module
router.post("/start", auth, checkPermission('dialer'), dialerController.start);
router.post("/stop", auth, checkPermission('dialer'), dialerController.stop);
router.post("/next", auth, checkPermission('dialer'), dialerController.next);
router.post("/prev", auth, checkPermission('dialer'), dialerController.prev);

router.get("/load/:id", auth, checkPermission('dialer'), dialerController.loadContacts);

// Call metrics
router.post("/metrics/made", auth, checkPermission('dialer'), dialerController.incrementCallsMade);
router.post("/metrics/received", auth, checkPermission('dialer'), dialerController.incrementCallsReceived);

module.exports = router;
