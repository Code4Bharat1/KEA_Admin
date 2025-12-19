'use client';

import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ApproveBlogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch blogs from backend
  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to fetch blogs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleApprove = async (blogId) => {
    if (!confirm('Are you sure you want to approve this blog?')) return;

    setActionLoading(blogId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/blogs/approve/${blogId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBlogs(blogs.map(b => 
        b._id === blogId ? res.data : b
      ));
      
      alert('Blog approved successfully!');
    } catch (err) {
      console.error('Error approving blog:', err);
      alert(err.response?.data?.message || 'Failed to approve blog');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (blogId) => {
    if (!confirm('Are you sure you want to reject this blog?')) return;

    setActionLoading(blogId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/blogs/reject/${blogId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBlogs(blogs.map(b => 
        b._id === blogId ? res.data : b
      ));
      
      alert('Blog rejected successfully!');
    } catch (err) {
      console.error('Error rejecting blog:', err);
      alert(err.response?.data?.message || 'Failed to reject blog');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter blogs based on search and filters
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? blog.status === 'pending' :
      statusFilter === 'approved' ? blog.status === 'published' :
      statusFilter === 'rejected' ? blog.status === 'rejected' : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      published: 'Approved',
      rejected: 'Rejected',
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
          <p className="mt-4 text-white">Loading blogs...</p>
        </div>
      </div>
    );
  }

  const pendingCount = blogs.filter(b => b.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Approve Blogs</h1>
        <p className="text-sm text-blue-200">Review and approve blog posts submitted by members.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-lg text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
          >
            <option value="all">All categories</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Civil">Civil</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Electronics">Electronics</option>
            <option value="Architecture">Architecture</option>
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

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Blogs awaiting review</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {filteredBlogs.length} of {blogs.length} blogs</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No blogs found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Blog Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
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
                {filteredBlogs.map((blog) => {
                  const statusBadge = getStatusBadge(blog.status);
                  return (
                    <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/blogs/${blog._id}`}
                          className="text-sm font-medium text-[#0D2847] hover:text-[#0A1929] hover:underline transition-colors line-clamp-2"
                        >
                          {blog.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{blog.author?.name || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{blog.category || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {new Date(blog.createdAt).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {blog.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(blog._id)}
                                disabled={actionLoading === blog._id}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === blog._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(blog._id)}
                                disabled={actionLoading === blog._id}
                                className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/admin/blogs/${blog._id}`}
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
        {filteredBlogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing 1 of {Math.ceil(filteredBlogs.length / 10)} pages
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm bg-[#0D2847] text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  2
                </button>
                <span className="px-2 text-sm text-gray-400">...</span>
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