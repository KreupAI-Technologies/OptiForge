'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { FinanceService } from '@/services/finance.service';

interface DepreciationSchedule {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  category: string;
  depreciationMethod: string;
  purchaseValue: number;
  salvageValue: number;
  usefulLife: number;
  startDate: string;
  endDate: string;
  annualDepreciation: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  remainingLife: number;
  status: 'Active' | 'Completed' | 'Paused';
}

interface DepreciationEntry {
  id: string;
  date: string;
  assetId: string;
  assetName: string;
  period: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  journalEntryId?: string;
  posted: boolean;
}

export default function DepreciationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'schedule' | 'entries'>('schedule');
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Toast notification handler
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Action handlers
  const handleRunDepreciation = () => {
    const confirmed = confirm('Run monthly depreciation for all active assets?');
    if (confirmed) {
      showToast('Running depreciation process...', 'info');
      // Simulate depreciation calculation
      setTimeout(() => {
        showToast('Depreciation calculated successfully for all assets!', 'success');
        // In a real app, you would:
        // - POST to /api/assets/depreciation/run-batch
        // - Calculate depreciation for all eligible assets
        // - Update accumulated depreciation and net book values
        // - Create journal entries
        // - Refresh the depreciation schedule list
      }, 2000);
    }
  };

  const handleManualEntry = () => {
    // In a real app, this would open a form to manually adjust depreciation
    const assetCode = prompt('Enter asset code for manual depreciation entry:');
    if (assetCode) {
      const amount = prompt('Enter depreciation amount:');
      if (amount) {
        showToast(`Manual depreciation entry of ₹${amount} recorded for ${assetCode}`, 'success');
        // In a real app, you would:
        // - Open a detailed form modal
        // - Validate the manual entry
        // - POST to /api/assets/depreciation/manual-entry
        // - Update the depreciation schedule
      }
    }
  };

  const handleExport = () => {
    exportToCsv('depreciation-schedules', filteredSchedules as unknown as Record<string, unknown>[]);
  };

  const handleViewSchedule = (assetName: string) => {
    showToast(`Opening depreciation schedule for: ${assetName}`, 'info');
    // In a real app, you would:
    // - Fetch detailed depreciation schedule from API
    // - Open a modal showing month-by-month depreciation breakdown
    // - Display depreciation amounts, accumulated totals, net book values
    // - Show historical and projected depreciation
  };

  const handlePauseSchedule = (assetName: string) => {
    const confirmed = confirm(`Pause automatic depreciation for ${assetName}?`);
    if (confirmed) {
      showToast(`Depreciation paused for: ${assetName}`, 'success');
      // In a real app, you would:
      // - PUT to /api/assets/depreciation/pause/{assetId}
      // - Update asset status to prevent auto-depreciation
      // - Log the pause action with reason
      // - Refresh the schedule list
    }
  };

  // Depreciation schedules (derived from fixed assets) + entries, loaded from backend
  const [depreciationSchedules, setDepreciationSchedules] = useState<DepreciationSchedule[]>([]);
  const [depreciationEntries, setDepreciationEntries] = useState<DepreciationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getFixedAssets()) as any[];
        const methodMap: Record<string, string> = {
          STRAIGHT_LINE: 'Straight Line',
          WRITTEN_DOWN_VALUE: 'Written Down Value',
          DOUBLE_DECLINING: 'Double Declining',
          UNITS_OF_PRODUCTION: 'Units of Production',
        };
        const schedules: DepreciationSchedule[] = raw.map((a) => {
          const purchaseValue = Number(a.acquisitionCost ?? 0);
          const accumulated = Number(a.accumulatedDepreciation ?? 0);
          const netBookValue = Number(a.netBookValue ?? purchaseValue - accumulated);
          const usefulLife = Number(a.usefulLifeYears ?? 0);
          const rate = Number(a.depreciationRate ?? 0);
          const annualDepreciation =
            rate > 0
              ? (purchaseValue * rate) / 100
              : usefulLife > 0
                ? (purchaseValue - Number(a.salvageValue ?? 0)) / usefulLife
                : 0;
          const statusRaw = String(a.status ?? '').toUpperCase();
          const status: DepreciationSchedule['status'] =
            statusRaw === 'DISPOSED' || statusRaw === 'COMPLETED'
              ? 'Completed'
              : statusRaw === 'INACTIVE' || a.isDepreciable === false
                ? 'Paused'
                : 'Active';
          return {
            id: a.id,
            assetId: a.id,
            assetName: a.assetName ?? '-',
            assetCode: a.assetCode ?? '-',
            category: a.assetCategory ?? '-',
            depreciationMethod: methodMap[a.depreciationMethod] ?? String(a.depreciationMethod ?? '-'),
            purchaseValue,
            salvageValue: Number(a.salvageValue ?? 0),
            usefulLife,
            startDate: a.depreciationStartDate ?? a.acquisitionDate ?? '',
            endDate: a.nextDepreciationDate ?? '',
            annualDepreciation,
            monthlyDepreciation: annualDepreciation / 12,
            accumulatedDepreciation: accumulated,
            netBookValue,
            remainingLife:
              annualDepreciation > 0 ? Math.max(0, netBookValue / annualDepreciation) : 0,
            status,
          };
        });
        const entries: DepreciationEntry[] = raw
          .filter((a) => Number(a.accumulatedDepreciation ?? 0) > 0)
          .map((a) => ({
            id: `DE-${a.id}`,
            date: a.lastDepreciationDate ?? a.depreciationStartDate ?? '',
            assetId: a.id,
            assetName: a.assetName ?? '-',
            period: a.lastDepreciationDate
              ? new Date(a.lastDepreciationDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })
              : '-',
            depreciationAmount:
              (Number(a.depreciationRate ?? 0) > 0
                ? (Number(a.acquisitionCost ?? 0) * Number(a.depreciationRate)) / 100
                : 0) / 12,
            accumulatedDepreciation: Number(a.accumulatedDepreciation ?? 0),
            netBookValue: Number(a.netBookValue ?? 0),
            posted: Boolean(a.lastDepreciationDate),
          }));
        if (!cancelled) {
          setDepreciationSchedules(schedules);
          setDepreciationEntries(entries);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load depreciation data');
          setDepreciationSchedules([]);
          setDepreciationEntries([]);
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

  const filteredSchedules = depreciationSchedules.filter(schedule => {
    const matchesSearch =
      schedule.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.assetCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'all' || schedule.depreciationMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const filteredEntries = depreciationEntries.filter(entry => {
    const matchesSearch =
      entry.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.period.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate statistics
  const totalMonthlyDepreciation = depreciationSchedules
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.monthlyDepreciation, 0);

  const totalAnnualDepreciation = depreciationSchedules
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.annualDepreciation, 0);

  const totalAccumulatedDepreciation = depreciationSchedules
    .reduce((sum, s) => sum + s.accumulatedDepreciation, 0);

  const pendingPostings = depreciationEntries.filter(e => !e.posted).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-500/20 text-green-400',
      Completed: 'bg-blue-500/20 text-blue-400',
      Paused: 'bg-orange-500/20 text-orange-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const toggleAssetExpansion = (assetId: string) => {
    setExpandedAsset(expandedAsset === assetId ? null : assetId);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {/* Toast Notification */}
            {toast && (
              <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg border-l-4 animate-slide-in ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                  toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                    'bg-blue-50 border-blue-500 text-blue-800'
                }`}>
                <div className="flex items-center gap-3">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {toast.type === 'info' && <Play className="w-5 h-5 text-blue-600" />}
                  <span className="font-medium">{toast.message}</span>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Loading depreciation data…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Depreciation Management</h1>
                <p className="text-gray-600">Track and process asset depreciation</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRunDepreciation}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-colors shadow-md">
                  <Play className="w-4 h-4" />
                  Run Depreciation
                </button>
                <button
                  onClick={handleManualEntry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Manual Entry
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 opacity-80" />
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalMonthlyDepreciation)}</div>
                <div className="text-orange-100 text-sm">Monthly Depreciation</div>
                <div className="mt-2 text-xs text-orange-100">Current month charge</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 opacity-80" />
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalAnnualDepreciation)}</div>
                <div className="text-red-100 text-sm">Annual Depreciation</div>
                <div className="mt-2 text-xs text-red-100">Projected for current year</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalAccumulatedDepreciation)}</div>
                <div className="text-purple-100 text-sm">Total Accumulated</div>
                <div className="mt-2 text-xs text-purple-100">All assets to date</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-8 h-8 opacity-80" />
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{pendingPostings}</div>
                <div className="text-yellow-100 text-sm">Pending Postings</div>
                <div className="mt-2 text-xs text-yellow-100">Awaiting journal entry</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by asset name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="Straight Line">Straight Line</option>
                    <option value="Written Down Value">Written Down Value</option>
                    <option value="Double Declining">Double Declining</option>
                    <option value="Units of Production">Units of Production</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'schedule'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Depreciation Schedules ({filteredSchedules.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'entries'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Depreciation Entries ({filteredEntries.length})
                  </div>
                </button>
              </div>

              {/* Schedules Tab */}
              {activeTab === 'schedule' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Asset Details</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Method</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Purchase Value</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Monthly Depreciation</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Accumulated</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Net Book Value</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Remaining Life</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map((schedule) => (
                        <React.Fragment key={schedule.id}>
                          <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAssetExpansion(schedule.assetId)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  {expandedAsset === schedule.assetId ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                                <div>
                                  <div className="font-medium text-gray-900">{schedule.assetName}</div>
                                  <div className="text-sm text-gray-600 font-mono">{schedule.assetCode}</div>
                                  <div className="text-xs text-gray-500">{schedule.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-gray-900 text-sm">{schedule.depreciationMethod}</div>
                              <div className="text-xs text-gray-600">{schedule.usefulLife} years</div>
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900 font-medium">
                              {formatCurrency(schedule.purchaseValue)}
                            </td>
                            <td className="px-3 py-2 text-right text-orange-600 font-medium">
                              {formatCurrency(schedule.monthlyDepreciation)}
                            </td>
                            <td className="px-3 py-2 text-right text-red-600 font-medium">
                              {formatCurrency(schedule.accumulatedDepreciation)}
                            </td>
                            <td className="px-3 py-2 text-right text-green-600 font-medium">
                              {formatCurrency(schedule.netBookValue)}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-900">
                              {schedule.remainingLife.toFixed(1)} years
                            </td>
                            <td className="px-3 py-2 text-center">
                              {getStatusBadge(schedule.status)}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewSchedule(schedule.assetName)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View Schedule">
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handlePauseSchedule(schedule.assetName)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Pause Depreciation">
                                  <Pause className="w-4 h-4 text-orange-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedAsset === schedule.assetId && (
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <td colSpan={9} className="px-3 py-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div className="space-y-2">
                                    <div className="text-sm font-semibold text-gray-700">Schedule Details</div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Start Date:</span>
                                      <span className="text-gray-900">{new Date(schedule.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">End Date:</span>
                                      <span className="text-gray-900">{new Date(schedule.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Salvage Value:</span>
                                      <span className="text-gray-900">{formatCurrency(schedule.salvageValue)}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-sm font-semibold text-gray-700">Depreciation Rates</div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Annual:</span>
                                      <span className="text-gray-900">{formatCurrency(schedule.annualDepreciation)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Monthly:</span>
                                      <span className="text-gray-900">{formatCurrency(schedule.monthlyDepreciation)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Rate:</span>
                                      <span className="text-gray-900">
                                        {((schedule.annualDepreciation / schedule.purchaseValue) * 100).toFixed(2)}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="text-sm font-semibold text-gray-700">Current Status</div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Depreciated:</span>
                                      <span className="text-gray-900">
                                        {((schedule.accumulatedDepreciation / schedule.purchaseValue) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Remaining:</span>
                                      <span className="text-gray-900">
                                        {(((schedule.purchaseValue - schedule.accumulatedDepreciation) / schedule.purchaseValue) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div
                                        className="bg-orange-500 h-2 rounded-full"
                                        style={{
                                          width: `${((schedule.accumulatedDepreciation / schedule.purchaseValue) * 100).toFixed(1)}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Entries Tab */}
              {activeTab === 'entries' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Asset Name</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Period</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Depreciation Amount</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Accumulated</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Net Book Value</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Journal Entry</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-gray-900 text-sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-700 text-sm">{entry.assetName}</td>
                          <td className="px-3 py-2 text-gray-600 text-sm">{entry.period}</td>
                          <td className="px-3 py-2 text-right text-orange-600 font-medium">
                            {formatCurrency(entry.depreciationAmount)}
                          </td>
                          <td className="px-3 py-2 text-right text-red-600 font-medium">
                            {formatCurrency(entry.accumulatedDepreciation)}
                          </td>
                          <td className="px-3 py-2 text-right text-green-600 font-medium">
                            {formatCurrency(entry.netBookValue)}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-600 text-sm font-mono">
                            {entry.journalEntryId || '-'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {entry.posted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Posted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
