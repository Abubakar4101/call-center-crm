const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set');
        }

        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            // SSL/TLS options - MongoDB Atlas requires TLS
            tls: true,
            tlsAllowInvalidCertificates: false,
            tlsAllowInvalidHostnames: false,
            // Connection pool options
            maxPoolSize: 10,
            minPoolSize: 5,
            // Retry options
            retryWrites: true,
            retryReads: true,
        };

        await mongoose.connect(mongoUri, options);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        if (error.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
            console.error('SSL/TLS error detected. This may be due to:');
            console.error('1. IP whitelist restrictions in MongoDB Atlas');
            console.error('2. Network connectivity issues');
            console.error('3. TLS version compatibility');
        }
        // Retry connection after 5 seconds
        setTimeout(() => {
            console.log('Retrying MongoDB connection...');
            connectDB();
        }, 5000);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
    console.log('Attempting to reconnect...');
});

// Handle process termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to application termination');
    process.exit(0);
});

connectDB();

module.exports = mongoose;