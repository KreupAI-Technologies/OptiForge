'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Eye, Edit, Download, Calendar, DollarSign,
  CheckCircle, Clock, RotateCcw, Filter, FileText, TrendingUp,
  ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle,
  Activity, Archive, FileCheck, AlertCircle, BookOpen, Hash,
  User, XCircle, Check, Loader
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { JournalService } from '@/services/journal.service';

// TypeScript Interfaces
interface GLEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  postingDate?: string;
  entryType: 'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal';
  description: string;
  referenceNumber: string;
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Reversed';
  createdBy: string;
  postedBy?: string;
  linesCount: number;
}

export default function JournalEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<GLEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns { data, total, ... } with JournalEntry ORM shape
        // (type/status/source enums, entryDate as Date, lines[]); map to GLEntry.
        const res = (await JournalService.getAllJournalEntries({ limit: 100 })) as any;
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const typeMap: Record<string, GLEntry['entryType']> = {
          STANDARD: 'Manual', MANUAL: 'Manual',
          ADJUSTING: 'Adjustment', ADJUSTMENT: 'Adjustment',
          CLOSING: 'Closing', OPENING: 'Opening',
          REVERSING: 'Reversal', REVERSAL: 'Reversal',
          SYSTEM: 'System', RECURRING: 'System',
        };
        const statusMap: Record<string, GLEntry['status']> = {
          DRAFT: 'Draft', PENDING_APPROVAL: 'Draft', APPROVED: 'Draft',
          POSTED: 'Posted', REVERSED: 'Reversed', CANCELLED: 'Draft',
        };
        const mapped: GLEntry[] = raw.map((e) => {
          const dateVal = e.entryDate ? String(e.entryDate).split('T')[0] : '';
          const postVal = e.postedAt ?? e.postingDate;
          return {
            id: String(e.id ?? e.entryNumber ?? ''),
            entryNumber: e.entryNumber ?? '',
            entryDate: dateVal,
            postingDate: postVal ? String(postVal).split('T')[0] : undefined,
            entryType: typeMap[String(e.source ?? e.type ?? '').toUpperCase()]
              ?? typeMap[String(e.type ?? '').toUpperCase()]
              ?? 'Manual',
            description: e.description ?? '',
            referenceNumber: e.reference ?? e.referenceNumber ?? '',
            totalDebit: Number(e.totalDebit ?? 0),
            totalCredit: Number(e.totalCredit ?? 0),
            status: statusMap[String(e.status ?? '').toUpperCase()] ?? 'Draft',
            createdBy: e.submittedBy ?? e.createdBy ?? '',
            postedBy: e.postedBy ?? undefined,
            linesCount: Array.isArray(e.lines) ? e.lines.length : Number(e.linesCount ?? 0),
          };
        });
        if (!cancelled) setEntries(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load journal entries');
          setEntries([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingEntry, setProcessingEntry] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.entryType === typeFilter;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesDateFrom = !dateFrom || entry.entryDate >= dateFrom;
    const matchesDateTo = !dateTo || entry.entryDate <= dateTo;
    return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    totalEntries: entries.length,
    posted: entries.filter((e) => e.status === 'Posted').length,
    draft: entries.filter((e) => e.status === 'Draft').length,
    thisMonth: entries.filter((e) => {
      const entryMonth = new Date(e.entryDate).getMonth();
      const currentMonth = new Date().getMonth();
      return entryMonth === currentMonth;
    }).length,
  };

  // Status configuration
  const statusConfig = {
    Draft: { color: 'bg-gray-100 text-gray-700', icon: Clock },
    Posted: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    Reversed: { color: 'bg-red-100 text-red-700', icon: RotateCcw },
  };

  // Entry type configuration
  const entryTypeConfig = {
    Manual: { color: 'bg-blue-100 text-blue-700', icon: Edit },
    System: { color: 'bg-purple-100 text-purple-700', icon: Activity },
    Adjustment: { color: 'bg-orange-100 text-orange-700', icon: TrendingUp },
    Closing: { color: 'bg-red-100 text-red-700', icon: Archive },
    Opening: { color: 'bg-green-100 text-green-700', icon: FileCheck },
    Reversal: { color: 'bg-pink-100 text-pink-700', icon: RotateCcw },
  };

  const handlePostEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to post this entry? This action cannot be undone.')) {
      return;
    }

    setProcessingEntry(entryId);

    // Simulate API call
    setTimeout(() => {
      setEntries(
        entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, status: 'Posted', postingDate: new Date().toISOString().split('T')[0], postedBy: 'Current User' }
            : entry
        )
      );
      setProcessingEntry(null);
      alert('Entry posted successfully!');
    }, 1500);
  };

  const handleUnpostEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to unpost this entry?')) {
      return;
    }

    setProcessingEntry(entryId);

    // Simulate API call
    setTimeout(() => {
      setEntries(
        entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, status: 'Draft', postingDate: undefined, postedBy: undefined }
            : entry
        )
      );
      setProcessingEntry(null);
      alert('Entry unposted successfully!');
    }, 1500);
  };

  const handleExport = () => {
    exportToCsv('journal-entries', filteredEntries as unknown as Record<string, unknown>[]);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2">
          {/* Action Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => router.push('/finance/accounting/add')}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Entry</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Entries</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEntries}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Posted</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.posted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draft}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">This Month</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{stats.thisMonth}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Entry number, description, reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Manual">Manual</option>
                  <option value="System">System</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Closing">Closing</option>
                  <option value="Opening">Opening</option>
                  <option value="Reversal">Reversal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Posted">Posted</option>
                  <option value="Reversed">Reversed</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end space-x-2 lg:col-span-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Loader className="h-4 w-4 animate-spin" />
              Loading journal entries…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && entries.length === 0 && (
            <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              No journal entries found.
            </div>
          )}
          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit Total</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedEntries.map((entry) => {
                    const StatusIcon = statusConfig[entry.status].icon;
                    const TypeIcon = entryTypeConfig[entry.entryType].icon;
                    const isProcessing = processingEntry === entry.id;

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Hash className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{entry.entryNumber}</div>
                              <div className="text-xs text-gray-500">{entry.referenceNumber}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {entry.linesCount} line{entry.linesCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900">{entry.entryDate}</div>
                          {entry.postingDate && (
                            <div className="text-xs text-gray-500">Posted: {entry.postingDate}</div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${entryTypeConfig[entry.entryType].color}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {entry.entryType}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900 max-w-xs">{entry.description}</div>
                          <div className="text-xs text-gray-500 mt-1">By: {entry.createdBy}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <ArrowUpCircle className="h-4 w-4 text-orange-600" />
                            <span className="font-bold text-orange-700">₹{entry.totalDebit.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-700">₹{entry.totalCredit.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[entry.status].color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => router.push(`/finance/accounting/view/${entry.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {entry.status === 'Draft' && (
                              <>
                                <button
                                  onClick={() => router.push(`/finance/accounting/edit/${entry.id}`)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"

                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handlePostEntry(entry.id)}
                                  disabled={isProcessing}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"

                                >
                                  {isProcessing ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                            {entry.status === 'Posted' && (
                              <button
                                onClick={() => handleUnpostEntry(entry.id)}
                                disabled={isProcessing}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"

                              >
                                {isProcessing ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEntries.length)} of{' '}
                {filteredEntries.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
