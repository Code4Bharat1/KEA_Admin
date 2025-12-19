'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const res = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data.stats);
      setActivities(res.data.activities || []);
      setChartData(res.data.chartData || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-20 text-xl text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      change: 'All registered users',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      change: 'Members, jobs, blogs, events',
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      change: 'All job postings',
    },
    {
      title: 'Blogs Submitted',
      value: stats.blogs,
      change: 'All blog entries',
    },
  ];

  return (
    <div className="w-full space-y-6">

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border p-6 shadow hover:shadow-xl transition"
          >
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {stat.value}
            </h3>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* ===== GRAPH + ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== GRAPH ===== */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6 shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold">Members Growth (Last 30 Days)</h2>
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <TrendingUp className="w-10 h-10 text-gray-300" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0D2847"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ===== ACTIVITY LOG ===== */}
        <div className="bg-white rounded-lg border p-6 shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold">Activity Log</h2>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">
              No recent activity found.
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="border-b pb-3 last:border-0"
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.time).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
