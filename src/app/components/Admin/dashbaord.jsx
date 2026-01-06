'use client';
import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Image, 
  MessageSquare, 
  UserPlus, 
  Wrench, 
  GraduationCap,
  MessageCircle
} from 'lucide-react';
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

      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Session expired. Please login again.');
          window.location.href = '/';
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      console.log('Dashboard Data:', data);
      setStats(data.stats);
      setActivities(data.activities || []);
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // All module cards with their respective icons
  const moduleCards = [
    {
      title: 'Members',
      Icon: Users,
      color: 'bg-blue-500',
      total: stats.members?.total || 0,
      approved: stats.members?.approved || 0,
      pending: stats.members?.pending || 0,
    },
    {
      title: 'Jobs',
      Icon: Briefcase,
      color: 'bg-green-500',
      total: stats.jobs?.total || 0,
      approved: stats.jobs?.approved || 0,
      pending: stats.jobs?.pending || 0,
    },
    {
      title: 'Blogs',
      Icon: FileText,
      color: 'bg-purple-500',
      total: stats.blogs?.total || 0,
      approved: stats.blogs?.approved || 0,
      pending: stats.blogs?.pending || 0,
    },
    {
      title: 'Events',
      Icon: Calendar,
      color: 'bg-red-500',
      total: stats.events?.total || 0,
      approved: stats.events?.approved || 0,
      pending: stats.events?.pending || 0,
    },
    {
      title: 'Gallery',
      Icon: Image,
      color: 'bg-pink-500',
      total: stats.gallery?.total || 0,
      approved: stats.gallery?.approved || 0,
      pending: stats.gallery?.pending || 0,
    },
    {
      title: 'Feedbacks',
      Icon: MessageCircle,
      color: 'bg-yellow-500',
      total: stats.feedback?.total || 0,
      approved: stats.feedback?.resolved || 0,
      pending: stats.feedback?.pending || 0,
    },
    {
      title: 'Groups',
      Icon: UserPlus,
      color: 'bg-indigo-500',
      total: stats.groups?.total || 0,
      approved: stats.groups?.approved || 0,
      pending: stats.groups?.pending || 0,
    },
    {
      title: 'Forums',
      Icon: MessageSquare,
      color: 'bg-teal-500',
      total: stats.forums?.total || 0,
      approved: stats.forums?.approved || 0,
      pending: stats.forums?.pending || 0,
    },
    {
      title: 'Seminars',
      Icon: GraduationCap,
      color: 'bg-orange-500',
      total: stats.seminars?.total || 0,
      approved: stats.seminars?.approved || 0,
      pending: stats.seminars?.pending || 0,
    },
    {
      title: 'Tools',
      Icon: Wrench,
      color: 'bg-cyan-500',
      total: stats.tools?.total || 0,
      approved: stats.tools?.approved || 0,
      pending: stats.tools?.pending || 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ===== ALL MODULE STATS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> 
        {moduleCards.map((card, index) => {
          const IconComponent = card.Icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-100"
            >
              {/* Header with Icon */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-700 text-base font-semibold">{card.title}</h3>
                <div className={`${card.color} p-2.5 rounded-lg shadow-sm`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Total Count */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {card.total}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total {card.title}</div>
              </div>

              {/* Approved & Pending */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {card.approved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {card.pending}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== GRAPH + ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== GRAPH ===== */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Members Growth (Last 30 Days)
          </h2>
          {!chartData || chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No chart data available</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ===== ACTIVITY LOG ===== */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h2>
          {activities.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No recent activity found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r"
                >
                  <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}