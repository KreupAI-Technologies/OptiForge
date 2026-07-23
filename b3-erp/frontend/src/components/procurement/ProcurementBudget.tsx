'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { procurementOperationsService } from '@/services/procurement-operations.service';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  DollarSign, TrendingUp, AlertCircle, Target, BarChart3, Plus,
  Edit, Download, RefreshCw, Settings, Calendar, FileText, CheckCircle,
  XCircle, TrendingDown, Activity, PieChart, ArrowUpRight, ArrowDownRight,
  Percent, Users, Package, Clock, Filter, Search, Eye, Send, Bell, Zap, Trash2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, RadialBarChart, RadialBar
} from 'recharts';

// Import Budget Modals
import {
  ViewBudgetDetailsModal,
  AdjustBudgetModal,
  BudgetForecastModal,
  BudgetAlertSetupModal,
  ExportBudgetModal
} from '@/components/procurement/BudgetModals'
import { exportToCsv } from '@/lib/export'

export interface BudgetLine {
  id: string;
  category: string;
  department: string;
  budgetAmount: number;
  spentAmount: number;
  committedAmount: number;
  availableAmount: number;
  utilizationPercent: number;
  variance: number;
  variancePercent: number;
  period: string;
  owner: string;
  status: 'healthy' | 'warning' | 'critical' | 'overspent';
  lastModified: string;
}

const ProcurementBudget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Modal state management
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isAlertSetupModalOpen, setIsAlertSetupModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [comparePeriodsOpen, setComparePeriodsOpen] = useState(false);
  const [manageOwnersOpen, setManageOwnersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetLine | null>(null);
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);

  const reloadBudgets = useCallback(async () => {
    try {
      const raw = await procurementOperationsService.getBudgets('default-company-id');
      if (Array.isArray(raw)) {
        setBudgetLines(raw.map((b: any, idx: number): BudgetLine => {
          const budgetAmount = Number(b.budgetAmount ?? b.totalBudget ?? b.allocated ?? b.budget ?? 0);
          const spentAmount = Number(b.spentAmount ?? b.spent ?? 0);
          const committedAmount = Number(b.committedAmount ?? b.committed ?? 0);
          const availableAmount = Number(b.availableAmount ?? b.available ?? (budgetAmount - spentAmount - committedAmount));
          const utilizationPercent = budgetAmount ? Math.round(((spentAmount + committedAmount) / budgetAmount) * 100) : 0;
          const variance = budgetAmount - spentAmount - committedAmount;
          return {
            id: b.id ?? `BDG${idx + 1}`,
            category: b.category ?? b.budgetType ?? '—',
            department: b.department ?? '—',
            budgetAmount,
            spentAmount,
            committedAmount,
            availableAmount,
            utilizationPercent,
            variance,
            variancePercent: budgetAmount ? Math.round((variance / budgetAmount) * 100) : 0,
            period: b.period ?? b.fiscalYear ?? '—',
            owner: b.owner ?? '—',
            status: utilizationPercent > 100 ? 'overspent' : utilizationPercent >= 90 ? 'critical' : utilizationPercent >= 75 ? 'warning' : 'healthy',
            lastModified: (b.updatedAt ?? b.lastModified ?? '').toString().slice(0, 10),
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  }, []);

  useEffect(() => {
    reloadBudgets();
  }, [reloadBudgets]);

  // Monthly budget trend — sourced from procurement budget insights API
  const [monthlyTrend, setMonthlyTrend] = useState<
    { month: string; budget: number; spent: number; committed: number; forecast: number }[]
  >([]);

  // Quarterly forecast — sourced from procurement budget insights API
  const [quarterlyForecast, setQuarterlyForecast] = useState<
    { quarter: string; budget: number; actual: number; forecast: number; variance: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await procurementPagesService.getBudgetInsights();
        setMonthlyTrend(Array.isArray(data?.monthlyTrend) ? data.monthlyTrend : []);
        setQuarterlyForecast(Array.isArray(data?.quarterlyForecast) ? data.quarterlyForecast : []);
      } catch {
        setMonthlyTrend([]);
        setQuarterlyForecast([]);
      }
    })();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'overspent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBudget = budgetLines.reduce((sum, line) => sum + line.budgetAmount, 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + line.spentAmount, 0);
  const totalCommitted = budgetLines.reduce((sum, line) => sum + line.committedAmount, 0);
  const totalAvailable = budgetLines.reduce((sum, line) => sum + line.availableAmount, 0);

  // Modal handlers
  const handleViewBudgetDetails = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsViewDetailsModalOpen(true);
  };

  const handleAdjustBudgetModal = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsAdjustModalOpen(true);
  };

  const handleForecastModal = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsForecastModalOpen(true);
  };

  const handleAlertSetup = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsAlertSetupModalOpen(true);
  };

  const handleExportModal = () => {
    setIsExportModalOpen(true);
  };

  // Handler functions
  const handleSetBudget = async () => {
    const name = window.prompt('Budget name / category:');
    if (!name) return;
    const budget = Number(window.prompt('Total budget amount ($):', '0') ?? 0) || 0;
    const fiscalYear = window.prompt('Fiscal year (optional):', String(new Date().getFullYear())) ?? undefined;
    try {
      await procurementOperationsService.createBudget({
        name,
        budgetType: 'category',
        budget,
        fiscalYear,
      });
      await reloadBudgets();
    } catch (err) {
      console.error('Failed to create budget:', err);
      alert('Failed to create budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (budget: BudgetLine) => {
    if (!window.confirm(`Delete budget "${budget.category}"? This cannot be undone.`)) return;
    try {
      await procurementOperationsService.deleteBudget(budget.id);
      await reloadBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const handleAdjustBudget = () => {
    if (budgetLines.length === 0) {
      alert('No budgets loaded yet.');
      return;
    }
    setSelectedBudget(budgetLines[0]);
    setIsAdjustModalOpen(true);
  };

  const handleViewVariance = () => {
    setSelectedBudget(budgetLines[0] ?? null);
    setIsViewDetailsModalOpen(true);
  };

  const handleExportBudgetReport = () => {
    exportToCsv(
      'budget-report.csv',
      budgetLines.map((line) => ({
        id: line.id,
        category: line.category,
        department: line.department,
        budgetAmount: line.budgetAmount,
        spentAmount: line.spentAmount,
        committedAmount: line.committedAmount,
        availableAmount: line.availableAmount,
        utilizationPercent: line.utilizationPercent,
        variance: line.variance,
        variancePercent: line.variancePercent,
        period: line.period,
        owner: line.owner,
        status: line.status,
        lastModified: line.lastModified,
      }))
    );
  };

  const handleForecast = () => {
    setSelectedBudget(budgetLines[0] ?? null);
    setIsForecastModalOpen(true);
  };

  const handleReviewBudgetAlerts = () => {
    setSelectedBudget(budgetLines[0] ?? null);
    setIsAlertSetupModalOpen(true);
  };

  const handleComparePeriods = () => {
    setComparePeriodsOpen(true);
  };

  const handleManageBudgetOwners = () => {
    setManageOwnersOpen(true);
  };

  const handleRefresh = () => {
    reloadBudgets();
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Procurement Budget Tracking</h2>
            <p className="text-gray-600">Monitor and control procurement spend against budget</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSetBudget}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Set Budget"
            >
              <Plus className="h-4 w-4" />
              <span>Set Budget</span>
            </button>
            <button
              onClick={handleAdjustBudget}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="Adjust Budget"
            >
              <Edit className="h-4 w-4" />
              <span>Adjust</span>
            </button>
            <button
              onClick={handleForecast}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Forecast"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecast</span>
            </button>
            <button
              onClick={handleViewVariance}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              title="View Variance"
            >
              <Activity className="h-4 w-4" />
              <span>Variance</span>
            </button>
            <button
              onClick={handleExportBudgetReport}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Export Report"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-600">Total Budget</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <p className="text-2xl font-bold">${(totalSpent / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-600">Spent to Date</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Used</span>
          </div>
          <p className="text-2xl font-bold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Budget Utilization</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Left</span>
          </div>
          <p className="text-2xl font-bold">${(totalAvailable / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Remaining Budget</p>
        </div>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Budget Monitoring
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh
              </label>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Today's Spend</span>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$42.5K</div>
              <div className="text-xs text-green-600 mt-1">↓ 12% vs yesterday</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Budget Alerts</span>
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-red-600 mt-1">2 critical</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Burn Rate</span>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$185K</div>
              <div className="text-xs text-gray-600 mt-1">Per day avg</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Forecast Variance</span>
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">-2.3%</div>
              <div className="text-xs text-green-600 mt-1">Under forecast</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Budget Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">PO-2024-567 approved: $28,500 against Raw Materials budget</span>
                <span className="text-gray-400 text-xs ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">IT Services budget reached 85% utilization threshold</span>
                <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Budget transfer: $50K from Contingency to Manufacturing</span>
                <span className="text-gray-400 text-xs ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-gray-600">Q4 forecast updated with 3% reduction in logistics costs</span>
                <span className="text-gray-400 text-xs ml-auto">4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      {showAIInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI-Powered Budget Insights
            </h3>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Forecast Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">94.2%</div>
              <p className="text-xs text-gray-600">AI predictions matching actual spend within 5% margin - high confidence for Q1 planning</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">Overspend Risk</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">Medium</div>
              <p className="text-xs text-gray-600">Raw Materials and IT Services budgets projected to exceed by 8-12% if current trends continue</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Savings Opportunity</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">$125K</div>
              <p className="text-xs text-gray-600">Potential savings identified through spend pattern analysis and supplier consolidation</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Budget Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Reallocation Needed:</span>
                  <span className="text-gray-600"> Transfer $75K from underutilized Marketing budget to Manufacturing to avoid Q4 overspend</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Seasonal Adjustment:</span>
                  <span className="text-gray-600"> Historical data shows 20% spike in logistics costs during Dec-Jan - recommend budget reserve</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Cost Optimization:</span>
                  <span className="text-gray-600"> Negotiate volume discounts with top 3 suppliers to achieve 5-7% cost reduction on $2.1M annual spend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'budget', 'variance', 'forecasting'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Budget Table */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Budget Details</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleComparePeriods}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Compare Periods"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Compare</span>
              </button>
              <button
                onClick={handleManageBudgetOwners}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Manage Owners"
              >
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Owners</span>
              </button>
              <button
                onClick={handleReviewBudgetAlerts}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 text-sm transition-colors"
                title="Review Alerts"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Alerts ({budgetLines.filter(l => l.status !== 'healthy').length})</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Committed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetLines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{line.category}</div>
                      <div className="text-xs text-gray-500">{line.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{line.department}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(line.budgetAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${(line.spentAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                      ${(line.committedAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <span className={line.availableAmount < 0 ? 'text-red-600' : 'text-green-600'}>
                        ${(line.availableAmount / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              line.utilizationPercent >= 95
                                ? 'bg-red-500'
                                : line.utilizationPercent >= 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(line.utilizationPercent, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{line.utilizationPercent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{line.owner}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(line.status)}`}>
                        {line.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteBudget(line)}
                        className="inline-flex items-center gap-1 px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs"
                        title="Delete budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalBudget / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalSpent / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalCommitted / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold">
                    <span className={totalAvailable < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${(totalAvailable / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    {((totalSpent / totalBudget) * 100).toFixed(1)}%
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      {(activeTab === 'overview' || activeTab === 'forecasting') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Monthly Budget Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                <Line type="monotone" dataKey="spent" stroke="#3B82F6" strokeWidth={2} name="Actual Spent" />
                <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Budget Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={budgetLines.map(line => ({
                    name: line.category,
                    value: line.budgetAmount
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetLines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Quarterly Forecast</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                <Bar dataKey="forecast" fill="#F59E0B" name="Forecast" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Utilization by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetLines.map(line => ({
                name: line.category.split(' ')[0],
                utilization: line.utilizationPercent,
                target: 85
              }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#3B82F6" name="Current %" />
                <Bar dataKey="target" fill="#E5E7EB" name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Variance Analysis */}
      {activeTab === 'variance' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Budget vs. Actual Analysis</h4>
            <div className="space-y-2">
              {budgetLines.map((line) => (
                <div key={line.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{line.category}</span>
                      <span className="text-sm text-gray-500 ml-2">{line.department}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(line.spentAmount / 1000).toFixed(0)}K / ${(line.budgetAmount / 1000).toFixed(0)}K
                      </div>
                      <div className={`text-sm ${
                        line.variance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {line.variance > 0 ? '+' : ''}${(line.variance / 1000).toFixed(0)}K ({line.variance > 0 ? '+' : ''}{line.variancePercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        line.utilizationPercent >= 100
                          ? 'bg-red-500'
                          : line.utilizationPercent >= 90
                          ? 'bg-orange-500'
                          : line.utilizationPercent >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(line.utilizationPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Top Variances</h4>
              <div className="space-y-3">
                {budgetLines
                  .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
                  .slice(0, 5)
                  .map((line, idx) => (
                    <div key={line.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{line.category}</p>
                          <p className="text-xs text-gray-500">{line.utilizationPercent.toFixed(1)}% utilized</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${line.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {line.variance > 0 ? '+' : ''}${(Math.abs(line.variance) / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-500">{line.variancePercent.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Budget Health Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Healthy</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {budgetLines.filter(l => l.status === 'healthy').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">
                    {budgetLines.filter(l => l.status === 'warning').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium">Critical</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {budgetLines.filter(l => l.status === 'critical').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Overspent</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {budgetLines.filter(l => l.status === 'overspent').length} categories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modals */}
      <ViewBudgetDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => setIsViewDetailsModalOpen(false)}
        budget={selectedBudget ? {
          id: selectedBudget.id,
          category: selectedBudget.category,
          department: selectedBudget.department,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount,
          utilizationPercent: selectedBudget.utilizationPercent,
          variance: selectedBudget.variance,
          variancePercent: selectedBudget.variancePercent,
          period: selectedBudget.period,
          owner: selectedBudget.owner,
          status: selectedBudget.status,
          lastModified: selectedBudget.lastModified
        } : undefined}
      />

      <AdjustBudgetModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          department: selectedBudget.department,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount,
          period: selectedBudget.period
        } : undefined}
        onSubmit={async (data) => {
          if (!selectedBudget?.id) {
            setIsAdjustModalOpen(false);
            return;
          }
          try {
            await procurementOperationsService.updateBudget(selectedBudget.id, {
              budget: Number(data?.newBudget ?? selectedBudget.budgetAmount),
            });
            await reloadBudgets();
          } catch (err) {
            console.error('Failed to adjust budget:', err);
            alert('Failed to adjust budget. Please try again.');
          } finally {
            setIsAdjustModalOpen(false);
          }
        }}
      />

      <BudgetForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount
        } : undefined}
        onSubmit={() => {
          setIsForecastModalOpen(false);
        }}
      />

      <BudgetAlertSetupModal
        isOpen={isAlertSetupModalOpen}
        onClose={() => setIsAlertSetupModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          period: selectedBudget.period,
          owner: selectedBudget.owner,
          department: selectedBudget.department
        } : undefined}
        onSubmit={() => {
          setIsAlertSetupModalOpen(false);
        }}
      />

      <ExportBudgetModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={() => {
          setIsExportModalOpen(false);
        }}
      />

      {comparePeriodsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setComparePeriodsOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compare Budget Periods</h3>
              <button onClick={() => setComparePeriodsOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
            </div>
            {quarterlyForecast.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Quarter</th><th>Budget</th><th>Actual</th><th>Forecast</th><th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyForecast.map((q) => (
                    <tr key={q.quarter} className="border-b">
                      <td className="py-2">{q.quarter}</td>
                      <td>${q.budget.toLocaleString()}</td>
                      <td>${q.actual.toLocaleString()}</td>
                      <td>${q.forecast.toLocaleString()}</td>
                      <td className={q.variance < 0 ? 'text-red-600' : 'text-green-600'}>${q.variance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">Period comparison will populate once budget insights are available. Current total budget ${totalBudget.toLocaleString()}, spent ${totalSpent.toLocaleString()}.</p>
            )}
          </div>
        </div>
      )}

      {manageOwnersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setManageOwnersOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Budget Owners</h3>
              <button onClick={() => setManageOwnersOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Category</th><th>Owner</th><th>Department</th><th>Budget</th><th>Utilization</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-2">{line.category}</td>
                    <td>{line.owner}</td>
                    <td>{line.department}</td>
                    <td>${line.budgetAmount.toLocaleString()}</td>
                    <td>{line.utilizationPercent}%</td>
                    <td><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(line.status)}`}>{line.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSettingsOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Budget Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Real-time monitoring</span>
                <input type="checkbox" checked={showRealTimeMonitoring} onChange={(e) => setShowRealTimeMonitoring(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span>AI insights</span>
                <input type="checkbox" checked={showAIInsights} onChange={(e) => setShowAIInsights(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span>Auto-refresh</span>
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementBudget;
