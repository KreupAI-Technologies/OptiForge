'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { RotateCcw, Edit, AlertCircle, Calendar, User, MapPin } from 'lucide-react';

interface ReturnItem {
  id?: string;
  partNumber?: string;
  partName?: string;
  category?: string;
  quantityReturned?: number;
  quantityAccepted?: number;
  quantityRejected?: number;
  unitCost?: number;
  totalCost?: number;
  condition?: string;
  action?: string;
}

interface PartsReturn {
  id: string;
  returnId?: string;
  returnDate?: string;
  returnedBy?: string;
  department?: string;
  customerName?: string;
  returnReason?: string;
  returnType?: string;
  location?: string;
  status?: string;
  qualityStatus?: string;
  totalItems?: number;
  totalValue?: number;
  refundAmount?: number;
  creditNoteIssued?: boolean;
  creditNoteNumber?: string;
  restockingFee?: number;
  restockingFeePercent?: number;
  notes?: string;
  items?: ReturnItem[];
}

const formatDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? '—'
    : dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatCurrency = (n?: number) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ViewReturnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ret, setRet] = useState<PartsReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setRet({ ...data, items: Array.isArray(data.items) ? data.items : [] });
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{ret.returnId ?? ret.id}</h1>
            {ret.status && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {ret.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {ret.department} • Returned {formatDate(ret.returnDate)}
          </p>
        </div>
        <button
          onClick={() => router.push(`/after-sales-service/parts/returns/edit/${ret.id}`)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Return Information</h2>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Returned By:</span>
            <span className="text-gray-900">{ret.returnedBy ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Customer:</span>
            <span className="text-gray-900">{ret.customerName ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Return Reason:</span>{' '}
            <span className="text-gray-900">{ret.returnReason ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Return Type:</span>{' '}
            <span className="text-gray-900">{ret.returnType ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-900">{ret.location ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Quality Status:</span>{' '}
            <span className="text-gray-900">{ret.qualityStatus ?? '—'}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Financials</h2>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Items</span>
            <span className="text-gray-900">{ret.totalItems ?? ret.items?.length ?? 0}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Value</span>
            <span className="text-gray-900">{formatCurrency(ret.totalValue)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Refund Amount</span>
            <span className="text-gray-900">{formatCurrency(ret.refundAmount)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Restocking Fee</span>
            <span className="text-gray-900">
              {formatCurrency(ret.restockingFee)}
              {ret.restockingFeePercent != null ? ` (${ret.restockingFeePercent}%)` : ''}
            </span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Credit Note</span>
            <span className="text-gray-900">
              {ret.creditNoteIssued ? ret.creditNoteNumber ?? 'Issued' : 'Not issued'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Returned Parts</h2>
        {ret.items && ret.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Returned</th>
                  <th className="py-2 pr-4">Accepted</th>
                  <th className="py-2 pr-4">Rejected</th>
                  <th className="py-2 pr-4">Condition</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {ret.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <div className="text-gray-900">{item.partName ?? '—'}</div>
                      <div className="text-xs text-gray-500">{item.partNumber ?? ''}</div>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{item.category ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.quantityReturned ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.quantityAccepted ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.quantityRejected ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.condition ?? '—'}</td>
                    <td className="py-2 text-gray-700">{item.action ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 text-center">No line items on this record.</div>
        )}
      </div>

      {ret.notes && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{ret.notes}</div>
        </div>
      )}
    </div>
  );
}
