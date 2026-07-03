'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, FileText, ClipboardCheck, DollarSign, LogOut, TrendingDown, Calendar, User, Briefcase, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface OffboardingEmployee {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  resignationDate: string;
  lastWorkingDate: string;
  noticePeriod: number;
  noticePeriodStatus: 'serving' | 'buyout' | 'completed' | 'waived';
  offboardingStatus: 'initiated' | 'in_progress' | 'clearance_pending' | 'fnf_pending' | 'completed';
  clearanceProgress: number;
  exitInterviewStatus: 'pending' | 'scheduled' | 'completed';
  fnfStatus: 'pending' | 'calculated' | 'approved' | 'paid';
  resignationType: 'voluntary' | 'involuntary' | 'retirement' | 'absconding';
  reportingManager: string;
  daysRemaining: number;
}

export default function OffboardingDashboard() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<OffboardingEmployee | null>(null);

  const [mockEmployees, setMockEmployees] = useState<OffboardingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('overview');
        if (!active) return;
        setMockEmployees(
          records.map((r: OffboardingTaskRecord) => ({
            id: r.id,
            employeeCode: r.employeeCode || '',
            employeeName: r.employeeName || '',
            designation: r.designation || '',
            department: r.department || '',
            offboardingStatus: (r.status as any) || 'initiated',
            ...(r.data || {}),
          })) as unknown as OffboardingEmployee[],
        );
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

  const _unusedMockEmployees: OffboardingEmployee[] = [
    {
      id: '1',
      employeeCode: 'EMP234',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      resignationDate: '2025-09-15',
      lastWorkingDate: '2025-11-15',
      noticePeriod: 60,
      noticePeriodStatus: 'serving',
      offboardingStatus: 'in_progress',
      clearanceProgress: 45,
      exitInterviewStatus: 'scheduled',
      fnfStatus: 'pending',
      resignationType: 'voluntary',
      reportingManager: 'Suresh Iyer',
      daysRemaining: 28
    },
    {
      id: '2',
      employeeCode: 'EMP456',
      employeeName: 'Priya Sharma',
      designation: 'HR Executive',
      department: 'Human Resources',
      resignationDate: '2025-10-01',
      lastWorkingDate: '2025-10-31',
      noticePeriod: 30,
      noticePeriodStatus: 'serving',
      offboardingStatus: 'clearance_pending',
      clearanceProgress: 75,
      exitInterviewStatus: 'completed',
      fnfStatus: 'calculated',
      resignationType: 'voluntary',
      reportingManager: 'Kavita Sharma',
      daysRemaining: 14
    },
    {
      id: '3',
      employeeCode: 'EMP789',
      employeeName: 'Anil Verma',
      designation: 'Quality Inspector',
      department: 'Quality',
      resignationDate: '2025-08-20',
      lastWorkingDate: '2025-09-20',
      noticePeriod: 30,
      noticePeriodStatus: 'completed',
      offboardingStatus: 'fnf_pending',
      clearanceProgress: 100,
      exitInterviewStatus: 'completed',
      fnfStatus: 'approved',
      resignationType: 'voluntary',
      reportingManager: 'Madhav Singh',
      daysRemaining: 0
    },
    {
      id: '4',
      employeeCode: 'EMP345',
      employeeName: 'Deepak Patel',
      designation: 'Warehouse Supervisor',
      department: 'Logistics',
      resignationDate: '2025-10-10',
      lastWorkingDate: '2025-10-25',
      noticePeriod: 15,
      noticePeriodStatus: 'buyout',
      offboardingStatus: 'initiated',
      clearanceProgress: 20,
      exitInterviewStatus: 'pending',
      fnfStatus: 'pending',
      resignationType: 'voluntary',
      reportingManager: 'Ramesh Nair',
      daysRemaining: 8
    },
    {
      id: '5',
      employeeCode: 'EMP678',
      employeeName: 'Sunita Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      resignationDate: '2025-07-15',
      lastWorkingDate: '2025-09-15',
      noticePeriod: 60,
      noticePeriodStatus: 'completed',
      offboardingStatus: 'completed',
      clearanceProgress: 100,
      exitInterviewStatus: 'completed',
      fnfStatus: 'paid',
      resignationType: 'voluntary',
      reportingManager: 'Vikram Singh',
      daysRemaining: -32
    }
  ];

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesStatus = selectedStatus === 'all' || emp.offboardingStatus === selectedStatus;
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesStatus && matchesDept;
  });

  const stats = {
    total: mockEmployees.length,
    active: mockEmployees.filter(e => e.offboardingStatus !== 'completed').length,
    clearancePending: mockEmployees.filter(e => e.offboardingStatus === 'clearance_pending').length,
    fnfPending: mockEmployees.filter(e => e.fnfStatus === 'pending' || e.fnfStatus === 'calculated').length,
    completed: mockEmployees.filter(e => e.offboardingStatus === 'completed').length,
    avgNoticePeriod: Math.round(
      mockEmployees.reduce((sum, e) => sum + e.noticePeriod, 0) / mockEmployees.length
    ),
    exitInterviewPending: mockEmployees.filter(e => e.exitInterviewStatus === 'pending' || e.exitInterviewStatus === 'scheduled').length
  };

  const departments = ['all', ...Array.from(new Set(mockEmployees.map(e => e.department)))];

  const offboardingModules = [
    { id: 'resignations', name: 'Resignations', icon: FileText, path: '/hr/offboarding/resignations', color: 'blue', description: 'Manage resignation requests' },
    { id: 'acceptance', name: 'Acceptance', icon: CheckCircle, path: '/hr/offboarding/acceptance', color: 'green', description: 'Process resignation acceptance' },
    { id: 'notice-period', name: 'Notice Period', icon: Clock, path: '/hr/offboarding/notice-period', color: 'orange', description: 'Track notice period' },
    { id: 'exit-interview', name: 'Exit Interview', icon: Users, path: '/hr/offboarding/exit-interview', color: 'purple', description: 'Conduct exit interviews' },
    { id: 'early-release', name: 'Early Release', icon: LogOut, path: '/hr/offboarding/early-release', color: 'red', description: 'Process early releases' },
    { id: 'clearance', name: 'Clearance Checklist', icon: ClipboardCheck, path: '/hr/offboarding/clearance/checklist', color: 'indigo', description: 'Track clearance process' },
    { id: 'fnf', name: 'F&F Settlement', icon: DollarSign, path: '/hr/offboarding/fnf/salary', color: 'green', description: 'Manage final settlements' },
    { id: 'documents', name: 'Exit Documents', icon: FileText, path: '/hr/offboarding/docs/relieving', color: 'blue', description: 'Generate exit documents' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      initiated: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      clearance_pending: 'bg-orange-100 text-orange-800',
      fnf_pending: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetails = (employee: OffboardingEmployee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Offboarding Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Manage employee exits and final settlements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Exits</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Active Cases</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.active}</p>
            </div>
            <Users className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Clearance Pending</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.clearancePending}</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">F&F Pending</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.fnfPending}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Avg Notice</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.avgNoticePeriod}d</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Exit Interview</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.exitInterviewPending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Offboarding Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {offboardingModules.map(module => (
            <button
              key={module.id}
              onClick={() => router.push(module.path)}
              className={`bg-gradient-to-br from-${module.color}-50 to-${module.color}-100 hover:from-${module.color}-100 hover:to-${module.color}-200 rounded-lg p-3 border border-${module.color}-200 transition-all hover:shadow-md text-left`}
            >
              <module.icon className={`h-6 w-6 text-${module.color}-600 mb-2`} />
              <p className={`text-sm font-semibold text-${module.color}-900`}>{module.name}</p>
              <p className={`text-xs text-${module.color}-700 mt-1`}>{module.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Offboarding Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="initiated">Initiated</option>
              <option value="in_progress">In Progress</option>
              <option value="clearance_pending">Clearance Pending</option>
              <option value="fnf_pending">F&F Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resignation Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notice Period
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clearance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exit Interview
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-semibold text-gray-900">{emp.employeeName}</div>
                      <div className="text-sm text-gray-600">{emp.designation}</div>
                      <div className="text-xs text-gray-500">{emp.department} • {emp.employeeCode}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm text-gray-900">
                        <span className="text-xs text-gray-500">Resigned:</span> {emp.resignationDate}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="text-xs text-gray-500">LWD:</span> {emp.lastWorkingDate}
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${
                        emp.daysRemaining < 0 ? 'text-green-600' :
                        emp.daysRemaining < 7 ? 'text-red-600' :
                        emp.daysRemaining < 15 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {emp.daysRemaining < 0
                          ? 'Completed'
                          : `${emp.daysRemaining} days remaining`
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{emp.noticePeriod} days</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${
                        emp.noticePeriodStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        emp.noticePeriodStatus === 'serving' ? 'bg-blue-100 text-blue-700' :
                        emp.noticePeriodStatus === 'buyout' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {emp.noticePeriodStatus === 'completed' ? 'Completed' :
                         emp.noticePeriodStatus === 'serving' ? 'Serving' :
                         emp.noticePeriodStatus === 'buyout' ? 'Buyout' : 'Waived'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {emp.clearanceProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            emp.clearanceProgress === 100 ? 'bg-green-600' :
                            emp.clearanceProgress >= 75 ? 'bg-blue-600' :
                            emp.clearanceProgress >= 50 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${emp.clearanceProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      emp.exitInterviewStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      emp.exitInterviewStatus === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {emp.exitInterviewStatus === 'completed' ? 'Completed' :
                       emp.exitInterviewStatus === 'scheduled' ? 'Scheduled' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(emp.offboardingStatus)}`}>
                      {emp.offboardingStatus === 'in_progress' ? 'In Progress' :
                       emp.offboardingStatus === 'clearance_pending' ? 'Clearance Pending' :
                       emp.offboardingStatus === 'fnf_pending' ? 'F&F Pending' :
                       emp.offboardingStatus.charAt(0).toUpperCase() + emp.offboardingStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleViewDetails(emp)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.employeeName}</h2>
                  <p className="text-sm text-gray-600">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 ${
                selectedEmployee.offboardingStatus === 'completed' ? 'bg-green-50 border border-green-200' :
                selectedEmployee.offboardingStatus === 'fnf_pending' ? 'bg-purple-50 border border-purple-200' :
                selectedEmployee.offboardingStatus === 'clearance_pending' ? 'bg-orange-50 border border-orange-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  selectedEmployee.offboardingStatus === 'completed' ? 'text-green-700' :
                  selectedEmployee.offboardingStatus === 'fnf_pending' ? 'text-purple-700' :
                  selectedEmployee.offboardingStatus === 'clearance_pending' ? 'text-orange-700' :
                  'text-blue-700'
                }`}>
                  Offboarding Status: {
                    selectedEmployee.offboardingStatus === 'in_progress' ? 'In Progress' :
                    selectedEmployee.offboardingStatus === 'clearance_pending' ? 'Clearance Pending' :
                    selectedEmployee.offboardingStatus === 'fnf_pending' ? 'F&F Pending' :
                    selectedEmployee.offboardingStatus.charAt(0).toUpperCase() + selectedEmployee.offboardingStatus.slice(1)
                  }
                </p>
              </div>

              {/* Employee Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-600" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Employee Code</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reporting Manager</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.reportingManager}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Resignation Type</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{selectedEmployee.resignationType}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  Offboarding Timeline
                </h3>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Resignation Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.resignationDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Working Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.lastWorkingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Notice Period</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.noticePeriod} days</p>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-gray-600" />
                  Progress Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Clearance Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedEmployee.clearanceProgress === 100 ? 'bg-green-600' :
                              selectedEmployee.clearanceProgress >= 75 ? 'bg-blue-600' :
                              'bg-yellow-600'
                            }`}
                            style={{ width: `${selectedEmployee.clearanceProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{selectedEmployee.clearanceProgress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Exit Interview</p>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${
                        selectedEmployee.exitInterviewStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        selectedEmployee.exitInterviewStatus === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedEmployee.exitInterviewStatus.charAt(0).toUpperCase() + selectedEmployee.exitInterviewStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Notice Period Status</p>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${
                        selectedEmployee.noticePeriodStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        selectedEmployee.noticePeriodStatus === 'serving' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedEmployee.noticePeriodStatus.charAt(0).toUpperCase() + selectedEmployee.noticePeriodStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">F&F Status</p>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${
                        selectedEmployee.fnfStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedEmployee.fnfStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                        selectedEmployee.fnfStatus === 'calculated' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedEmployee.fnfStatus.charAt(0).toUpperCase() + selectedEmployee.fnfStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push('/hr/offboarding/clearance/checklist');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  View Clearance
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push('/hr/offboarding/fnf/salary');
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  View F&F
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
