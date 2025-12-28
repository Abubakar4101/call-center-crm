const { getTenantPayments, getDashboardStats, deletePayment } = require('../services/paymentService');
const { generateReceiptPDF } = require('../services/receiptService');
const Payment = require('../models/payment');
const Receipt = require('../models/receipt');
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');


exports.listPayments = async (req, res) => {
    try {
        const { payments, pagination } = await getTenantPayments(req.user.tenantId, req.query);
        res.json({ success: true, payments, pagination });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};


exports.dashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats(req.user.tenantId);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const deleted = await deletePayment(req.user.tenantId, req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error deleting payment' });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({ payment: req.params.id, tenant: req.user.tenantId });
        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching receipt' });
    }
};

exports.manualGenerateReceipt = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, tenant: req.user.tenantId });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const receipt = await generateReceiptPDF(payment._id);
        res.json({ success: true, receipt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error generating receipt' });
    }
};

exports.exportExcel = async (req, res) => {
    try {
        const payments = await Payment.find({ tenant: req.user.tenantId }).populate('client').sort({ createdAt: -1 });

        const data = payments.map(p => ({
            'Payment ID': p.stripePaymentId,
            'Client Name': p.client ? p.client.contactName : 'Guest',
            'Customer Email': p.customer_email || (p.client && p.client.contactEmail),
            'Amount': p.amount,
            'Currency': (p.currency || 'USD').toUpperCase(),
            'Method': (p.method || 'card').toUpperCase(),
            'Status': p.status,
            'Date': new Date(p.createdAt).toLocaleDateString()
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Payments');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=payments_export.xlsx');
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error exporting to Excel' });
    }
};

exports.exportPdf = async (req, res) => {
    try {
        const payments = await Payment.find({ tenant: req.user.tenantId }).populate('client').sort({ createdAt: -1 });

        let html = `
            <html>
            <head>
                <style>
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h1 { color: #333; text-align: center; }
                </style>
            </head>
            <body>
                <h1>Payment Report</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        payments.forEach(p => {
            html += `
                <tr>
                    <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>${p.client ? p.client.contactName : 'Guest'}</td>
                    <td>$${p.amount}</td>
                    <td>${(p.method || 'card').toUpperCase()}</td>
                    <td>${p.status}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=payments_export.pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error exporting to PDF' });
    }
};