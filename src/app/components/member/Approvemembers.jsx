'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch pending members from backend
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(`${API_URL}/admin/members/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // console.log("Fetched members:", response.data);
      setMembers(response.data);
      // console.log("Members: ", members);
      

    } catch (error) {
      console.error("Failed to fetch members:", error);

      if (error.response?.status === 403) {
        alert("Session expired. Login again.");
        window.location.href = "/";
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();    
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-xl text-gray-600">
        Loading members...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border rounded-lg text-gray-900"
          >
            <option value="all">All categories</option>
            <option value="software">Software Engineering</option>
            <option value="civil">Civil Engineering</option>
            <option value="electrical">Electrical Engineering</option>
            <option value="mechanical">Mechanical Engineering</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border rounded-lg text-gray-900"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Member Directory</h2>
          <p className="text-sm text-gray-500">{members.length} members found</p>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/members/${m._id}`} className="font-medium text-gray-900 hover:text-blue-700">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.category || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      m.membershipStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : m.membershipStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y">
          {members.map((m) => (
            <div key={m._id} className="p-4 hover:bg-gray-50 transition">
              <Link href={`/admin/members/${m._id}`}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-600">{m.category || "—"}</p>
                  </div>

                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    m.membershipStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : m.membershipStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {m.membershipStatus}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <p>Email: {m.email}</p>
                  <p>Joined: {new Date(m.createdAt).toLocaleDateString()}</p>
                  <p>Role: {m.role}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
