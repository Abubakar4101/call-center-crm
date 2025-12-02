const Lead = require('../models/lead');

class LeadService {
    // Create a new lead/meeting
    async createLead(leadData) {
        try {
            const lead = new Lead(leadData);
            await lead.save();
            return lead;
        } catch (error) {
            throw new Error(`Failed to create lead: ${error.message}`);
        }
    }

    // Get all leads for a tenant with optional filtering
    async getLeads(tenantId, filters = {}) {
        try {
            const query = { tenant: tenantId };

            // Add status filter if provided
            if (filters.status) {
                query.status = filters.status;
            }

            // Add date range filter if provided
            if (filters.startDate || filters.endDate) {
                query.meetingDate = {};
                if (filters.startDate) {
                    query.meetingDate.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.meetingDate.$lte = new Date(filters.endDate);
                }
            }

            // Add scheduledBy filter if provided
            if (filters.scheduledBy) {
                query.scheduledBy = filters.scheduledBy;
            }

            const leads = await Lead.find(query)
                .populate('scheduledBy', 'name email')
                .sort({ meetingDate: -1 });

            return leads;
        } catch (error) {
            throw new Error(`Failed to fetch leads: ${error.message}`);
        }
    }

    // Get a single lead by ID
    async getLeadById(leadId, tenantId) {
        try {
            const lead = await Lead.findOne({ _id: leadId, tenant: tenantId })
                .populate('scheduledBy', 'name email');

            if (!lead) {
                throw new Error('Lead not found');
            }

            return lead;
        } catch (error) {
            throw new Error(`Failed to fetch lead: ${error.message}`);
        }
    }

    // Update lead status
    async updateLeadStatus(leadId, tenantId, status, notes = '') {
        try {
            const lead = await Lead.findOne({ _id: leadId, tenant: tenantId });

            if (!lead) {
                throw new Error('Lead not found');
            }

            lead.status = status;
            if (notes) {
                lead.notes = notes;
            }
            lead.updatedAt = Date.now();

            await lead.save();
            return lead;
        } catch (error) {
            throw new Error(`Failed to update lead status: ${error.message}`);
        }
    }

    // Mark reminder as sent
    async markReminderSent(leadId) {
        try {
            const lead = await Lead.findById(leadId);

            if (!lead) {
                throw new Error('Lead not found');
            }

            lead.reminderSent = true;
            lead.updatedAt = Date.now();

            await lead.save();
            return lead;
        } catch (error) {
            throw new Error(`Failed to mark reminder as sent: ${error.message}`);
        }
    }

    // Get upcoming meetings for reminder processing
    async getUpcomingMeetings(minutesAhead = 30) {
        try {
            const now = new Date();
            const futureTime = new Date(now.getTime() + minutesAhead * 60000);

            // Find meetings that:
            // 1. Are scheduled (not completed or cancelled)
            // 2. Haven't had reminder sent yet
            // 3. Are within the next X minutes
            const leads = await Lead.find({
                status: 'scheduled',
                reminderSent: false,
                meetingDate: {
                    $gte: now,
                    $lte: futureTime
                }
            }).populate('scheduledBy', 'name email');

            return leads;
        } catch (error) {
            throw new Error(`Failed to fetch upcoming meetings: ${error.message}`);
        }
    }

    // Delete a lead
    async deleteLead(leadId, tenantId) {
        try {
            const lead = await Lead.findOneAndDelete({ _id: leadId, tenant: tenantId });

            if (!lead) {
                throw new Error('Lead not found');
            }

            return lead;
        } catch (error) {
            throw new Error(`Failed to delete lead: ${error.message}`);
        }
    }
}

module.exports = new LeadService();
