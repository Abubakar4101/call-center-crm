import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function FollowUpModal({ isOpen, onClose, contact }) {
    const { success, error } = useToast();
    const [meetingDate, setMeetingDate] = useState(null);
    const [contactEmail, setContactEmail] = useState(contact?.email || contact?.Email || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Update email when contact changes
    React.useEffect(() => {
        if (contact) {
            setContactEmail(contact.email || contact.Email || '');
        }
    }, [contact]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!meetingDate) {
            error('Please select a meeting date and time');
            return;
        }

        // Check if meeting date is in the future
        if (meetingDate <= new Date()) {
            error('Meeting date must be in the future');
            return;
        }

        setLoading(true);

        try {
            const leadData = {
                contactName: contact.name || contact.Name || 'Customer',
                contactPhone: contact.phone || contact.Phone || contact.mobile || contact.Mobile || '',
                contactEmail: contactEmail || 'no-email@example.com', // Use placeholder if no email
                meetingDate: meetingDate.toISOString(),
                notes: notes
            };

            await apiService.createLead(leadData);

            if (contactEmail) {
                success('Meeting scheduled successfully! Confirmation emails sent.');
            } else {
                success('Meeting scheduled successfully!');
            }

            // Reset form
            setMeetingDate(null);
            setNotes('');

            // Close modal
            onClose();
        } catch (err) {
            console.error('Error scheduling meeting:', err);
            error(err.message || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setMeetingDate(null);
            setNotes('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-100">
                            Schedule Follow-Up Meeting
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-700 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Contact Information</h4>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-gray-100">{contact?.name || contact?.Name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-100">{contact?.phone || contact?.Phone || contact?.mobile || contact?.Mobile || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Contact Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="form-input w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="contact@example.com"
                            />
                        </div>

                        {/* Date & Time Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Meeting Date & Time *
                            </label>
                            <DatePicker
                                selected={meetingDate}
                                onChange={(date) => setMeetingDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                minDate={new Date()}
                                placeholderText="Select date and time"
                                className="form-input w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                calendarClassName="bg-gray-800 border-gray-600"
                                required
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="form-input w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add any notes about this meeting..."
                            />
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-200">
                                    {contactEmail ? 'Both you and the contact will receive confirmation emails. A reminder will be sent 30 minutes before the meeting.' : 'Meeting will be scheduled. Add an email address to receive notifications.'}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-1"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Schedule Meeting
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
