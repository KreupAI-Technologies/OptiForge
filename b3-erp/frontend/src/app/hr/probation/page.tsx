'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, Users, FileText, MessageSquare, Award, XCircle, Eye, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { HrTalentService } from '@/services/hr-talent.service';

interface ProbationEmployee {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  probationEndDate: string;
  probationPeriod: number; // in months
  daysRemaining: number;
  probationStatus: 'ongoing' | 'extended' | 'confirmed' | 'terminated' | 'due_soon';
  reviewsCompleted: number;
  reviewsRequired: number;
  feedbackReceived: number;
  feedbackPending: number;
  overallRating: number; // out of 5
  lastReviewDate?: string;
  nextReviewDate?: string;
  reportingManager: string;
  hrPartner: string;
  location: string;
}

export default function Page() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ProbationEmployee | null>(null);

  const [rows, setRows] = useState<ProbationEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getProbation<ProbationEmployee>('tracking');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredEmployees = useMemo(() => {
    return rows.filter(emp => {
      const matchesStatus = selectedStatus === 'all' || emp.probationStatus === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      return matchesStatus && matchesDepartment;
    });
  }, [selectedStatus, selectedDepartment, rows]);

  const stats = {
    totalOnProbation: rows.filter(e => ['ongoing', 'due_soon', 'extended'].includes(e.probationStatus)).length,
    ongoing: rows.filter(e => e.probationStatus === 'ongoing').length,
    dueSoon: rows.filter(e => e.probationStatus === 'due_soon').length,
    extended: rows.filter(e => e.probationStatus === 'extended').length,
    confirmed: rows.filter(e => e.probationStatus === 'confirmed').length,
    avgRating: (rows.reduce((sum, e) => sum + e.overallRating, 0) / rows.length).toFixed(1),
    pendingReviews: rows.reduce((sum, e) => sum + (e.reviewsRequired - e.reviewsCompleted), 0)
  };

  // Probation modules
  const probationModules = [
    { id: 'tracking', name: 'Probation Tracking', icon: Users, path: '/hr/probation/tracking', color: 'blue', description: 'Monitor all probationers' },
    { id: 'reviews', name: 'Review Schedule', icon: Calendar, path: '/hr/probation/reviews', color: 'purple', description: 'Performance reviews' },
    { id: 'feedback', name: 'Feedback Collection', icon: MessageSquare, path: '/hr/probation/feedback', color: 'green', description: 'Gather feedback' },
    { id: 'confirmation', name: 'Confirmation Process', icon: Award, path: '/hr/probation/confirmation', color: 'orange', description: 'Confirm employment' },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      ongoing: 'bg-blue-100 text-blue-800',
      extended: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      terminated: 'bg-red-100 text-red-800',
      due_soon: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      ongoing: Clock,
      extended: AlertCircle,
      confirmed: CheckCircle,
      terminated: XCircle,
      due_soon: AlertCircle
    };
    return icons[status as keyof typeof icons];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ongoing: 'Ongoing',
      extended: 'Extended',
      confirmed: 'Confirmed',
      terminated: 'Terminated',
      due_soon: 'Due Soon'
    };
    return labels[status as keyof typeof labels];
  };

  const handleViewDetails = (employee: ProbationEmployee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleScheduleReview = (employee: ProbationEmployee) => {
    router.push(`/hr/probation/reviews?employee=${employee.employeeCode}`);
  };

  const columns = [
    { key: 'employeeCode', label: 'Employee Code', sortable: true,
      render: (v: string) => <div className="font-mono font-semibold text-gray-900">{v}</div>
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Manager: {row.reportingManager}</div>
        </div>
      )
    },
    { key: 'probationEndDate', label: 'End Date', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className={`text-xs ${row.daysRemaining <= 7 && row.daysRemaining >= 0 ? 'text-orange-600 font-semibold' : row.daysRemaining < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {row.daysRemaining >= 0 ? `${row.daysRemaining} days left` : `${Math.abs(row.daysRemaining)} days overdue`}
          </div>
        </div>
      )
    },
    { key: 'reviewsCompleted', label: 'Reviews', sortable: true,
      render: (v: number, row: ProbationEmployee) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">{v} / {row.reviewsRequired}</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full ${
                v === row.reviewsRequired ? 'bg-green-600' : v >= row.reviewsRequired * 0.66 ? 'bg-blue-600' : 'bg-yellow-600'
              }`}
              style={{ width: `${(v / row.reviewsRequired) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    { key: 'overallRating', label: 'Rating', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1">
          <span className={`text-lg font-bold ${
            v >= 4.5 ? 'text-green-600' :
            v >= 4.0 ? 'text-blue-600' :
            v >= 3.5 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {v.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">/5.0</span>
        </div>
      )
    },
    { key: 'probationStatus', label: 'Status', sortable: true,
      render: (v: string) => {
        const Icon = getStatusIcon(v);
        return (
          <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
            <Icon className="h-3 w-3" />
            {getStatusLabel(v)}
          </span>
        );
      }
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: ProbationEmployee) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          {['ongoing', 'due_soon', 'extended'].includes(row.probationStatus) && (
            <button
              onClick={() => handleScheduleReview(row)}
              className="p-1 hover:bg-blue-100 rounded"
              title="Schedule review"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-purple-600" />
          Probation Management Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track and manage employee probation periods</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Probation</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalOnProbation}</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ongoing}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-orange-600">{stats.dueSoon}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Extended</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.extended}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.avgRating}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingReviews}</p>
            </div>
            <FileText className="h-10 w-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Probation Modules Grid */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Probation Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {probationModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => router.push(module.path)}
                className={`bg-white border-2 border-${module.color}-200 rounded-lg p-3 hover:shadow-lg transition-shadow duration-200 text-left`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-${module.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${module.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="due_soon">Due Soon</option>
              <option value="extended">Extended</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <DataTable data={filteredEmployees} columns={columns} />

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Probation Management Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Standard probation period is 3 months, extendable up to 6 months</li>
          <li>• Minimum 3 performance reviews required during probation period</li>
          <li>• Reviews should be scheduled at 30, 60, and 90-day intervals</li>
          <li>• Feedback must be collected from reporting manager, peers, and HR</li>
          <li>• Confirmation decision should be made 15 days before probation end date</li>
          <li>• Extended probation requires approval from Department Head and HR</li>
          <li>• Overall rating below 3.5 may result in probation extension or termination</li>
        </ul>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-purple-600" />
                Probation Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 border ${
                selectedEmployee.probationStatus === 'confirmed' ? 'bg-green-50 border-green-200' :
                selectedEmployee.probationStatus === 'due_soon' ? 'bg-orange-50 border-orange-200' :
                selectedEmployee.probationStatus === 'extended' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getStatusIcon(selectedEmployee.probationStatus);
                    return <Icon className="h-5 w-5" />;
                  })()}
                  <span className="font-semibold">
                    Status: {getStatusLabel(selectedEmployee.probationStatus)}
                  </span>
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Employee Code</p>
                  <p className="font-mono font-semibold text-gray-900">{selectedEmployee.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee Name</p>
                  <p className="font-semibold text-gray-900">{selectedEmployee.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{selectedEmployee.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold text-gray-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reporting Manager</p>
                  <p className="font-semibold text-gray-900">{selectedEmployee.reportingManager}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">HR Partner</p>
                  <p className="font-semibold text-gray-900">{selectedEmployee.hrPartner}</p>
                </div>
              </div>

              {/* Probation Timeline */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Probation Timeline</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Joining Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Probation End Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEmployee.probationEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Probation Period</p>
                    <p className="font-semibold text-gray-900">{selectedEmployee.probationPeriod} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Remaining</p>
                    <p className={`font-semibold ${
                      selectedEmployee.daysRemaining <= 7 && selectedEmployee.daysRemaining >= 0 ? 'text-orange-600' :
                      selectedEmployee.daysRemaining < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {selectedEmployee.daysRemaining >= 0 ? `${selectedEmployee.daysRemaining} days` : `${Math.abs(selectedEmployee.daysRemaining)} days overdue`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-green-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Reviews Completed</p>
                    <p className="font-semibold text-gray-900">{selectedEmployee.reviewsCompleted} / {selectedEmployee.reviewsRequired}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedEmployee.reviewsCompleted === selectedEmployee.reviewsRequired ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${(selectedEmployee.reviewsCompleted / selectedEmployee.reviewsRequired) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Feedback Received</p>
                    <p className="font-semibold text-gray-900">{selectedEmployee.feedbackReceived} received, {selectedEmployee.feedbackPending} pending</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overall Rating</p>
                    <p className={`text-2xl font-bold ${
                      selectedEmployee.overallRating >= 4.5 ? 'text-green-600' :
                      selectedEmployee.overallRating >= 4.0 ? 'text-blue-600' :
                      selectedEmployee.overallRating >= 3.5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedEmployee.overallRating.toFixed(1)} / 5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Review Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEmployee.nextReviewDate ?
                        new Date(selectedEmployee.nextReviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) :
                        'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    router.push(`/hr/probation/reviews?employee=${selectedEmployee.employeeCode}`);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Schedule Review
                </button>
                <button
                  onClick={() => {
                    router.push(`/hr/probation/feedback?employee=${selectedEmployee.employeeCode}`);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Request Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
