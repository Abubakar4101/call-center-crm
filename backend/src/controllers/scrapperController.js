exports.runScrapper = async(req, res) => {
    try {
        // You can trigger your scraper logic here later
        console.log("Scraper triggered by:", req.user.userId);
        res.json({ success: true, message: "Scraper started successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};