'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Calendar, CheckCircle, Clock, XCircle, Users, Wrench, AlertCircle, TrendingUp, Download, MapPin, Loader2 } from 'lucide-react';
import { InstallationService, InstallationJob } from '@/services/installation.service';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  handed_over: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  scheduled: Clock,
  in_progress: Wrench,
  completed: CheckCircle,
  handed_over: CheckCircle,
  cancelled: XCircle,
};

export default function InstallationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data fetching states
  const [installationJobs, setInstallationJobs] = useState<InstallationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch installation jobs on mount
  useEffect(() => {
    const fetchInstallationJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await InstallationService.getAllInstallationJobs();
        setInstallationJobs(data);
      } catch (err) {
        setError('Failed to load installation jobs. Please try again.');
        console.error('Error fetching installation jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallationJobs();
  }, []);

  // Filter jobs
  const filteredJobs = installationJobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const jobsWithActual = installationJobs.filter(j => j.actualDuration && j.estimatedDuration);
  const stats = {
    totalJobs: installationJobs.length,
    scheduledJobs: installationJobs.filter(j => j.status === 'scheduled').length,
    inProgressJobs: installationJobs.filter(j => j.status === 'in_progress').length,
    completedJobs: installationJobs.filter(j => j.status === 'completed' || j.status === 'handed_over').length,
    avgCompletionRate: jobsWithActual.length > 0
      ? jobsWithActual.reduce((sum, j) => sum + ((j.actualDuration! / j.estimatedDuration) * 100), 0) / jobsWithActual.length
      : 0,
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading installation jobs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Installation Jobs</h1>
        <p className="text-gray-600">Schedule and track equipment installation jobs</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledJobs}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgressJobs}</p>
            </div>
            <Wrench className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgCompletionRate.toFixed(0)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by job number, customer, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="handed_over">Handed Over</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/after-sales-service/installations/calendar')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => router.push('/after-sales-service/installations')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Installation
            </button>
          </div>
        </div>
      </div>

      {/* Installation Jobs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Progress
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site Survey
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Value
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedJobs.map((job) => {
                const StatusIcon = statusIcons[job.status];
                return (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{job.jobNumber}</span>
                        <span className="text-sm text-gray-600">{job.customerName}</span>
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{job.siteAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${statusColors[job.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
                        </span>
                        {job.status === 'in_progress' && (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-600">{job.installationProgress}% Complete</span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${job.installationProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-900">
                          {new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-600">Est: {job.estimatedDuration}h</span>
                        {job.actualDuration && (
                          <span className="text-xs text-gray-600">Actual: {job.actualDuration}h</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{job.equipmentCount} items</span>
                        <span className="text-xs text-gray-500">{job.equipmentList[0]}</span>
                        {job.equipmentCount > 1 && (
                          <span className="text-xs text-blue-600">+{job.equipmentCount - 1} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{job.teamLeaderName}</span>
                        </div>
                        <span className="text-xs text-gray-500">Team: {job.teamSize} members</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {job.siteSurveyCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(job.orderValue)}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/after-sales-service/installations/view/${job.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/after-sales-service/installations/edit/${job.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"

                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
