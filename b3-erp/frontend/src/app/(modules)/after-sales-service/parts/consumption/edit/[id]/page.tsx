'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Save, X, AlertCircle, Package } from 'lucide-react';

interface PartsConsumption {
  id: string;
  consumptionId?: string;
  consumedBy?: string;
  department?: string;
  customerName?: string;
  jobType?: string;
  location?: string;
  workOrderNumber?: string;
  consumptionType?: string;
  approvalStatus?: string;
  completionStatus?: string;
  laborHours?: number;
  billable?: boolean;
  notes?: string;
  [key: string]: unknown;
}

export default function EditConsumptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rec, setRec] = useState<PartsConsumption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [consumedBy, setConsumedBy] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [completionStatus, setCompletionStatus] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [billable, setBillable] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AfterSalesPagesService.partsConsumptionItem<PartsConsumption>(String(params.id));
        if (cancelled) return;
        if (!data) {
          setError('Consumption record not found.');
          setRec(null);
          return;
        }
        setRec(data);
        setConsumedBy(data.consumedBy ?? '');
        setCustomerName(data.customerName ?? '');
        setJobType(data.jobType ?? '');
        setLocation(data.location ?? '');
        setWorkOrderNumber(data.workOrderNumber ?? '');
        setCompletionStatus(data.completionStatus ?? '');
        setApprovalStatus(data.approvalStatus ?? '');
        setLaborHours(data.laborHours != null ? String(data.laborHours) : '');
        setBillable(Boolean(data.billable));
        setNotes(data.notes ?? '');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load consumption record.');
          setRec(null);
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
      await AfterSalesPagesService.updatePartsConsumption(String(params.id), {
        consumedBy,
        customerName,
        jobType: jobType || undefined,
        location: location || undefined,
        workOrderNumber: workOrderNumber || undefined,
        completionStatus: completionStatus || undefined,
        approvalStatus: approvalStatus || undefined,
        laborHours: laborHours === '' ? undefined : Number(laborHours),
        billable,
        notes: notes || undefined,
      });
      router.push('/after-sales-service/parts/consumption');
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

  if (error || !rec) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load consumption record</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Consumption record not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/parts/consumption')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Consumption
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
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Consumption</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{rec.consumptionId ?? rec.id}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Consumption Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consumed By</label>
              <input
                type="text"
                value={consumedBy}
                onChange={(e) => setConsumedBy(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <input
                type="text"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Order</label>
              <input
                type="text"
                value={workOrderNumber}
                onChange={(e) => setWorkOrderNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
              <input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Status</label>
              <input
                type="text"
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value)}
                placeholder="e.g. completed, partial, pending"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
              <input
                type="text"
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                placeholder="e.g. approved, pending, rejected"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center md:col-span-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Billable</span>
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
