const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
    if (transporter) return transporter;
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        } : undefined,
    });
    return transporter;
}

async function sendEmail({ to, subject, html }) {
    try {
        const tx = getTransporter();
        const from = process.env.MAIL_FROM || 'no-reply@skyinfinit.app';
        console.log("this the from", from)
        await tx.sendMail({ from, to, subject, html });
        console.log("Mail sending", from, to)
    } catch(err) {
        console.log(err)
    } 
}

module.exports = { sendEmail };


