'use client';

import { useState, useEffect } from 'react';
import { Files, Download, Eye, AlertCircle, Send } from 'lucide-react';
import { DocumentManagementService, PolicyCategory } from '@/services/document-management.service';

interface OtherPolicy {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  fileUrl?: string;
  status: string;
}

export default function OtherPoliciesPage() {
  const [policies, setPolicies] = useState<OtherPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await DocumentManagementService.getHRPolicies({ policyCategory: PolicyCategory.OTHER });
      const mapped: OtherPolicy[] = data.map((policy) => ({
        id: policy.id,
        title: policy.policyName ?? '',
        version: policy.version ?? '',
        lastUpdated: policy.publishedAt ?? policy.effectiveFrom ?? '',
        fileUrl: policy.fileUrl,
        status: policy.status,
      }));
      setPolicies(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load policies');
      setPolicies([]);
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

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Other Policies</h1>
        <p className="text-sm text-gray-600 mt-1">Additional company policies and guidelines</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading policies…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Policies</h2>
        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{policy.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Version {policy.version}
                  {policy.lastUpdated && ` • Last updated: ${new Date(policy.lastUpdated).toLocaleDateString('en-IN')}`}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDownload(policy.fileUrl)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(policy.fileUrl)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                {policy.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(policy.id)}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm flex items-center gap-2"
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
