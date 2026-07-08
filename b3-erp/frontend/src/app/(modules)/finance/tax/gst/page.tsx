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

  // GST transactions + returns loaded from tax masters (tax configuration)
  const [gstTransactions, setGstTransactions] = useState<GSTTransaction[]>([]);
  const [gstReturns, setGstReturns] = useState<GSTReturn[]>([]);
  // Raw GST tax-rate config rows (the real, editable backing data)
  const [gstRates, setGstRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create/Edit GST rate modal state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState({
    taxName: '',
    taxCode: '',
    taxCategory: 'GST',
    taxRate: '',
    description: '',
    isActive: true,
  });

  const loadGstData = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await FinanceService.getTaxMasters()) as any[];
      const gstRows = (raw ?? []).filter((t) =>
        ['CGST', 'SGST', 'IGST', 'CESS', 'GST'].includes(String(t.taxType ?? '').toUpperCase()),
      );
      setGstRates(gstRows);
      {
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
        setGstTransactions(txns);
        setGstReturns(returns);
        setPeriodFilter((prev) => {
          if (txns.length > 0 && !txns.some((t) => t.returnPeriod === prev)) {
            return txns[0].returnPeriod;
          }
          return prev;
        });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load GST data');
      setGstRates([]);
      setGstTransactions([]);
      setGstReturns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGstData();
  }, [loadGstData]);

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

  // NEEDS BACKEND: GSTR-2A import has no endpoint in the finance service map
  // (only tax-masters + statutory report exist). Kept as an informational stub;
  // does NOT fabricate success.
  const handleImportGSTR2A = () => {
    alert('Import GSTR-2A is not yet available.\n\nNo GST-portal import endpoint is wired on the backend. Once available, this will import and reconcile GSTR-2A data from the GST portal.');
  };

  const openCreateRate = () => {
    setEditingRateId(null);
    setFormError(null);
    setRateForm({
      taxName: '',
      taxCode: '',
      taxCategory: 'GST',
      taxRate: '',
      description: '',
      isActive: true,
    });
    setIsRateModalOpen(true);
  };

  const openEditRate = (row: any) => {
    setEditingRateId(String(row.id));
    setFormError(null);
    setRateForm({
      taxName: row.taxName ?? '',
      taxCode: row.taxCode ?? '',
      taxCategory: row.taxCategory ?? 'GST',
      taxRate: row.taxRate != null ? String(row.taxRate) : '',
      description: row.description ?? '',
      isActive: row.isActive != null ? Boolean(row.isActive) : true,
    });
    setIsRateModalOpen(true);
  };

  const closeRateModal = () => {
    if (isSubmitting) return;
    setIsRateModalOpen(false);
    setEditingRateId(null);
    setFormError(null);
  };

  const handleSubmitRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!rateForm.taxName.trim()) {
      setFormError('Tax name is required.');
      return;
    }
    const rateNum = Number(rateForm.taxRate);
    if (rateForm.taxRate === '' || Number.isNaN(rateNum) || rateNum < 0) {
      setFormError('Enter a valid GST rate (%).');
      return;
    }

    const payload = {
      taxName: rateForm.taxName.trim(),
      taxCode: rateForm.taxCode.trim() || undefined,
      taxType: 'GST',
      taxCategory: rateForm.taxCategory.trim() || 'GST',
      taxRate: rateNum,
      description: rateForm.description.trim() || undefined,
      isActive: rateForm.isActive,
    };

    setIsSubmitting(true);
    try {
      if (editingRateId) {
        await FinanceService.updateTaxMaster(editingRateId, payload);
      } else {
        await FinanceService.createTaxMaster(payload);
      }
      setIsRateModalOpen(false);
      setEditingRateId(null);
      await loadGstData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save GST rate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRate = async (row: any) => {
    if (!row?.id) return;
    const ok = window.confirm(`Delete GST rate "${row.taxName ?? row.id}"?`);
    if (!ok) return;
    try {
      await FinanceService.deleteTaxMaster(String(row.id));
      await loadGstData();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete GST rate.');
    }
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

  // NEEDS BACKEND: no GST-portal filing endpoint exists in the finance service map.
  const handleFileReturn = (ret: GSTReturn) => {
    alert(`Filing ${ret.returnType} for ${ret.period} is not yet available.\n\nNo GST-portal filing endpoint is wired on the backend. This action does not submit anything.`);
  };

  // NEEDS BACKEND: no return-download/generation endpoint exists in the finance service map.
  const handleDownloadReturn = (ret: GSTReturn) => {
    alert(`Downloading ${ret.returnType} for ${ret.period} is not yet available.\n\nNo return-generation endpoint is wired on the backend.`);
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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="GSTR-2A import (backend endpoint not yet available)"
            >
              <Upload className="w-4 h-4" />
              Import GSTR-2A
            </button>
            <button
              onClick={openCreateRate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add GST Rate
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

        {/* GST Rate Configuration (real tax-master rows) */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-white">GST Rate Configuration</h2>
              <p className="text-xs text-gray-400">GST tax-rate masters used across the system</p>
            </div>
            <button
              onClick={openCreateRate}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add GST Rate
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Code</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Rate (%)</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Active</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gstRates.length === 0 && !isLoading && !loadError && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-400">
                      No GST rates configured yet. Click &quot;Add GST Rate&quot; to create one.
                    </td>
                  </tr>
                )}
                {gstRates.map((row, i) => (
                  <tr key={row.id ?? `rate-${i}`} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 py-2 text-white text-sm">{row.taxName ?? '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-sm font-mono">{row.taxCode ?? '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-sm">{row.taxCategory ?? row.taxType ?? '-'}</td>
                    <td className="px-3 py-2 text-right text-white text-sm">{Number(row.taxRate ?? 0)}</td>
                    <td className="px-3 py-2 text-center">
                      {row.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditRate(row)}
                          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                          title="Edit GST rate"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRate(row)}
                          className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
                          title="Delete GST rate"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-400">
                          {isLoading
                            ? 'Loading…'
                            : loadError
                              ? 'Unable to load GST data.'
                              : 'No GST transactions for the selected filters.'}
                        </td>
                      </tr>
                    )}
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
                  {gstReturns.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-400">
                        {isLoading
                          ? 'Loading…'
                          : loadError
                            ? 'Unable to load GST data.'
                            : 'No GST return periods available.'}
                      </td>
                    </tr>
                  )}
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

      {/* Add / Edit GST Rate Modal */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
              <h3 className="text-lg font-semibold text-white">
                {editingRateId ? 'Edit GST Rate' : 'Add GST Rate'}
              </h3>
              <button
                onClick={closeRateModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitRate} className="space-y-3 px-5 py-4">
              {formError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {formError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-gray-300">Tax Name *</label>
                <input
                  type="text"
                  value={rateForm.taxName}
                  onChange={(e) => setRateForm((f) => ({ ...f, taxName: e.target.value }))}
                  placeholder="e.g. GST 18%"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Tax Code</label>
                  <input
                    type="text"
                    value={rateForm.taxCode}
                    onChange={(e) => setRateForm((f) => ({ ...f, taxCode: e.target.value }))}
                    placeholder="e.g. GST18"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Category</label>
                  <select
                    value={rateForm.taxCategory}
                    onChange={(e) => setRateForm((f) => ({ ...f, taxCategory: e.target.value }))}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="GST">GST</option>
                    <option value="Output">Output</option>
                    <option value="Input">Input</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateForm.taxRate}
                  onChange={(e) => setRateForm((f) => ({ ...f, taxRate: e.target.value }))}
                  placeholder="e.g. 18"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Description / HSN</label>
                <input
                  type="text"
                  value={rateForm.description}
                  onChange={(e) => setRateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description or HSN/SAC code"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={rateForm.isActive}
                  onChange={(e) => setRateForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700"
                />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeRateModal}
                  disabled={isSubmitting}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving…' : editingRateId ? 'Update Rate' : 'Create Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
