'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Save, X, AlertCircle, RotateCcw } from 'lucide-react';

interface PartsReturn {
  id: string;
  returnId?: string;
  returnedBy?: string;
  department?: string;
  customerName?: string;
  returnReason?: string;
  returnType?: string;
  location?: string;
  status?: string;
  qualityStatus?: string;
  refundAmount?: number;
  restockingFee?: number;
  creditNoteIssued?: boolean;
  creditNoteNumber?: string;
  notes?: string;
  [key: string]: unknown;
}

export default function EditReturnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ret, setRet] = useState<PartsReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [returnedBy, setReturnedBy] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [qualityStatus, setQualityStatus] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [restockingFee, setRestockingFee] = useState('');
  const [creditNoteIssued, setCreditNoteIssued] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AfterSalesPagesService.partsReturn<PartsReturn>(String(params.id));
        if (cancelled) return;
        if (!data) {
          setError('Return record not found.');
          setRet(null);
          return;
        }
        setRet(data);
        setReturnedBy(data.returnedBy ?? '');
        setCustomerName(data.customerName ?? '');
        setReturnReason(data.returnReason ?? '');
        setReturnType(data.returnType ?? '');
        setLocation(data.location ?? '');
        setStatus(data.status ?? '');
        setQualityStatus(data.qualityStatus ?? '');
        setRefundAmount(data.refundAmount != null ? String(data.refundAmount) : '');
        setRestockingFee(data.restockingFee != null ? String(data.restockingFee) : '');
        setCreditNoteIssued(Boolean(data.creditNoteIssued));
        setCreditNoteNumber(data.creditNoteNumber ?? '');
        setNotes(data.notes ?? '');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load return record.');
          setRet(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await AfterSalesPagesService.updatePartsReturn(String(params.id), {
        returnedBy,
        customerName,
        returnReason: returnReason || undefined,
        returnType: returnType || undefined,
        location: location || undefined,
        status: status || undefined,
        qualityStatus: qualityStatus || undefined,
        refundAmount: refundAmount === '' ? undefined : Number(refundAmount),
        restockingFee: restockingFee === '' ? undefined : Number(restockingFee),
        creditNoteIssued,
        creditNoteNumber: creditNoteNumber || undefined,
        notes: notes || undefined,
      });
      router.push('/after-sales-service/parts/returns');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !ret) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load return record</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Return record not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/parts/returns')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Returns
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Return</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{ret.returnId ?? ret.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Return Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returned By</label>
              <input
                type="text"
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
              <input
                type="text"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
              <input
                type="text"
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. pending, inspected, approved, restocked"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Status</label>
              <input
                type="text"
                value={qualityStatus}
                onChange={(e) => setQualityStatus(e.target.value)}
                placeholder="e.g. pending, passed, failed"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restocking Fee (₹)</label>
              <input
                type="number"
                value={restockingFee}
                onChange={(e) => setRestockingFee(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note Number</label>
              <input
                type="text"
                value={creditNoteNumber}
                onChange={(e) => setCreditNoteNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center md:col-span-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={creditNoteIssued}
                  onChange={(e) => setCreditNoteIssued(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Credit note issued</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
