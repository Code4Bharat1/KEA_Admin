'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminGallery() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fallback URL agar env variable nahi mila
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7101/api';

  const categories = [
    'All photos',
    'Event Category',
    'Project Showcase',
    'Member Activities',
    'Good Wishes'
  ];

  // Check if token exists
  const checkAuth = () => {
    // Try both token keys - adminToken and token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      router.push('/');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkAuth()) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (checkAuth()) {
      fetchGallery();
    }
  }, [selectedCategory, searchQuery, currentPage, filterStatus]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        alert('Session expired. Please login again.');
        router.push('/');
      }
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }

      const params = new URLSearchParams();
      
      if (selectedCategory !== 'All photos') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Backend ko status filter bhejo
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      params.append('page', currentPage);
      params.append('limit', 12);

      const url = `${API_URL}/admin/gallery?${params.toString()}`;
      // console.log('🔍 Fetching gallery from:', url);
      // console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // console.log('✅ Gallery data received:', {
      //   items: data.items?.length,
      //   total: data.pagination?.total,
      //   rawData: data
      // });

      setItems(data.items || []);
      setTotalPages(data.pagination?.pages || 1);
      
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        alert('Session expired. Please login again.');
        router.push('/');
      } else if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment.');
      } else {
        alert('Failed to fetch gallery items');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this gallery item?')) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/gallery/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item approved!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        router.push('/');
      } else {
        alert('Failed to approve item');
      }
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject and delete this gallery item? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/gallery/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item rejected and deleted!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        router.push('/');
      } else {
        alert('Failed to reject item');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this gallery item permanently?')) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item deleted!');
      fetchGallery();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        router.push('/');
      } else {
        alert('Failed to delete item');
      }
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 overflow-auto">
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Fixed Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gallery Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Image Container */}
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.isApproved ? (
                    <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden sm:inline">Approved</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                      <XCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="hidden sm:inline">Pending</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedItem.title}</h3>
                  {selectedItem.description && (
                    <p className="text-sm sm:text-base text-gray-700 mb-4">{selectedItem.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Tag className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Category:</span>
                    <span className="truncate">{selectedItem.category}</span>
                  </div>

                  {selectedItem.location && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Location:</span>
                      <span className="truncate">{selectedItem.location}</span>
                    </div>
                  )}

                  {selectedItem.eventDate && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Date:</span>
                      <span className="truncate">{new Date(selectedItem.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">By:</span>
                    <span className="truncate">{selectedItem.uploadedBy?.name || 'Unknown'}</span>
                  </div>
                </div>

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

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedItem.likes?.length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Likes</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedItem.comments?.length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Comments</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Uploaded</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{getTimeAgo(selectedItem.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  {!selectedItem.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApprove(selectedItem._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base font-medium"
                      >
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(selectedItem._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base font-medium"
                      >
                        <XCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDelete(selectedItem._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base font-medium"
                    >
                      <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and moderate gallery photos</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border text-black border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search photos..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 sm:p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
                <ImageIcon className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No gallery items found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => openDetail(item)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      <div className="absolute top-2 right-2">
                        {item.isApproved ? (
                          <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-yellow-500 text-white rounded-full text-xs">
                            <XCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                          <h3 className="text-white font-medium text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-white text-xs truncate">
                              {item.uploadedBy?.name}
                            </span>
                            <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                              <Eye className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6 sm:mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 sm:w-10 h-8 sm:h-10 text-sm sm:text-base rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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