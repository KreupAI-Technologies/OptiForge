'use client';

import { useState, useMemo, useEffect } from 'react';
import { Gift, Search, Download, CheckCircle, Clock, XCircle, Calendar, DollarSign, Users, TrendingUp, Percent, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface AnnualBonus {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  financialYear: string;
  bonusYear: string;
  basicSalary: number;
  totalCTC: number;
  bonusPercentage: number;
  bonusAmount: number;
  eligibleMonths: number;
  attendance: number;
  performanceRating: 'outstanding' | 'excellent' | 'good' | 'average' | 'poor';
  status: 'draft' | 'calculated' | 'approved' | 'processed' | 'paid';
  calculatedDate?: string;
  approvedDate?: string;
  paidDate?: string;
  paymentMode: 'salary' | 'separate';
}

export default function AnnualBonusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');

  const [annualBonus, setAnnualBonus] = useState<AnnualBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getBonusRecords('annual');
        const mapped: AnnualBonus[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.bonusNumber ?? r.id ?? r.details?.bonusNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          financialYear: r.financialYear ?? r.details?.financialYear ?? '',
          bonusYear: String(r.bonusYear ?? r.details?.bonusYear ?? ''),
          basicSalary: Number(r.basicSalary ?? r.details?.basicSalary ?? 0),
          totalCTC: Number(r.totalCTC ?? r.details?.totalCTC ?? 0),
          bonusPercentage: Number(r.bonusPercentage ?? r.details?.bonusPercentage ?? 0),
          bonusAmount: Number(r.bonusAmount ?? r.amount ?? r.details?.bonusAmount ?? 0),
          eligibleMonths: Number(r.eligibleMonths ?? r.details?.eligibleMonths ?? 0),
          attendance: Number(r.attendance ?? r.details?.attendance ?? 0),
          performanceRating: (r.performanceRating ?? r.details?.performanceRating ?? 'good') as AnnualBonus['performanceRating'],
          status: (r.status ?? 'draft') as AnnualBonus['status'],
          calculatedDate: r.calculatedDate ?? r.details?.calculatedDate ?? undefined,
          approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
          paidDate: r.paidDate ?? r.details?.paidDate ?? undefined,
          paymentMode: (r.paymentMode ?? r.details?.paymentMode ?? 'salary') as AnnualBonus['paymentMode'],
        }));
        if (!cancelled) setAnnualBonus(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load annual bonus records');
          setAnnualBonus([]);
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

  const mockAnnualBonus: AnnualBonus[] = [
    {
      id: 'BONUS-2024-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 30000,
      totalCTC: 596700,
      bonusPercentage: 20,
      bonusAmount: 72000,
      eligibleMonths: 12,
      attendance: 98.5,
      performanceRating: 'outstanding',
      status: 'paid',
      calculatedDate: '2024-12-15',
      approvedDate: '2024-12-20',
      paidDate: '2024-12-31',
      paymentMode: 'salary'
    },
    {
      id: 'BONUS-2024-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 21000,
      totalCTC: 431712,
      bonusPercentage: 15,
      bonusAmount: 37800,
      eligibleMonths: 12,
      attendance: 96.2,
      performanceRating: 'excellent',
      status: 'approved',
      calculatedDate: '2024-12-15',
      approvedDate: '2024-12-22',
      paymentMode: 'salary'
    },
    {
      id: 'BONUS-2024-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 13000,
      totalCTC: 262488,
      bonusPercentage: 8.33,
      bonusAmount: 12996,
      eligibleMonths: 12,
      attendance: 94.8,
      performanceRating: 'good',
      status: 'calculated',
      calculatedDate: '2024-12-15',
      paymentMode: 'salary'
    },
    {
      id: 'BONUS-2024-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 20000,
      totalCTC: 409212,
      bonusPercentage: 12,
      bonusAmount: 28800,
      eligibleMonths: 12,
      attendance: 97.3,
      performanceRating: 'excellent',
      status: 'approved',
      calculatedDate: '2024-12-16',
      approvedDate: '2024-12-23',
      paymentMode: 'salary'
    },
    {
      id: 'BONUS-2024-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 19000,
      totalCTC: 379200,
      bonusPercentage: 10,
      bonusAmount: 22800,
      eligibleMonths: 12,
      attendance: 95.5,
      performanceRating: 'good',
      status: 'calculated',
      calculatedDate: '2024-12-16',
      paymentMode: 'salary'
    },
    {
      id: 'BONUS-2024-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      financialYear: '2024-25',
      bonusYear: '2024',
      basicSalary: 19000,
      totalCTC: 394188,
      bonusPercentage: 10,
      bonusAmount: 22800,
      eligibleMonths: 12,
      attendance: 98.1,
      performanceRating: 'excellent',
      status: 'paid',
      calculatedDate: '2024-12-15',
      approvedDate: '2024-12-20',
      paidDate: '2024-12-31',
      paymentMode: 'salary'
    }
  ];

  const filteredBonus = useMemo(() => {
    return annualBonus.filter(bonus => {
      const matchesSearch =
        bonus.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bonus.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || bonus.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || bonus.status === selectedStatus;
      const matchesYear = bonus.bonusYear === selectedYear;
      return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
    });
  }, [annualBonus, searchTerm, selectedDepartment, selectedStatus, selectedYear]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'draft', 'calculated', 'approved', 'processed', 'paid'];
  const years = ['2024', '2023', '2022'];

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
    outstanding: 'bg-green-100 text-green-700',
    excellent: 'bg-blue-100 text-blue-700',
    good: 'bg-cyan-100 text-cyan-700',
    average: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-red-100 text-red-700'
  };

  const stats = {
    totalEmployees: filteredBonus.length,
    calculated: filteredBonus.filter(b => ['calculated', 'approved', 'processed', 'paid'].includes(b.status)).length,
    approved: filteredBonus.filter(b => ['approved', 'processed', 'paid'].includes(b.status)).length,
    paid: filteredBonus.filter(b => b.status === 'paid').length,
    totalBonusAmount: filteredBonus.reduce((sum, b) => sum + b.bonusAmount, 0),
    paidAmount: filteredBonus.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.bonusAmount, 0)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Annual Bonus</h1>
        <p className="text-sm text-gray-600 mt-1">Yearly bonus calculation and processing for {selectedYear}</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading annual bonus records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && annualBonus.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No annual bonus records found.
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

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-700">Calculated</p>
              <p className="text-2xl font-bold text-cyan-900 mt-1">{stats.calculated}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-cyan-600" />
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

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Paid</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.paid}</p>
            </div>
            <Gift className="h-6 w-6 text-green-600" />
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

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow-sm border border-emerald-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Paid Amount</p>
              <p className="text-lg font-bold text-emerald-900 mt-1">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-600" />
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
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>
                Year {year}
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${performanceColors[bonus.performanceRating]}`}>
                      {bonus.performanceRating.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {bonus.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {bonus.designation} • {bonus.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      FY: {bonus.financialYear}
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
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(bonus.bonusAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{bonus.bonusPercentage}% of Annual Basic</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">Salary Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Monthly Basic</span>
                      <span className="font-bold text-blue-900">{formatCurrency(bonus.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Annual Basic</span>
                      <span className="font-medium text-blue-800">{formatCurrency(bonus.basicSalary * 12)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Total CTC</span>
                      <span className="font-medium text-blue-800">{formatCurrency(bonus.totalCTC)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">Bonus Calculation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Bonus Percentage</span>
                      <span className="font-bold text-green-900">{bonus.bonusPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Eligible Months</span>
                      <span className="font-medium text-green-800">{bonus.eligibleMonths}/12</span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-green-900">Bonus Amount</span>
                        <span className="font-bold text-green-900">{formatCurrency(bonus.bonusAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Performance & Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Performance Rating</span>
                      <span className="font-bold text-purple-900">{bonus.performanceRating.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Attendance</span>
                      <span className="font-medium text-purple-800">{bonus.attendance}%</span>
                    </div>
                    <div className="pt-2 border-t border-purple-300">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${bonus.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="text-xs font-semibold text-orange-900 mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-700">Payment Mode</span>
                      <span className="font-medium text-orange-900">{bonus.paymentMode === 'salary' ? 'With Salary' : 'Separate'}</span>
                    </div>
                    {bonus.approvedDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Approved Date</span>
                        <span className="font-medium text-orange-800">
                          {new Date(bonus.approvedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {bonus.paidDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Paid Date</span>
                        <span className="font-medium text-orange-800">
                          {new Date(bonus.paidDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {!bonus.paidDate && bonus.status !== 'draft' && (
                      <p className="text-xs text-orange-600 pt-2">
                        {bonus.status === 'calculated' && 'Awaiting approval'}
                        {bonus.status === 'approved' && 'Ready for payment'}
                        {bonus.status === 'processed' && 'Payment in progress'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                {bonus.status === 'calculated' && (
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
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Annual Bonus Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Bonus Percentage (Performance-Based)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Outstanding:</strong> 15-20% of annual basic salary</li>
              <li>• <strong>Excellent:</strong> 12-15% of annual basic salary</li>
              <li>• <strong>Good:</strong> 8-12% of annual basic salary</li>
              <li>• <strong>Average:</strong> 5-8% of annual basic salary</li>
              <li>• <strong>Poor:</strong> 0-5% of annual basic salary</li>
              <li>• Minimum statutory bonus: 8.33% (as per Payment of Bonus Act)</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Eligibility Criteria</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Minimum 12 months of continuous service</li>
              <li>• Must have worked at least 240 days in the year</li>
              <li>• Attendance should be above 90%</li>
              <li>• No major disciplinary actions in the year</li>
              <li>• Applicable to all employees (excludes contractors)</li>
              <li>• Pro-rated for employees who joined mid-year</li>
            </ul>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Calculation Base:</strong> Annual basic salary (excludes allowances, overtime, incentives)</li>
          <li>• <strong>Performance Review:</strong> Based on annual appraisal ratings (KRA achievement, behavior, attendance)</li>
          <li>• <strong>Statutory Bonus:</strong> As per Payment of Bonus Act, 1965 - minimum 8.33%, maximum 20% of annual basic (up to ₹7,000 ceiling)</li>
          <li>• <strong>Ex-gratia Bonus:</strong> Company may pay additional bonus beyond statutory requirements based on profitability</li>
          <li>• <strong>Payment Timeline:</strong> Usually paid in December/January with salary or as separate payment</li>
          <li>• <strong>Tax Treatment:</strong> Fully taxable as salary income, TDS applicable as per employee's tax slab</li>
          <li>• <strong>Pro-rata Calculation:</strong> For employees who left mid-year, bonus calculated proportionately (months worked/12)</li>
          <li>• <strong>Company Profitability:</strong> Bonus payment subject to company achieving minimum profit targets</li>
        </ul>
      </div>
    </div>
  );
}
