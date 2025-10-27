const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const checkPermission = require("../middlewares/checkPermission");
const scrapperController = require("../controllers/scrapperController");

// Permission: Run Scraper Module
router.post("/", auth, checkPermission('scraper'), scrapperController.runScrapper);

module.exports = router;