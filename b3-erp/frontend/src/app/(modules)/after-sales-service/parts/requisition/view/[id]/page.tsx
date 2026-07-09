'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { ShoppingCart, Edit, AlertCircle, Package, Calendar, User, MapPin } from 'lucide-react';

interface RequisitionItem {
  id?: string;
  partNumber?: string;
  partName?: string;
  category?: string;
  requestedQuantity?: number;
  approvedQuantity?: number;
  unitCost?: number;
  totalCost?: number;
  status?: string;
}

interface PartsRequisition {
  id: string;
  requisitionNumber?: string;
  requestDate?: string;
  requiredDate?: string;
  requestedBy?: string;
  department?: string;
  customerName?: string;
  priority?: string;
  status?: string;
  totalItems?: number;
  totalValue?: number;
  estimatedCost?: number;
  actualCost?: number;
  supplier?: string;
  deliveryLocation?: string;
  justification?: string;
  internalNotes?: string;
  items?: RequisitionItem[];
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

export default function ViewRequisitionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [req, setReq] = useState<PartsRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setReq({ ...data, items: Array.isArray(data.items) ? data.items : [] });
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {req.requisitionNumber ?? req.id}
            </h1>
            {req.status && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {req.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {req.department} • Requested {formatDate(req.requestDate)}
          </p>
        </div>
        <button
          onClick={() => router.push(`/after-sales-service/parts/requisition/edit/${req.id}`)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Request Information</h2>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Requested By:</span>
            <span className="text-gray-900">{req.requestedBy ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Customer:</span>
            <span className="text-gray-900">{req.customerName ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Required Date:</span>
            <span className="text-gray-900">{formatDate(req.requiredDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Delivery Location:</span>
            <span className="text-gray-900">{req.deliveryLocation ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Priority:</span>{' '}
            <span className="text-gray-900">{req.priority ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Supplier:</span>{' '}
            <span className="text-gray-900">{req.supplier ?? '—'}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Costs</h2>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Items</span>
            <span className="text-gray-900">{req.totalItems ?? req.items?.length ?? 0}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Value</span>
            <span className="text-gray-900">{formatCurrency(req.totalValue)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Estimated Cost</span>
            <span className="text-gray-900">{formatCurrency(req.estimatedCost)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Actual Cost</span>
            <span className="text-gray-900">{formatCurrency(req.actualCost)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Requested Parts</h2>
        {req.items && req.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Requested</th>
                  <th className="py-2 pr-4">Approved</th>
                  <th className="py-2 pr-4">Unit Cost</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-gray-900">{item.partName ?? '—'}</div>
                          <div className="text-xs text-gray-500">{item.partNumber ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{item.category ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.requestedQuantity ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.approvedQuantity ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{formatCurrency(item.unitCost)}</td>
                    <td className="py-2 pr-4 text-gray-700">{formatCurrency(item.totalCost)}</td>
                    <td className="py-2 text-gray-700">{item.status ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 text-center">No line items on this requisition.</div>
        )}
      </div>

      {(req.justification || req.internalNotes) && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
          {req.justification && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Justification</div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{req.justification}</div>
            </div>
          )}
          {req.internalNotes && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Internal Notes</div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{req.internalNotes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
