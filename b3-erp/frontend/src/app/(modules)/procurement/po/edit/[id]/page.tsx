'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, AlertCircle } from 'lucide-react';
import {
  purchaseOrderService,
  type POStatus,
  type UpdatePurchaseOrderDto,
} from '@/services/purchase-order.service';

interface FormState {
  poNumber: string;
  vendorName: string;
  vendorCode: string;
  orderDate: string;
  deliveryDate: string;
  paymentTerms: string;
  currency: string;
  status: POStatus;
  notes: string;
  terms: string;
  totalAmount: number;
}

const PO_STATUS_OPTIONS: POStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Sent to Vendor',
  'Partially Received',
  'Fully Received',
  'Closed',
  'Cancelled',
];

export default function PurchaseOrderEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);
      try {
        const po = await purchaseOrderService.getPurchaseOrderById(params.id);
        if (cancelled) return;
        if (!po || !po.id) {
          setNotFound(true);
          return;
        }
        setForm({
          poNumber: po.poNumber ?? '',
          vendorName: po.vendorName ?? '',
          vendorCode: po.vendorCode ?? '',
          orderDate: po.orderDate ? String(po.orderDate).slice(0, 10) : '',
          deliveryDate: po.deliveryDate ? String(po.deliveryDate).slice(0, 10) : '',
          paymentTerms: po.paymentTerms ?? '',
          currency: po.currency ?? 'USD',
          status: (po.status ?? 'Draft') as POStatus,
          notes: po.notes ?? '',
          terms: po.terms ?? '',
          totalAmount: Number(po.totalAmount ?? 0),
        });
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load purchase order';
          if (/not found|404/i.test(msg)) setNotFound(true);
          else setLoadError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const setField = (key: keyof FormState, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload: UpdatePurchaseOrderDto = {
        deliveryDate: form.deliveryDate,
        paymentTerms: form.paymentTerms,
        currency: form.currency,
        notes: form.notes,
        terms: form.terms,
        status: form.status,
      };
      await purchaseOrderService.updatePurchaseOrder(params.id, payload);
      router.push('/procurement/po');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save purchase order');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div className="w-full h-full px-3 py-2 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
            <p className="text-sm text-gray-600">{form?.poNumber}</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading purchase order…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {notFound && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Purchase order not found.
        </div>
      )}

      {form && !isLoading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
              <input type="text" value={form.poNumber} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={`${form.vendorName}${form.vendorCode ? ` (${form.vendorCode})` : ''}`}
                disabled
                className={`${inputCls} bg-gray-50 text-gray-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Order Date</label>
              <input type="date" value={form.orderDate} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" value={form.deliveryDate} onChange={(e) => setField('deliveryDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
              <input type="text" value={form.paymentTerms} onChange={(e) => setField('paymentTerms', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
              <input type="text" value={form.currency} onChange={(e) => setField('currency', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value as POStatus)} className={inputCls}>
                {PO_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={2} className={inputCls} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Terms</label>
              <textarea value={form.terms} onChange={(e) => setField('terms', e.target.value)} rows={2} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/procurement/po')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
