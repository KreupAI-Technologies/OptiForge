'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Download, BookOpen, Calendar, DollarSign, FileText, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, User, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { JournalService } from '@/services/journal.service';
import { exportToCsv } from '@/lib/export';

interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  entryType: 'journal_entry' | 'adjustment' | 'closing' | 'reversal' | 'accrual';
  referenceNumber: string;
  postedBy: string;
  postedDate: string;
  status: 'draft' | 'posted' | 'reversed';
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  posted: 'bg-green-100 text-green-700',
  reversed: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  posted: 'Posted',
  reversed: 'Reversed',
};

const entryTypeColors = {
  journal_entry: 'bg-blue-100 text-blue-700',
  adjustment: 'bg-purple-100 text-purple-700',
  closing: 'bg-orange-100 text-orange-700',
  reversal: 'bg-red-100 text-red-700',
  accrual: 'bg-yellow-100 text-yellow-700',
};

const entryTypeLabels = {
  journal_entry: 'Journal Entry',
  adjustment: 'Adjustment',
  closing: 'Closing Entry',
  reversal: 'Reversal',
  accrual: 'Accrual',
};

export default function AccountingPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns { data, total, ... } of JournalEntry headers with a
        // nested lines[] array; flatten each line into a page-level row.
        const res = (await JournalService.getAllJournalEntries({ limit: 100 })) as any;
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const typeMap: Record<string, JournalEntry['entryType']> = {
          STANDARD: 'journal_entry', MANUAL: 'journal_entry',
          ADJUSTING: 'adjustment', ADJUSTMENT: 'adjustment',
          CLOSING: 'closing', REVERSING: 'reversal', REVERSAL: 'reversal',
          ACCRUAL: 'accrual', OPENING: 'journal_entry',
        };
        const statusMap: Record<string, JournalEntry['status']> = {
          DRAFT: 'draft', PENDING_APPROVAL: 'draft', APPROVED: 'draft',
          POSTED: 'posted', REVERSED: 'reversed', CANCELLED: 'draft',
        };
        const flattened: JournalEntry[] = [];
        raw.forEach((e) => {
          const entryDate = e.entryDate ? String(e.entryDate).split('T')[0] : '';
          const postedDate = (e.postedAt ?? e.postingDate)
            ? String(e.postedAt ?? e.postingDate).split('T')[0]
            : entryDate;
          const entryType =
            typeMap[String(e.source ?? e.type ?? '').toUpperCase()]
            ?? typeMap[String(e.type ?? '').toUpperCase()]
            ?? 'journal_entry';
          const status = statusMap[String(e.status ?? '').toUpperCase()] ?? 'draft';
          const lines: any[] = Array.isArray(e.lines) && e.lines.length > 0
            ? e.lines
            : [{ accountCode: '', accountName: '', debit: e.totalDebit, credit: e.totalCredit }];
          lines.forEach((line, idx) => {
            flattened.push({
              id: `${e.id ?? e.entryNumber ?? 'JE'}-${line.id ?? idx}`,
              entryNumber: e.entryNumber ?? '',
              entryDate,
              accountCode: line.accountCode ?? '',
              accountName: line.accountName ?? '',
              description: line.description ?? e.description ?? '',
              debitAmount: Number(line.debit ?? 0),
              creditAmount: Number(line.credit ?? 0),
              entryType,
              referenceNumber: e.reference ?? e.referenceNumber ?? '',
              postedBy: e.postedBy ?? e.submittedBy ?? '',
              postedDate,
              status,
            });
          });
        });
        if (!cancelled) setEntries(flattened);
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
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.entryType === typeFilter;
    const matchesAccount = accountFilter === 'all' || entry.accountCode.startsWith(accountFilter);
    return matchesSearch && matchesType && matchesAccount;
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalEntries: entries.length,
    thisMonth: entries.filter((e) => {
      const entryMonth = new Date(e.entryDate).getMonth();
      const currentMonth = new Date().getMonth();
      return entryMonth === currentMonth;
    }).length,
    totalCredits: entries.reduce((sum, e) => sum + e.creditAmount, 0),
    totalDebits: entries.reduce((sum, e) => sum + e.debitAmount, 0),
  };

  const balance = stats.totalDebits - stats.totalCredits;

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Stats */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEntries}</p>
                <p className="text-xs text-blue-600 mt-1">This Month: {stats.thisMonth}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-900 mt-1">${(stats.totalCredits / 1000).toFixed(0)}K</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Debits</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">${(stats.totalDebits / 1000).toFixed(0)}K</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Balance</p>
                <p className={`text-2xl font-bold mt-1 ${balance === 0 ? 'text-green-900' : 'text-purple-900'}`}>
                  ${Math.abs(balance).toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">{balance === 0 ? 'Balanced' : balance > 0 ? 'Debit' : 'Credit'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/finance/accounting/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by entry number, account, description, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="journal_entry">Journal Entry</option>
          <option value="adjustment">Adjustment</option>
          <option value="closing">Closing Entry</option>
          <option value="reversal">Reversal</option>
          <option value="accrual">Accrual</option>
        </select>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Accounts</option>
          <option value="1">1000 - Assets</option>
          <option value="2">2000 - Liabilities</option>
          <option value="3">3000 - Equity</option>
          <option value="4">4000 - Revenue</option>
          <option value="5">5000 - Expenses</option>
        </select>
        <button
          onClick={() =>
            exportToCsv(
              'journal-entries',
              filteredEntries as unknown as Record<string, unknown>[],
            )
          }
          disabled={filteredEntries.length === 0}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Clock className="h-4 w-4 animate-spin" />
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEntries.map((entry) => {
                const isDebit = entry.debitAmount > 0;

                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-start space-x-3">
                        <div className={`h-10 w-10 bg-gradient-to-br ${isDebit ? 'from-yellow-500 to-orange-600' : 'from-green-500 to-emerald-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {isDebit ? (
                            <ArrowUpCircle className="h-5 w-5 text-white" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{entry.entryNumber}</div>
                          <div className="text-xs text-gray-500">{entry.referenceNumber}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Posted by {entry.postedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {entry.entryDate}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Posted: {entry.postedDate}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-mono font-semibold text-blue-600">{entry.accountCode}</div>
                      <div className="text-sm text-gray-700 font-medium">{entry.accountName}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 max-w-xs">{entry.description}</div>
                    </td>
                    <td className="px-3 py-2">
                      {entry.debitAmount > 0 ? (
                        <div className="font-bold text-orange-700">${entry.debitAmount.toLocaleString()}</div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {entry.creditAmount > 0 ? (
                        <div className="font-bold text-green-700">${entry.creditAmount.toLocaleString()}</div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${entryTypeColors[entry.entryType]}`}>
                        {entryTypeLabels[entry.entryType]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[entry.status]}`}>
                        {statusLabels[entry.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => router.push(`/finance/accounting/view/${entry.id}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {entry.status === 'draft' && (
                          <button
                            onClick={() => router.push(`/finance/accounting/edit/${entry.id}`)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
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
            {filteredEntries.length} items
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
  );
}
