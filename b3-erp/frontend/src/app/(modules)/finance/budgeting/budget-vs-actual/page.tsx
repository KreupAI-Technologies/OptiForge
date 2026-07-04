'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Target
} from 'lucide-react';

interface BudgetLine {
  category: string;
  subcategory?: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  ytdBudgeted: number;
  ytdActual: number;
  ytdVariance: number;
  ytdVariancePercent: number;
}

export default function BudgetVsActualPage() {
  const [selectedBudget, setSelectedBudget] = useState('BUD-2025-OPS-001');
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [viewMode, setViewMode] = useState<'monthly' | 'ytd'>('monthly');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    revenue: true,
    cogs: false,
    operating: false,
    financial: false
  });

  const [budgetData, setBudgetData] = useState<BudgetLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Budget vs Actual derives each line from the budgets list
        // (budgeted = totalBudget, actual = spent).
        const raw = await FinanceService.getBudgets();
        const mapped: BudgetLine[] = (Array.isArray(raw) ? raw : []).map((b: any) => {
          const budgeted = Number(b.totalBudget ?? b.allocated ?? 0);
          const actual = Number(b.spent ?? b.totalActualAmount ?? 0);
          const variance = Number(b.variance ?? (budgeted - actual));
          const variancePercent = budgeted
            ? Number(((variance / budgeted) * 100).toFixed(2))
            : 0;
          return {
            category: b.budgetType ?? b.department ?? 'Budget',
            subcategory: b.budgetName ?? b.budgetCode ?? '',
            budgeted,
            actual,
            variance,
            variancePercent,
            ytdBudgeted: budgeted,
            ytdActual: actual,
            ytdVariance: variance,
            ytdVariancePercent: variancePercent,
          };
        });
        if (!cancelled) setBudgetData(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load budget data');
          setBudgetData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryTotal = (categoryName: string) => {
    const items = budgetData.filter(item => item.category === categoryName);
    return items.reduce(
      (acc, item) => ({
        budgeted: acc.budgeted + item.budgeted,
        actual: acc.actual + item.actual,
        variance: acc.variance + item.variance,
        ytdBudgeted: acc.ytdBudgeted + item.ytdBudgeted,
        ytdActual: acc.ytdActual + item.ytdActual,
        ytdVariance: acc.ytdVariance + item.ytdVariance
      }),
      { budgeted: 0, actual: 0, variance: 0, ytdBudgeted: 0, ytdActual: 0, ytdVariance: 0 }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatVariance = (variance: number, percent: number) => {
    const sign = variance >= 0 ? '+' : '';
    return `${sign}${formatCurrency(variance)} (${sign}${percent.toFixed(1)}%)`;
  };

  // Calculate overall totals
  const revenueTotal = getCategoryTotal('Revenue');
  const cogsTotal = getCategoryTotal('Cost of Goods Sold');
  const opexTotal = getCategoryTotal('Operating Expenses');
  const finExpTotal = getCategoryTotal('Financial Expenses');

  const grossProfit = {
    budgeted: revenueTotal.budgeted - cogsTotal.budgeted,
    actual: revenueTotal.actual - cogsTotal.actual,
    variance: (revenueTotal.actual - cogsTotal.actual) - (revenueTotal.budgeted - cogsTotal.budgeted),
    ytdBudgeted: revenueTotal.ytdBudgeted - cogsTotal.ytdBudgeted,
    ytdActual: revenueTotal.ytdActual - cogsTotal.ytdActual,
    ytdVariance: (revenueTotal.ytdActual - cogsTotal.ytdActual) - (revenueTotal.ytdBudgeted - cogsTotal.ytdBudgeted)
  };

  const operatingProfit = {
    budgeted: grossProfit.budgeted - opexTotal.budgeted,
    actual: grossProfit.actual - opexTotal.actual,
    variance: (grossProfit.actual - opexTotal.actual) - (grossProfit.budgeted - opexTotal.budgeted),
    ytdBudgeted: grossProfit.ytdBudgeted - opexTotal.ytdBudgeted,
    ytdActual: grossProfit.ytdActual - opexTotal.ytdActual,
    ytdVariance: (grossProfit.ytdActual - opexTotal.ytdActual) - (grossProfit.ytdBudgeted - opexTotal.ytdBudgeted)
  };

  const netProfit = {
    budgeted: operatingProfit.budgeted - finExpTotal.budgeted,
    actual: operatingProfit.actual - finExpTotal.actual,
    variance: (operatingProfit.actual - finExpTotal.actual) - (operatingProfit.budgeted - finExpTotal.budgeted),
    ytdBudgeted: operatingProfit.ytdBudgeted - finExpTotal.ytdBudgeted,
    ytdActual: operatingProfit.ytdActual - finExpTotal.ytdActual,
    ytdVariance: (operatingProfit.ytdActual - finExpTotal.ytdActual) - (operatingProfit.ytdBudgeted - finExpTotal.ytdBudgeted)
  };

  const renderCategoryRow = (categoryName: string, categoryKey: string) => {
    const total = getCategoryTotal(categoryName);
    const isExpanded = expandedCategories[categoryKey];
    const items = budgetData.filter(item => item.category === categoryName);

    const budgetValue = viewMode === 'monthly' ? total.budgeted : total.ytdBudgeted;
    const actualValue = viewMode === 'monthly' ? total.actual : total.ytdActual;
    const varianceValue = viewMode === 'monthly' ? total.variance : total.ytdVariance;
    const variancePercent = budgetValue !== 0 ? (varianceValue / budgetValue) * 100 : 0;

    return (
      <>
        <tr
          className="bg-blue-900/20 border-b-2 border-blue-600 cursor-pointer hover:bg-blue-900/30 transition-colors"
          onClick={() => toggleCategory(categoryKey)}
        >
          <td className="px-3 py-2 font-bold text-blue-400 flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {categoryName}
          </td>
          <td className="px-3 py-2 text-right font-bold text-white">{formatCurrency(budgetValue)}</td>
          <td className="px-3 py-2 text-right font-bold text-white">{formatCurrency(actualValue)}</td>
          <td className={`px-3 py-2 text-right font-bold ${varianceValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatVariance(varianceValue, variancePercent)}
          </td>
          <td className="px-3 py-2 text-center">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${Math.abs(variancePercent) > 10 ? 'bg-red-500' : Math.abs(variancePercent) > 5 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(Math.abs(variancePercent) * 10, 100)}%` }}
              />
            </div>
          </td>
        </tr>
        {isExpanded &&
          items.map((item, index) => {
            const itemBudget = viewMode === 'monthly' ? item.budgeted : item.ytdBudgeted;
            const itemActual = viewMode === 'monthly' ? item.actual : item.ytdActual;
            const itemVariance = viewMode === 'monthly' ? item.variance : item.ytdVariance;
            const itemVariancePercent = viewMode === 'monthly' ? item.variancePercent : item.ytdVariancePercent;

            return (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="px-3 py-2 pl-12 text-gray-300">{item.subcategory}</td>
                <td className="px-3 py-2 text-right text-white">{formatCurrency(itemBudget)}</td>
                <td className="px-3 py-2 text-right text-white">{formatCurrency(itemActual)}</td>
                <td className={`px-3 py-2 text-right ${itemVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatVariance(itemVariance, itemVariancePercent)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-sm ${Math.abs(itemVariancePercent) > 10 ? 'text-red-400' : Math.abs(itemVariancePercent) > 5 ? 'text-orange-400' : 'text-green-400'}`}>
                    {Math.abs(itemVariancePercent).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
      </>
    );
  };

  const renderTotalRow = (label: string, data: any, isFinal = false) => {
    const budgetValue = viewMode === 'monthly' ? data.budgeted : data.ytdBudgeted;
    const actualValue = viewMode === 'monthly' ? data.actual : data.ytdActual;
    const varianceValue = viewMode === 'monthly' ? data.variance : data.ytdVariance;
    const variancePercent = budgetValue !== 0 ? (varianceValue / budgetValue) * 100 : 0;

    return (
      <tr className={`border-b-2 border-gray-600 ${isFinal ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30' : 'bg-gray-900/50'}`}>
        <td className={`px-3 py-2 font-bold ${isFinal ? 'text-purple-400 text-lg' : 'text-white'}`}>{label}</td>
        <td className={`px-3 py-2 text-right font-bold ${isFinal ? 'text-white text-lg' : 'text-white'}`}>
          {formatCurrency(budgetValue)}
        </td>
        <td className={`px-3 py-2 text-right font-bold ${isFinal ? 'text-white text-lg' : 'text-white'}`}>
          {formatCurrency(actualValue)}
        </td>
        <td className={`px-3 py-2 text-right font-bold text-lg ${varianceValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatVariance(varianceValue, variancePercent)}
        </td>
        <td className="px-3 py-2 text-center">
          <span className={`text-sm font-bold ${Math.abs(variancePercent) > 10 ? 'text-red-400' : Math.abs(variancePercent) > 5 ? 'text-orange-400' : 'text-green-400'}`}>
            {Math.abs(variancePercent).toFixed(1)}%
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-3">
      <div className="w-full space-y-3">
        {isLoading && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Loading budget data…</div>
        )}
        {loadError && !isLoading && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{loadError}</div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Budget vs Actual Analysis</h1>
            <p className="text-gray-400">Compare budgeted vs actual performance</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" />
              View Charts
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(revenueTotal.actual)}</div>
            <div className="text-green-100 text-sm">Actual Revenue</div>
            <div className="mt-2 text-xs text-green-100">
              {formatVariance(revenueTotal.variance, (revenueTotal.variance / revenueTotal.budgeted) * 100)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(grossProfit.actual)}</div>
            <div className="text-purple-100 text-sm">Gross Profit</div>
            <div className="mt-2 text-xs text-purple-100">
              {formatVariance(grossProfit.variance, (grossProfit.variance / grossProfit.budgeted) * 100)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Target className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(operatingProfit.actual)}</div>
            <div className="text-blue-100 text-sm">Operating Profit</div>
            <div className="mt-2 text-xs text-blue-100">
              {formatVariance(operatingProfit.variance, (operatingProfit.variance / operatingProfit.budgeted) * 100)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 opacity-80" />
              {netProfit.variance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(netProfit.actual)}</div>
            <div className="text-orange-100 text-sm">Net Profit</div>
            <div className="mt-2 text-xs text-orange-100">
              {formatVariance(netProfit.variance, (netProfit.variance / netProfit.budgeted) * 100)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BUD-2025-OPS-001">Operations Budget FY 2025</option>
                <option value="BUD-2025-CAP-001">Capital Expenditure FY 2025</option>
                <option value="BUD-2025-MKT-001">Marketing Budget Q1 2025</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025-01">January 2025</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
              </select>
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('ytd')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'ytd'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Year to Date
              </button>
            </div>
          </div>
        </div>

        {/* Budget vs Actual Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">
                    Budgeted {viewMode === 'ytd' && '(YTD)'}
                  </th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">
                    Actual {viewMode === 'ytd' && '(YTD)'}
                  </th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Variance</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Impact</th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryRow('Revenue', 'revenue')}
                {renderCategoryRow('Cost of Goods Sold', 'cogs')}
                {renderTotalRow('Gross Profit', grossProfit)}
                {renderCategoryRow('Operating Expenses', 'operating')}
                {renderTotalRow('Operating Profit', operatingProfit)}
                {renderCategoryRow('Financial Expenses', 'financial')}
                {renderTotalRow('Net Profit', netProfit, true)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variance Analysis */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-2">Variance Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Favorable Variances:</span>
                <span className="text-green-400 font-medium">
                  {budgetData.filter(item => item.variance > 0).length} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Unfavorable Variances:</span>
                <span className="text-red-400 font-medium">
                  {budgetData.filter(item => item.variance < 0).length} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">On Target:</span>
                <span className="text-gray-300 font-medium">
                  {budgetData.filter(item => item.variance === 0).length} items
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Largest Favorable:</span>
                <span className="text-green-400 font-medium">
                  Product Sales (+{formatCurrency(500000)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Largest Unfavorable:</span>
                <span className="text-red-400 font-medium">
                  Raw Materials (-{formatCurrency(200000)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Overall Performance:</span>
                <span className={`font-medium ${netProfit.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netProfit.variance >= 0 ? 'Above Target' : 'Below Target'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
