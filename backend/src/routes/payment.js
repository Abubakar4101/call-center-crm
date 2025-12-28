const router = require('express').Router();
const auth = require('../middlewares/auth');
const checkPermission = require("../middlewares/checkPermission");
const { listPayments, dashboard, deletePayment, getReceipt, manualGenerateReceipt, exportExcel, exportPdf } = require('../controllers/paymentController');


// Permission: Payment Module
router.get('/', auth, checkPermission('payment'), listPayments);
router.get('/dashboard', auth, checkPermission('payment'), dashboard);
router.get('/receipt/:id', auth, checkPermission('payment'), getReceipt);
router.get('/export/excel', auth, checkPermission('payment'), exportExcel);
router.get('/export/pdf', auth, checkPermission('payment'), exportPdf);
router.post('/generate-receipt/:id', auth, checkPermission('payment'), manualGenerateReceipt);
router.delete('/:id', auth, checkPermission('payment'), deletePayment);


module.exports = router;