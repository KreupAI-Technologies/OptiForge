'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  WarrantyService,
  Warranty,
  WarrantyType,
  WarrantyStatus,
  WarrantyCoverage,
  UpdateWarrantyDto,
} from '@/services/warranty.service';
import { Save, X, AlertCircle, ShieldCheck } from 'lucide-react';

const TYPE_OPTIONS: WarrantyType[] = ['Standard', 'Extended', 'Manufacturer', 'Dealer'];
const STATUS_OPTIONS: WarrantyStatus[] = [
  'active',
  'expired',
  'void',
  'extended',
  'transferred',
];
const COVERAGE_OPTIONS: WarrantyCoverage[] = [
  'Parts Only',
  'Labor Only',
  'Parts & Labor',
  'Comprehensive',
];

export default function EditWarrantyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [warrantyType, setWarrantyType] = useState<WarrantyType>('Standard');
  const [status, setStatus] = useState<WarrantyStatus>('active');
  const [coverage, setCoverage] = useState<WarrantyCoverage>('Parts & Labor');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');

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
        setCustomerName(data.customerName ?? '');
        setEquipmentModel(data.equipmentModel ?? '');
        setWarrantyType(data.warrantyType ?? 'Standard');
        setStatus(data.status ?? 'active');
        setCoverage(data.coverage ?? 'Parts & Labor');
        setStartDate(data.startDate ? String(data.startDate).split('T')[0] : '');
        setDurationMonths(data.durationMonths != null ? String(data.durationMonths) : '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const dto: UpdateWarrantyDto = {
        customerName,
        equipmentModel,
        warrantyType,
        status,
        coverage,
        startDate,
        durationMonths: durationMonths === '' ? undefined : Number(durationMonths),
      };
      await WarrantyService.updateWarranty(String(params.id), dto);
      router.push('/after-sales-service/warranties');
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
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Warranty</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{warranty.warrantyNumber}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Warranty Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Model
              </label>
              <input
                type="text"
                value={equipmentModel}
                onChange={(e) => setEquipmentModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Type</label>
              <select
                value={warrantyType}
                onChange={(e) => setWarrantyType(e.target.value as WarrantyType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WarrantyStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage</label>
              <select
                value={coverage}
                onChange={(e) => setCoverage(e.target.value as WarrantyCoverage)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COVERAGE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months)
              </label>
              <input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
