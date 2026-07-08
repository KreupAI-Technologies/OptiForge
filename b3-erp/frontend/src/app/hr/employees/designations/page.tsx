'use client';

import { useState, useMemo, useEffect } from 'react';
import { Briefcase, Plus, Search, Filter, TrendingUp, Users, Award, DollarSign, BarChart3 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { AddDesignationModal } from '@/components/hr/AddDesignationModal';
import { HrPagesService } from '@/services/hr-pages.service';

interface Designation {
  id: string;
  title: string;
  code: string;
  department: string;
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  grade: string;
  employeeCount: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  reportingTo?: string;
  responsibilities: string[];
  requirements: string[];
  status: 'active' | 'inactive' | 'deprecated';
}

export default function DesignationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const levelValues: Designation['level'][] = [
      'entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive',
    ];
    const statusValues: Designation['status'][] = ['active', 'inactive', 'deprecated'];
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.designations<any[]>();
        const mapped: Designation[] = (raw ?? []).map((d) => {
          const lvl = String(d.level ?? '').toLowerCase();
          const st = String(d.status ?? '').toLowerCase();
          const minSalary = Number(d.minSalary ?? 0);
          const maxSalary = Number(d.maxSalary ?? 0);
          return {
            id: String(d.id ?? ''),
            title: d.title ?? d.name ?? '',
            code: d.code ?? '',
            department: d.department ?? '',
            level: (levelValues.includes(lvl as Designation['level'])
              ? (lvl as Designation['level'])
              : 'mid'),
            grade: d.gradeLevel ?? d.grade ?? '',
            employeeCount: Number(d.employeeCount ?? 0),
            minSalary,
            maxSalary,
            avgSalary: Number(d.avgSalary ?? Math.round((minSalary + maxSalary) / 2)),
            reportingTo: d.reportsTo ?? d.reportingTo ?? undefined,
            responsibilities: Array.isArray(d.responsibilities) ? d.responsibilities : [],
            requirements: Array.isArray(d.requirements) ? d.requirements : [],
            status: (statusValues.includes(st as Designation['status'])
              ? (st as Designation['status'])
              : 'active'),
          };
        });
        if (!cancelled) setDesignations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load designations');
          setDesignations([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleCreateDesignation = async (data: any) => {
    setActionError(null);
    try {
      await HrPagesService.createDesignation({
        title: data.title,
        code: data.code,
        department: data.department,
        level: data.level,
        grade: data.grade || undefined,
        minSalary: data.minSalary ? Number(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? Number(data.maxSalary) : undefined,
        reportsTo: data.reportingTo || data.reportsTo || undefined,
        labourCategory: data.labourCategory || undefined,
        labourGrade: data.labourGrade || undefined,
        status: 'active',
      });
      setIsAddModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create designation');
    }
  };

  const departments = ['all', 'Production', 'Quality', 'IT', 'Human Resources', 'Logistics', 'Safety', 'Research', 'Finance', 'Maintenance'];
  const levels = ['all', 'entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'];

  const filteredData = useMemo(() => {
    return designations.filter(des => {
      const matchesSearch = des.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          des.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || des.department === selectedDepartment;
      const matchesLevel = selectedLevel === 'all' || des.level === selectedLevel;
      return matchesSearch && matchesDepartment && matchesLevel;
    });
  }, [designations, searchTerm, selectedDepartment, selectedLevel]);

  const stats = useMemo(() => {
    const totalEmployees = designations.reduce((sum, d) => sum + d.employeeCount, 0);
    const avgSalaryOverall = designations.length
      ? designations.reduce((sum, d) => sum + d.avgSalary, 0) / designations.length
      : 0;
    return {
      total: designations.length,
      totalEmployees,
      avgSalaryOverall: Math.round(avgSalaryOverall)
    };
  }, [designations]);

  const getLevelBadge = (level: string) => {
    const badges = {
      entry: 'bg-gray-100 text-gray-700',
      junior: 'bg-blue-100 text-blue-700',
      mid: 'bg-green-100 text-green-700',
      senior: 'bg-purple-100 text-purple-700',
      lead: 'bg-orange-100 text-orange-700',
      manager: 'bg-red-100 text-red-700',
      director: 'bg-pink-100 text-pink-700',
      executive: 'bg-indigo-100 text-indigo-700'
    };
    return badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const columns = [
    {
      key: 'code', label: 'Code', sortable: true,
      render: (v: string, row: Designation) => (
        <div><div className="font-semibold text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.title}</div></div>
      )
    },
    {
      key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: Designation) => (
        <div><div className="font-medium text-gray-900">{v}</div><div className="text-xs text-gray-500">Grade: {row.grade}</div></div>
      )
    },
    {
      key: 'level', label: 'Level', sortable: true,
      render: (v: string) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(v)}`}>{v.toUpperCase()}</span>
    },
    {
      key: 'employeeCount', label: 'Employees', sortable: true,
      render: (v: number) => <div className="flex items-center gap-1 text-indigo-600 font-semibold"><Users className="w-4 h-4" />{v}</div>
    },
    {
      key: 'avgSalary', label: 'Avg Salary', sortable: true,
      render: (v: number, row: Designation) => (
        <div className="text-sm"><div className="font-semibold text-gray-900">₹{(v/100000).toFixed(1)}L</div>
        <div className="text-xs text-gray-500">₹{(row.minSalary/100000).toFixed(1)}L - ₹{(row.maxSalary/100000).toFixed(1)}L</div></div>
      )
    },
    {
      key: 'reportingTo', label: 'Reports To', sortable: true,
      render: (v?: string) => <div className="text-sm text-gray-700">{v || 'N/A'}</div>
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="h-8 w-8 text-purple-600" />Designations</h1>
        <p className="text-gray-600 mt-2">Manage job positions, roles, and hierarchy</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading designations…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Designations</p><p className="text-2xl font-bold text-purple-600">{stats.total}</p></div>
          <Briefcase className="w-8 h-8 text-purple-400" /></div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Employees</p><p className="text-2xl font-bold text-indigo-600">{stats.totalEmployees}</p></div>
          <Users className="w-8 h-8 text-indigo-400" /></div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Avg Salary</p><p className="text-xl font-bold text-green-600">₹{(stats.avgSalaryOverall/100000).toFixed(1)}L</p></div>
          <DollarSign className="w-8 h-8 text-green-400" /></div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Roles</p><p className="text-2xl font-bold text-blue-600">{designations.filter(d => d.status === 'active').length}</p></div>
          <Award className="w-8 h-8 text-blue-400" /></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">All Designations</h2>
            <span className="text-sm text-gray-500">({filteredData.length} designations)</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Designation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by title or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter className="w-5 h-5" />Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                {levels.map(level => <option key={level} value={level}>{level === 'all' ? 'All Levels' : level.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <DataTable data={filteredData} columns={columns} />

      {/* Add Designation Modal */}
      <AddDesignationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDesignation}
      />
    </div>
  );
}
