require('dotenv').config();
require('./src/config/db')
const express = require('express');
const cors = require('cors');
const http = require('http');
// const { Server } = require('socket.io');
const serverless = require('serverless-http');
const path = require('path')

const stripeController = require('./src/controllers/stripeController')


const authRoutes = require('./src/routes/auth');
const paymentRoutes = require('./src/routes/payment');
const stripeRoutes = require('./src/routes/stripe');
const staffRoutes = require('./src/routes/staffRoutes');
const fileRoutes = require("./src/routes/fileRoutes");
const dialerRoutes = require("./src/routes/dialerRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const scrapperRoutes = require("./src/routes/scrapperRoutes");
const driverRoutes = require("./src/routes/driverRoutes");
const leadRoutes = require("./src/routes/leadRoutes");


const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });
// app.set('io', io);

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization"
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeController.webhook
);

app.use(express.json());
app.use("/assets/profile-pics", express.static(path.join(__dirname, "assets/profile-pics")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/staff', staffRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dialer", dialerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/run-scrapper", scrapperRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/leads", leadRoutes);





// io.on('connection', (socket) => {
//     socket.on('joinTenant', (tenantId) => socket.join(String(tenantId)));
// });

// Initialize cron job for meeting reminders
const cron = require('node-cron');
const leadService = require('./src/services/leadService');
const { sendMeetingReminderEmails } = require('./src/services/emailService');

// Run every 5 minutes to check for upcoming meetings
cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('Checking for upcoming meetings...');
        const upcomingMeetings = await leadService.getUpcomingMeetings(30);

        for (const meeting of upcomingMeetings) {
            try {
                // Only send reminder emails if contact has a valid email
                if (meeting.contactEmail && meeting.contactEmail !== 'no-email@example.com') {
                    // Send reminder emails
                    await sendMeetingReminderEmails(
                        meeting.scheduledByName,
                        meeting.scheduledByEmail,
                        meeting.contactName,
                        meeting.contactPhone,
                        meeting.contactEmail,
                        meeting.meetingDate
                    );
                    console.log(`Reminder sent for meeting ${meeting._id}`);
                } else {
                    console.log(`Skipping reminder for meeting ${meeting._id} - no valid email`);
                }

                // Mark reminder as sent regardless
                await leadService.markReminderSent(meeting._id);
            } catch (error) {
                console.error(`Error sending reminder for meeting ${meeting._id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in reminder cron job:', error);
    }
});

console.log('Meeting reminder cron job initialized');

app.listen(process.env.PORT || 5000, () => console.log('Server started'));
