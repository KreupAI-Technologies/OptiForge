'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertTriangle, Calendar, TrendingUp, User, Briefcase, X, Eye, FileText, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { HrTalentService } from '@/services/hr-talent.service';

interface ProbationEmployee {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  joiningDate: string;
  probationPeriod: number; // in months
  probationEndDate: string;
  daysRemaining: number;
  completionPercentage: number;
  status: 'ongoing' | 'due_soon' | 'overdue' | 'completed' | 'extended';
  reportingManager: string;
  reviewsCompleted: number;
  totalReviews: number;
  performanceScore: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  recommendation?: 'confirm' | 'extend' | 'terminate' | 'pending';
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

  const filteredEmployees = rows.filter(emp => {
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesStatus && matchesDept;
  });

  const stats = {
    total: rows.length,
    ongoing: rows.filter(e => e.status === 'ongoing').length,
    dueSoon: rows.filter(e => e.status === 'due_soon').length,
    overdue: rows.filter(e => e.status === 'overdue').length,
    avgPerformance: Math.round(
      rows.reduce((sum, e) => sum + e.performanceScore, 0) / rows.length
    )
  };

  const departments = ['all', ...Array.from(new Set(rows.map(e => e.department)))];

  const statusColors = {
    ongoing: 'bg-blue-100 text-blue-700',
    due_soon: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    extended: 'bg-purple-100 text-purple-700'
  };

  const recommendationColors = {
    confirm: 'bg-green-100 text-green-700',
    extend: 'bg-orange-100 text-orange-700',
    terminate: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-700'
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewDetails = (employee: ProbationEmployee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleScheduleReview = (employee: ProbationEmployee) => {
    toast({
      title: "Navigating to Reviews",
      description: `Opening review schedule for ${employee.name}`
    });
    router.push('/hr/probation/reviews');
  };

  const handleRequestFeedback = (employee: ProbationEmployee) => {
    toast({
      title: "Navigating to Feedback",
      description: `Opening feedback collection for ${employee.name}`
    });
    router.push('/hr/probation/feedback');
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Probation Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage employee probation periods</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total on Probation</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ongoing</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.ongoing}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Due Soon</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.dueSoon}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgPerformance}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="due_soon">Due Soon</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="extended">Extended</option>
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

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probation Period
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
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
                      <div className="font-semibold text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.designation}</div>
                      <div className="text-xs text-gray-500">{emp.department} • {emp.employeeCode}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm text-gray-900">
                        {emp.probationPeriod} months
                      </div>
                      <div className="text-xs text-gray-600">
                        {emp.joiningDate} to {emp.probationEndDate}
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${
                        emp.daysRemaining < 0 ? 'text-red-600' :
                        emp.daysRemaining < 15 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {emp.daysRemaining < 0
                          ? `${Math.abs(emp.daysRemaining)} days overdue`
                          : `${emp.daysRemaining} days remaining`
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {emp.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            emp.completionPercentage >= 100 ? 'bg-red-600' :
                            emp.completionPercentage >= 90 ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(emp.completionPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {emp.reviewsCompleted}/{emp.totalReviews} completed
                      </div>
                      {emp.lastReviewDate && (
                        <div className="text-xs text-gray-600">
                          Last: {emp.lastReviewDate}
                        </div>
                      )}
                      {emp.nextReviewDate && (
                        <div className="text-xs text-blue-600">
                          Next: {emp.nextReviewDate}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`text-2xl font-bold ${getPerformanceColor(emp.performanceScore)}`}>
                      {emp.performanceScore}
                    </div>
                    {emp.recommendation && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${recommendationColors[emp.recommendation]}`}>
                        {emp.recommendation === 'confirm' ? 'Confirm' :
                         emp.recommendation === 'extend' ? 'Extend' :
                         emp.recommendation === 'terminate' ? 'Terminate' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[emp.status]}`}>
                      {emp.status === 'due_soon' ? 'Due Soon' :
                       emp.status === 'ongoing' ? 'Ongoing' :
                       emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleViewDetails(emp)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">No employees match the selected filters</p>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
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

            {/* Modal Content */}
            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 ${
                selectedEmployee.status === 'overdue' ? 'bg-red-50 border border-red-200' :
                selectedEmployee.status === 'due_soon' ? 'bg-yellow-50 border border-yellow-200' :
                selectedEmployee.status === 'completed' ? 'bg-green-50 border border-green-200' :
                selectedEmployee.status === 'extended' ? 'bg-purple-50 border border-purple-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${
                      selectedEmployee.status === 'overdue' ? 'text-red-700' :
                      selectedEmployee.status === 'due_soon' ? 'text-yellow-700' :
                      selectedEmployee.status === 'completed' ? 'text-green-700' :
                      selectedEmployee.status === 'extended' ? 'text-purple-700' :
                      'text-blue-700'
                    }`}>
                      Probation Status: {
                        selectedEmployee.status === 'due_soon' ? 'Due Soon' :
                        selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)
                      }
                    </p>
                    <p className={`text-xs mt-1 ${
                      selectedEmployee.status === 'overdue' ? 'text-red-600' :
                      selectedEmployee.status === 'due_soon' ? 'text-yellow-600' :
                      selectedEmployee.status === 'completed' ? 'text-green-600' :
                      selectedEmployee.status === 'extended' ? 'text-purple-600' :
                      'text-blue-600'
                    }`}>
                      {selectedEmployee.daysRemaining < 0
                        ? `${Math.abs(selectedEmployee.daysRemaining)} days overdue`
                        : selectedEmployee.daysRemaining === 0
                        ? 'Ends today'
                        : `${selectedEmployee.daysRemaining} days remaining`
                      }
                    </p>
                  </div>
                  <span className={`px-4 py-2 text-lg font-bold rounded-lg ${
                    selectedEmployee.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    selectedEmployee.status === 'due_soon' ? 'bg-yellow-100 text-yellow-700' :
                    selectedEmployee.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedEmployee.status === 'extended' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedEmployee.completionPercentage}%
                  </span>
                </div>
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
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reporting Manager</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.reportingManager}</p>
                  </div>
                </div>
              </div>

              {/* Probation Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  Probation Timeline
                </h3>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.joiningDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Probation End Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.probationEndDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Probation Period</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.probationPeriod} months</p>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  Performance Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Reviews Completed</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedEmployee.reviewsCompleted}/{selectedEmployee.totalReviews}
                        </p>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedEmployee.reviewsCompleted === selectedEmployee.totalReviews ? 'bg-green-600' :
                              selectedEmployee.reviewsCompleted >= selectedEmployee.totalReviews * 0.66 ? 'bg-blue-600' :
                              'bg-yellow-600'
                            }`}
                            style={{ width: `${(selectedEmployee.reviewsCompleted / selectedEmployee.totalReviews) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Performance Score</p>
                      <p className={`text-2xl font-bold mt-1 ${getPerformanceColor(selectedEmployee.performanceScore)}`}>
                        {selectedEmployee.performanceScore}%
                      </p>
                    </div>
                  </div>

                  {selectedEmployee.lastReviewDate && (
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Last Review Date</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployee.lastReviewDate}</p>
                      </div>
                      {selectedEmployee.nextReviewDate && (
                        <div>
                          <p className="text-xs text-gray-600">Next Review Date</p>
                          <p className="text-sm font-semibold text-blue-600">{selectedEmployee.nextReviewDate}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEmployee.recommendation && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Recommendation</p>
                      <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded ${recommendationColors[selectedEmployee.recommendation]}`}>
                        {selectedEmployee.recommendation === 'confirm' ? '✓ Confirm Employment' :
                         selectedEmployee.recommendation === 'extend' ? '⏱ Extend Probation' :
                         selectedEmployee.recommendation === 'terminate' ? '✗ Terminate' :
                         '⏳ Pending Decision'}
                      </span>
                    </div>
                  )}
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
                    handleScheduleReview(selectedEmployee);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Schedule Review
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRequestFeedback(selectedEmployee);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
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
