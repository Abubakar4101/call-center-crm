const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { addStaff, listStaff, updateStaff, deleteStaff, updateAgenda, getPerformance } = require('../controllers/staffController');

router.use(auth);

// Permission: Staff Module
const checkPermission = require('../middlewares/checkPermission');
router.get('/', checkPermission('staff'), listStaff);
router.get('/performance', checkPermission('staff'), getPerformance);
router.post('/', checkPermission('staff'), addStaff);
router.put('/:id', checkPermission('staff'), updateStaff);
router.patch('/:id/agenda', checkPermission('staff'), updateAgenda);
router.delete('/:id', checkPermission('staff'), deleteStaff);

module.exports = router;