'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calculator, CheckCircle, Clock, AlertCircle, IndianRupee, X, Eye, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface FNFSalarySettlement {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  joiningDate: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  workingDays: number;
  daysWorked: number;
  salaryForPeriod: number;
  deductions: {
    noticePeriodBuyout?: number;
    loanRecovery?: number;
    advanceRecovery?: number;
    otherDeductions?: number;
  };
  additions: {
    pendingReimbursements?: number;
    bonus?: number;
    incentives?: number;
  };
  netSalaryComponent: number;
  status: 'pending' | 'calculated' | 'approved' | 'processed';
  calculatedBy?: string;
  calculatedOn?: string;
  approvedBy?: string;
}

export default function FNFSalaryPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'calculated' | 'approved' | 'processed'>('pending');
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<FNFSalarySettlement | null>(null);
  const [calculateFormData, setCalculateFormData] = useState({
    daysWorked: 0,
    noticePeriodBuyout: 0,
    loanRecovery: 0,
    advanceRecovery: 0,
    otherDeductions: 0,
    pendingReimbursements: 0,
    bonus: 0,
    incentives: 0
  });
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const [mockSettlements, setMockSettlements] = useState<FNFSalarySettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('fnf-salary');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as FNFSalarySettlement[];
        setMockSettlements(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockSettlements: FNFSalarySettlement[] = [
    {
      id: 'FNF-SAL-001', employeeId: 'EMP001', employeeName: 'Rahul Sharma', designation: 'Senior Software Engineer', department: 'Engineering',
      lastWorkingDay: '2025-12-14', joiningDate: '2020-01-15',
      basicSalary: 50000, hra: 20000, specialAllowance: 15000, otherAllowances: 5000, grossSalary: 90000,
      workingDays: 26, daysWorked: 14, salaryForPeriod: 48461,
      deductions: { noticePeriodBuyout: 180000, loanRecovery: 50000 },
      additions: { pendingReimbursements: 5000 },
      netSalaryComponent: -176539,
      status: 'calculated', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-12-10'
    },
    {
      id: 'FNF-SAL-002', employeeId: 'EMP002', employeeName: 'Priya Singh', designation: 'Marketing Manager', department: 'Marketing',
      lastWorkingDay: '2025-11-30', joiningDate: '2016-06-10',
      basicSalary: 60000, hra: 24000, specialAllowance: 18000, otherAllowances: 8000, grossSalary: 110000,
      workingDays: 26, daysWorked: 26, salaryForPeriod: 110000,
      deductions: { advanceRecovery: 15000 },
      additions: { pendingReimbursements: 8000, bonus: 20000 },
      netSalaryComponent: 123000,
      status: 'approved', calculatedBy: 'Amit Kumar - Finance Head', calculatedOn: '2025-11-25', approvedBy: 'Rajesh Patel - CFO'
    },
    {
      id: 'FNF-SAL-003', employeeId: 'EMP003', employeeName: 'Amit Kumar', designation: 'Product Manager', department: 'Product',
      lastWorkingDay: '2025-10-31', joiningDate: '2010-03-20',
      basicSalary: 70000, hra: 28000, specialAllowance: 20000, otherAllowances: 12000, grossSalary: 130000,
      workingDays: 26, daysWorked: 26, salaryForPeriod: 130000,
      deductions: {},
      additions: { pendingReimbursements: 12000, bonus: 50000 },
      netSalaryComponent: 192000,
      status: 'processed', calculatedBy: 'Priya Singh - HR Manager', calculatedOn: '2025-10-25', approvedBy: 'Rajesh Patel - CFO'
    },
    {
      id: 'FNF-SAL-004', employeeId: 'EMP004', employeeName: 'Neha Gupta', designation: 'Junior Developer', department: 'Engineering',
      lastWorkingDay: '2025-12-31', joiningDate: '2022-05-15',
      basicSalary: 35000, hra: 14000, specialAllowance: 10000, otherAllowances: 3000, grossSalary: 62000,
      workingDays: 26, daysWorked: 26, salaryForPeriod: 62000,
      deductions: {},
      additions: { pendingReimbursements: 2000 },
      netSalaryComponent: 64000,
      status: 'pending'
    },
    {
      id: 'FNF-SAL-005', employeeId: 'EMP005', employeeName: 'Vikram Malhotra', designation: 'VP of Sales', department: 'Sales',
      lastWorkingDay: '2025-09-30', joiningDate: '2015-01-01',
      basicSalary: 120000, hra: 48000, specialAllowance: 40000, otherAllowances: 15000, grossSalary: 223000,
      workingDays: 26, daysWorked: 26, salaryForPeriod: 223000,
      deductions: { otherDeductions: 5000 },
      additions: { incentives: 150000 },
      netSalaryComponent: 368000,
      status: 'calculated', calculatedBy: 'Priya Singh', calculatedOn: '2025-09-28'
    },
    {
      id: 'FNF-SAL-006', employeeId: 'EMP006', employeeName: 'Anjali Desai', designation: 'HR Executive', department: 'Human Resources',
      lastWorkingDay: '2025-10-15', joiningDate: '2021-02-10',
      basicSalary: 30000, hra: 12000, specialAllowance: 8000, otherAllowances: 2000, grossSalary: 52000,
      workingDays: 26, daysWorked: 13, salaryForPeriod: 26000,
      deductions: { noticePeriodBuyout: 30000 },
      additions: {},
      netSalaryComponent: -4000,
      status: 'approved', calculatedBy: 'Priya Singh', calculatedOn: '2025-10-13', approvedBy: 'Rajesh Patel'
    },
    {
      id: 'FNF-SAL-007', employeeId: 'EMP007', employeeName: 'Rohan Mehra', designation: 'Content Strategist', department: 'Marketing',
      lastWorkingDay: '2025-11-15', joiningDate: '2018-06-01',
      basicSalary: 55000, hra: 22000, specialAllowance: 15000, otherAllowances: 5000, grossSalary: 97000,
      workingDays: 26, daysWorked: 13, salaryForPeriod: 48500,
      deductions: {},
      additions: { pendingReimbursements: 3000 },
      netSalaryComponent: 51500,
      status: 'pending'
    },
    {
      id: 'FNF-SAL-008', employeeId: 'EMP008', employeeName: 'Suresh Raina', designation: 'Operations Manager', department: 'Operations',
      lastWorkingDay: '2025-08-31', joiningDate: '2005-04-01',
      basicSalary: 90000, hra: 36000, specialAllowance: 25000, otherAllowances: 10000, grossSalary: 161000,
      workingDays: 26, daysWorked: 26, salaryForPeriod: 161000,
      deductions: {},
      additions: { bonus: 50000 },
      netSalaryComponent: 211000,
      status: 'processed', calculatedBy: 'Amit Kumar', calculatedOn: '2025-08-28', approvedBy: 'Rajesh Patel'
    },
    {
      id: 'FNF-SAL-009', employeeId: 'EMP009', employeeName: 'Kavita Krishnan', designation: 'Lead Designer', department: 'Design',
      lastWorkingDay: '2025-12-05', joiningDate: '2019-11-11',
      basicSalary: 65000, hra: 26000, specialAllowance: 18000, otherAllowances: 6000, grossSalary: 115000,
      workingDays: 26, daysWorked: 5, salaryForPeriod: 22115,
      deductions: { loanRecovery: 10000 },
      additions: {},
      netSalaryComponent: 12115,
      status: 'approved', calculatedBy: 'Priya Singh', calculatedOn: '2025-12-03', approvedBy: 'Rajesh Patel'
    },
    {
      id: 'FNF-SAL-010', employeeId: 'EMP010', employeeName: 'Deepak Verma', designation: 'System Admin', department: 'IT',
      lastWorkingDay: '2025-11-20', joiningDate: '2023-01-15',
      basicSalary: 40000, hra: 16000, specialAllowance: 10000, otherAllowances: 4000, grossSalary: 70000,
      workingDays: 26, daysWorked: 18, salaryForPeriod: 48461,
      deductions: { advanceRecovery: 5000 },
      additions: { pendingReimbursements: 1539 },
      netSalaryComponent: 45000,
      status: 'calculated', calculatedBy: 'Priya Singh', calculatedOn: '2025-11-18'
    }
  ];

  const filteredSettlements = useMemo(() => {
    return mockSettlements.filter(settlement => settlement.status === selectedTab);
  }, [selectedTab]);

  const stats = {
    pending: mockSettlements.filter(s => s.status === 'pending').length,
    calculated: mockSettlements.filter(s => s.status === 'calculated').length,
    approved: mockSettlements.filter(s => s.status === 'approved').length,
    processed: mockSettlements.filter(s => s.status === 'processed').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    calculated: <Calculator className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    processed: <CheckCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const calculateTotalDeductions = (deductions: FNFSalarySettlement['deductions']) => {
    return Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
  };

  const calculateTotalAdditions = (additions: FNFSalarySettlement['additions']) => {
    return Object.values(additions).reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleCalculate = (settlement: FNFSalarySettlement) => {
    setSelectedSettlement(settlement);
    setCalculateFormData({
      daysWorked: settlement.daysWorked,
      noticePeriodBuyout: settlement.deductions.noticePeriodBuyout || 0,
      loanRecovery: settlement.deductions.loanRecovery || 0,
      advanceRecovery: settlement.deductions.advanceRecovery || 0,
      otherDeductions: settlement.deductions.otherDeductions || 0,
      pendingReimbursements: settlement.additions.pendingReimbursements || 0,
      bonus: settlement.additions.bonus || 0,
      incentives: settlement.additions.incentives || 0
    });
    setShowCalculateModal(true);
  };

  const handleApprove = (settlement: FNFSalarySettlement) => {
    setSelectedSettlement(settlement);
    setApprovalRemarks('');
    setShowApproveModal(true);
  };

  const handleView = (settlement: FNFSalarySettlement) => {
    setSelectedSettlement(settlement);
    setShowViewModal(true);
  };

  const handleSubmitCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Salary Calculated",
      description: `FNF salary for ${selectedSettlement?.employeeName} has been calculated successfully.`
    });
    setShowCalculateModal(false);
    setSelectedSettlement(null);
  };

  const handleSubmitApproval = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Salary Approved",
      description: `FNF salary for ${selectedSettlement?.employeeName} has been approved and is ready for processing.`
    });
    setShowApproveModal(false);
    setSelectedSettlement(null);
  };

  const handleMarkProcessed = (settlement: FNFSalarySettlement) => {
    toast({
      title: "Marked as Processed",
      description: `FNF salary for ${settlement.employeeName} has been marked as processed.`
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">FNF - Salary Settlement</h1>
        <p className="text-sm text-gray-600 mt-1">Final month salary calculation and settlement</p>
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
            <Calculator className="h-8 w-8 text-blue-600" />
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
        {filteredSettlements.map(settlement => {
          const totalDeductions = calculateTotalDeductions(settlement.deductions);
          const totalAdditions = calculateTotalAdditions(settlement.additions);

          return (
            <div key={settlement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{settlement.employeeName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[settlement.status]}`}>
                      <span className="inline-flex items-center gap-1">
                        {statusIcons[settlement.status]}
                        {settlement.status.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{settlement.designation} • {settlement.department}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last Working Day: {new Date(settlement.lastWorkingDay).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Salary Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Basic Salary</span>
                      <span className="font-medium text-gray-900">{formatCurrency(settlement.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">HRA</span>
                      <span className="font-medium text-gray-900">{formatCurrency(settlement.hra)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Special Allowance</span>
                      <span className="font-medium text-gray-900">{formatCurrency(settlement.specialAllowance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Other Allowances</span>
                      <span className="font-medium text-gray-900">{formatCurrency(settlement.otherAllowances)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Gross Monthly Salary</span>
                      <span className="font-bold text-gray-900">{formatCurrency(settlement.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Working Days</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Working Days</span>
                      <span className="font-medium text-gray-900">{settlement.workingDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Days Worked</span>
                      <span className="font-medium text-gray-900">{settlement.daysWorked} days</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Salary for Period</span>
                      <span className="font-bold text-blue-600">{formatCurrency(settlement.salaryForPeriod)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Calculated: {formatCurrency(settlement.grossSalary)} ÷ {settlement.workingDays} × {settlement.daysWorked}
                    </p>
                  </div>
                </div>
              </div>

              {(Object.keys(settlement.deductions).length > 0 || Object.keys(settlement.additions).length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  {Object.keys(settlement.additions).length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">Additions</h4>
                      <div className="space-y-2">
                        {settlement.additions.pendingReimbursements && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Pending Reimbursements</span>
                            <span className="font-medium text-green-900">
                              +{formatCurrency(settlement.additions.pendingReimbursements)}
                            </span>
                          </div>
                        )}
                        {settlement.additions.bonus && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Bonus</span>
                            <span className="font-medium text-green-900">
                              +{formatCurrency(settlement.additions.bonus)}
                            </span>
                          </div>
                        )}
                        {settlement.additions.incentives && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Incentives</span>
                            <span className="font-medium text-green-900">
                              +{formatCurrency(settlement.additions.incentives)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                          <span className="font-semibold text-green-900">Total Additions</span>
                          <span className="font-bold text-green-900">+{formatCurrency(totalAdditions)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {Object.keys(settlement.deductions).length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-3">Deductions</h4>
                      <div className="space-y-2">
                        {settlement.deductions.noticePeriodBuyout && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-700">Notice Period Buyout</span>
                            <span className="font-medium text-red-900">
                              -{formatCurrency(settlement.deductions.noticePeriodBuyout)}
                            </span>
                          </div>
                        )}
                        {settlement.deductions.loanRecovery && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-700">Loan Recovery</span>
                            <span className="font-medium text-red-900">
                              -{formatCurrency(settlement.deductions.loanRecovery)}
                            </span>
                          </div>
                        )}
                        {settlement.deductions.advanceRecovery && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-700">Advance Recovery</span>
                            <span className="font-medium text-red-900">
                              -{formatCurrency(settlement.deductions.advanceRecovery)}
                            </span>
                          </div>
                        )}
                        {settlement.deductions.otherDeductions && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-700">Other Deductions</span>
                            <span className="font-medium text-red-900">
                              -{formatCurrency(settlement.deductions.otherDeductions)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-red-300">
                          <span className="font-semibold text-red-900">Total Deductions</span>
                          <span className="font-bold text-red-900">-{formatCurrency(totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`rounded-lg p-3 border-2 ${settlement.netSalaryComponent >= 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Net Salary Component (FNF)</p>
                    <p className={`text-2xl font-bold ${settlement.netSalaryComponent >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {settlement.netSalaryComponent >= 0 ? '+' : '-'}
                      {formatCurrency(settlement.netSalaryComponent)}
                    </p>
                  </div>
                  <IndianRupee className={`h-12 w-12 ${settlement.netSalaryComponent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                </div>
                {settlement.netSalaryComponent < 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>Employee owes this amount to the company (recoverable from final settlement)</span>
                  </div>
                )}
              </div>

              {settlement.calculatedBy && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>Calculated by: {settlement.calculatedBy} on {new Date(settlement.calculatedOn!).toLocaleDateString('en-IN')}</p>
                  {settlement.approvedBy && (
                    <p>Approved by: {settlement.approvedBy}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {settlement.status === 'pending' && (
                  <button
                    onClick={() => handleCalculate(settlement)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    Calculate Salary
                  </button>
                )}
                {settlement.status === 'calculated' && (
                  <>
                    <button
                      onClick={() => handleApprove(settlement)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Calculation
                    </button>
                    <button
                      onClick={() => handleCalculate(settlement)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300 inline-flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Recalculate
                    </button>
                    <button
                      onClick={() => handleView(settlement)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm border border-blue-300 inline-flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </>
                )}
                {settlement.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleMarkProcessed(settlement)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Processed
                    </button>
                    <button
                      onClick={() => handleView(settlement)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm border border-blue-300 inline-flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </>
                )}
                {settlement.status === 'processed' && (
                  <button
                    onClick={() => handleView(settlement)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm border border-blue-300 inline-flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculate Salary Modal */}
      {showCalculateModal && selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Calculate FNF Salary</h2>
                  <p className="text-sm text-blue-700 mt-1">{selectedSettlement.employeeName} • {selectedSettlement.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setShowCalculateModal(false)} className="text-blue-600 hover:text-blue-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCalculation} className="p-6 space-y-3">
              {/* Salary Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Monthly Salary Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-sm text-gray-600">Basic: </span><span className="font-semibold">{formatCurrency(selectedSettlement.basicSalary)}</span></div>
                  <div><span className="text-sm text-gray-600">HRA: </span><span className="font-semibold">{formatCurrency(selectedSettlement.hra)}</span></div>
                  <div><span className="text-sm text-gray-600">Special Allowance: </span><span className="font-semibold">{formatCurrency(selectedSettlement.specialAllowance)}</span></div>
                  <div><span className="text-sm text-gray-600">Other: </span><span className="font-semibold">{formatCurrency(selectedSettlement.otherAllowances)}</span></div>
                  <div className="col-span-2 pt-2 border-t border-gray-300"><span className="text-sm text-gray-600">Gross Salary: </span><span className="font-bold text-blue-600">{formatCurrency(selectedSettlement.grossSalary)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Days Worked <span className="text-red-500">*</span></label>
                  <input type="number" value={calculateFormData.daysWorked} onChange={(e) => setCalculateFormData({ ...calculateFormData, daysWorked: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required min="0" max={selectedSettlement.workingDays} />
                  <p className="text-xs text-gray-500 mt-1">Out of {selectedSettlement.workingDays} working days</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Prorated Salary</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency((selectedSettlement.grossSalary / selectedSettlement.workingDays) * calculateFormData.daysWorked)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-600">Deductions</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period Buyout</label>
                    <input type="number" value={calculateFormData.noticePeriodBuyout} onChange={(e) => setCalculateFormData({ ...calculateFormData, noticePeriodBuyout: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Recovery</label>
                    <input type="number" value={calculateFormData.loanRecovery} onChange={(e) => setCalculateFormData({ ...calculateFormData, loanRecovery: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Recovery</label>
                    <input type="number" value={calculateFormData.advanceRecovery} onChange={(e) => setCalculateFormData({ ...calculateFormData, advanceRecovery: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                    <input type="number" value={calculateFormData.otherDeductions} onChange={(e) => setCalculateFormData({ ...calculateFormData, otherDeductions: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" min="0" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">Additions</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pending Reimbursements</label>
                    <input type="number" value={calculateFormData.pendingReimbursements} onChange={(e) => setCalculateFormData({ ...calculateFormData, pendingReimbursements: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                    <input type="number" value={calculateFormData.bonus} onChange={(e) => setCalculateFormData({ ...calculateFormData, bonus: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incentives</label>
                    <input type="number" value={calculateFormData.incentives} onChange={(e) => setCalculateFormData({ ...calculateFormData, incentives: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
                <h3 className="font-bold text-gray-900 mb-3">Calculation Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Prorated Salary:</span><span className="font-semibold">+{formatCurrency((selectedSettlement.grossSalary / selectedSettlement.workingDays) * calculateFormData.daysWorked)}</span></div>
                  <div className="flex justify-between text-green-700"><span>Total Additions:</span><span className="font-semibold">+{formatCurrency(calculateFormData.pendingReimbursements + calculateFormData.bonus + calculateFormData.incentives)}</span></div>
                  <div className="flex justify-between text-red-700"><span>Total Deductions:</span><span className="font-semibold">-{formatCurrency(calculateFormData.noticePeriodBuyout + calculateFormData.loanRecovery + calculateFormData.advanceRecovery + calculateFormData.otherDeductions)}</span></div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-400 text-lg font-bold">
                    <span>Net Salary Component:</span>
                    <span className={(((selectedSettlement.grossSalary / selectedSettlement.workingDays) * calculateFormData.daysWorked) + calculateFormData.pendingReimbursements + calculateFormData.bonus + calculateFormData.incentives - calculateFormData.noticePeriodBuyout - calculateFormData.loanRecovery - calculateFormData.advanceRecovery - calculateFormData.otherDeductions) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(((selectedSettlement.grossSalary / selectedSettlement.workingDays) * calculateFormData.daysWorked) + calculateFormData.pendingReimbursements + calculateFormData.bonus + calculateFormData.incentives - calculateFormData.noticePeriodBuyout - calculateFormData.loanRecovery - calculateFormData.advanceRecovery - calculateFormData.otherDeductions)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowCalculateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Save Calculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-green-50 border-b border-green-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900">Approve FNF Salary</h2>
                  <p className="text-sm text-green-700 mt-1">{selectedSettlement.employeeName}</p>
                </div>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-green-600 hover:text-green-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitApproval} className="p-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Calculated Amount</h3>
                <p className={`text-3xl font-bold ${selectedSettlement.netSalaryComponent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedSettlement.netSalaryComponent >= 0 ? '+' : '-'}{formatCurrency(selectedSettlement.netSalaryComponent)}
                </p>
                {selectedSettlement.netSalaryComponent < 0 && (
                  <p className="text-xs text-red-600 mt-2">Employee owes this amount to company</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Approval Remarks</label>
                <textarea value={approvalRemarks} onChange={(e) => setApprovalRemarks(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" rows={4} placeholder="Enter approval remarks..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Approve & Forward to Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
