'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Mail, 
  Shield, 
  Users, 
  FileText, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import axios from 'axios';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [settings, setSettings] = useState({
    // General Settings
    siteName: '',
    siteUrl: '',
    adminEmail: '',
    contactEmail: '',
    logo: '',
    
    // Email Configuration
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpFromEmail: '',
    smtpFromName: '',
    
    // User Roles & Permissions
    allowRegistration: true,
    requireEmailVerification: true,
    defaultMembershipStatus: 'pending',
    autoApproveMembers: false,
    
    // Content Moderation
    autoApproveJobs: false,
    autoApproveBlogs: false,
    autoApproveEvents: false,
    moderationEmail: '',
    
    // Support Staff
    supportStaff: [],
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setErrorMessage('Failed to load settings');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/admin/settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save settings');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${API_URL}/admin/backup`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kea-backup-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating backup:', err);
      setErrorMessage('Failed to create backup');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/admin/restore`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error restoring backup:', err);
      setErrorMessage('Failed to restore backup');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/admin/test-email`,
        { email: settings.adminEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Test email sent successfully! Check your inbox.');
    } catch (err) {
      console.error('Error sending test email:', err);
      alert('Failed to send test email. Please check your SMTP settings.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Manage general configuration, email settings, roles, and backups for the KEA admin portal</p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 font-medium">Settings saved successfully!</p>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email Configuration
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'permissions'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Roles & Permissions
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'backup'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Backup & Restore
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>
                  <p className="text-sm text-gray-600 mb-6">Set up admin name and branding for the KEA portal</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        KEA Admin Portal
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleInputChange}
                        placeholder="KEA Admin Portal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Logo Upload
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          name="logo"
                          value={settings.logo}
                          onChange={handleInputChange}
                          placeholder="No image uploaded, upload an image"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                          Upload new logo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Site URL
                      </label>
                      <input
                        type="text"
                        name="siteUrl"
                        value={settings.siteUrl}
                        onChange={handleInputChange}
                        placeholder="https://admin.kea.org"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        name="adminEmail"
                        value={settings.adminEmail}
                        onChange={handleInputChange}
                        placeholder="admin@kea.org"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={settings.contactEmail}
                        onChange={handleInputChange}
                        placeholder="contact@kea.org"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Content Moderation</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage auto-approval for jobs, blogs, and events</p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="autoApproveJobs"
                        checked={settings.autoApproveJobs}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Auto-approve Jobs</p>
                        <p className="text-sm text-gray-600">Automatically approve new job postings</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="autoApproveBlogs"
                        checked={settings.autoApproveBlogs}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Auto-approve Blogs</p>
                        <p className="text-sm text-gray-600">Automatically approve new blog posts</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="autoApproveEvents"
                        checked={settings.autoApproveEvents}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Auto-approve Events</p>
                        <p className="text-sm text-gray-600">Automatically approve new events</p>
                      </div>
                    </label>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Moderation Email
                      </label>
                      <input
                        type="email"
                        name="moderationEmail"
                        value={settings.moderationEmail}
                        onChange={handleInputChange}
                        placeholder="moderation@kea.org"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email for content moderation notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Configuration */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Email Configuration (SMTP)</h2>
                  <p className="text-sm text-gray-600 mb-6">Set up SMTP server to send email from approved addresses</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        name="smtpHost"
                        value={settings.smtpHost}
                        onChange={handleInputChange}
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        name="smtpPort"
                        value={settings.smtpPort}
                        onChange={handleInputChange}
                        placeholder="587"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        name="smtpUsername"
                        value={settings.smtpUsername}
                        onChange={handleInputChange}
                        placeholder="your-email@gmail.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        name="smtpPassword"
                        value={settings.smtpPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        name="smtpFromEmail"
                        value={settings.smtpFromEmail}
                        onChange={handleInputChange}
                        placeholder="noreply@kea.org"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        name="smtpFromName"
                        value={settings.smtpFromName}
                        onChange={handleInputChange}
                        placeholder="KEA Admin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <button
                      onClick={handleSendTestEmail}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send test email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Roles & Permissions */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">User Roles & Permissions</h2>
                  <p className="text-sm text-gray-600 mb-6">Control user access and permissions</p>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="allowRegistration"
                        checked={settings.allowRegistration}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Allow User Registration</p>
                        <p className="text-sm text-gray-600">Enable new users to register on the platform</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="requireEmailVerification"
                        checked={settings.requireEmailVerification}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Require Email Verification</p>
                        <p className="text-sm text-gray-600">Users must verify their email before accessing the platform</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="autoApproveMembers"
                        checked={settings.autoApproveMembers}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Auto-approve Members</p>
                        <p className="text-sm text-gray-600">Automatically approve new member registrations</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Default Membership Status
                      </label>
                      <select
                        name="defaultMembershipStatus"
                        value={settings.defaultMembershipStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Support Staff</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage support team members who can access the admin panel</p>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 italic">No support staff added yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Backup & Restore */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Backup & Restore</h2>
                  <p className="text-sm text-gray-600 mb-6">Export and restore snapshots from a complete database</p>

                  <div className="space-y-4">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Database Backup</h3>
                          <p className="text-sm text-gray-600">Create a complete backup of your database</p>
                        </div>
                        <Download className="w-5 h-5 text-gray-400" />
                      </div>
                      <button
                        onClick={handleBackupNow}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Run backup now
                      </button>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Restore Database</h3>
                          <p className="text-sm text-gray-600">Restore from a previous backup file</p>
                        </div>
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreBackup}
                          className="hidden"
                          id="restore-file"
                        />
                        <label
                          htmlFor="restore-file"
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
                        >
                          Choose backup file
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">⚠️ Warning: This will overwrite all current data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Save Button */}
          <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Make sure to save your changes</p>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}