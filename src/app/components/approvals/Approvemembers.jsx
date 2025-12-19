'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ApproveMembers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch members from backend
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error('Error fetching members:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        // Redirect to login if needed
      } else {
        alert('Failed to fetch members');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleApprove = async (memberId) => {
    if (!confirm('Are you sure you want to approve this member?')) return;

    setActionLoading(memberId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.patch(
        `${API_URL}/admin/members/${memberId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with response data
      setMembers(members.map(m => 
        m._id === memberId ? res.data : m
      ));
      
      alert('Member approved successfully!');
    } catch (err) {
      console.error('Error approving member:', err);
      alert(err.response?.data?.message || 'Failed to approve member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (memberId) => {
    if (!confirm('Are you sure you want to reject this member? This action cannot be undone.')) return;

    setActionLoading(memberId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.patch(
        `${API_URL}/admin/members/${memberId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with response data
      setMembers(members.map(m => 
        m._id === memberId ? res.data : m
      ));
      
      alert('Member rejected successfully!');
    } catch (err) {
      console.error('Error rejecting member:', err);
      alert(err.response?.data?.message || 'Failed to reject member');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? member.membershipStatus === 'pending' :
      statusFilter === 'approved' ? member.membershipStatus === 'active' :
      statusFilter === 'rejected' ? member.membershipStatus === 'inactive' : true;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending review',
      active: 'Approved',
      inactive: 'Rejected',
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
          <p className="mt-4 text-white">Loading members...</p>
        </div>
      </div>
    );
  }

  const pendingCount = members.filter(m => m.membershipStatus === 'pending').length;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Approve Members</h1>
        <p className="text-sm text-blue-200">Review and approve pending member profiles across KEA.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or member ID..."
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

      {/* Member Approvals Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Table Header Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Member Approvals</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Showing {filteredMembers.length} of {members.length} members
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No members found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Headline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
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
                {filteredMembers.map((member) => {
                  const statusBadge = getStatusBadge(member.membershipStatus);
                  return (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{member.memberId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/members/${member._id}`}
                          className="text-sm font-medium text-[#0D2847] hover:text-[#0A1929] hover:underline transition-colors"
                        >
                          {member.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{member.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {member.profile?.headline || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {member.profile?.location || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {member.membershipStatus === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(member._id)}
                                disabled={actionLoading === member._id}
                                className="px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === member._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(member._id)}
                                disabled={actionLoading === member._id}
                                className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === member._id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/admin/members/${member._id}`}
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
        {filteredMembers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total: {filteredMembers.length} members
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50">
                  Prev
                </button>
                <button className="px-3 py-1.5 text-sm bg-[#0D2847] text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50">
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