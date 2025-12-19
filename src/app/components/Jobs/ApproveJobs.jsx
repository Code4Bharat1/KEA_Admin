'use client';

import { useState, useEffect } from 'react';
import { Search, Briefcase } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ApproveJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to fetch jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApprove = async (jobId) => {
    if (!confirm('Are you sure you want to approve this job posting?')) return;

    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/jobs/approve/${jobId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setJobs(jobs.map(j => 
        j._id === jobId ? res.data : j
      ));
      
      alert('Job approved successfully!');
    } catch (err) {
      console.error('Error approving job:', err);
      alert(err.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (jobId) => {
    if (!confirm('Are you sure you want to reject this job posting?')) return;

    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/jobs/reject/${jobId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setJobs(jobs.map(j => 
        j._id === jobId ? res.data : j
      ));
      
      alert('Job rejected successfully!');
    } catch (err) {
      console.error('Error rejecting job:', err);
      alert(err.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.postedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? job.status === 'pending' :
      statusFilter === 'approved' ? job.status === 'approved' :
      statusFilter === 'rejected' ? job.status === 'rejected' : true;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
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
          <p className="mt-4 text-white">Loading jobs...</p>
        </div>
      </div>
    );
  }

  const pendingCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Approve Jobs</h1>
        <p className="text-sm text-blue-200">Review and approve job postings submitted by members and partners.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, company, location, or posted by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-lg text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
          >
            <option value="pending">Pending only ({pendingCount})</option>
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Job listings awaiting review</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No jobs found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Experience
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
                {filteredJobs.map((job) => {
                  const statusBadge = getStatusBadge(job.status);
                  return (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/jobs/${job._id}`}
                          className="text-sm font-medium text-[#0D2847] hover:text-[#0A1929] hover:underline transition-colors"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{job.company}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{job.location}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{job.category || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{job.experience || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {job.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(job._id)}
                                disabled={actionLoading === job._id}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === job._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(job._id)}
                                disabled={actionLoading === job._id}
                                className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/admin/jobs/${job._id}`}
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
        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total: {filteredJobs.length} jobs
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  Prev
                </button>
                <button className="px-3 py-1.5 text-sm bg-[#0D2847] text-white rounded">
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