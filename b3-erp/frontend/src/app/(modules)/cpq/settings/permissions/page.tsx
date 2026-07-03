'use client'

import { useEffect, useState } from 'react'
import { cpqPermissionRoleService } from '@/services/cpq/cpq-orphans.service'
import {
  Shield,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Settings,
  Save,
  AlertCircle,
  DollarSign,
  FileText,
  Search
} from 'lucide-react'

export default function CPQSettingsPermissionsPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')
  const [searchQuery, setSearchQuery] = useState('')

  // Roles with permissions
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Sales Executive',
      userCount: 24,
      permissions: {
        viewQuotes: true,
        createQuotes: true,
        editQuotes: true,
        deleteQuotes: false,
        approveQuotes: false,
        viewPricing: true,
        editPricing: false,
        viewCost: false,
        viewMargin: false,
        applyDiscount: true,
        maxDiscount: 5,
        viewReports: true,
        exportData: true,
        manageProducts: false,
        manageRules: false,
        viewAllQuotes: false,
        viewTeamQuotes: false,
        viewOwnQuotes: true
      }
    },
    {
      id: 2,
      name: 'Sales Manager',
      userCount: 8,
      permissions: {
        viewQuotes: true,
        createQuotes: true,
        editQuotes: true,
        deleteQuotes: true,
        approveQuotes: true,
        viewPricing: true,
        editPricing: false,
        viewCost: true,
        viewMargin: true,
        applyDiscount: true,
        maxDiscount: 15,
        viewReports: true,
        exportData: true,
        manageProducts: false,
        manageRules: false,
        viewAllQuotes: false,
        viewTeamQuotes: true,
        viewOwnQuotes: true
      }
    },
    {
      id: 3,
      name: 'Finance Head',
      userCount: 3,
      permissions: {
        viewQuotes: true,
        createQuotes: false,
        editQuotes: false,
        deleteQuotes: false,
        approveQuotes: true,
        viewPricing: true,
        editPricing: true,
        viewCost: true,
        viewMargin: true,
        applyDiscount: true,
        maxDiscount: 20,
        viewReports: true,
        exportData: true,
        manageProducts: false,
        manageRules: true,
        viewAllQuotes: true,
        viewTeamQuotes: true,
        viewOwnQuotes: true
      }
    },
    {
      id: 4,
      name: 'VP Sales',
      userCount: 2,
      permissions: {
        viewQuotes: true,
        createQuotes: true,
        editQuotes: true,
        deleteQuotes: true,
        approveQuotes: true,
        viewPricing: true,
        editPricing: true,
        viewCost: true,
        viewMargin: true,
        applyDiscount: true,
        maxDiscount: 25,
        viewReports: true,
        exportData: true,
        manageProducts: true,
        manageRules: true,
        viewAllQuotes: true,
        viewTeamQuotes: true,
        viewOwnQuotes: true
      }
    },
    {
      id: 5,
      name: 'CPQ Administrator',
      userCount: 2,
      permissions: {
        viewQuotes: true,
        createQuotes: true,
        editQuotes: true,
        deleteQuotes: true,
        approveQuotes: true,
        viewPricing: true,
        editPricing: true,
        viewCost: true,
        viewMargin: true,
        applyDiscount: true,
        maxDiscount: 100,
        viewReports: true,
        exportData: true,
        manageProducts: true,
        manageRules: true,
        viewAllQuotes: true,
        viewTeamQuotes: true,
        viewOwnQuotes: true
      }
    }
  ])

  useEffect(() => {
    let active = true
    cpqPermissionRoleService
      .findAll()
      .then((rows) => {
        if (!active) return
        if (!Array.isArray(rows) || rows.length === 0) return
        const mapped = rows.map((r, idx) => ({
          id: idx + 1,
          name: r.name ?? '',
          userCount: Number(r.usersCount) || 0,
          permissions: (r.permissions ?? {}) as any
        }))
        setRoles(mapped as any)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Approval limits by role
  const [approvalLimits, setApprovalLimits] = useState([
    { role: 'Sales Executive', quoteValue: 500000, discountPercent: 5, requiresApproval: true, approver: 'Sales Manager' },
    { role: 'Sales Manager', quoteValue: 2000000, discountPercent: 15, requiresApproval: true, approver: 'Finance Head' },
    { role: 'Finance Head', quoteValue: 5000000, discountPercent: 20, requiresApproval: true, approver: 'VP Sales' },
    { role: 'VP Sales', quoteValue: 10000000, discountPercent: 25, requiresApproval: true, approver: 'CEO' },
    { role: 'CEO', quoteValue: Infinity, discountPercent: 100, requiresApproval: false, approver: 'None' }
  ])

  const permissionCategories = [
    {
      name: 'Quote Management',
      permissions: ['viewQuotes', 'createQuotes', 'editQuotes', 'deleteQuotes', 'approveQuotes']
    },
    {
      name: 'Pricing & Discounts',
      permissions: ['viewPricing', 'editPricing', 'viewCost', 'viewMargin', 'applyDiscount']
    },
    {
      name: 'Data Access',
      permissions: ['viewAllQuotes', 'viewTeamQuotes', 'viewOwnQuotes', 'viewReports', 'exportData']
    },
    {
      name: 'Configuration',
      permissions: ['manageProducts', 'manageRules']
    }
  ]

  const permissionLabels: Record<string, string> = {
    viewQuotes: 'View Quotes',
    createQuotes: 'Create Quotes',
    editQuotes: 'Edit Quotes',
    deleteQuotes: 'Delete Quotes',
    approveQuotes: 'Approve Quotes',
    viewPricing: 'View Pricing',
    editPricing: 'Edit Pricing',
    viewCost: 'View Cost',
    viewMargin: 'View Margin',
    applyDiscount: 'Apply Discount',
    viewAllQuotes: 'View All Quotes',
    viewTeamQuotes: 'View Team Quotes',
    viewOwnQuotes: 'View Own Quotes',
    viewReports: 'View Reports',
    exportData: 'Export Data',
    manageProducts: 'Manage Products',
    manageRules: 'Manage Rules'
  }

  const togglePermission = (roleId: number, permission: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permission]: !role.permissions[permission as keyof typeof role.permissions]
          }
        }
      }
      return role
    }))
    setHasChanges(true)
  }

  const updateMaxDiscount = (roleId: number, value: number) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            maxDiscount: value
          }
        }
      }
      return role
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('success')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permissions & Access Control</h2>
          <p className="text-sm text-gray-600 mt-1">Configure role-based access and approval limits</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
            hasChanges && saveStatus !== 'saving'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Success Banner */}
      {saveStatus === 'success' && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Permissions updated successfully!</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Role-Based Permissions</h3>
            <p className="text-sm text-gray-600">Configure what each role can do</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 sticky left-0 bg-white z-10">Role</th>
                {permissionCategories.map(category => (
                  <th key={category.name} colSpan={category.permissions.length} className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-l border-gray-200">
                    {category.name}
                  </th>
                ))}
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-l border-gray-200">Max Discount</th>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600 sticky left-0 bg-gray-50 z-10"></th>
                {permissionCategories.map(category =>
                  category.permissions.map(perm => (
                    <th key={perm} className="text-center py-2 px-2 text-xs font-medium text-gray-600 border-l border-gray-100">
                      {permissionLabels[perm]}
                    </th>
                  ))
                )}
                <th className="text-center py-2 px-4 text-xs font-medium text-gray-600 border-l border-gray-200">(%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 sticky left-0 bg-white z-10">
                    <div>
                      <p className="font-medium text-gray-900">{role.name}</p>
                      <p className="text-xs text-gray-500">{role.userCount} users</p>
                    </div>
                  </td>
                  {permissionCategories.map(category =>
                    category.permissions.map(perm => (
                      <td key={perm} className="py-3 px-2 text-center border-l border-gray-100">
                        <button
                          onClick={() => togglePermission(role.id, perm)}
                          className="mx-auto"
                        >
                          {role.permissions[perm as keyof typeof role.permissions] ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      </td>
                    ))
                  )}
                  <td className="py-3 px-4 text-center border-l border-gray-200">
                    <input
                      type="number"
                      value={role.permissions.maxDiscount}
                      onChange={(e) => updateMaxDiscount(role.id, parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Limits */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Approval Limits</h3>
            <p className="text-sm text-gray-600">Define quote value and discount thresholds requiring approval</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Max Quote Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Max Discount %</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Requires Approval</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Approver</th>
              </tr>
            </thead>
            <tbody>
              {approvalLimits.map((limit, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{limit.role}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">
                      {limit.quoteValue === Infinity ? 'Unlimited' : `₹${(limit.quoteValue / 100000).toFixed(1)}L`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      limit.discountPercent <= 10 ? 'bg-green-100 text-green-700' :
                      limit.discountPercent <= 20 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {limit.discountPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {limit.requiresApproval ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{limit.approver}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Visibility Rules */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Data Visibility Rules</h3>
            <p className="text-sm text-gray-600">Control what data each role can access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredRoles.map((role) => (
            <div key={role.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{role.name}</h4>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">All Quotes</span>
                  {role.permissions.viewAllQuotes ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Team Quotes</span>
                  {role.permissions.viewTeamQuotes ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cost & Margin</span>
                  {role.permissions.viewCost && role.permissions.viewMargin ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reports & Analytics</span>
                  {role.permissions.viewReports ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">Permission Changes Impact</p>
          <p className="text-sm text-blue-700 mt-1">
            Changes to permissions take effect immediately for all users in the role. Users may need to refresh their session to see updates.
          </p>
        </div>
      </div>
    </div>
  )
}
