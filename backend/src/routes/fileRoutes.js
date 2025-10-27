const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");
const fileService = require("../services/fileService");
const auth = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");

const upload = multer({ dest: fileService.FILES_DIR });
const router = express.Router();

// Permission: Files Module
router.get("/", auth, checkPermission('files'), fileController.listFiles);
router.post("/upload", auth, checkPermission('files'), upload.single("file"), fileController.uploadFile);
router.patch("/rename", auth, checkPermission('files'), fileController.renameFile);
router.delete("/delete", auth, checkPermission('files'), fileController.deleteFile);

module.exports = router;