'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Search, Eye, Download, FileText, Users, DollarSign, TrendingUp, UserPlus, UserMinus, TrendingDown, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface EmployeePayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  grade: string;
  basicSalary: number;
  hra: number;
  da: number;
  conveyance: number;
  medical: number;
  otherEarnings: number;
  grossSalary: number;
  pfEmployee: number;
  esiEmployee: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  presentDays: number;
  totalDays: number;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  verifiedBy?: string;
  verifiedOn?: string;
  flaggedReason?: string;
}

interface PayrollVerificationBatch {
  id: string;
  monthYear: string;
  payPeriod: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  pendingVerification: number;
  verified: number;
  flagged: number;
  status: 'pending' | 'in_progress' | 'completed';
  records: EmployeePayrollRecord[];
}

interface ReconciliationEmployee {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  basicSalary: number;
  hra: number;
  da: number;
  conveyance: number;
  medical: number;
  grossSalary: number;
  pfEmployee: number;
  esiEmployee: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netSalary: number;
}

interface ReconciliationData {
  newEmployees: Array<ReconciliationEmployee & { joiningDate: string }>;
  exitedEmployees: Array<ReconciliationEmployee & { exitDate: string; reason: string }>;
  revisedSalaries: Array<{
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    oldBasicSalary: number;
    newBasicSalary: number;
    oldGrossSalary: number;
    newGrossSalary: number;
    oldNetSalary: number;
    newNetSalary: number;
    revisionDate: string;
    reason: string;
    oldBreakdown: { hra: number; da: number; conveyance: number; medical: number };
    newBreakdown: { hra: number; da: number; conveyance: number; medical: number };
  }>;
  previousPayroll: { totalBasic: number; totalNet: number; employeeCount: number };
  currentPayroll: { totalBasic: number; totalNet: number; employeeCount: number };
}

export default function PayrollVerificationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReconciliation, setShowReconciliation] = useState(false);

  const reconciliationData: ReconciliationData = {
    newEmployees: [
      {
        employeeId: 'EMP006',
        name: 'Kavita Mehta',
        designation: 'HR Executive',
        department: 'HR',
        basicSalary: 20833,
        hra: 8333,
        da: 2083,
        conveyance: 1600,
        medical: 0,
        grossSalary: 32849,
        pfEmployee: 2500,
        esiEmployee: 246,
        professionalTax: 200,
        tds: 650,
        totalDeductions: 3596,
        netSalary: 29253,
        joiningDate: '2025-11-01'
      },
      {
        employeeId: 'EMP005',
        name: 'Vikram Desai',
        designation: 'Logistics Coordinator',
        department: 'Logistics',
        basicSalary: 20000,
        hra: 8000,
        da: 2000,
        conveyance: 1600,
        medical: 0,
        grossSalary: 31600,
        pfEmployee: 2400,
        esiEmployee: 237,
        professionalTax: 200,
        tds: 600,
        totalDeductions: 3437,
        netSalary: 28163,
        joiningDate: '2025-11-15'
      }
    ],
    exitedEmployees: [
      {
        employeeId: 'EMP007',
        name: 'Suresh Nair',
        designation: 'Production Operator',
        department: 'Production',
        basicSalary: 18000,
        hra: 7200,
        da: 1800,
        conveyance: 1600,
        medical: 0,
        grossSalary: 28600,
        pfEmployee: 2160,
        esiEmployee: 214,
        professionalTax: 200,
        tds: 450,
        totalDeductions: 3024,
        netSalary: 25576,
        exitDate: '2025-10-31',
        reason: 'Resigned'
      },
      {
        employeeId: 'EMP008',
        name: 'Anita Rao',
        designation: 'Quality Inspector',
        department: 'Quality',
        basicSalary: 15000,
        hra: 6000,
        da: 1500,
        conveyance: 0,
        medical: 0,
        grossSalary: 22500,
        pfEmployee: 1800,
        esiEmployee: 169,
        professionalTax: 200,
        tds: 0,
        totalDeductions: 2169,
        netSalary: 20331,
        exitDate: '2025-10-20',
        reason: 'Terminated'
      }
    ],
    revisedSalaries: [
      {
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Production Manager',
        department: 'Production',
        oldBasicSalary: 30000,
        newBasicSalary: 31250,
        oldGrossSalary: 47700,
        newGrossSalary: 49725,
        oldNetSalary: 42100,
        newNetSalary: 43902,
        revisionDate: '2025-11-01',
        reason: 'Annual increment (4.17%)',
        oldBreakdown: { hra: 12000, da: 3000, conveyance: 1600, medical: 1100 },
        newBreakdown: { hra: 12500, da: 3125, conveyance: 1600, medical: 1250 }
      },
      {
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Quality Control Supervisor',
        department: 'Quality',
        oldBasicSalary: 22000,
        newBasicSalary: 22917,
        oldGrossSalary: 34540,
        newGrossSalary: 35976,
        oldNetSalary: 30500,
        newNetSalary: 31956,
        revisionDate: '2025-11-01',
        reason: 'Promotion to Senior QC Supervisor (4.17%)',
        oldBreakdown: { hra: 8800, da: 2200, conveyance: 1600, medical: 0 },
        newBreakdown: { hra: 9167, da: 2292, conveyance: 1600, medical: 0 }
      }
    ],
    previousPayroll: {
      totalBasic: 135000,
      totalNet: 187100,
      employeeCount: 6
    },
    currentPayroll: {
      totalBasic: 131250,
      totalNet: 181879,
      employeeCount: 6
    }
  };

  const [records, setRecords] = useState<EmployeePayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getDisbursements('verification');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const num = (v: any) => Number(v ?? 0);
          const mapped: EmployeePayrollRecord[] = raw.map((r: any) => {
            const d = r.details ?? {};
            return {
              id: r.id ?? '',
              employeeId: r.employeeId ?? r.employeeCode ?? '',
              employeeName: r.employeeName ?? '',
              designation: d.designation ?? '',
              department: r.department ?? '',
              grade: d.grade ?? '',
              basicSalary: num(d.basicSalary),
              hra: num(d.hra),
              da: num(d.da),
              conveyance: num(d.conveyance),
              medical: num(d.medical),
              otherEarnings: num(d.otherEarnings),
              grossSalary: num(d.grossSalary),
              pfEmployee: num(d.pfEmployee),
              esiEmployee: num(d.esiEmployee),
              professionalTax: num(d.professionalTax),
              tds: num(d.tds),
              otherDeductions: num(d.otherDeductions),
              totalDeductions: num(d.totalDeductions),
              netSalary: num(r.netPay ?? d.netSalary ?? r.amount),
              presentDays: num(d.presentDays),
              totalDays: num(d.totalDays),
              verificationStatus: (r.status ?? 'pending') as EmployeePayrollRecord['verificationStatus'],
              verifiedBy: d.verifiedBy ?? undefined,
              verifiedOn: d.verifiedOn ?? undefined,
              flaggedReason: d.flaggedReason ?? undefined,
            };
          });
          setRecords(mapped);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || record.verificationStatus === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [records, searchTerm, selectedDepartment, selectedStatus]);

  // Batch summary derived from the live payroll records
  const batch: PayrollVerificationBatch = useMemo(() => ({
    id: '',
    monthYear: '',
    payPeriod: '',
    employeeCount: records.length,
    totalGross: records.reduce((sum, r) => sum + (r.grossSalary || 0), 0),
    totalDeductions: records.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
    totalNet: records.reduce((sum, r) => sum + (r.netSalary || 0), 0),
    pendingVerification: records.filter(r => r.verificationStatus === 'pending').length,
    verified: records.filter(r => r.verificationStatus === 'verified').length,
    flagged: records.filter(r => r.verificationStatus === 'flagged').length,
    status: 'in_progress',
    records,
  }), [records]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    verified: 'bg-green-100 text-green-700 border-green-200',
    flagged: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    pending: <AlertTriangle className="h-4 w-4" />,
    verified: <CheckCircle className="h-4 w-4" />,
    flagged: <AlertTriangle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatCurrencyLakhs = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  return (
    <div className="w-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Verification</h1>
        <p className="text-sm text-gray-600 mt-1">Verify salary calculations before approval and disbursement</p>
        {isLoading && <p className="text-xs text-gray-400 mt-1">Loading…</p>}
        {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{batch.monthYear}</h2>
            <p className="text-sm text-gray-600 mt-1">Pay Period: {batch.payPeriod}</p>
            <p className="text-xs text-gray-500 mt-1">Batch ID: {batch.id}</p>
          </div>
          <span className="px-4 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-700">
            IN PROGRESS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{batch.employeeCount}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Gross</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrencyLakhs(batch.totalGross)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Deductions</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrencyLakhs(batch.totalDeductions)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Net Payable</p>
                <p className="text-lg font-bold text-green-900 mt-1">{formatCurrencyLakhs(batch.totalNet)}</p>
              </div>
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Verification</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{batch.pendingVerification}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Verified</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{batch.verified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Flagged</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{batch.flagged}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
          </select>
          <button
            onClick={() => setShowReconciliation(!showReconciliation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              showReconciliation
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            {showReconciliation ? 'Hide' : 'View'} Reconciliation
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {showReconciliation && (
        <div className="mb-3">
          <PayrollReconciliation data={reconciliationData} formatCurrency={formatCurrency} />
        </div>
      )}

      <div className="space-y-2">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{record.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {record.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[record.verificationStatus]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[record.verificationStatus]}
                      {record.verificationStatus.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department} • Grade {record.grade}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Attendance: {record.presentDays}/{record.totalDays} days
                </p>
                {record.flaggedReason && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-xs text-red-700 font-medium">⚠️ {record.flaggedReason}</p>
                  </div>
                )}
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 text-sm">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Basic Salary</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">HRA</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.hra)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">DA</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.da)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Conveyance</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.conveyance)}</span>
                  </div>
                  {record.medical > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Medical</span>
                      <span className="font-medium text-green-900">{formatCurrency(record.medical)}</span>
                    </div>
                  )}
                  {record.otherEarnings > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Other Earnings</span>
                      <span className="font-medium text-green-900">{formatCurrency(record.otherEarnings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs pt-2 border-t border-green-300">
                    <span className="font-bold text-green-900">Gross Salary</span>
                    <span className="font-bold text-green-900">{formatCurrency(record.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3 text-sm">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">PF (Employee)</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.pfEmployee)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">ESI (Employee)</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.esiEmployee)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">Professional Tax</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.professionalTax)}</span>
                  </div>
                  {record.tds > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-red-700">TDS</span>
                      <span className="font-medium text-red-900">{formatCurrency(record.tds)}</span>
                    </div>
                  )}
                  {record.otherDeductions > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-red-700">Other Deductions</span>
                      <span className="font-medium text-red-900">{formatCurrency(record.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs pt-2 border-t border-red-300">
                    <span className="font-bold text-red-900">Total Deductions</span>
                    <span className="font-bold text-red-900">{formatCurrency(record.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm">Net Payment</h4>
                <div className="text-center py-4">
                  <p className="text-xs text-blue-700 mb-2">Net Salary</p>
                  <p className="text-3xl font-bold text-blue-900">{formatCurrency(record.netSalary)}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Gross</span>
                    <span className="text-blue-900">{formatCurrency(record.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Deductions</span>
                    <span className="text-blue-900">-{formatCurrency(record.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {record.verifiedBy && record.verifiedOn && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Verified by: {record.verifiedBy} on {new Date(record.verifiedOn).toLocaleDateString('en-IN')}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {record.verificationStatus === 'pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Verify
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    <AlertTriangle className="inline h-4 w-4 mr-2" />
                    Flag Issue
                  </button>
                </>
              )}
              {record.verificationStatus === 'flagged' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Resolve & Verify
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Edit Record
                  </button>
                </>
              )}
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                <Eye className="inline h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {batch.verified === batch.employeeCount && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">All records verified!</h3>
              <p className="text-sm text-green-700 mt-1">
                Payroll batch is ready for approval and disbursement
              </p>
            </div>
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Submit for Approval
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Verification Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Verify attendance days match with actual attendance records</li>
          <li>• Check that earnings and deductions are calculated correctly based on template</li>
          <li>• Ensure statutory deductions (PF, ESI, PT) comply with government regulations</li>
          <li>• Flag any records with unusual values or missing information</li>
          <li>• All flagged records must be resolved before batch approval</li>
          <li>• Cross-check total payable amount with budget allocation</li>
        </ul>
      </div>
    </div>
  );
}

interface PayrollReconciliationProps {
  data: ReconciliationData;
  formatCurrency: (amount: number) => string;
}

function PayrollReconciliation({ data, formatCurrency }: PayrollReconciliationProps) {
  const [expandedNew, setExpandedNew] = useState<string[]>([]);
  const [expandedExited, setExpandedExited] = useState<string[]>([]);
  const [expandedRevised, setExpandedRevised] = useState<string[]>([]);

  const toggleExpanded = (id: string, type: 'new' | 'exited' | 'revised') => {
    if (type === 'new') {
      setExpandedNew(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (type === 'exited') {
      setExpandedExited(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setExpandedRevised(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const additionsTotal = useMemo(() => {
    return data.newEmployees.reduce((sum, emp) => sum + emp.netSalary, 0);
  }, [data.newEmployees]);

  const deductionsTotal = useMemo(() => {
    return data.exitedEmployees.reduce((sum, emp) => sum + emp.netSalary, 0);
  }, [data.exitedEmployees]);

  const revisionsImpact = useMemo(() => {
    return data.revisedSalaries.reduce((sum, emp) => sum + (emp.newNetSalary - emp.oldNetSalary), 0);
  }, [data.revisedSalaries]);

  const calculatedCurrent = data.previousPayroll.totalNet + additionsTotal - deductionsTotal + revisionsImpact;
  const variance = data.currentPayroll.totalNet - calculatedCurrent;

  return (
    <div className="mb-3 space-y-2">
      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-2">
        <p className="text-xs text-yellow-900">
          📊 Reconciliation Data: {data.newEmployees.length} new, {data.exitedEmployees.length} exited, {data.revisedSalaries.length} revised
        </p>
      </div>

      {/* Reconciliation Formula */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm border-2 border-purple-200 p-3">
        <h2 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Payroll Reconciliation
        </h2>

        <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-2">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Scroll down to see detailed employee information. Click on employee cards below to expand full salary breakdowns.
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Reconciliation Formula (Excluding Variable Dues & Deductions)</h3>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="bg-blue-100 px-4 py-3 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-700 font-medium mb-1">Previous Payroll</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(data.previousPayroll.totalNet)}</p>
              <p className="text-xs text-blue-600 mt-1">{data.previousPayroll.employeeCount} employees</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div className="bg-green-100 px-4 py-3 rounded-lg border border-green-300">
              <p className="text-xs text-green-700 font-medium mb-1">+ New Employees</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(additionsTotal)}</p>
              <p className="text-xs text-green-600 mt-1">{data.newEmployees.length} added</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div className="bg-red-100 px-4 py-3 rounded-lg border border-red-300">
              <p className="text-xs text-red-700 font-medium mb-1">- Exited Employees</p>
              <p className="text-lg font-bold text-red-900">{formatCurrency(deductionsTotal)}</p>
              <p className="text-xs text-red-600 mt-1">{data.exitedEmployees.length} exited</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div className={`px-4 py-3 rounded-lg border ${revisionsImpact >= 0 ? 'bg-emerald-100 border-emerald-300' : 'bg-orange-100 border-orange-300'}`}>
              <p className={`text-xs font-medium mb-1 ${revisionsImpact >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                {revisionsImpact >= 0 ? '+' : ''} Salary Revisions
              </p>
              <p className={`text-lg font-bold ${revisionsImpact >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                {formatCurrency(Math.abs(revisionsImpact))}
              </p>
              <p className={`text-xs mt-1 ${revisionsImpact >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {data.revisedSalaries.length} revised
              </p>
            </div>

            <div className="text-2xl font-bold text-gray-600">=</div>

            <div className="bg-purple-100 px-4 py-3 rounded-lg border-2 border-purple-400">
              <p className="text-xs text-purple-700 font-medium mb-1">Current Payroll</p>
              <p className="text-lg font-bold text-purple-900">{formatCurrency(data.currentPayroll.totalNet)}</p>
              <p className="text-xs text-purple-600 mt-1">{data.currentPayroll.employeeCount} employees</p>
            </div>
          </div>

          {Math.abs(variance) > 0.01 && (
            <div className={`mt-4 p-3 rounded-lg border ${Math.abs(variance) > 1000 ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
              <p className={`text-sm font-semibold ${Math.abs(variance) > 1000 ? 'text-red-900' : 'text-yellow-900'}`}>
                ⚠️ Variance Detected: {formatCurrency(Math.abs(variance))}
              </p>
              <p className={`text-xs mt-1 ${Math.abs(variance) > 1000 ? 'text-red-700' : 'text-yellow-700'}`}>
                This may be due to variable components, pro-rata adjustments, or rounding differences.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Employees */}
      {data.newEmployees.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-3">
          <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Employees Added ({data.newEmployees.length})
          </h3>
          <div className="space-y-3">
            {data.newEmployees.map((emp) => {
              const isExpanded = expandedNew.includes(emp.employeeId);
              return (
                <div key={emp.employeeId} className="border-2 border-green-200 rounded-lg overflow-hidden">
                  <div
                    className="bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => toggleExpanded(emp.employeeId, 'new')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">{emp.name}</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                            {emp.employeeId}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-200 text-green-800">
                            Joined: {new Date(emp.joiningDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {emp.designation} • {emp.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Net Salary</p>
                          <p className="text-lg font-bold text-green-900">{formatCurrency(emp.netSalary)}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-green-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-green-700" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 text-sm">Earnings</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">Basic Salary</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">HRA</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.hra)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">DA</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.da)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">Conveyance</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.conveyance)}</span>
                            </div>
                            {emp.medical > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Medical</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.medical)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs pt-2 border-t border-green-300">
                              <span className="font-bold text-green-900">Gross Salary</span>
                              <span className="font-bold text-green-900">{formatCurrency(emp.grossSalary)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-3 text-sm">Deductions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">PF (Employee)</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.pfEmployee)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">ESI (Employee)</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.esiEmployee)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">Professional Tax</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.professionalTax)}</span>
                            </div>
                            {emp.tds > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-red-700">TDS</span>
                                <span className="font-medium text-red-900">{formatCurrency(emp.tds)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs pt-2 border-t border-red-300">
                              <span className="font-bold text-red-900">Total Deductions</span>
                              <span className="font-bold text-red-900">{formatCurrency(emp.totalDeductions)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-3 text-sm">Net Payment</h4>
                          <div className="text-center py-4">
                            <p className="text-xs text-blue-700 mb-2">Net Salary</p>
                            <p className="text-3xl font-bold text-blue-900">{formatCurrency(emp.netSalary)}</p>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-700">Gross</span>
                              <span className="text-blue-900">{formatCurrency(emp.grossSalary)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-700">Deductions</span>
                              <span className="text-blue-900">-{formatCurrency(emp.totalDeductions)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="bg-green-100 rounded-lg p-3 border-2 border-green-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-900 text-lg">Total Addition to Payroll</span>
                <span className="text-2xl font-bold text-green-900">{formatCurrency(additionsTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exited Employees */}
      {data.exitedEmployees.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-3">
          <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            Exited Employees ({data.exitedEmployees.length})
          </h3>
          <div className="space-y-3">
            {data.exitedEmployees.map((emp) => {
              const isExpanded = expandedExited.includes(emp.employeeId);
              return (
                <div key={emp.employeeId} className="border-2 border-red-200 rounded-lg overflow-hidden">
                  <div
                    className="bg-red-50 p-3 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => toggleExpanded(emp.employeeId, 'exited')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">{emp.name}</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                            {emp.employeeId}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            emp.reason === 'Resigned' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {emp.reason}: {new Date(emp.exitDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {emp.designation} • {emp.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Net Salary</p>
                          <p className="text-lg font-bold text-red-900">{formatCurrency(emp.netSalary)}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-red-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-red-700" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-red-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 text-sm">Earnings</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">Basic Salary</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">HRA</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.hra)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">DA</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.da)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-700">Conveyance</span>
                              <span className="font-medium text-green-900">{formatCurrency(emp.conveyance)}</span>
                            </div>
                            {emp.medical > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Medical</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.medical)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs pt-2 border-t border-green-300">
                              <span className="font-bold text-green-900">Gross Salary</span>
                              <span className="font-bold text-green-900">{formatCurrency(emp.grossSalary)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-3 text-sm">Deductions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">PF (Employee)</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.pfEmployee)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">ESI (Employee)</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.esiEmployee)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-700">Professional Tax</span>
                              <span className="font-medium text-red-900">{formatCurrency(emp.professionalTax)}</span>
                            </div>
                            {emp.tds > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-red-700">TDS</span>
                                <span className="font-medium text-red-900">{formatCurrency(emp.tds)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs pt-2 border-t border-red-300">
                              <span className="font-bold text-red-900">Total Deductions</span>
                              <span className="font-bold text-red-900">{formatCurrency(emp.totalDeductions)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-3 text-sm">Net Payment</h4>
                          <div className="text-center py-4">
                            <p className="text-xs text-blue-700 mb-2">Net Salary</p>
                            <p className="text-3xl font-bold text-blue-900">{formatCurrency(emp.netSalary)}</p>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-700">Gross</span>
                              <span className="text-blue-900">{formatCurrency(emp.grossSalary)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-700">Deductions</span>
                              <span className="text-blue-900">-{formatCurrency(emp.totalDeductions)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="bg-red-100 rounded-lg p-3 border-2 border-red-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-900 text-lg">Total Deduction from Payroll</span>
                <span className="text-2xl font-bold text-red-900">{formatCurrency(deductionsTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Revisions */}
      {data.revisedSalaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-3">
          <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Salary Revisions ({data.revisedSalaries.length})
          </h3>
          <div className="space-y-3">
            {data.revisedSalaries.map((emp) => {
              const isExpanded = expandedRevised.includes(emp.employeeId);
              const impact = emp.newNetSalary - emp.oldNetSalary;
              const impactPercent = ((impact / emp.oldNetSalary) * 100).toFixed(2);
              return (
                <div key={emp.employeeId} className="border-2 border-blue-200 rounded-lg overflow-hidden">
                  <div
                    className="bg-blue-50 p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleExpanded(emp.employeeId, 'revised')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">{emp.name}</span>
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                            {emp.employeeId}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-200 text-blue-800">
                            Effective: {new Date(emp.revisionDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {emp.designation} • {emp.department}
                        </p>
                        <p className="text-xs text-blue-700">{emp.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-600 mb-1">
                            {formatCurrency(emp.oldNetSalary)} → {formatCurrency(emp.newNetSalary)}
                          </p>
                          <p className={`text-lg font-bold ${impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {impact >= 0 ? '+' : ''}{formatCurrency(impact)} ({impactPercent}%)
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-blue-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-blue-700" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        {/* Old Salary Structure */}
                        <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-300">
                          <h4 className="font-bold text-gray-900 mb-3 text-center">Previous Salary Structure</h4>

                          <div className="bg-green-50 rounded p-3 mb-3 border border-green-200">
                            <p className="text-xs font-medium text-green-700 mb-2">Earnings</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Basic</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.oldBasicSalary)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">HRA</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.oldBreakdown.hra)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">DA</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.oldBreakdown.da)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Conveyance</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.oldBreakdown.conveyance)}</span>
                              </div>
                              {emp.oldBreakdown.medical > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-700">Medical</span>
                                  <span className="font-medium text-green-900">{formatCurrency(emp.oldBreakdown.medical)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs pt-2 border-t border-green-300">
                                <span className="font-bold text-green-900">Gross</span>
                                <span className="font-bold text-green-900">{formatCurrency(emp.oldGrossSalary)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center py-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-700">Previous Net Salary</p>
                            <p className="text-xl font-bold text-blue-900">{formatCurrency(emp.oldNetSalary)}</p>
                          </div>
                        </div>

                        {/* New Salary Structure */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-400">
                          <h4 className="font-bold text-green-900 mb-3 text-center">Revised Salary Structure</h4>

                          <div className="bg-green-100 rounded p-3 mb-3 border-2 border-green-300">
                            <p className="text-xs font-medium text-green-800 mb-2">Earnings</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Basic</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.newBasicSalary)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">HRA</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.newBreakdown.hra)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">DA</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.newBreakdown.da)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-700">Conveyance</span>
                                <span className="font-medium text-green-900">{formatCurrency(emp.newBreakdown.conveyance)}</span>
                              </div>
                              {emp.newBreakdown.medical > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-700">Medical</span>
                                  <span className="font-medium text-green-900">{formatCurrency(emp.newBreakdown.medical)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs pt-2 border-t border-green-400">
                                <span className="font-bold text-green-900">Gross</span>
                                <span className="font-bold text-green-900">{formatCurrency(emp.newGrossSalary)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center py-2 bg-green-200 rounded border-2 border-green-400">
                            <p className="text-xs text-green-800">Revised Net Salary</p>
                            <p className="text-xl font-bold text-green-900">{formatCurrency(emp.newNetSalary)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Impact Summary */}
                      <div className={`p-3 rounded-lg border-2 ${impact >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-semibold ${impact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                              Net Salary Impact
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Basic: {formatCurrency(emp.oldBasicSalary)} → {formatCurrency(emp.newBasicSalary)}
                              ({impact >= 0 ? '+' : ''}{formatCurrency(emp.newBasicSalary - emp.oldBasicSalary)})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {impact >= 0 ? '+' : ''}{formatCurrency(impact)}
                            </p>
                            <p className={`text-sm font-medium ${impact >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {impactPercent}% {impact >= 0 ? 'increase' : 'decrease'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className={`rounded-lg p-3 border-2 ${revisionsImpact >= 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-bold text-lg ${revisionsImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  Total Revision Impact on Payroll
                </span>
                <span className={`text-2xl font-bold ${revisionsImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revisionsImpact >= 0 ? '+' : ''}{formatCurrency(revisionsImpact)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300 p-3">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">Reconciliation Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-3 border border-indigo-200">
            <p className="text-sm text-gray-600 mb-2">Employee Count Change</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.previousPayroll.employeeCount} → {data.currentPayroll.employeeCount}
              <span className={`ml-2 text-lg ${
                data.currentPayroll.employeeCount > data.previousPayroll.employeeCount ? 'text-green-600' : 'text-red-600'
              }`}>
                ({data.currentPayroll.employeeCount >= data.previousPayroll.employeeCount ? '+' : ''}
                {data.currentPayroll.employeeCount - data.previousPayroll.employeeCount})
              </span>
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-200">
            <p className="text-sm text-gray-600 mb-2">Net Payroll Change</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.previousPayroll.totalNet)} → {formatCurrency(data.currentPayroll.totalNet)}
              <span className={`ml-2 text-lg ${
                data.currentPayroll.totalNet > data.previousPayroll.totalNet ? 'text-green-600' : 'text-red-600'
              }`}>
                ({data.currentPayroll.totalNet >= data.previousPayroll.totalNet ? '+' : ''}
                {formatCurrency(data.currentPayroll.totalNet - data.previousPayroll.totalNet)})
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
