'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Search, Download, CheckCircle, Clock, Calendar, DollarSign, Users, ArrowUp, Percent, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface AnnualIncrement {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  effectiveDate: string;
  financialYear: string;
  currentCTC: number;
  currentBasic: number;
  incrementPercentage: number;
  incrementAmount: number;
  revisedCTC: number;
  revisedBasic: number;
  performanceRating: 'outstanding' | 'excellent' | 'good' | 'average' | 'below';
  status: 'draft' | 'calculated' | 'approved' | 'processed' | 'implemented';
  calculatedDate?: string;
  approvedDate?: string;
  implementedDate?: string;
}

export default function AnnualIncrementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025-26');

  const [increments, setIncrements] = useState<AnnualIncrement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getSalaryRevisions('increment-annual');
        const mapped: AnnualIncrement[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.details?.id ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '—',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          effectiveDate: r.effectiveDate ?? r.effectiveFrom ?? r.details?.effectiveDate ?? '',
          financialYear: r.financialYear ?? r.details?.financialYear ?? '',
          currentCTC: Number(r.currentCTC ?? r.previousCTC ?? r.details?.currentCTC ?? 0),
          currentBasic: Number(r.currentBasic ?? r.details?.currentBasic ?? 0),
          incrementPercentage: Number(r.incrementPercentage ?? r.increasePercentage ?? r.details?.incrementPercentage ?? 0),
          incrementAmount: Number(r.incrementAmount ?? r.increaseAmount ?? r.amount ?? r.details?.incrementAmount ?? 0),
          revisedCTC: Number(r.revisedCTC ?? r.details?.revisedCTC ?? 0),
          revisedBasic: Number(r.revisedBasic ?? r.details?.revisedBasic ?? 0),
          performanceRating: (r.performanceRating ?? r.details?.performanceRating ?? 'good') as AnnualIncrement['performanceRating'],
          status: (r.status ?? r.details?.status ?? 'draft') as AnnualIncrement['status'],
          calculatedDate: r.calculatedDate ?? r.details?.calculatedDate ?? undefined,
          approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
          implementedDate: r.implementedDate ?? r.details?.implementedDate ?? undefined,
        }));
        if (!cancelled) setIncrements(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load increment records');
          setIncrements([]);
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

  const filteredIncrements = useMemo(() => {
    return increments.filter(inc => {
      const matchesSearch =
        inc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || inc.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      const matchesYear = inc.financialYear === selectedYear;
      return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
    });
  }, [increments, searchTerm, selectedDepartment, selectedStatus, selectedYear]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'draft', 'calculated', 'approved', 'processed', 'implemented'];
  const years = ['2025-26', '2024-25', '2023-24'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-purple-100 text-purple-700',
    processed: 'bg-cyan-100 text-cyan-700',
    implemented: 'bg-green-100 text-green-700'
  };

  const statusIcons = {
    draft: Clock,
    calculated: TrendingUp,
    approved: CheckCircle,
    processed: DollarSign,
    implemented: CheckCircle
  };

  const performanceColors = {
    outstanding: 'bg-green-100 text-green-700',
    excellent: 'bg-blue-100 text-blue-700',
    good: 'bg-cyan-100 text-cyan-700',
    average: 'bg-yellow-100 text-yellow-700',
    below: 'bg-red-100 text-red-700'
  };

  const stats = {
    totalEmployees: filteredIncrements.length,
    calculated: filteredIncrements.filter(i => ['calculated', 'approved', 'processed', 'implemented'].includes(i.status)).length,
    approved: filteredIncrements.filter(i => ['approved', 'processed', 'implemented'].includes(i.status)).length,
    implemented: filteredIncrements.filter(i => i.status === 'implemented').length,
    totalIncrementAmount: filteredIncrements.reduce((sum, i) => sum + i.incrementAmount, 0),
    avgIncrementPercent: Math.round(filteredIncrements.reduce((sum, i) => sum + i.incrementPercentage, 0) / filteredIncrements.length * 10) / 10
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Annual Increment</h1>
        <p className="text-sm text-gray-600 mt-1">Yearly salary increment processing for FY {selectedYear}</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading increment records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && increments.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No increment records found.
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
              <p className="text-xs font-medium text-green-700">Implemented</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.implemented}</p>
            </div>
            <ArrowUp className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-700">Total Amount</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.totalIncrementAmount)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700">Avg Increment</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.avgIncrementPercent}%</p>
            </div>
            <Percent className="h-6 w-6 text-yellow-600" />
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
                FY {year}
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
        {filteredIncrements.map(increment => {
          const StatusIcon = statusIcons[increment.status];

          return (
            <div key={increment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{increment.employeeName}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {increment.employeeId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[increment.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {increment.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${performanceColors[increment.performanceRating]}`}>
                      {increment.performanceRating.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {increment.designation} • {increment.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Effective: {new Date(increment.effectiveDate).toLocaleDateString('en-IN')}
                    </span>
                    {increment.approvedDate && (
                      <span>Approved: {new Date(increment.approvedDate).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Increment Amount</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(increment.incrementAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{increment.incrementPercentage}% increase</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">Current Salary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Basic Salary</span>
                      <span className="font-bold text-blue-900">{formatCurrency(increment.currentBasic)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Total CTC</span>
                      <span className="font-medium text-blue-800">{formatCurrency(increment.currentCTC)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">Increment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Percentage</span>
                      <span className="font-bold text-green-900">{increment.incrementPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Amount</span>
                      <span className="font-bold text-green-900">{formatCurrency(increment.incrementAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Revised Salary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Basic Salary</span>
                      <span className="font-bold text-purple-900">{formatCurrency(increment.revisedBasic)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Total CTC</span>
                      <span className="font-medium text-purple-800">{formatCurrency(increment.revisedCTC)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="text-xs font-semibold text-orange-900 mb-3">Status & Dates</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-700">Effective From</span>
                      <span className="font-medium text-orange-900">
                        {new Date(increment.effectiveDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {increment.implementedDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-700">Implemented</span>
                        <span className="font-medium text-orange-800">
                          {new Date(increment.implementedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                {increment.status === 'calculated' && (
                  <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Approve
                  </button>
                )}
                {increment.status === 'approved' && (
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Implement
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Annual Increment Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Increment Percentage (Performance-Based)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Outstanding:</strong> 12-15% of current CTC</li>
              <li>• <strong>Excellent:</strong> 9-12% of current CTC</li>
              <li>• <strong>Good:</strong> 7-9% of current CTC</li>
              <li>• <strong>Average:</strong> 5-7% of current CTC</li>
              <li>• <strong>Below:</strong> 0-5% of current CTC or no increment</li>
              <li>• Increment applied to all salary components proportionally</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Eligibility Criteria</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Minimum 12 months of service completed</li>
              <li>• Should be confirmed employee (probation completed)</li>
              <li>• No major disciplinary issues in the year</li>
              <li>• Attendance above 90%</li>
              <li>• Based on annual performance appraisal rating</li>
              <li>• Pro-rated for mid-year promotions or transfers</li>
            </ul>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Effective Date:</strong> Usually April 1st (start of financial year)</li>
          <li>• <strong>Performance Review:</strong> Based on previous year's performance (Apr-Mar)</li>
          <li>• <strong>Appraisal Cycle:</strong> Annual appraisals conducted in Feb-Mar for Apr implementation</li>
          <li>• <strong>Budget Allocation:</strong> Overall increment budget typically 8-10% of total salary cost</li>
          <li>• <strong>Market Adjustment:</strong> Additional adjustments may be made based on market rates and retention needs</li>
          <li>• <strong>Arrears:</strong> If implementation delayed beyond Apr 1st, arrears paid for the delayed period</li>
          <li>• <strong>Impact:</strong> Increment affects all salary components - basic, HRA, allowances, PF, gratuity calculations</li>
          <li>• <strong>Letter:</strong> Increment letter issued to each employee detailing old and new salary structure</li>
        </ul>
      </div>
    </div>
  );
}
