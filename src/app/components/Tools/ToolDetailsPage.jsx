'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  Layers,
  Globe,
  HardDrive,
  Download,
  Star,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

export default function ToolDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchTool();
  }, [id]);

  const fetchTool = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/tools/${id}`);
      setTool(data.tool);
    } catch (error) {
      console.error(error);
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

  if (!tool) {
    return <p className="p-6 text-gray-600">Tool not found</p>;
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
          Back to tools
        </button>

        {/* Tool Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {tool.name}
              </h1>
              {tool.version && (
                <p className="text-sm text-gray-500 mt-1">
                  Version {tool.version}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-gray-900">
                {tool.rating || 0}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {tool.category}
            </div>

            {tool.subcategory && (
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {tool.subcategory}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {tool.platform}
            </div>

            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              {tool.fileSize || '—'}
            </div>

            <div className="flex items-center gap-2">
              {tool.license === 'Free' || tool.license === 'Open Source' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-orange-600" />
              )}
              {tool.license}
            </div>

            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {tool.downloads || 0} downloads
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {tool.description}
            </p>
          </div>

          {/* Features */}
          {tool.features?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Features
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {tool.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {tool.requirements?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                System Requirements
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {tool.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {tool.downloadLink && (
              <a
                href={tool.downloadLink}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Tool
              </a>
            )}

            {tool.documentationLink && (
              <a
                href={tool.documentationLink}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <FileText className="w-4 h-4" />
                Documentation
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
