'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageSquare,
  Eye,
  User
} from 'lucide-react';

export default function ForumThreadDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchThread();
  }, [id]);
const fetchThread = async () => {
  const token = localStorage.getItem("adminToken");
  try {
    const { data } = await axios.get(`${API_URL}/forums/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setThread(data); // ✅ correct
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  if (!thread) {
    return <p className="p-6 text-gray-600">Thread not found</p>;
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
          Back to forums
        </button>

        {/* Thread Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {thread.title}
            </h1>

            <div className="flex gap-2">
              {thread.isPinned && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              {thread.isLocked && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {thread.author?.name || 'Unknown'}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {thread.replies?.length || 0} replies
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {thread.views || 0} views
            </div>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {thread.category}
            </span>
          </div>

          {/* Content */}
          <div className="mt-6 prose max-w-none">
            <p className="whitespace-pre-line text-gray-800">
              {thread.content}
            </p>
          </div>
        </div>

        {/* Replies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Replies ({thread.replies?.length || 0})
          </h2>

          {thread.replies?.length === 0 ? (
            <p className="text-sm text-gray-500">No replies yet</p>
          ) : (
            <div className="space-y-4">
              {thread.replies.map((reply) => (
                <div
                  key={reply._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {reply.author?.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {reply.content}
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
