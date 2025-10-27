const fileService = require("../services/fileService");

exports.listFiles = async(req, res) => {
    try {
        const files = await fileService.getUploadedFiles();
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadFile = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const result = await fileService.saveFile(req.file);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Rename file by ID
exports.renameFile = async(req, res) => {
    try {
        const { fileId, name } = req.body;
        if (!fileId || !name) {
            return res.status(400).json({ error: "fileId and name are required" });
        }
        const result = await fileService.renameFile(fileId, name);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete file by ID
exports.deleteFile = async(req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) return res.status(400).json({ error: "fileId is required" });

        const result = await fileService.deleteFile(fileId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};