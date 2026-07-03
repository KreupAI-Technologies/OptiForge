'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Users, TrendingUp, Search, Eye, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrTalentService } from '@/services/hr-talent.service';

interface PendingReview {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  reviewPeriod: string;
  selfRatingAvg: number;
  goalsAchieved: number;
  totalGoals: number;
  submittedDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function ManagerReviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);

  const mockReviews: PendingReview[] = [
    {
      id: '1', employeeCode: 'KMF2451', employeeName: 'Rahul Sharma', designation: 'Production Supervisor',
      department: 'Manufacturing', reviewPeriod: 'H2 2024', selfRatingAvg: 4.5, goalsAchieved: 4,
      totalGoals: 4, submittedDate: '2024-10-15', status: 'pending'
    },
    {
      id: '2', employeeCode: 'KMF2452', employeeName: 'Priya Patel', designation: 'Quality Inspector',
      department: 'Quality Assurance', reviewPeriod: 'H2 2024', selfRatingAvg: 4.2, goalsAchieved: 3,
      totalGoals: 4, submittedDate: '2024-10-16', status: 'pending'
    },
    {
      id: '3', employeeCode: 'KMF2453', employeeName: 'Amit Kumar', designation: 'Machine Operator',
      department: 'Manufacturing', reviewPeriod: 'H2 2024', selfRatingAvg: 3.8, goalsAchieved: 3,
      totalGoals: 4, submittedDate: '2024-10-17', status: 'in_progress'
    },
    {
      id: '4', employeeCode: 'KMF2454', employeeName: 'Sneha Reddy', designation: 'Production Coordinator',
      department: 'Manufacturing', reviewPeriod: 'H2 2024', selfRatingAvg: 4.7, goalsAchieved: 4,
      totalGoals: 4, submittedDate: '2024-10-14', status: 'pending'
    },
    {
      id: '5', employeeCode: 'KMF2455', employeeName: 'Vikram Singh', designation: 'Maintenance Engineer',
      department: 'Maintenance', reviewPeriod: 'H2 2024', selfRatingAvg: 4.1, goalsAchieved: 3,
      totalGoals: 4, submittedDate: '2024-10-13', status: 'pending'
    },
    {
      id: '6', employeeCode: 'KMF2456', employeeName: 'Anjali Nair', designation: 'QA Analyst',
      department: 'Quality Assurance', reviewPeriod: 'H2 2024', selfRatingAvg: 4.4, goalsAchieved: 4,
      totalGoals: 4, submittedDate: '2024-10-12', status: 'completed'
    },
    {
      id: '7', employeeCode: 'KMF2457', employeeName: 'Rajesh Iyer', designation: 'Production Lead',
      department: 'Manufacturing', reviewPeriod: 'H2 2024', selfRatingAvg: 4.6, goalsAchieved: 4,
      totalGoals: 4, submittedDate: '2024-10-11', status: 'completed'
    },
    {
      id: '8', employeeCode: 'KMF2458', employeeName: 'Deepa Gupta', designation: 'Assembly Technician',
      department: 'Manufacturing', reviewPeriod: 'H2 2024', selfRatingAvg: 3.9, goalsAchieved: 3,
      totalGoals: 4, submittedDate: '2024-10-18', status: 'pending'
    }
  ];

  const [rows, setRows] = useState<PendingReview[]>(mockReviews);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<PendingReview>('manager-review');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredReviews = rows.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    inProgress: rows.filter(r => r.status === 'in_progress').length,
    completed: rows.filter(r => r.status === 'completed').length,
    avgSelfRating: rows.length ? (rows.reduce((sum, r) => sum + r.selfRatingAvg, 0) / rows.length).toFixed(1) : '0.0'
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending Review',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    return labels[status as keyof typeof labels];
  };

  const handleViewReview = (review: PendingReview) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const columns = [
    { key: 'employeeCode', label: 'Employee', sortable: true,
      render: (v: string, row: PendingReview) => (
        <div>
          <div className="font-semibold text-gray-900">{row.employeeName}</div>
          <div className="text-xs text-gray-500">{v} • {row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'reviewPeriod', label: 'Period', sortable: true,
      render: (v: string) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'selfRatingAvg', label: 'Self Rating', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-semibold text-gray-900">{v}/5</span>
        </div>
      )
    },
    { key: 'goalsAchieved', label: 'Goals', sortable: true,
      render: (v: number, row: PendingReview) => (
        <div className="text-sm text-gray-700">{v}/{row.totalGoals}</div>
      )
    },
    { key: 'submittedDate', label: 'Submitted', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {getStatusLabel(v)}
        </span>
      )
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_: string, row: PendingReview) => (
        <button
          onClick={() => handleViewReview(row)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Eye className="h-4 w-4" />
          Review
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-indigo-600" />
          Manager Reviews
        </h1>
        <p className="text-gray-600 mt-2">Review and assess team member performance</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Calendar className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <UserCheck className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Self Rating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgSelfRating}/5</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance Reviews</h3>
        </div>
        <DataTable data={filteredReviews} columns={columns} />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Performance Review - {selectedReview.employeeName}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Employee Info */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Employee</p>
                  <p className="font-semibold text-gray-900">{selectedReview.employeeName}</p>
                  <p className="text-sm text-gray-600">{selectedReview.employeeCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{selectedReview.designation}</p>
                  <p className="text-sm text-gray-600">{selectedReview.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Review Period</p>
                  <p className="font-semibold text-gray-900">{selectedReview.reviewPeriod}</p>
                  <p className="text-sm text-gray-600">Submitted: {new Date(selectedReview.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Manager Rating Section */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Manager Assessment</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Performance Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} className="text-3xl text-yellow-500 hover:text-yellow-600">★</button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(Employee self-rated: {selectedReview.selfRatingAvg}/5)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Comments</label>
                    <textarea
                      rows={4}
                      placeholder="Provide detailed feedback on performance, achievements, and areas for improvement..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                    <textarea
                      rows={3}
                      placeholder="Highlight key strengths demonstrated during the review period..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Development Areas</label>
                    <textarea
                      rows={3}
                      placeholder="Identify specific areas for improvement and development..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Training</label>
                    <textarea
                      rows={2}
                      placeholder="Suggest training programs or development opportunities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Recommendation</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select recommendation</option>
                      <option value="highly_recommended">Highly Recommended</option>
                      <option value="recommended">Recommended</option>
                      <option value="not_recommended">Not Recommended at this time</option>
                      <option value="na">Not Applicable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Save Draft
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Submit Review
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Manager Review Guidelines</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Review employee self-assessments carefully before providing your ratings</li>
          <li>• Provide specific examples to support your evaluation</li>
          <li>• Focus on both achievements and development areas</li>
          <li>• Ensure ratings are fair, consistent, and objective</li>
          <li>• Schedule one-on-one discussion after completing the review</li>
          <li>• All reviews must be completed within the review cycle deadline</li>
        </ul>
      </div>
    </div>
  );
}
