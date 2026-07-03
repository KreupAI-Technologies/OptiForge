'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Save, X, Plus, Trash2, Calendar, FileText, Hash,
  AlertCircle, CheckCircle, DollarSign, BookOpen, Search, Info,
  TrendingUp, ArrowUpCircle, ArrowDownCircle, Edit2, Copy, Loader
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

// TypeScript Interfaces
interface JournalLine {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: string;
  dimension1?: string;
  dimension2?: string;
}

interface GLEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceNumber: string;
  sourceDocument: string;
  entryType: 'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal';
  status: 'Draft' | 'Posted' | 'Reversed';
  journalLines: JournalLine[];
  notes?: string;
}

interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  balance: number;
}

// Mock Accounts Data
const mockAccounts: Account[] = [
  { code: '1000', name: 'Cash - Operating Account', type: 'Asset', balance: 500000 },
  { code: '1100', name: 'Accounts Receivable - Trade', type: 'Asset', balance: 250000 },
  { code: '1200', name: 'Inventory - Raw Materials', type: 'Asset', balance: 350000 },
  { code: '1300', name: 'Inventory - Finished Goods', type: 'Asset', balance: 200000 },
  { code: '1500', name: 'Fixed Assets - Equipment', type: 'Asset', balance: 1000000 },
  { code: '1510', name: 'Accumulated Depreciation', type: 'Asset', balance: -250000 },
  { code: '2000', name: 'Accounts Payable - Trade', type: 'Liability', balance: 180000 },
  { code: '2100', name: 'Accrued Expenses', type: 'Liability', balance: 45000 },
  { code: '2200', name: 'Short-term Loan', type: 'Liability', balance: 300000 },
  { code: '3000', name: 'Owner\'s Capital', type: 'Equity', balance: 1000000 },
  { code: '3100', name: 'Retained Earnings', type: 'Equity', balance: 500000 },
  { code: '4000', name: 'Revenue - Product Sales', type: 'Income', balance: 750000 },
  { code: '4100', name: 'Revenue - Service Income', type: 'Income', balance: 250000 },
  { code: '5000', name: 'COGS - Raw Materials', type: 'Expense', balance: 400000 },
  { code: '5100', name: 'Depreciation Expense', type: 'Expense', balance: 50000 },
  { code: '5200', name: 'Salary Expense', type: 'Expense', balance: 180000 },
  { code: '5300', name: 'Rent Expense', type: 'Expense', balance: 60000 },
  { code: '5400', name: 'Utilities Expense', type: 'Expense', balance: 25000 },
];

// Mock GL Entry Data
const mockGLEntry: GLEntry = {
  id: 'JE-001',
  entryNumber: 'JE-2025-001',
  entryDate: '2025-10-01',
  description: 'Customer payment received from Hotel Paradise Ltd',
  referenceNumber: 'INV-2025-001',
  sourceDocument: 'Sales Invoice',
  entryType: 'Manual',
  status: 'Draft',
  notes: 'Payment received via bank transfer',
  journalLines: [
    {
      id: 'JL-001',
      lineNumber: 1,
      accountCode: '1000',
      accountName: 'Cash - Operating Account',
      description: 'Customer payment received',
      debitAmount: 172500,
      creditAmount: 0,
      costCenter: 'CC-001',
    },
    {
      id: 'JL-002',
      lineNumber: 2,
      accountCode: '1100',
      accountName: 'Accounts Receivable - Trade',
      description: 'Clear receivable from Hotel Paradise Ltd',
      debitAmount: 0,
      creditAmount: 172500,
      costCenter: 'CC-001',
    },
  ],
};

export default function GLEntryEditPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<GLEntry>(mockGLEntry);
  const [journalLines, setJournalLines] = useState<JournalLine[]>(entry.journalLines);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [showAccountSearch, setShowAccountSearch] = useState<number | null>(null);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Hydrate account lookup list from the backend chart of accounts.
        try {
          const coa = await FinanceService.getChartOfAccounts();
          if (!cancelled && Array.isArray(coa) && coa.length) {
            const typeMap: Record<string, Account['type']> = {
              ASSET: 'Asset',
              LIABILITY: 'Liability',
              EQUITY: 'Equity',
              REVENUE: 'Income',
              EXPENSE: 'Expense',
            };
            setAccounts(
              coa.map((a: any) => ({
                code: String(a.code ?? ''),
                name: String(a.name ?? ''),
                type: typeMap[String(a.type)] ?? 'Asset',
                balance: Number(a.balance ?? 0),
              })),
            );
          }
        } catch {
          /* keep seed accounts */
        }

        if (entryId) {
          const raw = await FinanceService.getJournalEntry(entryId);
          if (cancelled) return;
          const m: any = raw || {};
          setEntry((prev) => ({
            ...prev,
            ...(m.id != null ? { id: String(m.id) } : {}),
            ...(m.entryNumber != null ? { entryNumber: String(m.entryNumber) } : {}),
            ...(m.entryDate != null ? { entryDate: String(m.entryDate) } : {}),
            ...(m.description != null ? { description: String(m.description) } : {}),
            ...(m.referenceNumber != null ? { referenceNumber: String(m.referenceNumber) } : {}),
            ...(m.sourceDocument != null ? { sourceDocument: String(m.sourceDocument) } : {}),
            ...(m.status != null ? { status: m.status } : {}),
            ...(m.notes != null ? { notes: String(m.notes) } : {}),
            ...(Array.isArray(m.journalLines) ? { journalLines: m.journalLines } : {}),
          }));
          if (Array.isArray(m.journalLines)) {
            setJournalLines(m.journalLines);
          }
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load journal entry');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  // Calculate totals
  const totalDebit = journalLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredit = journalLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.01;

  // Filter accounts based on search
  const filteredAccounts = accounts.filter(
    (account) =>
      account.code.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
      account.name.toLowerCase().includes(accountSearchQuery.toLowerCase())
  );

  const handleAddLine = () => {
    const newLine: JournalLine = {
      id: `JL-${Date.now()}`,
      lineNumber: journalLines.length + 1,
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    };
    setJournalLines([...journalLines, newLine]);
  };

  const handleRemoveLine = (lineId: string) => {
    if (journalLines.length <= 2) {
      alert('A journal entry must have at least 2 lines');
      return;
    }
    const updatedLines = journalLines
      .filter((line) => line.id !== lineId)
      .map((line, index) => ({ ...line, lineNumber: index + 1 }));
    setJournalLines(updatedLines);
  };

  const handleLineChange = (lineId: string, field: string, value: any) => {
    setJournalLines(
      journalLines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      )
    );
  };

  const handleSelectAccount = (lineId: string, account: Account) => {
    setJournalLines(
      journalLines.map((line) =>
        line.id === lineId
          ? { ...line, accountCode: account.code, accountName: account.name }
          : line
      )
    );
    setShowAccountSearch(null);
    setAccountSearchQuery('');
  };

  const handleDebitChange = (lineId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setJournalLines(
      journalLines.map((line) =>
        line.id === lineId ? { ...line, debitAmount: numValue, creditAmount: 0 } : line
      )
    );
  };

  const handleCreditChange = (lineId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setJournalLines(
      journalLines.map((line) =>
        line.id === lineId ? { ...line, creditAmount: numValue, debitAmount: 0 } : line
      )
    );
  };

  const handleDuplicateLine = (lineId: string) => {
    const lineToDuplicate = journalLines.find((line) => line.id === lineId);
    if (lineToDuplicate) {
      const newLine: JournalLine = {
        ...lineToDuplicate,
        id: `JL-${Date.now()}`,
        lineNumber: journalLines.length + 1,
      };
      setJournalLines([...journalLines, newLine]);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!entry.entryDate) {
      alert('Please select an entry date');
      return;
    }

    if (!entry.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (journalLines.length < 2) {
      alert('A journal entry must have at least 2 lines');
      return;
    }

    // Check if all lines have accounts
    const invalidLines = journalLines.filter((line) => !line.accountCode);
    if (invalidLines.length > 0) {
      alert('All lines must have an account selected');
      return;
    }

    // Check if entry is balanced
    if (!isBalanced) {
      alert('Entry is not balanced. Total debits must equal total credits.');
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Saving entry:', { ...entry, journalLines });
      setSaving(false);
      alert('Entry saved successfully!');
      router.push('/finance/accounting');
    }, 1500);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push('/finance/accounting');
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Edit2 className="h-8 w-8 text-blue-600" />
                <span>Edit Journal Entry</span>
              </h1>
              <p className="text-gray-600 mt-1">{entry.entryNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isBalanced || saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>
        </div>

        {/* Balance Status */}
        {isBalanced ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900">Entry Balanced</h3>
              <p className="text-sm text-green-700 mt-1">
                Total Debits (₹{totalDebit.toLocaleString()}) = Total Credits (₹{totalCredit.toLocaleString()})
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">Entry Not Balanced</h3>
              <p className="text-sm text-red-700 mt-1">
                Difference: ₹{Math.abs(difference).toLocaleString()} ({difference > 0 ? 'Debit' : 'Credit'} excess)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Entry Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Entry Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Number
            </label>
            <input
              type="text"
              value={entry.entryNumber}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={entry.entryDate}
                onChange={(e) => setEntry({ ...entry, entryDate: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Type
            </label>
            <select
              value={entry.entryType}
              onChange={(e) => setEntry({ ...entry, entryType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Manual">Manual</option>
              <option value="System">System</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Closing">Closing</option>
              <option value="Opening">Opening</option>
              <option value="Reversal">Reversal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={entry.referenceNumber}
              onChange={(e) => setEntry({ ...entry, referenceNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="INV-2025-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Document
            </label>
            <input
              type="text"
              value={entry.sourceDocument}
              onChange={(e) => setEntry({ ...entry, sourceDocument: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sales Invoice"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={entry.description}
              onChange={(e) => setEntry({ ...entry, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={entry.notes || ''}
            onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Journal Lines */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Journal Lines ({journalLines.length})
          </h2>
          <button
            onClick={handleAddLine}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Line</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '250px' }}>Account *</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '200px' }}>Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '150px' }}>Debit (₹)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '150px' }}>Credit (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ minWidth: '120px' }}>Cost Center</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {journalLines.map((line, index) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {line.lineNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowAccountSearch(showAccountSearch === index ? null : index)}
                        className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {line.accountCode ? (
                          <div>
                            <div className="font-mono font-semibold text-blue-600">{line.accountCode}</div>
                            <div className="text-sm text-gray-600">{line.accountName}</div>
                          </div>
                        ) : (
                          <div className="text-gray-400">Select account...</div>
                        )}
                      </button>

                      {showAccountSearch === index && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                value={accountSearchQuery}
                                onChange={(e) => setAccountSearchQuery(e.target.value)}
                                placeholder="Search accounts..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredAccounts.map((account) => (
                              <button
                                key={account.code}
                                onClick={() => handleSelectAccount(line.id, account)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                              >
                                <div className="font-mono font-semibold text-blue-600">{account.code}</div>
                                <div className="text-sm text-gray-700">{account.name}</div>
                                <div className="text-xs text-gray-500">{account.type} • Balance: ₹{account.balance.toLocaleString()}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Line description"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={line.debitAmount || ''}
                      onChange={(e) => handleDebitChange(line.id, e.target.value)}
                      disabled={line.creditAmount > 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={line.creditAmount || ''}
                      onChange={(e) => handleCreditChange(line.id, e.target.value)}
                      disabled={line.debitAmount > 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={line.costCenter || ''}
                      onChange={(e) => handleLineChange(line.id, 'costCenter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CC-001"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleDuplicateLine(line.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveLine(line.id)}
                        disabled={journalLines.length <= 2}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-900">
                  Totals:
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <ArrowUpCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-orange-700 text-lg">
                      ₹{totalDebit.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <ArrowDownCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-700 text-lg">
                      ₹{totalCredit.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td colSpan={2} className="px-4 py-4">
                  {isBalanced ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700 font-semibold">Balanced</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm text-red-700 font-semibold">
                        Diff: ₹{Math.abs(difference).toLocaleString()}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Each journal line must have either a debit or credit amount (not both)</li>
            <li>Total debits must equal total credits for the entry to be valid</li>
            <li>At least 2 journal lines are required</li>
            <li>All lines must have an account selected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
