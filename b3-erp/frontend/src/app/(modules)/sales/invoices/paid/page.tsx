'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Calendar,
  IndianRupee,
  Eye,
  Download,
  Filter,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { InvoiceService } from '@/services/invoice.service';

interface PaidInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  paidDate: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  daysEarly: number;
  itemsCount: number;
}

export default function PaidInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = (await InvoiceService.getAllInvoices({ status: 'PAID' as any, limit: 200 })) as any;
        const raw: any[] = Array.isArray(response) ? response : (response?.data ?? []);
        const mapped: PaidInvoice[] = (raw ?? [])
          .filter((inv) => (inv.status ?? '').toString().toUpperCase() === 'PAID')
          .map((inv) => {
            const paidDate = inv.paidAt ?? inv.paidDate ?? inv.postedAt ?? '';
            const due = inv.dueDate ? new Date(inv.dueDate).getTime() : 0;
            const paid = paidDate ? new Date(paidDate).getTime() : 0;
            const daysEarly = due && paid ? Math.max(0, Math.floor((due - paid) / (1000 * 60 * 60 * 24))) : 0;
            const itemsCount = Array.isArray(inv.lineItems) ? inv.lineItems.length : Number(inv.itemsCount ?? 0);
            return {
              id: String(inv.id ?? ''),
              invoiceNumber: inv.invoiceNumber ?? inv.number ?? '',
              customerName: inv.customerName ?? inv.customer?.name ?? '',
              invoiceDate: inv.invoiceDate ?? '',
              dueDate: inv.dueDate ?? '',
              paidDate: paidDate,
              amount: Number(inv.totalAmount ?? inv.amountPaid ?? inv.amount ?? 0),
              paymentMethod: inv.paymentMethod ?? '—',
              transactionRef: inv.transactionRef ?? inv.reference ?? '—',
              daysEarly,
              itemsCount,
            };
          });
        if (!cancelled) setPaidInvoices(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load paid invoices');
          setPaidInvoices([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInvoices = paidInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const avgPaymentTime = paidInvoices.length > 0 ? Math.round(
    paidInvoices.reduce((sum, inv) => {
      const daysToPayment = Math.floor(
        (new Date(inv.paidDate).getTime() - new Date(inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + (Number.isFinite(daysToPayment) ? daysToPayment : 0);
    }, 0) / paidInvoices.length
  ) : 0;
  const paidEarly = paidInvoices.filter(inv => inv.daysEarly > 0).length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-3 py-2">
      <div className="space-y-3">
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
              Download Receipts
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Paid</p>
                <p className="text-3xl font-bold mt-2">₹{(totalAmount / 10000000).toFixed(2)}Cr</p>
                <p className="text-green-100 text-xs mt-1">{paidInvoices.length} invoices</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Avg Payment Time</p>
                <p className="text-3xl font-bold mt-2">{avgPaymentTime}</p>
                <p className="text-blue-100 text-xs mt-1">days</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Paid Early</p>
                <p className="text-3xl font-bold mt-2">{paidEarly}</p>
                <p className="text-purple-100 text-xs mt-1">Before due date</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading paid invoices…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Months</option>
              <option value="2025-11">November 2025</option>
              <option value="2025-10">October 2025</option>
              <option value="2025-09">September 2025</option>
            </select>
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 mt-1">{invoice.customerName}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white">
                  <p className="text-green-100 text-sm font-medium">Paid Amount</p>
                  <p className="text-3xl font-bold mt-1">₹{invoice.amount.toLocaleString('en-IN')}</p>
                  <p className="text-green-100 text-xs mt-1">{invoice.itemsCount} items</p>
                </div>

                {/* Payment Details */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-700 font-medium">Payment Date</p>
                      <p className="text-green-900">{new Date(invoice.paidDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">Method</p>
                      <p className="text-green-900">{invoice.paymentMethod}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-green-700 font-medium">Transaction Ref</p>
                      <p className="text-green-900 font-mono text-xs">{invoice.transactionRef}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                {invoice.daysEarly > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      ✓ Paid <strong>{invoice.daysEarly}</strong> {invoice.daysEarly === 1 ? 'day' : 'days'} early
                    </p>
                  </div>
                )}
                {invoice.daysEarly === 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">✓ Paid on due date</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Invoice Date</p>
                    <p className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Receipt
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Paid Invoices</h3>
            <p className="text-gray-600">No invoices match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
