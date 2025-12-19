'use client';

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  MapPin,
  User,
  Tag
} from 'lucide-react';
import axios from 'axios';
// import AdminSidebar from '../layout/sidebar';
// import AdminNavbar from '../layout/header';

export default function AdminGallery() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const categories = [
    'All photos',
    'Event Category',
    'Project Showcase',
    'Member Activities',
    'Good Wishes'
  ];

  useEffect(() => {
    fetchUserData();
    fetchGallery();
  }, [selectedCategory, searchQuery, currentPage, filterStatus]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'All photos') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 12);

      const { data } = await axios.get(`${API_URL}/admin/gallery?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let filteredItems = data.items || [];
      
      if (filterStatus === 'approved') {
        filteredItems = filteredItems.filter(item => item.isApproved);
      } else if (filterStatus === 'pending') {
        filteredItems = filteredItems.filter(item => !item.isApproved);
      }

      setItems(filteredItems);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this gallery item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/gallery/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item approved!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      alert('Failed to approve item');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject and delete this gallery item? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/gallery/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item rejected and deleted!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      alert('Failed to reject item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this gallery item permanently?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item deleted!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
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
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">Gallery Item Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {selectedItem.isApproved ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Pending Approval
                    </span>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.title}</h3>
                  {selectedItem.description && (
                    <p className="text-gray-700 mb-4">{selectedItem.description}</p>
                  )}
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">Category:</span>
                    <span>{selectedItem.category}</span>
                  </div>

                  {selectedItem.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Location:</span>
                      <span>{selectedItem.location}</span>
                    </div>
                  )}

                  {selectedItem.eventDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Event Date:</span>
                      <span>{new Date(selectedItem.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Uploaded by:</span>
                    <span>{selectedItem.uploadedBy?.name || 'Unknown'}</span>
                  </div>
                </div>

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{selectedItem.likes?.length || 0}</p>
                      <p className="text-sm text-gray-600">Likes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{selectedItem.comments?.length || 0}</p>
                      <p className="text-sm text-gray-600">Comments</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uploaded</p>
                      <p className="text-sm font-medium text-gray-900">{getTimeAgo(selectedItem.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!selectedItem.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApprove(selectedItem._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(selectedItem._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Reject & Delete</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDelete(selectedItem._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  )}
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
              <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and moderate gallery photos</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search photos..."
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No gallery items found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {item.isApproved ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs">
                            <XCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-white text-xs">
                              {item.uploadedBy?.name}
                            </span>
                            <button
                              onClick={() => openDetail(item)}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
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
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === i + 1
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