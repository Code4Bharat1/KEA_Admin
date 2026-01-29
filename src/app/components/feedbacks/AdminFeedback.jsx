'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Star
} from 'lucide-react';
import axios from 'axios';
// import AdminSidebar from '../layout/sidebar';
// import AdminNavbar from '../layout/header';

export default function AdminFeedback() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const statuses = ['', 'pending', 'in-progress', 'resolved', 'closed'];
  const categories = [
    '',
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Complaint',
    'Suggestion',
    'Other'
  ];

  useEffect(() => {
    fetchUserData();
    fetchFeedbacks();
  }, [selectedStatus, selectedCategory, currentPage, searchQuery]);


  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('admintoken');
      const res = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admintoken');

      const params = new URLSearchParams();

      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery); // ✅ ADD THIS
      params.append('page', currentPage);
      params.append('limit', 20);


      const { data } = await axios.get(`${API_URL}/admin/feedback?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedbacks(data.feedbacks || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
     const token = localStorage.getItem('admintoken');

      await axios.put(`${API_URL}/admin/feedback/${id}`,
        { status, response: adminResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Feedback status updated to ${status}!`);
      setAdminResponse('');
      fetchFeedbacks();
      setShowDetailModal(false);
    } catch (error) {
      alert('Failed to update feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback permanently?')) return;

    try {
      const token = localStorage.getItem('admintoken');

      await axios.delete(`${API_URL}/admin/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Feedback deleted!');
      fetchFeedbacks();
      setShowDetailModal(false);
    } catch (error) {
      alert('Failed to delete feedback');
    }
  };

  const openDetail = async (feedback) => {
    try {
      const token = localStorage.getItem('admintoken');

      const { data } = await axios.get(`${API_URL}/admin/feedback/${feedback._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedFeedback(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'text-gray-600';
      case 'Medium':
        return 'text-blue-600';
      case 'High':
        return 'text-orange-600';
      case 'Urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}

      <div className="flex-1 overflow-auto">
        {/* <AdminNavbar onMenuClick={() => setSidebarOpen(true)} user={user} /> */}

        {/* Detail Modal */}
        {showDetailModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">Feedback Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Category */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFeedback.status)}`}>
                    {getStatusIcon(selectedFeedback.status)}
                    <span className="capitalize">{selectedFeedback.status}</span>
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {selectedFeedback.category}
                  </span>
                  <span className={`px-3 py-1 bg-gray-100 rounded-full text-sm font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority} Priority
                  </span>
                </div>

                {/* Subject */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedFeedback.subject}</h3>
                  <p className="text-sm text-gray-600">
                    From: {selectedFeedback.user?.name} ({selectedFeedback.user?.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted: {getTimeAgo(selectedFeedback.createdAt)}
                  </p>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                {/* Rating */}
                {selectedFeedback.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < selectedFeedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                )}

                {/* Existing Admin Response */}
                {selectedFeedback.adminResponse && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <p className="font-medium text-blue-900">Admin Response</p>
                    </div>
                    <p className="text-gray-700 mb-2">{selectedFeedback.adminResponse.message}</p>
                    <p className="text-xs text-gray-600">
                      Responded by {selectedFeedback.adminResponse.respondedBy?.name || 'Admin'} • {getTimeAgo(selectedFeedback.adminResponse.respondedAt)}
                    </p>
                  </div>
                )}

                {/* Admin Response Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedFeedback.adminResponse ? 'Update Response' : 'Add Response'}
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    placeholder="Type your response to the user..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'in-progress')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Clock className="w-4 h-4" />
                    <span>In Progress</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'resolved')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolved</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'closed')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedFeedback._id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-sm text-gray-600 mt-1">Review and respond to user feedback</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border text-black border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {statuses.slice(1).map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status.replace('-', ' ')}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Feedback List */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No feedback found</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {feedback.subject}
                            </h3>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                              {getStatusIcon(feedback.status)}
                              <span className="capitalize">{feedback.status.replace('-', ' ')}</span>

                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              {feedback.category}
                            </span>
                            <span className={`px-2 py-1 bg-gray-100 rounded text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                              {feedback.priority}
                            </span>
                            <span>{feedback.user?.name}</span>
                            <span>{getTimeAgo(feedback.createdAt)}</span>
                            {feedback.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{feedback.rating}/5</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 line-clamp-2 mb-3">{feedback.message}</p>

                          {feedback.adminResponse && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                              <p className="text-sm text-blue-900 font-medium">Admin Response Added</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => openDetail(feedback)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-4"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(7, totalPages))].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg ${currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}