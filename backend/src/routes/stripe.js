const router = require('express').Router();
const auth = require('../middlewares/auth');
const { createCheckout, webhook } = require('../controllers/stripeController');
const checkPermission = require('../middlewares/checkPermission');
const express = require('express');


// Permission: Payment Module
router.post('/create-checkout', auth, checkPermission('payment'), createCheckout);
// router.post('/webhook', express.raw({ type: 'application/json' }), webhook);


module.exports = router;