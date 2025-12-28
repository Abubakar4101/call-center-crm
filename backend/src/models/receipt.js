const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    receiptUrl: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    receiptNo: { type: String, required: true }
});

const Receipt = mongoose.model('Receipt', ReceiptSchema);
module.exports = Receipt;
