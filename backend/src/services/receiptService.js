const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Receipt = require('../models/receipt');
const Payment = require('../models/payment');
const Lead = require('../models/lead');

const RECEIPT_ASSETS_DIR = path.join(__dirname, '../../assets/receipts');
if (!fs.existsSync(RECEIPT_ASSETS_DIR)) fs.mkdirSync(RECEIPT_ASSETS_DIR, { recursive: true });

function currency(amount, currencyCode = 'USD') {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode.toUpperCase() }).format(amount);
    } catch (_) {
        return `$${Number(amount).toFixed(2)}`;
    }
}

async function generateReceiptHtml(data) {
    const {
        receiptNo,
        date,
        clientName,
        amount,
        currencyCode,
        description,
        paymentMethod,
        transactionId,
        note,
        companyName = process.env.COMPANY_NAME || 'SWIFT TRUCX'
    } = data;

    const logoUrl = `https://call-center-crm-eight.vercel.app/web-logo-dark.jpeg`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .receipt-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo { max-width: 200px; }
        .company-info { text-align: right; }
        .receipt-title { font-size: 45px; line-height: 45px; color: #333; }
        .info-table { width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; }
        .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .info-table .label { font-weight: bold; width: 200px; }
        .total-row { background: #eee; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; color: #777; font-size: 14px; }
        .note { margin-top: 20px; font-style: italic; color: #555; }
    </style>
</head>
<body>
    <div class="receipt-box">
        <div class="header">
            <img src="${logoUrl}" class="logo" alt="Company Logo">
            <div class="company-info">
                <h1 class="receipt-title">RECEIPT</h1>
                <p># ${receiptNo}</p>
                <p>Date: ${new Date(date).toLocaleDateString()}</p>
            </div>
        </div>

        <table class="info-table">
            <tr>
                <td class="label">Client Name</td>
                <td>${clientName}</td>
            </tr>
            <tr>
                <td class="label">Service Description</td>
                <td>${description || 'Payment for services'}</td>
            </tr>
            <tr>
                <td class="label">Payment Method</td>
                <td>${paymentMethod || 'Stripe/Card'}</td>
            </tr>
            <tr>
                <td class="label">Transaction ID</td>
                <td>${transactionId}</td>
            </tr>
            <tr class="total-row">
                <td class="label">Amount Paid</td>
                <td>${currency(amount, currencyCode)}</td>
            </tr>
        </table>

        ${note ? `<div class="note"><strong>Note:</strong> ${note}</div>` : ''}

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>&copy; ${new Date().getFullYear()} ${companyName}</p>
        </div>
    </div>
</body>
</html>
    `;
}

async function generateReceiptPDF(paymentId) {
    const payment = await Payment.findById(paymentId).populate('tenant client');
    if (!payment) throw new Error('Payment not found');

    const receiptNo = payment.receiptNo || `REC-${Date.now()}`;
    const clientName = payment.client ? payment.client.contactName : (payment.customer_email || 'Walk-in Client');

    const data = {
        receiptNo,
        date: payment.createdAt,
        clientName,
        amount: payment.amount,
        currencyCode: payment.currency,
        description: payment.metadata?.title || 'Professional Services',
        paymentMethod: payment.method,
        transactionId: payment.stripePaymentId,
        note: `Auto-generated receipt for ${clientName}`,
        companyName: process.env.COMPANY_NAME
    };

    const html = await generateReceiptHtml(data);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const clientId = payment.client ? String(payment.client._id) : 'general';
    const clientDir = path.join(RECEIPT_ASSETS_DIR, clientId);
    if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

    const fileName = `${receiptNo}.pdf`;
    const filePath = path.join(clientDir, fileName);

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true
    });

    await browser.close();

    // Update payment with receipt info if not present
    if (!payment.receiptNo) {
        payment.receiptNo = receiptNo;
        await payment.save();
    }

    // Create Receipt record
    const receiptUrl = `/assets/receipts/${clientId}/${fileName}`;
    const receipt = await Receipt.create({
        payment: payment._id,
        receiptUrl,
        issueDate: new Date(),
        tenant: payment.tenant,
        receiptNo
    });

    return receipt;
}

module.exports = { generateReceiptPDF };
