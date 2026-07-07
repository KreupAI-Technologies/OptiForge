'use client';

import { useState, useEffect } from 'react';
import { Wallet, IndianRupee, Clock, CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface TravelAdvance {
  id: string;
  advanceNumber: string;
  employeeName: string;
  department: string;
  tripNumber: string;
  destination: string;
  travelDates: string;
  advanceAmount: number;
  requestedDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'disbursed' | 'settled' | 'rejected';
  approver?: string;
  approvedDate?: string;
  disbursedDate?: string;
  settledDate?: string;
  expensesSubmitted?: number;
  balanceAmount?: number;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rows, setRows] = useState<TravelAdvance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getTravelAdvances();
        const mapped: TravelAdvance[] = raw.map((r) => ({
          id: r.id,
          advanceNumber: r.advanceNumber ?? '',
          employeeName: r.employeeName ?? '',
          department: r.department ?? '',
          tripNumber: r.tripNumber ?? '',
          destination: r.destination ?? '',
          travelDates: r.travelDates ?? '',
          advanceAmount: Number(r.advanceAmount ?? 0),
          requestedDate: r.requestedDate ?? '',
          purpose: r.purpose ?? '',
          status: (r.status as TravelAdvance['status']) ?? 'pending',
          approver: r.approver ?? undefined,
          approvedDate: r.approvedDate ?? undefined,
          disbursedDate: r.disbursedDate ?? undefined,
          settledDate: r.settledDate ?? undefined,
          expensesSubmitted: r.expensesSubmitted != null ? Number(r.expensesSubmitted) : undefined,
          balanceAmount: r.balanceAmount != null ? Number(r.balanceAmount) : undefined,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load travel advances');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockAdvances: TravelAdvance[] = rows;

  const filteredAdvances = mockAdvances.filter(a =>
    selectedStatus === 'all' || a.status === selectedStatus
  );

  const stats = {
    total: mockAdvances.length,
    pending: mockAdvances.filter(a => a.status === 'pending').length,
    disbursed: mockAdvances.filter(a => a.status === 'disbursed').length,
    totalAmount: mockAdvances.reduce((sum, a) => sum + a.advanceAmount, 0),
    outstanding: mockAdvances.filter(a => a.status === 'disbursed').reduce((sum, a) => sum + a.advanceAmount, 0)
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    disbursed: 'bg-purple-100 text-purple-700',
    settled: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Travel Advances</h1>
        <p className="text-sm text-gray-600 mt-1">Track travel advance requests and settlements</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading travel advances…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Advances</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Disbursed</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.disbursed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(stats.totalAmount / 100000).toFixed(1)}L</p>
            </div>
            <IndianRupee className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(stats.outstanding / 1000).toFixed(0)}K</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'disbursed', 'settled'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EmptyState
            icon={Wallet}
            title="No travel advances found"
            description="No travel advance requests have been raised yet. New advance requests and settlements will appear here."
          />
        </div>
      )}

      <div className="space-y-2">
        {filteredAdvances.map(advance => (
          <div key={advance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{advance.advanceNumber}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[advance.status]}`}>
                    {advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{advance.employeeName} • {advance.department}</p>
                <p className="text-xs text-gray-500 mt-1">Trip: {advance.tripNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{advance.advanceAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purpose</p>
                <p className="text-sm font-semibold text-gray-900">{advance.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Destination</p>
                <p className="text-sm font-semibold text-gray-900">{advance.destination}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Travel Dates</p>
                <p className="text-sm font-semibold text-gray-900">{advance.travelDates}</p>
              </div>
            </div>

            {advance.status === 'settled' && advance.expensesSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Advance</p>
                    <p className="font-semibold text-green-900">₹{advance.advanceAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Expenses</p>
                    <p className="font-semibold text-green-900">₹{advance.expensesSubmitted.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Balance Returned</p>
                    <p className="font-semibold text-green-900">₹{advance.balanceAmount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
              <div className="space-x-4">
                <span>Requested: {advance.requestedDate}</span>
                {advance.approvedDate && <span>Approved: {advance.approvedDate}</span>}
                {advance.disbursedDate && <span>Disbursed: {advance.disbursedDate}</span>}
              </div>
              {advance.approver && <span>Approver: {advance.approver}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
