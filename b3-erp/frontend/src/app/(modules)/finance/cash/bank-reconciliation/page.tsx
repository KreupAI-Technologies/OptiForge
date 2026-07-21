'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Check,
  X
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  matched: boolean;
  erpTransactionId?: string;
}

interface ERPTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  matched: boolean;
  bankTransactionId?: string;
}

export default function BankReconciliationPage() {
  const [selectedAccount, setSelectedAccount] = useState('BA001');
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'erp' | 'matched'>('bank');

  // Bank + ERP transactions loaded from backend (payments + cash dashboard)
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [erpTransactions, setErpTransactions] = useState<ERPTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoMatching, setAutoMatching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [payments, dash] = await Promise.all([
        FinanceService.getPayments() as Promise<any[]>,
        FinanceService.getCashDashboard() as Promise<any>,
      ]);
      const bankRows: any[] = Array.isArray(dash?.transactions) ? dash.transactions : [];
      let running = Number(dash?.stats?.currentBalance ?? 0);
      const bank: BankTransaction[] = bankRows.map((t, i) => {
        const debit = Number(t.debit ?? t.debitAmount ?? (t.type === 'outflow' ? t.amount : 0) ?? 0);
        const credit = Number(t.credit ?? t.creditAmount ?? (t.type === 'inflow' ? t.amount : 0) ?? 0);
        running = running + credit - debit;
        return {
          id: t.id ?? `BT-${i}`,
          date: t.date ?? t.transactionDate ?? '',
          description: t.description ?? t.narration ?? '-',
          reference: t.reference ?? t.referenceNumber ?? '-',
          debit,
          credit,
          balance: Number(t.balance ?? running),
          matched: Boolean(t.matched ?? t.isMatched),
          erpTransactionId: t.erpTransactionId ?? undefined,
        };
      });
      const erp: ERPTransaction[] = (payments ?? []).map((p, i) => {
        const isPayment = String(p.paymentType ?? p.type ?? '').toLowerCase().includes('pay');
        const amount = Number(p.amount ?? p.netAmount ?? 0);
        return {
          id: p.id ?? `ERP-${i}`,
          date: p.paymentDate ?? p.date ?? '',
          description: p.description ?? p.narration ?? p.paymentNumber ?? '-',
          reference: p.paymentNumber ?? p.reference ?? p.referenceNumber ?? '-',
          debit: isPayment ? amount : 0,
          credit: isPayment ? 0 : amount,
          matched: Boolean(p.matched ?? p.isReconciled),
          bankTransactionId: p.bankTransactionId ?? undefined,
        };
      });
      setBankTransactions(bank);
      setErpTransactions(erp);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load reconciliation data');
      setBankTransactions([]);
      setErpTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Run auto-match for the selected bank account, then reload data.
  const handleAutoMatch = async () => {
    if (!selectedAccount) return;
    setAutoMatching(true);
    setActionError(null);
    try {
      await FinanceService.autoMatchBankAccount(selectedAccount);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Auto-match failed');
    } finally {
      setAutoMatching(false);
    }
  };

  // Export the reconciliation report for the selected account as a JSON download.
  const handleExportReport = async () => {
    if (!selectedAccount) return;
    setExporting(true);
    setActionError(null);
    try {
      const report = await FinanceService.getReconciliationReport(selectedAccount, selectedPeriod);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reconciliation-report-${selectedAccount}-${selectedPeriod}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const matchedTransactions = bankTransactions.filter(t => t.matched);
  const unmatchedBankTxns = bankTransactions.filter(t => !t.matched);
  const unmatchedERPTxns = erpTransactions.filter(t => !t.matched);

  // Calculate statistics
  const bankBalance = 15750000;
  const erpBalance = 15476500;
  const difference = bankBalance - erpBalance;
  const matchedCount = matchedTransactions.length;
  const unmatchedCount = unmatchedBankTxns.length + unmatchedERPTxns.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const filteredBankTransactions = bankTransactions.filter(txn => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !showUnmatchedOnly || !txn.matched;

    return matchesSearch && matchesFilter;
  });

  const filteredERPTransactions = erpTransactions.filter(txn => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !showUnmatchedOnly || !txn.matched;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {isLoading && (
              <div className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
                Loading reconciliation data…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {loadError}
              </div>
            )}
            {actionError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {actionError}
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Bank Reconciliation</h1>
                <p className="text-gray-400">Reconcile bank statements with ERP transactions</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  Import Statement
                </button>
                <button
                  onClick={handleAutoMatch}
                  disabled={!selectedAccount || autoMatching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${autoMatching ? 'animate-spin' : ''}`} />
                  {autoMatching ? 'Matching…' : 'Auto Match'}
                </button>
                <button
                  onClick={handleExportReport}
                  disabled={!selectedAccount || exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting…' : 'Export Report'}
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(bankBalance)}</div>
                <div className="text-blue-100 text-sm">Bank Statement Balance</div>
                <div className="mt-2 text-xs text-blue-100">As per bank records</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(erpBalance)}</div>
                <div className="text-green-100 text-sm">ERP Book Balance</div>
                <div className="mt-2 text-xs text-green-100">As per accounting records</div>
              </div>

              <div className={`bg-gradient-to-br ${Math.abs(difference) < 1000 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'
                } rounded-xl p-3 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-8 h-8 opacity-80" />
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(difference)}</div>
                <div className={`${Math.abs(difference) < 1000 ? 'text-green-100' : 'text-orange-100'
                  } text-sm`}>
                  Difference
                </div>
                <div className={`mt-2 text-xs ${Math.abs(difference) < 1000 ? 'text-green-100' : 'text-orange-100'
                  }`}>
                  {Math.abs(difference) < 1000 ? 'Negligible' : 'Needs attention'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="w-8 h-8 opacity-80" />
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {matchedCount}/{matchedCount + unmatchedCount}
                </div>
                <div className="text-purple-100 text-sm">Matched Transactions</div>
                <div className="mt-2 text-xs text-purple-100">
                  {((matchedCount / (matchedCount + unmatchedCount)) * 100).toFixed(0)}% complete
                </div>
              </div>
            </div>

            {/* Account & Period Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BA001">HDFC Bank - 50200012345678</option>
                    <option value="BA002">ICICI Bank - 012345678901</option>
                    <option value="BA003">SBI - 30123456789</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="2025-01">January 2025</option>
                    <option value="2024-12">December 2024</option>
                    <option value="2024-11">November 2024</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnmatchedOnly}
                    onChange={(e) => setShowUnmatchedOnly(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  Show Unmatched Only
                </label>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('bank')}
                  className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'bank'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Bank Statement ({unmatchedBankTxns.length} unmatched)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('erp')}
                  className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'erp'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ERP Transactions ({unmatchedERPTxns.length} unmatched)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('matched')}
                  className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'matched'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Matched ({matchedCount})
                  </div>
                </button>
              </div>

              {/* Bank Statement Tab */}
              {activeTab === 'bank' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">
                          <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Description</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Reference</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Debit</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Credit</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Balance</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBankTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                          <td className="px-3 py-2">
                            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                          </td>
                          <td className="px-3 py-2 text-white text-sm">
                            {new Date(txn.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-sm">{txn.description}</td>
                          <td className="px-3 py-2 text-gray-400 text-sm font-mono">{txn.reference}</td>
                          <td className="px-3 py-2 text-right text-red-400 font-medium">
                            {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-green-400 font-medium">
                            {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-white font-medium">
                            {formatCurrency(txn.balance)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {txn.matched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                                <XCircle className="w-3 h-3" />
                                Unmatched
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              {!txn.matched && (
                                <>
                                  <button className="p-2 hover:bg-green-600/20 rounded-lg transition-colors">
                                    <Check className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button className="p-2 hover:bg-blue-600/20 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4 text-blue-400" />
                                  </button>
                                </>
                              )}
                              {txn.matched && (
                                <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ERP Transactions Tab */}
              {activeTab === 'erp' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">
                          <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Description</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Reference</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Debit</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Credit</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredERPTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                          <td className="px-3 py-2">
                            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                          </td>
                          <td className="px-3 py-2 text-white text-sm">
                            {new Date(txn.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-sm">{txn.description}</td>
                          <td className="px-3 py-2 text-gray-400 text-sm font-mono">{txn.reference}</td>
                          <td className="px-3 py-2 text-right text-red-400 font-medium">
                            {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-green-400 font-medium">
                            {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {txn.matched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Matched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                                <XCircle className="w-3 h-3" />
                                Unmatched
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              {!txn.matched && (
                                <button className="p-2 hover:bg-green-600/20 rounded-lg transition-colors">
                                  <Check className="w-4 h-4 text-green-400" />
                                </button>
                              )}
                              {txn.matched && (
                                <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Matched Transactions Tab */}
              {activeTab === 'matched' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Bank Reference</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">ERP Reference</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Description</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Amount</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Type</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedTransactions.map((txn) => {
                        const erpTxn = erpTransactions.find(e => e.id === txn.erpTransactionId);
                        return (
                          <tr key={txn.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                            <td className="px-3 py-2 text-white text-sm">
                              {new Date(txn.date).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 text-gray-400 text-sm font-mono">{txn.reference}</td>
                            <td className="px-3 py-2 text-gray-400 text-sm font-mono">{erpTxn?.reference}</td>
                            <td className="px-3 py-2 text-gray-300 text-sm">{txn.description}</td>
                            <td className={`px-3 py-2 text-right font-medium ${txn.debit > 0 ? 'text-red-400' : 'text-green-400'
                              }`}>
                              {formatCurrency(txn.debit > 0 ? txn.debit : txn.credit)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${txn.debit > 0
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-green-500/20 text-green-400'
                                }`}>
                                {txn.debit > 0 ? 'Payment' : 'Receipt'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reconciliation Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">Reconciliation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bank Statement Balance:</span>
                    <span className="text-white font-medium">{formatCurrency(bankBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Less: Unmatched Credits</span>
                    <span className="text-red-400 font-medium">({formatCurrency(776500)})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Add: Unmatched Debits</span>
                    <span className="text-green-400 font-medium">{formatCurrency(1500)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                    <span className="text-white font-semibold">Adjusted Bank Balance:</span>
                    <span className="text-white font-bold">{formatCurrency(14975000)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ERP Book Balance:</span>
                    <span className="text-white font-medium">{formatCurrency(erpBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Add: Unmatched Receipts</span>
                    <span className="text-green-400 font-medium">{formatCurrency(300000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Less: Unmatched Payments</span>
                    <span className="text-red-400 font-medium">({formatCurrency(150000)})</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                    <span className="text-white font-semibold">Adjusted ERP Balance:</span>
                    <span className="text-white font-bold">{formatCurrency(15626500)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
