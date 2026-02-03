'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Search,
  FileText,
  Video,
  Link2,
  Image,
  X,
  Plus,
  Upload,
  Loader,
  Filter,
  ChevronDown,
  Eye,
  Check,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Download
} from 'lucide-react';

import axios from 'axios';

export default function AdminKnowledgeHub() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All resources');
  const [selectedStatus, setSelectedStatus] = useState('All status');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [uploadType, setUploadType] = useState('link');
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [newResource, setNewResource] = useState({
    title: '',
    category: '',
    format: '',
    tags: '',
    link: '',
    description: '',
    author: ''
  });

  const [file, setFile] = useState(null);

  const statusOptions = [
    { name: 'All status', value: 'all' },
    { name: 'Pending Review', value: 'pending' },
    { name: 'Approved', value: 'approved' },
    { name: 'Rejected', value: 'rejected' }
  ];

  useEffect(() => {
    fetchUserData();
    fetchResources();
    fetchCategories();
    fetchStats();
  }, [selectedCategory, selectedStatus, searchQuery, currentPage]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'All resources') {
        params.append('category', selectedCategory);
      }
      if (selectedStatus !== 'All status') {
        const statusValue = statusOptions.find(s => s.name === selectedStatus)?.value;
        if (statusValue && statusValue !== 'all') {
          params.append('status', statusValue);
        }
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('page', currentPage);
      params.append('limit', 10);

      const { data } = await axios.get(`${API_URL}/admin/resources?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResources(data.resources);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

// COMPLETE FIXED FRONTEND CODE
// Replace your fetch functions with these corrected versions:

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    // ✅ FIX 1: Changed from /stats to /categories/stats
    const { data } = await axios.get(`${API_URL}/admin/resources/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCategories(data.categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    // ✅ FIX 2: Added missing slash before 'admin'
    const { data } = await axios.get(`${API_URL}/admin/resources/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(data.stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const handleApprove = async (resourceId) => {
  if (!confirm('Are you sure you want to approve this resource?')) return;
  
  setActionLoading(resourceId);
  try {
    const token = localStorage.getItem('adminToken');
    // ✅ FIX 3: Added empty object {} as second parameter, removed misplaced closing parenthesis
    await axios.patch(`${API_URL}/admin/resources/${resourceId}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    alert('Resource approved successfully!');
    fetchResources();
    fetchStats();
    setShowViewModal(false);
  } catch (error) {
    console.error('Error approving resource:', error);
    alert(error.response?.data?.error || 'Failed to approve resource');
  } finally {
    setActionLoading(null);
  }
};

  const handleReject = async (resourceId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User clicked cancel
    
    setActionLoading(resourceId);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/admin/resources/${resourceId}/reject`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Resource rejected successfully!');
      fetchResources();
      fetchStats();
      setShowViewModal(false);
    } catch (error) {
      console.error('Error rejecting resource:', error);
      alert(error.response?.data?.error || 'Failed to reject resource');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');

      const resourceData = {
        title: newResource.title,
        category: newResource.category,
        format: newResource.format,
        externalLink: newResource.link || undefined,
        tags: Array.isArray(newResource.tags)
          ? newResource.tags
          : typeof newResource.tags === 'string'
          ? newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : [],
        description: newResource.description,
        author: newResource.author || 'Admin',
        status: 'approved' // Admin created resources are auto-approved
      };

      await axios.post(`${API_URL}/resources/admin`, resourceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateModal(false);
      resetForm();
      fetchResources();
      fetchCategories();
      fetchStats();
      alert('Resource created successfully!');
    } catch (error) {
      console.error('Create resource error:', error);
      alert(error.response?.data?.error || 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setLoading(true);
    const formData = new FormData();

    formData.append('file', file);
    formData.append('title', newResource.title);
    formData.append('category', newResource.category);
    formData.append('tags', newResource.tags);
    formData.append('description', newResource.description);
    formData.append('author', newResource.author || 'Admin');
    formData.append('status', 'approved'); // Admin uploads are auto-approved

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/resources/admin/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      setShowCreateModal(false);
      resetForm();
      fetchResources();
      fetchCategories();
      fetchStats();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewResource({
      title: '',
      category: '',
      format: '',
      tags: '',
      link: '',
      description: '',
      author: ''
    });
    setFile(null);
    setUploadType('link');
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setShowViewModal(true);
  };

  const getIconComponent = (format) => {
    const icons = {
      'PDF': FileText,
      'DOCX': FileText,
      'Video': Video,
      'Link': Link2,
      'Images': Image,
      'File': FileText
    };
    return icons[format] || FileText;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const config = badges[status] || badges.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 texxt-white">
      {/* View Resource Modal */}
      {showViewModal && selectedResource && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Resource Details</h2>
                {getStatusBadge(selectedResource.status)}
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resource Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                <div className="p-4 bg-blue-50 rounded-xl flex-shrink-0">
                  {(() => {
                    const Icon = getIconComponent(selectedResource.format);
                    return <Icon className="w-8 h-8 text-blue-600" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedResource.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      {selectedResource.format}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      <Tag className="w-4 h-4" />
                      {selectedResource.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Author
                  </label>
                  <p className="text-gray-900 font-medium">{selectedResource.author || 'Anonymous'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedResource.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedResource.submittedBy && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Submitted By</label>
                    <p className="text-gray-900 font-medium">
                      {selectedResource.submittedBy.name} ({selectedResource.submittedBy.email})
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedResource.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedResource.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Link */}
              {selectedResource.externalLink && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Resource Link</label>
                  <a
                    href={selectedResource.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Resource
                  </a>
                </div>
              )}

              {/* File Info */}
              {selectedResource.wasabiKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">File Information</label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">File Name:</span> {selectedResource.wasabiKey.split('/').pop()}
                    </p>
                    {selectedResource.fileSize && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Size:</span> {(selectedResource.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedResource.status === 'rejected' && selectedResource.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700">{selectedResource.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {selectedResource.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedResource._id)}
                      disabled={actionLoading === selectedResource._id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === selectedResource._id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedResource._id)}
                      disabled={actionLoading === selectedResource._id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === selectedResource._id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      Reject
                    </button>
                  </>
                )}
                {selectedResource.status === 'approved' && (
                  <button
                    onClick={() => handleReject(selectedResource._id)}
                    disabled={actionLoading === selectedResource._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading === selectedResource._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Revoke Approval
                  </button>
                )}
                {selectedResource.status === 'rejected' && (
                  <button
                    onClick={() => handleApprove(selectedResource._id)}
                    disabled={actionLoading === selectedResource._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading === selectedResource._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    Approve Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Resource</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadType('link');
                    setNewResource({ ...newResource, format: '' });
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    uploadType === 'link'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadType('file');
                    setNewResource({ ...newResource, format: '' });
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    uploadType === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            <form onSubmit={uploadType === 'link' ? handleCreateResource : handleFileUpload} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g., Bridge Design Checklist"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  >
                    <option value="">Select category</option>
                    <option value="Career guidance">Career guidance</option>
                    <option value="Technical papers">Technical papers</option>
                    <option value="Project reports">Project reports</option>
                    <option value="Workshop & webinars">Workshop & webinars</option>
                    <option value="Templates & checklists">Templates & checklists</option>
                  </select>
                </div>

                {uploadType === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Format <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newResource.format}
                      onChange={(e) => setNewResource({ ...newResource, format: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                    >
                      <option value="">Select format</option>
                      <option value="Link">Link</option>
                      <option value="Video">Video</option>
                    </select>
                  </div>
                )}

                <div className={uploadType === 'link' ? '' : 'sm:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newResource.author}
                    onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                    placeholder="Your name or organization"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                  placeholder="e.g., Template, Civil, Guide"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                />
              </div>

              {uploadType === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Resource Link/URL {newResource.format === 'Link' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="url"
                    required={newResource.format === 'Link'}
                    value={newResource.link}
                    onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                    placeholder="https://example.com/resource"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files[0])}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-900"
                      accept=".pdf,.docx,.doc,.mp4,.jpg,.jpeg,.png"
                    />
                    <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                  {file && (
                    <p className="text-sm text-gray-900 mt-2">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brief description of the resource..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Admin Privilege</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Resources created by admins are automatically approved and visible to all users.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {uploadType === 'link' ? 'Create Resource' : 'Upload File'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Hub Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Review and approve resources submitted by users
                </p>
              </div>
              {/* ✅ Temporarily disabled - Enable after backend setup */}
              {/* <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Resource
              </button> */}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Resources</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative text-black flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, author, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            
          </div>

          {/* Resources Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : resources.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium mb-1">No resources found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                              {(() => {
                                const Icon = getIconComponent(resource.format);
                                return <Icon className="w-4 h-4 text-gray-600" />;
                              })()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {resource.title}
                              </p>
                              {resource.tags && resource.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {resource.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {resource.tags.length > 2 && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      +{resource.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{resource.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{resource.format}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{resource.author || 'Anonymous'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(resource.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(resource.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewResource(resource)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {resource.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(resource._id)}
                                  disabled={actionLoading === resource._id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionLoading === resource._id ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(resource._id)}
                                  disabled={actionLoading === resource._id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reject"
                                >
                                  {actionLoading === resource._id ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && resources.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}