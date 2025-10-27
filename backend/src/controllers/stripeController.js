const { createCheckoutSession, handleStripeWebhook } = require('../services/stripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createCheckout = async(req, res) => {
    try {
        const session = await createCheckoutSession({ tenantId: req.user.tenantId, ...req.body });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.webhook = async(req, res) => {
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