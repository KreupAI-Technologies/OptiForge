'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Plus, Trash2, Calendar, FileText, Search,
  AlertCircle, CheckCircle, DollarSign, BookOpen, Copy, Loader,
  TrendingUp, Edit2, File, List, Info, ArrowUpCircle, ArrowDownCircle,
  Zap, Clock, FileCheck
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

interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  balance: number;
}

interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  lines: Omit<JournalLine, 'id' | 'lineNumber'>[];
  icon: any;
}

// Journal Entry Templates
const journalTemplates: JournalTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Monthly Depreciation',
    description: 'Standard monthly depreciation entry',
    icon: TrendingUp,
    lines: [
      {
        accountCode: '5100',
        accountName: 'Depreciation Expense',
        description: 'Monthly depreciation expense',
        debitAmount: 12500,
        creditAmount: 0,
      },
      {
        accountCode: '1510',
        accountName: 'Accumulated Depreciation',
        description: 'Accumulated depreciation contra account',
        debitAmount: 0,
        creditAmount: 12500,
      },
    ],
  },
  {
    id: 'TPL-002',
    name: 'Salary Payment',
    description: 'Monthly salary disbursement',
    icon: DollarSign,
    lines: [
      {
        accountCode: '5200',
        accountName: 'Salary Expense',
        description: 'Monthly salary payment',
        debitAmount: 180000,
        creditAmount: 0,
      },
      {
        accountCode: '1000',
        accountName: 'Cash - Operating Account',
        description: 'Cash paid for salaries',
        debitAmount: 0,
        creditAmount: 180000,
      },
    ],
  },
  {
    id: 'TPL-003',
    name: 'Rent Payment',
    description: 'Monthly rent expense',
    icon: FileCheck,
    lines: [
      {
        accountCode: '5300',
        accountName: 'Rent Expense',
        description: 'Monthly rent payment',
        debitAmount: 60000,
        creditAmount: 0,
      },
      {
        accountCode: '1000',
        accountName: 'Cash - Operating Account',
        description: 'Cash paid for rent',
        debitAmount: 0,
        creditAmount: 60000,
      },
    ],
  },
  {
    id: 'TPL-004',
    name: 'Cash Sales',
    description: 'Record cash sales transaction',
    icon: CheckCircle,
    lines: [
      {
        accountCode: '1000',
        accountName: 'Cash - Operating Account',
        description: 'Cash received from sales',
        debitAmount: 100000,
        creditAmount: 0,
      },
      {
        accountCode: '4000',
        accountName: 'Revenue - Product Sales',
        description: 'Sales revenue',
        debitAmount: 0,
        creditAmount: 100000,
      },
    ],
  },
  {
    id: 'TPL-005',
    name: 'Purchase on Credit',
    description: 'Record credit purchase',
    icon: BookOpen,
    lines: [
      {
        accountCode: '5000',
        accountName: 'COGS - Raw Materials',
        description: 'Purchase of raw materials',
        debitAmount: 50000,
        creditAmount: 0,
      },
      {
        accountCode: '2000',
        accountName: 'Accounts Payable - Trade',
        description: 'Credit purchase from supplier',
        debitAmount: 0,
        creditAmount: 50000,
      },
    ],
  },
];

export default function AddJournalEntryPage() {
  const router = useRouter();
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState<'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal'>('Manual');
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [sourceDocument, setSourceDocument] = useState('');
  const [notes, setNotes] = useState('');
  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    {
      id: `JL-${Date.now()}-1`,
      lineNumber: 1,
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
    {
      id: `JL-${Date.now()}-2`,
      lineNumber: 2,
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
  ]);
  const [showAccountSearch, setShowAccountSearch] = useState<number | null>(null);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAsDraft, setSavingAsDraft] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const coa = await FinanceService.getChartOfAccounts();
        if (cancelled) return;
        const typeMap: Record<string, Account['type']> = {
          ASSET: 'Asset',
          LIABILITY: 'Liability',
          EQUITY: 'Equity',
          REVENUE: 'Income',
          EXPENSE: 'Expense',
        };
        setAccounts(
          (Array.isArray(coa) ? coa : []).map((a: any) => ({
            code: String(a.code ?? ''),
            name: String(a.name ?? ''),
            type: typeMap[String(a.type)] ?? 'Asset',
            balance: Number(a.balance ?? 0),
          })),
        );
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load accounts');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleLoadTemplate = (template: JournalTemplate) => {
    const newLines: JournalLine[] = template.lines.map((line, index) => ({
      ...line,
      id: `JL-${Date.now()}-${index}`,
      lineNumber: index + 1,
    }));
    setJournalLines(newLines);
    setDescription(template.description);
    setShowTemplates(false);
    alert(`Template "${template.name}" loaded successfully!`);
  };

  const handleSave = async (isDraft: boolean = false) => {
    // Validation
    if (!entryDate) {
      alert('Please select an entry date');
      return;
    }

    if (!description.trim()) {
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

    // Check if entry is balanced (only if posting)
    if (!isDraft && !isBalanced) {
      alert('Entry is not balanced. Total debits must equal total credits.');
      return;
    }

    if (isDraft) {
      setSavingAsDraft(true);
    } else {
      setSaving(true);
    }

    try {
      await FinanceService.createJournalEntry({
        entryDate,
        entryType,
        description,
        referenceNumber,
        sourceDocument,
        notes,
        journalLines,
        status: isDraft ? 'Draft' : 'Posted',
        companyId: 'default-company-id',
      });
      router.push('/finance/accounting');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
      setSavingAsDraft(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push('/finance/accounting');
    }
  };

  const handleAutoBalance = () => {
    if (journalLines.length < 2) {
      alert('Add at least 2 lines to use auto-balance');
      return;
    }

    const debitLines = journalLines.filter((line) => line.debitAmount > 0);
    const creditLines = journalLines.filter((line) => line.creditAmount > 0);

    if (debitLines.length === 0 && creditLines.length === 0) {
      alert('Enter at least one debit or credit amount');
      return;
    }

    // Auto-balance logic: if difference exists, adjust the last line
    if (Math.abs(difference) > 0.01) {
      const lastLine = journalLines[journalLines.length - 1];
      const updatedLines = [...journalLines];
      const lastIndex = updatedLines.length - 1;

      if (difference > 0) {
        // More debits than credits, add credit to last line
        updatedLines[lastIndex] = {
          ...lastLine,
          creditAmount: lastLine.creditAmount + difference,
          debitAmount: 0,
        };
      } else {
        // More credits than debits, add debit to last line
        updatedLines[lastIndex] = {
          ...lastLine,
          debitAmount: lastLine.debitAmount + Math.abs(difference),
          creditAmount: 0,
        };
      }

      setJournalLines(updatedLines);
      alert('Entry auto-balanced successfully!');
    } else {
      alert('Entry is already balanced!');
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
                <Plus className="h-8 w-8 text-blue-600" />
                <span>Create Journal Entry</span>
              </h1>
              <p className="text-gray-600 mt-1">Add a new journal entry with double-entry bookkeeping</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <List className="h-4 w-4" />
              <span>Templates</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={savingAsDraft}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingAsDraft ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{savingAsDraft ? 'Saving...' : 'Save as Draft'}</span>
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={!isBalanced || saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{saving ? 'Posting...' : 'Post Entry'}</span>
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
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-900">Entry Not Balanced</h3>
                <p className="text-sm text-red-700 mt-1">
                  Difference: ₹{Math.abs(difference).toLocaleString()} ({difference > 0 ? 'Debit' : 'Credit'} excess)
                </p>
              </div>
              <button
                onClick={handleAutoBalance}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                <span>Auto Balance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <List className="h-6 w-6 mr-2 text-blue-600" />
                  Journal Entry Templates
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {journalTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="space-y-1">
                            {template.lines.map((line, index) => (
                              <div key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                                <span className="font-mono">{line.accountCode}</span>
                                <span>•</span>
                                <span>{line.accountName}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center text-blue-600 text-sm font-semibold">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Click to use this template</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Entry Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Type *
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as any)}
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
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
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
              value={sourceDocument}
              onChange={(e) => setSourceDocument(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sales Invoice"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            <li>Total debits must equal total credits for posting (can save as draft if unbalanced)</li>
            <li>At least 2 journal lines are required</li>
            <li>All lines must have an account selected</li>
            <li>Use templates to quickly create common journal entries</li>
            <li>Auto-balance feature will adjust the last line to balance the entry</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
