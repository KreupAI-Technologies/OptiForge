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
  }, []);

  const mockDesignations: Designation[] = [
    {
      id: 'D001', title: 'Production Manager', code: 'PM-01', department: 'Production', level: 'manager', grade: 'M1',
      employeeCount: 8, minSalary: 600000, maxSalary: 900000, avgSalary: 750000, reportingTo: 'VP Operations',
      responsibilities: ['Oversee production operations', 'Manage production team', 'Ensure quality standards', 'Budget management'],
      requirements: ['B.Tech Mechanical', '8+ years experience', 'Six Sigma certification'], status: 'active'
    },
    {
      id: 'D002', title: 'Quality Control Head', code: 'QCH-01', department: 'Quality', level: 'manager', grade: 'M1',
      employeeCount: 3, minSalary: 550000, maxSalary: 850000, avgSalary: 700000, reportingTo: 'VP Quality',
      responsibilities: ['Lead QC team', 'Implement quality systems', 'Audit processes', 'Report to management'],
      requirements: ['M.Sc Chemistry/Related', '6+ years experience', 'ISO auditor certification'], status: 'active'
    },
    {
      id: 'D003', title: 'Senior Software Engineer', code: 'SSE-01', department: 'IT', level: 'senior', grade: 'E3',
      employeeCount: 12, minSalary: 800000, maxSalary: 1400000, avgSalary: 1100000, reportingTo: 'IT Manager',
      responsibilities: ['Design software solutions', 'Code review', 'Mentor junior engineers', 'Technical documentation'],
      requirements: ['B.Tech CS/IT', '5+ years experience', 'Expertise in full-stack development'], status: 'active'
    },
    {
      id: 'D004', title: 'HR Executive', code: 'HRE-01', department: 'Human Resources', level: 'mid', grade: 'E2',
      employeeCount: 6, minSalary: 350000, maxSalary: 550000, avgSalary: 450000, reportingTo: 'HR Manager',
      responsibilities: ['Recruitment', 'Employee onboarding', 'Maintain HR records', 'Employee engagement'],
      requirements: ['MBA HR', '2-4 years experience', 'SHRM certification preferred'], status: 'active'
    },
    {
      id: 'D005', title: 'Production Supervisor', code: 'PS-01', department: 'Production', level: 'lead', grade: 'E3',
      employeeCount: 18, minSalary: 350000, maxSalary: 500000, avgSalary: 425000, reportingTo: 'Production Manager',
      responsibilities: ['Supervise production line', 'Monitor quality', 'Train operators', 'Report to manager'],
      requirements: ['Diploma/B.Tech', '3+ years experience', 'Safety certification'], status: 'active'
    },
    {
      id: 'D006', title: 'Warehouse Manager', code: 'WM-01', department: 'Logistics', level: 'manager', grade: 'M2',
      employeeCount: 4, minSalary: 450000, maxSalary: 700000, avgSalary: 575000, reportingTo: 'Logistics Head',
      responsibilities: ['Manage warehouse operations', 'Inventory control', 'Team management', 'Vendor coordination'],
      requirements: ['B.Com/MBA', '5+ years experience', 'ERP knowledge'], status: 'active'
    },
    {
      id: 'D007', title: 'Safety Officer', code: 'SO-01', department: 'Safety', level: 'mid', grade: 'E2',
      employeeCount: 10, minSalary: 300000, maxSalary: 450000, avgSalary: 375000, reportingTo: 'Safety Manager',
      responsibilities: ['Conduct safety audits', 'Training programs', 'Incident investigation', 'Compliance reporting'],
      requirements: ['B.Tech Safety/Industrial', '3+ years experience', 'NEBOSH certification'], status: 'active'
    },
    {
      id: 'D008', title: 'Research Scientist', code: 'RS-01', department: 'Research', level: 'senior', grade: 'E3',
      employeeCount: 5, minSalary: 700000, maxSalary: 1200000, avgSalary: 950000, reportingTo: 'R&D Head',
      responsibilities: ['Conduct research', 'Product development', 'Technical papers', 'Patent filing'],
      requirements: ['M.Sc/PhD', '5+ years research experience', 'Published papers'], status: 'active'
    },
    {
      id: 'D009', title: 'Accounts Assistant', code: 'AA-01', department: 'Finance', level: 'junior', grade: 'E1',
      employeeCount: 8, minSalary: 250000, maxSalary: 350000, avgSalary: 300000, reportingTo: 'Finance Manager',
      responsibilities: ['Bookkeeping', 'Invoice processing', 'Bank reconciliation', 'GST filing'],
      requirements: ['B.Com', '1-2 years experience', 'Tally proficiency'], status: 'active'
    },
    {
      id: 'D010', title: 'Maintenance Technician', code: 'MT-01', department: 'Maintenance', level: 'mid', grade: 'E2',
      employeeCount: 15, minSalary: 280000, maxSalary: 420000, avgSalary: 350000, reportingTo: 'Maintenance Manager',
      responsibilities: ['Equipment maintenance', 'Breakdown resolution', 'Preventive maintenance', 'Documentation'],
      requirements: ['ITI/Diploma', '3+ years experience', 'Electrical/Mechanical knowledge'], status: 'active'
    }
  ];

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
        onSubmit={(data) => {
          console.log('New designation data:', data);
          setIsAddModalOpen(false);
          alert(`Designation Created Successfully!\n\nTitle: ${data.title}\nCode: ${data.code}\nDepartment: ${data.department}\nLevel: ${data.level.toUpperCase()}\nGrade: ${data.grade}\nLabour Category: ${data.labourCategory}\nLabour Grade (GCC): ${data.labourGrade}\nSalary Range: ₹${(Number(data.minSalary)/100000).toFixed(1)}L - ₹${(Number(data.maxSalary)/100000).toFixed(1)}L`);
        }}
      />
    </div>
  );
}
