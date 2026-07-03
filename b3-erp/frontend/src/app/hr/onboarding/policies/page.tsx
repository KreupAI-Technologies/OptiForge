'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileCheck, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, Eye, FileText, Shield, Heart, Briefcase, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface PolicyAcknowledgment {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  totalPolicies: number;
  acknowledgedPolicies: number;
  completionPercentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  lastAcknowledgedDate?: string;
  hrCoordinator: string;
}

interface Policy {
  id: string;
  policyName: string;
  category: 'hr' | 'safety' | 'it' | 'ethics' | 'leave' | 'general';
  description: string;
  mandatory: boolean;
  icon: any;
}

export default function PolicyAcknowledgmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const companyPolicies: Policy[] = [
    { id: '1', policyName: 'Code of Conduct', category: 'ethics', description: 'Professional behavior and ethical standards', mandatory: true, icon: Shield },
    { id: '2', policyName: 'Attendance & Punctuality Policy', category: 'hr', description: 'Working hours, late coming, and attendance rules', mandatory: true, icon: Clock },
    { id: '3', policyName: 'Leave Policy', category: 'leave', description: 'Annual leave, sick leave, and other leave types', mandatory: true, icon: FileText },
    { id: '4', policyName: 'Safety & Health Policy', category: 'safety', description: 'Workplace safety guidelines and PPE requirements', mandatory: true, icon: Shield },
    { id: '5', policyName: 'IT & Data Security Policy', category: 'it', description: 'Email usage, data protection, and cybersecurity', mandatory: true, icon: Shield },
    { id: '6', policyName: 'Sexual Harassment Policy (POSH)', category: 'hr', description: 'Prevention of Sexual Harassment Act compliance', mandatory: true, icon: Heart },
    { id: '7', policyName: 'Disciplinary Action Policy', category: 'hr', description: 'Misconduct categories and disciplinary procedures', mandatory: true, icon: AlertCircle },
    { id: '8', policyName: 'Confidentiality & NDA', category: 'ethics', description: 'Protection of company confidential information', mandatory: true, icon: Shield },
    { id: '9', policyName: 'Dress Code Policy', category: 'general', description: 'Professional attire guidelines', mandatory: false, icon: Users },
    { id: '10', policyName: 'Travel & Expense Reimbursement', category: 'general', description: 'Business travel and expense claim procedures', mandatory: false, icon: Briefcase }
  ];

  const [mockAcknowledgments, setMockAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('policies');
        if (!active) return;
        const mapped = records.map((r: OnboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joiningDate || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as PolicyAcknowledgment[];
        setMockAcknowledgments(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockAcknowledgments: PolicyAcknowledgment[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      totalPolicies: 10,
      acknowledgedPolicies: 10,
      completionPercentage: 100,
      status: 'completed',
      lastAcknowledgedDate: '2025-10-28',
      hrCoordinator: 'Priya HR'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      totalPolicies: 10,
      acknowledgedPolicies: 10,
      completionPercentage: 100,
      status: 'completed',
      lastAcknowledgedDate: '2025-10-30',
      hrCoordinator: 'Priya HR'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      totalPolicies: 10,
      acknowledgedPolicies: 6,
      completionPercentage: 60,
      status: 'in_progress',
      lastAcknowledgedDate: '2025-10-29',
      hrCoordinator: 'Neha HR'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      totalPolicies: 10,
      acknowledgedPolicies: 10,
      completionPercentage: 100,
      status: 'completed',
      lastAcknowledgedDate: '2025-10-25',
      hrCoordinator: 'Priya HR'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      totalPolicies: 10,
      acknowledgedPolicies: 3,
      completionPercentage: 30,
      status: 'in_progress',
      lastAcknowledgedDate: '2025-10-31',
      hrCoordinator: 'Neha HR'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      totalPolicies: 10,
      acknowledgedPolicies: 0,
      completionPercentage: 0,
      status: 'pending',
      hrCoordinator: 'Priya HR'
    }
  ];

  const filteredAcknowledgments = useMemo(() => {
    return mockAcknowledgments.filter(ack => {
      const matchesSearch = searchTerm === '' ||
        ack.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ack.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ack.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ack.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || ack.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockAcknowledgments.length,
    pending: mockAcknowledgments.filter(a => a.status === 'pending').length,
    inProgress: mockAcknowledgments.filter(a => a.status === 'in_progress').length,
    completed: mockAcknowledgments.filter(a => a.status === 'completed').length,
    avgCompletion: Math.round(mockAcknowledgments.reduce((sum, a) => sum + a.completionPercentage, 0) / mockAcknowledgments.length),
    mandatoryPolicies: companyPolicies.filter(p => p.mandatory).length,
    totalPolicies: companyPolicies.length
  };

  const getStatusColor = (status: PolicyAcknowledgment['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: PolicyAcknowledgment['status']) => {
    const icons = {
      'pending': Clock,
      'in_progress': FileCheck,
      'completed': CheckCircle
    };
    return icons[status];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryColor = (category: Policy['category']) => {
    const colors = {
      'hr': 'bg-blue-100 text-blue-700',
      'safety': 'bg-red-100 text-red-700',
      'it': 'bg-purple-100 text-purple-700',
      'ethics': 'bg-green-100 text-green-700',
      'leave': 'bg-yellow-100 text-yellow-700',
      'general': 'bg-gray-100 text-gray-700'
    };
    return colors[category];
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: PolicyAcknowledgment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
            {row.employeeName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.employeeCode}</div>
            <div className="text-xs text-gray-600">{row.designation}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value: string, row: PolicyAcknowledgment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.hrCoordinator}</div>
        </div>
      )
    },
    {
      key: 'acknowledgedPolicies',
      label: 'Progress',
      sortable: true,
      render: (value: number, row: PolicyAcknowledgment) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {value} / {row.totalPolicies}
            </span>
            <span className="text-xs text-gray-500">{row.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(row.completionPercentage)}`}
              style={{ width: `${row.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'lastAcknowledgedDate',
      label: 'Last Activity',
      sortable: true,
      render: (value: string | undefined) => (
        <div className="text-sm text-gray-700">
          {value ? (
            new Date(value).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          ) : (
            <span className="text-gray-400">Not Started</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: PolicyAcknowledgment['status']) => {
        const StatusIcon = getStatusIcon(value);
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
            <StatusIcon className="w-3 h-3" />
            {value.replace('_', ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: PolicyAcknowledgment) => (
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const departments = Array.from(new Set(mockAcknowledgments.map(a => a.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileCheck className="h-8 w-8 text-blue-600" />
          Policy Acknowledgment
        </h1>
        <p className="text-gray-600 mt-2">Track employee acknowledgment of company policies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
            </div>
            <FileCheck className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 font-medium">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-900">{stats.avgCompletion}%</p>
            </div>
            <FileText className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium">Mandatory</p>
              <p className="text-2xl font-bold text-red-900">{stats.mandatoryPolicies}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Total Policies</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.totalPolicies}</p>
            </div>
            <FileText className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, employee code, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(statusFilter !== 'all' || departmentFilter !== 'all' || searchTerm) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Status: {statusFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {departmentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Department: {departmentFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDepartmentFilter('all')} />
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Search: {searchTerm}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acknowledgments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <DataTable
          data={filteredAcknowledgments}
          columns={columns}
        />
      </div>

      {/* Company Policies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Company Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {companyPolicies.map((policy) => (
            <div
              key={policy.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <policy.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{policy.policyName}</h4>
                  {policy.mandatory && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{policy.description}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(policy.category)}`}>
                  {policy.category.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Policy Acknowledgment Guidelines
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Mandatory Requirement:</strong> All employees must acknowledge company policies before Day 1</li>
          <li>• <strong>Reading Time:</strong> Employees must spend minimum 5 minutes per policy document</li>
          <li>• <strong>Digital Signature:</strong> Electronic acknowledgment recorded with timestamp and IP address</li>
          <li>• <strong>Mandatory Policies:</strong> Cannot proceed to onboarding completion without acknowledging all 8 mandatory policies</li>
          <li>• <strong>Policy Updates:</strong> Employees notified when policies are revised and must re-acknowledge</li>
          <li>• <strong>Audit Trail:</strong> All policy acknowledgments maintained for legal compliance</li>
          <li>• <strong>Consequence:</strong> Non-acknowledgment may delay joining date</li>
          <li>• <strong>Language:</strong> Policies available in English and Hindi for better understanding</li>
        </ul>
      </div>
    </div>
  );
}
