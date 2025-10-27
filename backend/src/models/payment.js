const mongoose = require('mongoose');


const PaymentSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    stripePaymentId: { type: String, required: true },
    amount: { type: Number },
    currency: { type: String },
    customer_email: { type: String },
    status: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});


const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;