const { createCheckoutSession, handleStripeWebhook } = require('../services/stripeService');
const { sendEmail } = require('../services/emailService');
const { generateInvoiceHtml } = require('../services/invoiceService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createCheckout = async (req, res) => {
    try {
        const session = await createCheckoutSession({ tenantId: req.user.tenantId, ...req.body });

        // Fire-and-forget invoice email to customer
        const amount = Number(req.body.amount || 0);
        const currency = (req.body.currency || 'usd').toUpperCase();
        const title = req.body.title || 'One Time Payment';
        const customer_email = req.body.customer_email;
        if (customer_email) {
            const html = generateInvoiceHtml({
                title,
                amount,
                currencyCode: currency,
                recipientEmail: customer_email,
                checkoutUrl: session.url,
                companyName: process.env.COMPANY_NAME,
            });
            console.log('This is the html')
            sendEmail({ to: customer_email, subject: `Invoice: ${title}`, html }).catch(() => { });
        }

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        const io = req.app.get('io');
        await handleStripeWebhook(event, io);
        res.json({ received: true });
    } catch (err) {
        console.log(err)
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};