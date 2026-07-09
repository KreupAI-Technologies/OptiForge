'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Save, X, AlertCircle, ShoppingCart } from 'lucide-react';

interface PartsRequisition {
  id: string;
  requisitionNumber?: string;
  requestedBy?: string;
  department?: string;
  customerName?: string;
  priority?: string;
  status?: string;
  requiredDate?: string;
  supplier?: string;
  deliveryLocation?: string;
  justification?: string;
  internalNotes?: string;
  [key: string]: unknown;
}

export default function EditRequisitionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [req, setReq] = useState<PartsRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [requestedBy, setRequestedBy] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [justification, setJustification] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AfterSalesPagesService.partsRequisition<PartsRequisition>(String(params.id));
        if (cancelled) return;
        if (!data) {
          setError('Requisition not found.');
          setReq(null);
          return;
        }
        setReq(data);
        setRequestedBy(data.requestedBy ?? '');
        setCustomerName(data.customerName ?? '');
        setPriority(data.priority ?? '');
        setStatus(data.status ?? '');
        setRequiredDate(data.requiredDate ? String(data.requiredDate).split('T')[0] : '');
        setSupplier(data.supplier ?? '');
        setDeliveryLocation(data.deliveryLocation ?? '');
        setJustification(data.justification ?? '');
        setInternalNotes(data.internalNotes ?? '');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load requisition.');
          setReq(null);
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
      await AfterSalesPagesService.updatePartsRequisition(String(params.id), {
        requestedBy,
        customerName,
        priority: priority || undefined,
        status: status || undefined,
        requiredDate: requiredDate || undefined,
        supplier: supplier || undefined,
        deliveryLocation: deliveryLocation || undefined,
        justification: justification || undefined,
        internalNotes: internalNotes || undefined,
      });
      router.push('/after-sales-service/parts/requisition');
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

  if (error || !req) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load requisition</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Requisition not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/parts/requisition')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Requisitions
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
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Requisition</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{req.requisitionNumber ?? req.id}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Requisition Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. submitted, approved, delivered"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Date</label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
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
