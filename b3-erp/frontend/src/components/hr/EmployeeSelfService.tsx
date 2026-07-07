'use client';

import React, { useEffect, useState } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
  User,
  Calendar,
  FileText,
  DollarSign,
  Award,
  BookOpen,
  Clock,
  Download,
  Upload,
  Edit,
  Check,
  X,
  AlertCircle,
  Briefcase,
  Heart,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Home,
  Users,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Settings,
  ChevronRight,
  TrendingUp,
  Target,
  Activity,
} from 'lucide-react';
import {
  ApplyLeaveModal,
  UploadDocumentModal,
  NewServiceRequestModal,
  BrowseCoursesModal,
  DownloadPayslipModal
} from './EmployeeSelfServiceModals';

// Type Definitions
export type LeaveType = 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type DocumentCategory = 'personal' | 'payroll' | 'tax' | 'benefits' | 'performance' | 'training';
export type RequestType = 'leave' | 'reimbursement' | 'certificate' | 'shift-change' | 'work-from-home';
export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing';

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  manager: string;
  joinDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  location: string;
  workSchedule: string;
  profilePhoto?: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  label: string;
  total: number;
  used: number;
  pending: number;
  available: number;
  carryForward: number;
}

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  comments?: string;
}

export interface PayslipRecord {
  id: string;
  month: string;
  year: number;
  grossPay: number;
  netPay: number;
  deductions: number;
  tax: number;
  status: 'generated' | 'issued' | 'acknowledged';
  issueDate: string;
}

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  size: number;
  type: string;
  url: string;
}

export interface ServiceRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  submittedOn: string;
  updatedOn: string;
  priority: 'low' | 'medium' | 'high';
}

export interface BenefitEnrollment {
  id: string;
  benefitName: string;
  category: 'health' | 'insurance' | 'retirement' | 'wellness' | 'other';
  status: 'active' | 'pending' | 'expired';
  enrollmentDate: string;
  expiryDate?: string;
  coverage: string;
}

export interface TrainingRecord {
  id: string;
  courseName: string;
  category: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  completionDate?: string;
  score?: number;
  certificate?: string;
}

export default function EmployeeSelfService() {
  const [activeTab, setActiveTab] = useState<'profile' | 'leave' | 'payroll' | 'documents' | 'requests' | 'benefits' | 'training'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Modal states
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isBrowseCoursesModalOpen, setIsBrowseCoursesModalOpen] = useState(false);
  const [isDownloadPayslipModalOpen, setIsDownloadPayslipModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);

  // Mock Data
  const employeeProfile: EmployeeProfile = {
    id: 'emp-001',
    employeeId: 'EMP2025001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    manager: 'Jane Smith',
    joinDate: '2023-03-15',
    employmentType: 'full-time',
    location: 'Bangalore, India',
    workSchedule: 'Monday - Friday, 9:00 AM - 6:00 PM',
  };

  const leaveBalances: LeaveBalance[] = [
    { leaveType: 'annual', label: 'Annual Leave', total: 24, used: 8, pending: 2, available: 14, carryForward: 5 },
    { leaveType: 'sick', label: 'Sick Leave', total: 12, used: 3, pending: 0, available: 9, carryForward: 0 },
    { leaveType: 'casual', label: 'Casual Leave', total: 10, used: 4, pending: 1, available: 5, carryForward: 0 },
    { leaveType: 'maternity', label: 'Maternity Leave', total: 0, used: 0, pending: 0, available: 0, carryForward: 0 },
    { leaveType: 'paternity', label: 'Paternity Leave', total: 7, used: 0, pending: 0, available: 7, carryForward: 0 },
  ];

  const leaveHistory: LeaveRequest[] = [
    {
      id: 'lv-001',
      leaveType: 'annual',
      fromDate: '2025-02-10',
      toDate: '2025-02-14',
      days: 5,
      reason: 'Family vacation',
      status: 'pending',
      appliedOn: '2025-01-20',
    },
    {
      id: 'lv-002',
      leaveType: 'sick',
      fromDate: '2025-01-15',
      toDate: '2025-01-16',
      days: 2,
      reason: 'Medical consultation',
      status: 'approved',
      appliedOn: '2025-01-14',
      approvedBy: 'Jane Smith',
      approvedOn: '2025-01-14',
    },
  ];

  // Fallback payslips shown while the backend feed is loading or empty.
  const fallbackPayslips: PayslipRecord[] = [
    {
      id: 'ps-001',
      month: 'January',
      year: 2025,
      grossPay: 120000,
      netPay: 98500,
      deductions: 15000,
      tax: 6500,
      status: 'issued',
      issueDate: '2025-01-31',
    },
    {
      id: 'ps-002',
      month: 'December',
      year: 2024,
      grossPay: 120000,
      netPay: 97800,
      deductions: 15200,
      tax: 7000,
      status: 'acknowledged',
      issueDate: '2024-12-31',
    },
  ];

  // API-backed payslip feed (GET /hr/salary-slips). Defensive transform maps the
  // NestJS SalarySlip entity onto the local PayslipRecord shape; empty/errored
  // responses fall back to the mock so the tab never renders blank.
  const [apiPayslips, setApiPayslips] = useState<PayslipRecord[] | null>(null);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [payslipsError, setPayslipsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const num = (v: unknown): number => {
      const n = typeof v === 'string' ? parseFloat(v) : (v as number);
      return Number.isFinite(n) ? n : 0;
    };
    const mapStatus = (s: unknown): PayslipRecord['status'] => {
      const v = String(s ?? '').toLowerCase();
      if (v.includes('paid') || v.includes('sent')) return 'acknowledged';
      if (v.includes('generat')) return 'issued';
      return 'generated';
    };
    const transform = (raw: any[]): PayslipRecord[] =>
      raw
        .filter((r) => r && typeof r === 'object')
        .map((r, i) => {
          const monthIdx = num(r.month);
          const gross = num(r.grossSalary);
          const net = num(r.netSalary);
          const ded = num(r.totalDeductions);
          return {
            id: String(r.id ?? r.slipNumber ?? `slip-${i}`),
            month:
              monthIdx >= 1 && monthIdx <= 12
                ? MONTHS[monthIdx - 1]
                : String(r.month ?? '—'),
            year: num(r.year) || new Date().getFullYear(),
            grossPay: gross,
            netPay: net,
            deductions: ded,
            tax: num(r.tds) + num(r.professionalTax),
            status: mapStatus(r.status),
            issueDate: String(r.paymentDate ?? r.createdAt ?? '').slice(0, 10),
          } as PayslipRecord;
        });

    setPayslipsLoading(true);
    setPayslipsError(null);
    HrPayrollService.getSelfServiceSalarySlips()
      .then((rows) => {
        if (cancelled) return;
        setApiPayslips(transform(Array.isArray(rows) ? rows : []));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setPayslipsError(e instanceof Error ? e.message : 'Failed to load payslips');
        setApiPayslips([]);
      })
      .finally(() => {
        if (!cancelled) setPayslipsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Prefer live data when available; otherwise show the mock fallback.
  const payslips: PayslipRecord[] =
    apiPayslips && apiPayslips.length > 0 ? apiPayslips : fallbackPayslips;

  const documents: Document[] = [
    {
      id: 'doc-001',
      name: 'Offer Letter.pdf',
      category: 'personal',
      uploadDate: '2023-03-01',
      size: 245000,
      type: 'application/pdf',
      url: '#',
    },
    {
      id: 'doc-002',
      name: 'Form 16 - 2024.pdf',
      category: 'tax',
      uploadDate: '2024-06-15',
      size: 180000,
      type: 'application/pdf',
      url: '#',
    },
  ];

  const serviceRequests: ServiceRequest[] = [
    {
      id: 'req-001',
      type: 'certificate',
      title: 'Employment Certificate Request',
      description: 'Need employment certificate for visa application',
      status: 'processing',
      submittedOn: '2025-01-18',
      updatedOn: '2025-01-19',
      priority: 'high',
    },
  ];

  const benefits: BenefitEnrollment[] = [
    {
      id: 'ben-001',
      benefitName: 'Health Insurance - Family',
      category: 'health',
      status: 'active',
      enrollmentDate: '2023-04-01',
      expiryDate: '2026-03-31',
      coverage: 'Employee + Spouse + 2 Children',
    },
    {
      id: 'ben-002',
      benefitName: 'Provident Fund',
      category: 'retirement',
      status: 'active',
      enrollmentDate: '2023-03-15',
      coverage: '12% of Basic Salary',
    },
  ];

  const trainings: TrainingRecord[] = [
    {
      id: 'trn-001',
      courseName: 'Advanced React & TypeScript',
      category: 'Technical',
      status: 'completed',
      startDate: '2024-11-01',
      completionDate: '2024-12-15',
      score: 92,
      certificate: 'cert-adv-react-2024.pdf',
    },
    {
      id: 'trn-002',
      courseName: 'Leadership Fundamentals',
      category: 'Soft Skills',
      status: 'in-progress',
      startDate: '2025-01-10',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getLeaveStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'payroll', label: 'Payroll & Compensation', icon: DollarSign },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'requests', label: 'Service Requests', icon: AlertCircle },
    { id: 'benefits', label: 'Benefits', icon: Heart },
    { id: 'training', label: 'Training & Development', icon: GraduationCap },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3">
      <div>
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Self-Service Portal</h1>
          <p className="text-gray-600">Manage your profile, leave, payroll, and more</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.employeeId}
                      disabled
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={employeeProfile.email}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={employeeProfile.phone}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Department
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.department}
                      disabled
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Designation
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.designation}
                      disabled
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.manager}
                      disabled
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.location}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Work Schedule
                    </label>
                    <input
                      type="text"
                      value={employeeProfile.workSchedule}
                      disabled
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>

              {/* Leave Balances */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {leaveBalances.filter(lb => lb.total > 0).map((balance) => (
                    <div key={balance.leaveType} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{balance.label}</h4>
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-bold text-green-600">{balance.available} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Used:</span>
                          <span className="text-gray-900">{balance.used} days</span>
                        </div>
                        {balance.pending > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pending:</span>
                            <span className="text-yellow-600">{balance.pending} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Leave History</h3>
                  <button
                    onClick={() => setIsApplyLeaveModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Leave
                  </button>
                </div>
                <div className="space-y-3">
                  {leaveHistory.map((leave) => (
                    <div key={leave.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {leave.fromDate} to {leave.toDate} ({leave.days} days)
                            </p>
                            <p className="text-sm text-gray-600">{leave.reason}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLeaveStatusColor(leave.status)}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      {leave.approvedBy && (
                        <div className="text-sm text-gray-600 mt-2">
                          Approved by {leave.approvedBy} on {leave.approvedOn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Payroll & Compensation</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Latest Gross Pay</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(payslips[0].grossPay)}</p>
                  <p className="text-sm text-gray-600 mt-1">{payslips[0].month} {payslips[0].year}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Latest Net Pay</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(payslips[0].netPay)}</p>
                  <p className="text-sm text-gray-600 mt-1">{payslips[0].month} {payslips[0].year}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">YTD Earnings</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(payslips[0].grossPay)}</p>
                  <p className="text-sm text-gray-600 mt-1">Year 2025</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Payslip History</h3>
                  {payslipsLoading && (
                    <span className="text-sm text-gray-500">Loading…</span>
                  )}
                  {payslipsError && (
                    <span className="text-sm text-amber-600" title={payslipsError}>
                      Live feed unavailable — showing sample data
                    </span>
                  )}
                  {!payslipsLoading && !payslipsError && apiPayslips && apiPayslips.length === 0 && (
                    <span className="text-sm text-gray-500">No payslips found — showing sample data</span>
                  )}
                </div>
                <div className="space-y-3">
                  {payslips.map((payslip) => (
                    <div key={payslip.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{payslip.month} {payslip.year}</p>
                            <p className="text-sm text-gray-600">Net Pay: {formatCurrency(payslip.netPay)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPayslip(payslip);
                            setIsDownloadPayslipModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
                <button
                  onClick={() => setIsUploadDocModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.category} • {formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Uploaded: {doc.uploadDate}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
                <button
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Request
                </button>
              </div>

              <div className="space-y-3">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Submitted: {request.submittedOn}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.priority === 'high' ? 'bg-red-100 text-red-700' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Benefits & Enrollments</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit) => (
                  <div key={benefit.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">{benefit.benefitName}</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {benefit.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Coverage:</strong> {benefit.coverage}</p>
                      <p><strong>Enrolled:</strong> {benefit.enrollmentDate}</p>
                      {benefit.expiryDate && <p><strong>Expires:</strong> {benefit.expiryDate}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Training & Development</h2>
                <button
                  onClick={() => setIsBrowseCoursesModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>

              <div className="space-y-2">
                {trainings.map((training) => (
                  <div key={training.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{training.courseName}</p>
                          <p className="text-sm text-gray-600">{training.category}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        training.status === 'completed' ? 'bg-green-100 text-green-800' :
                        training.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {training.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Started: {training.startDate}</span>
                      {training.score && (
                        <span className="font-semibold text-green-600">Score: {training.score}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <ApplyLeaveModal
          isOpen={isApplyLeaveModalOpen}
          onClose={() => setIsApplyLeaveModalOpen(false)}
          onSubmit={(data: any) => {
            console.log('Leave application submitted:', data);
            setIsApplyLeaveModalOpen(false);
            // Show success message
            alert('Leave application submitted successfully!');
          }}
        />

        <UploadDocumentModal
          isOpen={isUploadDocModalOpen}
          onClose={() => setIsUploadDocModalOpen(false)}
          onUpload={(data: any) => {
            console.log('Document uploaded:', data);
            setIsUploadDocModalOpen(false);
            alert('Document uploaded successfully!');
          }}
        />

        <NewServiceRequestModal
          isOpen={isNewRequestModalOpen}
          onClose={() => setIsNewRequestModalOpen(false)}
          onSubmit={(data: any) => {
            console.log('Service request submitted:', data);
            setIsNewRequestModalOpen(false);
            alert('Service request submitted successfully!');
          }}
        />

        <BrowseCoursesModal
          isOpen={isBrowseCoursesModalOpen}
          onClose={() => setIsBrowseCoursesModalOpen(false)}
          onEnroll={(course: any) => {
            console.log('Enrolled in course:', course);
            alert(`Successfully enrolled in ${course.name}!`);
          }}
        />

        <DownloadPayslipModal
          isOpen={isDownloadPayslipModalOpen}
          onClose={() => setIsDownloadPayslipModalOpen(false)}
          payslip={selectedPayslip}
          onConfirm={(payslip: any) => {
            console.log('Downloading payslip:', payslip);
            alert(`Payslip for ${payslip.month} ${payslip.year} downloaded!`);
          }}
        />
      </div>
    </div>
  );
}
