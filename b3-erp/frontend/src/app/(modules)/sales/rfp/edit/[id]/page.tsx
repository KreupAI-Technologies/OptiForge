'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, AlertCircle, Save } from 'lucide-react';
import { RFPService } from '@/services/rfp.service';
import { RFP } from '@/types/rfp';

export default function RFPEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFPService.getRFPById(params.id);
      setRfp(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load RFP');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof RFP>(key: K, value: RFP[K]) => {
    setRfp((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!rfp) return;
    try {
      setSaving(true);
      setSaveError(null);
      await RFPService.updateRFP(rfp.id, {
        title: rfp.title,
        description: rfp.description,
        customerName: rfp.customerName,
        contactPerson: rfp.contactPerson,
        contactEmail: rfp.contactEmail,
        contactPhone: rfp.contactPhone,
        projectScope: rfp.projectScope,
        technicalSpecifications: rfp.technicalSpecifications,
        paymentTerms: rfp.paymentTerms,
        estimatedBudget: rfp.estimatedBudget,
        winProbability: rfp.winProbability,
        salesPerson: rfp.salesPerson,
        submissionDeadline: rfp.submissionDeadline,
      });
      router.push(`/sales/rfp/view/${rfp.id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save RFP');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading RFP…</p>
        </div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error || 'RFP not found'}</p>
          <button
            onClick={() => router.push('/sales/rfp')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to RFPs
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="w-full min-h-screen px-4 py-2">
      <button
        onClick={() => router.push(`/sales/rfp/view/${rfp.id}`)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to RFP
      </button>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit RFP</h1>
          <p className="text-sm text-gray-600">{rfp.rfpNumber}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {saveError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={rfp.title || ''} onChange={(e) => update('title', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={rfp.description || ''} onChange={(e) => update('description', e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input type="text" value={rfp.customerName || ''} onChange={(e) => update('customerName', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" value={rfp.contactPerson || ''} onChange={(e) => update('contactPerson', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={rfp.contactEmail || ''} onChange={(e) => update('contactEmail', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" value={rfp.contactPhone || ''} onChange={(e) => update('contactPhone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
              <input type="text" value={rfp.salesPerson || ''} onChange={(e) => update('salesPerson', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Scope & Commercial</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Scope</label>
            <textarea value={rfp.projectScope || ''} onChange={(e) => update('projectScope', e.target.value)} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technical Specifications</label>
            <textarea value={rfp.technicalSpecifications || ''} onChange={(e) => update('technicalSpecifications', e.target.value)} rows={2} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <input type="text" value={rfp.paymentTerms || ''} onChange={(e) => update('paymentTerms', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
              <input
                type="number"
                value={rfp.estimatedBudget ?? ''}
                onChange={(e) => update('estimatedBudget', e.target.value === '' ? undefined : Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Win Probability (%)</label>
              <input
                type="number"
                value={rfp.winProbability ?? ''}
                onChange={(e) => update('winProbability', e.target.value === '' ? undefined : Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
              <input
                type="date"
                value={rfp.submissionDeadline ? rfp.submissionDeadline.split('T')[0] : ''}
                onChange={(e) => update('submissionDeadline', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
