'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, User, Calendar, Package } from 'lucide-react';
import {
  cpqQuoteService,
  Quote,
  QuoteItem,
} from '@/services/cpq/cpq-quote.service';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  converted: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const currency = (value: number, code = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code || 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function QuoteViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = await cpqQuoteService.findOne(id);
        if (cancelled) return;
        setQuote(q);
        try {
          const its = await cpqQuoteService.findItems(id);
          if (!cancelled) setItems(Array.isArray(its) ? its : []);
        } catch {
          if (!cancelled) setItems([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load quote');
          setQuote(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-3">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {quote?.quoteNumber || 'Quote'}
            </h1>
            <p className="text-sm text-gray-500">Quote detail</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-3 text-gray-500">Loading quote…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && quote && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {quote.title}
                </h2>
                {quote.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {quote.description}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  STATUS_STYLES[quote.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {quote.status?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {quote.customerName || '-'}
                  </p>
                  {quote.customerEmail && (
                    <p className="text-xs text-gray-500">
                      {quote.customerEmail}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Valid until</p>
                  <p className="text-sm font-medium text-gray-900">
                    {quote.expiresAt
                      ? new Date(quote.expiresAt).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {currency(Number(quote.totalAmount), quote.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Line items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Unit price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                        {item.productSku && (
                          <div className="text-xs text-gray-500">
                            {item.productSku}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">
                        {currency(Number(item.unitPrice), quote.currency)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        {currency(Number(item.lineTotal), quote.currency)}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-gray-400"
                      >
                        No line items on this quote.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 px-4 py-3">
              <div className="ml-auto w-full sm:w-72 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency(Number(quote.subtotal), quote.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>
                    -{currency(Number(quote.discountAmount), quote.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{currency(Number(quote.taxAmount), quote.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>
                    {currency(Number(quote.totalAmount), quote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
