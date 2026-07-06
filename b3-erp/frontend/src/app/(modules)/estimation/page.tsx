'use client'

import { useState, useEffect } from 'react'
import { costEstimateService, CostEstimate } from '@/services/estimation-cost-estimate.service'
import {
  Calculator,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Users,
  ArrowUpRight,
  BarChart3
} from 'lucide-react'

interface EstimationStats {
  totalEstimates: number
  pendingEstimates: number
  approvedEstimates: number
  convertedToOrders: number
  totalEstimatedValue: number
  avgEstimateValue: number
  conversionRate: number
  avgProcessingTime: number
  estimatesThisMonth: number
  winRate: number
}

interface Estimate {
  id: string
  customer: string
  project: string
  estimatedValue: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'converted'
  createdDate: string
  validUntil: string
  estimator: string
  priority: 'high' | 'medium' | 'low'
  items: number
}

interface RecentActivity {
  id: string
  estimateId: string
  action: string
  user: string
  timestamp: string
  status: string
}

const STATUS_MAP: Record<string, Estimate['status']> = {
  Draft: 'draft',
  'Pending Approval': 'under_review',
  Approved: 'approved',
  Rejected: 'rejected',
  'Converted to Order': 'converted',
}

export default function EstimationDashboard() {
  const [stats, setStats] = useState<EstimationStats>({
    totalEstimates: 0,
    pendingEstimates: 0,
    approvedEstimates: 0,
    convertedToOrders: 0,
    totalEstimatedValue: 0,
    avgEstimateValue: 0,
    conversionRate: 0,
    avgProcessingTime: 0,
    estimatesThisMonth: 0,
    winRate: 0,
  })

  const [recentEstimates, setRecentEstimates] = useState<Estimate[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const raw = await costEstimateService.findAll('default-company-id')
        const list: CostEstimate[] = Array.isArray(raw) ? raw : []
        if (!mounted) return

        const total = list.length
        const pending = list.filter((e) => e.status === 'Pending Approval').length
        const approved = list.filter((e) => e.status === 'Approved').length
        const converted = list.filter((e) => e.status === 'Converted to Order').length
        const totalValue = list.reduce((s, e) => s + (Number(e.totalCost) || 0), 0)
        const now = new Date()
        const thisMonth = list.filter((e) => {
          const d = e.estimateDate || e.createdAt
          if (!d) return false
          const dt = new Date(d)
          return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
        }).length

        setStats({
          totalEstimates: total,
          pendingEstimates: pending,
          approvedEstimates: approved,
          convertedToOrders: converted,
          totalEstimatedValue: totalValue,
          avgEstimateValue: total > 0 ? Math.round(totalValue / total) : 0,
          conversionRate: total > 0 ? Number(((converted / total) * 100).toFixed(1)) : 0,
          avgProcessingTime: 0,
          estimatesThisMonth: thisMonth,
          winRate:
            approved + converted > 0
              ? Number((((approved + converted) / total) * 100).toFixed(1))
              : 0,
        })

        const recent = [...list]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
          )
          .slice(0, 6)

        setRecentEstimates(
          recent.map((e) => ({
            id: e.estimateNumber || e.id,
            customer: e.customerName || '—',
            project: e.title || '—',
            estimatedValue: Number(e.totalCost) || 0,
            status: STATUS_MAP[e.status] || 'draft',
            createdDate: (e.estimateDate || e.createdAt || '').slice(0, 10),
            validUntil: (e.validUntil || '').slice(0, 10),
            estimator: e.submittedBy || '—',
            priority: 'medium',
            items: 0,
          })),
        )

        setRecentActivities(
          recent.slice(0, 4).map((e) => ({
            id: `ACT-${e.id}`,
            estimateId: e.estimateNumber || e.id,
            action: `Estimate ${e.status.toLowerCase()}`,
            user: e.submittedBy || e.approvedBy || 'System',
            timestamp: (e.updatedAt || e.createdAt || '').replace('T', ' ').slice(0, 16),
            status: STATUS_MAP[e.status] || 'draft',
          })),
        )
      } catch {
        if (!mounted) return
        setRecentEstimates([])
        setRecentActivities([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'under_review':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'converted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimation & Costing</h1>
            <p className="text-gray-600 mt-1">Project estimation, cost calculation, and quotation management</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md">
            <Calculator className="h-5 w-5" />
            New Estimate
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Pending Estimates</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.pendingEstimates}</p>
                <p className="text-xs text-blue-700 mt-1">{stats.totalEstimates} total</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Est. Value</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{(stats.totalEstimatedValue / 10000000).toFixed(1)}Cr</p>
                <p className="text-xs text-green-700 mt-1">Pipeline value</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.conversionRate}%</p>
                <p className="text-xs text-purple-700 mt-1">{stats.convertedToOrders} converted</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Win Rate</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.winRate}%</p>
                <p className="text-xs text-orange-700 mt-1">Approved estimates</p>
              </div>
              <CheckCircle className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Recent Estimates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Estimates</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {recentEstimates.map((estimate) => (
                  <div key={estimate.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{estimate.id}</p>
                        <p className="text-sm text-gray-600 mt-1">{estimate.customer}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(estimate.status)}`}>
                        {estimate.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-700">{estimate.project}</p>
                      <p className="text-xs text-gray-500 mt-1">{estimate.items} items</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Estimated Value</p>
                        <p className="font-semibold text-gray-900">₹{(estimate.estimatedValue / 10000000).toFixed(2)}Cr</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getPriorityColor(estimate.priority)}`}>
                          {estimate.priority.toUpperCase()}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">Valid: {estimate.validUntil}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.estimateId}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Estimate Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{(stats.avgEstimateValue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgProcessingTime} days</p>
                <p className="text-xs text-green-600 mt-1">-0.5 days improvement</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.estimatesThisMonth}</p>
                <p className="text-xs text-green-600 mt-1">+18% from last month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
