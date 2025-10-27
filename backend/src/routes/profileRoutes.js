const express = require("express");
const multer = require("multer");
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

const upload = multer({ dest: "temp/" });

const router = express.Router();

router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);

router.post(
    "/upload-picture",
    authMiddleware,
    upload.single("profilePicture"),
    profileController.uploadProfilePicture
);

module.exports = router;