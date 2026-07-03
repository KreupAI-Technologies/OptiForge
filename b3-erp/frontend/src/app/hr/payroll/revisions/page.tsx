'use client';

import { useState, useMemo, useEffect } from 'react';
import { History, TrendingUp, Search, Eye, FileText, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface SalaryRevision {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  grade: string;
  revisionType: 'annual' | 'promotion' | 'performance' | 'correction' | 'special';
  previousCTC: number;
  revisedCTC: number;
  increaseAmount: number;
  increasePercentage: number;
  effectiveFrom: string;
  reason: string;
  approvedBy: string;
  approvedOn: string;
  processedBy?: string;
  processedOn?: string;
  status: 'pending' | 'approved' | 'processed' | 'cancelled';
}

export default function PayrollRevisionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [revisions, setRevisions] = useState<SalaryRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getSalaryRevisions('revision');
        const mapped: SalaryRevision[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.details?.id ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '—',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          grade: r.grade ?? r.details?.grade ?? '',
          revisionType: (r.revisionType ?? r.details?.revisionType ?? 'annual') as SalaryRevision['revisionType'],
          previousCTC: Number(r.previousCTC ?? r.details?.previousCTC ?? 0),
          revisedCTC: Number(r.revisedCTC ?? r.details?.revisedCTC ?? 0),
          increaseAmount: Number(r.increaseAmount ?? r.amount ?? r.details?.increaseAmount ?? 0),
          increasePercentage: Number(r.increasePercentage ?? r.details?.increasePercentage ?? 0),
          effectiveFrom: r.effectiveFrom ?? r.effectiveDate ?? r.details?.effectiveFrom ?? '',
          reason: r.reason ?? r.details?.reason ?? '',
          approvedBy: r.approvedBy ?? r.details?.approvedBy ?? '',
          approvedOn: r.approvedOn ?? r.approvedDate ?? r.details?.approvedOn ?? '',
          processedBy: r.processedBy ?? r.details?.processedBy ?? undefined,
          processedOn: r.processedOn ?? r.details?.processedOn ?? undefined,
          status: (r.status ?? r.details?.status ?? 'pending') as SalaryRevision['status'],
        }));
        if (!cancelled) setRevisions(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load salary revisions');
          setRevisions([]);
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

  const mockRevisions: SalaryRevision[] = [
    {
      id: 'REV-2025-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      grade: 'A',
      revisionType: 'annual',
      previousCTC: 700000,
      revisedCTC: 750000,
      increaseAmount: 50000,
      increasePercentage: 7.14,
      effectiveFrom: '2025-01-01',
      reason: 'Annual increment based on performance',
      approvedBy: 'HR Head',
      approvedOn: '2024-12-15',
      processedBy: 'HR Admin',
      processedOn: '2024-12-20',
      status: 'processed'
    },
    {
      id: 'REV-2025-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      grade: 'B',
      revisionType: 'performance',
      previousCTC: 520000,
      revisedCTC: 550000,
      increaseAmount: 30000,
      increasePercentage: 5.77,
      effectiveFrom: '2025-01-01',
      reason: 'Performance bonus and increment',
      approvedBy: 'Quality Manager',
      approvedOn: '2024-12-18',
      processedBy: 'HR Admin',
      processedOn: '2024-12-22',
      status: 'processed'
    },
    {
      id: 'REV-2025-003',
      employeeId: 'EMP006',
      employeeName: 'Sanjay Reddy',
      designation: 'Production Manager',
      department: 'Production',
      grade: 'A',
      revisionType: 'promotion',
      previousCTC: 680000,
      revisedCTC: 720000,
      increaseAmount: 40000,
      increasePercentage: 5.88,
      effectiveFrom: '2025-04-01',
      reason: 'Promotion from Assistant Manager to Manager',
      approvedBy: 'Production Head',
      approvedOn: '2025-03-15',
      processedBy: 'HR Admin',
      processedOn: '2025-03-20',
      status: 'processed'
    },
    {
      id: 'REV-2025-004',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      grade: 'C',
      revisionType: 'annual',
      previousCTC: 330000,
      revisedCTC: 350000,
      increaseAmount: 20000,
      increasePercentage: 6.06,
      effectiveFrom: '2025-07-01',
      reason: 'Annual increment',
      approvedBy: 'Production Manager',
      approvedOn: '2025-06-10',
      status: 'approved'
    },
    {
      id: 'REV-2025-005',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      grade: 'B',
      revisionType: 'special',
      previousCTC: 500000,
      revisedCTC: 520000,
      increaseAmount: 20000,
      increasePercentage: 4.0,
      effectiveFrom: '2025-08-01',
      reason: 'Retention increment due to market adjustment',
      approvedBy: 'Maintenance Head',
      approvedOn: '2025-07-20',
      status: 'approved'
    },
    {
      id: 'REV-2025-006',
      employeeId: 'EMP007',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      grade: 'B',
      revisionType: 'correction',
      previousCTC: 480000,
      revisedCTC: 500000,
      increaseAmount: 20000,
      increasePercentage: 4.17,
      effectiveFrom: '2025-02-01',
      reason: 'Salary correction - previous assignment error',
      approvedBy: 'HR Manager',
      approvedOn: '2025-01-20',
      status: 'pending'
    }
  ];

  const filteredRevisions = useMemo(() => {
    return revisions.filter(revision => {
      const matchesSearch =
        revision.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revision.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revision.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || revision.department === selectedDepartment;
      const matchesType = selectedType === 'all' || revision.revisionType === selectedType;
      const matchesStatus = selectedStatus === 'all' || revision.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesType && matchesStatus;
    });
  }, [revisions, searchTerm, selectedDepartment, selectedType, selectedStatus]);

  const stats = {
    total: revisions.length,
    pending: revisions.filter(r => r.status === 'pending').length,
    approved: revisions.filter(r => r.status === 'approved').length,
    processed: revisions.filter(r => r.status === 'processed').length,
    totalIncrease: revisions.reduce((sum, r) => sum + r.increaseAmount, 0)
  };

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    processed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    pending: <History className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    processed: <CheckCircle className="h-4 w-4" />,
    cancelled: <History className="h-4 w-4" />
  };

  const typeColors = {
    annual: 'bg-blue-100 text-blue-700',
    promotion: 'bg-purple-100 text-purple-700',
    performance: 'bg-green-100 text-green-700',
    correction: 'bg-orange-100 text-orange-700',
    special: 'bg-pink-100 text-pink-700'
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Salary Revisions</h1>
        <p className="text-sm text-gray-600 mt-1">Track salary increment and revision history</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading salary revisions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && revisions.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No salary revisions found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Revisions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <History className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Approved</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Processed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.processed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Increase</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.totalIncrease)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="annual">Annual</option>
            <option value="promotion">Promotion</option>
            <option value="performance">Performance</option>
            <option value="correction">Correction</option>
            <option value="special">Special</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRevisions.map(revision => (
          <div key={revision.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{revision.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {revision.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[revision.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[revision.status]}
                      {revision.status.toUpperCase()}
                    </span>
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeColors[revision.revisionType]}`}>
                    {revision.revisionType.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {revision.designation} • {revision.department} • Grade {revision.grade}
                </p>
                <p className="text-xs text-gray-500 mt-1">Revision ID: {revision.id}</p>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <h4 className="text-xs font-semibold text-red-900">Previous CTC</h4>
                </div>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(revision.previousCTC)}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <h4 className="text-xs font-semibold text-green-900">Revised CTC</h4>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(revision.revisedCTC)}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-semibold text-blue-900">Increase</h4>
                </div>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(revision.increaseAmount)}</p>
                <p className="text-xs text-blue-700 mt-1">+{revision.increasePercentage.toFixed(2)}%</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <h4 className="text-xs font-semibold text-purple-900">Effective From</h4>
                </div>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(revision.effectiveFrom).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Revision Reason</h4>
              <p className="text-sm text-gray-700">{revision.reason}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <p>Approved by: {revision.approvedBy} on {new Date(revision.approvedOn).toLocaleDateString('en-IN')}</p>
                </div>
                {revision.processedBy && revision.processedOn && (
                  <div>
                    <p>Processed by: {revision.processedBy} on {new Date(revision.processedOn).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {revision.status === 'pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Approve Revision
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    Cancel Revision
                  </button>
                </>
              )}
              {revision.status === 'approved' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Process Revision
                </button>
              )}
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                <Eye className="inline h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Salary Revision Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Annual:</strong> Regular annual increments based on company policy</li>
          <li>• <strong>Promotion:</strong> Salary revision due to designation/grade change</li>
          <li>• <strong>Performance:</strong> Special increment for exceptional performance</li>
          <li>• <strong>Correction:</strong> Rectification of previous salary assignment errors</li>
          <li>• <strong>Special:</strong> Market adjustment, retention, or other special cases</li>
          <li>• All revisions must be approved before processing</li>
          <li>• Effective date determines when the new salary applies</li>
        </ul>
      </div>
    </div>
  );
}
