'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  FileText,
  Users,
  TrendingDown,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Send,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface TDSTransaction {
  id: string;
  date: string;
  paymentRef: string;
  deductee: string;
  pan: string;
  section: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netPayment: number;
  quarter: string;
  challanNumber?: string;
  challanDate?: string;
  deposited: boolean;
}

interface TDSReturn {
  id: string;
  quarter: string;
  formType: '24Q' | '26Q' | '27Q' | '27EQ';
  dueDate: string;
  status: 'Draft' | 'Ready to File' | 'Filed' | 'Overdue';
  filedDate?: string;
  acknowledgementNumber?: string;
  totalDeductions: number;
  totalDeposited: number;
  deducteeCount: number;
}

interface TDSSectionConfig {
  id: string;
  sectionCode: string;
  description: string;
  rate: number;
  threshold: number;
  isActive: boolean;
}

interface TDSConfigForm {
  sectionCode: string;
  description: string;
  rate: string;
  threshold: string;
  isActive: boolean;
}

const emptyConfigForm: TDSConfigForm = {
  sectionCode: '',
  description: '',
  rate: '',
  threshold: '',
  isActive: true,
};

export default function TDSManagementPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'returns' | 'challans'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [quarterFilter, setQuarterFilter] = useState('Q4-2024-25');
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [tdsTransactions, setTdsTransactions] = useState<TDSTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // TDS section configuration (tax masters, taxType=TDS)
  const [sectionConfigs, setSectionConfigs] = useState<TDSSectionConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Create/edit config modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<TDSConfigForm>(emptyConfigForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTaxMasters = async () => {
    setConfigLoading(true);
    setConfigError(null);
    try {
      const raw = await FinanceService.getTaxMasters({ taxType: 'TDS' });
      const mapped: TDSSectionConfig[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: String(r.id ?? ''),
        sectionCode: r.sectionCode ?? r.code ?? r.taxCode ?? r.name ?? '',
        description: r.description ?? r.taxName ?? r.name ?? '',
        rate: Number(r.rate ?? r.taxRate ?? 0),
        threshold: Number(r.threshold ?? r.thresholdAmount ?? 0),
        isActive: r.isActive ?? r.active ?? true,
      }));
      setSectionConfigs(mapped);
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Failed to load TDS section configuration');
      setSectionConfigs([]);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    loadTaxMasters();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const quarterOf = (d: Date) => {
      const m = d.getMonth();
      const fy = m >= 3 ? d.getFullYear() : d.getFullYear() - 1;
      const q = m >= 3 && m <= 5 ? 'Q1' : m >= 6 && m <= 8 ? 'Q2' : m >= 9 && m <= 11 ? 'Q3' : 'Q4';
      return `${q}-${fy}-${String((fy + 1) % 100).padStart(2, '0')}`;
    };
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await FinanceService.getPayments();
        const withTds = (Array.isArray(raw) ? raw : []).filter(
          (r: any) => r.hasTDS || Number(r.tdsAmount ?? 0) > 0,
        );
        const mapped: TDSTransaction[] = withTds.map((r: any) => {
          const gross = Number(r.amount ?? 0);
          const tds = Number(r.tdsAmount ?? 0);
          const dt = r.paymentDate ? new Date(r.paymentDate) : new Date();
          return {
            id: r.id ?? '',
            date: r.paymentDate ? String(r.paymentDate).slice(0, 10) : '',
            paymentRef: r.paymentNumber ?? '',
            deductee: r.partyName ?? '',
            pan: r.partyPan ?? '',
            section: r.tdsSection ?? '',
            grossAmount: gross,
            tdsRate: Number(r.tdsRate ?? 0),
            tdsAmount: tds,
            netPayment: Number(r.netPayment ?? (gross - tds)),
            quarter: quarterOf(dt),
            challanNumber: r.tdsChallanNumber ?? undefined,
            challanDate: r.tdsChallanDate ? String(r.tdsChallanDate).slice(0, 10) : undefined,
            deposited: Boolean(r.tdsDeposited ?? false),
          };
        });
        if (!cancelled) setTdsTransactions(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load TDS transactions');
          setTdsTransactions([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  // TODO(NEEDS BACKEND): No endpoint for TDS returns. These are illustrative
  // placeholder rows only. Replace with a real service call once a
  // TDS-returns endpoint exists. Not live data.
  const tdsReturns: TDSReturn[] = [
    {
      id: 'TR001',
      quarter: 'Q4 FY 2024-25',
      formType: '24Q',
      dueDate: '2025-05-31',
      status: 'Draft',
      totalDeductions: 500000,
      totalDeposited: 500000,
      deducteeCount: 45
    },
    {
      id: 'TR002',
      quarter: 'Q4 FY 2024-25',
      formType: '26Q',
      dueDate: '2025-04-30',
      status: 'Ready to File',
      totalDeductions: 57500,
      totalDeposited: 17500,
      deducteeCount: 4
    },
    {
      id: 'TR003',
      quarter: 'Q3 FY 2024-25',
      formType: '24Q',
      dueDate: '2025-02-15',
      status: 'Filed',
      filedDate: '2025-02-10',
      acknowledgementNumber: 'ACK202402ABCD1234',
      totalDeductions: 480000,
      totalDeposited: 480000,
      deducteeCount: 42
    },
    {
      id: 'TR004',
      quarter: 'Q3 FY 2024-25',
      formType: '26Q',
      dueDate: '2025-01-31',
      status: 'Filed',
      filedDate: '2025-01-28',
      acknowledgementNumber: 'ACK202401EFGH5678',
      totalDeductions: 52000,
      totalDeposited: 52000,
      deducteeCount: 5
    }
  ];

  // TODO(NEEDS BACKEND): No endpoint for TDS challans. These are illustrative
  // placeholder rows only. Replace with a real service call once a
  // TDS-challans endpoint exists. Not live data.
  const challans = [
    {
      id: 'CH001',
      challanNumber: 'CH2025010112345',
      date: '2025-01-16',
      amount: 10000,
      section: '194C',
      bankName: 'HDFC Bank',
      status: 'Paid'
    },
    {
      id: 'CH002',
      challanNumber: 'CH2025011398765',
      date: '2025-01-13',
      amount: 7500,
      section: '194C',
      bankName: 'ICICI Bank',
      status: 'Paid'
    }
  ];

  const filteredTransactions = tdsTransactions.filter(txn => {
    const matchesSearch =
      txn.paymentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.deductee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.pan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection = sectionFilter === 'all' || txn.section.includes(sectionFilter);
    const matchesQuarter = txn.quarter === quarterFilter;

    return matchesSearch && matchesSection && matchesQuarter;
  });

  // Calculate statistics
  const totalTDSDeducted = tdsTransactions.reduce((sum, t) => sum + t.tdsAmount, 0);
  const totalDeposited = tdsTransactions.filter(t => t.deposited).reduce((sum, t) => sum + t.tdsAmount, 0);
  const pendingDeposit = totalTDSDeducted - totalDeposited;
  const deducteeCount = new Set(tdsTransactions.map(t => t.pan)).size;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSectionBadge = (section: string) => {
    const sectionCode = section.split(' ')[0];
    const colors: { [key: string]: string } = {
      '192': 'bg-purple-500/20 text-purple-400',
      '194C': 'bg-blue-500/20 text-blue-400',
      '194J': 'bg-green-500/20 text-green-400',
      '194I': 'bg-orange-500/20 text-orange-400',
      '194H': 'bg-cyan-500/20 text-cyan-400'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[sectionCode] || 'bg-gray-500/20 text-gray-400'}`}>
        {section}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-500/20 text-gray-400',
      'Ready to File': 'bg-yellow-500/20 text-yellow-400',
      Filed: 'bg-green-500/20 text-green-400',
      Overdue: 'bg-red-500/20 text-red-400',
      Paid: 'bg-green-500/20 text-green-400'
    };
    const icons = {
      Draft: Clock,
      'Ready to File': AlertCircle,
      Filed: CheckCircle,
      Overdue: AlertCircle,
      Paid: CheckCircle
    };
    const Icon = icons[status as keyof typeof icons];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const handleNewTDSEntry = () => {
    setEditingId(null);
    setConfigForm(emptyConfigForm);
    setFormError(null);
    setIsConfigModalOpen(true);
  };

  const handleEditConfig = (cfg: TDSSectionConfig) => {
    setEditingId(cfg.id);
    setConfigForm({
      sectionCode: cfg.sectionCode,
      description: cfg.description,
      rate: String(cfg.rate ?? ''),
      threshold: String(cfg.threshold ?? ''),
      isActive: cfg.isActive,
    });
    setFormError(null);
    setIsConfigModalOpen(true);
  };

  const handleDeleteConfig = async (cfg: TDSSectionConfig) => {
    if (!window.confirm(`Delete TDS section ${cfg.sectionCode || cfg.description}?`)) return;
    try {
      await FinanceService.deleteTaxMaster(cfg.id);
      await loadTaxMasters();
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Failed to delete TDS section');
    }
  };

  const handleSubmitConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.sectionCode.trim()) {
      setFormError('Section code is required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const payload = {
      taxType: 'TDS',
      sectionCode: configForm.sectionCode.trim(),
      description: configForm.description.trim(),
      rate: Number(configForm.rate) || 0,
      threshold: Number(configForm.threshold) || 0,
      isActive: configForm.isActive,
    };
    try {
      if (editingId) {
        await FinanceService.updateTaxMaster(editingId, payload);
      } else {
        await FinanceService.createTaxMaster(payload);
      }
      setIsConfigModalOpen(false);
      setEditingId(null);
      setConfigForm(emptyConfigForm);
      await loadTaxMasters();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save TDS section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadForm16A = () => {
    setIsDownloading(true);
    setTimeout(() => {
      alert('Download Form 16A\n\nGenerate TDS certificates for all deductees.\n\nOptions:\n- Individual Form 16A for each deductee\n- Consolidated ZIP file\n- Quarter selection\n\nThe form includes:\n- Deductor details (TAN)\n- Deductee details (PAN)\n- Payment and deduction details\n- Challan information\n- Digital signature\n\nNote: Only for deposited TDS transactions');
      setIsDownloading(false);
    }, 500);
  };

  const handleExportTDS = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Date', 'Payment Ref', 'Deductee', 'PAN', 'Section', 'Gross Amount', 'TDS Rate', 'TDS Amount', 'Net Payment', 'Quarter', 'Challan Number', 'Challan Date', 'Deposited'];
      const rows = filteredTransactions.map(t => [
        t.date,
        t.paymentRef,
        t.deductee,
        t.pan,
        t.section,
        t.grossAmount,
        t.tdsRate,
        t.tdsAmount,
        t.netPayment,
        t.quarter,
        t.challanNumber || '',
        t.challanDate || '',
        t.deposited ? 'Yes' : 'No'
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TDS_Transactions_${quarterFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 500);
  };

  const handleViewTransaction = (txn: TDSTransaction) => {
    alert(`TDS Transaction Details\n\nPayment Ref: ${txn.paymentRef}\nDate: ${txn.date}\nDeductee: ${txn.deductee}\nPAN: ${txn.pan}\nSection: ${txn.section}\n\nGross Amount: ${formatCurrency(txn.grossAmount)}\nTDS Rate: ${txn.tdsRate}%\nTDS Amount: ${formatCurrency(txn.tdsAmount)}\nNet Payment: ${formatCurrency(txn.netPayment)}\n\nQuarter: ${txn.quarter}\n${txn.challanNumber ? `Challan: ${txn.challanNumber}\nChallan Date: ${txn.challanDate}` : 'Challan: Not deposited yet'}\nStatus: ${txn.deposited ? 'Deposited' : 'Pending Deposit'}`);
  };

  const handleDownloadTransactionCertificate = (txn: TDSTransaction) => {
    if (!txn.deposited) {
      alert('Certificate Not Available\n\nForm 16A can only be generated for deposited TDS.\n\nPlease deposit the TDS first using a challan.');
      return;
    }
    alert(`Download Form 16A for ${txn.deductee}\n\nThis will generate Form 16A certificate with:\n- Deductor TAN and details\n- Deductee PAN: ${txn.pan}\n- Payment date: ${txn.date}\n- Gross Amount: ${formatCurrency(txn.grossAmount)}\n- TDS Amount: ${formatCurrency(txn.tdsAmount)}\n- Challan: ${txn.challanNumber}\n- Challan Date: ${txn.challanDate}\n\nFormat: PDF with digital signature`);
  };

  const handleViewReturn = (ret: TDSReturn) => {
    alert(`TDS Return Details\n\nForm: ${ret.formType}\nQuarter: ${ret.quarter}\nDue Date: ${ret.dueDate}\nStatus: ${ret.status}\n${ret.filedDate ? `\nFiled Date: ${ret.filedDate}` : ''}${ret.acknowledgementNumber ? `\nAcknowledgement: ${ret.acknowledgementNumber}` : ''}\n\nTotal Deductions: ${formatCurrency(ret.totalDeductions)}\nTotal Deposited: ${formatCurrency(ret.totalDeposited)}\nNumber of Deductees: ${ret.deducteeCount}\n\n${ret.totalDeductions === ret.totalDeposited ? 'All TDS deposited ✓' : 'Pending deposit: ' + formatCurrency(ret.totalDeductions - ret.totalDeposited)}`);
  };

  const handleFileReturn = (ret: TDSReturn) => {
    if (ret.totalDeductions !== ret.totalDeposited) {
      alert(`Cannot File Return\n\nAll TDS must be deposited before filing.\n\nPending Deposit: ${formatCurrency(ret.totalDeductions - ret.totalDeposited)}\n\nPlease deposit the pending amount first.`);
      return;
    }

    const confirm = window.confirm(`File ${ret.formType} for ${ret.quarter}?\n\nTotal Deductions: ${formatCurrency(ret.totalDeductions)}\nDeductees: ${ret.deducteeCount}\nDue Date: ${ret.dueDate}\n\nThis will:\n- Validate all transactions\n- Generate return file\n- Upload to TRACES portal\n- Generate acknowledgement\n\nDo you want to continue?`);

    if (confirm) {
      alert(`Filing ${ret.formType} for ${ret.quarter}\n\nIn production, this would:\n- Validate PAN and TAN\n- Generate FVU file\n- Upload to TRACES\n- Receive token number\n- Send confirmation email\n\nDemo: Return filed successfully!\nAcknowledgement: ACK${new Date().getFullYear()}${(Math.random() * 100000000).toFixed(0).padStart(8, '0')}`);
    }
  };

  const handleDownloadReturn = (ret: TDSReturn) => {
    alert(`Download ${ret.formType} for ${ret.quarter}\n\nAvailable formats:\n\n1. FVU File - For TRACES upload\n   (.txt format, ready to upload)\n\n2. PDF Summary - Consolidated report\n   (All transactions, challans, totals)\n\n3. Excel Workbook - Detailed analysis\n   (Transaction-wise breakdown)\n\n4. Justification Report - For review\n   (Annexures and supporting docs)\n\nSelect the format based on your requirement.`);
  };

  const handleViewChallan = (challan: any) => {
    alert(`Challan Details\n\nChallan Number: ${challan.challanNumber}\nDate: ${challan.date}\nAmount: ${formatCurrency(challan.amount)}\nSection: ${challan.section}\nBank: ${challan.bankName}\nStatus: ${challan.status}\n\nThis challan covers TDS deposits made for the specified section and period.`);
  };

  const handleDownloadChallan = (challan: any) => {
    alert(`Download Challan Receipt\n\nChallan: ${challan.challanNumber}\n\nThis will download:\n- Original bank challan copy\n- BSR code details\n- Challan date and amount\n- Section-wise breakup\n\nFormat: PDF\n\nRequired for TDS return filing and deductee certificates.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Loading TDS transactions…</div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{loadError}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">TDS Management</h1>
            <p className="text-gray-400">Manage TDS deductions and returns</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewTDSEntry}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New TDS Entry
            </button>
            <button
              onClick={handleDownloadForm16A}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download Form 16A'}
            </button>
            <button
              onClick={handleExportTDS}
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalTDSDeducted)}</div>
            <div className="text-purple-100 text-sm">Total TDS Deducted</div>
            <div className="mt-2 text-xs text-purple-100">For {quarterFilter}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalDeposited)}</div>
            <div className="text-green-100 text-sm">TDS Deposited</div>
            <div className="mt-2 text-xs text-green-100">
              {((totalDeposited / totalTDSDeducted) * 100).toFixed(0)}% of total
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(pendingDeposit)}</div>
            <div className="text-orange-100 text-sm">Pending Deposit</div>
            <div className="mt-2 text-xs text-orange-100">To be paid</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{deducteeCount}</div>
            <div className="text-blue-100 text-sm">Deductees</div>
            <div className="mt-2 text-xs text-blue-100">Unique PANs</div>
          </div>
        </div>

        {/* TDS Section Configuration (tax masters, taxType=TDS) */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">TDS Section Configuration</h2>
            </div>
            <button
              onClick={handleNewTDSEntry}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
          {configError && (
            <div className="px-6 py-2 text-sm text-red-300 bg-red-500/10 border-b border-red-400/30">{configError}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Section</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Description</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Rate (%)</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Threshold</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Active</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configLoading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-400">Loading configuration…</td>
                  </tr>
                ) : sectionConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-400">No TDS sections configured yet.</td>
                  </tr>
                ) : (
                  sectionConfigs.map((cfg) => (
                    <tr key={cfg.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">{getSectionBadge(cfg.sectionCode)}</td>
                      <td className="px-3 py-2 text-white text-sm">{cfg.description}</td>
                      <td className="px-3 py-2 text-right text-white text-sm">{cfg.rate}</td>
                      <td className="px-3 py-2 text-right text-white text-sm">{formatCurrency(cfg.threshold)}</td>
                      <td className="px-3 py-2 text-center">
                        {cfg.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Active
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
                            onClick={() => handleEditConfig(cfg)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit section"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(cfg)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-3 py-2 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                TDS Transactions ({filteredTransactions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex-1 px-3 py-2 font-medium transition-colors ${
                activeTab === 'returns'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                TDS Returns ({tdsReturns.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('challans')}
              className={`flex-1 px-3 py-2 font-medium transition-colors ${
                activeTab === 'challans'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Challans ({challans.length})
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
                        placeholder="Search by payment ref, deductee, or PAN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Sections</option>
                      <option value="192">192 - Salaries</option>
                      <option value="194C">194C - Contractors</option>
                      <option value="194J">194J - Professional Services</option>
                      <option value="194I">194I - Rent</option>
                      <option value="194H">194H - Commission</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <select
                      value={quarterFilter}
                      onChange={(e) => setQuarterFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Q4-2024-25">Q4 FY 2024-25</option>
                      <option value="Q3-2024-25">Q3 FY 2024-25</option>
                      <option value="Q2-2024-25">Q2 FY 2024-25</option>
                      <option value="Q1-2024-25">Q1 FY 2024-25</option>
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
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Payment Ref</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Deductee</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Section</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Gross Amount</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">TDS Amount</th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Net Payment</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Challan</th>
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
                          <div className="font-medium text-white text-sm">{txn.paymentRef}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-white text-sm">{txn.deductee}</div>
                          <div className="text-xs text-gray-400 font-mono">{txn.pan}</div>
                        </td>
                        <td className="px-3 py-2">
                          {getSectionBadge(txn.section)}
                          <div className="text-xs text-gray-400 mt-1">{txn.tdsRate}%</div>
                        </td>
                        <td className="px-3 py-2 text-right text-white font-medium">
                          {formatCurrency(txn.grossAmount)}
                        </td>
                        <td className="px-3 py-2 text-right text-purple-400 font-medium">
                          {formatCurrency(txn.tdsAmount)}
                        </td>
                        <td className="px-3 py-2 text-right text-white font-medium">
                          {formatCurrency(txn.netPayment)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {txn.challanNumber ? (
                            <div>
                              <div className="text-white text-xs font-mono">{txn.challanNumber}</div>
                              <div className="text-xs text-gray-400">{txn.challanDate}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">Not deposited</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {txn.deposited ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Deposited
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
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
                            <button
                              onClick={() => handleDownloadTransactionCertificate(txn)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Download Form 16A certificate"
                            >
                              <Download className="w-4 h-4 text-green-400" />
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
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Form Type</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Quarter</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Due Date</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Total Deductions</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Total Deposited</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Deductees</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tdsReturns.map((ret) => (
                    <tr key={ret.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="font-medium text-white">{ret.formType}</div>
                        {ret.acknowledgementNumber && (
                          <div className="text-xs text-gray-400 font-mono mt-1">ACK: {ret.acknowledgementNumber}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-white text-sm">{ret.quarter}</td>
                      <td className="px-3 py-2">
                        <div className="text-white text-sm">{new Date(ret.dueDate).toLocaleDateString()}</div>
                        {ret.filedDate && (
                          <div className="text-xs text-green-400 mt-1">
                            Filed: {new Date(ret.filedDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-purple-400 font-medium">
                        {formatCurrency(ret.totalDeductions)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-400 font-medium">
                        {formatCurrency(ret.totalDeposited)}
                      </td>
                      <td className="px-3 py-2 text-center text-white font-medium">
                        {ret.deducteeCount}
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
                              title="File return to TRACES portal"
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

          {/* Challans Tab */}
          {activeTab === 'challans' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Challan Number</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Section</th>
                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Bank</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((challan) => (
                    <tr key={challan.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 py-2 text-white font-mono text-sm">{challan.challanNumber}</td>
                      <td className="px-3 py-2 text-white text-sm">
                        {new Date(challan.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-white text-sm">{challan.section}</td>
                      <td className="px-3 py-2 text-right text-purple-400 font-medium">
                        {formatCurrency(challan.amount)}
                      </td>
                      <td className="px-3 py-2 text-white text-sm">{challan.bankName}</td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(challan.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewChallan(challan)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View challan details"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDownloadChallan(challan)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download challan receipt"
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

      {/* Add / Edit TDS Section Configuration modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit TDS Section' : 'Add TDS Section'}
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmitConfig} className="p-5 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{formError}</div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Section Code *</label>
                <input
                  type="text"
                  value={configForm.sectionCode}
                  onChange={(e) => setConfigForm({ ...configForm, sectionCode: e.target.value })}
                  placeholder="e.g. 194C, 194J, 194I, 192"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={configForm.description}
                  onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                  placeholder="e.g. Payment to contractors"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={configForm.rate}
                    onChange={(e) => setConfigForm({ ...configForm, rate: e.target.value })}
                    placeholder="e.g. 2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Threshold</label>
                  <input
                    type="number"
                    step="1"
                    value={configForm.threshold}
                    onChange={(e) => setConfigForm({ ...configForm, threshold: e.target.value })}
                    placeholder="e.g. 30000"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={configForm.isActive}
                  onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving…' : editingId ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
