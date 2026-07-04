'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Send
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface GSTTransaction {
  id: string;
  date: string;
  invoiceNumber: string;
  partyName: string;
  gstin: string;
  transactionType: 'Sale' | 'Purchase' | 'Sales Return' | 'Purchase Return';
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  totalAmount: number;
  gstRate: number;
  placeOfSupply: string;
  hsn?: string;
  returnPeriod: string;
  filed: boolean;
}

interface GSTReturn {
  id: string;
  returnType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-2A' | 'GSTR-9';
  period: string;
  dueDate: string;
  status: 'Draft' | 'Ready to File' | 'Filed' | 'Overdue';
  filedDate?: string;
  arn?: string;
  totalSales: number;
  totalPurchases: number;
  outputTax: number;
  inputTax: number;
  netTax: number;
}

export default function GSTManagementPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'returns'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2025-01');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // GST transactions + returns loaded from tax masters (tax configuration)
  const [gstTransactions, setGstTransactions] = useState<GSTTransaction[]>([]);
  const [gstReturns, setGstReturns] = useState<GSTReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getTaxMasters()) as any[];
        const gstRows = (raw ?? []).filter((t) =>
          ['CGST', 'SGST', 'IGST', 'CESS', 'GST'].includes(String(t.taxType ?? '').toUpperCase()),
        );
        const txns: GSTTransaction[] = gstRows.map((t, i) => {
          const rate = Number(t.taxRate ?? 0);
          const type = String(t.taxType ?? '').toUpperCase();
          const isOutput = String(t.taxCategory ?? '').toLowerCase().includes('output');
          const returnPeriod = t.effectiveFrom ? String(t.effectiveFrom).slice(0, 7) : '';
          return {
            id: t.id ?? `GT-${i}`,
            date: t.effectiveFrom ?? '',
            invoiceNumber: t.taxCode ?? '-',
            partyName: t.taxName ?? '-',
            gstin: t.taxCode ?? '-',
            transactionType: isOutput ? 'Sale' : 'Purchase',
            taxableAmount: 0,
            cgst: type === 'CGST' ? rate : 0,
            sgst: type === 'SGST' ? rate : 0,
            igst: type === 'IGST' ? rate : 0,
            cess: type === 'CESS' ? rate : 0,
            totalTax: 0,
            totalAmount: 0,
            gstRate: rate,
            placeOfSupply: '-',
            hsn: undefined,
            returnPeriod,
            filed: !t.isActive ? false : Boolean(t.effectiveTo),
          };
        });
        const periods = Array.from(new Set(txns.map((t) => t.returnPeriod).filter(Boolean)));
        const returns: GSTReturn[] = periods.map((p, i) => ({
          id: `GR-${i}`,
          returnType: 'GSTR-3B',
          period: p,
          dueDate: '',
          status: 'Draft',
          totalSales: 0,
          totalPurchases: 0,
          outputTax: 0,
          inputTax: 0,
          netTax: 0,
        }));
        if (!cancelled) {
          setGstTransactions(txns);
          setGstReturns(returns);
          if (txns.length > 0 && !txns.some((t) => t.returnPeriod === periodFilter)) {
            setPeriodFilter(txns[0].returnPeriod);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load GST data');
          setGstTransactions([]);
          setGstReturns([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTransactions = gstTransactions.filter(txn => {
    const matchesSearch =
      txn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.gstin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || txn.transactionType === typeFilter;
    const matchesPeriod = txn.returnPeriod === periodFilter;

    return matchesSearch && matchesType && matchesPeriod;
  });

  // Calculate statistics
  const totalOutputTax = gstTransactions
    .filter(t => ['Sale', 'Purchase Return'].includes(t.transactionType))
    .reduce((sum, t) => sum + t.totalTax, 0);

  const totalInputTax = gstTransactions
    .filter(t => ['Purchase', 'Sales Return'].includes(t.transactionType))
    .reduce((sum, t) => sum + Math.abs(t.totalTax), 0);

  const netGST = totalOutputTax - totalInputTax;
  const pendingReturns = gstReturns.filter(r => r.status === 'Ready to File' || r.status === 'Draft').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      Sale: 'bg-green-500/20 text-green-400',
      Purchase: 'bg-blue-500/20 text-blue-400',
      'Sales Return': 'bg-red-500/20 text-red-400',
      'Purchase Return': 'bg-orange-500/20 text-orange-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-500/20 text-gray-400',
      'Ready to File': 'bg-yellow-500/20 text-yellow-400',
      Filed: 'bg-green-500/20 text-green-400',
      Overdue: 'bg-red-500/20 text-red-400'
    };
    const icons = {
      Draft: Clock,
      'Ready to File': AlertCircle,
      Filed: CheckCircle,
      Overdue: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const handleImportGSTR2A = () => {
    setIsImporting(true);
    setTimeout(() => {
      alert('Import GSTR-2A\n\nThis will open a file upload dialog to import GSTR-2A data from the GST portal.\n\nSupported formats:\n- JSON (from GST Portal)\n- Excel (.xlsx)\n\nThe system will:\n- Validate GSTIN\n- Match with purchase records\n- Identify mismatches\n- Auto-reconcile matched entries');
      setIsImporting(false);
    }, 500);
  };

  const handleNewTransaction = () => {
    alert('New GST Transaction\n\nThis will open a form to manually add a GST transaction.\n\nYou can enter:\n- Transaction type (Sale/Purchase/Return)\n- Party details and GSTIN\n- Invoice details\n- Taxable amount and GST rates\n- HSN/SAC codes\n- Place of supply\n\nThe system will auto-calculate:\n- CGST, SGST, or IGST based on place of supply\n- Total tax and invoice amount');
  };

  const handleExportGST = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Date', 'Invoice Number', 'Party Name', 'GSTIN', 'Type', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'CESS', 'Total Tax', 'Total Amount', 'GST Rate', 'Place of Supply', 'HSN', 'Return Period', 'Filed'];
      const rows = filteredTransactions.map(t => [
        t.date,
        t.invoiceNumber,
        t.partyName,
        t.gstin,
        t.transactionType,
        t.taxableAmount,
        t.cgst,
        t.sgst,
        t.igst,
        t.cess,
        t.totalTax,
        t.totalAmount,
        t.gstRate,
        t.placeOfSupply,
        t.hsn || '',
        t.returnPeriod,
        t.filed ? 'Yes' : 'No'
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Transactions_${periodFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 500);
  };

  const handleViewTransaction = (txn: GSTTransaction) => {
    alert(`GST Transaction Details\n\nInvoice: ${txn.invoiceNumber}\nDate: ${txn.date}\nParty: ${txn.partyName}\nGSTIN: ${txn.gstin}\nType: ${txn.transactionType}\n\nTaxable Amount: ${formatCurrency(txn.taxableAmount)}\nCGST: ${formatCurrency(txn.cgst)}\nSGST: ${formatCurrency(txn.sgst)}\nIGST: ${formatCurrency(txn.igst)}\nTotal Tax: ${formatCurrency(txn.totalTax)}\nTotal Amount: ${formatCurrency(txn.totalAmount)}\n\nGST Rate: ${txn.gstRate}%\nPlace of Supply: ${txn.placeOfSupply}\nHSN: ${txn.hsn || 'N/A'}\nReturn Period: ${txn.returnPeriod}\nFiled: ${txn.filed ? 'Yes' : 'No'}`);
  };

  const handleViewReturn = (ret: GSTReturn) => {
    alert(`GST Return Details\n\nReturn Type: ${ret.returnType}\nPeriod: ${ret.period}\nDue Date: ${ret.dueDate}\nStatus: ${ret.status}\n${ret.filedDate ? `\nFiled Date: ${ret.filedDate}` : ''}${ret.arn ? `\nARN: ${ret.arn}` : ''}\n\nTotal Sales: ${formatCurrency(ret.totalSales)}\nTotal Purchases: ${formatCurrency(ret.totalPurchases)}\nOutput Tax: ${formatCurrency(ret.outputTax)}\nInput Tax: ${formatCurrency(ret.inputTax)}\nNet Tax: ${formatCurrency(ret.netTax)}\n\n${ret.netTax >= 0 ? 'Tax Payable' : 'Tax Refund'}`);
  };

  const handleFileReturn = (ret: GSTReturn) => {
    const confirm = window.confirm(`File ${ret.returnType} for ${ret.period}?\n\nNet Tax: ${formatCurrency(ret.netTax)}\nDue Date: ${ret.dueDate}\n\nThis will:\n- Validate all transactions\n- Generate JSON for GST portal\n- Mark return as filed\n- Generate ARN\n\nDo you want to continue?`);

    if (confirm) {
      alert(`Filing ${ret.returnType} for ${ret.period}\n\nIn production, this would:\n- Upload to GST portal API\n- Receive ARN\n- Update filing status\n- Send email confirmation\n- Update compliance dashboard\n\nDemo: Return filed successfully!\nARN: AA${new Date().getFullYear()}${(Math.random() * 1000000).toFixed(0)}X`);
    }
  };

  const handleDownloadReturn = (ret: GSTReturn) => {
    alert(`Download ${ret.returnType} for ${ret.period}\n\nAvailable formats:\n1. JSON - For GST portal upload\n2. PDF - Summary report\n3. Excel - Detailed transactions\n\nSelect format:\n- JSON: Direct upload to GST portal\n- PDF: For records and review\n- Excel: For analysis and reconciliation`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            Loading GST data…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {loadError}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">GST Management</h1>
            <p className="text-gray-400">Manage GST transactions and returns</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportGSTR2A}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import GSTR-2A'}
            </button>
            <button
              onClick={handleNewTransaction}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </button>
            <button
              onClick={handleExportGST}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalOutputTax)}</div>
            <div className="text-green-100 text-sm">Output Tax (Sales)</div>
            <div className="mt-2 text-xs text-green-100">GST collected</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalInputTax)}</div>
            <div className="text-blue-100 text-sm">Input Tax (Purchases)</div>
            <div className="mt-2 text-xs text-blue-100">GST paid</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              {netGST >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(netGST)}</div>
            <div className="text-purple-100 text-sm">Net GST {netGST >= 0 ? 'Payable' : 'Refund'}</div>
            <div className="mt-2 text-xs text-purple-100">For current period</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{pendingReturns}</div>
            <div className="text-orange-100 text-sm">Pending Returns</div>
            <div className="mt-2 text-xs text-orange-100">To be filed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'transactions'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                GST Transactions ({filteredTransactions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'returns'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                GST Returns ({gstReturns.length})
              </div>
            </button>
          </div>

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <>
              {/* Filters */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by invoice, party name, or GSTIN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Types</option>
                      <option value="Sale">Sale</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Sales Return">Sales Return</option>
                      <option value="Purchase Return">Purchase Return</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="2025-01">January 2025</option>
                      <option value="2024-12">December 2024</option>
                      <option value="2024-11">November 2024</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Invoice</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Party Details</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Type</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Taxable Amount</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">GST Amount</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Total Amount</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 py-2 text-white text-sm">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-white text-sm">{txn.invoiceNumber}</div>
                          <div className="text-xs text-gray-400">HSN: {txn.hsn || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-white text-sm">{txn.partyName}</div>
                          <div className="text-xs text-gray-400 font-mono">{txn.gstin}</div>
                          <div className="text-xs text-gray-500">{txn.placeOfSupply}</div>
                        </td>
                        <td className="px-3 py-2">
                          {getTypeBadge(txn.transactionType)}
                        </td>
                        <td className="px-3 py-2 text-right text-white font-medium">
                          {txn.taxableAmount < 0 && '('}{formatCurrency(txn.taxableAmount)}{txn.taxableAmount < 0 && ')'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-green-400 font-medium">
                            {txn.totalTax < 0 && '('}{formatCurrency(txn.totalTax)}{txn.totalTax < 0 && ')'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {txn.gstRate}% ({txn.igst > 0 ? 'IGST' : 'CGST+SGST'})
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-white font-medium">
                          {txn.totalAmount < 0 && '('}{formatCurrency(txn.totalAmount)}{txn.totalAmount < 0 && ')'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {txn.filed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Filed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewTransaction(txn)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="View transaction details"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Returns Tab */}
          {activeTab === 'returns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Return Type</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Period</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Due Date</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Total Sales</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Output Tax</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Input Tax</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Net Tax</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gstReturns.map((ret) => (
                    <tr key={ret.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="font-medium text-white">{ret.returnType}</div>
                        {ret.arn && (
                          <div className="text-xs text-gray-400 font-mono mt-1">ARN: {ret.arn}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-white text-sm">{ret.period}</td>
                      <td className="px-3 py-2">
                        <div className="text-white text-sm">{new Date(ret.dueDate).toLocaleDateString()}</div>
                        {ret.filedDate && (
                          <div className="text-xs text-green-400 mt-1">
                            Filed: {new Date(ret.filedDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-white font-medium">
                        {formatCurrency(ret.totalSales)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-400 font-medium">
                        {formatCurrency(ret.outputTax)}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-400 font-medium">
                        {formatCurrency(ret.inputTax)}
                      </td>
                      <td className="px-3 py-2 text-right text-purple-400 font-medium">
                        {formatCurrency(ret.netTax)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(ret.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewReturn(ret)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View return details"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          {ret.status !== 'Filed' && (
                            <button
                              onClick={() => handleFileReturn(ret)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="File return to GST portal"
                            >
                              <Send className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadReturn(ret)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download return in various formats"
                          >
                            <Download className="w-4 h-4 text-purple-400" />
                          </button>
                        </div>
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
  );
}
