const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');


async function createCheckoutSession({ tenantId, amount, currency, customer_email, title }) {
    const amountInCents = Math.round(amount * 100);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: currency || 'usd',
                product_data: { name: title || 'One Time Payment' },
                unit_amount: Math.round(amountInCents)
            },
            quantity: 1
        }],
        success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.FRONTEND_URL,
        customer_email,
        metadata: {
            tenantId: String(tenantId),
            title: String(title || 'One Time Payment'),
            amount: String(amountInCents),
            currency: String(currency || 'usd'),
        }
    });

    await Payment.create({
        tenant: tenantId,
        stripePaymentId: session.id,
        amount: amountInCents / 100, // store in normal currency format (e.g. 10.50)
        currency: currency || 'usd',
        customer_email,
        status: session.payment_status || 'pending',
        metadata: session.metadata,
    });

    return session;
}


async function handleStripeWebhook(event, io) {
    console.log(event.type)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const pay = await Payment.findOneAndUpdate(
            { stripePaymentId: session.id },
            { status: 'paid' },
            { new: true }
        );
        if (io) io.to(String(pay.tenant)).emit('payment.created', pay);
    }
}


module.exports = { createCheckoutSession, handleStripeWebhook };