'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ApproveEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to fetch events');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApprove = async (eventId) => {
    if (!confirm('Are you sure you want to approve this event?')) return;

    setActionLoading(eventId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/events/approve/${eventId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvents(events.map(e => 
        e._id === eventId ? res.data : e
      ));
      
      alert('Event approved successfully!');
    } catch (err) {
      console.error('Error approving event:', err);
      alert(err.response?.data?.message || 'Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId) => {
    if (!confirm('Are you sure you want to reject this event?')) return;

    setActionLoading(eventId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/events/reject/${eventId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvents(events.map(e => 
        e._id === eventId ? res.data : e
      ));
      
      alert('Event rejected successfully!');
    } catch (err) {
      console.error('Error rejecting event:', err);
      alert(err.response?.data?.message || 'Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? event.status === 'pending' :
      statusFilter === 'approved' ? event.status === 'approved' :
      statusFilter === 'rejected' ? event.status === 'cancelled' : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      cancelled: 'Rejected',
    };
    return {
      className: badges[status] || 'bg-gray-100 text-gray-800',
      label: labels[status] || status,
    };
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
        </div>
      </div>
    );
  }

  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Approve Events</h1>
        <p className="text-sm text-blue-200">Review upcoming events and approve, reject, or request changes.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name or organizer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Event Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-lg text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
          >
            <option value="all">All events</option>
            <option value="seminar">Seminar</option>
            <option value="webinar">Webinar</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="networking">Networking</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-lg text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
          >
            <option value="pending">Pending ({pendingCount})</option>
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Events awaiting approval</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {filteredEvents.length} of {events.length} events</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No events found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const statusBadge = getStatusBadge(event.status);
                  return (
                    <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/events/${event._id}`}
                          className="text-sm font-medium text-[#0D2847] hover:text-[#0A1929] hover:underline transition-colors"
                        >
                          {event.title}
                        </Link>
                        {event.organizer?.name && (
                          <p className="text-xs text-gray-500 mt-1">by {event.organizer.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {new Date(event.startDate).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 capitalize">{event.eventType || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {event.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(event._id)}
                                disabled={actionLoading === event._id}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === event._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(event._id)}
                                disabled={actionLoading === event._id}
                                className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/admin/events/${event._id}`}
                              className="px-4 py-1.5 bg-[#0D2847] text-white text-sm font-semibold rounded hover:bg-[#0A1929] transition-colors"
                            >
                              View Details
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing 1 of 4 of {filteredEvents.length} events
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  Prev
                </button>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}