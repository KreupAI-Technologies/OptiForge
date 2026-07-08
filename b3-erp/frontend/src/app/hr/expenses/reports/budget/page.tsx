'use client';

import { useState, useMemo, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, Download, Calendar, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { HrPagesService } from '@/services/hr-pages.service';

interface DepartmentBudget {
  department: string;
  budgetAmount: number;
  spentAmount: number;
  pendingAmount: number;
  availableAmount: number;
  utilizationPercent: number;
  categoryBreakdown: {
    category: string;
    spent: number;
    budget: number;
  }[];
}

export default function BudgetReportPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [budgetData, setBudgetData] = useState<DepartmentBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.expenseBudgets<any[]>();
        const mapped: DepartmentBudget[] = (raw || []).map((b) => {
          const budget = Number(b.budgetAmount ?? 0);
          const spent = Number(b.spentAmount ?? 0);
          const pending = Number(b.pendingAmount ?? 0);
          const available = Number(b.availableAmount ?? budget - spent - pending);
          const util = Number(
            b.utilizationPercent ?? (budget > 0 ? Math.round((spent / budget) * 100) : 0),
          );
          const breakdown = Array.isArray(b.categoryBreakdown)
            ? b.categoryBreakdown.map((c: any) => ({
                category: c.category ?? '',
                spent: Number(c.spent ?? 0),
                budget: Number(c.budget ?? 0),
              }))
            : [];
          return {
            department: b.department ?? '',
            budgetAmount: budget,
            spentAmount: spent,
            pendingAmount: pending,
            availableAmount: available,
            utilizationPercent: util,
            categoryBreakdown: breakdown,
          };
        });
        if (!cancelled) setBudgetData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load expense budgets');
          setBudgetData([]);
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

  const filteredData = useMemo(() => {
    if (selectedDepartment === 'all') {
      return budgetData;
    }
    return budgetData.filter(d => d.department === selectedDepartment);
  }, [selectedDepartment, budgetData]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, dept) => ({
        budget: acc.budget + dept.budgetAmount,
        spent: acc.spent + dept.spentAmount,
        pending: acc.pending + dept.pendingAmount,
        available: acc.available + dept.availableAmount
      }),
      { budget: 0, spent: 0, pending: 0, available: 0 }
    );
  }, [filteredData]);

  const overallUtilization = totals.budget > 0
    ? Math.round(((totals.spent + totals.pending) / totals.budget) * 100)
    : 0;

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-orange-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-100 border-red-300';
    if (percent >= 75) return 'bg-orange-100 border-orange-300';
    if (percent >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const handleExportToExcel = () => {
    try {
      // Summary sheet
      const summaryData = filteredData.map(dept => ({
        'Department': dept.department,
        'Budget Amount': dept.budgetAmount,
        'Spent Amount': dept.spentAmount,
        'Pending Amount': dept.pendingAmount,
        'Available Amount': dept.availableAmount,
        'Utilization %': dept.utilizationPercent
      }));

      // Category breakdown sheet
      const categoryData: any[] = [];
      filteredData.forEach(dept => {
        dept.categoryBreakdown.forEach(cat => {
          categoryData.push({
            'Department': dept.department,
            'Category': cat.category,
            'Budget': cat.budget,
            'Spent': cat.spent,
            'Available': cat.budget - cat.spent,
            'Utilization %': Math.round((cat.spent / cat.budget) * 100)
          });
        });
      });

      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(summaryData);
      const ws2 = XLSX.utils.json_to_sheet(categoryData);

      // Set column widths
      ws1['!cols'] = [
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
      ];
      ws2['!cols'] = [
        { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, ws1, 'Department Summary');
      XLSX.utils.book_append_sheet(wb, ws2, 'Category Breakdown');

      XLSX.writeFile(wb, `Budget_Report_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: `Budget report for ${selectedYear} exported successfully`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export budget report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="h-7 w-7 text-purple-600" />
            Budget vs Actual
          </h1>
          <p className="text-sm text-gray-600 mt-1">Department-wise budget utilization analysis</p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading budget data…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700">Total Budget</p>
            <PieChart className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-900">₹{(totals.budget / 100000).toFixed(1)}L</p>
          <p className="text-xs text-purple-600 mt-1">{filteredData.length} departments</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Total Spent</p>
            <TrendingDown className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-900">₹{(totals.spent / 100000).toFixed(1)}L</p>
          <p className="text-xs text-blue-600 mt-1">{Math.round((totals.spent / totals.budget) * 100)}% of budget</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-700">Pending</p>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-900">₹{(totals.pending / 100000).toFixed(1)}L</p>
          <p className="text-xs text-orange-600 mt-1">{Math.round((totals.pending / totals.budget) * 100)}% of budget</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Available</p>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-900">₹{(totals.available / 100000).toFixed(1)}L</p>
          <p className="text-xs text-green-600 mt-1">{Math.round((totals.available / totals.budget) * 100)}% remaining</p>
        </div>

        <div className={`bg-gradient-to-br rounded-lg shadow-sm border p-3 ${getUtilizationBgColor(overallUtilization)}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Utilization</p>
            <Calendar className="h-8 w-8 opacity-40" />
          </div>
          <p className={`text-3xl font-bold ${getUtilizationColor(overallUtilization)}`}>{overallUtilization}%</p>
          <p className="text-xs mt-1 opacity-75">Overall budget usage</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={currentYear}>{currentYear}-{String(currentYear + 1).slice(2)}</option>
              <option value={currentYear - 1}>{currentYear - 1}-{String(currentYear).slice(2)}</option>
              <option value={currentYear - 2}>{currentYear - 2}-{String(currentYear - 1).slice(2)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Quarters</option>
              <option value="q1">Q1 (Apr-Jun)</option>
              <option value="q2">Q2 (Jul-Sep)</option>
              <option value="q3">Q3 (Oct-Dec)</option>
              <option value="q4">Q4 (Jan-Mar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {budgetData.map(dept => (
                <option key={dept.department} value={dept.department}>{dept.department}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Department Budget Cards */}
      <div className="space-y-2">
        {filteredData.map((dept) => (
          <div key={dept.department} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                <p className="text-sm text-gray-500">Budget Utilization</p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${getUtilizationBgColor(dept.utilizationPercent)}`}>
                <p className={`text-2xl font-bold ${getUtilizationColor(dept.utilizationPercent)}`}>
                  {dept.utilizationPercent}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Spent: ₹{dept.spentAmount.toLocaleString('en-IN')}</span>
                <span>Budget: ₹{dept.budgetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(dept.spentAmount / dept.budgetAmount) * 100}%` }}
                  >
                    {dept.spentAmount > dept.budgetAmount * 0.1 && 'Spent'}
                  </div>
                  <div
                    className="bg-orange-400 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(dept.pendingAmount / dept.budgetAmount) * 100}%` }}
                  >
                    {dept.pendingAmount > dept.budgetAmount * 0.05 && 'Pending'}
                  </div>
                  <div
                    className="bg-green-400 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(dept.availableAmount / dept.budgetAmount) * 100}%` }}
                  >
                    {dept.availableAmount > dept.budgetAmount * 0.1 && 'Available'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spent: ₹{(dept.spentAmount / 1000).toFixed(0)}k</span>
                <span>Pending: ₹{(dept.pendingAmount / 1000).toFixed(0)}k</span>
                <span>Available: ₹{(dept.availableAmount / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dept.categoryBreakdown.map((cat) => {
                  const catUtilization = Math.round((cat.spent / cat.budget) * 100);
                  return (
                    <div key={cat.category} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                        <span className={`text-sm font-semibold ${getUtilizationColor(catUtilization)}`}>
                          {catUtilization}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-full rounded-full ${
                            catUtilization >= 90 ? 'bg-red-500' :
                            catUtilization >= 75 ? 'bg-orange-500' :
                            catUtilization >= 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(catUtilization, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>₹{(cat.spent / 1000).toFixed(0)}k / ₹{(cat.budget / 1000).toFixed(0)}k</span>
                        <span>₹{((cat.budget - cat.spent) / 1000).toFixed(0)}k left</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Budget Utilization Guidelines</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-700">0-59%: Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-700">60-74%: Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-gray-700">75-89%: High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-700">90%+: Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
