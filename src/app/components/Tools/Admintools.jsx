'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Eye, Download, Upload, Star,
  Package, Layers, Globe, HardDrive, CheckCircle, XCircle
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminToolsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, totalDownloads: 0, avgRating: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [selectedTools, setSelectedTools] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [newTool, setNewTool] = useState({
    name: '', category: '', subcategory: '', description: '', version: '',
    platform: '', license: '', downloadLink: '', documentationLink: '',
    features: '', requirements: '', fileSize: '', file: null
  });

  useEffect(() => {
    fetchTools();
    fetchCategories();
    fetchStats();
  }, [selectedCategory, searchQuery, currentPage]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage);
      params.append('limit', 20);

      const { data } = await axios.get(`${API_URL}/tools?${params.toString()}`);
      setTools(data.tools || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/tools/categories/stats`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/tools?limit=1000`);
      const all = data.tools || [];
      const thisMonth = all.filter(t => {
        const created = new Date(t.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      });
      const totalDownloads = all.reduce((sum, t) => sum + (t.downloads || 0), 0);
      const avgRating = all.length > 0 ? all.reduce((sum, t) => sum + (t.rating || 0), 0) / all.length : 0;
      
      setStats({
        total: all.length,
        thisMonth: thisMonth.length,
        totalDownloads,
        avgRating: avgRating.toFixed(1)
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('userToken');
      const { data } = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return data.url; // Assuming API returns { url: "..." }
    } catch (error) {
      console.error('Upload error:', error);
      alert('File upload failed');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateTool = async (e) => {
    e.preventDefault();
    try {
      let downloadLink = newTool.downloadLink;
      
      // If file is uploaded, use that instead
      if (newTool.file) {
        const uploadedUrl = await handleFileUpload(newTool.file);
        if (uploadedUrl) downloadLink = uploadedUrl;
      }

      const token = localStorage.getItem('userToken');
      const data = {
        ...newTool,
        downloadLink,
        features: newTool.features.split(',').map(f => f.trim()).filter(Boolean),
        requirements: newTool.requirements.split(',').map(r => r.trim()).filter(Boolean)
      };
      delete data.file;

      await axios.post(`${API_URL}/tools`, data, { 
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateModal(false);
      resetForm();
      fetchTools();
      fetchStats();
      alert('Tool added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add tool');
    }
  };

  const handleUpdateTool = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const data = {
        ...editingTool,
        features: Array.isArray(editingTool.features) 
          ? editingTool.features 
          : editingTool.features.split(',').map(f => f.trim()).filter(Boolean),
        requirements: Array.isArray(editingTool.requirements)
          ? editingTool.requirements
          : editingTool.requirements.split(',').map(r => r.trim()).filter(Boolean)
      };

      await axios.put(`${API_URL}/tools/${editingTool._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowEditModal(false);
      setEditingTool(null);
      fetchTools();
      fetchStats();
      alert('Tool updated!');
    } catch (error) {
      alert('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tool?')) return;
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`${API_URL}/tools/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTools();
      fetchStats();
      alert('Deleted!');
    } catch (error) {
      alert('Failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTools.length === 0) return alert('Select tools first');
    if (!confirm(`Delete ${selectedTools.length} tools?`)) return;
    
    try {
      const token = localStorage.getItem('userToken');
      await Promise.all(
        selectedTools.map(id => 
          axios.delete(`${API_URL}/tools/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setSelectedTools([]);
      fetchTools();
      fetchStats();
      alert('Deleted!');
    } catch (error) {
      alert('Failed');
    }
  };

  const resetForm = () => {
    setNewTool({
      name: '', category: '', subcategory: '', description: '', version: '',
      platform: '', license: '', downloadLink: '', documentationLink: '',
      features: '', requirements: '', fileSize: '', file: null
    });
  };

  const toggleSelect = (id) => setSelectedTools(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedTools(selectedTools.length === tools.length ? [] : tools.map(t => t._id));

  const toolCategories = [
    'CAD Software', 'Analysis Software', 'Design Tools', 'Project Management',
    'BIM Tools', 'Calculators', 'Converters', 'Documentation Tools',
    'Mobile Apps', 'Plugins & Extensions', 'Utilities', 'Other'
  ];

  const platforms = ['Windows', 'Mac', 'Linux', 'Web', 'iOS', 'Android', 'Cross-platform'];
  const licenses = ['Free', 'Open Source', 'Freemium', 'Trial', 'Paid'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tools Library Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage software tools, utilities, and resources</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Tools</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Added This Month</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.thisMonth}</p>
              </div>
              <Layers className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Downloads</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalDownloads}</p>
              </div>
              <Download className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.avgRating} ★</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 text-black z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add New Tool</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateTool} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Tool Name *</label>
                  <input
                    required
                    value={newTool.name}
                    onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                    placeholder="e.g., AutoCAD 2024"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={newTool.category}
                    onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {toolCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subcategory</label>
                  <input
                    value={newTool.subcategory}
                    onChange={(e) => setNewTool({...newTool, subcategory: e.target.value})}
                    placeholder="e.g., 2D/3D Design"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Version</label>
                  <input
                    value={newTool.version}
                    onChange={(e) => setNewTool({...newTool, version: e.target.value})}
                    placeholder="e.g., 2024.1"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platform *</label>
                  <select
                    required
                    value={newTool.platform}
                    onChange={(e) => setNewTool({...newTool, platform: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select platform</option>
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">License *</label>
                  <select
                    required
                    value={newTool.license}
                    onChange={(e) => setNewTool({...newTool, license: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select license</option>
                    {licenses.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File Size</label>
                  <input
                    value={newTool.fileSize}
                    onChange={(e) => setNewTool({...newTool, fileSize: e.target.value})}
                    placeholder="e.g., 2.5 GB"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    required
                    value={newTool.description}
                    onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                    placeholder="Detailed description of the tool..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Features (comma separated)</label>
                  <input
                    value={newTool.features}
                    onChange={(e) => setNewTool({...newTool, features: e.target.value})}
                    placeholder="e.g., 3D Modeling, Rendering, Animation"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Requirements (comma separated)</label>
                  <input
                    value={newTool.requirements}
                    onChange={(e) => setNewTool({...newTool, requirements: e.target.value})}
                    placeholder="e.g., 8GB RAM, 10GB Disk Space, GPU Required"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2 border-t pt-4">
                  <label className="block text-sm font-medium mb-2">Upload Tool File (Optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={(e) => setNewTool({...newTool, file: e.target.files[0]})}
                      className="flex-1 text-sm text-gray-600"
                    />
                    {newTool.file && (
                      <span className="text-sm text-green-600">✓ {newTool.file.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload tool installer/package or provide download link below
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Download Link</label>
                  <input
                    type="url"
                    value={newTool.downloadLink}
                    onChange={(e) => setNewTool({...newTool, downloadLink: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Documentation Link</label>
                  <input
                    type="url"
                    value={newTool.documentationLink}
                    onChange={(e) => setNewTool({...newTool, documentationLink: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {uploadingFile ? 'Uploading...' : 'Add Tool'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTool && (
        <div className="fixed inset-0 bg-black/50 text-black z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Tool</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpdateTool} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({...editingTool, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editingTool.category}
                  onChange={(e) => setEditingTool({...editingTool, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {toolCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingTool.description}
                  onChange={(e) => setEditingTool({...editingTool, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Save
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white text-black rounded-lg border p-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.name !== 'All tools').map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                ))}
              </select>
            </div>
            {selectedTools.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">{selectedTools.length} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
                <button onClick={() => setSelectedTools([])} className="ml-auto text-sm text-gray-600">
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTools.length === tools.length && tools.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tool</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">License</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Downloads</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rating</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan="8" className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td></tr>
                ) : tools.length === 0 ? (
                  <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-500">No tools found</td></tr>
                ) : (
                  tools.map((tool) => (
                    <tr key={tool._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool._id)}
                          onChange={() => toggleSelect(tool._id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{tool.name}</div>
                        <div className="text-sm text-gray-500">{tool.version}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tool.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {tool.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tool.license === 'Free' || tool.license === 'Open Source' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {tool.license}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {tool.downloads || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-900">{tool.rating || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/admin/tools/${tool._id}`)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTool(tool);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}