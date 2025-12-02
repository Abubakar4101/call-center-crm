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
    } catch (err) {
        console.log(err)
    }
}

// Common email header with logo
function getEmailHeader(title) {
    return `
        <div class="header">
            <div class="logo-container">
                <img src="https://i.ibb.co/QF9jW6tg/swift-trucx-logo.png" alt="Swift Trucx" class="logo" />
            </div>
            <h1>${title}</h1>
        </div>
    `;
}

// Common email styles
function getEmailStyles() {
    return `
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo-container { margin-bottom: 15px; }
            .logo { max-width: 150px; height: auto; }
            .content { background-color: #f9fafb; padding: 30px; }
            .meeting-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .reminder-box { background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
            .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #3b82f6; display: inline-block; min-width: 140px; }
            .footer { text-align: center; padding: 20px; background-color: #1f2937; color: #9ca3af; font-size: 14px; }
            .footer-logo { max-width: 100px; margin-bottom: 10px; opacity: 0.7; }
            h1 { margin: 0; font-size: 24px; font-weight: 600; }
            h2 { color: #F59E0B; margin-top: 0; }
        </style>
    `;
}

// Email template for meeting confirmation to scheduler
function getMeetingConfirmationEmailForScheduler(schedulerName, contactName, contactPhone, contactEmail, meetingDate) {
    const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${getEmailStyles()}
        </head>
        <body>
            <div class="container">
                ${getEmailHeader('Meeting Scheduled Successfully')}
                <div class="content">
                    <p>Hi ${schedulerName},</p>
                    <p>Your follow-up meeting has been scheduled successfully. Here are the details:</p>
                    
                    <div class="meeting-details">
                        <div class="detail-row">
                            <span class="label">Contact Name:</span> ${contactName}
                        </div>
                        <div class="detail-row">
                            <span class="label">Contact Phone:</span> ${contactPhone}
                        </div>
                        <div class="detail-row">
                            <span class="label">Contact Email:</span> ${contactEmail}
                        </div>
                        <div class="detail-row">
                            <span class="label">Meeting Date & Time:</span> ${formattedDate}
                        </div>
                    </div>
                    
                    <p>You will receive a reminder 30 minutes before the scheduled meeting.</p>
                    <p>You can view all your scheduled meetings in the Leads tab of your CRM dashboard.</p>
                </div>
                <div class="footer">
                    <img src="https://i.ibb.co/QF9jW6tg/swift-trucx-logo.png" alt="Swift Trucx" class="footer-logo" />
                    <p>This is an automated message from Swift Trucx CRM</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Email template for meeting notification to contact person
function getMeetingNotificationEmailForContact(contactName, schedulerName, schedulerEmail, meetingDate) {
    const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${getEmailStyles()}
        </head>
        <body>
            <div class="container">
                ${getEmailHeader('Meeting Invitation')}
                <div class="content">
                    <p>Hi ${contactName},</p>
                    <p>${schedulerName} has scheduled a follow-up meeting with you. Here are the details:</p>
                    
                    <div class="meeting-details">
                        <div class="detail-row">
                            <span class="label">Scheduled By:</span> ${schedulerName}
                        </div>
                        <div class="detail-row">
                            <span class="label">Contact Email:</span> ${schedulerEmail}
                        </div>
                        <div class="detail-row">
                            <span class="label">Meeting Date & Time:</span> ${formattedDate}
                        </div>
                    </div>
                    
                    <p>You will receive a reminder 30 minutes before the scheduled meeting.</p>
                    <p>If you have any questions or need to reschedule, please contact ${schedulerName} at ${schedulerEmail}.</p>
                </div>
                <div class="footer">
                    <img src="https://i.ibb.co/QF9jW6tg/swift-trucx-logo.png" alt="Swift Trucx" class="footer-logo" />
                    <p>This is an automated message from Swift Trucx CRM</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Email template for meeting reminder
function getMeetingReminderEmail(recipientName, isScheduler, contactName, schedulerName, contactPhone, meetingDate) {
    const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const otherPartyName = isScheduler ? contactName : schedulerName;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            ${getEmailStyles()}
        </head>
        <body>
            <div class="container">
                ${getEmailHeader('⏰ Meeting Reminder')}
                <div class="content">
                    <p>Hi ${recipientName},</p>
                    
                    <div class="reminder-box">
                        <h2 style="margin-top: 0; color: #F59E0B;">Your meeting is in 30 minutes!</h2>
                    </div>
                    
                    <p>This is a friendly reminder about your upcoming meeting:</p>
                    
                    <div class="meeting-details">
                        <div class="detail-row">
                            <span class="label">Meeting With:</span> ${otherPartyName}
                        </div>
                        ${isScheduler ? `<div class="detail-row"><span class="label">Contact Phone:</span> ${contactPhone}</div>` : ''}
                        <div class="detail-row">
                            <span class="label">Meeting Date & Time:</span> ${formattedDate}
                        </div>
                    </div>
                    
                    <p>Please make sure you're prepared for the meeting.</p>
                </div>
                <div class="footer">
                    <img src="https://i.ibb.co/QF9jW6tg/swift-trucx-logo.png" alt="Swift Trucx" class="footer-logo" />
                    <p>This is an automated reminder from Swift Trucx CRM</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Send meeting confirmation emails
async function sendMeetingConfirmationEmails(schedulerName, schedulerEmail, contactName, contactPhone, contactEmail, meetingDate) {
    try {
        // Send confirmation to scheduler
        await sendEmail({
            to: schedulerEmail,
            subject: 'Meeting Scheduled - Confirmation',
            html: getMeetingConfirmationEmailForScheduler(schedulerName, contactName, contactPhone, contactEmail, meetingDate)
        });

        // Send notification to contact person
        await sendEmail({
            to: contactEmail,
            subject: 'Meeting Invitation',
            html: getMeetingNotificationEmailForContact(contactName, schedulerName, schedulerEmail, meetingDate)
        });

        console.log('Meeting confirmation emails sent successfully');
    } catch (error) {
        console.error('Error sending meeting confirmation emails:', error);
        throw error;
    }
}

// Send meeting reminder emails
async function sendMeetingReminderEmails(schedulerName, schedulerEmail, contactName, contactPhone, contactEmail, meetingDate) {
    try {
        // Send reminder to scheduler
        await sendEmail({
            to: schedulerEmail,
            subject: '⏰ Meeting Reminder - 30 Minutes',
            html: getMeetingReminderEmail(schedulerName, true, contactName, schedulerName, contactPhone, meetingDate)
        });

        // Send reminder to contact person
        await sendEmail({
            to: contactEmail,
            subject: '⏰ Meeting Reminder - 30 Minutes',
            html: getMeetingReminderEmail(contactName, false, contactName, schedulerName, contactPhone, meetingDate)
        });

        console.log('Meeting reminder emails sent successfully');
    } catch (error) {
        console.error('Error sending meeting reminder emails:', error);
        throw error;
    }
}

module.exports = {
    sendEmail,
    sendMeetingConfirmationEmails,
    sendMeetingReminderEmails
};

