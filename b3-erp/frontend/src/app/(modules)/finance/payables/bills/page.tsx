'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Building,
  DollarSign,
  Tag,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface VendorBill {
  billId: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  billDate: string;
  dueDate: string;
  poNumber?: string;
  grnNumber?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  currency: string;
  description: string;
  category: string;
  attachments: number;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  lastPaymentDate?: string;
  notes?: string;
}

export default function VendorBillsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Mock data
  const billStats = {
    totalBills: 142,
    pendingApproval: 12,
    approved: 48,
    overdue: 8,
    totalAmount: 8750000,
    paidAmount: 5280000,
    pendingAmount: 3470000
  };

  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await FinanceService.getInvoices({ invoiceType: 'Purchase Invoice' });
        const mapped: VendorBill[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          billId: r.id ?? '',
          billNumber: r.invoiceNumber ?? '',
          vendorId: r.partyId ?? '',
          vendorName: r.partyName ?? '',
          billDate: r.invoiceDate ? String(r.invoiceDate).slice(0, 10) : '',
          dueDate: r.dueDate ? String(r.dueDate).slice(0, 10) : '',
          poNumber: r.referenceNumber ?? undefined,
          grnNumber: undefined,
          subtotal: Number(r.subtotal ?? 0),
          taxAmount: Number(r.taxAmount ?? 0),
          totalAmount: Number(r.totalAmount ?? 0),
          paidAmount: Number(r.paidAmount ?? 0),
          balanceAmount: Number(r.balanceAmount ?? (Number(r.totalAmount ?? 0) - Number(r.paidAmount ?? 0))),
          status: (r.status ?? 'draft').toString().toLowerCase().replace(/\s+/g, '_') as VendorBill['status'],
          paymentTerms: r.paymentTerms ?? '',
          currency: r.currency ?? 'INR',
          description: r.notes ?? r.description ?? '',
          category: r.category ?? '',
          attachments: Number(r.attachments ?? 0),
          createdBy: r.createdBy ?? '',
          createdDate: r.createdAt ? String(r.createdAt).slice(0, 10) : '',
        }));
        if (!cancelled) setVendorBills(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load bills');
          setVendorBills([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'partially_paid': return 'text-purple-600 bg-purple-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredBills = vendorBills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.poNumber && bill.poNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectBill = (billId: string) => {
    setSelectedBills(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBills.length === filteredBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBills.map(bill => bill.billId));
    }
  };

  const handleExportBills = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Bill Number', 'Vendor Name', 'Bill Date', 'Due Date', 'PO Number', 'GRN Number', 'Subtotal', 'Tax', 'Total', 'Paid', 'Balance', 'Status', 'Category', 'Payment Terms', 'Created By', 'Created Date'];
      const rows = filteredBills.map(b => [
        b.billNumber,
        b.vendorName,
        b.billDate,
        b.dueDate,
        b.poNumber || '',
        b.grnNumber || '',
        b.subtotal,
        b.taxAmount,
        b.totalAmount,
        b.paidAmount,
        b.balanceAmount,
        b.status,
        b.category,
        b.paymentTerms,
        b.createdBy,
        b.createdDate
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vendor_Bills_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 500);
  };

  const handleDeleteBill = (billId: string, billNumber: string) => {
    const confirmDelete = confirm(`Are you sure you want to delete bill ${billNumber}?\n\nThis action cannot be undone. The bill will be permanently removed from the system.`);
    if (confirmDelete) {
      alert(`Bill ${billNumber} would be deleted.\n\nNote: This is a demo. In production, this would:\n- Mark the bill as deleted in the database\n- Update related transactions\n- Log the deletion in audit trail\n- Send notifications if configured`);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full h-full px-3 py-2">
          {isLoading && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading bills…</div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
          )}
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Vendor Bills</h1>
              </div>
              <p className="text-sm text-gray-600">Manage vendor invoices and bills</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={handleExportBills}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button
                onClick={() => router.push('/finance/payables/add')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Bill</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{billStats.totalBills}</p>
              <p className="text-xs text-gray-500 mt-1">All vendor bills</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-700">Pending Approval</p>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">{billStats.pendingApproval}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Approved</p>
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{billStats.approved}</p>
              <p className="text-xs text-blue-600 mt-1">Ready for payment</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Overdue</p>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">{billStats.overdue}</p>
              <p className="text-xs text-red-600 mt-1">Past due date</p>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bill Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{(billStats.totalAmount / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{(billStats.paidAmount / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">₹{(billStats.pendingAmount / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Services">Services</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Bills Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBills.length === filteredBills.length && filteredBills.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.map((bill) => (
                    <React.Fragment key={bill.billId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedBills.includes(bill.billId)}
                            onChange={() => handleSelectBill(bill.billId)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedBill(expandedBill === bill.billId ? null : bill.billId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedBill === bill.billId ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                              {bill.poNumber && <div className="text-xs text-gray-500">PO: {bill.poNumber}</div>}
                              <div className="text-xs text-gray-500">{bill.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900">{bill.vendorName}</div>
                          <div className="text-xs text-gray-500">{bill.vendorId}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900">Bill: {bill.billDate}</div>
                          <div className="text-xs text-gray-500">Due: {bill.dueDate}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {bill.currency}{(bill.totalAmount / 1000).toFixed(0)}K
                          </div>
                          {bill.paidAmount > 0 && (
                            <div className="text-xs text-green-600">
                              Paid: {bill.currency}{(bill.paidAmount / 1000).toFixed(0)}K
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                            {getStatusLabel(bill.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/finance/payables/view/${bill.billId}`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/finance/payables/edit/${bill.billId}`)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill.billId, bill.billNumber)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete bill"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedBill === bill.billId && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-3 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Description</p>
                                <p className="font-medium text-gray-900">{bill.description}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Payment Terms</p>
                                <p className="font-medium text-gray-900">{bill.paymentTerms}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Subtotal / Tax</p>
                                <p className="font-medium text-gray-900">
                                  {bill.currency}{(bill.subtotal / 1000).toFixed(0)}K / {bill.currency}{(bill.taxAmount / 1000).toFixed(0)}K
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Created By</p>
                                <p className="font-medium text-gray-900">{bill.createdBy}</p>
                                <p className="text-xs text-gray-500">{bill.createdDate}</p>
                              </div>
                              {bill.grnNumber && (
                                <div>
                                  <p className="text-gray-500 mb-1">GRN Number</p>
                                  <p className="font-medium text-gray-900">{bill.grnNumber}</p>
                                </div>
                              )}
                              {bill.approvedBy && (
                                <div>
                                  <p className="text-gray-500 mb-1">Approved By</p>
                                  <p className="font-medium text-gray-900">{bill.approvedBy}</p>
                                  <p className="text-xs text-gray-500">{bill.approvedDate}</p>
                                </div>
                              )}
                              {bill.lastPaymentDate && (
                                <div>
                                  <p className="text-gray-500 mb-1">Last Payment</p>
                                  <p className="font-medium text-gray-900">{bill.lastPaymentDate}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 mb-1">Attachments</p>
                                <p className="font-medium text-gray-900">{bill.attachments} files</p>
                              </div>
                            </div>
                            {bill.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Notes</p>
                                <p className="text-sm text-gray-900">{bill.notes}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
