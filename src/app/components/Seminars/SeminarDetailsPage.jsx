'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function SeminarDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchSeminar();
  }, [id]);

  const fetchSeminar = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/seminars/${id}`);
      setSeminar(data.seminar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  if (!seminar) {
    return <p className="p-6 text-gray-600">Seminar not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to seminars
        </button>

        {/* Seminar Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {seminar.title}
            </h1>
            {getStatusBadge(seminar.status)}
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(seminar.date).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {seminar.time} ({seminar.duration || '—'})
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {seminar.venue}
            </div>

            <div className="flex items-center gap-2">
              {seminar.category === 'Seminars & Webinars' ? (
                <Video className="w-4 h-4" />
              ) : (
                <Building className="w-4 h-4" />
              )}
              {seminar.category}
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {seminar.attendees?.length || 0} / {seminar.maxAttendees || '∞'} attendees
            </div>
          </div>

          {/* Organizer / Speaker */}
          <div className="mt-6 border-t pt-4 space-y-2 text-sm">
            <p><strong>Organizer:</strong> {seminar.organizer}</p>
            {seminar.speaker && <p><strong>Speaker:</strong> {seminar.speaker}</p>}
            {seminar.targetAudience && <p><strong>Target Audience:</strong> {seminar.targetAudience}</p>}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {seminar.description}
            </p>
          </div>

          {/* Topics */}
          {seminar.topics?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {seminar.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registration */}
          {seminar.registrationLink && (
            <div className="mt-6">
              <a
                href={seminar.registrationLink}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Registration Link
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
