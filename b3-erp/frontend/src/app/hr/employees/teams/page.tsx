'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Plus, UserPlus, Search, Filter, TrendingUp, TrendingDown, Target, Award, Mail, Phone, LayoutGrid, List } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { CreateTeamModal } from '@/components/hr/CreateTeamModal';
import { HrPagesService } from '@/services/hr-pages.service';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  joiningDate: string;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
  avatar: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  department: string;
  teamLead: string;
  teamLeadId: string;
  teamLeadEmail: string;
  teamLeadPhone: string;
  memberCount: number;
  activeProjects: number;
  completedProjects: number;
  avgPerformance: number;
  budgetUtilization: number;
  establishedDate: string;
  location: string;
  shift: string;
  status: 'active' | 'inactive' | 'on_hold';
  members: TeamMember[];
}

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const perfValues: TeamMember['performance'][] = ['excellent', 'good', 'average', 'needs_improvement'];
    const statusValues: Team['status'][] = ['active', 'inactive', 'on_hold'];
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.teams<any[]>();
        const mapped: Team[] = (raw ?? []).map((t) => {
          const rawMembers: any[] = Array.isArray(t.members) ? t.members : [];
          const members: TeamMember[] = rawMembers.map((m, idx) => {
            const perf = String(m?.performance ?? '').toLowerCase();
            const mName = m?.name ?? '';
            return {
              id: String(m?.id ?? `${t.id ?? 'T'}-M${idx}`),
              name: mName,
              designation: m?.designation ?? '',
              joiningDate: m?.joiningDate ?? '',
              performance: (perfValues.includes(perf as TeamMember['performance'])
                ? (perf as TeamMember['performance'])
                : 'good'),
              avatar: m?.avatar
                ?? String(mName)
                  .split(' ')
                  .map((n: string) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase(),
            };
          });
          const st = String(t.status ?? '').toLowerCase();
          return {
            id: String(t.id ?? ''),
            name: t.name ?? '',
            code: t.code ?? '',
            department: t.department ?? '',
            teamLead: t.teamLead ?? '',
            teamLeadId: t.teamLeadId ? String(t.teamLeadId) : '',
            teamLeadEmail: t.teamLeadEmail ?? '',
            teamLeadPhone: t.teamLeadPhone ?? '',
            memberCount: Number(t.memberCount ?? members.length),
            activeProjects: Number(t.activeProjects ?? 0),
            completedProjects: Number(t.completedProjects ?? 0),
            avgPerformance: Number(t.avgPerformance ?? 0),
            budgetUtilization: Number(t.budgetUtilization ?? 0),
            establishedDate: t.establishedDate ?? '',
            location: t.location ?? '',
            shift: t.shift ?? '',
            status: (statusValues.includes(st as Team['status'])
              ? (st as Team['status'])
              : 'active'),
            members,
          };
        });
        if (!cancelled) setTeams(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load teams');
          setTeams([]);
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

  // Mock data for teams
  const mockTeams: Team[] = [
    {
      id: 'T001',
      name: 'Production Line 1',
      code: 'PL1',
      department: 'Production',
      teamLead: 'Rajesh Kumar',
      teamLeadId: 'EMP001',
      teamLeadEmail: 'rajesh.kumar@company.com',
      teamLeadPhone: '+91 98765 43210',
      memberCount: 24,
      activeProjects: 5,
      completedProjects: 18,
      avgPerformance: 87,
      budgetUtilization: 82,
      establishedDate: '2020-01-15',
      location: 'Plant A - Floor 1',
      shift: 'Day Shift (6 AM - 2 PM)',
      status: 'active',
      members: [
        { id: 'M001', name: 'Amit Sharma', designation: 'Senior Operator', joiningDate: '2020-03-15', performance: 'excellent', avatar: 'AS' },
        { id: 'M002', name: 'Priya Singh', designation: 'Operator', joiningDate: '2021-06-20', performance: 'good', avatar: 'PS' },
        { id: 'M003', name: 'Suresh Patel', designation: 'Junior Operator', joiningDate: '2022-01-10', performance: 'average', avatar: 'SP' },
      ]
    },
    {
      id: 'T002',
      name: 'Quality Control Team',
      code: 'QCT',
      department: 'Quality',
      teamLead: 'Meera Nair',
      teamLeadId: 'EMP002',
      teamLeadEmail: 'meera.nair@company.com',
      teamLeadPhone: '+91 98765 43211',
      memberCount: 12,
      activeProjects: 8,
      completedProjects: 32,
      avgPerformance: 92,
      budgetUtilization: 75,
      establishedDate: '2019-06-20',
      location: 'Quality Lab - Building B',
      shift: 'General Shift (9 AM - 6 PM)',
      status: 'active',
      members: [
        { id: 'M004', name: 'Vikram Reddy', designation: 'QC Inspector', joiningDate: '2019-08-15', performance: 'excellent', avatar: 'VR' },
        { id: 'M005', name: 'Anjali Mehta', designation: 'QC Analyst', joiningDate: '2020-11-20', performance: 'excellent', avatar: 'AM' },
      ]
    },
    {
      id: 'T003',
      name: 'Maintenance & Engineering',
      code: 'MNT',
      department: 'Maintenance',
      teamLead: 'Sanjay Desai',
      teamLeadId: 'EMP003',
      teamLeadEmail: 'sanjay.desai@company.com',
      teamLeadPhone: '+91 98765 43212',
      memberCount: 16,
      activeProjects: 3,
      completedProjects: 45,
      avgPerformance: 85,
      budgetUtilization: 88,
      establishedDate: '2018-03-10',
      location: 'Maintenance Workshop',
      shift: 'Rotational Shifts',
      status: 'active',
      members: [
        { id: 'M006', name: 'Arjun Pillai', designation: 'Senior Technician', joiningDate: '2018-05-15', performance: 'good', avatar: 'AP' },
        { id: 'M007', name: 'Ramesh Gupta', designation: 'Technician', joiningDate: '2019-02-20', performance: 'good', avatar: 'RG' },
      ]
    },
    {
      id: 'T004',
      name: 'Warehouse Operations',
      code: 'WHO',
      department: 'Logistics',
      teamLead: 'Lakshmi Iyer',
      teamLeadId: 'EMP004',
      teamLeadEmail: 'lakshmi.iyer@company.com',
      teamLeadPhone: '+91 98765 43213',
      memberCount: 20,
      activeProjects: 6,
      completedProjects: 28,
      avgPerformance: 78,
      budgetUtilization: 91,
      establishedDate: '2020-08-01',
      location: 'Warehouse - Section C',
      shift: 'Day Shift (7 AM - 3 PM)',
      status: 'active',
      members: [
        { id: 'M008', name: 'Karthik Rao', designation: 'Warehouse Supervisor', joiningDate: '2020-09-15', performance: 'good', avatar: 'KR' },
        { id: 'M009', name: 'Deepa Joshi', designation: 'Store Keeper', joiningDate: '2021-04-10', performance: 'average', avatar: 'DJ' },
      ]
    },
    {
      id: 'T005',
      name: 'Assembly Line 2',
      code: 'AL2',
      department: 'Production',
      teamLead: 'Naveen Chandra',
      teamLeadId: 'EMP005',
      teamLeadEmail: 'naveen.chandra@company.com',
      teamLeadPhone: '+91 98765 43214',
      memberCount: 28,
      activeProjects: 7,
      completedProjects: 22,
      avgPerformance: 83,
      budgetUtilization: 79,
      establishedDate: '2021-02-15',
      location: 'Plant A - Floor 2',
      shift: 'Night Shift (10 PM - 6 AM)',
      status: 'active',
      members: [
        { id: 'M010', name: 'Ravi Shankar', designation: 'Assembly Operator', joiningDate: '2021-03-20', performance: 'good', avatar: 'RS' },
      ]
    },
    {
      id: 'T006',
      name: 'R&D Innovation Lab',
      code: 'RND',
      department: 'Research',
      teamLead: 'Dr. Sunita Rao',
      teamLeadId: 'EMP006',
      teamLeadEmail: 'sunita.rao@company.com',
      teamLeadPhone: '+91 98765 43215',
      memberCount: 8,
      activeProjects: 4,
      completedProjects: 12,
      avgPerformance: 94,
      budgetUtilization: 68,
      establishedDate: '2019-11-05',
      location: 'R&D Center - Building D',
      shift: 'Flexible Hours',
      status: 'active',
      members: [
        { id: 'M011', name: 'Anil Kumar', designation: 'Research Scientist', joiningDate: '2019-12-01', performance: 'excellent', avatar: 'AK' },
      ]
    },
    {
      id: 'T007',
      name: 'Safety & Compliance',
      code: 'SFC',
      department: 'Safety',
      teamLead: 'Pooja Malhotra',
      teamLeadId: 'EMP007',
      teamLeadEmail: 'pooja.malhotra@company.com',
      teamLeadPhone: '+91 98765 43216',
      memberCount: 10,
      activeProjects: 5,
      completedProjects: 38,
      avgPerformance: 90,
      budgetUtilization: 72,
      establishedDate: '2018-07-20',
      location: 'Safety Office - Main Building',
      shift: 'General Shift (9 AM - 6 PM)',
      status: 'active',
      members: [
        { id: 'M012', name: 'Manoj Tiwari', designation: 'Safety Officer', joiningDate: '2018-08-15', performance: 'excellent', avatar: 'MT' },
      ]
    },
    {
      id: 'T008',
      name: 'Packaging Unit',
      code: 'PKG',
      department: 'Production',
      teamLead: 'Kavita Sharma',
      teamLeadId: 'EMP008',
      teamLeadEmail: 'kavita.sharma@company.com',
      teamLeadPhone: '+91 98765 43217',
      memberCount: 18,
      activeProjects: 4,
      completedProjects: 25,
      avgPerformance: 81,
      budgetUtilization: 85,
      establishedDate: '2020-05-12',
      location: 'Packaging Area - Plant B',
      shift: 'Day Shift (8 AM - 4 PM)',
      status: 'active',
      members: []
    },
    {
      id: 'T009',
      name: 'IT Infrastructure',
      code: 'ITI',
      department: 'IT',
      teamLead: 'Rahul Verma',
      teamLeadId: 'EMP009',
      teamLeadEmail: 'rahul.verma@company.com',
      teamLeadPhone: '+91 98765 43218',
      memberCount: 14,
      activeProjects: 9,
      completedProjects: 56,
      avgPerformance: 88,
      budgetUtilization: 77,
      establishedDate: '2017-09-15',
      location: 'IT Department - 3rd Floor',
      shift: 'General Shift (9 AM - 6 PM)',
      status: 'active',
      members: []
    },
    {
      id: 'T010',
      name: 'Customer Support',
      code: 'CSP',
      department: 'Customer Service',
      teamLead: 'Neha Kapoor',
      teamLeadId: 'EMP010',
      teamLeadEmail: 'neha.kapoor@company.com',
      teamLeadPhone: '+91 98765 43219',
      memberCount: 15,
      activeProjects: 0,
      completedProjects: 0,
      avgPerformance: 86,
      budgetUtilization: 70,
      establishedDate: '2021-01-10',
      location: 'Customer Service Center',
      shift: 'Rotational Shifts',
      status: 'active',
      members: []
    },
  ];

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'Research', 'Safety', 'IT', 'Customer Service'];

  const filteredData = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.teamLead.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || team.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || team.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teams, searchTerm, selectedDepartment, selectedStatus]);

  const stats = useMemo(() => {
    const totalMembers = teams.reduce((sum, t) => sum + t.memberCount, 0);
    const totalProjects = teams.reduce((sum, t) => sum + t.activeProjects, 0);
    const avgPerformance = teams.length
      ? teams.reduce((sum, t) => sum + t.avgPerformance, 0) / teams.length
      : 0;
    return {
      totalTeams: teams.length,
      totalMembers,
      activeProjects: totalProjects,
      avgPerformance: Math.round(avgPerformance)
    };
  }, [teams]);

  const activeFilterCount = [selectedDepartment !== 'all', selectedStatus !== 'all'].filter(Boolean).length;

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBudgetColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 80) return 'bg-orange-500';
    if (utilization >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const columns = [
    {
      key: 'code',
      label: 'Team Code',
      sortable: true,
      render: (v: string, row: Team) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.name}</div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'teamLead',
      label: 'Team Lead',
      sortable: true,
      render: (v: string, row: Team) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.teamLeadId}</div>
        </div>
      )
    },
    {
      key: 'memberCount',
      label: 'Members',
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1 text-indigo-600 font-semibold">
          <Users className="w-4 h-4" />
          {v}
        </div>
      )
    },
    {
      key: 'activeProjects',
      label: 'Active Projects',
      sortable: true,
      render: (v: number, row: Team) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{v} Active</div>
          <div className="text-xs text-gray-500">{row.completedProjects} Completed</div>
        </div>
      )
    },
    {
      key: 'avgPerformance',
      label: 'Avg Performance',
      sortable: true,
      render: (v: number) => (
        <div className={`font-semibold ${getPerformanceColor(v)}`}>
          {v}%
        </div>
      )
    },
    {
      key: 'budgetUtilization',
      label: 'Budget Utilization',
      sortable: true,
      render: (v: number) => (
        <div>
          <div className="text-sm font-medium text-gray-700">{v}%</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className={`${getBudgetColor(v)} h-1.5 rounded-full`} style={{ width: `${v}%` }}></div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Team) => (
        <button
          onClick={() => setSelectedTeam(row)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-indigo-600" />
          Teams
        </h1>
        <p className="text-gray-600 mt-2">Manage team structure, members, and performance</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading teams…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalTeams}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalMembers}</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgPerformance}%</p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">All Teams</h2>
            <span className="text-sm text-gray-500">({filteredData.length} teams)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by team name, code, or team lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'table' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredData.map((team) => (
            <div
              key={team.id}
              className="bg-white border-2 border-indigo-200 rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-indigo-600" />
                </div>
                <StatusBadge status={team.status} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
              <p className="text-sm text-indigo-600 font-medium mb-2">{team.code}</p>
              <p className="text-sm text-gray-600 mb-2">{team.department} Department</p>

              <div className="mb-2 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Team Lead</p>
                <p className="text-sm font-semibold text-gray-900">{team.teamLead}</p>
                <p className="text-xs text-gray-500">{team.teamLeadId}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="text-xl font-bold text-indigo-600 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.memberCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Projects</p>
                  <p className="text-xl font-bold text-blue-600 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {team.activeProjects}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-500">Performance</p>
                  <p className={`text-sm font-semibold ${getPerformanceColor(team.avgPerformance)}`}>
                    {team.avgPerformance}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${team.avgPerformance >= 90 ? 'bg-green-500' : team.avgPerformance >= 80 ? 'bg-blue-500' : team.avgPerformance >= 70 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded-full`}
                    style={{ width: `${team.avgPerformance}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-500">Budget Utilization</p>
                  <p className="text-sm font-semibold text-gray-700">{team.budgetUtilization}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={getBudgetColor(team.budgetUtilization) + ' h-2 rounded-full'}
                    style={{ width: `${team.budgetUtilization}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable data={filteredData} columns={columns} />
      )}

      {/* Team Details Panel */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Team Code</p>
                    <p className="font-semibold text-gray-900">{selectedTeam.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-semibold text-gray-900">{selectedTeam.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{selectedTeam.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shift</p>
                    <p className="font-semibold text-gray-900">{selectedTeam.shift}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Team Lead</p>
                    <p className="font-semibold text-gray-900">{selectedTeam.teamLead}</p>
                    <p className="text-sm text-gray-500">{selectedTeam.teamLeadId}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Mail className="w-4 h-4" />
                    {selectedTeam.teamLeadEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Phone className="w-4 h-4" />
                    {selectedTeam.teamLeadPhone}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Established Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedTeam.establishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-indigo-600 mb-1">Members</p>
                  <p className="text-2xl font-bold text-indigo-700">{selectedTeam.memberCount}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-600 mb-1">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedTeam.activeProjects}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-700">{selectedTeam.completedProjects}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-purple-600 mb-1">Performance</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedTeam.avgPerformance}%</p>
                </div>
              </div>

              {/* Team Members */}
              {selectedTeam.members.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Team Members</h3>
                  <div className="space-y-3">
                    {selectedTeam.members.map(member => (
                      <div key={member.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.designation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Joined: {new Date(member.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                          <StatusBadge status={member.performance} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          console.log('New team data:', data);
          setIsCreateModalOpen(false);
          alert(`Team Created Successfully!\n\nTeam: ${data.name} (${data.code})\nDepartment: ${data.department}\nTeam Lead: ${data.teamLeadName}\nLocation: ${data.location}\nShift: ${data.shift}`);
        }}
      />
    </div>
  );
}
