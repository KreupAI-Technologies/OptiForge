'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckSquare, CheckCircle, Clock, AlertCircle, User, Calendar, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ChecklistItem {
  id: string;
  task: string;
  category: 'documents' | 'hr' | 'it' | 'facilities' | 'department' | 'training';
  owner: string;
  status: 'pending' | 'completed' | 'in_progress';
  completedDate?: string;
}

interface EmployeeOnboarding {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  reportingManager: string;
  checklist: ChecklistItem[];
  overallProgress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOnboarding | null>(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const [mockOnboardings, setMockOnboardings] = useState<EmployeeOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('checklist');
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
          ...(r.items ? { checklist: r.items } : {}),
        })) as EmployeeOnboarding[];
        setMockOnboardings(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockOnboardings: EmployeeOnboarding[] = [
    {
      id: '1', employeeCode: 'KMF-2024-145', employeeName: 'Arun Verma', designation: 'CNC Operator',
      department: 'Manufacturing', joiningDate: '2024-12-01', reportingManager: 'Rajesh Kumar',
      overallProgress: 75, status: 'in_progress',
      checklist: [
        { id: '1', task: 'Submit all documents', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-18' },
        { id: '2', task: 'Document verification', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-20' },
        { id: '3', task: 'Create employee account', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-21' },
        { id: '4', task: 'Issue employee ID card', category: 'hr', owner: 'HR Admin', status: 'in_progress', completedDate: undefined },
        { id: '5', task: 'Setup email account', category: 'it', owner: 'IT Team', status: 'completed', completedDate: '2024-10-22' },
        { id: '6', task: 'Assign workstation', category: 'facilities', owner: 'Facilities', status: 'pending', completedDate: undefined },
        { id: '7', task: 'Safety induction training', category: 'training', owner: 'Safety Officer', status: 'completed', completedDate: '2024-10-23' },
        { id: '8', task: 'Department orientation', category: 'department', owner: 'Manager', status: 'pending', completedDate: undefined }
      ]
    },
    {
      id: '2', employeeCode: 'KMF-2024-146', employeeName: 'Sneha Patil', designation: 'Quality Inspector',
      department: 'Quality Assurance', joiningDate: '2024-12-05', reportingManager: 'Meena Rao',
      overallProgress: 100, status: 'completed',
      checklist: [
        { id: '1', task: 'Submit all documents', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-20' },
        { id: '2', task: 'Document verification', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-22' },
        { id: '3', task: 'Create employee account', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-23' },
        { id: '4', task: 'Issue employee ID card', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-24' },
        { id: '5', task: 'Setup email account', category: 'it', owner: 'IT Team', status: 'completed', completedDate: '2024-10-24' },
        { id: '6', task: 'Assign workstation', category: 'facilities', owner: 'Facilities', status: 'completed', completedDate: '2024-10-25' },
        { id: '7', task: 'Safety induction training', category: 'training', owner: 'Safety Officer', status: 'completed', completedDate: '2024-10-25' },
        { id: '8', task: 'Department orientation', category: 'department', owner: 'Manager', status: 'completed', completedDate: '2024-10-26' }
      ]
    },
    {
      id: '3', employeeCode: 'KMF-2024-147', employeeName: 'Karthik Reddy', designation: 'Production Supervisor',
      department: 'Manufacturing', joiningDate: '2024-11-25', reportingManager: 'Rajesh Kumar',
      overallProgress: 100, status: 'completed',
      checklist: [
        { id: '1', task: 'Submit all documents', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-14' },
        { id: '2', task: 'Document verification', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-16' },
        { id: '3', task: 'Create employee account', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-17' },
        { id: '4', task: 'Issue employee ID card', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-18' },
        { id: '5', task: 'Setup email account', category: 'it', owner: 'IT Team', status: 'completed', completedDate: '2024-10-18' },
        { id: '6', task: 'Assign workstation', category: 'facilities', owner: 'Facilities', status: 'completed', completedDate: '2024-10-19' },
        { id: '7', task: 'Safety induction training', category: 'training', owner: 'Safety Officer', status: 'completed', completedDate: '2024-10-19' },
        { id: '8', task: 'Department orientation', category: 'department', owner: 'Manager', status: 'completed', completedDate: '2024-10-20' }
      ]
    },
    {
      id: '4', employeeCode: 'KMF-2024-148', employeeName: 'Neha Singh', designation: 'Maintenance Technician',
      department: 'Maintenance', joiningDate: '2024-12-10', reportingManager: 'Suresh Patel',
      overallProgress: 50, status: 'in_progress',
      checklist: [
        { id: '1', task: 'Submit all documents', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-22' },
        { id: '2', task: 'Document verification', category: 'documents', owner: 'HR', status: 'completed', completedDate: '2024-10-23' },
        { id: '3', task: 'Create employee account', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-24' },
        { id: '4', task: 'Issue employee ID card', category: 'hr', owner: 'HR Admin', status: 'completed', completedDate: '2024-10-25' },
        { id: '5', task: 'Setup email account', category: 'it', owner: 'IT Team', status: 'pending', completedDate: undefined },
        { id: '6', task: 'Assign workstation', category: 'facilities', owner: 'Facilities', status: 'pending', completedDate: undefined },
        { id: '7', task: 'Safety induction training', category: 'training', owner: 'Safety Officer', status: 'pending', completedDate: undefined },
        { id: '8', task: 'Department orientation', category: 'department', owner: 'Manager', status: 'pending', completedDate: undefined }
      ]
    },
    {
      id: '5', employeeCode: 'KMF-2024-149', employeeName: 'Divya Nair', designation: 'Safety Officer',
      department: 'Safety & Compliance', joiningDate: '2024-12-15', reportingManager: 'Suresh Patel',
      overallProgress: 0, status: 'not_started',
      checklist: [
        { id: '1', task: 'Submit all documents', category: 'documents', owner: 'HR', status: 'pending', completedDate: undefined },
        { id: '2', task: 'Document verification', category: 'documents', owner: 'HR', status: 'pending', completedDate: undefined },
        { id: '3', task: 'Create employee account', category: 'hr', owner: 'HR Admin', status: 'pending', completedDate: undefined },
        { id: '4', task: 'Issue employee ID card', category: 'hr', owner: 'HR Admin', status: 'pending', completedDate: undefined },
        { id: '5', task: 'Setup email account', category: 'it', owner: 'IT Team', status: 'pending', completedDate: undefined },
        { id: '6', task: 'Assign workstation', category: 'facilities', owner: 'Facilities', status: 'pending', completedDate: undefined },
        { id: '7', task: 'Safety induction training', category: 'training', owner: 'Safety Officer', status: 'pending', completedDate: undefined },
        { id: '8', task: 'Department orientation', category: 'department', owner: 'Manager', status: 'pending', completedDate: undefined }
      ]
    }
  ];

  const filteredOnboardings = useMemo(() => {
    return mockOnboardings.filter(onboarding =>
      selectedStatus === 'all' || onboarding.status === selectedStatus
    );
  }, [selectedStatus]);

  const stats = {
    total: mockOnboardings.length,
    notStarted: mockOnboardings.filter(o => o.status === 'not_started').length,
    inProgress: mockOnboardings.filter(o => o.status === 'in_progress').length,
    completed: mockOnboardings.filter(o => o.status === 'completed').length,
    avgProgress: Math.round(mockOnboardings.reduce((sum, o) => sum + o.overallProgress, 0) / mockOnboardings.length),
    onTime: mockOnboardings.filter(o => o.overallProgress >= 75 || o.status === 'completed').length
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const columns = [
    { key: 'employeeCode', label: 'Employee ID', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: EmployeeOnboarding) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: EmployeeOnboarding) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Manager: {row.reportingManager}</div>
        </div>
      )
    },
    { key: 'joiningDate', label: 'Joining Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'overallProgress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
            <div className={`h-2 rounded-full ${getProgressColor(v)}`} style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'checklist', label: 'Tasks', sortable: false,
      render: (_: any, row: EmployeeOnboarding) => {
        const completed = row.checklist.filter(item => item.status === 'completed').length;
        const total = row.checklist.length;
        return <div className="text-sm text-gray-700">{completed}/{total}</div>;
      }
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: EmployeeOnboarding) => (
        <button
          onClick={() => {
            setSelectedEmployee(row);
            setShowChecklistModal(true);
          }}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
          View Checklist
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          Onboarding Checklist
        </h1>
        <p className="text-gray-600 mt-2">Track new employee onboarding progress and tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <User className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Not Started</p>
              <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
            </div>
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-purple-600">{stats.onTime}</p>
            </div>
            <Calendar className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding Table */}
      <DataTable data={filteredOnboardings} columns={columns} />

      {/* Standard Checklist Template */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard Onboarding Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Documentation (HR)
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Submit all required documents
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Document verification and BGV
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              HR Administration
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Create employee account in system
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Issue employee ID card
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              IT Setup
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Setup company email account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Grant system access permissions
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Facilities
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Assign workstation/locker
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Provide safety equipment
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              Training & Induction
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Complete safety induction training
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                General HR policy orientation
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">6</span>
              Department Onboarding
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 ml-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Department orientation by manager
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Introduction to team members
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Onboarding Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All onboarding tasks should be completed before employee's joining date</li>
          <li>• HR team owns documentation and employee account setup tasks</li>
          <li>• IT team must provide email and system access within 1 day of joining</li>
          <li>• Safety induction training is mandatory for all manufacturing roles</li>
          <li>• Department manager is responsible for team introduction and orientation</li>
          <li>• Completed onboarding checklist is verified by HR before probation starts</li>
        </ul>
      </div>
    </div>
  );
}
