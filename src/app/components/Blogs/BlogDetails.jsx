"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, User, Calendar, Tag, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlogDetails({ id }) {
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlog(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this blog?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/blogs/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setBlog({ ...blog, status: "published" });
      alert("Blog approved successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to approve blog");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this blog?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/blogs/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setBlog({ ...blog, status: "rejected" });
      alert("Blog rejected successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to reject blog");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog details...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Blog not found!</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      published: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Blogs</span>
        </button>

        {/* Blog Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-teal-100">
          <div className="flex flex-col gap-4">
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 grow">{blog.title}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(blog.status)} shrink-0`}>
                {blog.status?.charAt(0).toUpperCase() + blog.status?.slice(1)}
              </span>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>By {blog.author?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
              {blog.category && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <span>{blog.category}</span>
                </div>
              )}
              {blog.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{blog.readTime} min read</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Only show if status is pending */}
            {blog.status === "pending" && (
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {blog.status === "published" && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">This blog has been approved</span>
                </div>
              </div>
            )}

            {blog.status === "rejected" && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">This blog has been rejected</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-teal-100">
          <div className="prose max-w-none">
            {blog.featuredImage && (
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            {blog.excerpt && (
              <p className="text-lg text-gray-600 italic mb-6 pb-6 border-b border-gray-200">
                {blog.excerpt}
              </p>
            )}
            
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: blog.content || blog.body }}
            />
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-teal-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}