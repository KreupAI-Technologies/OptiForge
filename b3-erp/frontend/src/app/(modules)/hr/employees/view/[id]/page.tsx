'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceService } from '@/services/attendance.service';
import { LeaveService } from '@/services/leave.service';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  CreditCard,
  Target,
} from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  department: string;
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'on_leave' | 'inactive' | 'terminated';
  joinDate: string;
  confirmationDate: string;
  manager: string;
  reportingTo: string;
  location: string;

  salary: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  esiNumber: string;

  performanceRating: number;
  leaveBalance: number;
  totalLeave: number;
  usedLeave: number;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;

  education: string;
  previousExperience: number;
  skills: string[];

  createdDate: string;
  lastUpdated: string;
}

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  hoursWorked: number;
}

interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
}

export default function ViewEmployeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'documents' | 'activity'>('overview');
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('all');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const handleDocumentCategoryClick = (category: string) => {
    setSelectedDocCategory(category);
    // In a real app, this would filter the documents displayed
    console.log(`Filtering documents by category: ${category}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadFiles([...uploadFiles, ...files]);
      // In a real app, you would upload these files to the server
      console.log('Files to upload:', files);
      alert(`Selected ${files.length} file(s) for upload`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadFiles([...uploadFiles, ...files]);
      console.log('Files dropped:', files);
      alert(`Dropped ${files.length} file(s) for upload`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Mock employee data
  const employee: Employee = {
    id: params.id,
    employeeId: 'B3-001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@b3macbis.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    bloodGroup: 'B+',

    address: 'Plot No. 123, MIDC Area, Phase 2',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411019',
    country: 'India',

    department: 'Production',
    position: 'Production Manager',
    employmentType: 'full_time',
    status: 'active',
    joinDate: '2020-03-15',
    confirmationDate: '2020-09-15',
    manager: 'Sarah Johnson',
    reportingTo: 'Sarah Johnson - VP Operations',
    location: 'Factory - Building A',

    salary: 75000,
    bankName: 'HDFC Bank',
    accountNumber: '12345678901234',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '1234 5678 9012',
    uanNumber: 'UAN123456789012',
    esiNumber: 'ESI1234567890',

    performanceRating: 4.5,
    leaveBalance: 18,
    totalLeave: 24,
    usedLeave: 6,

    emergencyContactName: 'Priya Kumar',
    emergencyContactPhone: '+91 98765 43212',
    emergencyContactRelation: 'Spouse',

    education: 'B.Tech in Mechanical Engineering',
    previousExperience: 5,
    skills: ['Production Planning', 'Quality Control', 'Lean Manufacturing', 'Team Management'],

    createdDate: '2020-03-15',
    lastUpdated: '2024-01-20',
  };

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [attRaw, leaveRaw] = await Promise.all([
          AttendanceService.getAttendance({ employeeId: params.id }),
          LeaveService.getAllLeaveApplicationsRaw(),
        ]);
        const fmtTime = (v: any) =>
          v ? new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-';
        const attMapped: AttendanceRecord[] = (attRaw as any[]).map((a) => ({
          date: (a?.date ? new Date(a.date).toISOString().slice(0, 10) : '') ?? '',
          checkIn: fmtTime(a?.checkInTime),
          checkOut: fmtTime(a?.checkOutTime),
          status: (a?.status ?? 'present') as AttendanceRecord['status'],
          hoursWorked: a?.totalHours ?? 0,
        }));
        const leaveMapped: LeaveRecord[] = (leaveRaw as any[]).map((l) => ({
          id: l?.id ?? '',
          leaveType: l?.leaveType ?? l?.leaveTypeName ?? l?.type ?? '',
          startDate: l?.startDate ?? l?.fromDate ?? '',
          endDate: l?.endDate ?? l?.toDate ?? '',
          days: l?.days ?? l?.numberOfDays ?? 0,
          status: (l?.status ?? 'pending') as LeaveRecord['status'],
          reason: l?.reason ?? '',
        }));
        if (!cancelled) {
          setAttendanceRecords(attMapped);
          setLeaveRecords(leaveMapped);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setAttendanceRecords([]);
          setLeaveRecords([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Activity timeline
  const activities = [
    { date: '2024-01-20 09:05', user: 'System', action: 'Checked in for today', type: 'info' },
    { date: '2024-01-19 18:02', user: 'System', action: 'Checked out', type: 'info' },
    { date: '2024-01-16', user: 'Sarah Johnson', action: 'Approved sick leave request', type: 'success' },
    { date: '2024-01-15', user: 'Rajesh Kumar', action: 'Applied for sick leave', type: 'info' },
    { date: '2024-01-10', user: 'HR Department', action: 'Performance review completed - Rating: 4.5', type: 'success' },
    { date: '2024-01-05', user: 'Payroll', action: 'Salary credited for December 2023', type: 'success' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'on_leave':
        return { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> };
      case 'inactive':
        return { label: 'Inactive', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-4 h-4" /> };
      case 'terminated':
        return { label: 'Terminated', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const getEmploymentTypeConfig = (type: string) => {
    switch (type) {
      case 'full_time':
        return { label: 'Full Time', color: 'bg-blue-100 text-blue-700' };
      case 'part_time':
        return { label: 'Part Time', color: 'bg-purple-100 text-purple-700' };
      case 'contract':
        return { label: 'Contract', color: 'bg-orange-100 text-orange-700' };
      case 'intern':
        return { label: 'Intern', color: 'bg-pink-100 text-pink-700' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getAttendanceStatusConfig = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'Present', color: 'bg-green-100 text-green-700' };
      case 'absent':
        return { label: 'Absent', color: 'bg-red-100 text-red-700' };
      case 'half_day':
        return { label: 'Half Day', color: 'bg-yellow-100 text-yellow-700' };
      case 'leave':
        return { label: 'Leave', color: 'bg-blue-100 text-blue-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getLeaveStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-700' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusConfig = getStatusConfig(employee.status);
  const employmentTypeConfig = getEmploymentTypeConfig(employee.employmentType);

  const handleEdit = () => {
    router.push(`/hr/employees/edit/${params.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      router.push('/hr/employees');
    }
  };

  const handleBack = () => {
    router.push('/hr/employees');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Award
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{employee.fullName}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${employmentTypeConfig.color}`}>
                  {employmentTypeConfig.label}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {employee.employeeId} • {employee.position} • {employee.department}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <Calendar className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {Math.floor((new Date().getTime() - new Date(employee.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}y
            </div>
            <div className="text-blue-100 text-sm">Tenure</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{employee.performanceRating.toFixed(1)}</div>
            <div className="text-green-100 text-sm">Performance Rating</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
            <Clock className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{employee.leaveBalance}</div>
            <div className="text-purple-100 text-sm">Leave Balance</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
            <DollarSign className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">₹{(employee.salary / 1000).toFixed(0)}K</div>
            <div className="text-orange-100 text-sm">Monthly Salary</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white">
            <Target className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{Math.round((employee.totalLeave - employee.usedLeave) / employee.totalLeave * 100)}%</div>
            <div className="text-indigo-100 text-sm">Attendance Rate</div>
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
                onClick={() => setActiveTab('leave')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'leave'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Leave History
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Documents
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
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Date of Birth</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(employee.dateOfBirth).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Gender</div>
                      <div className="font-semibold text-gray-900">{employee.gender}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Blood Group</div>
                      <div className="font-semibold text-gray-900">{employee.bloodGroup}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <div className="font-semibold text-gray-900">{employee.email}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <div className="font-semibold text-gray-900">{employee.phone}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Alternate Phone</span>
                      </div>
                      <div className="font-semibold text-gray-900">{employee.alternatePhone}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Location</span>
                      </div>
                      <div className="font-semibold text-gray-900">{employee.location}</div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-900 font-semibold mb-2">{employee.address}</div>
                    <div className="text-gray-600">
                      {employee.city}, {employee.state} - {employee.pincode}
                    </div>
                    <div className="text-gray-600">{employee.country}</div>
                  </div>
                </div>

                {/* Employment Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Department</div>
                      <div className="font-semibold text-gray-900">{employee.department}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Position</div>
                      <div className="font-semibold text-gray-900">{employee.position}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Join Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(employee.joinDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Confirmation Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(employee.confirmationDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Reporting To</div>
                      <div className="font-semibold text-gray-900">{employee.reportingTo}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Work Location</div>
                      <div className="font-semibold text-gray-900">{employee.location}</div>
                    </div>
                  </div>
                </div>

                {/* Performance & Leave */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      Performance
                    </h3>
                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Overall Rating</div>
                          <div className="text-4xl font-bold text-yellow-600">{employee.performanceRating.toFixed(1)}</div>
                        </div>
                        <div className="text-right">
                          {renderStars(Math.round(employee.performanceRating))}
                          <div className="text-xs text-gray-600 mt-1">Out of 5.0</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Leave Balance
                    </h3>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{employee.totalLeave}</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{employee.usedLeave}</div>
                          <div className="text-xs text-gray-600">Used</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{employee.leaveBalance}</div>
                          <div className="text-xs text-gray-600">Balance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Statutory Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">PAN Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.panNumber}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Aadhaar Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.aadhaarNumber}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">UAN Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.uanNumber}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">ESI Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.esiNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Bank Name</div>
                      <div className="font-semibold text-gray-900">{employee.bankName}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Account Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.accountNumber}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">IFSC Code</div>
                      <div className="font-semibold text-gray-900 font-mono">{employee.ifscCode}</div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Emergency Contact
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-sm text-red-600 mb-1">Name</div>
                        <div className="font-semibold text-gray-900">{employee.emergencyContactName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-red-600 mb-1">Phone</div>
                        <div className="font-semibold text-gray-900">{employee.emergencyContactPhone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-red-600 mb-1">Relation</div>
                        <div className="font-semibold text-gray-900">{employee.emergencyContactRelation}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Skills */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Education
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">{employee.education}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        Previous Experience: {employee.previousExperience} years
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Attendance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hours Worked</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceRecords.map((record, index) => {
                        const statusConfig = getAttendanceStatusConfig(record.status);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-semibold text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-4 text-gray-600">{record.checkIn}</td>
                            <td className="px-4 py-4 text-gray-600">{record.checkOut}</td>
                            <td className="px-4 py-4 font-semibold text-gray-900">
                              {record.hoursWorked > 0 ? `${record.hoursWorked.toFixed(2)} hrs` : '-'}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leave Tab */}
            {activeTab === 'leave' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Leave History</h3>
                <div className="space-y-2">
                  {leaveRecords.map((leave) => {
                    const statusConfig = getLeaveStatusConfig(leave.status);
                    return (
                      <div key={leave.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">{leave.leaveType}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(leave.startDate).toLocaleDateString('en-IN')} - {new Date(leave.endDate).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            <div className="text-sm font-semibold text-gray-900 mt-2">{leave.days} day(s)</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {leave.reason}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Employee Documents Vault
                </h3>

                {/* Document Categories */}
                <div className="grid grid-cols-4 gap-2">
                  <div
                    onClick={() => handleDocumentCategoryClick('identity')}
                    className={`p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                      selectedDocCategory === 'identity' ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-blue-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Identity Docs</div>
                  </div>
                  <div
                    onClick={() => handleDocumentCategoryClick('certifications')}
                    className={`p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                      selectedDocCategory === 'certifications' ? 'border-green-500 shadow-lg ring-2 ring-green-200' : 'border-green-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </div>
                  <div
                    onClick={() => handleDocumentCategoryClick('hr-forms')}
                    className={`p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                      selectedDocCategory === 'hr-forms' ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-purple-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">5</div>
                    <div className="text-sm text-gray-600">HR Forms</div>
                  </div>
                  <div
                    onClick={() => handleDocumentCategoryClick('all')}
                    className={`p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border cursor-pointer hover:shadow-lg transition-all ${
                      selectedDocCategory === 'all' ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' : 'border-orange-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">15</div>
                    <div className="text-sm text-gray-600">All Documents</div>
                  </div>
                </div>

                {/* Document List */}
                <div className="space-y-3">
                  {/* Identity Documents */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Identity Documents
                    </div>
                    <div className="space-y-2">
                      {['Aadhaar Card.pdf', 'PAN Card.pdf', 'Passport Copy.pdf', 'Driving License.pdf'].map((doc) => (
                        <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doc}</div>
                              <div className="text-xs text-gray-600">Uploaded on 15 Mar 2020 • 234 KB</div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Professional Certifications
                    </div>
                    <div className="space-y-2">
                      {[
                        'B.Tech Degree Certificate.pdf',
                        'Six Sigma Green Belt.pdf',
                        'Lean Manufacturing Certificate.pdf',
                        'Safety Training Completion.pdf',
                      ].map((doc) => (
                        <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doc}</div>
                              <div className="text-xs text-gray-600">Valid until Dec 2026 • 156 KB</div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HR Forms */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      HR Forms & Agreements
                    </div>
                    <div className="space-y-2">
                      {[
                        'Employment Agreement.pdf',
                        'Offer Letter.pdf',
                        'NDA Agreement.pdf',
                        'Background Verification Report.pdf',
                      ].map((doc) => (
                        <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doc}</div>
                              <div className="text-xs text-gray-600">Signed on 10 Mar 2020 • 512 KB</div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload New Document */}
                <div
                  onClick={() => document.getElementById('document-upload-input')?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <input
                    id="document-upload-input"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileText className="w-12 h-12 text-gray-400 mb-3" />
                  <div className="font-semibold text-gray-900 mb-1">Upload New Document</div>
                  <div className="text-sm text-gray-600">Drag and drop files here or click to browse</div>
                  <div className="text-xs text-gray-500 mt-2">Supports PDF, JPG, PNG, DOC, DOCX</div>
                </div>

                {/* Skill Matrix */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Skill Matrix & Competency Levels
                  </h4>
                  <div className="space-y-2">
                    {[
                      { skill: 'Production Planning', level: 90, category: 'Technical' },
                      { skill: 'Quality Control', level: 85, category: 'Technical' },
                      { skill: 'Lean Manufacturing', level: 80, category: 'Process' },
                      { skill: 'Team Management', level: 88, category: 'Leadership' },
                      { skill: 'Problem Solving', level: 82, category: 'Soft Skills' },
                      { skill: 'Communication', level: 75, category: 'Soft Skills' },
                    ].map((item) => (
                      <div key={item.skill}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">{item.skill}</span>
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{item.category}</span>
                          </div>
                          <span className="font-bold text-indigo-600">{item.level}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.level >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              item.level >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                            style={{ width: `${item.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Progression Timeline */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Career Progression Timeline
                  </h4>
                  <div className="space-y-2">
                    {[
                      { date: '2020-03', role: 'Production Supervisor', type: 'joined' },
                      { date: '2020-09', role: 'Production Supervisor', type: 'confirmed' },
                      { date: '2021-10', role: 'Senior Production Supervisor', type: 'promoted' },
                      { date: '2023-04', role: 'Production Manager', type: 'promoted' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'promoted' ? 'bg-purple-100' :
                            item.type === 'confirmed' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {item.type === 'promoted' ? (
                              <TrendingUp className="w-5 h-5 text-purple-600" />
                            ) : item.type === 'confirmed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <User className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          {idx < 3 && <div className="w-0.5 h-12 bg-purple-200 my-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-sm text-gray-600 mb-1">
                            {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </div>
                          <div className="font-semibold text-gray-900">{item.role}</div>
                          <div className="text-sm text-purple-600 capitalize">{item.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Timeline</h3>
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'success' ? 'bg-green-100' :
                          activity.type === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="text-sm text-gray-600 mb-1">{activity.date}</div>
                        <div className="font-semibold text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-600">by {activity.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
