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


const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });
// app.set('io', io);


app.use(cors());

app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeController.webhook
);

app.use(express.json());
app.use("/assets/profile-pics", express.static(path.join(__dirname, "assets/profile-pics")));

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



// io.on('connection', (socket) => {
//     socket.on('joinTenant', (tenantId) => socket.join(String(tenantId)));
// });


app.listen(process.env.PORT || 5000, () => console.log('Server started'));
