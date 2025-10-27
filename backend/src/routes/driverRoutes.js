const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const driverController = require('../controllers/driverController');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// All routes require authentication
router.use(auth);

// Get all drivers (with permission check)
router.get('/', checkPermission('driver'), driverController.getAllDrivers);

// Get driver statistics
router.get('/stats', checkPermission('driver'), driverController.getDriverStats);

// Get single driver by ID
router.get('/:id', checkPermission('driver'), driverController.getDriverById);

// Create new driver (requires create permission)
router.post('/', checkPermission('driver_create'), driverController.createDriver);

// Update driver (requires update permission)
router.put('/:id', checkPermission('driver_update'), driverController.updateDriver);

// Update driver with PATCH (partial update)
router.patch('/:id', checkPermission('driver_update'), driverController.updateDriver);

// Update driver status (requires admin/supervisor permission)
router.patch('/:id/status', checkPermission('driver_approve'), driverController.updateDriverStatus);

// Upload document (requires update permission)
router.post('/:id/upload', 
    checkPermission('driver_update'),
    upload.single('document'),
    driverController.uploadDocument
);

// Delete driver (requires delete permission)
router.delete('/:id', checkPermission('driver_delete'), driverController.deleteDriver);

module.exports = router;
