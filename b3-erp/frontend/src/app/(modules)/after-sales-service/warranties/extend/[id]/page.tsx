'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WarrantyService, Warranty, UpdateWarrantyDto } from '@/services/warranty.service';
import { Save, X, AlertCircle, CalendarPlus, ArrowRight } from 'lucide-react';

export default function ExtendWarrantyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [additionalMonths, setAdditionalMonths] = useState('12');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await WarrantyService.getWarrantyById(String(params.id));
        if (cancelled) return;
        if (!data || typeof data !== 'object') {
          setError('Warranty not found.');
          setWarranty(null);
          return;
        }
        setWarranty(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load warranty.');
          setWarranty(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const computeNewEndDate = (): string => {
    if (!warranty?.endDate) return '';
    const base = new Date(warranty.endDate);
    if (isNaN(base.getTime())) return '';
    const months = Number(additionalMonths) || 0;
    const end = new Date(base);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().split('T')[0];
  };

  const newEndDate = computeNewEndDate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warranty) return;
    setSaving(true);
    setSaveError(null);
    try {
      const months = Number(additionalMonths) || 0;
      const dto: UpdateWarrantyDto & {
        endDate?: string;
        extensionNotes?: string;
        additionalMonths?: number;
      } = {
        status: 'extended',
        durationMonths: (warranty.durationMonths ?? 0) + months,
        endDate: newEndDate || undefined,
        additionalMonths: months,
        extensionNotes: notes || undefined,
      };
      await WarrantyService.updateWarranty(String(params.id), dto);
      router.push('/after-sales-service/warranties');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to extend warranty.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !warranty) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load warranty</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Warranty not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/warranties')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Warranties
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
              <CalendarPlus className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Extend Warranty</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {warranty.warrantyNumber} • {warranty.customerName} • {warranty.equipmentModel}
            </p>
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
              {saving ? 'Extending...' : 'Extend Warranty'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        )}

        {/* Period comparison */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Current End Date</div>
              <div className="font-medium text-gray-900 mt-1">{formatDate(warranty.endDate)}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">New End Date</div>
              <div className="font-medium text-blue-600 mt-1">{formatDate(newEndDate)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Extension Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Duration (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={additionalMonths}
                onChange={(e) => setAdditionalMonths(e.target.value)}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Extends from the current end date ({formatDate(warranty.endDate)}).
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Extension Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for extension, reference numbers, or special terms"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
