'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { HrPayrollService } from '@/services/hr-payroll.service'
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Calculator,
  Send,
  Download
} from 'lucide-react'

interface BonusProcessing {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  bonusType: 'statutory' | 'performance' | 'festive' | 'retention' | 'adhoc'
  eligibilityPeriod: string
  workingDays: number
  totalDays: number
  basicSalary: number
  eligibleSalary: number
  bonusPercentage: number
  bonusAmount: number
  tax: number
  netBonus: number
  calculatedDate: string
  status: 'calculated' | 'approved' | 'on-hold' | 'processed' | 'paid'
  approvedBy?: string
  approvedDate?: string
  paymentDate?: string
  remarks?: string
  performanceRating?: 'outstanding' | 'excellent' | 'good' | 'average'
}

export default function BonusProcessingPage() {
  const [bonusRecords, setBonusRecords] = useState<BonusProcessing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await HrPayrollService.getBonusRecords('processing')
        const mapped: BonusProcessing[] = (Array.isArray(raw) ? raw : []).map((r: any) => {
          const d = r.details ?? {}
          return {
            id: r.id ?? '',
            employeeId: r.employeeId ?? '',
            employeeName: r.employeeName ?? '',
            designation: r.designation ?? d.designation ?? '',
            department: r.department ?? d.department ?? '',
            bonusType: (d.bonusType ?? 'performance') as BonusProcessing['bonusType'],
            eligibilityPeriod: d.eligibilityPeriod ?? r.financialYear ?? '',
            workingDays: Number(d.workingDays ?? 0),
            totalDays: Number(d.totalDays ?? 0),
            basicSalary: Number(d.basicSalary ?? 0),
            eligibleSalary: Number(d.eligibleSalary ?? 0),
            bonusPercentage: Number(d.bonusPercentage ?? 0),
            bonusAmount: Number(r.bonusAmount ?? d.bonusAmount ?? 0),
            tax: Number(d.tax ?? 0),
            netBonus: Number(d.netBonus ?? r.bonusAmount ?? 0),
            calculatedDate: d.calculatedDate ?? '',
            status: (r.status ?? 'calculated') as BonusProcessing['status'],
            approvedBy: d.approvedBy ?? undefined,
            approvedDate: d.approvedDate ?? undefined,
            paymentDate: d.paymentDate ?? undefined,
            remarks: d.remarks ?? undefined,
            performanceRating: d.performanceRating ?? undefined,
          }
        })
        if (!cancelled) setBonusRecords(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load bonus records')
          setBonusRecords([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  const filteredRecords = useMemo(() => {
    return bonusRecords.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.designation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesType = typeFilter === 'all' || record.bonusType === typeFilter
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter

      return matchesSearch && matchesStatus && matchesType && matchesDepartment
    })
  }, [bonusRecords, searchTerm, statusFilter, typeFilter, departmentFilter])

  const stats = useMemo(() => {
    const total = bonusRecords.length
    const calculated = bonusRecords.filter(r => r.status === 'calculated').length
    const approved = bonusRecords.filter(r => r.status === 'approved').length
    const processed = bonusRecords.filter(r => r.status === 'processed').length
    const paid = bonusRecords.filter(r => r.status === 'paid').length
    const totalAmount = bonusRecords.reduce((sum, r) => sum + r.bonusAmount, 0)
    const totalTax = bonusRecords.reduce((sum, r) => sum + r.tax, 0)

    return { total, calculated, approved, processed, paid, totalAmount, totalTax }
  }, [bonusRecords])

  const departments = useMemo(() => {
    return Array.from(new Set(bonusRecords.map(r => r.department))).sort()
  }, [bonusRecords])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculated': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-purple-100 text-purple-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'statutory': return 'bg-blue-100 text-blue-800'
      case 'performance': return 'bg-green-100 text-green-800'
      case 'festive': return 'bg-orange-100 text-orange-800'
      case 'retention': return 'bg-purple-100 text-purple-800'
      case 'adhoc': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = (recordId: string) => {
    setBonusRecords(prev => prev.map(r =>
      r.id === recordId
        ? {
          ...r,
          status: 'approved',
          approvedBy: 'HR Manager',
          approvedDate: new Date().toISOString().split('T')[0]
        }
        : r
    ))
  }

  const handleProcess = (recordId: string) => {
    setBonusRecords(prev => prev.map(r =>
      r.id === recordId ? { ...r, status: 'processed' } : r
    ))
  }

  const handlePay = (recordId: string) => {
    setBonusRecords(prev => prev.map(r =>
      r.id === recordId
        ? {
          ...r,
          status: 'paid',
          paymentDate: new Date().toISOString().split('T')[0]
        }
        : r
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
      return <span>{date ? date : fallback}</span>
    }

    return <span>{date ? formatDate(date) : fallback}</span>
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonus Processing</h1>
        <p className="text-gray-600">Calculate, approve, and process employee bonuses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Calculated</p>
              <p className="text-2xl font-bold text-purple-900">{stats.calculated}</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">Processed</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.processed}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-900">{stats.paid}</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-yellow-900">₹{(stats.totalAmount / 1000).toFixed(0)}K</p>
            </div>
            <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
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
              placeholder="Search by name, ID, record number..."
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
              <option value="calculated">Calculated</option>
              <option value="approved">Approved</option>
              <option value="on-hold">On Hold</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
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
              <option value="festive">Festive</option>
              <option value="retention">Retention</option>
              <option value="adhoc">Ad-hoc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bonus Records List */}
      <div className="space-y-2">
        {filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{record.employeeName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.bonusType)}`}>
                      {record.bonusType.charAt(0).toUpperCase() + record.bonusType.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {record.employeeId}
                    </span>
                    <span>{record.designation}</span>
                    <span>{record.department}</span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {record.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.status === 'calculated' && (
                    <button
                      onClick={() => handleApprove(record.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {record.status === 'approved' && (
                    <button
                      onClick={() => handleProcess(record.id)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm"
                    >
                      <Clock className="h-4 w-4" />
                      Process
                    </button>
                  )}
                  {record.status === 'processed' && (
                    <button
                      onClick={() => handlePay(record.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <Send className="h-4 w-4" />
                      Mark Paid
                    </button>
                  )}
                  <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {/* Eligibility Details */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Eligibility
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-600">Period</p>
                      <p className="text-sm font-semibold text-blue-900">{record.eligibilityPeriod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Working Days</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {record.workingDays} / {record.totalDays}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Basic Salary</p>
                      <p className="text-sm font-semibold text-blue-900">
                        ₹{record.basicSalary.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3 flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    Calculation
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-600">Eligible Salary</p>
                      <p className="text-sm font-semibold text-purple-900">
                        ₹{record.eligibleSalary.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600">Bonus %</p>
                      <p className="text-sm font-semibold text-purple-900">{record.bonusPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600">Gross Bonus</p>
                      <p className="text-sm font-semibold text-purple-900">
                        ₹{record.bonusAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tax & Net Amount */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Payment
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-green-600">Gross Amount</p>
                      <p className="text-sm font-semibold text-green-900">
                        ₹{record.bonusAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Tax (10%)</p>
                      <p className="text-sm font-semibold text-red-700">
                        -₹{record.tax.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Net Bonus</p>
                      <p className="text-sm font-semibold text-green-900">
                        ₹{record.netBonus.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval Info */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-xs font-semibold text-yellow-900 mb-3 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approval
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-yellow-600">Calculated Date</p>
                      <p className="text-sm font-semibold text-yellow-900">
                        <DateDisplay date={record.calculatedDate} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600">Approved By</p>
                      <p className="text-sm font-semibold text-yellow-900">
                        {record.approvedBy || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600">Approved Date</p>
                      <p className="text-sm font-semibold text-yellow-900">
                        <DateDisplay date={record.approvedDate} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
                  <h4 className="text-xs font-semibold text-indigo-900 mb-3 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-indigo-600">Payment Date</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        <DateDisplay date={record.paymentDate} fallback="Pending" />
                      </p>
                    </div>
                    {record.performanceRating && (
                      <div>
                        <p className="text-xs text-indigo-600">Performance</p>
                        <p className="text-sm font-semibold text-indigo-900 capitalize">
                          {record.performanceRating}
                        </p>
                      </div>
                    )}
                    {record.remarks && (
                      <div>
                        <p className="text-xs text-indigo-600">Remarks</p>
                        <p className="text-sm font-semibold text-indigo-900">{record.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Guidelines */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-3 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Bonus Processing Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Statutory Bonus (Payment of Bonus Act)</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Minimum: 8.33% of annual wages (₹7,000 salary ceiling)</li>
              <li>Maximum: 20% of annual wages</li>
              <li>Eligibility: 30 working days in accounting year</li>
              <li>Payment: Within 8 months of year-end</li>
              <li>Proportionate for partial service</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Performance Bonus</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Outstanding (90%+): 15-20% of quarterly basic</li>
              <li>Excellent (80-89%): 10-15% of quarterly basic</li>
              <li>Good (70-79%): 5-10% of quarterly basic</li>
              <li>Average (60-69%): 2-5% of quarterly basic</li>
              <li>Paid quarterly or annually based on KPIs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Festive Bonus</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Typically 1 month basic salary or fixed amount</li>
              <li>Paid during Diwali, Dussehra, or year-end</li>
              <li>Pro-rated based on service period</li>
              <li>Taxable as salary income</li>
              <li>May vary by company policy</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Processing Workflow</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Calculate bonus as per scheme rules</li>
              <li>Deduct applicable tax (10% TDS if &gt; ₹50,000)</li>
              <li>Obtain management approval</li>
              <li>Process payment via payroll or separate</li>
              <li>Maintain records for 3 years (statutory)</li>
              <li>Issue bonus slips to employees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
