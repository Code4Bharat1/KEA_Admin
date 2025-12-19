'use client';

import { useState, useEffect } from 'react';
import { Bell, Menu, X, CheckCircle, AlertCircle, Info, Trash2, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Header({ onMenuClick }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Get admin data from localStorage
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      
      // Get unread count
      const unreadRes = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(unreadRes.data.count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      router.push('/');
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    router.push('/admin/profile');
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    router.push('/admin/settings');
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(notif => notif._id !== id));
      
      if (!deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to related page
    if (notification.relatedId) {
      const routes = {
        member: `/admin/members/${notification.relatedId}`,
        job: `/admin/jobs/${notification.relatedId}`,
        blog: `/admin/blogs/${notification.relatedId}`,
        event: `/admin/events/${notification.relatedId}`,
      };
      
      const route = routes[notification.type];
      if (route) {
        router.push(route);
        setShowNotifications(false);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'member':
        return <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-blue-600" />
        </div>;
      case 'job':
        return <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-green-600" />
        </div>;
      case 'blog':
        return <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-purple-600" />
        </div>;
      case 'event':
        return <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-orange-600" />
        </div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-gray-600" />
        </div>;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
  };

  const adminName = admin?.name || 'Admin';
  const adminRole = admin?.role === 'admin' ? 'Admin' : 'Super Admin';
  const initials = getInitials(adminName);

  return (
    <header className="bg-linear-to-r from-[#0D2847] to-[#1a3a5c] border-b border-white/10 px-4 md:px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu + Title */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">Dashboard</h1>
            <p className="text-xs md:text-sm text-blue-200 truncate">Overview of members, jobs, and content across KEA.</p>
          </div>
        </div>

        {/* Right Section - Date, Notifications, Profile */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <span className="text-xs md:text-sm text-blue-200 hidden sm:block">
            Today - {today}
          </span>
          
          {/* Notifications */}
          <div className="relative notifications-container">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2 text-sm">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification._id);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={clearAll}
                      className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded transition-colors"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Profile Menu */}
          <div className="hidden sm:block relative profile-menu-container">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-4 border-l border-white/20 hover:bg-white/10 rounded-lg transition-colors pr-2 py-1"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white">{adminName}</p>
                <p className="text-xs text-blue-200">{adminRole}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-semibold border border-white/30">
                {initials}
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900 truncate">{adminName}</p>
                  <p className="text-sm text-gray-600 truncate">{admin?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Profile - Just Avatar */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="sm:hidden relative profile-menu-container"
          >
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-sm font-semibold border border-white/30">
              {initials}
            </div>

            {/* Mobile Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900 truncate">{adminName}</p>
                  <p className="text-sm text-gray-600 truncate">{admin?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}