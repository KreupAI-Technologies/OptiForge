'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Landmark, FileText, CheckCircleIcon, XCircleIcon,
  ArrowRightLeft, Search, FileDown,
  FileUp, CalendarIcon, DollarSign, ClockIcon,
  AlertTriangle, RefreshCw, PlusIcon, PencilIcon,
  EyeIcon, SlidersHorizontal, BarChart3, Info
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import { BankReconciliationView } from '@/app/(modules)/finance/bank-reconciliation/BankReconciliationView';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
  glAccountId: string;
  glAccountName: string;
  currentBalance: number;
  availableBalance: number;
  lastReconciled: string;
  lastReconciledBalance: number;
  lastStatementDate: string;
  lastStatementBalance: number;
  isActive: boolean;
  reconciliationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  autoReconcile: boolean;
  matchingThreshold: number; // Percentage for auto-matching
  createdDate: string;
  lastModified: string;
}

interface BankStatement {
  id: string;
  bankAccountId: string;
  statementDate: string;
  statementNumber: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  transactions: BankTransaction[];
  uploadDate: string;
  uploadedBy: string;
  fileName: string;
  fileSize: string;
  status: 'pending' | 'processing' | 'reconciled' | 'partial' | 'error';
  reconciledItems: number;
  unmatchedItems: number;
  manualMatches: number;
  autoMatches: number;
}

interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  reference: string;
  transactionType: 'deposit' | 'withdrawal' | 'fee' | 'interest' | 'transfer';
  amount: number;
  balance: number;
  status: 'unmatched' | 'matched' | 'partial' | 'excluded' | 'disputed';
  matchedTransactions: MatchedTransaction[];
  matchConfidence?: number;
  matchMethod?: 'auto' | 'manual' | 'rule' | 'suggested';
  category?: string;
  notes?: string;
}

interface GLTransaction {
  id: string;
  glAccountId: string;
  transactionDate: string;
  postingDate: string;
  description: string;
  reference: string;
  journalEntryId: string;
  debitAmount: number;
  creditAmount: number;
  netAmount: number;
  status: 'posted' | 'pending' | 'draft';
  isReconciled: boolean;
  reconciledDate?: string;
  reconciledBy?: string;
  source: string;
  documentType: string;
  documentNumber: string;
}

interface MatchedTransaction {
  bankTransactionId: string;
  glTransactionId: string;
  matchDate: string;
  matchedBy: string;
  matchType: 'exact' | 'partial' | 'manual' | 'rule';
  matchConfidence: number;
  matchedAmount: number;
  variance: number;
  notes?: string;
}

interface ReconciliationSession {
  id: string;
  bankAccountId: string;
  statementId: string;
  sessionDate: string;
  reconcilerName: string;
  reconcilerEmail: string;
  status: 'in_progress' | 'completed' | 'abandoned' | 'approved';
  startTime: string;
  endTime?: string;
  openingBankBalance: number;
  closingBankBalance: number;
  openingGLBalance: number;
  closingGLBalance: number;
  totalMatched: number;
  totalUnmatched: number;
  adjustmentEntries: AdjustmentEntry[];
  comments?: string;
  approvedBy?: string;
  approvalDate?: string;
}

interface AdjustmentEntry {
  id: string;
  type: 'bank_fee' | 'interest' | 'correction' | 'write_off' | 'other';
  description: string;
  amount: number;
  glAccountId: string;
  journalEntryId?: string;
  createdBy: string;
  createdDate: string;
  approved: boolean;
}

interface MatchingRule {
  id: string;
  name: string;
  description: string;
  bankAccountId?: string;
  isActive: boolean;
  priority: number;
  conditions: MatchingCondition[];
  actions: MatchingAction[];
  createdDate: string;
  lastUsed?: string;
  matchCount: number;
}

interface MatchingCondition {
  id: string;
  field: 'description' | 'amount' | 'reference' | 'date';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'between';
  value: string | number | [number, number];
  tolerance?: number;
}

interface MatchingAction {
  id: string;
  type: 'match' | 'categorize' | 'exclude' | 'flag';
  parameters: Record<string, any>;
}

const BankReconciliation: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'reconcile' | 'statements' | 'rules' | 'history'>('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reconciliationMode, setReconciliationMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await FinanceService.getChartOfAccounts({ type: 'ASSET' as any });
      // Filter for bank accounts
      const bankAccounts = data.filter((a: any) => a.isBankAccount);
      // Map to the local BankAccount interface
      const mappedAccounts: BankAccount[] = bankAccounts.map((a: any) => ({
        id: a.id,
        accountNumber: a.code,
        accountName: a.name,
        bankName: a.description || 'Bank',
        accountType: 'checking',
        currency: a.currency,
        glAccountId: a.id,
        glAccountName: a.name,
        currentBalance: a.balance,
        availableBalance: a.balance,
        lastReconciled: a.updatedAt,
        lastReconciledBalance: a.balance,
        lastStatementDate: a.updatedAt,
        lastStatementBalance: a.balance,
        isActive: a.status === 'ACTIVE',
        reconciliationFrequency: 'monthly',
        autoReconcile: true,
        matchingThreshold: 90,
        createdDate: a.createdAt,
        lastModified: a.updatedAt
      }));
      setAccounts(mappedAccounts);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load bank accounts');
      toast({ title: 'Error', description: 'Failed to load bank accounts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      accountNumber: '****1234',
      accountName: 'Operating Account',
      bankName: 'Chase Bank',
      accountType: 'checking',
      currency: 'USD',
      glAccountId: '1000',
      glAccountName: 'Cash and Cash Equivalents',
      currentBalance: 250000,
      availableBalance: 245000,
      lastReconciled: '2024-01-15T00:00:00Z',
      lastReconciledBalance: 248000,
      lastStatementDate: '2024-01-31T00:00:00Z',
      lastStatementBalance: 250000,
      isActive: true,
      reconciliationFrequency: 'monthly',
      autoReconcile: true,
      matchingThreshold: 95,
      createdDate: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      accountNumber: '****5678',
      accountName: 'Payroll Account',
      bankName: 'Bank of America',
      accountType: 'checking',
      currency: 'USD',
      glAccountId: '1001',
      glAccountName: 'Payroll Cash',
      currentBalance: 150000,
      availableBalance: 150000,
      lastReconciled: '2024-01-15T00:00:00Z',
      lastReconciledBalance: 145000,
      lastStatementDate: '2024-01-31T00:00:00Z',
      lastStatementBalance: 150000,
      isActive: true,
      reconciliationFrequency: 'monthly',
      autoReconcile: false,
      matchingThreshold: 90,
      createdDate: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-15T10:30:00Z'
    }
  ]);

  const [bankTransactions] = useState<BankTransaction[]>([
    {
      id: '1',
      bankAccountId: '1',
      transactionDate: '2024-01-18T00:00:00Z',
      valueDate: '2024-01-18T00:00:00Z',
      description: 'Customer Payment - Invoice INV-2024-001',
      reference: 'DEP-001',
      transactionType: 'deposit',
      amount: 15000,
      balance: 265000,
      status: 'matched',
      matchedTransactions: [],
      matchConfidence: 98,
      matchMethod: 'auto'
    },
    {
      id: '2',
      bankAccountId: '1',
      transactionDate: '2024-01-17T00:00:00Z',
      valueDate: '2024-01-17T00:00:00Z',
      description: 'Supplier Payment - ABC Corporation',
      reference: 'CHK-1001',
      transactionType: 'withdrawal',
      amount: -8500,
      balance: 250000,
      status: 'matched',
      matchedTransactions: [],
      matchConfidence: 95,
      matchMethod: 'auto'
    },
    {
      id: '3',
      bankAccountId: '1',
      transactionDate: '2024-01-16T00:00:00Z',
      valueDate: '2024-01-16T00:00:00Z',
      description: 'Bank Service Charge',
      reference: 'FEE-001',
      transactionType: 'fee',
      amount: -50,
      balance: 258500,
      status: 'unmatched',
      matchedTransactions: []
    },
    {
      id: '4',
      bankAccountId: '1',
      transactionDate: '2024-01-15T00:00:00Z',
      valueDate: '2024-01-15T00:00:00Z',
      description: 'Wire Transfer - International',
      reference: 'WIRE-001',
      transactionType: 'deposit',
      amount: 25000,
      balance: 258550,
      status: 'partial',
      matchedTransactions: [],
      matchConfidence: 75,
      matchMethod: 'suggested'
    }
  ]);

  const [glTransactions] = useState<GLTransaction[]>([
    {
      id: '1',
      glAccountId: '1000',
      transactionDate: '2024-01-18T00:00:00Z',
      postingDate: '2024-01-18T00:00:00Z',
      description: 'Customer Receipt - INV-2024-001',
      reference: 'RCT-001',
      journalEntryId: 'JE-2024-001',
      debitAmount: 15000,
      creditAmount: 0,
      netAmount: 15000,
      status: 'posted',
      isReconciled: true,
      reconciledDate: '2024-01-18T14:00:00Z',
      reconciledBy: 'John Smith',
      source: 'AR',
      documentType: 'Receipt',
      documentNumber: 'RCT-001'
    },
    {
      id: '2',
      glAccountId: '1000',
      transactionDate: '2024-01-17T00:00:00Z',
      postingDate: '2024-01-17T00:00:00Z',
      description: 'Payment to ABC Corporation',
      reference: 'PAY-001',
      journalEntryId: 'JE-2024-002',
      debitAmount: 0,
      creditAmount: 8500,
      netAmount: -8500,
      status: 'posted',
      isReconciled: true,
      reconciledDate: '2024-01-18T14:00:00Z',
      reconciledBy: 'John Smith',
      source: 'AP',
      documentType: 'Payment',
      documentNumber: 'PAY-001'
    },
    {
      id: '3',
      glAccountId: '1000',
      transactionDate: '2024-01-15T00:00:00Z',
      postingDate: '2024-01-15T00:00:00Z',
      description: 'Wire Transfer Receipt',
      reference: 'DEP-002',
      journalEntryId: 'JE-2024-003',
      debitAmount: 25000,
      creditAmount: 0,
      netAmount: 25000,
      status: 'posted',
      isReconciled: false,
      source: 'GL',
      documentType: 'Deposit',
      documentNumber: 'DEP-002'
    }
  ]);

  const [reconciliationSessions] = useState<ReconciliationSession[]>([
    {
      id: '1',
      bankAccountId: '1',
      statementId: '1',
      sessionDate: '2024-01-15T00:00:00Z',
      reconcilerName: 'John Smith',
      reconcilerEmail: 'john.smith@company.com',
      status: 'completed',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:30:00Z',
      openingBankBalance: 225000,
      closingBankBalance: 248000,
      openingGLBalance: 224950,
      closingGLBalance: 248000,
      totalMatched: 45,
      totalUnmatched: 2,
      adjustmentEntries: [
        {
          id: '1',
          type: 'bank_fee',
          description: 'Monthly service charge',
          amount: -50,
          glAccountId: '6100',
          journalEntryId: 'JE-2024-100',
          createdBy: 'John Smith',
          createdDate: '2024-01-15T10:00:00Z',
          approved: true
        }
      ],
      comments: 'Reconciliation completed successfully',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-01-15T11:00:00Z'
    }
  ]);

  const [matchingRules] = useState<MatchingRule[]>([
    {
      id: '1',
      name: 'Customer Payment Matching',
      description: 'Auto-match customer payments based on invoice number',
      isActive: true,
      priority: 1,
      conditions: [
        {
          id: '1',
          field: 'description',
          operator: 'contains',
          value: 'INV-'
        },
        {
          id: '2',
          field: 'amount',
          operator: 'equals',
          value: 0,
          tolerance: 0.01
        }
      ],
      actions: [
        {
          id: '1',
          type: 'match',
          parameters: { confidence: 95 }
        },
        {
          id: '2',
          type: 'categorize',
          parameters: { category: 'Customer Payment' }
        }
      ],
      createdDate: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-18T14:00:00Z',
      matchCount: 152
    },
    {
      id: '2',
      name: 'Bank Fee Recognition',
      description: 'Auto-identify and categorize bank fees',
      isActive: true,
      priority: 2,
      conditions: [
        {
          id: '1',
          field: 'description',
          operator: 'contains',
          value: 'Service Charge'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'categorize',
          parameters: { category: 'Bank Fees' }
        },
        {
          id: '2',
          type: 'flag',
          parameters: { flag: 'requires_adjustment' }
        }
      ],
      createdDate: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-16T09:00:00Z',
      matchCount: 24
    }
  ]);

  // Chart data
  const reconciliationStatusData = [
    { name: 'Matched', value: 85, color: '#10B981' },
    { name: 'Unmatched', value: 10, color: '#EF4444' },
    { name: 'Partial', value: 5, color: '#F59E0B' }
  ];

  const monthlyReconciliationTrend = [
    { month: 'Jan', matched: 120, unmatched: 5, adjustments: 3 },
    { month: 'Feb', matched: 135, unmatched: 3, adjustments: 2 },
    { month: 'Mar', matched: 128, unmatched: 7, adjustments: 4 },
    { month: 'Apr', matched: 142, unmatched: 2, adjustments: 1 },
    { month: 'May', matched: 138, unmatched: 4, adjustments: 3 },
    { month: 'Jun', matched: 145, unmatched: 3, adjustments: 2 }
  ];

  const accountBalanceTrend = [
    { date: '01/01', bank: 225000, gl: 224950, variance: 50 },
    { date: '01/08', bank: 235000, gl: 235000, variance: 0 },
    { date: '01/15', bank: 248000, gl: 248000, variance: 0 },
    { date: '01/22', bank: 255000, gl: 254950, variance: 50 },
    { date: '01/31', bank: 250000, gl: 250000, variance: 0 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      matched: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      unmatched: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      excluded: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircleIcon },
      disputed: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
      reconciled: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      abandoned: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getMatchConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;

    const color = confidence >= 90 ? 'text-green-600' :
      confidence >= 75 ? 'text-yellow-600' :
        confidence >= 50 ? 'text-orange-600' : 'text-red-600';

    return (
      <span className={`text-sm font-medium ${color}`}>
        {confidence}% match
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Landmark className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bank Accounts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bankAccounts.filter(a => a.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Match Rate</p>
              <p className="text-2xl font-semibold text-gray-900">85%</p>
              <p className="text-sm text-green-600">+5% this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unmatched Items</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bankTransactions.filter(t => t.status === 'unmatched').length}
              </p>
              <p className="text-sm text-orange-600">Require attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance Comparison Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accountBalanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="bank" stroke="#3B82F6" strokeWidth={2} name="Bank Balance" />
              <Line type="monotone" dataKey="gl" stroke="#10B981" strokeWidth={2} name="GL Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconciliation Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reconciliationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reconciliationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Reconciliation Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyReconciliationTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="matched" fill="#10B981" name="Matched" />
            <Bar dataKey="unmatched" fill="#EF4444" name="Unmatched" />
            <Bar dataKey="adjustments" fill="#F59E0B" name="Adjustments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reconciliation Sessions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {reconciliationSessions.map((session) => {
              const account = bankAccounts.find(a => a.id === session.bankAccountId);
              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{account?.accountName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(session.sessionDate)} • {session.reconcilerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Matched: {session.totalMatched} • Unmatched: {session.totalUnmatched}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(session.closingBankBalance)}
                      </p>
                      <p className="text-xs text-gray-500">Closing Balance</p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
        <button
          onClick={() => setShowAccountModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
                <p className="text-sm text-gray-500">{account.accountNumber}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedAccount(account)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-blue-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Balance:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(account.currentBalance)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Balance:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(account.availableBalance)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Reconciled:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(account.lastReconciled)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GL Account:</span>
                <span className="text-sm text-gray-900">
                  {account.glAccountName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto-Reconcile:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.autoReconcile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {account.autoReconcile ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Match Threshold:</span>
                <span className="text-sm text-gray-900">{account.matchingThreshold}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedAccount(account);
                  setReconciliationMode(true);
                  setActiveTab('reconcile');
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Reconcile
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center"
              >
                <FileUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReconciliation = () => (
    <div className="space-y-3">
      {!reconciliationMode ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900">Select Account to Reconcile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  setSelectedAccount(account);
                  setReconciliationMode(true);
                }}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md text-left"
              >
                <h4 className="font-medium text-gray-900">{account.accountName}</h4>
                <p className="text-sm text-gray-600">{account.bankName}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Last reconciled: {formatDate(account.lastReconciled)}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Reconciling: {selectedAccount?.accountName}</h3>
            <Button variant="outline" onClick={() => setReconciliationMode(false)}>
              Back to Selection
            </Button>
          </div>
          {selectedAccount && <BankReconciliationView bankAccountId={selectedAccount.id} />}
        </div>
      )}
    </div>
  );

  const renderStatements = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bank Statements</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FileUp className="w-5 h-5 mr-2" />
          Upload Statement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statement Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opening Balance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Balance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  id: '1',
                  statementDate: '2024-01-31T00:00:00Z',
                  accountName: 'Operating Account',
                  openingBalance: 225000,
                  closingBalance: 250000,
                  transactionCount: 145,
                  matchedCount: 123,
                  status: 'reconciled'
                },
                {
                  id: '2',
                  statementDate: '2024-01-31T00:00:00Z',
                  accountName: 'Payroll Account',
                  openingBalance: 120000,
                  closingBalance: 150000,
                  transactionCount: 42,
                  matchedCount: 38,
                  status: 'partial'
                }
              ].map((statement) => (
                <tr key={statement.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(statement.statementDate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {statement.accountName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(statement.openingBalance)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(statement.closingBalance)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {statement.matchedCount}/{statement.transactionCount} matched
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(statement.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-blue-600">
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Matching Rules</h3>
        <button
          onClick={() => setShowRuleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {matchingRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-600 hover:text-blue-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className={`${rule.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Conditions:</span>
                <div className="mt-1">
                  {rule.conditions.map((condition, index) => (
                    <div key={condition.id} className="text-sm text-gray-900">
                      • {condition.field} {condition.operator} "{condition.value}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Priority:</span>
                <span className="text-sm text-gray-900">{rule.priority}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Matches:</span>
                <span className="text-sm font-medium text-gray-900">{rule.matchCount}</span>
              </div>

              {rule.lastUsed && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Used:</span>
                  <span className="text-sm text-gray-900">{formatDate(rule.lastUsed)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Test Rule
              </button>
              <button className={`px-3 py-2 rounded text-sm ${rule.isActive
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}>
                {rule.isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Reconciliation History</h3>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reconciler
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched/Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Balance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reconciliationSessions.map((session) => {
                const account = bankAccounts.find(a => a.id === session.bankAccountId);
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(session.sessionDate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account?.accountName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {session.reconcilerName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {session.totalMatched}/{session.totalMatched + session.totalUnmatched}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(session.closingBankBalance)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-blue-600">
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
        <p className="text-gray-600 mt-2">Reconcile bank statements with general ledger using automated matching</p>
      </div>

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load bank accounts from the server: {loadError}.
        </div>
      )}
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading bank accounts…
        </div>
      )}
      {!loading && !loadError && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          {accounts.length} live bank account(s) loaded from finance.
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'accounts', label: 'Accounts', icon: Landmark },
            { key: 'reconcile', label: 'Reconcile', icon: ArrowRightLeft },
            { key: 'statements', label: 'Statements', icon: FileText },
            { key: 'rules', label: 'Matching Rules', icon: SlidersHorizontal },
            { key: 'history', label: 'History', icon: ClockIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'accounts' && renderAccounts()}
      {activeTab === 'reconcile' && renderReconciliation()}
      {activeTab === 'statements' && renderStatements()}
      {activeTab === 'rules' && renderRules()}
      {activeTab === 'history' && renderHistory()}
    </div>
  );
};

export default BankReconciliation;