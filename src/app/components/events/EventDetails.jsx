// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { ArrowLeft, Calendar, MapPin, Clock, Users, Tag, CheckCircle, XCircle, Building2, User } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function EventDetails({ id }) {
//   const router = useRouter();
//   const [event, setEvent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   const fetchEvent = async () => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       const res = await axios.get(`${API_URL}/admin/events/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEvent(res.data);
//     } catch (err) {
//       console.error("ERROR:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async () => {
//     if (!confirm("Are you sure you want to approve this event?")) return;

//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("adminToken");
//       await axios.post(
//         `${API_URL}/admin/events/approve/${id}`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
      
//       setEvent({ ...event, status: "approved" });
//       alert("Event approved successfully!");
//     } catch (err) {
//       console.error("ERROR:", err);
//       alert(err.response?.data?.message || "Failed to approve event");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!confirm("Are you sure you want to reject this event?")) return;

//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("adminToken");
//       await axios.post(
//         `${API_URL}/admin/events/reject/${id}`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
      
//       setEvent({ ...event, status: "cancelled" });
//       alert("Event rejected successfully!");
//     } catch (err) {
//       console.error("ERROR:", err);
//       alert(err.response?.data?.message || "Failed to reject event");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvent();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading event details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <p className="text-xl text-gray-600">Event not found!</p>
//           <button
//             onClick={() => router.back()}
//             className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const getStatusColor = (status) => {
//     const colors = {
//       approved: "bg-green-100 text-green-800",
//       pending: "bg-yellow-100 text-yellow-800",
//       cancelled: "bg-red-100 text-red-800",
//     };
//     return colors[status] || "bg-gray-100 text-gray-800";
//   };

//   const formatDateTime = (date) => {
//     return new Date(date).toLocaleString('en-IN', { 
//       day: '2-digit', 
//       month: 'short', 
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
//       <div className="max-w-5xl mx-auto">
//         {/* Back Button */}
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-2 text-gray-700 hover:text-teal-600 mb-6 transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span className="font-medium">Back to Events</span>
//         </button>

//         {/* Event Header Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-teal-100">
//           <div className="flex flex-col gap-6">
//             {/* Title and Status */}
//             <div className="flex items-start justify-between gap-4">
//               <div className="grow">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
//                 {event.organizer?.name && (
//                   <p className="text-gray-600">Organized by {event.organizer.name}</p>
//                 )}
//               </div>
//               <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(event.status)} shrink-0`}>
//                 {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
//               </span>
//             </div>

//             {/* Event Type Badge */}
//             {event.eventType && (
//               <div className="flex items-center gap-2">
//                 <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium capitalize">
//                   {event.eventType}
//                 </span>
//               </div>
//             )}

//             {/* Action Buttons - Only show if status is pending */}
//             {event.status === "pending" && (
//               <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
//                 <button
//                   onClick={handleApprove}
//                   disabled={actionLoading}
//                   className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <CheckCircle className="w-5 h-5" />
//                   {actionLoading ? "Processing..." : "Approve"}
//                 </button>
//                 <button
//                   onClick={handleReject}
//                   disabled={actionLoading}
//                   className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <XCircle className="w-5 h-5" />
//                   {actionLoading ? "Processing..." : "Reject"}
//                 </button>
//               </div>
//             )}

//             {/* Status Messages */}
//             {event.status === "approved" && (
//               <div className="pt-6 border-t border-gray-200">
//                 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
//                   <CheckCircle className="w-5 h-5" />
//                   <span className="font-medium">This event has been approved</span>
//                 </div>
//               </div>
//             )}

//             {event.status === "cancelled" && (
//               <div className="pt-6 border-t border-gray-200">
//                 <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
//                   <XCircle className="w-5 h-5" />
//                   <span className="font-medium">This event has been rejected</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Date, Time & Location Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Date, time & location</h2>
//           <div className="space-y-3">
//             <div className="flex items-start gap-3">
//               <Calendar className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600">Date</p>
//                 <p className="font-medium text-gray-900">
//                   {new Date(event.startDate).toLocaleDateString('en-IN', { 
//                     day: '2-digit', 
//                     month: 'short', 
//                     year: 'numeric' 
//                   })}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600">Time</p>
//                 <p className="font-medium text-gray-900">
//                   {new Date(event.startDate).toLocaleTimeString('en-IN', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     hour12: true 
//                   })} - {event.endDate && new Date(event.endDate).toLocaleTimeString('en-IN', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     hour12: true 
//                   })}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3">
//               <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm text-gray-600">Venue</p>
//                 <p className="font-medium text-gray-900">{event.location || event.venue || 'Online'}</p>
//               </div>
//             </div>
//             {event.capacity && (
//               <div className="flex items-start gap-3">
//                 <Users className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-sm text-gray-600">Capacity</p>
//                   <p className="font-medium text-gray-900">{event.capacity} participants</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Event Details */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-teal-100">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Event details</h2>
          
//           {/* Host/Organizer Info */}
//           {event.chapter && (
//             <div className="mb-6 pb-6 border-b border-gray-200">
//               <h3 className="text-sm font-semibold text-gray-600 mb-2">Host</h3>
//               <div className="flex items-center gap-2">
//                 <Building2 className="w-4 h-4 text-teal-600" />
//                 <span className="text-gray-900">{event.chapter}</span>
//               </div>
//             </div>
//           )}

//           {/* Description */}
//           <div>
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Full description</h3>
//             <div className="prose max-w-none text-gray-700 leading-relaxed">
//               <p className="whitespace-pre-line">{event.description}</p>
//             </div>
//           </div>
//         </div>

//         {/* Additional Notes */}
//         {event.additionalNotes && (
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-teal-100">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Additional notes</h2>
//             <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.additionalNotes}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventDetails({ id }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this session?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/events/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvent({ ...event, status: "approved" });
      alert("Approved successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this session?")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/events/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvent({ ...event, status: "cancelled" });
      alert("Rejected successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-teal-600 rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Session not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    }[status];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Status & Actions */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border">
          <div className="flex justify-between items-center">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                event.status
              )}`}
            >
              {event.status.toUpperCase()}
            </span>

            {event.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date, Time & Location */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border">
          <h2 className="text-xl font-bold mb-4">Date, Time & Location</h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Calendar className="text-teal-600" />
              <span>
                {new Date(event.startDate).toLocaleDateString("en-IN")}
              </span>
            </div>

            <div className="flex gap-3">
              <Clock className="text-teal-600" />
              <span>
                {new Date(event.startDate).toLocaleTimeString("en-IN")} –
                {event.endDate &&
                  new Date(event.endDate).toLocaleTimeString("en-IN")}
              </span>
            </div>

            <div className="flex gap-3">
              <MapPin className="text-teal-600" />
              <span>{event.location || "Online"}</span>
            </div>

            {event.capacity && (
              <div className="flex gap-3">
                <Users className="text-teal-600" />
                <span>{event.capacity} participants</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border">
          <h2 className="text-xl font-bold mb-4">Session Details</h2>

          {event.chapter && (
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="text-teal-600" />
              <span>{event.chapter}</span>
            </div>
          )}

          <p className="text-gray-700 whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Additional Notes */}
        {event.additionalNotes && (
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-bold mb-3">Additional Notes</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {event.additionalNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
