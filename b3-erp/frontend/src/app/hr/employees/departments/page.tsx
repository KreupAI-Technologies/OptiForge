'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Plus, Users, TrendingUp, Search, Filter, X, MapPin, Phone, Mail, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddDepartmentModal } from '@/components/hr/AddDepartmentModal';
import { HrPagesService } from '@/services/hr-pages.service';

interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  headEmail: string;
  headPhone: string;
  location: string;
  employeeCount: number;
  activeEmployees: number;
  contractEmployees: number;
  avgSalary: number;
  budgetUtilization: number;
  status: 'active' | 'inactive';
  costCenter: string;
  establishedDate: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.departments<any[]>();
        const mapped: Department[] = (raw ?? []).map((d) => ({
          id: String(d.id ?? ''),
          code: d.code ?? '',
          name: d.name ?? '',
          headOfDepartment: d.headOfDepartmentName ?? '',
          headEmail: d.email ?? '',
          headPhone: d.phone ?? '',
          location: d.location ?? '',
          employeeCount: Number(d.employeeCount ?? 0),
          activeEmployees: Number(d.activeEmployees ?? 0),
          contractEmployees: Number(d.contractEmployees ?? 0),
          avgSalary: Number(d.avgSalary ?? 0),
          budgetUtilization: Number(d.budgetUtilization ?? 0),
          status: String(d.status ?? '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
          costCenter: d.costCenter ?? '',
          establishedDate: d.establishedDate ?? '',
        }));
        if (!cancelled) setDepartments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load departments');
          setDepartments([]);
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

  const handleCreateDepartment = async (data: any) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await HrPagesService.createDepartment({
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        headOfDepartmentName: data.headOfDepartment || undefined,
        location: data.location || undefined,
        costCenter: data.costCenter || undefined,
        budget: data.budgetAllocation ? Number(data.budgetAllocation) : undefined,
        status: (data.status || 'active').toUpperCase(),
      });
      setIsAddModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return;
    setActionError(null);
    try {
      await HrPagesService.deleteDepartment(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  const filteredData = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || dept.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, filterStatus]);

  const columns: Column<Department>[] = [
    {
      id: 'department',
      header: 'Department',
      accessor: 'name',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      id: 'head',
      header: 'Department Head',
      accessor: 'headOfDepartment',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" />
            {row.headEmail}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {row.headPhone}
          </div>
        </div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessor: 'location',
      sortable: true,
      render: (v) => (
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {v}
        </div>
      )
    },
    {
      id: 'employees',
      header: 'Employees',
      accessor: 'employeeCount',
      sortable: true,
      render: (v, row) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{v} Total</div>
          <div className="text-xs text-gray-600">Active: {row.activeEmployees}</div>
          <div className="text-xs text-gray-600">Contract: {row.contractEmployees}</div>
        </div>
      )
    },
    {
      id: 'avgSalary',
      header: 'Avg Salary',
      accessor: 'avgSalary',
      sortable: true,
      render: (v) => (
        <div className="font-medium text-green-600">₹{v.toLocaleString()}/mo</div>
      )
    },
    {
      id: 'budget',
      header: 'Budget Utilization',
      accessor: 'budgetUtilization',
      sortable: true,
      render: (v) => (
        <div>
          <div className={`font-semibold ${v >= 90 ? 'text-red-600' : v >= 75 ? 'text-orange-600' : 'text-green-600'}`}>
            {v}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className={`${v >= 90 ? 'bg-red-500' : v >= 75 ? 'bg-orange-500' : 'bg-green-500'} h-1.5 rounded-full`} style={{ width: `${v}%` }}></div>
          </div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (v) => <StatusBadge status={v === 'active' ? 'success' : 'error'} text={v === 'active' ? 'Active' : 'Inactive'} />
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleDeleteDepartment(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete department"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const stats = useMemo(() => {
    const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
    const totalActive = departments.reduce((sum, d) => sum + d.activeEmployees, 0);
    const totalContract = departments.reduce((sum, d) => sum + d.contractEmployees, 0);
    const avgBudgetUtil = departments.reduce((sum, d) => sum + d.budgetUtilization, 0) / departments.length;
    return { total: departments.length, totalEmployees, totalActive, totalContract, avgBudgetUtil };
  }, [departments]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  const activeFilterCount = [filterStatus !== 'all', searchTerm !== ''].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Departments
          </h1>
          <p className="text-gray-600 mt-1">Manage organizational departments and structure</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading departments…
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Departments</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Active Employees</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalActive}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Contract Employees</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalContract}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Budget Util</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgBudgetUtil.toFixed(0)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}>
              Grid
            </button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}>
              Table
            </button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredData.map(dept => (
            <div key={dept.id} className="bg-white border-2 border-indigo-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                    <p className="text-xs text-gray-500">{dept.code}</p>
                  </div>
                </div>
                <StatusBadge status={dept.status === 'active' ? 'success' : 'error'} text={dept.status === 'active' ? 'Active' : 'Inactive'} />
              </div>

              <div className="space-y-2 mb-2">
                <div className="text-sm">
                  <span className="text-gray-600">Head:</span>
                  <span className="ml-2 font-medium text-gray-900">{dept.headOfDepartment}</span>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {dept.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                <div>
                  <div className="text-xs text-gray-600">Employees</div>
                  <div className="text-xl font-bold text-blue-600">{dept.employeeCount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Budget Util</div>
                  <div className={`text-xl font-bold ${dept.budgetUtilization >= 90 ? 'text-red-600' : dept.budgetUtilization >= 75 ? 'text-orange-600' : 'text-green-600'}`}>
                    {dept.budgetUtilization}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'department', direction: 'asc' } }} emptyMessage="No departments found" />
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <Building2 className="w-5 h-5 inline mr-2" />
          Department Management
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Complete department directory with head, location, and employee count</li>
          <li>✓ Budget utilization tracking with color-coded alerts</li>
          <li>✓ Active and contract employee breakdown by department</li>
          <li>✓ Average salary analytics for cost management</li>
          <li>✓ Grid and table view modes for flexible data visualization</li>
        </ul>
      </div>

      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDepartment}
      />
    </div>
  );
}
