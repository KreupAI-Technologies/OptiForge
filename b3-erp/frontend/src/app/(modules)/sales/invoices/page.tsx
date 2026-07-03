'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Download,
  Send,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { InvoiceService } from '@/services/invoice.service';

interface InvoiceSummary {
  total: number;
  count: number;
}

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  paymentDate?: string;
}

// Map backend InvoiceStatus enum values to the page's simplified status buckets.
const normalizeStatus = (raw: string): string => {
  const s = (raw ?? '').toString().toUpperCase();
  if (s === 'PAID') return 'paid';
  if (s === 'OVERDUE') return 'overdue';
  if (s === 'PARTIALLY_PAID' || s === 'POSTED' || s === 'APPROVED' || s === 'PENDING_APPROVAL' || s === 'DRAFT') {
    return 'pending';
  }
  return 'pending';
};

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [summaryData, setSummaryData] = useState({
    pending: { total: 0, count: 0 },
    paid: { total: 0, count: 0 },
    overdue: { total: 0, count: 0 },
    creditNotes: { total: 0, count: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = (await InvoiceService.getAllInvoices({ limit: 100 })) as any;
        const raw: any[] = Array.isArray(response) ? response : (response?.data ?? []);

        const mapped: RecentInvoice[] = raw.map((inv) => ({
          id: String(inv.id ?? ''),
          invoiceNumber: inv.invoiceNumber ?? inv.number ?? '',
          customerName: inv.customerName ?? inv.customer?.name ?? '',
          date: inv.invoiceDate ?? inv.date ?? '',
          dueDate: inv.dueDate ?? '',
          amount: Number(inv.totalAmount ?? inv.amount ?? 0),
          status: normalizeStatus(inv.status),
          paymentDate: inv.paidAt ?? inv.paymentDate ?? undefined,
        }));

        // Derive summary buckets defensively from the fetched invoices.
        const summary = {
          pending: { total: 0, count: 0 },
          paid: { total: 0, count: 0 },
          overdue: { total: 0, count: 0 },
          creditNotes: { total: 0, count: 0 },
        };
        raw.forEach((inv) => {
          const amount = Number(inv.totalAmount ?? inv.amount ?? 0);
          const type = (inv.type ?? '').toString().toUpperCase();
          if (type === 'CREDIT_NOTE') {
            summary.creditNotes.total += amount;
            summary.creditNotes.count += 1;
            return;
          }
          const bucket = normalizeStatus(inv.status);
          if (bucket === 'paid') {
            summary.paid.total += amount;
            summary.paid.count += 1;
          } else if (bucket === 'overdue') {
            summary.overdue.total += amount;
            summary.overdue.count += 1;
          } else {
            summary.pending.total += amount;
            summary.pending.count += 1;
          }
        });

        if (!cancelled) {
          setRecentInvoices(mapped.slice(0, 5));
          setSummaryData(summary);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load invoices');
          setRecentInvoices([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading invoices…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
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
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <Link
              href="/sales/invoices/create"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/sales/invoices/pending">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Invoices</p>
                  <p className="text-3xl font-bold mt-2">₹{(summaryData.pending.total / 100000).toFixed(1)}L</p>
                  <p className="text-yellow-100 text-xs mt-1">{summaryData.pending.count} invoices</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sales/invoices/paid">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Paid Invoices</p>
                  <p className="text-3xl font-bold mt-2">₹{(summaryData.paid.total / 10000000).toFixed(2)}Cr</p>
                  <p className="text-green-100 text-xs mt-1">{summaryData.paid.count} invoices</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sales/invoices/overdue">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Overdue Invoices</p>
                  <p className="text-3xl font-bold mt-2">₹{(summaryData.overdue.total / 100000).toFixed(1)}L</p>
                  <p className="text-red-100 text-xs mt-1">{summaryData.overdue.count} invoices</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sales/invoices/credit-notes">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Credit Notes</p>
                  <p className="text-3xl font-bold mt-2">₹{(summaryData.creditNotes.total / 100000).toFixed(1)}L</p>
                  <p className="text-purple-100 text-xs mt-1">{summaryData.creditNotes.count} notes</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/sales/invoices/create"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create New Invoice</p>
                  <p className="text-sm text-gray-600">Generate a new invoice</p>
                </div>
              </Link>
              <Link
                href="/sales/invoices/pending"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Send className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Send Reminders</p>
                  <p className="text-sm text-gray-600">Send payment reminders</p>
                </div>
              </Link>
              <Link
                href="/sales/invoices/overdue"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Review Overdue</p>
                  <p className="text-sm text-gray-600">Check overdue payments</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-3">
              {!isLoading && !loadError && recentInvoices.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  No invoices found.
                </div>
              )}
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{invoice.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900">₹{((summaryData.pending.total + summaryData.paid.total + summaryData.overdue.total) / 10000000).toFixed(2)}Cr</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Collection Rate</p>
              <p className="text-2xl font-bold text-green-600">73%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Avg Payment Time</p>
              <p className="text-2xl font-bold text-gray-900">28 days</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">₹{((summaryData.pending.total + summaryData.overdue.total) / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
