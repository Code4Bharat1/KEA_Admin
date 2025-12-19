"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Building2, MapPin, Clock, Briefcase, DollarSign, Users, CheckCircle, XCircle, Calendar, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobDetails({ id }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this job posting?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/jobs/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setJob({ ...job, status: "approved" });
      alert("Job approved successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to approve job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this job posting?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/jobs/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setJob({ ...job, status: "rejected" });
      alert("Job rejected successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to reject job");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Job not found!</p>
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
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Jobs</span>
        </button>

        {/* Job Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-teal-100">
          <div className="flex flex-col gap-6">
            {/* Title and Status */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="grow">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    <span className="text-lg font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(job.status)} shrink-0`}>
                {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
              </span>
            </div>

            {/* Job Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {job.jobType && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">{job.jobType}</span>
                </div>
              )}
              {job.experience && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">{job.experience}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">{job.salary}</span>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">Deadline: {new Date(job.deadline).toLocaleDateString("en-IN")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="text-sm">Posted: {new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Action Buttons - Only show if status is pending */}
            {job.status === "pending" && (
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? "Processing..." : "Approve Job"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  {actionLoading ? "Processing..." : "Reject Job"}
                </button>
              </div>
            )}

            {/* Status Messages for Non-Pending Jobs */}
            {job.status === "approved" && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">This job has been approved</span>
                </div>
              </div>
            )}

            {job.status === "rejected" && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">This job has been rejected</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
          </div>
          <div className="prose max-w-none text-gray-700">
            <p className="whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Company Information */}
        {job.companyInfo && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              {job.companyInfo.website && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                    {job.companyInfo.website}
                  </a>
                </p>
              )}
              {job.companyInfo.size && (
                <p><strong>Company Size:</strong> {job.companyInfo.size}</p>
              )}
              {job.companyInfo.industry && (
                <p><strong>Industry:</strong> {job.companyInfo.industry}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}