'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Calendar, MapPin, Users, Clock, Plus, Edit, Trash2, Eye, 
  CheckCircle, XCircle, Video, Building
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminSeminarsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [seminars, setSeminars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState(null);
  const [selectedSeminars, setSelectedSeminars] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [newSeminar, setNewSeminar] = useState({
    title: '', category: '', date: '', time: '', duration: '', venue: '',
    organizer: '', speaker: '', description: '', topics: '', targetAudience: '',
    registrationLink: '', maxAttendees: '', status: 'upcoming'
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Fetch data when filters or page change
  useEffect(() => {
    fetchSeminars();
  }, [selectedCategory, selectedStatus, searchQuery, currentPage]);

  // Fetch categories and stats on mount
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus); // Fixed: Server-side filtering
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 20);

      const { data } = await axios.get(`${API_URL}/seminars?${params.toString()}`);
      setSeminars(data.seminars || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching seminars:', error);
      alert('Failed to fetch seminars');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/seminars/categories/stats`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fixed: Use optimized stats endpoint
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/seminars/stats`);
      setStats({
        total: data.total || 0,
        upcoming: data.upcoming || 0,
        ongoing: data.ongoing || 0,
        completed: data.completed || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateSeminar = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const data = { 
        ...newSeminar, 
        topics: newSeminar.topics.split(',').map(t => t.trim()).filter(Boolean) 
      };
      await axios.post(`${API_URL}/seminars/`, data, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      resetForm();
      fetchSeminars();
      fetchStats();
      alert('Seminar created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create seminar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSeminar = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const data = { 
        ...editingSeminar, 
        topics: Array.isArray(editingSeminar.topics) 
          ? editingSeminar.topics 
          : editingSeminar.topics.split(',').map(t => t.trim()).filter(Boolean)
      };
      await axios.put(`${API_URL}/seminars/${editingSeminar._id}`, data, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setEditingSeminar(null);
      fetchSeminars();
      fetchStats();
      alert('Seminar updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update seminar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this seminar?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/seminars/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSeminars();
      fetchStats();
      alert('Seminar deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete seminar');
    } finally {
      setActionLoading(false);
    }
  };

  // Fixed: Use bulk delete endpoint
  const handleBulkDelete = async () => {
    if (selectedSeminars.length === 0) return alert('Please select seminars to delete');
    if (!confirm(`Delete ${selectedSeminars.length} seminar(s)?`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/seminars/bulk`, {
        data: { ids: selectedSeminars },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSeminars([]);
      fetchSeminars();
      fetchStats();
      alert('Seminars deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete seminars');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setNewSeminar({
      title: '', category: '', date: '', time: '', duration: '', venue: '',
      organizer: '', speaker: '', description: '', topics: '', targetAudience: '',
      registrationLink: '', maxAttendees: '', status: 'upcoming'
    });
  };

  const toggleSelect = (id) => {
    setSelectedSeminars(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedSeminars(
      selectedSeminars.length === seminars.length ? [] : seminars.map(s => s._id)
    );
  };

  const getStatusColor = (status) => {
    const colors = { 
      upcoming: 'bg-blue-100 text-blue-700', 
      ongoing: 'bg-green-100 text-green-700', 
      completed: 'bg-gray-100 text-gray-700', 
      cancelled: 'bg-red-100 text-red-700' 
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Fixed: Proper color mapping for Tailwind
  const statColors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', textBold: 'text-blue-900', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', textBold: 'text-green-900', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', textBold: 'text-purple-900', icon: 'text-purple-600' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-600', textBold: 'text-gray-900', icon: 'text-gray-600' }
  };

  const categories_list = [
    'Seminars & Webinars', 
    'Workshops', 
    'Conferences', 
    'Training Programs', 
    'Technical Talks', 
    'Panel Discussions'
  ];

  const statsData = [
    { label: 'Total', value: stats.total, icon: Calendar, color: 'blue' },
    { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'green' },
    { label: 'Ongoing', value: stats.ongoing, icon: Video, color: 'purple' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'gray' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seminars & Webinars Management</h1>
            <p className="text-sm text-gray-600 mt-1">Create, manage, and monitor all events</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)} 
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>

        {/* Stats - Fixed dynamic classes */}
        <div className="grid grid-cols-4 gap-4">
          {statsData.map(({ label, value, icon: Icon, color }) => {
            const colors = statColors[color];
            return (
              <div key={label} className={`${colors.bg} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${colors.text} font-medium`}>{label}</p>
                    <p className={`text-2xl font-bold ${colors.textBold} mt-1`}>{value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create Seminar</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                disabled={actionLoading}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateSeminar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input 
                    required 
                    value={newSeminar.title} 
                    onChange={(e) => setNewSeminar({...newSeminar, title: e.target.value})} 
                    placeholder="Workshop title" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select 
                    required 
                    value={newSeminar.category} 
                    onChange={(e) => setNewSeminar({...newSeminar, category: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    {categories_list.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select 
                    value={newSeminar.status} 
                    onChange={(e) => setNewSeminar({...newSeminar, status: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input 
                    required 
                    type="date" 
                    value={newSeminar.date} 
                    onChange={(e) => setNewSeminar({...newSeminar, date: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <input 
                    required 
                    type="time" 
                    value={newSeminar.time} 
                    onChange={(e) => setNewSeminar({...newSeminar, time: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Venue *</label>
                  <input 
                    required 
                    value={newSeminar.venue} 
                    onChange={(e) => setNewSeminar({...newSeminar, venue: e.target.value})} 
                    placeholder="Location" 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organizer *</label>
                  <input 
                    required 
                    value={newSeminar.organizer} 
                    onChange={(e) => setNewSeminar({...newSeminar, organizer: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea 
                    required 
                    value={newSeminar.description} 
                    onChange={(e) => setNewSeminar({...newSeminar, description: e.target.value})} 
                    rows={4} 
                    className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none" 
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Creating...' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  disabled={actionLoading}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSeminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Seminar</h2>
              <button 
                onClick={() => setShowEditModal(false)} 
                disabled={actionLoading}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpdateSeminar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input 
                  value={editingSeminar.title} 
                  onChange={(e) => setEditingSeminar({...editingSeminar, title: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select 
                  value={editingSeminar.status} 
                  onChange={(e) => setEditingSeminar({...editingSeminar, status: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  value={editingSeminar.description} 
                  onChange={(e) => setEditingSeminar({...editingSeminar, description: e.target.value})} 
                  rows={4} 
                  className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  disabled={actionLoading}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search seminars..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="px-4 py-2 border rounded-lg focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.name !== 'All').map(c => 
                  <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                )}
              </select>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)} 
                className="px-4 py-2 border rounded-lg focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {selectedSeminars.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">{selectedSeminars.length} selected</span>
                <button 
                  onClick={handleBulkDelete} 
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Selected'}
                </button>
                <button 
                  onClick={() => setSelectedSeminars([])} 
                  className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedSeminars.length === seminars.length && seminars.length > 0} 
                      onChange={toggleSelectAll} 
                      className="w-4 h-4 rounded" 
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Seminar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Attendees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading seminars...</p>
                    </td>
                  </tr>
                ) : seminars.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      No seminars found
                    </td>
                  </tr>
                ) : (
                  seminars.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedSeminars.includes(s._id)} 
                          onChange={() => toggleSelect(s._id)} 
                          className="w-4 h-4 rounded" 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.title}</div>
                        <div className="text-sm text-gray-500">{s.organizer}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(s.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {s.attendees?.length || 0} / {s.maxAttendees || '∞'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => router.push(`/admin/seminars/${s._id}`)} 
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { 
                              setEditingSeminar(s); 
                              setShowEditModal(true); 
                            }} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(s._id)} 
                            disabled={actionLoading}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || loading} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || loading} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}