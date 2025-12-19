"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MemberDetails({ id }) {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchMember = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMember(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this member?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/admin/members/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      setMember({ ...member, membershipStatus: "active" });
      alert("Member approved successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to approve member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this member? This action cannot be undone.")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/admin/members/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      setMember({ ...member, membershipStatus: "inactive" });
      alert("Member rejected successfully!");
    } catch (err) {
      console.error("ERROR:", err);
      alert(err.response?.data?.message || "Failed to reject member");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Member not found!</p>
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
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
          <span className="font-medium">Back to Members</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-teal-100">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {member.profile?.avatar ? (
                <img
                  src={member.profile.avatar}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-200 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
                  {member.profile?.headline && (
                    <p className="text-lg text-teal-600 font-medium mt-1">{member.profile.headline}</p>
                  )}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(member.membershipStatus)} w-fit`}>
                  {member.membershipStatus.charAt(0).toUpperCase() + member.membershipStatus.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium">ID: {member.memberId}</span>
                </div>
                {member.profile?.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">{member.profile.phone}</span>
                  </div>
                )}
                {member.profile?.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">{member.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">Joined {new Date(member.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons - Only show if status is pending */}
              {member.membershipStatus === "pending" && (
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? "Processing..." : "Approve Member"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? "Processing..." : "Reject Member"}
                  </button>
                </div>
              )}

              {/* Status Messages for Non-Pending Members */}
              {member.membershipStatus === "active" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">This member has been approved</span>
                  </div>
                </div>
              )}

              {member.membershipStatus === "inactive" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">This member has been rejected</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {member.profile?.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed">{member.profile.bio}</p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {member.profile?.skills && member.profile.skills.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.profile.skills.map((skill, index) => (
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

        {/* Experience Section */}
        {member.profile?.experience && member.profile.experience.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
            </div>
            <div className="space-y-4">
              {member.profile.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                  <p className="text-teal-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(exp.from)} - {exp.to ? formatDate(exp.to) : "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {member.profile?.education && member.profile.education.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
            </div>
            <div className="space-y-4">
              {member.profile.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-cyan-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-900">{edu.degree}</h3>
                  <p className="text-cyan-600 font-medium">{edu.institution}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(edu.from)} - {formatDate(edu.to)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}