'use client';

import { useState, useMemo, useEffect } from 'react';
import { Building, Target, TrendingUp, CheckCircle, AlertCircle, Award, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrTalentService } from '@/services/hr-talent.service';

interface DepartmentGoal {
  id: string;
  title: string;
  description: string;
  department: string;
  headOfDepartment: string;
  totalEmployees: number;
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  progress: number;
  weight: number;
  status: 'on_track' | 'at_risk' | 'completed' | 'overdue';
  kpiCount: number;
  teamsInvolved: number;
  budget?: number;
}

export default function DepartmentGoalsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const mockGoals: DepartmentGoal[] = [
    {
      id: '1', title: 'Increase Manufacturing Output', description: 'Achieve 20% increase in production capacity',
      department: 'Manufacturing', headOfDepartment: 'Rajesh Kumar', totalEmployees: 120, priority: 'high',
      startDate: '2024-11-01', endDate: '2025-06-30', progress: 65, weight: 40, status: 'on_track',
      kpiCount: 6, teamsInvolved: 8, budget: 5000000
    },
    {
      id: '2', title: 'Zero Defect Manufacturing', description: 'Achieve zero defect quality standards',
      department: 'Quality Assurance', headOfDepartment: 'Meena Rao', totalEmployees: 25, priority: 'high',
      startDate: '2024-11-01', endDate: '2025-03-31', progress: 70, weight: 35, status: 'on_track',
      kpiCount: 5, teamsInvolved: 3, budget: 1500000
    },
    {
      id: '3', title: 'Workplace Safety Excellence', description: 'Achieve zero accident record for 12 months',
      department: 'Safety & Compliance', headOfDepartment: 'Suresh Patel', totalEmployees: 15, priority: 'high',
      startDate: '2024-10-01', endDate: '2025-09-30', progress: 55, weight: 30, status: 'on_track',
      kpiCount: 4, teamsInvolved: 2, budget: 800000
    },
    {
      id: '4', title: 'Supply Chain Optimization', description: 'Reduce procurement costs by 15%',
      department: 'Procurement', headOfDepartment: 'Vikram Mehta', totalEmployees: 18, priority: 'high',
      startDate: '2024-11-01', endDate: '2025-04-30', progress: 40, weight: 30, status: 'at_risk',
      kpiCount: 4, teamsInvolved: 2, budget: 500000
    },
    {
      id: '5', title: 'Warehouse Automation', description: 'Implement automated inventory management system',
      department: 'Warehouse & Logistics', headOfDepartment: 'Amit Singh', totalEmployees: 35, priority: 'medium',
      startDate: '2024-09-01', endDate: '2025-02-28', progress: 75, weight: 25, status: 'on_track',
      kpiCount: 3, teamsInvolved: 3, budget: 3000000
    },
    {
      id: '6', title: 'Preventive Maintenance Program', description: 'Reduce equipment downtime by 30%',
      department: 'Maintenance', headOfDepartment: 'Ramesh Iyer', totalEmployees: 22, priority: 'medium',
      startDate: '2024-10-01', endDate: '2025-03-31', progress: 60, weight: 25, status: 'on_track',
      kpiCount: 3, teamsInvolved: 2, budget: 1200000
    },
    {
      id: '7', title: 'HR Digital Transformation', description: 'Digitize all HR processes and records',
      department: 'Human Resources', headOfDepartment: 'Priya Sharma', totalEmployees: 12, priority: 'medium',
      startDate: '2024-08-01', endDate: '2024-12-31', progress: 90, weight: 20, status: 'on_track',
      kpiCount: 4, teamsInvolved: 2, budget: 2000000
    },
    {
      id: '8', title: 'Cost Reduction Initiative', description: 'Reduce operational costs by 12%',
      department: 'Finance', headOfDepartment: 'Anil Gupta', totalEmployees: 20, priority: 'high',
      startDate: '2024-09-01', endDate: '2025-03-31', progress: 50, weight: 30, status: 'on_track',
      kpiCount: 5, teamsInvolved: 3, budget: 800000
    },
    {
      id: '9', title: 'Energy Efficiency Program', description: 'Reduce energy consumption by 18%',
      department: 'Manufacturing', headOfDepartment: 'Rajesh Kumar', totalEmployees: 120, priority: 'medium',
      startDate: '2024-07-01', endDate: '2024-12-31', progress: 100, weight: 25, status: 'completed',
      kpiCount: 3, teamsInvolved: 4, budget: 2500000
    },
    {
      id: '10', title: 'Vendor Diversification', description: 'Onboard 15 new qualified vendors',
      department: 'Procurement', headOfDepartment: 'Vikram Mehta', totalEmployees: 18, priority: 'low',
      startDate: '2024-11-01', endDate: '2025-05-31', progress: 25, weight: 15, status: 'at_risk',
      kpiCount: 2, teamsInvolved: 2, budget: 300000
    }
  ];

  const [rows, setRows] = useState<DepartmentGoal[]>(mockGoals);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<DepartmentGoal>('department-goal');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const departments = ['all', ...Array.from(new Set(rows.map(g => g.department)))];

  const filteredGoals = useMemo(() => {
    return rows.filter(goal => {
      const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
      const matchesDepartment = selectedDepartment === 'all' || goal.department === selectedDepartment;
      return matchesStatus && matchesDepartment;
    });
  }, [selectedStatus, selectedDepartment, rows]);

  const stats = {
    total: rows.length,
    onTrack: rows.filter(g => g.status === 'on_track').length,
    atRisk: rows.filter(g => g.status === 'at_risk').length,
    completed: rows.filter(g => g.status === 'completed').length,
    departmentsCount: new Set(rows.map(g => g.department)).size,
    avgProgress: rows.length ? Math.round(rows.reduce((sum, g) => sum + g.progress, 0) / rows.length) : 0,
    totalBudget: rows.reduce((sum, g) => sum + (g.budget || 0), 0)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      on_track: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  const columns = [
    { key: 'title', label: 'Goal', sortable: true,
      render: (v: string, row: DepartmentGoal) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: DepartmentGoal) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">HOD: {row.headOfDepartment}</div>
          <div className="text-xs text-gray-500">{row.totalEmployees} employees • {row.teamsInvolved} teams</div>
        </div>
      )
    },
    { key: 'priority', label: 'Priority', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'budget', label: 'Budget', sortable: true,
      render: (v: number | undefined) => (
        <div className="text-sm text-gray-700">
          {v ? `₹${(v / 100000).toFixed(1)}L` : '—'}
        </div>
      )
    },
    { key: 'progress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div className={`h-2 rounded-full ${getProgressColor(v)}`} style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'weight', label: 'Weight', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}%</div>
    },
    { key: 'endDate', label: 'Due Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="h-8 w-8 text-cyan-600" />
          Department Goals
        </h1>
        <p className="text-gray-600 mt-2">Track strategic departmental objectives and initiatives</p>
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
        <div className="bg-white border-2 border-cyan-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.total}</p>
            </div>
            <Target className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <Award className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{stats.departmentsCount}</p>
            </div>
            <Building className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-emerald-600">₹{(stats.totalBudget / 10000000).toFixed(1)}Cr</p>
            </div>
            <Target className="h-10 w-10 text-emerald-400" />
          </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
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

      {/* Department Goals Table */}
      <DataTable data={filteredGoals} columns={columns} />

      {/* Info Box */}
      <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-cyan-900 mb-2">Department Goal Guidelines</h3>
        <ul className="text-sm text-cyan-800 space-y-1">
          <li>• Department goals are strategic initiatives that align with organizational objectives</li>
          <li>• Goals cascade down to multiple teams and individual contributors</li>
          <li>• Head of Department is accountable for overall goal achievement</li>
          <li>• Budget allocation ensures adequate resources for goal completion</li>
          <li>• Cross-functional collaboration may be required for complex initiatives</li>
          <li>• Quarterly reviews with leadership ensure alignment with business strategy</li>
        </ul>
      </div>
    </div>
  );
}
