const fs = require("fs");
const path = require("path");
const File = require("../models/file");

const FILES_DIR = path.join(__dirname, "../../assets");
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });

async function getUploadedFiles() {
    return await File.find().sort({ uploadedAt: -1 });
}

async function saveFile(file) {
    const newPath = path.join(FILES_DIR, file.originalname);
    fs.renameSync(file.path, newPath);

    const fileDoc = await File.create({
        name: file.originalname,
        path: newPath,
        size: file.size,
        mimetype: file.mimetype,
    });

    return { message: "File uploaded successfully", file: fileDoc };
}

// Rename file using file ID + newName
async function renameFile(fileId, newName) {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) throw new Error("File record not found");

    const folder = path.dirname(fileDoc.path);
    const newPath = path.join(folder, newName);

    if (fs.existsSync(newPath)) {
        throw new Error("File with new name already exists");
    }

    fs.renameSync(fileDoc.path, newPath);

    fileDoc.name = newName;
    fileDoc.path = newPath;
    await fileDoc.save();

    return { message: "File renamed successfully", file: fileDoc };
}

// Delete file using file ID
async function deleteFile(fileId) {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) throw new Error("File record not found");

    if (fs.existsSync(fileDoc.path)) {
        fs.unlinkSync(fileDoc.path);
    }

    await File.findByIdAndDelete(fileId);

    return { message: "File deleted successfully", fileId };
}

module.exports = { getUploadedFiles, saveFile, renameFile, deleteFile, FILES_DIR };