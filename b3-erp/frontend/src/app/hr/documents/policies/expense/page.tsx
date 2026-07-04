'use client';

import { useState, useEffect } from 'react';
import { Receipt, Download, Eye, FileText, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface PolicyTopic {
  id: string;
  title: string;
  description: string;
}

export default function ExpensePolicyPage() {
  const [policyTopics, setPolicyTopics] = useState<PolicyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getDocuments('policy-expense');
        const mapped: PolicyTopic[] = rows.map((row) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            title: row.title ?? '',
            description: meta.description ?? row.remarks ?? '',
          };
        });
        if (!cancelled) setPolicyTopics(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load expense policy topics');
          setPolicyTopics([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Expense Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Travel and expense reimbursement guidelines</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading expense policy topics…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Policy Version</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">v4.2</p>
            </div>
            <Receipt className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Last Updated</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">Oct 2024</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Download Policy Document</h2>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        <p className="text-sm text-gray-600">Expense Policy v4.2 - Complete guidelines (PDF, 1.2 MB)</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Policy Topics</h2>
        <div className="space-y-3">
          {policyTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
              </div>
              <button className="ml-4 px-4 py-2 text-orange-600 hover:bg-orange-100 rounded-lg font-medium text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
