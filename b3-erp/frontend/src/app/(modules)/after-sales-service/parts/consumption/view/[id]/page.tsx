'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Package, Edit, AlertCircle, Calendar, User, MapPin, Wrench } from 'lucide-react';

interface ConsumptionItem {
  id?: string;
  partNumber?: string;
  partName?: string;
  category?: string;
  quantityConsumed?: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  serialNumber?: string;
}

interface PartsConsumption {
  id: string;
  consumptionId?: string;
  consumptionDate?: string;
  consumedBy?: string;
  department?: string;
  customerName?: string;
  jobType?: string;
  location?: string;
  workOrderNumber?: string;
  totalItems?: number;
  totalValue?: number;
  consumptionType?: string;
  approvalStatus?: string;
  laborHours?: number;
  completionStatus?: string;
  billable?: boolean;
  notes?: string;
  items?: ConsumptionItem[];
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

export default function ViewConsumptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rec, setRec] = useState<PartsConsumption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setRec({ ...data, items: Array.isArray(data.items) ? data.items : [] });
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{rec.consumptionId ?? rec.id}</h1>
            {rec.completionStatus && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {rec.completionStatus}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rec.department} • Consumed {formatDate(rec.consumptionDate)}
          </p>
        </div>
        <button
          onClick={() => router.push(`/after-sales-service/parts/consumption/edit/${rec.id}`)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Consumption Information</h2>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Consumed By:</span>
            <span className="text-gray-900">{rec.consumedBy ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Customer:</span>
            <span className="text-gray-900">{rec.customerName ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Job Type:</span>
            <span className="text-gray-900">{rec.jobType ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-900">{rec.location ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Work Order:</span>
            <span className="text-gray-900">{rec.workOrderNumber ?? '—'}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Consumption Type</span>
            <span className="text-gray-900">{rec.consumptionType ?? '—'}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Approval Status</span>
            <span className="text-gray-900">{rec.approvalStatus ?? '—'}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Items</span>
            <span className="text-gray-900">{rec.totalItems ?? rec.items?.length ?? 0}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Total Value</span>
            <span className="text-gray-900">{formatCurrency(rec.totalValue)}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Labor Hours</span>
            <span className="text-gray-900">{rec.laborHours ?? '—'}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-gray-500">Billable</span>
            <span className="text-gray-900">{rec.billable ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Consumed Parts</h2>
        {rec.items && rec.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Unit Cost</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2">Serial</th>
                </tr>
              </thead>
              <tbody>
                {rec.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <div className="text-gray-900">{item.partName ?? '—'}</div>
                      <div className="text-xs text-gray-500">{item.partNumber ?? ''}</div>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{item.category ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.quantityConsumed ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-700">{formatCurrency(item.unitCost)}</td>
                    <td className="py-2 pr-4 text-gray-700">{formatCurrency(item.totalCost)}</td>
                    <td className="py-2 pr-4 text-gray-700">{item.reason ?? '—'}</td>
                    <td className="py-2 text-gray-700">{item.serialNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 text-center">No line items on this record.</div>
        )}
      </div>

      {rec.notes && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{rec.notes}</div>
        </div>
      )}
    </div>
  );
}
