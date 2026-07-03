'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Shield, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { systemMastersService, Role } from '@/services/system-masters.service';
import { exportToCsv } from '@/lib/export';

export default function RoleMasterPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const data = await systemMastersService.getAllRoles('123e4567-e89b-12d3-a456-426614174000');
        setRoles(data);
      } catch (error) {
        showToast('Failed to fetch roles', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditRole = (role: Role) => {
    showToast(`Editing role: ${role.roleName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('role-master', filteredData);
    showToast('Exporting roles data...', 'success');
  };

  const handleAddRole = () => {
    showToast('Opening add role form...', 'info');
  };

  const filteredData = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch =
        role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.roleCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || role.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [roles, searchTerm, filterCategory]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'system': 'bg-red-100 text-red-800',
      'hr': 'bg-blue-100 text-blue-800',
      'finance': 'bg-green-100 text-green-800',
      'operations': 'bg-orange-100 text-orange-800',
      'sales': 'bg-purple-100 text-purple-800',
      'it': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<Role>[] = [
    {
      id: 'code',
      header: 'Code',
      accessor: 'roleCode',
      sortable: true,
      width: 'w-32',
      render: (value) => <span className="font-mono font-semibold text-blue-600">{String(value)}</span>
    },
    {
      id: 'name',
      header: 'Role Name',
      accessor: 'roleName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{String(value)}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(String(value))}`}>
          {String(value)}
        </span>
      )
    },
    {
      id: 'permissions',
      header: 'Permissions',
      accessor: 'permissions',
      sortable: false,
      render: (value: Role['permissions']) => (
        <div className="text-sm text-gray-600">
          <div>{value?.length || 0} modules</div>
          <div className="text-xs text-gray-500">
            {value?.filter((p) => p.canApprove).length || 0} with approval rights
          </div>
        </div>
      )
    },
    {
      id: 'users',
      header: 'Assigned Users',
      accessor: 'users',
      sortable: true,
      render: (value: Role['users']) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value?.length || 0}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} text={value ? 'Active' : 'Inactive'} />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditRole(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete role ${row.roleName}?`)) {
                setRoles(prev => prev.filter(r => r.id !== row.id));
                showToast(`Deleted role: ${row.roleName}`, 'success');
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const stats = useMemo(() => ({
    total: roles.length,
    active: roles.filter(r => r.isActive).length,
    totalUsers: roles.reduce((sum, r) => sum + (r.users?.length || 0), 0),
    categories: new Set(roles.map(r => r.category)).size
  }), [roles]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-sky-50 to-cyan-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 animate-slide-in"
          style={{
            borderLeftColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            minWidth: '300px'
          }}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
          <span className="text-sm text-gray-700">{toast.message}</span>
        </div>
      )}

      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-sky-600" />
              Role Master
            </h1>
            <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleAddRole}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Roles</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Active Roles</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-sky-600">{stats.totalUsers}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Categories</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.categories}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex-none p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by role name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-sky-50 border-sky-300 text-sky-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              {(filterCategory !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Categories</option>
                  <option value="system">System</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="sales">Sales</option>
                  <option value="it">IT</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <DataTable
              data={filteredData}
              columns={columns}
              pagination={{ enabled: true, pageSize: 10 }}
              sorting={{ enabled: true, defaultSort: { column: 'name', direction: 'asc' } }}
              emptyMessage="No roles found"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
