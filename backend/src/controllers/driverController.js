const Driver = require('../models/driver');
const driverService = require('../services/driverService');
const { createCheckoutSession } = require('../services/stripeService');
const { sendEmail } = require('../services/emailService');
const { generateInvoiceHtml } = require('../services/invoiceService');

// Get all drivers for a tenant
const getAllDrivers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const tenantId = req.user.tenantId;

        const drivers = await driverService.getAllDrivers(tenantId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            search
        });

        res.json({
            success: true,
            data: drivers.drivers,
            pagination: {
                currentPage: drivers.currentPage,
                totalPages: drivers.totalPages,
                totalDrivers: drivers.totalDrivers,
                hasNext: drivers.hasNext,
                hasPrev: drivers.hasPrev
            }
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch drivers',
            error: error.message
        });
    }
};

// Get single driver by ID
const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;

        const driver = await driverService.getDriverById(id, tenantId);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: driver
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver',
            error: error.message
        });
    }
};

// Create new driver
const createDriver = async (req, res) => {
    try {
        const driverData = {
            ...req.body,
            tenant: req.user.tenantId,
            createdBy: req.user.userId
        };

        const driver = await driverService.createDriver(driverData);
        
        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create driver',
            error: error.message
        });
    }
};

// Update driver
const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        const updateData = req.body;

        const driver = await driverService.updateDriver(id, tenantId, updateData);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Auto create payment link and send invoice when loader is set with totalPayment and percentage
        try {
            const hasLoaderEnabled = Boolean(updateData.hasLoader || driver.hasLoader);
            const lInfo = updateData.loaderInfo || driver.loaderInfo || {};
            const percentage = typeof lInfo.percentage === 'number' ? lInfo.percentage : driver.loaderInfo?.percentage;
            const totalPayment = typeof lInfo.totalPayment === 'number' ? lInfo.totalPayment : driver.loaderInfo?.totalPayment;

            if (hasLoaderEnabled && percentage > 0 && totalPayment > 0) {
                const amount = (totalPayment * percentage) / 100;
                const customer_email = driver.ownerDriverInfo?.email || driver.carrierInfo?.email;
                const title = `Loader Commission` ;

                const session = await createCheckoutSession({
                    tenantId,
                    amount,
                    currency: 'usd',
                    customer_email,
                    title,
                });

                // Persist payment link into driver.loaderInfo.paymentLink
                driver.loaderInfo = {
                    ...driver.loaderInfo,
                    paymentLink: session.url,
                };
                await driver.save();

                // Send invoice email to loader recipient
                const invoiceHtml = generateInvoiceHtml({
                    title,
                    amount,
                    currencyCode: 'USD',
                    recipientName: driver.ownerDriverInfo.fullName || '',
                    recipientEmail: customer_email,
                    checkoutUrl: session.url,
                    companyName: process.env.COMPANY_NAME || 'SkyInfinit',
                });
                await sendEmail({
                    to: customer_email,
                    subject: `Invoice: ${title}`,
                    html: invoiceHtml,
                });
            }
        } catch (e) {
            console.error('Loader payment link creation/email failed:', e.message);
        }

        res.json({
            success: true,
            message: 'Driver updated successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update driver',
            error: error.message
        });
    }
};

// Update driver status
const updateDriverStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const tenantId = req.user.tenantId;

        const driver = await driverService.updateDriverStatus(id, tenantId, status, notes, req.user.userId);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: `Driver status updated to ${status}`,
            data: driver
        });
    } catch (error) {
        console.error('Error updating driver status:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update driver status',
            error: error.message
        });
    }
};

// Delete driver
const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;

        const driver = await driverService.deleteDriver(id, tenantId);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete driver',
            error: error.message
        });
    }
};

// Upload driver document
const uploadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;
        const tenantId = req.user.tenantId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const driver = await driverService.uploadDocument(id, tenantId, documentType, req.file);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

// Get driver statistics
const getDriverStats = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const stats = await driverService.getDriverStats(tenantId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching driver stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver statistics',
            error: error.message
        });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
    uploadDocument,
    getDriverStats
};
