'use client'

import { useState, useEffect, useCallback } from 'react'
import { FinanceService } from '@/services/finance.service'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Plus,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react'
import {
  CreditHoldModal,
  ReleaseCreditHoldModal,
  CreditReviewModal,
  AgingAlertSettingsModal,
  CreditApprovalRequestModal,
  ApproveRejectCreditModal
} from '@/components/finance/ar/CreditManagementModals'

interface CreditCustomer {
  id: string
  customerCode: string
  customerName: string
  creditLimit: number
  creditUsed: number
  creditAvailable: number
  utilizationPercent: number
  paymentTerms: string
  averagePaymentDays: number
  overdueAmount: number
  status: 'good' | 'warning' | 'critical' | 'blocked'
  creditScore: number
  lastReviewDate: string
  nextReviewDate: string
  riskRating: 'low' | 'medium' | 'high' | 'very_high'
  outstandingInvoices: number
  totalSales: number
}

export default function CreditManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Modal states
  const [isCreditReviewModalOpen, setIsCreditReviewModalOpen] = useState(false)
  const [isCreditHoldModalOpen, setIsCreditHoldModalOpen] = useState(false)
  const [isReleaseCreditHoldModalOpen, setIsReleaseCreditHoldModalOpen] = useState(false)
  const [isAgingAlertModalOpen, setIsAgingAlertModalOpen] = useState(false)
  const [isCreditApprovalModalOpen, setIsCreditApprovalModalOpen] = useState(false)
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null)

  const [customers, setCustomers] = useState<CreditCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Map raw credit-limit records from the API into the CreditCustomer shape
  // the JSX reads. Computes availableCredit + utilization % here.
  const mapCreditLimit = (r: any): CreditCustomer => {
    const creditLimit = Number(r?.creditLimit) || 0
    const creditUsed = Number(r?.creditUsed) || 0
    const creditAvailable = creditLimit - creditUsed
    const utilizationPercent = creditLimit > 0
      ? Math.round((creditUsed / creditLimit) * 100)
      : 0

    // Derive display status: an explicit hold/blocked wins, else infer from utilization.
    const onHold = r?.onHold === true || String(r?.status).toLowerCase() === 'blocked'
    let status: CreditCustomer['status']
    if (onHold) status = 'blocked'
    else if (utilizationPercent > 100) status = 'critical'
    else if (utilizationPercent > 90) status = 'warning'
    else status = 'good'

    // Normalise risk category to the JSX's riskRating union.
    const riskRaw = String(r?.riskCategory ?? '').toLowerCase().replace(/\s+/g, '_')
    const riskRating: CreditCustomer['riskRating'] =
      riskRaw === 'low' || riskRaw === 'medium' || riskRaw === 'high' || riskRaw === 'very_high'
        ? (riskRaw as CreditCustomer['riskRating'])
        : 'medium'

    // Map credit rating (e.g. 'A'/'B'/numeric) to a 0-100 score for display.
    const ratingRaw = r?.creditRating
    let creditScore = 0
    if (typeof ratingRaw === 'number') {
      creditScore = ratingRaw
    } else if (typeof ratingRaw === 'string') {
      const letterMap: Record<string, number> = { AAA: 95, AA: 90, A: 85, BBB: 75, BB: 65, B: 55, CCC: 45, CC: 35, C: 25, D: 15 }
      creditScore = letterMap[ratingRaw.toUpperCase()] ?? (Number(ratingRaw) || 0)
    }

    return {
      id: String(r?.id ?? r?.customerId ?? ''),
      customerCode: String(r?.customerId ?? r?.id ?? ''),
      customerName: String(r?.customerName ?? ''),
      creditLimit,
      creditUsed,
      creditAvailable,
      utilizationPercent,
      paymentTerms: String(r?.paymentTerms ?? '-'),
      averagePaymentDays: Number(r?.averagePaymentDays) || 0,
      overdueAmount: Number(r?.overdueAmount) || 0,
      status,
      creditScore,
      lastReviewDate: r?.lastReviewDate ?? r?.reviewDate ?? '',
      nextReviewDate: r?.reviewDate ?? r?.nextReviewDate ?? '',
      riskRating,
      outstandingInvoices: Number(r?.outstandingInvoices) || 0,
      totalSales: Number(r?.totalSales) || 0,
    }
  }

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await FinanceService.getCreditLimits()
      setCustomers((Array.isArray(data) ? data : []).map(mapCreditLimit))
    } catch (e: any) {
      setError(e?.message || 'Failed to load credit limits')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleDeleteCustomer = async (id: string) => {
    try {
      await FinanceService.deleteCreditLimit(id)
      await loadCustomers()
    } catch (e: any) {
      setError(e?.message || 'Failed to delete credit limit')
    }
  }

  const handleHoldCustomer = async (id: string) => {
    try {
      await FinanceService.updateCreditLimit(id, { onHold: true, status: 'blocked' })
      await loadCustomers()
    } catch (e: any) {
      setError(e?.message || 'Failed to place credit hold')
    }
  }

  const handleReleaseCustomer = async (id: string) => {
    try {
      await FinanceService.updateCreditLimit(id, { onHold: false, status: 'active' })
      await loadCustomers()
    } catch (e: any) {
      setError(e?.message || 'Failed to release credit hold')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    const matchesRisk = riskFilter === 'all' || customer.riskRating === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'critical':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'blocked':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'very_high':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Calculate totals
  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0)
  const totalCreditUsed = customers.reduce((sum, c) => sum + c.creditUsed, 0)
  const totalOverdue = customers.reduce((sum, c) => sum + c.overdueAmount, 0)
  const customersAtRisk = customers.filter(c => c.status === 'critical' || c.status === 'blocked').length

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 py-2">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Management</h1>
            <p className="text-gray-600 mt-1">Monitor customer credit limits, utilization, and payment behavior</p>
          </div>
          <button
            onClick={() => setIsCreditReviewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            New Credit Review
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Credit Limit</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalCreditLimit)}</p>
                <p className="text-xs text-blue-700 mt-1">All customers</p>
              </div>
              <CreditCard className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Credit Utilized</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(totalCreditUsed)}</p>
                <p className="text-xs text-purple-700 mt-1">{((totalCreditUsed/totalCreditLimit)*100).toFixed(1)}% of limit</p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Overdue</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(totalOverdue)}</p>
                <p className="text-xs text-orange-700 mt-1">Past due amount</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">At Risk Customers</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{customersAtRisk}</p>
                <p className="text-xs text-red-700 mt-1">Require attention</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="good">Good</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="very_high">Very High Risk</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Customer Credit List */}
        <div className="space-y-2">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.customerName}</h3>
                      <p className="text-sm text-gray-600">{customer.customerCode}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                          {getStatusIcon(customer.status)}
                          {customer.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.riskRating)}`}>
                          {customer.riskRating.replace('_', ' ').toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Credit Score</p>
                    <p className={`text-3xl font-bold ${
                      customer.creditScore >= 80 ? 'text-green-600' :
                      customer.creditScore >= 60 ? 'text-yellow-600' :
                      customer.creditScore >= 40 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>{customer.creditScore}</p>
                  </div>
                </div>

                {/* Credit Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Credit Limits</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credit Limit:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(customer.creditLimit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credit Used:</span>
                        <span className="font-semibold text-purple-600">{formatCurrency(customer.creditUsed)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className={`font-semibold ${customer.creditAvailable < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {customer.creditAvailable < 0 && '('}{formatCurrency(customer.creditAvailable)}{customer.creditAvailable < 0 && ')'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Payment Behavior</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-semibold text-gray-900">{customer.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Payment Days:</span>
                        <span className="font-semibold text-gray-900">{customer.averagePaymentDays} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overdue Amount:</span>
                        <span className={`font-semibold ${customer.overdueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(customer.overdueAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Account Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Outstanding Invoices:</span>
                        <span className="font-semibold text-gray-900">{customer.outstandingInvoices}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Sales YTD:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(customer.totalSales)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Next Review:</span>
                        <span className="font-semibold text-gray-900">{new Date(customer.nextReviewDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Utilization Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Credit Utilization</span>
                    <span className={`font-semibold ${
                      customer.utilizationPercent > 100 ? 'text-red-600' :
                      customer.utilizationPercent > 90 ? 'text-orange-600' :
                      customer.utilizationPercent > 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{customer.utilizationPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        customer.utilizationPercent > 100 ? 'bg-red-600' :
                        customer.utilizationPercent > 90 ? 'bg-orange-600' :
                        customer.utilizationPercent > 75 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(customer.utilizationPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setIsCreditReviewModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setIsCreditApprovalModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Adjust Limit
                  </button>
                  {customer.status === 'blocked' ? (
                    <button
                      onClick={() => handleReleaseCustomer(customer.id)}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Release Hold
                    </button>
                  ) : customer.status === 'critical' ? (
                    <button
                      onClick={() => handleHoldCustomer(customer.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Credit Hold
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setIsCreditReviewModalOpen(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Review Credit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading credit limits…</h3>
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreditReviewModal
        isOpen={isCreditReviewModalOpen}
        onClose={() => { setIsCreditReviewModalOpen(false); loadCustomers() }}
        customer={selectedCustomer}
      />

      <CreditHoldModal
        isOpen={isCreditHoldModalOpen}
        onClose={() => { setIsCreditHoldModalOpen(false); loadCustomers() }}
        customer={selectedCustomer}
      />

      <ReleaseCreditHoldModal
        isOpen={isReleaseCreditHoldModalOpen}
        onClose={() => { setIsReleaseCreditHoldModalOpen(false); loadCustomers() }}
        customer={selectedCustomer}
      />

      <AgingAlertSettingsModal
        isOpen={isAgingAlertModalOpen}
        onClose={() => setIsAgingAlertModalOpen(false)}
      />

      <CreditApprovalRequestModal
        isOpen={isCreditApprovalModalOpen}
        onClose={() => { setIsCreditApprovalModalOpen(false); loadCustomers() }}
        customer={selectedCustomer}
      />

      <ApproveRejectCreditModal
        isOpen={isApproveRejectModalOpen}
        onClose={() => setIsApproveRejectModalOpen(false)}
        request={null}
      />
    </div>
  )
}
