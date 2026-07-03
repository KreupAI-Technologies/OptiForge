'use client';

import { useState, useMemo, useEffect } from 'react';
import { Gift, CheckCircle, Clock, IndianRupee, Info } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface FNFGratuity {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  joiningDate: string;
  yearsOfService: number;
  monthsOfService: number;
  daysOfService: number;
  lastDrawnBasic: number;
  lastDrawnDA: number;
  lastDrawnSalary: number;
  isEligible: boolean;
  gratuityFormula: 'standard' | 'seasonal';
  gratuityAmount: number;
  maxGratuityCap: number;
  finalGratuityAmount: number;
  status: 'pending' | 'calculated' | 'approved' | 'processed';
  calculatedBy?: string;
  calculatedOn?: string;
  approvedBy?: string;
  remarks?: string;
}

export default function FNFGratuityPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'calculated' | 'approved' | 'processed'>('pending');

  const [mockGratuities, setMockGratuities] = useState<FNFGratuity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('fnf-gratuity');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as FNFGratuity[];
        setMockGratuities(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockGratuities: FNFGratuity[] = [
    {
      id: 'FNF-GRT-001', employeeId: 'EMP001', employeeName: 'Rahul Sharma', designation: 'Senior Software Engineer', department: 'Engineering',
      lastWorkingDay: '2025-12-14', joiningDate: '2020-01-15', yearsOfService: 5, monthsOfService: 10, daysOfService: 29,
      lastDrawnBasic: 50000, lastDrawnDA: 10000, lastDrawnSalary: 60000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 173076, maxGratuityCap: 2000000, finalGratuityAmount: 173076,
      status: 'calculated', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-12-10', remarks: 'Eligible for gratuity payment.'
    },
    {
      id: 'FNF-GRT-002', employeeId: 'EMP002', employeeName: 'Priya Singh', designation: 'Marketing Manager', department: 'Marketing',
      lastWorkingDay: '2025-11-30', joiningDate: '2016-06-10', yearsOfService: 9, monthsOfService: 5, daysOfService: 20,
      lastDrawnBasic: 60000, lastDrawnDA: 12000, lastDrawnSalary: 72000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 333461, maxGratuityCap: 2000000, finalGratuityAmount: 333461,
      status: 'approved', calculatedBy: 'Amit Kumar - Finance Head', calculatedOn: '2025-11-25', approvedBy: 'Rajesh Patel - CFO', remarks: 'Approved.'
    },
    {
      id: 'FNF-GRT-003', employeeId: 'EMP003', employeeName: 'Amit Kumar', designation: 'Product Manager', department: 'Product',
      lastWorkingDay: '2025-10-31', joiningDate: '2010-03-20', yearsOfService: 15, monthsOfService: 7, daysOfService: 11,
      lastDrawnBasic: 70000, lastDrawnDA: 14000, lastDrawnSalary: 84000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 648461, maxGratuityCap: 2000000, finalGratuityAmount: 648461,
      status: 'processed', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-10-25', approvedBy: 'Rajesh Patel - CFO', remarks: 'Processed.'
    },
    {
      id: 'FNF-GRT-004', employeeId: 'EMP004', employeeName: 'Neha Gupta', designation: 'Junior Developer', department: 'Engineering',
      lastWorkingDay: '2025-12-31', joiningDate: '2022-05-15', yearsOfService: 3, monthsOfService: 7, daysOfService: 16,
      lastDrawnBasic: 35000, lastDrawnDA: 7000, lastDrawnSalary: 42000,
      isEligible: false, gratuityFormula: 'standard', gratuityAmount: 0, maxGratuityCap: 2000000, finalGratuityAmount: 0,
      status: 'calculated', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-12-15', remarks: 'Not eligible (< 5 years).'
    },
    {
      id: 'FNF-GRT-005', employeeId: 'EMP005', employeeName: 'Vikram Malhotra', designation: 'VP of Sales', department: 'Sales',
      lastWorkingDay: '2025-09-30', joiningDate: '2015-01-01', yearsOfService: 10, monthsOfService: 9, daysOfService: 0,
      lastDrawnBasic: 120000, lastDrawnDA: 20000, lastDrawnSalary: 140000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 888461, maxGratuityCap: 2000000, finalGratuityAmount: 888461,
      status: 'pending'
    },
    {
      id: 'FNF-GRT-006', employeeId: 'EMP006', employeeName: 'Anjali Desai', designation: 'HR Executive', department: 'Human Resources',
      lastWorkingDay: '2025-10-15', joiningDate: '2021-02-10', yearsOfService: 4, monthsOfService: 8, daysOfService: 5,
      lastDrawnBasic: 30000, lastDrawnDA: 5000, lastDrawnSalary: 35000,
      isEligible: false, gratuityFormula: 'standard', gratuityAmount: 0, maxGratuityCap: 2000000, finalGratuityAmount: 0,
      status: 'pending'
    },
    {
      id: 'FNF-GRT-007', employeeId: 'EMP007', employeeName: 'Rohan Mehra', designation: 'Content Strategist', department: 'Marketing',
      lastWorkingDay: '2025-11-15', joiningDate: '2018-06-01', yearsOfService: 7, monthsOfService: 5, daysOfService: 14,
      lastDrawnBasic: 55000, lastDrawnDA: 11000, lastDrawnSalary: 66000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 266538, maxGratuityCap: 2000000, finalGratuityAmount: 266538,
      status: 'calculated', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-11-10', remarks: 'Calculation verified.'
    },
    {
      id: 'FNF-GRT-008', employeeId: 'EMP008', employeeName: 'Suresh Raina', designation: 'Operations Manager', department: 'Operations',
      lastWorkingDay: '2025-08-31', joiningDate: '2005-04-01', yearsOfService: 20, monthsOfService: 5, daysOfService: 0,
      lastDrawnBasic: 90000, lastDrawnDA: 18000, lastDrawnSalary: 108000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 1246153, maxGratuityCap: 2000000, finalGratuityAmount: 1246153,
      status: 'processed', calculatedBy: 'Amit Kumar', calculatedOn: '2025-08-25', approvedBy: 'Rajesh Patel', remarks: 'Long service gratuity.'
    },
    {
      id: 'FNF-GRT-009', employeeId: 'EMP009', employeeName: 'Kavita Krishnan', designation: 'Lead Designer', department: 'Design',
      lastWorkingDay: '2025-12-05', joiningDate: '2019-11-11', yearsOfService: 6, monthsOfService: 0, daysOfService: 24,
      lastDrawnBasic: 65000, lastDrawnDA: 13000, lastDrawnSalary: 78000,
      isEligible: true, gratuityFormula: 'standard', gratuityAmount: 270000, maxGratuityCap: 2000000, finalGratuityAmount: 270000,
      status: 'approved', calculatedBy: 'Priya Singh', calculatedOn: '2025-12-01', approvedBy: 'Rajesh Patel', remarks: 'Approved for payment.'
    },
    {
      id: 'FNF-GRT-010', employeeId: 'EMP010', employeeName: 'Deepak Verma', designation: 'System Admin', department: 'IT',
      lastWorkingDay: '2025-11-20', joiningDate: '2023-01-15', yearsOfService: 2, monthsOfService: 10, daysOfService: 5,
      lastDrawnBasic: 40000, lastDrawnDA: 8000, lastDrawnSalary: 48000,
      isEligible: false, gratuityFormula: 'standard', gratuityAmount: 0, maxGratuityCap: 2000000, finalGratuityAmount: 0,
      status: 'pending', remarks: 'Not eligible.'
    }
  ];

  const filteredGratuities = useMemo(() => {
    return mockGratuities.filter(gratuity => gratuity.status === selectedTab);
  }, [selectedTab]);

  const stats = {
    pending: mockGratuities.filter(g => g.status === 'pending').length,
    calculated: mockGratuities.filter(g => g.status === 'calculated').length,
    approved: mockGratuities.filter(g => g.status === 'approved').length,
    processed: mockGratuities.filter(g => g.status === 'processed').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    calculated: <Gift className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    processed: <CheckCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatServicePeriod = (years: number, months: number, days: number) => {
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">FNF - Gratuity Settlement</h1>
        <p className="text-sm text-gray-600 mt-1">Calculate gratuity as per Payment of Gratuity Act, 1972</p>
      </div>

      <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Gratuity Calculation Formula</h3>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Standard Formula:</strong> (Last Drawn Salary × 15 × Years of Service) ÷ 26
            </p>
            <p className="text-xs text-blue-700 mb-1">
              • Last Drawn Salary = Basic + DA (Dearness Allowance)
            </p>
            <p className="text-xs text-blue-700 mb-1">
              • Minimum 5 years of continuous service required for eligibility
            </p>
            <p className="text-xs text-blue-700 mb-1">
              • Service period rounded up if 6 months or more in the incomplete year
            </p>
            <p className="text-xs text-blue-700">
              • Maximum gratuity capped at ₹20,00,000 (as per current regulations)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Calculated</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.calculated}</p>
            </div>
            <Gift className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setSelectedTab('calculated')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'calculated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Calculated ({stats.calculated})
        </button>
        <button
          onClick={() => setSelectedTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setSelectedTab('processed')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'processed'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Processed ({stats.processed})
        </button>
      </div>

      <div className="space-y-2">
        {filteredGratuities.map(gratuity => {
          return (
            <div key={gratuity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{gratuity.employeeName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[gratuity.status]}`}>
                      <span className="inline-flex items-center gap-1">
                        {statusIcons[gratuity.status]}
                        {gratuity.status.toUpperCase()}
                      </span>
                    </span>
                    {gratuity.isEligible ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        ELIGIBLE
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        NOT ELIGIBLE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{gratuity.designation} • {gratuity.department}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last Working Day: {new Date(gratuity.lastWorkingDay).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Service Period</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Joining Date</span>
                      <span className="font-medium text-gray-900">
                        {new Date(gratuity.joiningDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Working Day</span>
                      <span className="font-medium text-gray-900">
                        {new Date(gratuity.lastWorkingDay).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total Service Period</span>
                      <span className="font-bold text-blue-600">
                        {formatServicePeriod(gratuity.yearsOfService, gratuity.monthsOfService, gratuity.daysOfService)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Years (for calculation)</span>
                      <span className="font-medium text-gray-900">
                        {gratuity.yearsOfService}.{gratuity.monthsOfService >= 6 ? '5' : '0'} years
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Salary Components</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Drawn Basic</span>
                      <span className="font-medium text-gray-900">{formatCurrency(gratuity.lastDrawnBasic)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dearness Allowance (DA)</span>
                      <span className="font-medium text-gray-900">{formatCurrency(gratuity.lastDrawnDA)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Last Drawn Salary (Basic + DA)</span>
                      <span className="font-bold text-blue-600">{formatCurrency(gratuity.lastDrawnSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {gratuity.isEligible ? (
                <>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                    <h4 className="font-semibold text-blue-900 mb-3">Gratuity Calculation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Formula Used</span>
                        <span className="font-medium text-blue-900">
                          {gratuity.gratuityFormula === 'standard' ? 'Standard (÷ 26)' : 'Seasonal (÷ 26)'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Calculation</span>
                        <span className="font-medium text-blue-900">
                          ({formatCurrency(gratuity.lastDrawnSalary)} × 15 × {gratuity.yearsOfService}.{gratuity.monthsOfService >= 6 ? '5' : '0'}) ÷ 26
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-blue-300">
                        <span className="font-semibold text-blue-900">Calculated Amount</span>
                        <span className="font-bold text-blue-900">{formatCurrency(gratuity.gratuityAmount)}</span>
                      </div>
                      {gratuity.gratuityAmount > gratuity.maxGratuityCap && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Maximum Cap</span>
                          <span className="font-medium text-blue-900">{formatCurrency(gratuity.maxGratuityCap)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Final Gratuity Amount</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(gratuity.finalGratuityAmount)}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          To be added to FNF settlement
                        </p>
                      </div>
                      <IndianRupee className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">Not Eligible for Gratuity</p>
                      <p className="text-sm text-red-800">
                        Employee has completed only {formatServicePeriod(gratuity.yearsOfService, gratuity.monthsOfService, gratuity.daysOfService)}.
                        Minimum 5 years of continuous service is required for gratuity eligibility as per Payment of Gratuity Act, 1972.
                      </p>
                      <div className="mt-3 p-3 bg-white rounded border border-red-200">
                        <p className="text-xs text-gray-700">
                          <strong>Note:</strong> Gratuity may still be payable in case of death or disablement, or if the employer's policy allows for shorter service periods.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {gratuity.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Remarks:</strong> {gratuity.remarks}
                  </p>
                </div>
              )}

              {gratuity.calculatedBy && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>Calculated by: {gratuity.calculatedBy} on {new Date(gratuity.calculatedOn!).toLocaleDateString('en-IN')}</p>
                  {gratuity.approvedBy && (
                    <p>Approved by: {gratuity.approvedBy}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {gratuity.status === 'pending' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    <Gift className="inline h-4 w-4 mr-2" />
                    Calculate Gratuity
                  </button>
                )}
                {gratuity.status === 'calculated' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Approve Calculation
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                      Recalculate
                    </button>
                  </>
                )}
                {gratuity.status === 'approved' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Mark as Processed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
