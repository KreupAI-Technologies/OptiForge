'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Users, Shield, MapPin, Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { systemMastersService, User } from '@/services/system-masters.service';
import { userManagementService, UserStatus } from '@/services/user-management.service';
import { exportToCsv } from '@/lib/export';

export default function UserMasterPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccessLevel, setFilterAccessLevel] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const COMPANY_ID = '123e4567-e89b-12d3-a456-426614174000';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await systemMastersService.getAllUsers(COMPANY_ID);
      setUsers(data);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const [viewUser, setViewUser] = useState<User | null>(null);

  // Add/Edit form modal state
  const emptyForm = {
    employeeId: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    jobTitle: '',
    roleId: '',
    password: '',
    twoFactorEnabled: false,
    status: UserStatus.ACTIVE,
  };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);

  const handleViewUser = (row: User) => {
    // Open a read modal with the row data (real UX, no fake toast).
    setViewUser(row);
  };

  const handleEditUser = (row: User) => {
    setFormMode('edit');
    setEditingUserId(row.id);
    setFormData({
      employeeId: row.employeeId || '',
      email: row.email || '',
      firstName: row.employee?.firstName || (row.fullName?.split(' ')[0] ?? ''),
      lastName: row.employee?.lastName || (row.fullName?.split(' ').slice(1).join(' ') ?? ''),
      phone: row.employee?.phone || '',
      department: row.employee?.department?.name || '',
      jobTitle: row.employee?.designation?.name || '',
      roleId: row.roleId || '',
      password: '',
      twoFactorEnabled: row.mfaEnabled,
      status: row.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
    });
    setIsFormOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('First name and last name are required', 'error');
      return;
    }
    if (formMode === 'create' && !formData.email.trim()) {
      showToast('Email is required', 'error');
      return;
    }
    if (formMode === 'create' && !formData.password.trim()) {
      showToast('Password is required for a new user', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (formMode === 'edit' && editingUserId) {
        await userManagementService.updateUser(editingUserId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          jobTitle: formData.jobTitle || undefined,
          roleId: formData.roleId || undefined,
          status: formData.status,
          twoFactorEnabled: formData.twoFactorEnabled,
        });
        showToast('User updated', 'success');
      } else {
        await userManagementService.createUser({
          employeeId: formData.employeeId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          department: formData.department,
          jobTitle: formData.jobTitle,
          roleId: formData.roleId,
          password: formData.password,
          twoFactorEnabled: formData.twoFactorEnabled,
        });
        showToast('User created', 'success');
      }
      setIsFormOpen(false);
      await fetchUsers();
    } catch (error) {
      showToast(formMode === 'edit' ? 'Failed to update user' : 'Failed to create user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateUser = async (row: User) => {
    if (!confirm(`Are you sure you want to deactivate ${row.fullName}?`)) return;
    try {
      // Call the it-admin user endpoint FIRST, then update local state only
      // on success. Persists the deactivation instead of a local-only toggle.
      await userManagementService.updateUser(row.id, { status: UserStatus.INACTIVE });
      setUsers(prev => prev.map(u => (u.id === row.id ? { ...u, isActive: false } : u)));
      showToast(`Deactivated ${row.fullName}`, 'success');
    } catch (error) {
      showToast(`Failed to deactivate ${row.fullName}`, 'error');
    }
  };

  const handleExport = () => {
    exportToCsv('user-master', filteredData);
    showToast('Exporting user data...', 'success');
  };

  const handleAddUser = () => {
    setFormMode('create');
    setEditingUserId(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  // Get unique departments and locations
  const departments = useMemo(() => {
    return Array.from(new Set(users.map(u => u.employee?.department?.name).filter(Boolean))).sort() as string[];
  }, [users]);

  const locations = useMemo(() => {
    return Array.from(new Set(users.map(u => u.employee?.branchId).filter(Boolean))).sort() as string[];
  }, [users]);

  // Filtered data
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.employeeCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.employee?.designation?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' || user.employee?.department?.name === filterDepartment;
      const matchesLocation = filterLocation === 'all' || user.employee?.branchId === filterLocation;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);
      const matchesAccessLevel = filterAccessLevel === 'all' || user.accessLevel === filterAccessLevel;

      return matchesSearch && matchesDepartment && matchesLocation && matchesStatus && matchesAccessLevel;
    });
  }, [users, searchTerm, filterDepartment, filterLocation, filterStatus, filterAccessLevel]);

  const getStatusColor = (status: string) => {
    const colors = {
      'probation': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'notice_period': 'bg-orange-100 text-orange-800',
      'separated': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAccessLevelColor = (level: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'employee': 'bg-green-100 text-green-800',
      'restricted': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'employeeCode',
      sortable: true,
      width: 'w-48',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.fullName || row.username}</div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{value || 'N/A'}</span> • {row.employee?.designation?.name || 'No Designation'}
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: 'email',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="text-gray-900">{value || 'No Email'}</div>
          <div className="text-xs text-gray-500">{row.employee?.phone || 'No Phone'}</div>
        </div>
      )
    },
    {
      id: 'department',
      header: 'Department',
      accessor: 'employee',
      sortable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-gray-400" />
            <span className="font-medium">{row.employee?.department?.name || 'Unassigned'}</span>
          </div>
          <div className="text-xs text-gray-500">{row.employee?.grade || '-'}</div>
        </div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessor: 'employee',
      sortable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span>{row.employee?.branchId || 'Global'}</span>
          </div>
        </div>
      )
    },
    {
      id: 'role',
      header: 'Role & Access',
      accessor: 'role',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.role?.roleName || 'No Role'}</div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getAccessLevelColor(row.accessLevel)}`}>
              {row.accessLevel}
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'accountStatus',
      header: 'Account',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          text={value ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      id: 'mfa',
      header: 'Security',
      accessor: 'mfaEnabled',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          <div className={value ? 'text-green-600' : 'text-gray-400'}>
            {value ? '🔒 MFA Enabled' : '🔓 MFA Off'}
          </div>
          <div className="text-gray-500 mt-0.5">
            {row.accountLocked ? '🚫 Locked' : '✓ Active'}
          </div>
        </div>
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
              handleViewUser(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeactivateUser(row);
            }}
          >
            Deactivate
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('all');
    setFilterLocation('all');
    setFilterStatus('all');
    setFilterAccessLevel('all');
  };

  const activeFilterCount = [
    filterDepartment !== 'all',
    filterLocation !== 'all',
    filterStatus !== 'all',
    filterAccessLevel !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    onProbation: users.filter(u => u.employee?.employmentStatus?.toLowerCase() === 'probation').length,
    managers: users.filter(u => u.role?.roleName?.toLowerCase().includes('manager')).length,
    mfaEnabled: users.filter(u => u.mfaEnabled).length,
    contract: users.filter(u => u.employee?.employmentType?.toLowerCase() === 'contract').length
  }), [users]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className={`rounded-lg shadow-lg p-3 ${toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
            <div className="flex items-start gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' :
                toast.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              User Master
            </h1>
            <p className="text-gray-600 mt-1">Manage employee accounts, roles, and access permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">On Probation</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.onProbation}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Managers</div>
            <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> MFA Enabled
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.mfaEnabled}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Contract</div>
            <div className="text-2xl font-bold text-orange-600">{stats.contract}</div>
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
                  placeholder="Search by name, employee code, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    value={filterAccessLevel}
                    onChange={(e) => setFilterAccessLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <DataTable
              data={filteredData}
              columns={columns}
              pagination={{
                enabled: true,
                pageSize: 10
              }}
              sorting={{
                enabled: true,
                defaultSort: { column: 'employee', direction: 'asc' }
              }}
              emptyMessage="No users found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </div>
      </div>

      {/* User details modal */}
      <ModalWrapper
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
        title={viewUser ? (viewUser.fullName || viewUser.username) : 'User'}
        size="md"
      >
        {viewUser && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500">Employee Code</div>
                <div className="font-mono font-medium text-gray-900">{viewUser.employeeCode || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500">Username</div>
                <div className="font-medium text-gray-900">{viewUser.username}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{viewUser.email || 'No Email'}</div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">{viewUser.employee?.phone || 'No Phone'}</div>
              </div>
              <div>
                <div className="text-gray-500">Department</div>
                <div className="font-medium text-gray-900">{viewUser.employee?.department?.name || 'Unassigned'}</div>
              </div>
              <div>
                <div className="text-gray-500">Designation</div>
                <div className="font-medium text-gray-900">{viewUser.employee?.designation?.name || 'No Designation'}</div>
              </div>
              <div>
                <div className="text-gray-500">Role</div>
                <div className="font-medium text-gray-900">{viewUser.role?.roleName || 'No Role'}</div>
              </div>
              <div>
                <div className="text-gray-500">Access Level</div>
                <div className="font-medium capitalize text-gray-900">{viewUser.accessLevel}</div>
              </div>
              <div>
                <div className="text-gray-500">Account Status</div>
                <div className="font-medium text-gray-900">{viewUser.isActive ? 'Active' : 'Inactive'}</div>
              </div>
              <div>
                <div className="text-gray-500">MFA</div>
                <div className="font-medium text-gray-900">{viewUser.mfaEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Add / Edit user form modal */}
      <ModalWrapper
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'edit' ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveUser();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required={formMode === 'create'}
                disabled={formMode === 'edit'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                disabled={formMode === 'edit'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role ID</label>
              <input
                type="text"
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {formMode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            {formMode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={UserStatus.ACTIVE}>Active</option>
                  <option value={UserStatus.INACTIVE}>Inactive</option>
                  <option value={UserStatus.SUSPENDED}>Suspended</option>
                  <option value={UserStatus.PENDING}>Pending</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <input
                id="mfa-toggle"
                type="checkbox"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="mfa-toggle" className="text-sm font-medium text-gray-700">
                Two-Factor Authentication
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : formMode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
