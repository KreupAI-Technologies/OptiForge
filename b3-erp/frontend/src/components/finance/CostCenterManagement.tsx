'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Treemap
} from 'recharts';
import {
  Building2, DollarSign, BarChart3, SlidersHorizontal,
  PlusIcon, PencilIcon, EyeIcon, TrashIcon, ArrowRightIcon,
  CheckCircleIcon, ClockIcon, AlertTriangle, Info,
  FileText, CalculatorIcon, Filter, ShareIcon,
  Users, Banknote, TrendingUpIcon, TrendingDownIcon
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'product' | 'service' | 'location' | 'other';
  parentId?: string;
  level: number;
  isActive: boolean;
  manager: string;
  managerEmail: string;
  department: string;
  location: string;
  budget: CostCenterBudget;
  actualCosts: CostCenterActual;
  allocations: CostAllocation[];
  responsibilityType: 'cost' | 'profit' | 'investment' | 'revenue';
  createdDate: string;
  lastModified: string;
  tags: string[];
}

interface CostCenterBudget {
  totalBudget: number;
  categories: BudgetCategory[];
  period: string;
  currency: string;
  lastUpdated: string;
}

interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  variance: number;
  variancePercent: number;
}

interface CostCenterActual {
  totalActual: number;
  currentPeriod: number;
  previousPeriod: number;
  yearToDate: number;
  categories: ActualCategory[];
  lastUpdated: string;
}

interface ActualCategory {
  categoryId: string;
  categoryName: string;
  actualAmount: number;
  allocatedAmount: number;
  directAmount: number;
  trend: 'up' | 'down' | 'stable';
}

interface CostAllocation {
  id: string;
  fromCostCenter: string;
  toCostCenter: string;
  amount: number;
  percentage: number;
  allocationMethod: AllocationMethod;
  effectiveDate: string;
  endDate?: string;
  isActive: boolean;
  description: string;
  createdBy: string;
}

interface AllocationMethod {
  id: string;
  name: string;
  type: 'percentage' | 'usage' | 'headcount' | 'revenue' | 'square_feet' | 'units' | 'hours' | 'custom';
  formula: string;
  parameters: AllocationParameter[];
  frequency: 'monthly' | 'quarterly' | 'annually' | 'real-time';
  isActive: boolean;
}

interface AllocationParameter {
  id: string;
  name: string;
  value: number | string;
  type: 'number' | 'percentage' | 'text';
  description: string;
}

interface AllocationRule {
  id: string;
  name: string;
  description: string;
  sourceCostCenter: string;
  targetCostCenters: string[];
  allocationMethod: AllocationMethod;
  conditions: AllocationCondition[];
  priority: number;
  isActive: boolean;
  schedule: AllocationSchedule;
  createdDate: string;
  lastRun?: string;
  nextRun?: string;
}

interface AllocationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

interface AllocationSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'manual';
  dayOfWeek?: string;
  dayOfMonth?: number;
  time?: string;
  isActive: boolean;
}

interface AllocationTransaction {
  id: string;
  allocationRuleId: string;
  ruleName: string;
  executionDate: string;
  fromCostCenter: string;
  toCostCenter: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'executed' | 'failed' | 'reversed';
  journalEntryId?: string;
  errorMessage?: string;
  executedBy: string;
}

interface CostCenterReport {
  id: string;
  name: string;
  type: 'budget_variance' | 'allocation_summary' | 'cost_trend' | 'profitability';
  costCenters: string[];
  period: string;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
}

// Zeroed defaults for sub-objects the backend does not provide (budget/actual/
// allocation data). These keep the CostCenter interface satisfied and the UI
// from crashing, while computing to honest 0 totals in derived values.
const emptyBudget = (): CostCenterBudget => ({
  totalBudget: 0,
  categories: [],
  period: '',
  currency: 'INR',
  lastUpdated: '',
});

const emptyActualCosts = (): CostCenterActual => ({
  totalActual: 0,
  currentPeriod: 0,
  previousPeriod: 0,
  yearToDate: 0,
  categories: [],
  lastUpdated: '',
});

const CostCenterManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cost-centers' | 'allocations' | 'rules' | 'transactions' | 'reports'>('dashboard');
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [selectedRule, setSelectedRule] = useState<AllocationRule | null>(null);
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');

  // Cost centers loaded from the backend (master records only). Budget/actual/
  // allocation data is not provided by the backend and is defaulted to zero.
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM rows (costCenterCode/costCenterName/
        // parentCostCenterId/isProfitCenter/...); map into the richer
        // CostCenter model with zeroed budget/actual/allocation defaults.
        const raw = (await FinanceService.getCostCenters()) as any[];
        const mapped: CostCenter[] = raw.map((row) => ({
          id: String(row.id),
          code: row.costCenterCode,
          name: row.costCenterName,
          description: row.description ?? '',
          type: 'department' as any,
          parentId: row.parentCostCenterId ?? undefined,
          level: row.parentCostCenterId ? 2 : 1,
          isActive: row.isActive ?? true,
          manager: row.managerName ?? '',
          managerEmail: '',
          department: row.department ?? '',
          location: row.location ?? '',
          budget: emptyBudget(),
          actualCosts: emptyActualCosts(),
          allocations: [],
          responsibilityType: (row.isProfitCenter ? 'profit' : 'cost') as any,
          createdDate: row.createdAt ?? '',
          lastModified: row.updatedAt ?? '',
          tags: [],
        }));
        if (!cancelled) setCostCenters(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load cost centers');
          setCostCenters([]);
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

  const [allocationRules] = useState<AllocationRule[]>([
    {
      id: '1',
      name: 'IT Service Allocation',
      description: 'Allocate IT costs to departments based on headcount',
      sourceCostCenter: '1', // IT
      targetCostCenters: ['2', '3', '4'], // Sales, Manufacturing, HR
      allocationMethod: {
        id: '1',
        name: 'Headcount Based',
        type: 'headcount',
        formula: 'IT_Cost * (Department_Headcount / Total_Headcount)',
        parameters: [
          { id: '1', name: 'total_headcount', value: 450, type: 'number', description: 'Total company headcount' },
          { id: '2', name: 'allocation_percentage', value: 80, type: 'percentage', description: 'Percentage of IT costs to allocate' }
        ],
        frequency: 'monthly',
        isActive: true
      },
      conditions: [
        { id: '1', field: 'cost_center_type', operator: 'equals', value: 'department' }
      ],
      priority: 1,
      isActive: true,
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        isActive: true
      },
      createdDate: '2024-01-01T09:00:00Z',
      lastRun: '2024-01-01T09:00:00Z',
      nextRun: '2024-02-01T09:00:00Z'
    },
    {
      id: '2',
      name: 'HR Service Allocation',
      description: 'Allocate HR costs to departments based on employee count',
      sourceCostCenter: '4', // HR
      targetCostCenters: ['2', '3'], // Sales, Manufacturing (IT excluded)
      allocationMethod: {
        id: '2',
        name: 'Employee Count Based',
        type: 'headcount',
        formula: 'HR_Cost * (Department_Employees / Total_Employees)',
        parameters: [
          { id: '1', name: 'total_employees', value: 350, type: 'number', description: 'Total employees excluding HR' },
          { id: '2', name: 'allocation_percentage', value: 75, type: 'percentage', description: 'Percentage of HR costs to allocate' }
        ],
        frequency: 'monthly',
        isActive: true
      },
      conditions: [
        { id: '1', field: 'has_employees', operator: 'equals', value: 'true' }
      ],
      priority: 2,
      isActive: true,
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 5,
        time: '10:00',
        isActive: true
      },
      createdDate: '2024-01-01T09:00:00Z',
      lastRun: '2024-01-05T10:00:00Z',
      nextRun: '2024-02-05T10:00:00Z'
    }
  ]);

  const [allocationTransactions] = useState<AllocationTransaction[]>([
    {
      id: '1',
      allocationRuleId: '1',
      ruleName: 'IT Service Allocation',
      executionDate: '2024-01-01T09:00:00Z',
      fromCostCenter: '1',
      toCostCenter: '2',
      amount: 120000,
      percentage: 35.0,
      status: 'executed',
      journalEntryId: 'JE-2024-001',
      executedBy: 'System'
    },
    {
      id: '2',
      allocationRuleId: '1',
      ruleName: 'IT Service Allocation',
      executionDate: '2024-01-01T09:00:00Z',
      fromCostCenter: '1',
      toCostCenter: '3',
      amount: 150000,
      percentage: 45.0,
      status: 'executed',
      journalEntryId: 'JE-2024-002',
      executedBy: 'System'
    },
    {
      id: '3',
      allocationRuleId: '1',
      ruleName: 'IT Service Allocation',
      executionDate: '2024-01-01T09:00:00Z',
      fromCostCenter: '1',
      toCostCenter: '4',
      amount: 80000,
      percentage: 20.0,
      status: 'executed',
      journalEntryId: 'JE-2024-003',
      executedBy: 'System'
    },
    {
      id: '4',
      allocationRuleId: '2',
      ruleName: 'HR Service Allocation',
      executionDate: '2024-01-05T10:00:00Z',
      fromCostCenter: '4',
      toCostCenter: '2',
      amount: 45000,
      percentage: 50.0,
      status: 'executed',
      journalEntryId: 'JE-2024-004',
      executedBy: 'System'
    },
    {
      id: '5',
      allocationRuleId: '2',
      ruleName: 'HR Service Allocation',
      executionDate: '2024-01-05T10:00:00Z',
      fromCostCenter: '4',
      toCostCenter: '3',
      amount: 45000,
      percentage: 50.0,
      status: 'executed',
      journalEntryId: 'JE-2024-005',
      executedBy: 'System'
    }
  ]);

  // Chart data
  const costCenterBudgetData = costCenters.map(cc => ({
    name: cc.name,
    budget: cc.budget.totalBudget,
    actual: cc.actualCosts.totalActual,
    variance: cc.budget.totalBudget - cc.actualCosts.totalActual
  }));

  const allocationFlowData = [
    { source: 'IT', target: 'Sales', amount: 120000 },
    { source: 'IT', target: 'Manufacturing', amount: 150000 },
    { source: 'IT', target: 'HR', amount: 80000 },
    { source: 'HR', target: 'Sales', amount: 45000 },
    { source: 'HR', target: 'Manufacturing', amount: 45000 }
  ];

  const costTrendData = [
    { month: 'Jan', IT: 195000, Sales: 265000, Manufacturing: 374000, HR: 99000 },
    { month: 'Feb', IT: 188000, Sales: 248000, Manufacturing: 368000, HR: 96000 },
    { month: 'Mar', IT: 205000, Sales: 278000, Manufacturing: 385000, HR: 102000 },
    { month: 'Apr', IT: 198000, Sales: 285000, Manufacturing: 392000, HR: 105000 },
    { month: 'May', IT: 210000, Sales: 295000, Manufacturing: 398000, HR: 108000 },
    { month: 'Jun', IT: 195000, Sales: 265000, Manufacturing: 374000, HR: 99000 }
  ];

  const costDistribution = costCenters.map(cc => ({
    name: cc.name,
    value: cc.actualCosts.totalActual,
    color: cc.type === 'department' ? '#3B82F6' : '#10B981'
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getResponsibilityTypeColor = (type: string) => {
    switch (type) {
      case 'profit':
        return 'bg-green-100 text-green-800';
      case 'investment':
        return 'bg-blue-100 text-blue-800';
      case 'revenue':
        return 'bg-purple-100 text-purple-800';
      case 'cost':
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      executed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      reversed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Info }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="w-4 h-4 text-red-600" />;
      case 'down':
        return <TrendingDownIcon className="w-4 h-4 text-green-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cost Centers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {costCenters.filter(cc => cc.isActive).length}
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
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(costCenters.reduce((sum, cc) => sum + cc.budget.totalBudget, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actual</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(costCenters.reduce((sum, cc) => sum + cc.actualCosts.totalActual, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShareIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allocationRules.filter(rule => rule.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget vs Actual by Cost Center</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costCenterBudgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
              <Bar dataKey="actual" fill="#10B981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Cost Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="IT" stroke="#3B82F6" strokeWidth={2} name="IT" />
              <Line type="monotone" dataKey="Sales" stroke="#10B981" strokeWidth={2} name="Sales" />
              <Line type="monotone" dataKey="Manufacturing" stroke="#F59E0B" strokeWidth={2} name="Manufacturing" />
              <Line type="monotone" dataKey="HR" stroke="#8B5CF6" strokeWidth={2} name="HR" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Allocation Flow</h3>
          <div className="space-y-2">
            {allocationFlowData.map((flow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900">{flow.source}</div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-600">{flow.target}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(flow.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Allocation Transactions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {allocationTransactions.slice(0, 5).map((transaction) => {
              const fromCC = costCenters.find(cc => cc.id === transaction.fromCostCenter);
              const toCC = costCenters.find(cc => cc.id === transaction.toCostCenter);

              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{transaction.ruleName}</h4>
                    <p className="text-sm text-gray-600">
                      {fromCC?.name} → {toCC?.name} • {formatPercentage(transaction.percentage)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.executionDate)} • {transaction.executedBy}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCostCenters = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Cost Centers</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'hierarchy' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'flat' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Flat View
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowCostCenterModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Cost Center
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {costCenters.map((costCenter) => (
          <div key={costCenter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{costCenter.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{costCenter.code}</p>
                <p className="text-sm text-gray-500 mt-1">{costCenter.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCostCenter(costCenter)}
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
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{costCenter.type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Responsibility:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResponsibilityTypeColor(costCenter.responsibilityType)}`}>
                  {costCenter.responsibilityType.charAt(0).toUpperCase() + costCenter.responsibilityType.slice(1)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manager:</span>
                <span className="text-sm text-gray-900">{costCenter.manager}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Budget:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(costCenter.budget.totalBudget)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actual:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(costCenter.actualCosts.totalActual)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variance:</span>
                <span className={`text-sm font-medium ${
                  (costCenter.budget.totalBudget - costCenter.actualCosts.totalActual) >= 0
                  ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(costCenter.budget.totalBudget - costCenter.actualCosts.totalActual)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  costCenter.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {costCenter.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                {costCenter.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
                {costCenter.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{costCenter.tags.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationRules = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Allocation Rules</h3>
        <button
          onClick={() => setShowRuleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {allocationRules.map((rule) => {
          const sourceCC = costCenters.find(cc => cc.id === rule.sourceCostCenter);
          const targetCCs = rule.targetCostCenters.map(id => costCenters.find(cc => cc.id === id)).filter(Boolean);

          return (
            <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-blue-600">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-green-600">
                    <ShareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Source:</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">{sourceCC?.name}</span>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Targets:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {targetCCs.map((cc) => (
                      <span key={cc?.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {cc?.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-medium text-gray-900">{rule.allocationMethod.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Frequency:</span>
                  <span className="text-sm text-gray-900 capitalize">{rule.schedule.frequency}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className="text-sm text-gray-900">{rule.priority}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Run:</span>
                  <span className="text-sm text-gray-900">
                    {rule.lastRun ? formatDate(rule.lastRun) : 'Never'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Run:</span>
                  <span className="text-sm text-gray-900">
                    {rule.nextRun ? formatDate(rule.nextRun) : 'Not scheduled'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Run Allocation
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Allocation Transactions</h3>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rule
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journal Entry
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocationTransactions.map((transaction) => {
                const fromCC = costCenters.find(cc => cc.id === transaction.fromCostCenter);
                const toCC = costCenters.find(cc => cc.id === transaction.toCostCenter);

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.executionDate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.ruleName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {fromCC?.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {toCC?.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(transaction.percentage)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-600">
                      {transaction.journalEntryId || 'N/A'}
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

  const renderReports = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Cost Center Reports</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { name: 'Budget Variance Analysis', type: 'budget_variance', centers: 4, period: 'Q1 2024' },
          { name: 'Allocation Summary', type: 'allocation_summary', centers: 4, period: 'January 2024' },
          { name: 'Cost Trend Report', type: 'cost_trend', centers: 4, period: 'YTD 2024' },
          { name: 'Profitability Analysis', type: 'profitability', centers: 2, period: 'Q1 2024' }
        ].map((report, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-600 mt-1">Cost center analysis report</p>
              </div>
              <FileText className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{report.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost Centers:</span>
                <span className="text-gray-900">{report.centers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="text-gray-900">{report.period}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Generate
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cost Center Management</h1>
        <p className="text-gray-600 mt-2">Manage cost centers, allocation rules, and track financial performance</p>
      </div>

      {/* Loading / Error banners for cost-center master data */}
      {isLoading && (
        <div className="mb-4 flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <ClockIcon className="w-5 h-5 mr-2" />
          Loading cost centers...
        </div>
      )}
      {loadError && (
        <div className="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {loadError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'cost-centers', label: 'Cost Centers', icon: Building2 },
            { key: 'rules', label: 'Allocation Rules', icon: SlidersHorizontal },
            { key: 'transactions', label: 'Transactions', icon: Banknote },
            { key: 'reports', label: 'Reports', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
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
      {activeTab === 'cost-centers' && renderCostCenters()}
      {activeTab === 'rules' && renderAllocationRules()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default CostCenterManagement;