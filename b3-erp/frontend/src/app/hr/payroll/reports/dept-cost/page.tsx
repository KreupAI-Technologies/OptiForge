'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart3, Search, Download, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface DepartmentCost {
  department: string;
  employeeCount: number;
  totalGross: number;
  totalNet: number;
  totalPF: number;
  totalESI: number;
  totalPT: number;
  totalTDS: number;
  employerPF: number;
  employerESI: number;
  totalCost: number;
  avgCostPerEmployee: number;
  percentageOfTotal: number;
}

export default function DepartmentCostReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [sortBy, setSortBy] = useState<'department' | 'cost' | 'employees'>('cost');

  const [rows, setRows] = useState<DepartmentCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('dept-cost');
        if (!cancelled) {
          const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
            department: r.department ?? r.details?.department ?? '',
            employeeCount: r.details?.employeeCount ?? r.employeeCount ?? 0,
            totalGross: r.details?.totalGross ?? r.totalGross ?? r.amount ?? 0,
            totalNet: r.details?.totalNet ?? r.totalNet ?? 0,
            totalPF: r.details?.totalPF ?? r.totalPF ?? 0,
            totalESI: r.details?.totalESI ?? r.totalESI ?? 0,
            totalPT: r.details?.totalPT ?? r.totalPT ?? 0,
            totalTDS: r.details?.totalTDS ?? r.totalTDS ?? 0,
            employerPF: r.details?.employerPF ?? r.employerPF ?? 0,
            employerESI: r.details?.employerESI ?? r.employerESI ?? 0,
            totalCost: r.details?.totalCost ?? r.totalCost ?? r.amount ?? 0,
            avgCostPerEmployee: r.details?.avgCostPerEmployee ?? r.avgCostPerEmployee ?? 0,
            percentageOfTotal: r.details?.percentageOfTotal ?? r.percentageOfTotal ?? 0,
          } as DepartmentCost));
          setRows(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCosts = useMemo(() => {
    let filtered = rows.filter(cost =>
      cost.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'department') return a.department.localeCompare(b.department);
      if (sortBy === 'cost') return b.totalCost - a.totalCost;
      if (sortBy === 'employees') return b.employeeCount - a.employeeCount;
      return 0;
    });

    return filtered;
  }, [searchTerm, sortBy, rows]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalStats = useMemo(() => {
    return filteredCosts.reduce((acc, dept) => ({
      employees: acc.employees + dept.employeeCount,
      totalGross: acc.totalGross + dept.totalGross,
      totalNet: acc.totalNet + dept.totalNet,
      totalCost: acc.totalCost + dept.totalCost,
      totalPF: acc.totalPF + dept.totalPF + dept.employerPF,
      totalESI: acc.totalESI + dept.totalESI + dept.employerESI
    }), { employees: 0, totalGross: 0, totalNet: 0, totalCost: 0, totalPF: 0, totalESI: 0 });
  }, [filteredCosts]);

  const departmentColors = {
    Production: 'bg-blue-50 border-blue-200',
    Quality: 'bg-green-50 border-green-200',
    Maintenance: 'bg-orange-50 border-orange-200',
    Logistics: 'bg-purple-50 border-purple-200',
    HR: 'bg-pink-50 border-pink-200'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Department Cost Report</h1>
        <p className="text-sm text-gray-600 mt-1">Department-wise payroll cost analysis</p>
        {isLoading && <div className="text-sm text-gray-500 mt-1">Loading…</div>}
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">Department-wise Cost Breakdown</p>
            <p className="text-xs text-gray-500 mt-1">Total Departments: {filteredCosts.length}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.employees}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Gross Salary</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalGross)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Net Payout</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalNet)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Cost</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalCost)}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by department name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="cost">Sort by Cost</option>
            <option value="employees">Sort by Employees</option>
            <option value="department">Sort by Department</option>
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredCosts.map(dept => (
          <div key={dept.department} className={`rounded-lg shadow-sm border p-3 ${departmentColors[dept.department as keyof typeof departmentColors] || 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{dept.department}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {dept.employeeCount} Employees
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    {dept.percentageOfTotal.toFixed(1)}% of Total
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Average Cost per Employee: {formatCurrency(dept.avgCostPerEmployee)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Department Cost</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(dept.totalCost)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Salary Components</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gross Salary</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Net Salary</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalNet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Deductions</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalGross - dept.totalNet)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Employee Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">PF (Employee)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalPF)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">ESI (Employee)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalESI)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">PT</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalPT)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">TDS</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalTDS)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Employer Contributions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">PF (Employer)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.employerPF)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">ESI (Employer)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.employerESI)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-900">Total Contribution</span>
                      <span className="font-bold text-gray-900">{formatCurrency(dept.employerPF + dept.employerESI)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Cost Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gross Salary</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Employer Cost</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.employerPF + dept.employerESI)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-purple-900">Total Cost</span>
                      <span className="font-bold text-purple-900">{formatCurrency(dept.totalCost)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Avg per Employee</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dept.avgCostPerEmployee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-600 mb-1">Employees</p>
                  <p className="text-lg font-bold text-gray-900">{dept.employeeCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Cost per Employee</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(dept.avgCostPerEmployee)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">% of Total Cost</p>
                  <p className="text-lg font-bold text-purple-600">{dept.percentageOfTotal.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Employer Overhead</p>
                  <p className="text-lg font-bold text-orange-600">
                    {(((dept.employerPF + dept.employerESI) / dept.totalGross) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Cost Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-1">Total PF</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(totalStats.totalPF)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs font-medium text-green-700 mb-1">Total ESI</p>
            <p className="text-lg font-bold text-green-900">{formatCurrency(totalStats.totalESI)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">Gross Salary</p>
            <p className="text-lg font-bold text-orange-900">{formatCurrency(totalStats.totalGross)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs font-medium text-purple-700 mb-1">Net Payout</p>
            <p className="text-lg font-bold text-purple-900">{formatCurrency(totalStats.totalNet)}</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
            <p className="text-xs font-medium text-pink-700 mb-1">Total Cost</p>
            <p className="text-lg font-bold text-pink-900">{formatCurrency(totalStats.totalCost)}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p className="text-xs font-medium text-indigo-700 mb-1">Avg Cost/Emp</p>
            <p className="text-lg font-bold text-indigo-900">
              {formatCurrency(Math.round(totalStats.totalCost / totalStats.employees))}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Department Cost Analysis Guidelines</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• <strong>Total Cost:</strong> Includes gross salary + employer PF (12%) + employer ESI (3.0%)</li>
          <li>• <strong>Employer Overhead:</strong> Additional cost beyond gross salary (typically 15-16%)</li>
          <li>• <strong>Cost per Employee:</strong> Average monthly cost per employee in department</li>
          <li>• <strong>Budgeting:</strong> Use for department budget planning and cost optimization</li>
          <li>• <strong>Comparison:</strong> Compare department costs for resource allocation decisions</li>
          <li>• <strong>Trend Analysis:</strong> Track month-over-month cost changes by department</li>
          <li>• <strong>Variance:</strong> Identify departments exceeding budget allocations</li>
        </ul>
      </div>
    </div>
  );
}
