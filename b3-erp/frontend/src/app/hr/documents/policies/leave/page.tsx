'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Eye, FileText, AlertCircle, Send } from 'lucide-react';
import { DocumentManagementService, PolicyCategory } from '@/services/document-management.service';

interface PolicyTopic {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  status: string;
}

export default function LeavePolicyPage() {
  const [policyTopics, setPolicyTopics] = useState<PolicyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await DocumentManagementService.getHRPolicies({ policyCategory: PolicyCategory.LEAVE_POLICY });
      const mapped: PolicyTopic[] = data.map((policy) => ({
        id: policy.id,
        title: policy.policyName ?? '',
        description: policy.summary ?? policy.content ?? '',
        fileUrl: policy.fileUrl,
        status: policy.status,
      }));
      setPolicyTopics(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load leave policy topics');
      setPolicyTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = (fileUrl?: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      window.alert('File not available');
    }
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm('Publish this policy?')) return;
    try {
      await DocumentManagementService.publishPolicy(id, 'HR Admin');
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to publish policy');
    }
  };

  const primaryPolicy = policyTopics[0];

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Leave Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Company leave guidelines and entitlements</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading leave policy topics…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Policy Version</p>
              <p className="text-2xl font-bold text-green-900 mt-1">v3.1</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Last Updated</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">Dec 2024</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Download Policy Document</h2>
          <button
            onClick={() => handleDownload(primaryPolicy?.fileUrl)}
            disabled={!primaryPolicy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        <p className="text-sm text-gray-600">Leave Policy v3.1 - Complete guidelines (PDF, 850 KB)</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Policy Topics</h2>
        <div className="space-y-3">
          {policyTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDownload(topic.fileUrl)}
                  className="px-4 py-2 text-green-600 hover:bg-green-100 rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                {topic.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(topic.id)}
                    className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
