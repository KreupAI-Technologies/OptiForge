'use client';

import { useState, useMemo, useEffect } from 'react';
import { Building, Download, TrendingUp, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { HrPagesService } from '@/services/hr-pages.service';

interface DepartmentExpense {
  department: string;
  headCount: number;
  totalExpenses: number;
  travelExpenses: number;
  accommodationExpenses: number;
  mealsExpenses: number;
  suppliesExpenses: number;
  communicationExpenses: number;
  otherExpenses: number;
  avgPerEmployee: number;
  topSpender: string;
  topSpenderAmount: number;
}

export default function DepartmentExpensesPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [sortBy, setSortBy] = useState<'total' | 'perEmployee'>('total');
  const [departmentData, setDepartmentData] = useState<DepartmentExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.expenseClaims()) as any[];
        const mapped: DepartmentExpense[] = (Array.isArray(raw) ? raw : []).map((r) => {
          const headCount = Number(r.headCount ?? r.employeeCount ?? 0);
          const totalExpenses = Number(r.totalExpenses ?? r.totalAmount ?? r.amount ?? 0);
          return {
            department: r.department ?? r.departmentName ?? r.name ?? '',
            headCount,
            totalExpenses,
            travelExpenses: Number(r.travelExpenses ?? r.travel ?? 0),
            accommodationExpenses: Number(r.accommodationExpenses ?? r.accommodation ?? 0),
            mealsExpenses: Number(r.mealsExpenses ?? r.meals ?? 0),
            suppliesExpenses: Number(r.suppliesExpenses ?? r.supplies ?? 0),
            communicationExpenses: Number(r.communicationExpenses ?? r.communication ?? 0),
            otherExpenses: Number(r.otherExpenses ?? r.other ?? 0),
            avgPerEmployee: Number(
              r.avgPerEmployee ?? (headCount > 0 ? Math.round(totalExpenses / headCount) : 0),
            ),
            topSpender: r.topSpender ?? '',
            topSpenderAmount: Number(r.topSpenderAmount ?? 0),
          };
        });
        if (!cancelled) setDepartmentData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load department expenses');
          setDepartmentData([]);
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

  const sortedData = useMemo(() => {
    return [...departmentData].sort((a, b) => {
      if (sortBy === 'total') {
        return b.totalExpenses - a.totalExpenses;
      }
      return b.avgPerEmployee - a.avgPerEmployee;
    });
  }, [sortBy]);

  const totals = useMemo(() => {
    return departmentData.reduce(
      (acc, dept) => ({
        headCount: acc.headCount + dept.headCount,
        totalExpenses: acc.totalExpenses + dept.totalExpenses,
        travelExpenses: acc.travelExpenses + dept.travelExpenses,
        accommodationExpenses: acc.accommodationExpenses + dept.accommodationExpenses,
        mealsExpenses: acc.mealsExpenses + dept.mealsExpenses,
        suppliesExpenses: acc.suppliesExpenses + dept.suppliesExpenses,
        communicationExpenses: acc.communicationExpenses + dept.communicationExpenses,
        otherExpenses: acc.otherExpenses + dept.otherExpenses
      }),
      {
        headCount: 0,
        totalExpenses: 0,
        travelExpenses: 0,
        accommodationExpenses: 0,
        mealsExpenses: 0,
        suppliesExpenses: 0,
        communicationExpenses: 0,
        otherExpenses: 0
      }
    );
  }, []);

  const avgPerEmployee = totals.headCount > 0 ? Math.round(totals.totalExpenses / totals.headCount) : 0;

  const handleExportToExcel = () => {
    try {
      const exportData = sortedData.map(dept => ({
        'Department': dept.department,
        'Head Count': dept.headCount,
        'Total Expenses': dept.totalExpenses,
        'Travel': dept.travelExpenses,
        'Accommodation': dept.accommodationExpenses,
        'Meals': dept.mealsExpenses,
        'Supplies': dept.suppliesExpenses,
        'Communication': dept.communicationExpenses,
        'Other': dept.otherExpenses,
        'Avg Per Employee': dept.avgPerEmployee,
        'Top Spender': dept.topSpender,
        'Top Spender Amount': dept.topSpenderAmount
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 18 },
        { wch: 20 }, { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Department Expenses');
      XLSX.writeFile(wb, `Department_Expenses_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: `Department expenses for ${selectedYear} exported successfully`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export department expenses",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-7 w-7 text-purple-600" />
            Department Expenses
          </h1>
          <p className="text-sm text-gray-600 mt-1">Department-wise expense breakdown and analysis</p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700">Total Expenses</p>
            <DollarSign className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-900">₹{(totals.totalExpenses / 10000000).toFixed(2)}Cr</p>
          <p className="text-xs text-purple-600 mt-1">All departments</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Departments</p>
            <Building className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{departmentData.length}</p>
          <p className="text-xs text-blue-600 mt-1">Active departments</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Total Employees</p>
            <Users className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900">{totals.headCount}</p>
          <p className="text-xs text-green-600 mt-1">Across all departments</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-700">Avg Per Employee</p>
            <TrendingUp className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-900">₹{(avgPerEmployee / 1000).toFixed(1)}k</p>
          <p className="text-xs text-orange-600 mt-1">Company average</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Quarters</option>
              <option value="q1">Q1 (Apr-Jun)</option>
              <option value="q2">Q2 (Jul-Sep)</option>
              <option value="q3">Q3 (Oct-Dec)</option>
              <option value="q4">Q4 (Jan-Mar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'total' | 'perEmployee')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="total">Total Expenses</option>
              <option value="perEmployee">Per Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="space-y-2 mb-3">
        {sortedData.map((dept) => (
          <div key={dept.department} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                  <p className="text-sm text-gray-500">{dept.headCount} employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{(dept.totalExpenses / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-500">₹{(dept.avgPerEmployee / 1000).toFixed(1)}k per employee</p>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 mb-1">Travel</p>
                <p className="text-sm font-semibold text-blue-900">₹{(dept.travelExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-blue-600">{Math.round((dept.travelExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-700 mb-1">Accommodation</p>
                <p className="text-sm font-semibold text-purple-900">₹{(dept.accommodationExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-purple-600">{Math.round((dept.accommodationExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-700 mb-1">Meals</p>
                <p className="text-sm font-semibold text-green-900">₹{(dept.mealsExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-green-600">{Math.round((dept.mealsExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-700 mb-1">Supplies</p>
                <p className="text-sm font-semibold text-orange-900">₹{(dept.suppliesExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-orange-600">{Math.round((dept.suppliesExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-700 mb-1">Communication</p>
                <p className="text-sm font-semibold text-indigo-900">₹{(dept.communicationExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-indigo-600">{Math.round((dept.communicationExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 mb-1">Other</p>
                <p className="text-sm font-semibold text-gray-900">₹{(dept.otherExpenses / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-600">{Math.round((dept.otherExpenses / dept.totalExpenses) * 100)}%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-700 mb-1">Top Spender</p>
                <p className="text-xs font-medium text-yellow-900 truncate">{dept.topSpender}</p>
                <p className="text-xs text-yellow-600">₹{(dept.topSpenderAmount / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Expense Category Comparison
        </h2>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Travel</span>
              <span className="text-sm font-semibold text-gray-900">₹{(totals.travelExpenses / 100000).toFixed(1)}L</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${(totals.travelExpenses / totals.totalExpenses) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Accommodation</span>
              <span className="text-sm font-semibold text-gray-900">₹{(totals.accommodationExpenses / 100000).toFixed(1)}L</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full"
                style={{ width: `${(totals.accommodationExpenses / totals.totalExpenses) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Supplies</span>
              <span className="text-sm font-semibold text-gray-900">₹{(totals.suppliesExpenses / 100000).toFixed(1)}L</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full"
                style={{ width: `${(totals.suppliesExpenses / totals.totalExpenses) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Communication</span>
              <span className="text-sm font-semibold text-gray-900">₹{(totals.communicationExpenses / 100000).toFixed(1)}L</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-500 h-3 rounded-full"
                style={{ width: `${(totals.communicationExpenses / totals.totalExpenses) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Meals</span>
              <span className="text-sm font-semibold text-gray-900">₹{(totals.mealsExpenses / 100000).toFixed(1)}L</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${(totals.mealsExpenses / totals.totalExpenses) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
