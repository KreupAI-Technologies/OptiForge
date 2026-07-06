'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, TrendingUpIcon, TrendingDownIcon, AlertTriangle,
  CalendarIcon, FileText, BarChart3, SlidersHorizontal,
  PlusIcon, PencilIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon, Info
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface Budget {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'locked' | 'closed';
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  departments: BudgetDepartment[];
  categories: BudgetCategory[];
  version: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

interface BudgetDepartment {
  id: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  categories: BudgetLineItem[];
}

interface BudgetCategory {
  id: string;
  name: string;
  type: 'revenue' | 'expense' | 'capex';
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface BudgetLineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  description: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  monthlyData: MonthlyBudgetData[];
}

interface MonthlyBudgetData {
  month: string;
  budget: number;
  actual: number;
  variance: number;
  forecast?: number;
}

interface BudgetScenario {
  id: string;
  name: string;
  description: string;
  type: 'conservative' | 'optimistic' | 'pessimistic' | 'custom';
  adjustmentPercent: number;
  totalAmount: number;
}

const BudgetManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'variance' | 'forecasting' | 'scenarios'>('dashboard');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getBudgets()) as any[];
        const mapped: Budget[] = (raw || []).map((row) => {
          const totalBudget = Number(row.totalBudget ?? row.budgetAmount ?? row.totalAmount ?? 0);
          const totalActual = Number(row.totalActual ?? row.actualAmount ?? row.actual ?? 0);
          const totalVariance = Number(row.totalVariance ?? row.variance ?? (totalActual - totalBudget));
          const variancePercent = Number(
            row.variancePercent ?? (totalBudget ? (totalVariance / totalBudget) * 100 : 0),
          );
          return {
            id: String(row.id ?? ''),
            name: row.name ?? row.budgetName ?? '',
            period: row.period ?? row.fiscalYear ?? '',
            startDate: row.startDate ?? '',
            endDate: row.endDate ?? '',
            status: (row.status ?? 'draft') as Budget['status'],
            totalBudget,
            totalActual,
            totalVariance,
            variancePercent,
            departments: Array.isArray(row.departments) ? row.departments : [],
            categories: Array.isArray(row.categories) ? row.categories : [],
            version: Number(row.version ?? 1),
            createdBy: row.createdBy ?? '',
            createdDate: row.createdDate ?? row.createdAt ?? '',
            lastModified: row.lastModified ?? row.updatedAt ?? '',
          };
        });
        if (!cancelled) setBudgets(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
          setBudgets([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock monthly data
  const monthlyBudgetData = [
    { month: 'Jan', budget: 1000000, actual: 980000, variance: -20000, forecast: 1020000 },
    { month: 'Feb', budget: 1050000, actual: 1080000, variance: 30000, forecast: 1100000 },
    { month: 'Mar', budget: 1100000, actual: 1140000, variance: 40000, forecast: 1150000 },
    { month: 'Apr', budget: 1075000, actual: 0, variance: 0, forecast: 1090000 },
    { month: 'May', budget: 1125000, actual: 0, variance: 0, forecast: 1140000 },
    { month: 'Jun', budget: 1200000, actual: 0, variance: 0, forecast: 1220000 },
    { month: 'Jul', budget: 1150000, actual: 0, variance: 0, forecast: 1170000 },
    { month: 'Aug', budget: 1180000, actual: 0, variance: 0, forecast: 1200000 },
    { month: 'Sep', budget: 1220000, actual: 0, variance: 0, forecast: 1240000 },
    { month: 'Oct', budget: 1100000, actual: 0, variance: 0, forecast: 1120000 },
    { month: 'Nov', budget: 1080000, actual: 0, variance: 0, forecast: 1100000 },
    { month: 'Dec', budget: 1050000, actual: 0, variance: 0, forecast: 1070000 }
  ];

  const departmentVarianceData = [
    { department: 'Operations', budget: 5000000, actual: 1300000, variance: -75000 },
    { department: 'Sales & Marketing', budget: 3000000, actual: 800000, variance: -50000 },
    { department: 'R&D', budget: 2500000, actual: 650000, variance: 25000 },
    { department: 'Administration', budget: 2000000, actual: 450000, variance: -50000 }
  ];

  const categoryDistribution = [
    { name: 'Revenue', value: 15000000, color: '#10B981' },
    { name: 'OpEx', value: 8500000, color: '#EF4444' },
    { name: 'CapEx', value: 2000000, color: '#F59E0B' }
  ];

  const [budgetScenarios] = useState<BudgetScenario[]>([
    {
      id: '1',
      name: 'Conservative Scenario',
      description: 'Reduced spending and conservative revenue estimates',
      type: 'conservative',
      adjustmentPercent: -15,
      totalAmount: 10625000
    },
    {
      id: '2',
      name: 'Optimistic Scenario',
      description: 'Aggressive growth targets and increased investments',
      type: 'optimistic',
      adjustmentPercent: 20,
      totalAmount: 15000000
    },
    {
      id: '3',
      name: 'Recession Scenario',
      description: 'Economic downturn with significant cost cuts',
      type: 'pessimistic',
      adjustmentPercent: -25,
      totalAmount: 9375000
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    if (variance < 0) return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      locked: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Info },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircleIcon }
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

  const renderDashboard = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(12500000)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actual Spend</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(3200000)}</p>
              <p className="text-sm text-gray-500">25.6% of budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDownIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Variance</p>
              <p className="text-2xl font-semibold text-red-600">{formatCurrency(-150000)}</p>
              <p className="text-sm text-red-600">-4.5% vs budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Budget Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">7</p>
              <p className="text-sm text-yellow-600">Require attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget vs Actual (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyBudgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
              <Bar dataKey="actual" fill="#10B981" name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Department Variance Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentVarianceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="department" type="category" width={80} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="variance" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Budget Distribution */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Variances */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Variances</h3>
          <div className="space-y-2">
            {departmentVarianceData
              .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
              .slice(0, 4)
              .map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{dept.department}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(dept.actual)} spent</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center ${getVarianceColor(dept.variance)}`}>
                      {getVarianceIcon(dept.variance)}
                      <span className="ml-1 font-medium">{formatCurrency(Math.abs(dept.variance))}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Budget Health */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Health</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Track</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">At Risk</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Over Budget</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgets = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Budget Plans</h3>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{budget.name}</h4>
                <p className="text-sm text-gray-600">{budget.period}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(budget.status)}
                <button className="text-gray-600 hover:text-blue-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Budget:</span>
                <span className="font-medium text-gray-900">{formatCurrency(budget.totalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actual Spend:</span>
                <span className="font-medium text-gray-900">{formatCurrency(budget.totalActual)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variance:</span>
                <span className={`font-medium ${getVarianceColor(budget.totalVariance)}`}>
                  {formatCurrency(budget.totalVariance)} ({formatPercent(budget.variancePercent)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Period:</span>
                <span className="text-sm text-gray-900">
                  {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setSelectedBudget(budget)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
              <span className="text-xs text-gray-500">
                v{budget.version} • Modified {new Date(budget.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVarianceAnalysis = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Variance Analysis</h3>

      {/* Department Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Department Performance</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets[0]?.departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.budgetAmount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.actualAmount)}
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${getVarianceColor(dept.variance)}`}>
                      {formatCurrency(dept.variance)}
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${getVarianceColor(dept.variance)}`}>
                      {formatPercent(dept.variancePercent)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {Math.abs(dept.variancePercent) > 10 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Alert
                        </span>
                      ) : Math.abs(dept.variancePercent) > 5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Watch
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Good
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForecasting = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Budget Forecasting</h3>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">12-Month Forecast</h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyBudgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Area type="monotone" dataKey="budget" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Budget" />
            <Area type="monotone" dataKey="forecast" fill="#F59E0B" fillOpacity={0.3} stroke="#F59E0B" name="Forecast" />
            <Bar dataKey="actual" fill="#10B981" name="Actual" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Forecast Accuracy</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Month:</span>
              <span className="text-sm font-medium text-green-600">+2.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">3-Month Average:</span>
              <span className="text-sm font-medium text-blue-600">+1.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">YTD Average:</span>
              <span className="text-sm font-medium text-yellow-600">-0.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Key Assumptions</h4>
          <div className="space-y-2 text-sm">
            <div>• Revenue growth: 8% YoY</div>
            <div>• Inflation impact: 3.2%</div>
            <div>• Headcount increase: 15%</div>
            <div>• Technology investments: $500K</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              Market volatility
            </div>
            <div className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
              Supply chain costs
            </div>
            <div className="flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 text-blue-500 mr-2" />
              Currency fluctuation
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Budget Scenarios</h3>
        <button
          onClick={() => setShowScenarioModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {budgetScenarios.map((scenario) => (
          <div key={scenario.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
              </div>
              <button className="text-gray-600 hover:text-blue-600">
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Adjustment:</span>
                <span className={`font-medium ${getVarianceColor(scenario.adjustmentPercent)}`}>
                  {formatPercent(scenario.adjustmentPercent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">{formatCurrency(scenario.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{scenario.type}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Apply Scenario
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Comparison */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Scenario Comparison</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetScenarios}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="totalAmount" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600 mt-2">Plan, track, and analyze budgets with variance analysis and forecasting</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'budgets', label: 'Budgets', icon: FileText },
            { key: 'variance', label: 'Variance Analysis', icon: TrendingUpIcon },
            { key: 'forecasting', label: 'Forecasting', icon: CalendarIcon },
            { key: 'scenarios', label: 'Scenarios', icon: SlidersHorizontal }
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
      {activeTab === 'budgets' && renderBudgets()}
      {activeTab === 'variance' && renderVarianceAnalysis()}
      {activeTab === 'forecasting' && renderForecasting()}
      {activeTab === 'scenarios' && renderScenarios()}
    </div>
  );
};

export default BudgetManagement;