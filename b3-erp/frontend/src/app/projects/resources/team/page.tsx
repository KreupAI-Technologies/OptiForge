'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Search, Filter, PlusCircle, UserPlus, Shield, Mail } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  projects: number;
  active: boolean;
};

export default function TeamManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>('all');

  const [team, setTeam] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await projectManagementService.getProjectsResourcesList();
        const mapped: Member[] = (Array.isArray(rows) ? rows : []).map((r: any) => {
          const status = (r?.status ?? '').toString().toLowerCase();
          const active =
            typeof r?.active === 'boolean'
              ? r.active
              : status
              ? status === 'active'
              : true;
          return {
            id: String(r?.id ?? r?.resourceId ?? r?.userId ?? ''),
            name: r?.resourceName ?? r?.userName ?? r?.name ?? 'Unknown',
            email: r?.email ?? '',
            role: r?.role ?? r?.designation ?? '',
            department: r?.department ?? r?.dept ?? '',
            projects: Number(r?.projects ?? r?.projectCount ?? 0) || 0,
            active,
          };
        });
        if (!cancelled) setTeam(mapped);
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err?.message ?? 'Failed to load team members');
          setTeam([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const depts = useMemo(() => ['all', ...Array.from(new Set(team.map(t => t.department).filter(Boolean)))], [team]);
  const filtered = useMemo(() => team.filter(m => {
    const matchSearch = [m.name, m.email, m.role, m.department, m.id].some(v => (v ?? '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDept = deptFilter==='all' ? true : m.department === deptFilter;
    const matchStatus = statusFilter==='all' ? true : statusFilter==='active' ? m.active : !m.active;
    return matchSearch && matchDept && matchStatus;
  }), [team, searchTerm, deptFilter, statusFilter]);

  const totalMembers = team.length;
  const projectManagers = useMemo(() => team.filter(m => (m.role ?? '').toLowerCase().includes('project manager')).length, [team]);
  const activeProjects = useMemo(() => team.reduce((sum, m) => sum + (m.active ? m.projects : 0), 0), [team]);
  const departmentCount = useMemo(() => new Set(team.map(m => m.department).filter(Boolean)).size, [team]);

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-teal-600" />
          Team Management
        </h1>
        <p className="text-gray-600 mt-2">Manage project teams and roles</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalMembers}</p>
            </div>
            <Users className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Project Managers</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{projectManagers}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Projects</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{activeProjects}</p>
            </div>
            <Users className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Departments</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{departmentCount}</p>
            </div>
            <Users className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <select value={deptFilter} onChange={(e)=>setDeptFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            {depts.map(d => <option key={d} value={d}>{d==='all'?'All Departments':d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="ml-auto px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add Member</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Projects</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading team members…</td></tr>
              )}
              {!isLoading && loadError && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-red-600">{loadError}</td></tr>
              )}
              {!isLoading && !loadError && filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{m.name}</span>
                      <span className="text-xs text-gray-500">{m.id} • {m.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.projects}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${m.active?'bg-green-50 text-green-700':'bg-gray-100 text-gray-700'}`}>{m.active?'Active':'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="text-gray-700 hover:text-gray-900 text-sm flex items-center gap-1"><Mail className="h-4 w-4" /> Contact</button>
                      <button className="text-teal-700 hover:text-teal-900 text-sm flex items-center gap-1"><Shield className="h-4 w-4" /> Permissions</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !loadError && filtered.length===0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No team members</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
