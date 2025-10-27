const Driver = require('../models/driver');
const fs = require('fs');
const path = require('path');

class DriverService {
    async getAllDrivers(tenantId, options = {}) {
        const { page = 1, limit = 10, status, search } = options;
        const skip = (page - 1) * limit;

        // Build query
        const query = { tenant: tenantId };
        
        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { 'carrierInfo.companyName': { $regex: search, $options: 'i' } },
                { 'carrierInfo.mcNumber': { $regex: search, $options: 'i' } },
                { 'carrierInfo.dotNumber': { $regex: search, $options: 'i' } },
                { 'ownerDriverInfo.fullName': { $regex: search, $options: 'i' } },
                { 'ownerDriverInfo.cdlNumber': { $regex: search, $options: 'i' } },
                { 'truckEquipmentInfo.licensePlate': { $regex: search, $options: 'i' } },
                { 'loaderInfo.agentName': { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query)
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalDrivers = await Driver.countDocuments(query);
        const totalPages = Math.ceil(totalDrivers / limit);

        return {
            drivers,
            currentPage: page,
            totalPages,
            totalDrivers,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    async getDriverById(driverId, tenantId) {
        return await Driver.findOne({ _id: driverId, tenant: tenantId })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');
    }

    async createDriver(driverData) {
        // Check if MC number already exists
        const existingDriver = await Driver.findOne({
            'carrierInfo.mcNumber': driverData.carrierInfo.mcNumber,
            tenant: driverData.tenant
        });

        if (existingDriver) {
            throw new Error('Driver with this MC number already exists');
        }

        // Check if DOT number already exists
        const existingDOT = await Driver.findOne({
            'carrierInfo.dotNumber': driverData.carrierInfo.dotNumber,
            tenant: driverData.tenant
        });

        if (existingDOT) {
            throw new Error('Driver with this DOT number already exists');
        }

        // Check if CDL number already exists
        const existingCDL = await Driver.findOne({
            'ownerDriverInfo.cdlNumber': driverData.ownerDriverInfo.cdlNumber,
            tenant: driverData.tenant
        });

        if (existingCDL) {
            throw new Error('Driver with this CDL number already exists');
        }

        const driver = new Driver(driverData);
        return await driver.save();
    }

    async updateDriver(driverId, tenantId, updateData) {
        // Remove fields that shouldn't be updated directly
        delete updateData.tenant;
        delete updateData.createdBy;
        delete updateData._id;

        const driver = await Driver.findOneAndUpdate(
            { _id: driverId, tenant: tenantId },
            { 
                ...updateData, 
                lastUpdated: new Date() 
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('approvedBy', 'name email');

        return driver;
    }

    async updateDriverStatus(driverId, tenantId, status, notes, approvedBy) {
        const updateData = {
            status,
            lastUpdated: new Date()
        };

        if (notes) {
            updateData.notes = notes;
        }

        if (status === 'Active' && approvedBy) {
            updateData.approvedBy = approvedBy;
            updateData.approvedAt = new Date();
        }

        const driver = await Driver.findOneAndUpdate(
            { _id: driverId, tenant: tenantId },
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('approvedBy', 'name email');

        return driver;
    }

    async deleteDriver(driverId, tenantId) {
        const driver = await Driver.findOneAndDelete({ _id: driverId, tenant: tenantId });
        
        if (driver) {
            // Clean up uploaded documents
            await this.cleanupDriverDocuments(driver);
        }

        return driver;
    }

    async uploadDocument(driverId, tenantId, documentType, file) {
        const driver = await Driver.findOne({ _id: driverId, tenant: tenantId });
        
        if (!driver) {
            return null;
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads/drivers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${driverId}_${documentType}_${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Update driver document URL and mark as uploaded
        const documentUrl = `/uploads/drivers/${fileName}`;
        const updateData = {
            [`documents.${documentType}Url`]: documentUrl,
            [`complianceDocuments.${documentType}`]: true,
            lastUpdated: new Date()
        };

        const updatedDriver = await Driver.findOneAndUpdate(
            { _id: driverId, tenant: tenantId },
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('approvedBy', 'name email');

        return updatedDriver;
    }

    async getDriverStats(tenantId) {
        const stats = await Driver.aggregate([
            { $match: { tenant: tenantId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalDrivers = await Driver.countDocuments({ tenant: tenantId });
        
        const statusCounts = {
            Pending: 0,
            Active: 0,
            'N/A': 0,
            Rejected: 0
        };

        stats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        return {
            totalDrivers,
            statusCounts,
            pendingApproval: statusCounts.Pending
        };
    }

    async cleanupDriverDocuments(driver) {
        const documentsDir = path.join(__dirname, '../../uploads/drivers');
        
        if (!fs.existsSync(documentsDir)) {
            return;
        }

        // Get all document URLs
        const documentUrls = Object.values(driver.documents).filter(url => url);
        
        for (const url of documentUrls) {
            const fileName = path.basename(url);
            const filePath = path.join(documentsDir, fileName);
            
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (error) {
                    console.error(`Error deleting file ${filePath}:`, error);
                }
            }
        }
    }

    async getDriversByStatus(tenantId, status) {
        return await Driver.find({ tenant: tenantId, status })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });
    }

    async searchDrivers(tenantId, searchTerm) {
        return await Driver.find({
            tenant: tenantId,
            $or: [
                { 'carrierInfo.companyName': { $regex: searchTerm, $options: 'i' } },
                { 'carrierInfo.mcNumber': { $regex: searchTerm, $options: 'i' } },
                { 'carrierInfo.dotNumber': { $regex: searchTerm, $options: 'i' } },
                { 'ownerDriverInfo.fullName': { $regex: searchTerm, $options: 'i' } },
                { 'ownerDriverInfo.cdlNumber': { $regex: searchTerm, $options: 'i' } },
                { 'truckEquipmentInfo.licensePlate': { $regex: searchTerm, $options: 'i' } },
                { 'loaderInfo.agentName': { $regex: searchTerm, $options: 'i' } }
            ]
        })
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 });
    }
}

module.exports = new DriverService();
