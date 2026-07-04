'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Filter, X, Upload, Check, AlertTriangle, Clock, Download, Eye, CheckCircle, XCircle, User, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingCandidate, documentCategories } from '@/data/hr/onboarding-documents';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'company-1';

export default function OnboardingDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);

  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/hr/onboarding-tasks?companyId=${DEFAULT_COMPANY_ID}`,
          { headers: { 'Content-Type': 'application/json' } },
        );
        if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
        const json = await res.json();
        const rows: any[] = Array.isArray(json) ? json : (json?.data ?? []);
        if (!cancelled) setCandidates(rows.map((r: any) => ({ ...r })) as OnboardingCandidate[]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load onboarding documents');
          setCandidates([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: candidates.length,
      pending: candidates.filter((c) => c.status === 'pending').length,
      inProgress: candidates.filter((c) => c.status === 'in_progress').length,
      completed: candidates.filter((c) => c.status === 'completed').length,
      overdue: candidates.filter((c) => c.status === 'overdue').length,
      avgCompletion: candidates.length
        ? Math.round(
            candidates.reduce((sum, c) => sum + (c.completionPercentage ?? 0), 0) /
              candidates.length,
          )
        : 0,
    }),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = searchTerm === '' ||
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || candidate.department === departmentFilter;
      const matchesVerification = verificationFilter === 'all' || candidate.verificationStatus === verificationFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesVerification;
    });
  }, [candidates, searchTerm, statusFilter, departmentFilter, verificationFilter]);

  const getStatusColor = (status: OnboardingCandidate['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: OnboardingCandidate['status']) => {
    const icons = {
      'pending': Clock,
      'in_progress': Upload,
      'completed': CheckCircle,
      'overdue': AlertTriangle
    };
    return icons[status];
  };

  const getVerificationColor = (status: OnboardingCandidate['verificationStatus']) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-600',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'issues_found': 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getVerificationIcon = (status: OnboardingCandidate['verificationStatus']) => {
    const icons = {
      'not_started': Clock,
      'in_progress': Upload,
      'completed': Check,
      'issues_found': XCircle
    };
    return icons[status];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const columns = [
    {
      key: 'candidateName',
      label: 'Candidate Details',
      sortable: true,
      render: (value: string, row: OnboardingCandidate) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.candidateName.split(' ').map(n => n[0]).join('')}
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
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: OnboardingCandidate['status'], row: OnboardingCandidate) => {
        const StatusIcon = getStatusIcon(value);
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
              <StatusIcon className="w-3 h-3" />
              {value.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        );
      }
    },
    {
      key: 'documentsSubmitted',
      label: 'Document Progress',
      sortable: true,
      render: (value: number, row: OnboardingCandidate) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {value} / {row.documentsTotal}
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
      key: 'verificationStatus',
      label: 'Verification',
      sortable: true,
      render: (value: OnboardingCandidate['verificationStatus']) => {
        const VerificationIcon = getVerificationIcon(value);
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getVerificationColor(value)}`}>
            <VerificationIcon className="w-3 h-3" />
            {value.replace('_', ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'assignedHR',
      label: 'Assigned HR',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: OnboardingCandidate) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCandidate(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
           
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const departments = Array.from(
    new Set(candidates.map((c) => c.department)),
  ) as string[];

  return (
    <div className="p-6">
      {loadError && <div className="text-red-500 text-sm mb-2">{loadError}</div>}
      {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          Onboarding Document Collection
        </h1>
        <p className="text-gray-600 mt-2">Track and verify joining documents for new hires</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Candidates</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-900">{stats.inProgress}</p>
            </div>
            <Upload className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Avg Completion</p>
              <p className="text-3xl font-bold text-purple-900">{stats.avgCompletion}%</p>
            </div>
            <FileText className="h-10 w-10 text-purple-400" />
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
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
                <option value="overdue">Overdue</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Verification Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="issues_found">Issues Found</option>
              </select>
            </div>
          </div>
        )}

        {(statusFilter !== 'all' || departmentFilter !== 'all' || verificationFilter !== 'all' || searchTerm) && (
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
            {verificationFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Verification: {verificationFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setVerificationFilter('all')} />
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

      {/* Document Categories Reference */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Required Document Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {documentCategories.map(category => (
            <div
              key={category.id}
              className={`flex items-center gap-2 px-3 py-2 bg-${category.color}-50 border border-${category.color}-200 rounded-lg`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-xs font-medium text-gray-700">{category.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredCandidates}
          columns={columns}
        />
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          Document Collection Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Document Requirements:</h4>
            <ul className="space-y-1">
              <li>• All documents must be submitted 5 days before joining date</li>
              <li>• Scan quality should be clear and readable (minimum 150 DPI)</li>
              <li>• Accepted formats: PDF, JPG, PNG (max 5MB per file)</li>
              <li>• Original documents must be presented on Day 1</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Verification Process:</h4>
            <ul className="space-y-1">
              <li>• HR verifies submitted documents within 2 working days</li>
              <li>• Candidates notified immediately if issues found</li>
              <li>• Educational certificates verified with institutions</li>
              <li>• Employment verification via email/phone to previous employers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
