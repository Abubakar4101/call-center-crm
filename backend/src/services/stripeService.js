const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');


async function createCheckoutSession({ tenantId, amount, currency, customer_email, title }) {
    const amountInCents = Math.round(amount * 100);
    return stripe.checkout.sessions.create({
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
}


async function handleStripeWebhook(event, io) {
    console.log(event.type)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const pay = await Payment.create({
            tenant: session.metadata.tenantId,
            stripePaymentId: session.payment_intent || session.id,
            amount: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details.email || session.customer_email,
            status: 'completed',
            metadata: session.metadata
        });
        if (io) io.to(String(pay.tenant)).emit('payment.created', pay);
    }
}


module.exports = { createCheckoutSession, handleStripeWebhook };