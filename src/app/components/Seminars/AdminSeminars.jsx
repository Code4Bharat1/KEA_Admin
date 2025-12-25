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

  useEffect(() => {
    fetchSeminars();
    fetchCategories();
    fetchStats();
  }, [selectedCategory, selectedStatus, searchQuery, currentPage]);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 20);

      const { data } = await axios.get(`${API_URL}/seminars?${params.toString()}`);
      let filtered = data.seminars || [];
      if (selectedStatus !== 'all') filtered = filtered.filter(s => s.status === selectedStatus);
      setSeminars(filtered);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/seminars/categories/stats`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/seminars?limit=1000`);
      const all = data.seminars || [];
      setStats({
        total: all.length,
        upcoming: all.filter(s => s.status === 'upcoming').length,
        ongoing: all.filter(s => s.status === 'ongoing').length,
        completed: all.filter(s => s.status === 'completed').length
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateSeminar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const data = { ...newSeminar, topics: newSeminar.topics.split(',').map(t => t.trim()).filter(Boolean) };
      await axios.post(`${API_URL}/seminars`, data, { headers: { Authorization: `Bearer ${token}` }});
      setShowCreateModal(false);
      resetForm();
      fetchSeminars();
      fetchStats();
      alert('Seminar created!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  const handleUpdateSeminar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const data = { 
        ...editingSeminar, 
        topics: Array.isArray(editingSeminar.topics) ? editingSeminar.topics : editingSeminar.topics.split(',').map(t => t.trim()).filter(Boolean)
      };
      await axios.put(`${API_URL}/seminars/${editingSeminar._id}`, data, { headers: { Authorization: `Bearer ${token}` }});
      setShowEditModal(false);
      setEditingSeminar(null);
      fetchSeminars();
      fetchStats();
      alert('Updated!');
    } catch (error) {
      alert('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`${API_URL}/seminars/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      fetchSeminars();
      fetchStats();
      alert('Deleted!');
    } catch (error) {
      alert('Failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSeminars.length === 0) return alert('Select seminars');
    if (!confirm(`Delete ${selectedSeminars.length}?`)) return;
    try {
      const token = localStorage.getItem('userToken');
      await Promise.all(selectedSeminars.map(id => axios.delete(`${API_URL}/seminars/${id}`, { headers: { Authorization: `Bearer ${token}` }})));
      setSelectedSeminars([]);
      fetchSeminars();
      fetchStats();
      alert('Deleted!');
    } catch (error) {
      alert('Failed');
    }
  };

  const resetForm = () => {
    setNewSeminar({
      title: '', category: '', date: '', time: '', duration: '', venue: '',
      organizer: '', speaker: '', description: '', topics: '', targetAudience: '',
      registrationLink: '', maxAttendees: '', status: 'upcoming'
    });
  };

  const toggleSelect = (id) => setSelectedSeminars(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedSeminars(selectedSeminars.length === seminars.length ? [] : seminars.map(s => s._id));

  const getStatusColor = (status) => {
    const colors = { upcoming: 'bg-blue-100 text-blue-700', ongoing: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const categories_list = ['Seminars & Webinars', 'Workshops', 'Conferences', 'Training Programs', 'Technical Talks', 'Panel Discussions'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seminars & Webinars Management</h1>
            <p className="text-sm text-gray-600 mt-1">Create, manage, and monitor all events</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Plus className="w-4 h-4" /><span>Create</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Calendar, color: 'blue' },
            { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'green' },
            { label: 'Ongoing', value: stats.ongoing, icon: Video, color: 'purple' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'gray' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-${color}-600 font-medium`}>{label}</p>
                  <p className={`text-2xl font-bold text-${color}-900 mt-1`}>{value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-600`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create Seminar</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleCreateSeminar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input required value={newSeminar.title} onChange={(e) => setNewSeminar({...newSeminar, title: e.target.value})} placeholder="Workshop title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select required value={newSeminar.category} onChange={(e) => setNewSeminar({...newSeminar, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    {categories_list.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select value={newSeminar.status} onChange={(e) => setNewSeminar({...newSeminar, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input required type="date" value={newSeminar.date} onChange={(e) => setNewSeminar({...newSeminar, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <input required type="time" value={newSeminar.time} onChange={(e) => setNewSeminar({...newSeminar, time: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Venue *</label>
                  <input required value={newSeminar.venue} onChange={(e) => setNewSeminar({...newSeminar, venue: e.target.value})} placeholder="Location" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organizer *</label>
                  <input required value={newSeminar.organizer} onChange={(e) => setNewSeminar({...newSeminar, organizer: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea required value={newSeminar.description} onChange={(e) => setNewSeminar({...newSeminar, description: e.target.value})} rows={4} className="w-full px-4 py-2 border rounded-lg resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
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
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleUpdateSeminar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input value={editingSeminar.title} onChange={(e) => setEditingSeminar({...editingSeminar, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select value={editingSeminar.status} onChange={(e) => setEditingSeminar({...editingSeminar, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={editingSeminar.description} onChange={(e) => setEditingSeminar({...editingSeminar, description: e.target.value})} rows={4} className="w-full px-4 py-2 border rounded-lg resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
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
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option value="all">All Categories</option>
                {categories.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {selectedSeminars.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">{selectedSeminars.length} selected</span>
                <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">Delete</button>
                <button onClick={() => setSelectedSeminars([])} className="ml-auto text-sm text-gray-600">Clear</button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selectedSeminars.length === seminars.length && seminars.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
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
                  <tr><td colSpan="7" className="px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                ) : seminars.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">No seminars</td></tr>
                ) : (
                  seminars.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedSeminars.includes(s._id)} onChange={() => toggleSelect(s._id)} className="w-4 h-4 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.title}</div>
                        <div className="text-sm text-gray-500">{s.organizer}</div>
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{s.category}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{s.attendees?.length || 0} / {s.maxAttendees || '∞'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${getStatusColor(s.status)}`}>{s.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/admin/seminars/${s._id}`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingSeminar(s); setShowEditModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}