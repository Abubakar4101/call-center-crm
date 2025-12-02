const leadService = require('../services/leadService');
const { sendMeetingConfirmationEmails } = require('../services/emailService');

class LeadController {
    // Create a new lead/meeting
    async createLead(req, res) {
        try {
            const { contactName, contactPhone, contactEmail, meetingDate, notes } = req.body;
            const userId = req.user.id;
            const tenantId = req.user.tenant;
            const schedulerName = req.user.name;
            const schedulerEmail = req.user.email;

            // Validate required fields
            if (!contactName || !contactPhone || !contactEmail || !meetingDate) {
                return res.status(400).json({
                    error: 'Missing required fields: contactName, contactPhone, contactEmail, meetingDate'
                });
            }

            // Validate meeting date is in the future
            const meetingDateTime = new Date(meetingDate);
            if (meetingDateTime <= new Date()) {
                return res.status(400).json({
                    error: 'Meeting date must be in the future'
                });
            }

            // Create lead data
            const leadData = {
                contactName,
                contactPhone,
                contactEmail,
                meetingDate: meetingDateTime,
                scheduledBy: userId,
                scheduledByName: schedulerName,
                scheduledByEmail: schedulerEmail,
                tenant: tenantId,
                notes: notes || '',
                status: 'scheduled',
                reminderSent: false
            };

            // Create the lead
            const lead = await leadService.createLead(leadData);

            // Send confirmation emails only if contact has a valid email (non-blocking)
            if (contactEmail && contactEmail !== 'no-email@example.com') {
                sendMeetingConfirmationEmails(
                    schedulerName,
                    schedulerEmail,
                    contactName,
                    contactPhone,
                    contactEmail,
                    meetingDateTime
                ).catch(err => {
                    console.error('Error sending confirmation emails:', err);
                });
            }

            res.status(201).json({
                message: 'Meeting scheduled successfully',
                lead
            });
        } catch (error) {
            console.error('Error creating lead:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all leads for the current tenant
    async getLeads(req, res) {
        try {
            const tenantId = req.user.tenant;
            const filters = {
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // If user is staff, only show their own leads
            if (req.user.role === 'staff') {
                filters.scheduledBy = req.user.userId;
            }

            const leads = await leadService.getLeads(tenantId, filters);

            res.status(200).json({ leads });
        } catch (error) {
            console.error('Error fetching leads:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get a single lead by ID
    async getLeadById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant;

            const lead = await leadService.getLeadById(id, tenantId);

            res.status(200).json({ lead });
        } catch (error) {
            console.error('Error fetching lead:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Update lead status
    async updateLeadStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const tenantId = req.user.tenant;

            // Validate status
            const validStatuses = ['scheduled', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const lead = await leadService.updateLeadStatus(id, tenantId, status, notes);

            res.status(200).json({
                message: 'Lead status updated successfully',
                lead
            });
        } catch (error) {
            console.error('Error updating lead status:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Delete a lead
    async deleteLead(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant;

            await leadService.deleteLead(id, tenantId);

            res.status(200).json({ message: 'Lead deleted successfully' });
        } catch (error) {
            console.error('Error deleting lead:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get upcoming meetings (for reminder processing)
    async getUpcomingMeetings(req, res) {
        try {
            const minutesAhead = parseInt(req.query.minutesAhead) || 30;
            const leads = await leadService.getUpcomingMeetings(minutesAhead);

            res.status(200).json({ leads });
        } catch (error) {
            console.error('Error fetching upcoming meetings:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new LeadController();
