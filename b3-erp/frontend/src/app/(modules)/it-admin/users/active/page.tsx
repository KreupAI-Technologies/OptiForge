'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, Download, Filter, MoreVertical, CheckCircle, Mail, Trash2, Eye, Lock } from 'lucide-react';
import { UserManagementService } from '@/services/user-management.service';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinDate: string;
  avatar: string;
}

const activeUsersSeed: User[] = [
  {
    id: '001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-98765-43210',
    department: 'Operations',
    role: 'Manager',
    joinDate: '2024-01-15',
    avatar: '🧑‍💼'
  },
  {
    id: '002',
    name: 'Priya Singh',
    email: 'priya@example.com',
    phone: '+91-98765-43211',
    department: 'Sales',
    role: 'Executive',
    joinDate: '2024-02-10',
    avatar: '👩‍💼'
  },
  {
    id: '003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91-98765-43212',
    department: 'IT',
    role: 'Administrator',
    joinDate: '2024-03-05',
    avatar: '🧑‍💻'
  },
  {
    id: '004',
    name: 'Sneha Sharma',
    email: 'sneha@example.com',
    phone: '+91-98765-43213',
    department: 'HR',
    role: 'Specialist',
    joinDate: '2024-04-20',
    avatar: '👩‍💼'
  },
  {
    id: '005',
    name: 'Vikram Desai',
    email: 'vikram@example.com',
    phone: '+91-98765-43214',
    department: 'Finance',
    role: 'Analyst',
    joinDate: '2024-05-12',
    avatar: '🧑‍💼'
  },
  {
    id: '006',
    name: 'Neha Gupta',
    email: 'neha@example.com',
    phone: '+91-98765-43215',
    department: 'Marketing',
    role: 'Manager',
    joinDate: '2024-06-18',
    avatar: '👩‍💼'
  }
];

export default function ActiveUsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend supports a status filter (UserFilters.status); request only active users.
        const raw = (await UserManagementService.getAllUsers({ status: 'active' as any })) as any[];
        const list = (Array.isArray(raw) ? raw : []).filter(
          (u: any) =>
            (u.status ?? '').toString().toLowerCase() === 'active' ||
            u.isActive === true ||
            (u.status === undefined && u.isActive === undefined)
        );
        const mapped: User[] = list.map((u: any) => ({
          id: (u.id ?? u.userId ?? '').toString(),
          name: (
            u.name ??
            u.displayName ??
            [u.firstName, u.lastName].filter(Boolean).join(' ') ??
            ''
          ).toString(),
          email: (u.email ?? '').toString(),
          phone: (u.phone ?? u.phoneNumber ?? '').toString(),
          department: (u.department ?? '').toString(),
          role: (u.role ?? u.roleName ?? u.jobTitle ?? '').toString(),
          joinDate: (u.joinDate ?? u.createdAt ?? u.joinedAt ?? '').toString(),
          avatar: (u.avatar ?? '👤').toString(),
        }));
        if (!cancelled) setActiveUsers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load users');
          setActiveUsers([]);
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

  const departments = ['all', 'Operations', 'Sales', 'IT', 'HR', 'Finance', 'Marketing'];
  const roles = ['all', 'Manager', 'Executive', 'Administrator', 'Specialist', 'Analyst'];

  const filteredUsers = activeUsers.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDepartment === 'all' || user.department === selectedDepartment;
    const matchRole = selectedRole === 'all' || user.role === selectedRole;
    return matchSearch && matchDept && matchRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="w-full">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading users…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-10 h-10 text-emerald-600" />
              Active Users
            </h1>
            <p className="text-slate-600 mt-2">{filteredUsers.length} active users in system</p>
          </div>
          <button 
            onClick={() => router.push('/it-admin/users/create')}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-4xl">{user.avatar}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.role}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-2">
                <p className="text-sm text-slate-600">{user.email}</p>
                <p className="text-sm text-slate-600">{user.phone}</p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Department:</span> {user.department}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Joined:</span> {new Date(user.joinDate).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/it-admin/users/${user.id}`)}
                  className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Reset Password
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-slate-600">No active users found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
