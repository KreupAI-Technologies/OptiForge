'use client'

import { useState, useEffect } from 'react'
import {
  Users, CheckCircle, XCircle, Clock, Search, Filter,
  Download, UserPlus, UserMinus, Calendar, Shield, Mail
} from 'lucide-react'
import { ItAdminService } from '@/services/it-admin.service'

interface LicensedUser {
  id: string
  name: string
  email: string
  department: string
  role: string
  licenseType: string
  status: 'active' | 'inactive' | 'suspended'
  assignedDate: string
  lastLogin: string
  modulesAccess: string[]
}

export default function LicenseUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const [users, setUsers] = useState<LicensedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    ItAdminService.getLicenseUsers()
      .then((data) => {
        if (cancelled) return
        const mapped: LicensedUser[] = data.map((dto) => ({
          id: dto.id,
          name: dto.name,
          email: dto.email ?? '',
          department: dto.department ?? '',
          role: dto.role ?? '',
          licenseType: dto.licenseType,
          status: dto.status as LicensedUser['status'],
          assignedDate: dto.assignedDate ?? '',
          lastLogin: dto.lastActive ?? '',
          modulesAccess: [],
        }))
        setUsers(mapped)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load licensed users')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [stats] = useState({
    totalLicenses: 500,
    assignedLicenses: 387,
    availableLicenses: 113,
    activeUsers: 365,
    inactiveUsers: 18,
    suspendedUsers: 4
  })

  const handleRemoveUser = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: 'inactive' as const } : u,
      ),
    )
    try {
      await ItAdminService.updateLicenseUser(userId, { status: 'inactive' })
    } catch {
      // best-effort persistence; local state already updated
    }
  }

  const handleRenewUser = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: 'active' as const } : u,
      ),
    )
    try {
      await ItAdminService.renewLicenseUser(userId, 12)
    } catch {
      // best-effort persistence; local state already updated
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      case 'suspended':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'inactive':
        return <Clock className="h-5 w-5 text-gray-600" />
      case 'suspended':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'Full Access':
        return 'text-purple-600 bg-purple-50'
      case 'Standard':
        return 'text-blue-600 bg-blue-50'
      case 'Limited':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = Array.from(new Set(users.map(u => u.department)))

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading...
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licensed Users</h1>
          <p className="text-gray-600 mt-1">Manage user license assignments and access</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 inline mr-2" />
            Export Users
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700">
            <UserPlus className="h-4 w-4 inline mr-2" />
            Assign License
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Licenses</p>
              <p className="text-3xl font-bold mt-1">{stats.totalLicenses}</p>
            </div>
            <Users className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Assigned Licenses</p>
              <p className="text-3xl font-bold mt-1">{stats.assignedLicenses}</p>
              <p className="text-xs opacity-75 mt-1">
                {((stats.assignedLicenses / stats.totalLicenses) * 100).toFixed(1)}% utilized
              </p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Licenses</p>
              <p className="text-3xl font-bold mt-1">{stats.availableLicenses}</p>
            </div>
            <UserPlus className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Users</p>
              <p className="text-3xl font-bold mt-1">{stats.activeUsers}</p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Inactive Users</p>
              <p className="text-3xl font-bold mt-1">{stats.inactiveUsers}</p>
            </div>
            <Clock className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Suspended Users</p>
              <p className="text-3xl font-bold mt-1">{stats.suspendedUsers}</p>
            </div>
            <XCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Licensed Users</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLicenseTypeColor(user.licenseType)}`}>
                      {user.licenseType}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {user.assignedDate}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-3">
                      View
                    </button>
                    <button onClick={() => handleRenewUser(user.id)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm mr-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Renew</span>
                    </button>
                    <button onClick={() => handleRemoveUser(user.id)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                      <UserMinus className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
