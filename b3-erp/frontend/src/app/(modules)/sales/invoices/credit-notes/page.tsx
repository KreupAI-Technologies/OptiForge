'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  IndianRupee,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'applied' | 'refunded';
  type: 'full_refund' | 'partial_refund' | 'discount_adjustment' | 'return' | 'defect';
  itemsCount: number;
  appliedDate?: string;
  refundMethod?: string;
  notes?: string;
}

export default function CreditNotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: CreditNote[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          creditNoteNumber: r.creditNoteNumber ?? '',
          invoiceNumber: r.invoiceNumber ?? '',
          customerName: r.customerName ?? '',
          issueDate: r.issueDate ?? '',
          amount: r.amount ?? 0,
          reason: r.reason ?? '',
          status: (r.status ?? 'pending') as CreditNote['status'],
          type: (r.type ?? 'return') as CreditNote['type'],
          itemsCount: r.itemsCount ?? 0,
          appliedDate: r.appliedDate,
          refundMethod: r.refundMethod,
          notes: r.notes,
        }));
        if (!cancelled) setCreditNotes(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCreditNotes([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCreditNotes = creditNotes.filter(note => {
    const matchesSearch =
      note.creditNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || note.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = creditNotes.reduce((sum, note) => sum + note.amount, 0);
  const pendingAmount = creditNotes.filter(n => n.status === 'pending' || n.status === 'approved').reduce((sum, note) => sum + note.amount, 0);
  const approvedCount = creditNotes.filter(n => n.status === 'approved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'applied': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'applied': return <CheckCircle className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full_refund': return 'Full Refund';
      case 'partial_refund': return 'Partial Refund';
      case 'discount_adjustment': return 'Discount Adjustment';
      case 'return': return 'Return';
      case 'defect': return 'Defect/Damage';
      default: return type;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Credit Note
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Credit Notes</p>
                <p className="text-3xl font-bold mt-2">₹{(totalAmount / 100000).toFixed(1)}L</p>
                <p className="text-purple-100 text-xs mt-1">{creditNotes.length} notes</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Processing</p>
                <p className="text-3xl font-bold mt-2">₹{(pendingAmount / 100000).toFixed(1)}L</p>
                <p className="text-yellow-100 text-xs mt-1">Awaiting action</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold mt-2">{approvedCount}</p>
                <p className="text-blue-100 text-xs mt-1">Ready to process</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by credit note, invoice, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="applied">Applied</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Credit Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredCreditNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{note.creditNoteNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(note.status)}`}>
                        {getStatusIcon(note.status)}
                        {note.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Invoice: {note.invoiceNumber}</p>
                    <p className="text-gray-600 mt-1">{note.customerName}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-3 text-white">
                  <p className="text-purple-100 text-sm font-medium">Credit Amount</p>
                  <p className="text-3xl font-bold mt-1">₹{note.amount.toLocaleString('en-IN')}</p>
                  <p className="text-purple-100 text-xs mt-1">{note.itemsCount} items</p>
                </div>

                {/* Type and Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Type</p>
                      <p className="text-sm text-blue-700">{getTypeLabel(note.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Reason</p>
                      <p className="text-sm text-blue-700">{note.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Issue Date</p>
                    <p className="font-medium text-gray-900">{new Date(note.issueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  {note.appliedDate && (
                    <div>
                      <p className="text-gray-600">Applied Date</p>
                      <p className="font-medium text-green-600">{new Date(note.appliedDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                </div>

                {/* Refund Method */}
                {note.refundMethod && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Refund Method:</strong> {note.refundMethod}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {note.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> {note.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  {note.status === 'pending' && (
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  {note.status === 'approved' && (
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Process Refund
                    </button>
                  )}
                  {(note.status === 'applied' || note.status === 'refunded') && (
                    <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCreditNotes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credit Notes</h3>
            <p className="text-gray-600">No credit notes match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
