'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { HrPayrollService } from '@/services/hr-payroll.service'
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  FileText,
  Award
} from 'lucide-react'

interface BonusScheme {
  id: string
  schemeName: string
  schemeType: 'statutory' | 'performance' | 'festive' | 'retention' | 'adhoc' | 'sales' | 'production'
  applicableTo: 'all' | 'department' | 'designation' | 'individual'
  targetDepartments?: string[]
  targetDesignations?: string[]
  eligibilityCriteria: string
  calculationMethod: string
  bonusPercentage?: number
  fixedAmount?: number
  minThreshold?: number
  maxCap?: number
  paymentFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annual' | 'one-time'
  status: 'active' | 'inactive' | 'draft'
  effectiveFrom: string
  effectiveTo?: string
  createdBy: string
  createdDate: string
  lastModified: string
  description: string
  termsAndConditions: string[]
}


export default function BonusSchemesPage() {
  const [schemes, setSchemes] = useState<BonusScheme[]>(mockSchemes)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchesSearch =
        scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || scheme.status === statusFilter
      const matchesType = typeFilter === 'all' || scheme.schemeType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [schemes, searchTerm, statusFilter, typeFilter])

  const stats = useMemo(() => {
    const total = schemes.length
    const active = schemes.filter(s => s.status === 'active').length
    const inactive = schemes.filter(s => s.status === 'inactive').length
    const draft = schemes.filter(s => s.status === 'draft').length

    return { total, active, inactive, draft }
  }, [schemes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'statutory': return 'bg-blue-100 text-blue-800'
      case 'performance': return 'bg-green-100 text-green-800'
      case 'festive': return 'bg-orange-100 text-orange-800'
      case 'retention': return 'bg-purple-100 text-purple-800'
      case 'sales': return 'bg-yellow-100 text-yellow-800'
      case 'production': return 'bg-indigo-100 text-indigo-800'
      case 'adhoc': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleActivate = (schemeId: string) => {
    setSchemes(prev => prev.map(s =>
      s.id === schemeId ? { ...s, status: 'active' as const, lastModified: new Date().toISOString().split('T')[0] } : s
    ))
  }

  const handleDeactivate = (schemeId: string) => {
    setSchemes(prev => prev.map(s =>
      s.id === schemeId ? { ...s, status: 'inactive' as const, lastModified: new Date().toISOString().split('T')[0] } : s
    ))
  }

  // Stable date formatter to prevent hydration mismatch
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Wrapper for rendering dates safely
  const DateDisplay = ({ date, fallback = '-' }: { date?: string, fallback?: string }) => {
    const [mounted, setMounted] = useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      // Render consistent server-side placeholder or raw date if deterministic
      return <span>{date ? date : fallback}</span>
    }

    return <span>{date ? formatDate(date) : fallback}</span>
  }

  return (
    <div className="p-6 w-full">

      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonus Schemes</h1>
        <p className="text-gray-600">Manage bonus and incentive schemes for employees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Schemes</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Inactive</p>
              <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
            </div>
            <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <div className="h-12 w-12 bg-gray-500 rounded-lg flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-3 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="statutory">Statutory</option>
              <option value="performance">Performance</option>
              <option value="sales">Sales</option>
              <option value="production">Production</option>
              <option value="festive">Festive</option>
              <option value="retention">Retention</option>
              <option value="adhoc">Ad-hoc</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              New Scheme
            </button>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-2">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{scheme.schemeName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                      {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(scheme.schemeType)}`}>
                      {scheme.schemeType.charAt(0).toUpperCase() + scheme.schemeType.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {scheme.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {scheme.applicableTo === 'all' ? 'All Employees' :
                        scheme.applicableTo === 'department' ? `Depts: ${scheme.targetDepartments?.join(', ')}` :
                          scheme.applicableTo === 'designation' ? `Desigs: ${scheme.targetDesignations?.join(', ')}` :
                            'Individual'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {scheme.paymentFrequency.charAt(0).toUpperCase() + scheme.paymentFrequency.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm">
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  {scheme.status === 'active' ? (
                    <button
                      onClick={() => handleDeactivate(scheme.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(scheme.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Activate
                    </button>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                {/* Eligibility */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Eligibility
                  </h4>
                  <p className="text-sm text-blue-900">{scheme.eligibilityCriteria}</p>
                </div>

                {/* Calculation */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Calculation
                  </h4>
                  <p className="text-sm text-purple-900">{scheme.calculationMethod}</p>
                  {scheme.bonusPercentage && (
                    <p className="text-xs text-purple-600 mt-2">Percentage: {scheme.bonusPercentage}%</p>
                  )}
                  {scheme.fixedAmount && (
                    <p className="text-xs text-purple-600 mt-2">Fixed: ₹{scheme.fixedAmount.toLocaleString('en-IN')}</p>
                  )}
                </div>

                {/* Limits */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Limits
                  </h4>
                  <div className="space-y-1">
                    {scheme.minThreshold && (
                      <p className="text-sm text-green-900">Min: {scheme.minThreshold}%</p>
                    )}
                    {scheme.maxCap && (
                      <p className="text-sm text-green-900">Max: ₹{scheme.maxCap.toLocaleString('en-IN')}</p>
                    )}
                    {!scheme.minThreshold && !scheme.maxCap && (
                      <p className="text-sm text-green-600">No limits set</p>
                    )}
                  </div>
                </div>

                {/* Validity */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-xs font-semibold text-yellow-900 mb-3 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Validity
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm text-yellow-900">
                      From: <DateDisplay date={scheme.effectiveFrom} />
                    </p>
                    <p className="text-sm text-yellow-900">
                      To: <DateDisplay date={scheme.effectiveTo} fallback="Ongoing" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Terms & Conditions
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {scheme.termsAndConditions.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>

              {/* Meta Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Created by {scheme.createdBy} on <DateDisplay date={scheme.createdDate} />
                </div>
                <div>
                  Last modified: <DateDisplay date={scheme.lastModified} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-3 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          Bonus Scheme Management Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Scheme Types</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Statutory: Legally mandated bonuses (Payment of Bonus Act)</li>
              <li>Performance: Linked to KPI achievement and ratings</li>
              <li>Sales: Revenue/target-based incentives for sales teams</li>
              <li>Production: Efficiency and quality-based rewards</li>
              <li>Festive: Seasonal bonuses (Diwali, year-end, etc.)</li>
              <li>Retention: Long-service rewards (3/5/10 years)</li>
              <li>Ad-hoc: Special one-time incentives</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Calculation Methods</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Percentage of salary: Fixed % of basic/gross</li>
              <li>Fixed amount: Flat amount per eligible employee</li>
              <li>Slab-based: Different rates for achievement levels</li>
              <li>Pro-rated: Adjusted for partial service period</li>
              <li>Team-based: Pool distributed among team members</li>
              <li>Individual: Based on personal performance</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Applicability Options</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>All Employees: Company-wide schemes</li>
              <li>Department: Specific departments (Sales, Production)</li>
              <li>Designation: Role-based (Managers, Executives)</li>
              <li>Individual: Case-by-case basis</li>
              <li>Conditional: Based on eligibility criteria</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Clearly define eligibility and calculation methods</li>
              <li>Set realistic targets and thresholds</li>
              <li>Communicate terms transparently to employees</li>
              <li>Review schemes annually for effectiveness</li>
              <li>Ensure compliance with labor laws</li>
              <li>Budget for bonus liabilities in advance</li>
              <li>Document all approvals and modifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
