'use client';

import { useState, useMemo, useEffect } from 'react';
import { Clock, Search, Filter, AlertCircle, CheckCircle, XCircle, Calendar, TrendingUp, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';

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
  reviewScheduled: boolean;
  reviewDate?: string;
  supervisor: string;
  performanceScore: number;
  feedback: string;
  recommendation: 'pending' | 'confirm' | 'extend' | 'terminate';
  attendancePercentage: number;
  completedTrainings: number;
  totalTrainings: number;
  status: 'ongoing' | 'review_due' | 'confirmed' | 'extended' | 'terminated';
}

export default function ProbationEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [probationEmployees, setProbationEmployees] = useState<ProbationEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.employees<any[]>();
        const onProbation = (raw ?? []).filter((e) => {
          const s = String(e.status ?? '').toLowerCase();
          return Boolean(e.probationEndDate) || s.includes('probation');
        });
        const mapped: ProbationEmployee[] = onProbation.map((e) => {
          const fullName = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
          const endDate = e.probationEndDate ?? '';
          const daysRemaining = endDate
            ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;
          const s = String(e.status ?? '').toLowerCase();
          const status: ProbationEmployee['status'] = e.confirmationDate
            ? 'confirmed'
            : s.includes('review')
              ? 'review_due'
              : daysRemaining <= 0 && endDate
                ? 'review_due'
                : 'ongoing';
          return {
            id: String(e.id ?? ''),
            employeeCode: e.employeeCode ?? '',
            name: fullName || (e.employeeCode ?? ''),
            designation: e.designationId ? String(e.designationId) : '',
            department: e.departmentId ? String(e.departmentId) : '',
            joiningDate: e.joiningDate ?? '',
            probationPeriod: Number(e.probationPeriod ?? 6),
            probationEndDate: endDate,
            daysRemaining,
            reviewScheduled: Boolean(e.reviewScheduled ?? false),
            reviewDate: e.reviewDate ?? undefined,
            supervisor: e.reportingManagerId ? String(e.reportingManagerId) : '',
            performanceScore: Number(e.performanceScore ?? 0),
            feedback: e.feedback ?? '',
            recommendation: (e.recommendation as ProbationEmployee['recommendation']) ?? 'pending',
            attendancePercentage: Number(e.attendancePercentage ?? 0),
            completedTrainings: Number(e.completedTrainings ?? 0),
            totalTrainings: Number(e.totalTrainings ?? 0),
            status,
          };
        });
        if (!cancelled) setProbationEmployees(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load probation employees');
          setProbationEmployees([]);
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

  const departments = ['all', 'Production', 'Human Resources', 'Quality', 'Finance', 'IT', 'Marketing'];

  const filteredData = useMemo(() => {
    return probationEmployees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [probationEmployees, searchTerm, selectedDepartment, selectedStatus]);

  const stats = useMemo(() => {
    const ongoing = probationEmployees.filter(e => e.status === 'ongoing').length;
    const reviewDue = probationEmployees.filter(e => e.status === 'review_due').length;
    const confirmed = probationEmployees.filter(e => e.status === 'confirmed').length;
    return { total: probationEmployees.length, ongoing, reviewDue, confirmed };
  }, [probationEmployees]);

  const columns = [
    {
      key: 'employeeCode', label: 'Employee', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div><div className="font-semibold text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.name}</div></div>
      )
    },
    {
      key: 'designation', label: 'Designation', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div><div className="font-medium text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.department}</div></div>
      )
    },
    {
      key: 'probationEndDate', label: 'Probation Period', sortable: true,
      render: (v: string, row: ProbationEmployee) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="text-xs text-gray-500">{row.probationPeriod} months</div>
          {row.daysRemaining > 0 && row.daysRemaining <= 30 && (
            <div className="text-xs text-orange-600 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{row.daysRemaining} days left</div>
          )}
        </div>
      )
    },
    {
      key: 'performanceScore', label: 'Performance', sortable: true,
      render: (v: number) => <div className={`font-semibold ${v >= 4.5 ? 'text-green-600' : v >= 4.0 ? 'text-blue-600' : v >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>{v.toFixed(1)} / 5.0</div>
    },
    {
      key: 'attendancePercentage', label: 'Attendance', sortable: true,
      render: (v: number) => <div className={`font-semibold ${v >= 95 ? 'text-green-600' : v >= 90 ? 'text-blue-600' : 'text-orange-600'}`}>{v}%</div>
    },
    {
      key: 'completedTrainings', label: 'Trainings', sortable: true,
      render: (v: number, row: ProbationEmployee) => (
        <div className="text-sm"><div className="font-medium text-gray-900">{v} / {row.totalTrainings}</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(v / row.totalTrainings) * 100}%` }}></div>
        </div></div>
      )
    },
    {
      key: 'recommendation', label: 'Recommendation', sortable: true,
      render: (v: string) => {
        const colors = { pending: 'bg-gray-100 text-gray-700', confirm: 'bg-green-100 text-green-700', extend: 'bg-orange-100 text-orange-700', terminate: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[v as keyof typeof colors]}`}>{v.toUpperCase()}</span>;
      }
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Clock className="h-8 w-8 text-orange-600" />Employees on Probation</h1>
        <p className="text-gray-600 mt-2">Track and manage probation period employees</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading probation employees…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total on Probation</p><p className="text-2xl font-bold text-orange-600">{stats.total}</p></div>
          <Users className="w-8 h-8 text-orange-400" /></div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Ongoing</p><p className="text-2xl font-bold text-blue-600">{stats.ongoing}</p></div>
          <Clock className="w-8 h-8 text-blue-400" /></div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Review Due</p><p className="text-2xl font-bold text-yellow-600">{stats.reviewDue}</p></div>
          <AlertCircle className="w-8 h-8 text-yellow-400" /></div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Confirmed</p><p className="text-2xl font-bold text-green-600">{stats.confirmed}</p></div>
          <CheckCircle className="w-8 h-8 text-green-400" /></div>
        </div>
      </div>

      {stats.reviewDue > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3"><AlertCircle className="w-6 h-6 text-yellow-600" />
            <div><h3 className="font-semibold text-yellow-900">Probation Reviews Due</h3>
            <p className="text-sm text-yellow-700">{stats.reviewDue} employee{stats.reviewDue > 1 ? 's are' : ' is'} due for probation review. Schedule review meetings immediately.</p></div>
            <button className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">Schedule Reviews</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter className="w-5 h-5" />Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="all">All Status</option><option value="ongoing">Ongoing</option><option value="review_due">Review Due</option><option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
