const router = require('express').Router();
const auth = require('../middlewares/auth');
const checkPermission = require("../middlewares/checkPermission");
const { listPayments, dashboard, deletePayment } = require('../controllers/paymentController');


// Permission: Payment Module
router.get('/', auth, checkPermission('payment'), listPayments);
router.get('/dashboard', auth, checkPermission('payment'), dashboard);
router.delete('/:id', auth, checkPermission('payment'), deletePayment);


module.exports = router;