'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Clock,
  Calendar,
  IndianRupee,
  Send,
  Eye,
  Download,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { InvoiceService } from '@/services/invoice.service';

interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  daysUntilDue: number;
  itemsCount: number;
  lastReminder?: string;
  remindersSent: number;
}

export default function PendingInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = (await InvoiceService.getAllInvoices({ limit: 200 })) as any;
        const raw: any[] = Array.isArray(response) ? response : (response?.data ?? []);
        const now = Date.now();
        // "Pending" = not yet paid, not overdue, not cancelled/void.
        const pendingStatuses = new Set(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'PARTIALLY_PAID']);
        const mapped: PendingInvoice[] = (raw ?? [])
          .filter((inv) => pendingStatuses.has((inv.status ?? '').toString().toUpperCase()))
          .map((inv) => {
            const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
            const daysUntilDue = Math.round((due - now) / (1000 * 60 * 60 * 24));
            const itemsCount = Array.isArray(inv.lineItems) ? inv.lineItems.length : Number(inv.itemsCount ?? 0);
            return {
              id: String(inv.id ?? ''),
              invoiceNumber: inv.invoiceNumber ?? inv.number ?? '',
              customerName: inv.customerName ?? inv.customer?.name ?? '',
              invoiceDate: inv.invoiceDate ?? '',
              dueDate: inv.dueDate ?? '',
              amount: Number(inv.amountDue ?? inv.totalAmount ?? inv.amount ?? 0),
              daysUntilDue,
              itemsCount,
              lastReminder: inv.lastReminder ?? undefined,
              remindersSent: Number(inv.remindersSent ?? 0),
            };
          });
        if (!cancelled) setPendingInvoices(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pending invoices');
          setPendingInvoices([]);
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

  const filteredInvoices = pendingInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const dueSoon = pendingInvoices.filter(inv => inv.daysUntilDue <= 7).length;
  const needsReminder = pendingInvoices.filter(inv => inv.daysUntilDue <= 15 && (!inv.lastReminder || new Date(inv.lastReminder) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).length;

  const getDaysColor = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-100';
    if (days <= 7) return 'text-orange-600 bg-orange-100';
    if (days <= 15) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading pending invoices…
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
              Export List
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Bulk Reminders
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Pending</p>
                <p className="text-3xl font-bold mt-2">₹{(totalAmount / 100000).toFixed(1)}L</p>
                <p className="text-yellow-100 text-xs mt-1">{pendingInvoices.length} invoices</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Due Soon</p>
                <p className="text-3xl font-bold mt-2">{dueSoon}</p>
                <p className="text-orange-100 text-xs mt-1">Within 7 days</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Needs Reminder</p>
                <p className="text-3xl font-bold mt-2">{needsReminder}</p>
                <p className="text-blue-100 text-xs mt-1">Action required</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Send className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredInvoices.map((invoice) => {
            const isUrgent = invoice.daysUntilDue <= 7;

            return (
              <div key={invoice.id} className={`bg-white rounded-xl shadow-sm border-2 p-3 hover:shadow-md transition-shadow ${isUrgent ? 'border-orange-300' : 'border-gray-200'}`}>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                        {isUrgent && (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{invoice.customerName}</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">More</span>
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-3 text-white">
                    <p className="text-yellow-100 text-sm font-medium">Invoice Amount</p>
                    <p className="text-3xl font-bold mt-1">₹{invoice.amount.toLocaleString('en-IN')}</p>
                    <p className="text-yellow-100 text-xs mt-1">{invoice.itemsCount} items</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Date</p>
                      <p className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Days Until Due */}
                  <div className={`px-3 py-2 rounded-lg ${getDaysColor(invoice.daysUntilDue)} text-center`}>
                    <p className="font-semibold">
                      {invoice.daysUntilDue} {invoice.daysUntilDue === 1 ? 'day' : 'days'} until due
                    </p>
                  </div>

                  {/* Reminders */}
                  {invoice.remindersSent > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>{invoice.remindersSent}</strong> {invoice.remindersSent === 1 ? 'reminder' : 'reminders'} sent
                        {invoice.lastReminder && (
                          <span className="block mt-1 text-xs">
                            Last sent: {new Date(invoice.lastReminder).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Reminder
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Invoices</h3>
            <p className="text-gray-600">No invoices match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
