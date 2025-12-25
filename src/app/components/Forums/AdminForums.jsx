'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus,
  MessageSquare,
  Pin,
  Lock,
  Trash2,
  Edit,
  Eye,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  Filter,
  MoreVertical,
  X,
  Check
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminForumsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pinned: 0,
    locked: 0,
    reported: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pinned, locked, reported
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedThreads, setSelectedThreads] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingThread, setEditingThread] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchThreads();
    fetchCategories();
    fetchStats();
  }, [selectedCategory, searchQuery, filterStatus, currentPage]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('page', currentPage);
      params.append('limit', 20);

      const { data } = await axios.get(`${API_URL}/forums?${params.toString()}`);
      
      let filteredThreads = data.threads || [];
      if (filterStatus === 'pinned') {
        filteredThreads = filteredThreads.filter(t => t.isPinned);
      } else if (filterStatus === 'locked') {
        filteredThreads = filteredThreads.filter(t => t.isLocked);
      }
      
      setThreads(filteredThreads);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/forums/categories/stats`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/forums?limit=1000`);
      const allThreads = data.threads || [];
      setStats({
        total: allThreads.length,
        pinned: allThreads.filter(t => t.isPinned).length,
        locked: allThreads.filter(t => t.isLocked).length,
        reported: 0 // Placeholder for future reporting feature
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedThreads.length === 0) {
      alert('Please select threads first');
      return;
    }

    const token = localStorage.getItem('userToken');
    
    try {
      if (action === 'delete') {
        if (!confirm(`Delete ${selectedThreads.length} thread(s)? This cannot be undone.`)) {
          return;
        }
        await Promise.all(
          selectedThreads.map(id => 
            axios.delete(`${API_URL}/forums/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        alert('Threads deleted successfully');
      } else if (action === 'pin' || action === 'unpin') {
        await Promise.all(
          selectedThreads.map(id => 
            axios.patch(`${API_URL}/forums/${id}/pin`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
      } else if (action === 'lock' || action === 'unlock') {
        await Promise.all(
          selectedThreads.map(id => 
            axios.patch(`${API_URL}/forums/${id}/lock`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
      }
      
      setSelectedThreads([]);
      fetchThreads();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} threads`);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!confirm('Delete this thread? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`${API_URL}/forums/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchThreads();
      fetchStats();
      alert('Thread deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete thread');
    }
  };

  const handleTogglePin = async (threadId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.patch(`${API_URL}/forums/${threadId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchThreads();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to pin thread');
    }
  };

  const handleToggleLock = async (threadId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.patch(`${API_URL}/forums/${threadId}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchThreads();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to lock thread');
    }
  };

  const handleEditThread = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      await axios.put(`${API_URL}/forums/${editingThread._id}`, {
        title: editingThread.title,
        content: editingThread.content,
        category: editingThread.category,
        tags: editingThread.tags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowEditModal(false);
      setEditingThread(null);
      fetchThreads();
      alert('Thread updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update thread');
    }
  };

  const toggleThreadSelection = (threadId) => {
    setSelectedThreads(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedThreads.length === threads.length) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(threads.map(t => t._id));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forums Management</h1>
              <p className="text-sm text-gray-600 mt-1">Moderate threads, manage categories, and oversee community discussions</p>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Threads</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Pinned</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{stats.pinned}</p>
                </div>
                <Pin className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Locked</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{stats.locked}</p>
                </div>
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Reported</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{stats.reported}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Thread Modal */}
      {showEditModal && editingThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Thread</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditThread} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingThread.title}
                  onChange={(e) => setEditingThread({...editingThread, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editingThread.category}
                  onChange={(e) => setEditingThread({...editingThread, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c.name !== 'All discussions').map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editingThread.content}
                  onChange={(e) => setEditingThread({...editingThread, content: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.name !== 'All discussions').map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pinned">Pinned Only</option>
                <option value="locked">Locked Only</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedThreads.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">{selectedThreads.length} selected</span>
                <button
                  onClick={() => handleBulkAction('pin')}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                >
                  Pin
                </button>
                <button
                  onClick={() => handleBulkAction('lock')}
                  className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
                >
                  Lock
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedThreads([])}
                  className="ml-auto px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Threads Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedThreads.length === threads.length && threads.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thread</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Replies</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Activity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : threads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      No threads found
                    </td>
                  </tr>
                ) : (
                  threads.map((thread) => (
                    <tr key={thread._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedThreads.includes(thread._id)}
                          onChange={() => toggleThreadSelection(thread._id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {thread.isPinned && <Pin className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                          {thread.isLocked && <Lock className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                          <button
                            onClick={() => router.push(`/admin/forums/${thread._id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left line-clamp-2"
                          >
                            {thread.title}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {thread.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{thread.author?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-900 font-medium">{thread.replies?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-900 font-medium">{thread.views || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {thread.isPinned && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Pinned</span>
                          )}
                          {thread.isLocked && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Locked</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{getTimeAgo(thread.lastActivity || thread.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/forums/${thread._id}`)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="View thread"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingThread(thread);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit thread"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePin(thread._id)}
                            className={`p-1.5 rounded ${
                              thread.isPinned ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={thread.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(thread._id)}
                            className={`p-1.5 rounded ${
                              thread.isLocked ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={thread.isLocked ? 'Unlock' : 'Lock'}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteThread(thread._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete thread"
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
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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