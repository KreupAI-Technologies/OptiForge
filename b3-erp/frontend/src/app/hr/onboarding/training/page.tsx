'use client';

import { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, Calendar, BookOpen, Video, FileText, Eye, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface TrainingSchedule {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  totalTrainings: number;
  completedTrainings: number;
  completionPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
  nextTrainingDate?: string;
  nextTrainingName?: string;
  trainer: string;
}

interface Training {
  id: string;
  trainingName: string;
  category: 'safety' | 'technical' | 'soft_skills' | 'compliance' | 'product' | 'systems';
  duration: string;
  mode: 'classroom' | 'online' | 'on_the_job' | 'external';
  mandatory: boolean;
  icon: any;
}

export default function TrainingSchedulePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const trainingPrograms: Training[] = [
    { id: '1', trainingName: 'Safety Induction Training', category: 'safety', duration: '4 hours', mode: 'classroom', mandatory: true, icon: AlertCircle },
    { id: '2', trainingName: 'Fire Safety & Emergency Procedures', category: 'safety', duration: '2 hours', mode: 'classroom', mandatory: true, icon: AlertCircle },
    { id: '3', trainingName: 'ERP System Navigation', category: 'systems', duration: '3 hours', mode: 'online', mandatory: true, icon: BookOpen },
    { id: '4', trainingName: 'Quality Management System (QMS)', category: 'compliance', duration: '4 hours', mode: 'classroom', mandatory: true, icon: FileText },
    { id: '5', trainingName: 'Product Knowledge Training', category: 'product', duration: '6 hours', mode: 'classroom', mandatory: true, icon: BookOpen },
    { id: '6', trainingName: 'Communication Skills', category: 'soft_skills', duration: '3 hours', mode: 'online', mandatory: false, icon: Users },
    { id: '7', trainingName: 'Machine Operation & Maintenance', category: 'technical', duration: '8 hours', mode: 'on_the_job', mandatory: true, icon: GraduationCap },
    { id: '8', trainingName: 'ISO 9001:2015 Awareness', category: 'compliance', duration: '2 hours', mode: 'online', mandatory: true, icon: FileText },
    { id: '9', trainingName: 'Lean Manufacturing Basics', category: 'technical', duration: '4 hours', mode: 'classroom', mandatory: false, icon: GraduationCap },
    { id: '10', trainingName: 'Environmental Awareness', category: 'compliance', duration: '1 hour', mode: 'online', mandatory: true, icon: FileText }
  ];

  const [mockSchedules, setMockSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('training');
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
        })) as TrainingSchedule[];
        setMockSchedules(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockSchedules: TrainingSchedule[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      totalTrainings: 10,
      completedTrainings: 10,
      completionPercentage: 100,
      status: 'completed',
      trainer: 'Suresh Training'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      totalTrainings: 10,
      completedTrainings: 8,
      completionPercentage: 80,
      status: 'in_progress',
      nextTrainingDate: '2025-11-05',
      nextTrainingName: 'ISO 9001:2015 Awareness',
      trainer: 'Ramesh Training'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      totalTrainings: 8,
      completedTrainings: 4,
      completionPercentage: 50,
      status: 'in_progress',
      nextTrainingDate: '2025-11-06',
      nextTrainingName: 'ERP System Navigation',
      trainer: 'Suresh Training'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      totalTrainings: 9,
      completedTrainings: 9,
      completionPercentage: 100,
      status: 'completed',
      trainer: 'Priya Training'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      totalTrainings: 10,
      completedTrainings: 2,
      completionPercentage: 20,
      status: 'in_progress',
      nextTrainingDate: '2025-11-08',
      nextTrainingName: 'Machine Operation & Maintenance',
      trainer: 'Ramesh Training'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      totalTrainings: 7,
      completedTrainings: 0,
      completionPercentage: 0,
      status: 'not_started',
      nextTrainingDate: '2025-11-10',
      nextTrainingName: 'Safety Induction Training',
      trainer: 'Suresh Training'
    }
  ];

  const filteredSchedules = useMemo(() => {
    return mockSchedules.filter(schedule => {
      const matchesSearch = searchTerm === '' ||
        schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || schedule.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockSchedules.length,
    notStarted: mockSchedules.filter(s => s.status === 'not_started').length,
    inProgress: mockSchedules.filter(s => s.status === 'in_progress').length,
    completed: mockSchedules.filter(s => s.status === 'completed').length,
    avgCompletion: Math.round(mockSchedules.reduce((sum, s) => sum + s.completionPercentage, 0) / mockSchedules.length),
    mandatoryTrainings: trainingPrograms.filter(t => t.mandatory).length,
    totalPrograms: trainingPrograms.length
  };

  const getStatusColor = (status: TrainingSchedule['status']) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: TrainingSchedule['status']) => {
    const icons = {
      'not_started': Clock,
      'in_progress': GraduationCap,
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

  const getCategoryColor = (category: Training['category']) => {
    const colors = {
      'safety': 'bg-red-100 text-red-700',
      'technical': 'bg-blue-100 text-blue-700',
      'soft_skills': 'bg-purple-100 text-purple-700',
      'compliance': 'bg-green-100 text-green-700',
      'product': 'bg-yellow-100 text-yellow-700',
      'systems': 'bg-indigo-100 text-indigo-700'
    };
    return colors[category];
  };

  const getModeIcon = (mode: Training['mode']) => {
    const icons = {
      'classroom': Users,
      'online': Video,
      'on_the_job': GraduationCap,
      'external': BookOpen
    };
    return icons[mode];
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: TrainingSchedule) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
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
      render: (value: string, row: TrainingSchedule) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.trainer}</div>
        </div>
      )
    },
    {
      key: 'completedTrainings',
      label: 'Progress',
      sortable: true,
      render: (value: number, row: TrainingSchedule) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {value} / {row.totalTrainings}
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
      key: 'nextTrainingDate',
      label: 'Next Training',
      sortable: true,
      render: (value: string | undefined, row: TrainingSchedule) => (
        <div>
          {value ? (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-900 mb-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                {new Date(value).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-600">{row.nextTrainingName}</div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: TrainingSchedule['status']) => {
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
      render: (value: any, row: TrainingSchedule) => (
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

  const departments = Array.from(new Set(mockSchedules.map(s => s.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          Onboarding Training Schedule
        </h1>
        <p className="text-gray-600 mt-2">Track initial training programs for new employees</p>
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
              <p className="text-xs text-gray-700 font-medium">Not Started</p>
              <p className="text-2xl font-bold text-gray-900">{stats.notStarted}</p>
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
            <GraduationCap className="h-8 w-8 text-blue-400" />
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
              <p className="text-2xl font-bold text-red-900">{stats.mandatoryTrainings}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Total Programs</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.totalPrograms}</p>
            </div>
            <BookOpen className="h-8 w-8 text-indigo-400" />
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
                <option value="not_started">Not Started</option>
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

      {/* Training Schedules Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <DataTable
          data={filteredSchedules}
          columns={columns}
        />
      </div>

      {/* Training Programs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Training Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {trainingPrograms.map((training) => {
            const ModeIcon = getModeIcon(training.mode);
            return (
              <div
                key={training.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <training.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{training.trainingName}</h4>
                    {training.mandatory && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {training.duration}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <ModeIcon className="w-3 h-3" />
                      {training.mode.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(training.category)}`}>
                    {training.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Training Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Training Schedule Guidelines
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Timeline:</strong> All mandatory trainings must be completed within first 15 days of joining</li>
          <li>• <strong>Attendance:</strong> 100% attendance required for all mandatory training sessions</li>
          <li>• <strong>Assessment:</strong> Post-training assessments mandatory with 70% passing marks</li>
          <li>• <strong>Certificate:</strong> Training completion certificate issued after successful assessment</li>
          <li>• <strong>Safety Training:</strong> Must be completed on Day 1 before entering production floor</li>
          <li>• <strong>Online Trainings:</strong> Access via learning portal, self-paced with deadlines</li>
          <li>• <strong>Re-training:</strong> Required if assessment score below 70% or attendance below 100%</li>
          <li>• <strong>Feedback:</strong> Employees must complete training feedback forms</li>
        </ul>
      </div>
    </div>
  );
}
