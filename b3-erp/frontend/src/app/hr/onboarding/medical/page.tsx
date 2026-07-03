'use client';

import { useState, useMemo, useEffect } from 'react';
import { Activity, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, XCircle, Calendar, FileText, Eye, Upload } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface MedicalCheckup {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  checkupDate?: string;
  clinic: string;
  status: 'scheduled' | 'completed' | 'pending' | 'issues_found' | 'cleared';
  bloodPressure?: string;
  heartRate?: number;
  visionTest?: 'Pass' | 'Fail' | 'Corrected';
  hearingTest?: 'Pass' | 'Fail';
  fitness?: 'Fit' | 'Unfit' | 'Fit with Conditions';
  reportUploaded: boolean;
  reportUrl?: string;
  remarks?: string;
  doctorName?: string;
}

export default function MedicalCheckupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mockCheckups, setMockCheckups] = useState<MedicalCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('medical');
        if (!active) return;
        const mapped: MedicalCheckup[] = records.map((r: OnboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joiningDate || '',
          status: (r.status as MedicalCheckup['status']) || 'pending',
          ...(r.data || {}),
        })) as MedicalCheckup[];
        setMockCheckups(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const _unusedMockCheckups: MedicalCheckup[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      age: 32,
      gender: 'Male',
      checkupDate: '2025-10-25',
      clinic: 'Apollo Clinic, Bangalore',
      status: 'cleared',
      bloodPressure: '120/80',
      heartRate: 72,
      visionTest: 'Pass',
      hearingTest: 'Pass',
      fitness: 'Fit',
      reportUploaded: true,
      reportUrl: '/reports/med-001.pdf',
      doctorName: 'Dr. Priya Sharma'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      age: 28,
      gender: 'Female',
      checkupDate: '2025-10-26',
      clinic: 'Fortis Healthcare, Bangalore',
      status: 'cleared',
      bloodPressure: '115/75',
      heartRate: 68,
      visionTest: 'Corrected',
      hearingTest: 'Pass',
      fitness: 'Fit',
      reportUploaded: true,
      reportUrl: '/reports/med-002.pdf',
      remarks: 'Uses corrective lenses',
      doctorName: 'Dr. Suresh Reddy'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      age: 35,
      gender: 'Male',
      checkupDate: '2025-10-28',
      clinic: 'Apollo Clinic, Bangalore',
      status: 'issues_found',
      bloodPressure: '145/95',
      heartRate: 88,
      visionTest: 'Pass',
      hearingTest: 'Pass',
      fitness: 'Fit with Conditions',
      reportUploaded: true,
      reportUrl: '/reports/med-003.pdf',
      remarks: 'Mild hypertension - requires monitoring',
      doctorName: 'Dr. Priya Sharma'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      age: 26,
      gender: 'Female',
      checkupDate: '2025-10-20',
      clinic: 'Manipal Hospital, Bangalore',
      status: 'cleared',
      bloodPressure: '110/70',
      heartRate: 65,
      visionTest: 'Pass',
      hearingTest: 'Pass',
      fitness: 'Fit',
      reportUploaded: true,
      reportUrl: '/reports/med-004.pdf',
      doctorName: 'Dr. Anil Kumar'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      age: 29,
      gender: 'Male',
      checkupDate: '2025-10-30',
      clinic: 'Apollo Clinic, Bangalore',
      status: 'completed',
      bloodPressure: '125/82',
      heartRate: 75,
      visionTest: 'Pass',
      hearingTest: 'Pass',
      fitness: 'Fit',
      reportUploaded: false,
      doctorName: 'Dr. Priya Sharma',
      remarks: 'Report upload pending'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      age: 31,
      gender: 'Female',
      checkupDate: '2025-11-02',
      clinic: 'Fortis Healthcare, Bangalore',
      status: 'scheduled',
      reportUploaded: false
    },
    {
      id: '7',
      employeeCode: 'EMP2025007',
      employeeName: 'Karthik Reddy',
      designation: 'Electrician',
      department: 'Maintenance',
      joiningDate: '2025-11-18',
      age: 40,
      gender: 'Male',
      clinic: 'Apollo Clinic, Bangalore',
      status: 'pending',
      reportUploaded: false
    }
  ];

  const filteredCheckups = useMemo(() => {
    return mockCheckups.filter(checkup => {
      const matchesSearch = searchTerm === '' ||
        checkup.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkup.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkup.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || checkup.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || checkup.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockCheckups.length,
    pending: mockCheckups.filter(c => c.status === 'pending').length,
    scheduled: mockCheckups.filter(c => c.status === 'scheduled').length,
    completed: mockCheckups.filter(c => c.status === 'completed').length,
    cleared: mockCheckups.filter(c => c.status === 'cleared').length,
    issuesFound: mockCheckups.filter(c => c.status === 'issues_found').length,
    reportsPending: mockCheckups.filter(c => !c.reportUploaded && c.checkupDate).length
  };

  const getStatusColor = (status: MedicalCheckup['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800',
      'cleared': 'bg-green-100 text-green-800',
      'issues_found': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: MedicalCheckup['status']) => {
    const icons = {
      'pending': Clock,
      'scheduled': Calendar,
      'completed': CheckCircle,
      'cleared': CheckCircle,
      'issues_found': AlertCircle
    };
    return icons[status];
  };

  const getFitnessColor = (fitness?: string) => {
    if (!fitness) return '';
    const colors = {
      'Fit': 'bg-green-100 text-green-800',
      'Unfit': 'bg-red-100 text-red-800',
      'Fit with Conditions': 'bg-yellow-100 text-yellow-800'
    };
    return colors[fitness as keyof typeof colors] || '';
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: MedicalCheckup) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            row.gender === 'Male' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'
          }`}>
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
      render: (value: string, row: MedicalCheckup) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.age} years, {row.gender}</div>
        </div>
      )
    },
    {
      key: 'checkupDate',
      label: 'Checkup Date',
      sortable: true,
      render: (value: string | undefined, row: MedicalCheckup) => (
        <div className="text-sm text-gray-700">
          {value ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              {new Date(value).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          ) : (
            <span className="text-gray-400">Not Scheduled</span>
          )}
        </div>
      )
    },
    {
      key: 'clinic',
      label: 'Clinic',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'fitness',
      label: 'Fitness Status',
      sortable: true,
      render: (value: string | undefined) => (
        <span>
          {value ? (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getFitnessColor(value)}`}>
              {value}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: MedicalCheckup['status']) => {
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
      key: 'reportUploaded',
      label: 'Report',
      sortable: true,
      render: (value: boolean, row: MedicalCheckup) => (
        <div className="flex items-center gap-2">
          {value ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : row.checkupDate ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: MedicalCheckup) => (
        <div className="flex gap-2">
          {row.reportUploaded && (
            <button
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
             
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {!row.reportUploaded && row.checkupDate && (
            <button
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
             
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          {row.reportUploaded && (
            <button
              className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
             
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const departments = Array.from(new Set(mockCheckups.map(c => c.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          Pre-Employment Medical Checkup
        </h1>
        <p className="text-gray-600 mt-2">Track and manage medical fitness assessments for new hires</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
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
              <p className="text-xs text-blue-700 font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-blue-900">{stats.scheduled}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 font-medium">Completed</p>
              <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 font-medium">Cleared</p>
              <p className="text-2xl font-bold text-green-900">{stats.cleared}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium">Issues Found</p>
              <p className="text-2xl font-bold text-red-900">{stats.issuesFound}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-medium">Reports Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.reportsPending}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-400" />
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cleared">Cleared</option>
                <option value="issues_found">Issues Found</option>
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

      {/* Medical Checkups Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredCheckups}
          columns={columns}
        />
      </div>

      {/* Medical Checkup Guidelines */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Standard Medical Tests
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">General Physical Examination</div>
                <div className="text-xs text-gray-600">Height, weight, BMI, overall health assessment</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Vital Signs Check</div>
                <div className="text-xs text-gray-600">Blood pressure, pulse rate, respiratory rate</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Vision & Hearing Tests</div>
                <div className="text-xs text-gray-600">Visual acuity, color blindness, hearing assessment</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Blood Tests</div>
                <div className="text-xs text-gray-600">Complete blood count, blood sugar, cholesterol</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Chest X-Ray</div>
                <div className="text-xs text-gray-600">Lung health assessment (for production roles)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Drug & Alcohol Screening</div>
                <div className="text-xs text-gray-600">Mandatory for all safety-sensitive positions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Medical Checkup Policy
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Mandatory Requirement:</strong> All new hires must complete medical checkup before joining</li>
            <li>• <strong>Scheduling:</strong> HR schedules appointment within 3 days of offer acceptance</li>
            <li>• <strong>Empaneled Clinics:</strong> Only use company-empaneled healthcare facilities</li>
            <li>• <strong>Cost Coverage:</strong> Company bears full cost of pre-employment medical checkup</li>
            <li>• <strong>Fasting Required:</strong> 8-12 hours fasting required for blood tests</li>
            <li>• <strong>Report Timeline:</strong> Medical report available within 24-48 hours</li>
            <li>• <strong>Fitness Certificate:</strong> Doctor must provide fitness certificate for employment</li>
            <li>• <strong>Conditional Fitness:</strong> If fit with conditions, HR reviews with department head</li>
            <li>• <strong>Privacy:</strong> Medical records maintained confidentially as per law</li>
            <li>• <strong>Annual Checkup:</strong> Employees encouraged to do annual health checkup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
