'use client';

import { useState, useMemo, useEffect } from 'react';
import { Award, Search, Download, CheckCircle, Clock, Target, Calendar, DollarSign, Users, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface PerformanceBonus {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  quarter: string;
  financialYear: string;
  kpiTarget: number;
  kpiAchieved: number;
  achievementPercent: number;
  bonusEligibility: boolean;
  bonusPercentage: number;
  bonusAmount: number;
  basicSalary: number;
  performanceCategory: 'exceptional' | 'high' | 'meets' | 'below' | 'poor';
  status: 'draft' | 'calculated' | 'approved' | 'processed' | 'paid';
  calculatedDate?: string;
  approvedDate?: string;
  paidDate?: string;
  kpiMetrics: {
    production: number;
    quality: number;
    safety: number;
    efficiency: number;
  };
}

export default function PerformanceBonusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('Q3-2024-25');

  const [performanceBonus, setPerformanceBonus] = useState<PerformanceBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getBonusRecords('performance');
        const mapped: PerformanceBonus[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.details?.id ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '—',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          quarter: r.quarter ?? r.details?.quarter ?? '',
          financialYear: r.financialYear ?? r.details?.financialYear ?? '',
          kpiTarget: Number(r.kpiTarget ?? r.details?.kpiTarget ?? 0),
          kpiAchieved: Number(r.kpiAchieved ?? r.details?.kpiAchieved ?? 0),
          achievementPercent: Number(r.achievementPercent ?? r.details?.achievementPercent ?? 0),
          bonusEligibility: Boolean(r.bonusEligibility ?? r.details?.bonusEligibility ?? false),
          bonusPercentage: Number(r.bonusPercentage ?? r.details?.bonusPercentage ?? 0),
          bonusAmount: Number(r.bonusAmount ?? r.amount ?? r.details?.bonusAmount ?? 0),
          basicSalary: Number(r.basicSalary ?? r.details?.basicSalary ?? 0),
          performanceCategory: (r.performanceCategory ?? r.details?.performanceCategory ?? 'meets') as PerformanceBonus['performanceCategory'],
          status: (r.status ?? r.details?.status ?? 'draft') as PerformanceBonus['status'],
          calculatedDate: r.calculatedDate ?? r.details?.calculatedDate ?? undefined,
          approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
          paidDate: r.paidDate ?? r.details?.paidDate ?? undefined,
          kpiMetrics: {
            production: Number(r.kpiMetrics?.production ?? r.details?.kpiMetrics?.production ?? 0),
            quality: Number(r.kpiMetrics?.quality ?? r.details?.kpiMetrics?.quality ?? 0),
            safety: Number(r.kpiMetrics?.safety ?? r.details?.kpiMetrics?.safety ?? 0),
            efficiency: Number(r.kpiMetrics?.efficiency ?? r.details?.kpiMetrics?.efficiency ?? 0),
          },
        }));
        if (!cancelled) setPerformanceBonus(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load performance bonus records');
          setPerformanceBonus([]);
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

  const mockPerformanceBonus: PerformanceBonus[] = [
    {
      id: 'PB-Q3-2025-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 118,
      achievementPercent: 118,
      bonusEligibility: true,
      bonusPercentage: 25,
      bonusAmount: 18750,
      basicSalary: 30000,
      performanceCategory: 'exceptional',
      status: 'paid',
      calculatedDate: '2024-12-28',
      approvedDate: '2024-12-30',
      paidDate: '2025-01-05',
      kpiMetrics: {
        production: 120,
        quality: 115,
        safety: 118,
        efficiency: 119
      }
    },
    {
      id: 'PB-Q3-2025-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 108,
      achievementPercent: 108,
      bonusEligibility: true,
      bonusPercentage: 15,
      bonusAmount: 9450,
      basicSalary: 21000,
      performanceCategory: 'high',
      status: 'approved',
      calculatedDate: '2024-12-28',
      approvedDate: '2024-12-31',
      kpiMetrics: {
        production: 105,
        quality: 112,
        safety: 110,
        efficiency: 105
      }
    },
    {
      id: 'PB-Q3-2025-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 98,
      achievementPercent: 98,
      bonusEligibility: true,
      bonusPercentage: 5,
      bonusAmount: 1950,
      basicSalary: 13000,
      performanceCategory: 'meets',
      status: 'calculated',
      calculatedDate: '2024-12-28',
      kpiMetrics: {
        production: 95,
        quality: 100,
        safety: 98,
        efficiency: 99
      }
    },
    {
      id: 'PB-Q3-2025-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 112,
      achievementPercent: 112,
      bonusEligibility: true,
      bonusPercentage: 20,
      bonusAmount: 12000,
      basicSalary: 20000,
      performanceCategory: 'high',
      status: 'approved',
      calculatedDate: '2024-12-29',
      approvedDate: '2024-12-31',
      kpiMetrics: {
        production: 110,
        quality: 108,
        safety: 115,
        efficiency: 115
      }
    },
    {
      id: 'PB-Q3-2025-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 88,
      achievementPercent: 88,
      bonusEligibility: false,
      bonusPercentage: 0,
      bonusAmount: 0,
      basicSalary: 19000,
      performanceCategory: 'below',
      status: 'calculated',
      calculatedDate: '2024-12-29',
      kpiMetrics: {
        production: 85,
        quality: 90,
        safety: 92,
        efficiency: 85
      }
    },
    {
      id: 'PB-Q3-2025-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      quarter: 'Q3-2024-25',
      financialYear: '2024-25',
      kpiTarget: 100,
      kpiAchieved: 103,
      achievementPercent: 103,
      bonusEligibility: true,
      bonusPercentage: 10,
      bonusAmount: 5700,
      basicSalary: 19000,
      performanceCategory: 'high',
      status: 'paid',
      calculatedDate: '2024-12-28',
      approvedDate: '2024-12-30',
      paidDate: '2025-01-05',
      kpiMetrics: {
        production: 100,
        quality: 105,
        safety: 102,
        efficiency: 105
      }
    }
  ];

  const filteredBonus = useMemo(() => {
    return performanceBonus.filter(bonus => {
      const matchesSearch =
        bonus.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bonus.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || bonus.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || bonus.status === selectedStatus;
      const matchesQuarter = bonus.quarter === selectedQuarter;
      return matchesSearch && matchesDepartment && matchesStatus && matchesQuarter;
    });
  }, [performanceBonus, searchTerm, selectedDepartment, selectedStatus, selectedQuarter]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'draft', 'calculated', 'approved', 'processed', 'paid'];
  const quarters = ['Q3-2024-25', 'Q2-2024-25', 'Q1-2024-25', 'Q4-2023-24'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-purple-100 text-purple-700',
    processed: 'bg-cyan-100 text-cyan-700',
    paid: 'bg-green-100 text-green-700'
  };

  const statusIcons = {
    draft: Clock,
    calculated: TrendingUp,
    approved: CheckCircle,
    processed: DollarSign,
    paid: CheckCircle
  };

  const performanceColors = {
    exceptional: 'bg-green-100 text-green-700',
    high: 'bg-blue-100 text-blue-700',
    meets: 'bg-cyan-100 text-cyan-700',
    below: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-red-100 text-red-700'
  };

  const stats = {
    totalEmployees: filteredBonus.length,
    eligible: filteredBonus.filter(b => b.bonusEligibility).length,
    approved: filteredBonus.filter(b => ['approved', 'processed', 'paid'].includes(b.status)).length,
    paid: filteredBonus.filter(b => b.status === 'paid').length,
    totalBonusAmount: filteredBonus.reduce((sum, b) => sum + b.bonusAmount, 0),
    avgAchievement: Math.round(filteredBonus.reduce((sum, b) => sum + b.achievementPercent, 0) / filteredBonus.length)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Performance Bonus</h1>
        <p className="text-sm text-gray-600 mt-1">Quarterly KPI-based performance bonus for {selectedQuarter}</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading performance bonus records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && performanceBonus.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No performance bonus records found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEmployees}</p>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Eligible</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.eligible}</p>
            </div>
            <Target className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Approved</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-700">Paid</p>
              <p className="text-2xl font-bold text-cyan-900 mt-1">{stats.paid}</p>
            </div>
            <Award className="h-6 w-6 text-cyan-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">Total Bonus</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.totalBonusAmount)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700">Avg Achievement</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.avgAchievement}%</p>
            </div>
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {quarters.map(qtr => (
              <option key={qtr} value={qtr}>
                {qtr}
              </option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.toUpperCase()}
              </option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredBonus.map(bonus => {
          const StatusIcon = statusIcons[bonus.status];

          return (
            <div key={bonus.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{bonus.employeeName}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {bonus.employeeId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[bonus.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {bonus.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${performanceColors[bonus.performanceCategory]}`}>
                      {bonus.performanceCategory.toUpperCase()}
                    </span>
                    {bonus.bonusEligibility ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        ELIGIBLE
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        NOT ELIGIBLE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {bonus.designation} • {bonus.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Quarter: {bonus.quarter}
                    </span>
                    {bonus.calculatedDate && (
                      <span>Calculated: {new Date(bonus.calculatedDate).toLocaleDateString('en-IN')}</span>
                    )}
                    {bonus.paidDate && (
                      <span>Paid: {new Date(bonus.paidDate).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Bonus Amount</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(bonus.bonusAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">KPI: {bonus.achievementPercent}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">KPI Achievement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Target</span>
                      <span className="font-bold text-blue-900">{bonus.kpiTarget}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Achieved</span>
                      <span className="font-bold text-blue-900">{bonus.kpiAchieved}%</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${bonus.achievementPercent >= 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(bonus.achievementPercent, 150)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-700 mt-1 text-center font-bold">
                        {bonus.achievementPercent}% Achievement
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">KPI Metrics Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Production</span>
                      <span className="font-medium text-green-900">{bonus.kpiMetrics.production}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Quality</span>
                      <span className="font-medium text-green-900">{bonus.kpiMetrics.quality}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Safety</span>
                      <span className="font-medium text-green-900">{bonus.kpiMetrics.safety}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Efficiency</span>
                      <span className="font-medium text-green-900">{bonus.kpiMetrics.efficiency}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Bonus Calculation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Basic Salary</span>
                      <span className="font-bold text-purple-900">{formatCurrency(bonus.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Bonus %</span>
                      <span className="font-medium text-purple-800">{bonus.bonusPercentage}%</span>
                    </div>
                    <div className="pt-2 border-t border-purple-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-purple-900">Bonus Amount</span>
                        <span className="font-bold text-purple-900">{formatCurrency(bonus.bonusAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="text-xs font-semibold text-orange-900 mb-3">Payment Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-700">Eligibility</span>
                      <span className={`font-bold ${bonus.bonusEligibility ? 'text-green-700' : 'text-red-700'}`}>
                        {bonus.bonusEligibility ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {bonus.approvedDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Approved</span>
                        <span className="font-medium text-orange-800">
                          {new Date(bonus.approvedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {bonus.paidDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Paid</span>
                        <span className="font-medium text-orange-800">
                          {new Date(bonus.paidDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {!bonus.bonusEligibility && (
                      <p className="text-xs text-red-600 pt-2">
                        Achievement below minimum threshold (90%)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View KPI Details
                </button>
                {bonus.status === 'calculated' && bonus.bonusEligibility && (
                  <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Approve
                  </button>
                )}
                {bonus.status === 'approved' && (
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Performance Bonus Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Bonus Percentage (Achievement-Based)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Exceptional (115%+):</strong> 25-30% of quarterly basic salary</li>
              <li>• <strong>High (105-114%):</strong> 15-20% of quarterly basic salary</li>
              <li>• <strong>Meets (95-104%):</strong> 5-10% of quarterly basic salary</li>
              <li>• <strong>Below (90-94%):</strong> 0-5% of quarterly basic salary</li>
              <li>• <strong>Poor (Below 90%):</strong> No bonus eligible</li>
              <li>• Bonus calculated on 3-month basic salary</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">KPI Measurement Criteria</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Production:</strong> Output targets vs actual production</li>
              <li>• <strong>Quality:</strong> Defect rate, rework percentage, customer complaints</li>
              <li>• <strong>Safety:</strong> Incident rate, near-miss reports, compliance score</li>
              <li>• <strong>Efficiency:</strong> Resource utilization, downtime reduction, cost savings</li>
              <li>• All KPIs weighted equally (25% each)</li>
              <li>• Minimum 90% overall achievement required for eligibility</li>
            </ul>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Calculation Period:</strong> Quarterly assessment (Apr-Jun, Jul-Sep, Oct-Dec, Jan-Mar)</li>
          <li>• <strong>Eligibility:</strong> All confirmed employees who completed minimum 3 months in the quarter</li>
          <li>• <strong>KPI Setting:</strong> Individual KPIs set at beginning of quarter based on role and department goals</li>
          <li>• <strong>Mid-Quarter Review:</strong> Progress review conducted at 6 weeks to identify performance gaps</li>
          <li>• <strong>Assessment:</strong> Manager evaluation + departmental metrics + peer feedback (if applicable)</li>
          <li>• <strong>Payment Timeline:</strong> Bonus paid in first month of next quarter (within 30 days of quarter end)</li>
          <li>• <strong>Pro-rata:</strong> New joiners eligible for pro-rata bonus if joined before mid-quarter</li>
          <li>• <strong>Disciplinary Impact:</strong> Major violations may result in bonus forfeiture regardless of KPI achievement</li>
          <li>• <strong>Tax Treatment:</strong> Performance bonus fully taxable as salary income</li>
        </ul>
      </div>
    </div>
  );
}
