'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Edit, Download, ChevronLeft, ChevronRight, Award, TrendingUp, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { PerformanceManagementService } from '@/services/performance-management.service';

interface PerformanceReview {
  id: string;
  reviewId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reviewPeriod: string;
  reviewType: 'annual' | 'mid_year' | 'probation' | 'quarterly';
  rating: number;
  ratingLabel: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  reviewer: string;
  goalsSet: number;
  goalsAchieved: number;
  keyAchievements: string[];
  improvementAreas: string[];
  reviewDate: string;
  nextReviewDate: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

const reviewTypeColors = {
  annual: 'bg-purple-100 text-purple-700',
  mid_year: 'bg-blue-100 text-blue-700',
  probation: 'bg-orange-100 text-orange-700',
  quarterly: 'bg-teal-100 text-teal-700',
};

const reviewTypeLabels = {
  annual: 'Annual Review',
  mid_year: 'Mid-Year Review',
  probation: 'Probation Review',
  quarterly: 'Quarterly Review',
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 3.0) return 'text-orange-600';
  return 'text-red-600';
};

const getRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-current" />);
  }
  if (hasHalfStar && fullStars < 5) {
    stars.push(<Star key="half" className="h-4 w-4 fill-current opacity-50" />);
  }
  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4" />);
  }
  return stars;
};

export default function PerformancePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (GET /hr/performance-reviews) returns raw ORM rows; map defensively.
        const raw = (await PerformanceManagementService.getHrPerformanceReviews()) as any[];
        const mapped: PerformanceReview[] = raw.map((r) => ({
          id: String(r.id ?? ''),
          reviewId: r.reviewNumber ?? r.reviewId ?? r.code ?? String(r.id ?? ''),
          employeeId: r.employeeCode ?? r.employeeId ?? r.employee?.employeeCode ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.employeeCode ?? '',
          department: r.department ?? r.employee?.department?.name ?? '',
          reviewPeriod: r.reviewPeriod ?? r.period ?? '',
          reviewType: (r.reviewType ?? 'annual') as PerformanceReview['reviewType'],
          rating: Number(r.overallRating ?? r.rating ?? 0),
          ratingLabel: r.ratingLabel ?? '',
          status: (r.status ?? 'pending') as PerformanceReview['status'],
          reviewer: r.reviewerName ?? r.reviewer ?? '',
          goalsSet: Number(r.goalsSet ?? 0),
          goalsAchieved: Number(r.goalsAchieved ?? 0),
          keyAchievements: Array.isArray(r.keyAchievements) ? r.keyAchievements : [],
          improvementAreas: Array.isArray(r.improvementAreas) ? r.improvementAreas : [],
          reviewDate: r.reviewDate ?? '',
          nextReviewDate: r.nextReviewDate ?? '',
        }));
        if (!cancelled) setReviews(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load performance reviews');
          setReviews([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || review.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    pendingReviews: reviews.filter((r) => r.status === 'pending').length,
    completedThisQuarter: reviews.filter((r) => {
      const reviewDate = new Date(r.reviewDate);
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const reviewQuarter = Math.floor(reviewDate.getMonth() / 3);
      return r.status === 'completed' && reviewDate.getFullYear() === now.getFullYear() && reviewQuarter === currentQuarter;
    }).length,
    avgRating: reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    highPerformers: reviews.filter((r) => r.rating >= 4.5).length,
  };

  const departments = Array.from(new Set(reviews.map((r) => r.department)));

  const handleExport = () => {
    exportToCsv('performance', filteredReviews as unknown as Record<string, unknown>[]);
  };

  return (
    <div className="w-full h-full px-3 py-2 w-full max-w-full">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading performance reviews…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && reviews.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No performance reviews found.
        </div>
      )}
      {/* Stats */}
      <div className="mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed This Quarter</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completedThisQuarter}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Rating</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgRating}/5.0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">High Performers</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.highPerformers}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name, review ID, employee ID, reviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Review ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Review Period</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Review Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-gray-900">{review.reviewId}</div>
                    <div className="text-xs text-gray-500">Employee: {review.employeeId}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{review.employeeName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Goals: {review.goalsAchieved}/{review.goalsSet} achieved
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{review.department}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{review.reviewPeriod}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Review: {review.reviewDate}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${reviewTypeColors[review.reviewType]}`}>
                      {reviewTypeLabels[review.reviewType]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <div className={`flex ${getRatingColor(review.rating)}`}>
                        {getRatingStars(review.rating)}
                      </div>
                    </div>
                    <div className={`text-sm font-bold mt-1 ${getRatingColor(review.rating)}`}>
                      {review.rating.toFixed(1)} - {review.ratingLabel}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[review.status]}`}>
                      {statusLabels[review.status]}
                    </span>
                    {review.status === 'overdue' && (
                      <div className="flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">Action required</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{review.reviewer}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Next: {review.nextReviewDate}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/hr/performance/view/${review.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => router.push(`/hr/performance/edit/${review.id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"

                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReviews.length)} of{' '}
            {filteredReviews.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
