'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { History, Search, Filter, X, Download, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';

interface EncashmentHistory {
  id: string;
  financialYear: string;
  requestDate: string;
  leaveType: string;
  leaveTypeCode: string;
  encashedDays: number;
  perDayRate: number;
  grossAmount: number;
  tdsDeducted: number;
  netAmount: number;
  status: 'processed' | 'cancelled';
  submittedOn: string;
  approvedBy: string;
  approvedOn: string;
  processedOn: string;
  paymentMode: 'salary' | 'cheque' | 'bank_transfer';
  paymentReference?: string;
  paymentMonth?: string;
  remarks?: string;
}

export default function EncashmentHistoryPage() {
  const [history, setHistory] = useState<EncashmentHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFY, setFilterFY] = useState<string>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.leaveEncashments()) as any[];
        const paymentModes = ['salary', 'cheque', 'bank_transfer'];
        const mapped: EncashmentHistory[] = (raw ?? [])
          // History view: only settled records (processed / cancelled).
          .filter((r) => {
            const s = String(r.status ?? '').toLowerCase();
            return s === 'processed' || s === 'cancelled';
          })
          .map((r, i) => {
            const mode = String(r.paymentMode ?? '').toLowerCase();
            return {
              id: String(r.id ?? `ECH${i}`),
              financialYear: r.financialYear ?? '',
              requestDate: r.requestDate ?? r.submittedOn ?? '',
              leaveType: r.leaveType ?? 'Leave',
              leaveTypeCode: r.leaveTypeCode ?? '',
              encashedDays: Number(r.encashedDays ?? 0),
              perDayRate: Number(r.perDayRate ?? 0),
              grossAmount: Number(r.grossAmount ?? 0),
              tdsDeducted: Number(r.tdsDeducted ?? 0),
              netAmount: Number(r.netAmount ?? 0),
              status: String(r.status ?? '').toLowerCase() === 'cancelled' ? 'cancelled' : 'processed',
              submittedOn: r.submittedOn ?? r.requestDate ?? '',
              approvedBy: r.approvedBy ?? '',
              approvedOn: r.approvedOn ?? '',
              processedOn: r.processedOn ?? '',
              paymentMode: (paymentModes.includes(mode) ? mode : 'salary') as EncashmentHistory['paymentMode'],
              paymentReference: r.paymentReference ?? undefined,
              paymentMonth: r.paymentMonth ?? undefined,
              remarks: r.remarks ?? undefined,
            };
          });
        if (!cancelled) setHistory(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load encashment history');
          setHistory([]);
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

  const filteredData = useMemo(() => {
    return history.filter(rec => {
      const matchesSearch = rec.id.toLowerCase().includes(searchTerm.toLowerCase()) || rec.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFY = filterFY === 'all' || rec.financialYear === filterFY;
      const matchesType = filterLeaveType === 'all' || rec.leaveTypeCode === filterLeaveType;
      return matchesSearch && matchesFY && matchesType;
    });
  }, [history, searchTerm, filterFY, filterLeaveType]);

  const columns: Column<EncashmentHistory>[] = [
    {
      id: 'requestId',
      header: 'Request ID',
      accessor: 'id',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-mono font-semibold text-blue-600">{v}</div>
          <div className="text-xs text-gray-500">{row.financialYear}</div>
          <div className="text-xs text-gray-500">{new Date(row.processedOn).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      id: 'leaveDetails',
      header: 'Leave Details',
      accessor: 'leaveType',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.leaveTypeCode}</div>
          <div className="text-xs text-blue-600">{row.encashedDays} days encashed</div>
        </div>
      )
    },
    {
      id: 'amount',
      header: 'Amount Breakdown',
      accessor: 'grossAmount',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">Gross: ₹{v.toLocaleString()}</div>
          <div className="text-xs text-red-600">TDS: -₹{row.tdsDeducted.toLocaleString()}</div>
          <div className="text-xs font-semibold text-green-600">Net: ₹{row.netAmount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">@₹{row.perDayRate}/day</div>
        </div>
      )
    },
    {
      id: 'payment',
      header: 'Payment Details',
      accessor: 'paymentMode',
      sortable: true,
      render: (v, row) => (
        <div className="text-xs">
          <div className="capitalize font-medium text-gray-900">{v.replace('_', ' ')}</div>
          {row.paymentMonth && <div className="text-gray-600">{row.paymentMonth}</div>}
          {row.paymentReference && <div className="font-mono text-blue-600">{row.paymentReference}</div>}
        </div>
      )
    },
    {
      id: 'approval',
      header: 'Approval Trail',
      accessor: 'approvedBy',
      sortable: false,
      render: (v, row) => (
        <div className="text-xs">
          <div className="text-gray-900">{v}</div>
          <div className="text-gray-500">Approved: {new Date(row.approvedOn).toLocaleDateString()}</div>
          <div className="text-green-600">Processed: {new Date(row.processedOn).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (v) => <StatusBadge status={v === 'processed' ? 'active' : 'error'} text={v === 'processed' ? 'Processed' : 'Cancelled'} />
    }
  ];

  const stats = useMemo(() => {
    const totalEncashed = history.reduce((sum, r) => sum + r.encashedDays, 0);
    const totalGross = history.reduce((sum, r) => sum + r.grossAmount, 0);
    const totalTDS = history.reduce((sum, r) => sum + r.tdsDeducted, 0);
    const totalNet = history.reduce((sum, r) => sum + r.netAmount, 0);
    const currentFY = history.filter(r => r.financialYear === '2025-26').reduce((sum, r) => sum + r.netAmount, 0);
    return { total: history.length, totalEncashed, totalGross, totalTDS, totalNet, currentFY };
  }, [history]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterFY('all');
    setFilterLeaveType('all');
  };

  const activeFilterCount = [filterFY !== 'all', filterLeaveType !== 'all', searchTerm !== ''].filter(Boolean).length;

  const financialYears = ['all', '2025-26', '2024-25', '2023-24'];
  const leaveTypes = ['all', 'EL', 'PL', 'CO'];

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading encashment history…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-7 h-7 text-purple-600" />
            Encashment History
          </h1>
          <p className="text-gray-600 mt-1">Complete history of your leave encashment transactions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Days Encashed</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalEncashed}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Gross Amount</div>
          <div className="text-2xl font-bold text-green-600">₹{(stats.totalGross / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">TDS Deducted</div>
          <div className="text-2xl font-bold text-red-600">₹{(stats.totalTDS / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Net Received
          </div>
          <div className="text-2xl font-bold text-purple-600">₹{(stats.totalNet / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Current FY</div>
          <div className="text-2xl font-bold text-orange-600">₹{(stats.currentFY / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by request ID or leave type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
              <select value={filterFY} onChange={(e) => setFilterFY(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Years</option>
                {financialYears.filter(fy => fy !== 'all').map(fy => <option key={fy} value={fy}>{fy}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select value={filterLeaveType} onChange={(e) => setFilterLeaveType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Types</option>
                {leaveTypes.filter(t => t !== 'all').map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'requestId', direction: 'desc' } }} emptyMessage="No encashment history found" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <History className="w-5 h-5 inline mr-2" />
          Encashment History Records
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Complete chronological record of all processed encashment transactions</li>
          <li>✓ Amount breakdown: gross, TDS deduction, and net amount received</li>
          <li>✓ Payment details: mode, reference number, and month of payment</li>
          <li>✓ Approval trail with approver details and processing timestamps</li>
          <li>✓ Financial year-wise summary for tax filing and record keeping</li>
          <li>✓ Export functionality for personal records and compliance documentation</li>
        </ul>
      </div>
    </div>
  );
}
