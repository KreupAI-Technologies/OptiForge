'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, CreditCard, Users, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentTerm, getPaymentTermStats } from '@/data/common-masters/payment-terms';
import { commonMastersService } from '@/services/common-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function PaymentTermsMasterPage() {
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplicability, setFilterApplicability] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch payment terms from the live backend, mapping the raw API shape into the page's model.
  useEffect(() => {
    let cancelled = false;
    const applicableToMap: Record<string, PaymentTerm['applicableFor']> = {
      customer: 'customers', customers: 'customers',
      vendor: 'vendors', vendors: 'vendors',
      both: 'both', all: 'both',
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await commonMastersService.getAllPaymentTerms(DEFAULT_COMPANY_ID)) as any[];
        const mapped: PaymentTerm[] = raw.map((t) => ({
          id: String(t.id ?? ''),
          termCode: t.termCode ?? '',
          termName: t.termName ?? '',
          description: t.description ?? '',
          daysAfterInvoice: Number(t.dueDays ?? t.daysAfterInvoice ?? 0),
          daysAfterDelivery: Number(t.daysAfterDelivery ?? 0),
          creditPeriod: Number(t.creditPeriod ?? t.dueDays ?? 0),
          paymentMethod: (t.paymentType ?? t.paymentMethod ?? 'credit') as PaymentTerm['paymentMethod'],
          advancePercentage: t.advancePercentage !== null && t.advancePercentage !== undefined ? Number(t.advancePercentage) : undefined,
          earlyPaymentDiscount: t.discountTerms?.earlyPaymentDiscount !== undefined && t.discountTerms?.earlyPaymentDiscount !== null ? Number(t.discountTerms.earlyPaymentDiscount) : undefined,
          earlyPaymentDays: t.discountTerms?.earlyPaymentDays !== undefined && t.discountTerms?.earlyPaymentDays !== null ? Number(t.discountTerms.earlyPaymentDays) : undefined,
          cashDiscountPercentage: t.discountTerms?.cashDiscountPercentage !== undefined && t.discountTerms?.cashDiscountPercentage !== null ? Number(t.discountTerms.cashDiscountPercentage) : undefined,
          lateFeePercentage: t.penaltyTerms?.lateFeePercentage !== undefined && t.penaltyTerms?.lateFeePercentage !== null ? Number(t.penaltyTerms.lateFeePercentage) : undefined,
          lateFeeStartsAfter: t.penaltyTerms?.lateFeeStartsAfter !== undefined && t.penaltyTerms?.lateFeeStartsAfter !== null ? Number(t.penaltyTerms.lateFeeStartsAfter) : undefined,
          interestRate: t.penaltyTerms?.interestRate !== undefined && t.penaltyTerms?.interestRate !== null ? Number(t.penaltyTerms.interestRate) : undefined,
          applicableFor: applicableToMap[t.applicableTo] ?? (t.applicableFor ?? 'both') as PaymentTerm['applicableFor'],
          isDefault: t.isDefault ?? false,
          priority: Number(t.priority ?? 0),
          customersUsing: Number(t.customersUsing ?? 0),
          vendorsUsing: Number(t.vendorsUsing ?? 0),
          transactionsCount: Number(t.transactionsCount ?? 0),
          totalAmount: Number(t.totalAmount ?? 0),
          isActive: t.isActive ?? (t.status ? t.status === 'active' : true),
          createdBy: t.createdBy ?? '',
          createdDate: t.createdDate ?? t.createdAt ?? '',
          modifiedBy: t.modifiedBy ?? '',
          modifiedDate: t.modifiedDate ?? t.updatedAt ?? '',
        }));
        if (!cancelled) setTerms(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load payment terms');
          setTerms([]);
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

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleExport = () => {
    exportToCsv('payment-terms-master', filteredData);
    showToast('Exporting payment terms data...', 'success');
  };

  const handleAddTerm = () => {
    showToast('Opening add payment term form...', 'info');
  };

  const filteredData = useMemo(() => {
    return terms.filter(term => {
      const matchesSearch =
        term.termName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.termCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesApplicability = filterApplicability === 'all' || term.applicableFor === filterApplicability;
      const matchesMethod = filterMethod === 'all' || term.paymentMethod === filterMethod;

      return matchesSearch && matchesApplicability && matchesMethod;
    });
  }, [terms, searchTerm, filterApplicability, filterMethod]);

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      'immediate': 'bg-red-100 text-red-800',
      'advance': 'bg-green-100 text-green-800',
      'partial': 'bg-blue-100 text-blue-800',
      'on_delivery': 'bg-orange-100 text-orange-800',
      'credit': 'bg-purple-100 text-purple-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<PaymentTerm>[] = [
    {
      id: 'term',
      header: 'Payment Term',
      accessor: 'termName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.isDefault && <CreditCard className="w-4 h-4 text-blue-600" />}
            {value}
          </div>
          <div className="text-xs">
            <span className="font-mono text-blue-600">{row.termCode}</span>
          </div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      id: 'method',
      header: 'Method',
      accessor: 'paymentMethod',
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getPaymentMethodColor(value)}`}>
            {value.replace('_', ' ')}
          </span>
          <div className="text-xs text-gray-600">
            Credit: {row.creditPeriod} days
          </div>
        </div>
      )
    },
    {
      id: 'terms',
      header: 'Terms',
      accessor: 'daysAfterInvoice',
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          {row.advancePercentage && <div className="text-green-600">Advance: {row.advancePercentage}%</div>}
          {row.daysAfterInvoice > 0 && <div className="text-gray-600">Invoice + {row.daysAfterInvoice} days</div>}
          {row.partialPayments && (
            <div className="text-blue-600">{row.partialPayments.length} milestones</div>
          )}
        </div>
      )
    },
    {
      id: 'discounts',
      header: 'Discounts & Penalties',
      accessor: 'earlyPaymentDiscount',
      sortable: false,
      render: (_, row) => (
        <div className="text-xs">
          {row.earlyPaymentDiscount && (
            <div className="text-green-600">Early: {row.earlyPaymentDiscount}% ({row.earlyPaymentDays}d)</div>
          )}
          {row.cashDiscountPercentage && (
            <div className="text-blue-600">Cash: {row.cashDiscountPercentage}%</div>
          )}
          {row.lateFeePercentage && (
            <div className="text-red-600">Late: {row.lateFeePercentage}% after {row.lateFeeStartsAfter}d</div>
          )}
        </div>
      )
    },
    {
      id: 'applicability',
      header: 'Applicable For',
      accessor: 'applicableFor',
      sortable: true,
      render: (value) => (
        <div className="text-xs capitalize">
          {value}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'transactionsCount',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">{value} txns</div>
          <div className="text-green-600">Customers: {row.customersUsing}</div>
          <div className="text-blue-600">Vendors: {row.vendorsUsing}</div>
          <div className="text-gray-500">₹{(row.totalAmount / 1000000).toFixed(1)}M</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} text={value ? 'Active' : 'Inactive'} />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={(e) => { e.stopPropagation(); }}>View</button>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium" onClick={(e) => { e.stopPropagation(); }}>Edit</button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterApplicability('all');
    setFilterMethod('all');
  };

  const activeFilterCount = [filterApplicability !== 'all', filterMethod !== 'all', searchTerm !== ''].filter(Boolean).length;
  const stats = useMemo(() => getPaymentTermStats(), [terms]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-7 h-7 text-blue-600" />
                Payment Terms Master
              </h1>
              <p className="text-gray-600 mt-1">Manage payment terms and credit conditions</p>
            </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button onClick={handleAddTerm} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Term</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Terms</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">For Customers</div>
          <div className="text-2xl font-bold text-blue-600">{stats.forCustomers}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">For Vendors</div>
          <div className="text-2xl font-bold text-green-600">{stats.forVendors}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Credit Period</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgCreditPeriod}d</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Amount
          </div>
          <div className="text-2xl font-bold text-orange-600">₹{(stats.totalAmount / 10000000).toFixed(1)}Cr</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">With Discount</div>
          <div className="text-2xl font-bold text-green-600">{stats.withEarlyDiscount}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by term name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable For</label>
              <select value={filterApplicability} onChange={(e) => setFilterApplicability(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">All</option>
                <option value="customers">Customers</option>
                <option value="vendors">Vendors</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">All Methods</option>
                <option value="immediate">Immediate</option>
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="on_delivery">On Delivery</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading payment terms…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && terms.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No payment terms found.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'term', direction: 'asc' } }} emptyMessage="No payment terms found" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Terms Management
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Flexible payment schedules: immediate, advance, partial, on delivery, or credit</li>
          <li>✓ Early payment discounts and cash discount incentives for timely payments</li>
          <li>✓ Late fee penalties and interest charges for overdue payments</li>
          <li>✓ Milestone-based partial payments for project-based billing</li>
          <li>✓ Default terms by customer/vendor category with approval workflows</li>
          <li>✓ Usage analytics: transaction count, total amount, and outstanding tracking</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}
