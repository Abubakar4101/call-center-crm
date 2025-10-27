    const router = require('express').Router();
    const auth = require('../middlewares/auth');
    const checkPermission = require("../middlewares/checkPermission");
    const { listPayments, dashboard } = require('../controllers/paymentController');


    // Permission: Payment Module
    router.get('/', auth, checkPermission('payment'), listPayments);
    router.get('/dashboard', auth, checkPermission('payment'), dashboard);


    module.exports = router;