'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Globe,
  Shield,
  CheckCircle,
  Wallet,
  TrendingUp,
  Lock,
  Calculator,
  BarChart3,
  FileText,
  AlertCircle
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

// Import all Finance advanced components
import GeneralLedgerAdvanced from '@/components/finance/GeneralLedgerAdvanced';
import MultiEntityConsolidation from '@/components/finance/MultiEntityConsolidation';
import AuditTrailAdvanced from '@/components/finance/AuditTrailAdvanced';
import ComplianceAutomation from '@/components/finance/ComplianceAutomation';
import TreasuryManagement from '@/components/finance/TreasuryManagement';
import PredictiveCashForecasting from '@/components/finance/PredictiveCashForecasting';

// Import types
import type {
  GeneralLedgerData,
  MultiEntityConsolidationData,
  AuditTrailData,
  ComplianceAutomationData,
  TreasuryManagementData,
  PredictiveCashForecastingData
} from '@/components/finance';

export default function FinanceAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<
    'general-ledger' | 'consolidation' | 'audit-trail' | 'compliance' | 'treasury' | 'cash-forecast' | 'controls'
  >('general-ledger');

  const [featureToggles, setFeatureToggles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await FinanceService.getAdvancedFeatures();
        if (cancelled) return;
        setFeatureToggles(Array.isArray(raw) ? raw : []);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load advanced features');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock data for General Ledger
  const mockGeneralLedgerData: any = {
    accounts: [
      { id: '1', code: '1000', name: 'Cash', type: 'asset' as const, subtype: 'Current Asset', currency: 'INR', isActive: true, balance: 5000000, openingBalance: 4500000, fiscalYearStart: '2025-04-01' },
      { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset' as const, subtype: 'Current Asset', currency: 'INR', isActive: true, balance: 3500000, openingBalance: 3200000, fiscalYearStart: '2025-04-01' },
      { id: '3', code: '2000', name: 'Accounts Payable', type: 'liability' as const, subtype: 'Current Liability', currency: 'INR', isActive: true, balance: 2100000, openingBalance: 2300000, fiscalYearStart: '2025-04-01' },
      { id: '4', code: '4000', name: 'Revenue', type: 'revenue' as const, subtype: 'Operating Revenue', currency: 'INR', isActive: true, balance: 15000000, openingBalance: 0, fiscalYearStart: '2025-04-01' },
      { id: '5', code: '5000', name: 'Operating Expenses', type: 'expense' as const, subtype: 'Operating Expense', currency: 'INR', isActive: true, balance: 8500000, openingBalance: 0, fiscalYearStart: '2025-04-01' }
    ],
    journalEntries: [
      {
        id: 'JE001',
        entryNumber: 'JE-2025-001',
        date: '2025-01-15',
        entryType: 'standard' as const,
        status: 'posted' as const,
        description: 'Monthly depreciation expense',
        lines: [
          { id: 'L1', accountCode: '5000', accountName: 'Depreciation Expense', debit: 50000, credit: 0, description: 'Equipment depreciation' },
          { id: 'L2', accountCode: '1500', accountName: 'Accumulated Depreciation', debit: 0, credit: 50000, description: 'Equipment depreciation' }
        ],
        totalDebit: 50000,
        totalCredit: 50000,
        createdBy: 'john.doe@company.com',
        createdAt: '2025-01-15T10:00:00Z',
        postedBy: 'jane.smith@company.com',
        postedAt: '2025-01-15T14:00:00Z',
        period: 'January 2025',
        fiscalYear: 'FY 2025'
      },
      {
        id: 'JE002',
        entryNumber: 'JE-2025-002',
        date: '2025-01-20',
        entryType: 'adjusting' as const,
        status: 'posted' as const,
        description: 'Accrued interest on loan',
        lines: [
          { id: 'L3', accountCode: '5100', accountName: 'Interest Expense', debit: 25000, credit: 0, description: 'Interest accrual' },
          { id: 'L4', accountCode: '2500', accountName: 'Interest Payable', debit: 0, credit: 25000, description: 'Interest accrual' }
        ],
        totalDebit: 25000,
        totalCredit: 25000,
        createdBy: 'mike.chen@company.com',
        createdAt: '2025-01-20T11:00:00Z',
        postedBy: 'sarah.johnson@company.com',
        postedAt: '2025-01-20T15:00:00Z',
        period: 'January 2025',
        fiscalYear: 'FY 2025'
      }
    ],
    trialBalance: [
      { accountCode: '1000', accountName: 'Cash', accountType: 'asset' as const, debit: 5000000, credit: 0, balance: 5000000 },
      { accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'asset' as const, debit: 3500000, credit: 0, balance: 3500000 },
      { accountCode: '2000', accountName: 'Accounts Payable', accountType: 'liability' as const, debit: 0, credit: 2100000, balance: -2100000 },
      { accountCode: '4000', accountName: 'Revenue', accountType: 'revenue' as const, debit: 0, credit: 15000000, balance: -15000000 },
      { accountCode: '5000', accountName: 'Operating Expenses', accountType: 'expense' as const, debit: 8500000, credit: 0, balance: 8500000 }
    ],
    period: 'January 2025',
    fiscalYear: 'FY 2025'
  };

  // Mock data for Multi-Entity Consolidation
  const mockConsolidationData: any = {
    entities: [
      { id: '1', name: 'Parent Company Inc', code: 'PARENT', country: 'India', currency: 'INR', ownershipPercentage: 100, consolidationMethod: 'full' as const, isActive: true },
      { id: '2', name: 'Subsidiary A Ltd', code: 'SUB-A', country: 'India', currency: 'INR', ownershipPercentage: 100, consolidationMethod: 'full' as const, isActive: true },
      { id: '3', name: 'Subsidiary B Corp', code: 'SUB-B', country: 'USA', currency: 'USD', ownershipPercentage: 75, consolidationMethod: 'proportional' as const, isActive: true },
      { id: '4', name: 'Associate C Ltd', code: 'ASSOC-C', country: 'UK', currency: 'GBP', ownershipPercentage: 30, consolidationMethod: 'equity' as const, isActive: true }
    ],
    statements: [
      { entityId: '1', revenue: 500000000, expenses: 350000000, grossProfit: 150000000, operatingIncome: 100000000, netIncome: 80000000, assets: 1000000000, liabilities: 400000000, equity: 600000000, cashFlow: 90000000 },
      { entityId: '2', revenue: 300000000, expenses: 210000000, grossProfit: 90000000, operatingIncome: 60000000, netIncome: 48000000, assets: 600000000, liabilities: 240000000, equity: 360000000, cashFlow: 54000000 },
      { entityId: '3', revenue: 200000000, expenses: 140000000, grossProfit: 60000000, operatingIncome: 40000000, netIncome: 32000000, assets: 400000000, liabilities: 160000000, equity: 240000000, cashFlow: 36000000 },
      { entityId: '4', revenue: 150000000, expenses: 105000000, grossProfit: 45000000, operatingIncome: 30000000, netIncome: 24000000, assets: 300000000, liabilities: 120000000, equity: 180000000, cashFlow: 27000000 }
    ],
    intercompanyTransactions: [
      { id: 'IC001', fromEntity: 'Parent Company Inc', toEntity: 'Subsidiary A Ltd', type: 'sale' as const, amount: 50000000, currency: 'INR', date: '2025-01-15', description: 'Intercompany goods sale', eliminated: true },
      { id: 'IC002', fromEntity: 'Subsidiary A Ltd', toEntity: 'Subsidiary B Corp', type: 'loan' as const, amount: 20000000, currency: 'INR', date: '2025-01-20', description: 'Intercompany loan', eliminated: true },
      { id: 'IC003', fromEntity: 'Parent Company Inc', toEntity: 'Associate C Ltd', type: 'dividend' as const, amount: 10000000, currency: 'INR', date: '2025-01-25', description: 'Dividend payment', eliminated: false }
    ],
    adjustments: [
      { id: 'ADJ001', type: 'elimination' as const, description: 'Eliminate intercompany sales', amount: 50000000, affectedEntities: ['Parent Company Inc', 'Subsidiary A Ltd'], status: 'posted' as const },
      { id: 'ADJ002', type: 'currency' as const, description: 'Currency translation adjustment', amount: 5000000, affectedEntities: ['Subsidiary B Corp'], status: 'posted' as const }
    ],
    consolidatedResult: {
      revenue: 1100000000,
      expenses: 770000000,
      grossProfit: 330000000,
      operatingIncome: 220000000,
      netIncome: 176000000,
      assets: 2200000000,
      liabilities: 880000000,
      equity: 1320000000,
      minorityInterest: 60000000,
      eliminations: { revenue: 50000000, expenses: 35000000, assets: 70000000, liabilities: 70000000 }
    },
    period: 'January 2025',
    currency: 'INR'
  };

  // Mock data for Audit Trail
  const mockAuditData: any = {
    logs: [
      { id: 'AUD001', timestamp: '2025-01-24T14:30:00Z', userId: 'U001', userName: 'John Doe', userEmail: 'john.doe@company.com', userRole: 'Finance Manager', action: 'create' as const, module: 'journal_entry' as const, recordId: 'JE-2025-001', recordType: 'Journal Entry', description: 'Created new journal entry for depreciation', changes: [{ field: 'amount', oldValue: null, newValue: 50000, dataType: 'number' as const }], ipAddress: '192.168.1.100', device: 'Windows Desktop', sessionId: 'sess123', severity: 'info' as const, success: true },
      { id: 'AUD002', timestamp: '2025-01-24T15:00:00Z', userId: 'U002', userName: 'Jane Smith', userEmail: 'jane.smith@company.com', userRole: 'Controller', action: 'approve' as const, module: 'journal_entry' as const, recordId: 'JE-2025-001', recordType: 'Journal Entry', description: 'Approved journal entry JE-2025-001', changes: [{ field: 'status', oldValue: 'draft', newValue: 'approved', dataType: 'string' as const }], ipAddress: '192.168.1.101', device: 'MacBook Pro', sessionId: 'sess124', severity: 'info' as const, success: true }
    ],
    stats: { totalLogs: 234, todayLogs: 12, uniqueUsers: 8, failedActions: 2, criticalEvents: 0, byAction: {} as any, byModule: {} as any },
    dateRange: { start: '2025-01-01', end: '2025-01-24' }
  };

  // Mock data for Compliance
  const mockComplianceData: any = {
    rules: [
      { id: 'RULE001', code: 'SOX-404', name: 'Internal Controls Assessment', description: 'Quarterly assessment of internal controls effectiveness', type: 'regulatory' as const, frequency: 'quarterly' as const, authority: 'SEC', applicableRegions: ['USA'], isActive: true, automationEnabled: true, nextDue: '2025-03-31' },
      { id: 'RULE002', code: 'TAX-GST', name: 'GST Compliance Check', description: 'Monthly GST return filing verification', type: 'tax' as const, frequency: 'monthly' as const, authority: 'CBIC', applicableRegions: ['India'], isActive: true, automationEnabled: true, nextDue: '2025-02-10' }
    ],
    checks: [
      { id: 'CHK001', ruleId: 'RULE001', ruleName: 'Internal Controls Assessment', executedAt: '2025-01-15T10:00:00Z', executedBy: 'Compliance Team', status: 'compliant' as const, score: 92, findings: [], evidence: [], dueDate: '2025-01-31', completedDate: '2025-01-15' }
    ],
    reports: [
      { id: 'RPT001', period: 'Q4 2024', type: 'regulatory' as const, generatedAt: '2025-01-10T09:00:00Z', overallScore: 95, totalRules: 10, compliantRules: 9, nonCompliantRules: 1, pendingRules: 0 }
    ],
    stats: { overallScore: 94, totalRules: 12, compliantCount: 10, nonCompliantCount: 1, pendingCount: 1, overdueCount: 0, checksThisMonth: 24, automatedChecks: 18 }
  };

  // Mock data for Treasury
  const mockTreasuryData: any = {
    bankAccounts: [
      { id: 'BA001', bankName: 'HDFC Bank', accountNumber: '****1234', accountType: 'checking' as const, currency: 'INR', balance: 12500000, availableBalance: 12000000, interestRate: 3.5, lastUpdated: '2025-01-24T14:00:00Z' },
      { id: 'BA002', bankName: 'ICICI Bank', accountNumber: '****5678', accountType: 'savings' as const, currency: 'INR', balance: 8500000, availableBalance: 8500000, interestRate: 4.0, lastUpdated: '2025-01-24T14:00:00Z' }
    ],
    investments: [
      { id: 'INV001', name: 'Government Bonds 2030', type: 'bond' as const, principal: 10000000, currentValue: 10500000, returnRate: 6.5, maturityDate: '2030-12-31', riskLevel: 'low' as const },
      { id: 'INV002', name: 'Equity Mutual Fund', type: 'mutual_fund' as const, principal: 5000000, currentValue: 5750000, returnRate: 12.5, riskLevel: 'medium' as const }
    ],
    liabilities: [
      { id: 'LIAB001', name: 'Term Loan - Equipment', type: 'loan' as const, principal: 20000000, outstandingBalance: 15000000, interestRate: 8.5, monthlyPayment: 250000, maturityDate: '2028-12-31', lender: 'State Bank of India' }
    ],
    cashPosition: { totalCash: 37000000, bankBalances: 21000000, investmentValue: 16250000, totalLiabilities: 15000000, netPosition: 22000000, liquidityRatio: 2.47 },
    currency: 'INR'
  };

  // Mock data for Cash Forecasting
  const mockForecastData: any = {
    forecast: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2025, 0, i + 1).toISOString(),
      expectedInflows: 500000 + Math.random() * 200000,
      expectedOutflows: 400000 + Math.random() * 150000,
      netCashFlow: 100000 + Math.random() * 50000,
      projectedBalance: 12000000 + (i * 100000),
      confidence: 85 + Math.random() * 10
    })),
    drivers: [
      { id: 'D001', name: 'Customer Payments', category: 'inflow' as const, historicalAverage: 8500000, projected: 9200000, variance: 8.2, impact: 'high' as const },
      { id: 'D002', name: 'Supplier Payments', category: 'outflow' as const, historicalAverage: 6500000, projected: 6800000, variance: 4.6, impact: 'high' as const }
    ],
    scenarios: [
      { id: 'S001', name: 'Best Case', description: 'All receivables collected on time', type: 'best' as const, endingBalance: 15000000, probability: 25 },
      { id: 'S002', name: 'Base Case', description: 'Expected scenario based on historical trends', type: 'base' as const, endingBalance: 13000000, probability: 50 },
      { id: 'S003', name: 'Worst Case', description: '20% delay in receivables collection', type: 'worst' as const, endingBalance: 11000000, probability: 25 }
    ],
    currentBalance: 12000000,
    horizon: 'monthly' as const
  };

  const allFeatures = [
    { id: 'general-ledger', name: 'General Ledger & Journals', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'consolidation', name: 'Multi-Entity Consolidation', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'audit-trail', name: 'Advanced Audit Trail', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'compliance', name: 'Compliance Automation', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'treasury', name: 'Treasury Management', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'cash-forecast', name: 'Predictive Cash Forecasting', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'controls', name: 'Financial Controls', icon: Lock, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  // When backend feature toggles are present, only show the features enabled there;
  // otherwise show all features unchanged.
  const features = featureToggles.length
    ? allFeatures.filter((feature) =>
        featureToggles.some(
          (t: any) => t.featureKey === feature.id && t.isEnabled !== false,
        ),
      )
    : allFeatures;

  const getFeatureDescription = (id: string) => {
    const descriptions = {
      'general-ledger': 'Real-time general ledger with journal entries, trial balance, and chart of accounts. Full double-entry bookkeeping with automated posting.',
      'consolidation': 'Multi-entity consolidation with intercompany elimination, currency translation, and minority interest calculation.',
      'audit-trail': 'Comprehensive audit logging with field-level change tracking, user activity monitoring, and tamper-proof records.',
      'compliance': 'Automated compliance monitoring with rule-based checks, regulatory reporting, and evidence management.',
      'treasury': 'Cash, investment, and liability management with real-time balances and position analysis.',
      'cash-forecast': 'AI-powered cash flow forecasting with scenario modeling, driver analysis, and confidence intervals.',
      'controls': 'Internal controls framework with segregation of duties, approval workflows, and violation tracking.'
    };
    return descriptions[id as keyof typeof descriptions];
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="h-full flex flex-col px-2 py-2">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Finance Advanced Features</h1>
          <p className="text-sm text-gray-600">
            Enterprise-grade financial management tools for comprehensive accounting, compliance, and treasury operations
          </p>
          {isLoading && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
              Loading…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {loadError}
            </div>
          )}
        </div>

        {/* Feature Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-3 overflow-hidden flex-shrink-0">
          <div className="border-b border-gray-200 p-2 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === feature.id
                        ? `${feature.bg} ${feature.color} shadow-md`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {feature.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Description */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${features.find((f) => f.id === activeTab)?.bg}`}>
                {React.createElement(features.find((f) => f.id === activeTab)?.icon || Calculator, {
                  className: `w-6 h-6 ${features.find((f) => f.id === activeTab)?.color}`
                })}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {features.find((f) => f.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-gray-600">{getFeatureDescription(activeTab)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex-1 overflow-auto">
          {activeTab === 'general-ledger' && <GeneralLedgerAdvanced data={mockGeneralLedgerData} editable={true} />}
          {activeTab === 'consolidation' && <MultiEntityConsolidation data={mockConsolidationData} editable={true} />}
          {activeTab === 'audit-trail' && <AuditTrailAdvanced data={mockAuditData} />}
          {activeTab === 'compliance' && <ComplianceAutomation data={mockComplianceData} editable={true} />}
          {activeTab === 'treasury' && <TreasuryManagement data={mockTreasuryData} editable={true} />}
          {activeTab === 'cash-forecast' && <PredictiveCashForecasting data={mockForecastData} />}
          {activeTab === 'controls' && (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-red-600 mb-2" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Controls Module</h3>
              <p className="text-gray-600">
                Access the complete Financial Controls module at{' '}
                <a href="/finance/controls" className="text-blue-600 hover:underline">
                  /finance/controls
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
