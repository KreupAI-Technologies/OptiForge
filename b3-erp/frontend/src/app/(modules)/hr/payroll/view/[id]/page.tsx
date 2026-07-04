'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { printCurrentView } from '@/lib/export';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
  ArrowLeft,
  Edit,
  Download,
  DollarSign,
  Calendar,
  User,
  Building2,
  Briefcase,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  Banknote,
  Wallet,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface PayrollEntry {
  id: string;
  payrollNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  payPeriod: string;
  payDate: string;
  status: 'draft' | 'processed' | 'paid' | 'cancelled';
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  esi: number;
  loans: number;
  otherDeductions: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  overtimeHours: number;
  overtimePay: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  uanNumber: string;
  processedBy: string;
  processedDate: string;
  paidDate: string;
  remarks: string;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export default function ViewPayrollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'attendance' | 'activity' | 'analytics'>('overview');

  // Mock data - replace with API call
  const payroll: PayrollEntry = {
    id: params.id,
    payrollNumber: 'PAY-2025-0001',
    employeeId: 'B3-0001',
    employeeName: 'Rajesh Kumar',
    department: 'Production',
    position: 'Production Supervisor',
    email: 'rajesh.kumar@b3erp.com',
    phone: '+91 98765 43210',
    payPeriod: 'October 2025',
    payDate: '2025-10-30',
    status: 'paid',
    basicSalary: 45000,
    hra: 18000,
    transportAllowance: 3000,
    medicalAllowance: 2500,
    specialAllowance: 5000,
    otherAllowances: 1500,
    providentFund: 5400,
    professionalTax: 200,
    incomeTax: 4500,
    esi: 675,
    loans: 2000,
    otherDeductions: 500,
    grossSalary: 75000,
    totalDeductions: 13275,
    netSalary: 61725,
    workingDays: 26,
    presentDays: 24,
    leaveDays: 2,
    overtimeHours: 8,
    overtimePay: 2000,
    bankName: 'HDFC Bank',
    accountNumber: '50100123456789',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE1234F',
    uanNumber: '101234567890',
    processedBy: 'Sunita Reddy',
    processedDate: '2025-10-28',
    paidDate: '2025-10-30',
    remarks: 'Salary processed successfully for October 2025',
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrPayrollService.getReportsBy('activity');
        const mapped: Activity[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
        if (!cancelled) setActivities(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setActivities([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDownloadPayslip = () => {
    printCurrentView();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
      {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{payroll.payrollNumber}</h1>
              <p className="text-gray-600 mt-1">{payroll.payPeriod} Payroll</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPayslip}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Payslip
            </button>
            <button
              onClick={() => router.push(`/hr/payroll/edit/${params.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{payroll.grossSalary.toLocaleString('en-IN')}</div>
            <div className="text-blue-100 text-sm mt-1">Gross Salary</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{payroll.totalDeductions.toLocaleString('en-IN')}</div>
            <div className="text-red-100 text-sm mt-1">Total Deductions</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Banknote className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{payroll.netSalary.toLocaleString('en-IN')}</div>
            <div className="text-green-100 text-sm mt-1">Net Salary</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{payroll.presentDays}/{payroll.workingDays}</div>
            <div className="text-purple-100 text-sm mt-1">Days Worked</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{new Date(payroll.payDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            <div className="text-orange-100 text-sm mt-1">Payment Date</div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`px-4 py-3 rounded-lg border mb-3 ${getStatusColor(payroll.status)}`}>
          <div className="flex items-center gap-2">
            {payroll.status === 'paid' && <CheckCircle2 className="w-5 h-5" />}
            {payroll.status === 'cancelled' && <XCircle className="w-5 h-5" />}
            <span className="font-semibold">
              Status: {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
            </span>
            {payroll.status === 'paid' && (
              <span className="ml-auto text-sm">
                Paid on {new Date(payroll.paidDate).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'breakdown'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Salary Breakdown
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'attendance'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Tax & Analytics
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Employee Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Employee Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Employee ID</label>
                      <p className="font-semibold text-gray-900">{payroll.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Employee Name</label>
                      <p className="font-semibold text-gray-900">{payroll.employeeName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Department</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {payroll.department}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Position</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {payroll.position}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {payroll.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {payroll.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payroll Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Payroll Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Pay Period</label>
                      <p className="font-semibold text-gray-900">{payroll.payPeriod}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Payment Date</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(payroll.payDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Processed By</label>
                      <p className="font-semibold text-gray-900">{payroll.processedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Processed Date</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(payroll.processedDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Bank Name</label>
                      <p className="font-semibold text-gray-900">{payroll.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Account Number</label>
                      <p className="font-semibold text-gray-900">{payroll.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">IFSC Code</label>
                      <p className="font-semibold text-gray-900">{payroll.ifscCode}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">PAN Number</label>
                      <p className="font-semibold text-gray-900">{payroll.panNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">UAN Number</label>
                      <p className="font-semibold text-gray-900">{payroll.uanNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {payroll.remarks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Remarks
                    </h3>
                    <p className="text-gray-700">{payroll.remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Salary Breakdown Tab */}
            {activeTab === 'breakdown' && (
              <div className="space-y-3">
                {/* Earnings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Earnings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Basic Salary</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.basicSalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">House Rent Allowance (HRA)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.hra.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Transport Allowance</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.transportAllowance.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Medical Allowance</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.medicalAllowance.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Special Allowance</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.specialAllowance.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Overtime Pay ({payroll.overtimeHours} hrs)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.overtimePay.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Other Allowances</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.otherAllowances.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                      <span className="font-semibold text-green-900">Total Earnings</span>
                      <span className="font-bold text-green-900 text-lg">
                        ₹{payroll.grossSalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Deductions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Provident Fund (PF)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.providentFund.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Professional Tax</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.professionalTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Income Tax (TDS)</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.incomeTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">ESI</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.esi.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Loan Repayment</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.loans.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Other Deductions</span>
                      <span className="font-semibold text-gray-900">
                        ₹{payroll.otherDeductions.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                      <span className="font-semibold text-red-900">Total Deductions</span>
                      <span className="font-bold text-red-900 text-lg">
                        ₹{payroll.totalDeductions.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-blue-100 mb-1">Net Salary</p>
                      <p className="text-3xl font-bold">₹{payroll.netSalary.toLocaleString('en-IN')}</p>
                    </div>
                    <Banknote className="w-16 h-16 opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-700 font-medium">Total Working Days</span>
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{payroll.workingDays}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-700 font-medium">Present Days</span>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-900">{payroll.presentDays}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-700 font-medium">Leave Days</span>
                      <XCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-900">{payroll.leaveDays}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-700 font-medium">Overtime Hours</span>
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{payroll.overtimeHours} hrs</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Attendance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="font-semibold text-gray-900">
                        {((payroll.presentDays / payroll.workingDays) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overtime Pay Rate</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(payroll.overtimePay / payroll.overtimeHours).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Day Salary</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(payroll.basicSalary / payroll.workingDays).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                      <p className="text-sm text-gray-500">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tax & Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tax Optimization & Salary Analytics</h3>

                {/* Tax Breakdown Chart */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    Tax Breakdown & Optimization
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-1">₹{payroll.incomeTax.toLocaleString('en-IN')}</div>
                      <div className="text-sm text-gray-600">Income Tax (TDS)</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">₹{payroll.providentFund.toLocaleString('en-IN')}</div>
                      <div className="text-sm text-gray-600">Provident Fund</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">₹{(payroll.incomeTax * 0.15).toFixed(0)}</div>
                      <div className="text-sm text-gray-600">Potential Savings</div>
                    </div>
                  </div>
                  
                  {/* Tax Optimization Suggestions */}
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">80C Deduction Utilized</div>
                          <div className="text-xs text-gray-600 mt-1">
                            PF contribution of ₹{payroll.providentFund.toLocaleString('en-IN')} eligible under Section 80C.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">HRA Optimization Opportunity</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Current HRA: ₹{payroll.hra.toLocaleString('en-IN')}. Submit rent receipts to claim exemption.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Comparison Analytics */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Salary Comparison & Market Benchmarking
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Your Annual CTC</div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">₹{(payroll.grossSalary * 12).toLocaleString('en-IN')}</div>
                      <div className="text-sm text-gray-600">Per Annum</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Market Average</div>
                      <div className="text-3xl font-bold text-gray-600 mb-1">₹{((payroll.grossSalary * 12) * 1.08).toLocaleString('en-IN')}</div>
                      <div className="text-sm text-green-600 font-medium">Within 8% of market</div>
                    </div>
                  </div>

                  {/* Percentile Ranking */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700 font-medium">Salary Percentile</span>
                      <span className="text-lg font-bold text-blue-600">78th percentile</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  {/* YoY Growth */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">+12%</div>
                      <div className="text-xs text-gray-600">YoY Growth</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">₹{(payroll.grossSalary * 0.12).toFixed(0)}</div>
                      <div className="text-xs text-gray-600">Increment</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-1">Oct 2024</div>
                      <div className="text-xs text-gray-600">Last Revision</div>
                    </div>
                  </div>
                </div>

                {/* Payslip Generator */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-indigo-600" />
                    Payslip & Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Download className="w-5 h-5 text-indigo-600" />
                        <div className="font-semibold text-gray-900">Download Payslip (PDF)</div>
                      </div>
                      <div className="text-xs text-gray-600">Salary slip for {payroll.payPeriod}</div>
                    </button>
                    <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div className="font-semibold text-gray-900">Form 16 (Annual)</div>
                      </div>
                      <div className="text-xs text-gray-600">TDS certificate FY 2024-25</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
