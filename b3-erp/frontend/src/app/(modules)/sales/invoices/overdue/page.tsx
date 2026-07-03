'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  AlertCircle,
  Calendar,
  IndianRupee,
  Send,
  Eye,
  Download,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { InvoiceService } from '@/services/invoice.service';

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
  itemsCount: number;
  remindersSent: number;
  lastReminder?: string;
  overdueReason?: string;
}

export default function OverdueInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await InvoiceService.getOverdueInvoices()) as any[];
        const now = Date.now();
        const mapped: OverdueInvoice[] = (raw ?? []).map((inv) => {
          const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
          const daysOverdue = Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
          const itemsCount = Array.isArray(inv.lineItems) ? inv.lineItems.length : Number(inv.itemsCount ?? 0);
          return {
            id: String(inv.id ?? ''),
            invoiceNumber: inv.invoiceNumber ?? inv.number ?? '',
            customerName: inv.customerName ?? inv.customer?.name ?? '',
            customerEmail: inv.customerEmail ?? inv.customer?.email ?? '',
            customerPhone: inv.customerPhone ?? inv.customer?.phone ?? '',
            invoiceDate: inv.invoiceDate ?? '',
            dueDate: inv.dueDate ?? '',
            amount: Number(inv.amountDue ?? inv.totalAmount ?? inv.amount ?? 0),
            daysOverdue,
            itemsCount,
            remindersSent: Number(inv.remindersSent ?? 0),
            lastReminder: inv.lastReminder ?? undefined,
            overdueReason: inv.overdueReason ?? undefined,
          };
        });
        if (!cancelled) setOverdueInvoices(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load overdue invoices');
          setOverdueInvoices([]);
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

  const filteredInvoices = overdueInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const criticalOverdue = overdueInvoices.filter(inv => inv.daysOverdue > 30).length;
  const totalOverdueDays = overdueInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0);
  const avgOverdueDays = overdueInvoices.length > 0 ? Math.round(totalOverdueDays / overdueInvoices.length) : 0;

  const getOverdueColor = (days: number) => {
    if (days > 30) return 'bg-red-600';
    if (days > 15) return 'bg-orange-600';
    return 'bg-yellow-600';
  };

  const getOverdueTextColor = (days: number) => {
    if (days > 30) return 'text-red-600';
    if (days > 15) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading overdue invoices…
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
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Urgent Notices
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Overdue</p>
                <p className="text-3xl font-bold mt-2">₹{(totalAmount / 100000).toFixed(1)}L</p>
                <p className="text-red-100 text-xs mt-1">{overdueInvoices.length} invoices</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Critical ({'>'}30 days)</p>
                <p className="text-3xl font-bold mt-2">{criticalOverdue}</p>
                <p className="text-orange-100 text-xs mt-1">Immediate action needed</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Avg Overdue Days</p>
                <p className="text-3xl font-bold mt-2">{avgOverdueDays}</p>
                <p className="text-yellow-100 text-xs mt-1">days</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="w-8 h-8" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredInvoices.map((invoice) => {
            const isCritical = invoice.daysOverdue > 30;
            const isSevere = invoice.daysOverdue > 15;

            return (
              <div key={invoice.id} className={`bg-white rounded-xl shadow-sm border-2 p-3 hover:shadow-md transition-shadow ${isCritical ? 'border-red-500' : isSevere ? 'border-orange-400' : 'border-yellow-400'}`}>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                        <AlertCircle className={`w-5 h-5 ${getOverdueTextColor(invoice.daysOverdue)}`} />
                      </div>
                      <p className="text-gray-600 mt-1">{invoice.customerName}</p>
                    </div>
                  </div>

                  {/* Overdue Banner */}
                  <div className={`${getOverdueColor(invoice.daysOverdue)} rounded-lg p-3 text-white`}>
                    <p className="text-white text-sm font-medium">OVERDUE</p>
                    <p className="text-3xl font-bold mt-1">{invoice.daysOverdue} days</p>
                    <p className="text-white text-xs mt-1">Past due date</p>
                  </div>

                  {/* Amount */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm">Outstanding Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{invoice.amount.toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-xs mt-1">{invoice.itemsCount} items</p>
                  </div>

                  {/* Customer Contact */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Mail className="w-4 h-4" />
                      <span>{invoice.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Phone className="w-4 h-4" />
                      <span>{invoice.customerPhone}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-medium text-red-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Invoice Date</p>
                      <p className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Reminders */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>{invoice.remindersSent}</strong> reminders sent
                      {invoice.lastReminder && (
                        <span className="block mt-1 text-xs">
                          Last sent: {new Date(invoice.lastReminder).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Reason */}
                  {invoice.overdueReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Reason:</strong> {invoice.overdueReason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Overdue Invoices</h3>
            <p className="text-gray-600">No invoices match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
