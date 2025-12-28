const mongoose = require('mongoose');


const PaymentSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    stripePaymentId: { type: String, required: true },
    amount: { type: Number },
    currency: { type: String },
    customer_email: { type: String },
    status: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    invoiceId: { type: String },
    method: { type: String, default: 'card' },
    receiptNo: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});


const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;