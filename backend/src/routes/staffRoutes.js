const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { addStaff, listStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

router.use(auth);

// Permission: Staff Module
const checkPermission = require('../middlewares/checkPermission');
router.get('/', checkPermission('staff'), listStaff);
router.post('/', checkPermission('staff'), addStaff);
router.put('/:id', checkPermission('staff'), updateStaff);
router.delete('/:id', checkPermission('staff'), deleteStaff);

module.exports = router;