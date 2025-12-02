const express = require('express');
const leadController = require('../controllers/leadController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create a new lead/meeting
router.post('/', auth, leadController.createLead);

// Get all leads for the current tenant
router.get('/', auth, leadController.getLeads);

// Get a single lead by ID
router.get('/:id', auth, leadController.getLeadById);

// Update lead status
router.patch('/:id/status', auth, leadController.updateLeadStatus);

// Delete a lead
router.delete('/:id', auth, leadController.deleteLead);

// Get upcoming meetings (for reminder processing)
router.get('/upcoming/meetings', auth, leadController.getUpcomingMeetings);

module.exports = router;
