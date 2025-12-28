const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '../../');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

require('dotenv').config({ path: path.join(BACKEND_DIR, '.env') });

const mongoose = require('mongoose');
const { generateReceiptPDF } = require(path.join(BACKEND_DIR, 'src/services/receiptService'));
const Payment = require(path.join(BACKEND_DIR, 'src/models/payment'));
const Lead = require(path.join(BACKEND_DIR, 'src/models/lead'));
const Tenant = require(path.join(BACKEND_DIR, 'src/models/tenant'));

async function testReceipt() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MONGO_URI is not defined in .env');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Create or find tenant
        let tenant = await Tenant.findOne();
        if (!tenant) {
            tenant = await Tenant.create({ name: 'Verification Tenant' });
            console.log('Created verification tenant');
        }

        // Create or find lead
        let lead = await Lead.findOne({ tenant: tenant._id });
        if (!lead) {
            lead = await Lead.create({
                contactName: 'Verification Lead',
                contactPhone: '1234567890',
                contactEmail: 'verify@example.com',
                meetingDate: new Date(),
                scheduledBy: new mongoose.Types.ObjectId(),
                scheduledByName: 'Verifier',
                scheduledByEmail: 'verifier@example.com',
                status: 'scheduled',
                tenant: tenant._id
            });
            console.log('Created verification lead');
        }

        // Create test payment
        const payment = await Payment.create({
            tenant: tenant._id,
            stripePaymentId: 'test_verify_' + Date.now(),
            amount: 75.50,
            currency: 'usd',
            customer_email: lead.contactEmail,
            status: 'paid',
            client: lead._id,
            method: 'card',
            receiptNo: 'REC-VER-' + Date.now(),
            metadata: { title: 'Final Verification Test' }
        });

        console.log('Created test payment:', payment._id);

        const receipt = await generateReceiptPDF(payment._id);
        console.log('Receipt record created:', receipt._id);
        console.log('Receipt URL:', receipt.receiptUrl);
        console.log('Verification COMPLETE!');

    } catch (err) {
        console.error('Test FAILED:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

testReceipt();
