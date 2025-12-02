import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function LeadsPage() {
    const { success, error } = useToast();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled

    useEffect(() => {
        fetchLeads();
    }, [filter]);

    async function fetchLeads() {
        setLoading(true);
        try {
            const filters = filter !== 'all' ? { status: filter } : {};
            const response = await apiService.getLeads(filters);
            setLeads(response.leads || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
            error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(leadId, newStatus) {
        try {
            await apiService.updateLeadStatus(leadId, newStatus);
            success(`Meeting ${newStatus} successfully`);
            fetchLeads(); // Refresh the list
        } catch (err) {
            console.error('Error updating lead status:', err);
            error('Failed to update meeting status');
        }
    }

    async function handleDelete(leadId) {
        if (!confirm('Are you sure you want to delete this meeting?')) {
            return;
        }

        try {
            await apiService.deleteLead(leadId);
            success('Meeting deleted successfully');
            fetchLeads(); // Refresh the list
        } catch (err) {
            console.error('Error deleting lead:', err);
            error('Failed to delete meeting');
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-100">
                    Leads & Follow-Ups
                </h3>
                <p className="text-gray-400 mt-1 text-sm lg:text-base">
                    Manage your scheduled meetings and follow-ups
                </p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('scheduled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'scheduled'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Scheduled
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'cancelled'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-100">
                        Meetings ({leads.length})
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="animate-spin h-6 w-6 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="text-sm text-gray-400">Loading meetings...</span>
                            </div>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-100">
                                No meetings found
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Schedule a follow-up meeting from the Dialer page.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leads.map((lead) => (
                                <div
                                    key={lead._id}
                                    className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Contact Info */}
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-blue-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-100">
                                                        {lead.contactName}
                                                    </h4>
                                                    <p className="text-sm text-gray-400">
                                                        {lead.contactPhone}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Meeting Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                <div className="flex items-center text-sm">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-300">{lead.contactEmail}</span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-300">
                                                        {formatDate(lead.meetingDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-300">
                                                        Scheduled by: {lead.scheduledByName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {lead.notes && (
                                                <div className="bg-gray-800 rounded p-2 mb-3">
                                                    <p className="text-sm text-gray-300">
                                                        <span className="font-medium">Notes:</span> {lead.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col space-y-2 ml-4">
                                            {lead.status === 'scheduled' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(lead._id, 'completed')}
                                                        className="btn btn-success text-xs px-3 py-1"
                                                    >
                                                        Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(lead._id, 'cancelled')}
                                                        className="btn btn-error text-xs px-3 py-1"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(lead._id)}
                                                className="btn btn-secondary text-xs px-3 py-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
