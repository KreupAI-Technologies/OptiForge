'use client'

import { useState, useEffect } from 'react'
import {
  Wrench,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Star,
  ShieldCheck,
  Zap,
  Book,
  Layers,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { AfterSalesPagesService } from '@/services/after-sales-pages.service'

interface ServiceStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  customerSatisfaction: number
  activeServiceCalls: number
  warrantyClaimsThisMonth: number
  technicianUtilization: number
  pendingParts: number
  scheduledVisits: number
}

interface ServiceTicket {
  id: string
  customer: string
  product: string
  issue: string
  status: 'open' | 'in_progress' | 'awaiting_parts' | 'resolved' | 'closed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignedTo: string
  createdDate: string
  estimatedResolution: string
  satisfaction: number | null
  slaStatus: 'on_track' | 'breached' | 'at_risk'
  responseDeadline: string
  resolutionDeadline: string
}

const EMPTY_STATS: ServiceStats = {
  totalTickets: 0,
  openTickets: 0,
  resolvedTickets: 0,
  avgResolutionTime: 0,
  customerSatisfaction: 0,
  activeServiceCalls: 0,
  warrantyClaimsThisMonth: 0,
  technicianUtilization: 0,
  pendingParts: 0,
  scheduledVisits: 0
}

export default function AfterSalesServiceDashboard() {
  const [stats, setStats] = useState<ServiceStats>(EMPTY_STATS)
  const [recentTickets, setRecentTickets] = useState<ServiceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    AfterSalesPagesService.overview()
      .then((data) => {
        if (cancelled) return
        setStats({ ...EMPTY_STATS, ...(data?.stats ?? {}) })
        setRecentTickets(
          Array.isArray(data?.recentTickets)
            ? (data.recentTickets as unknown as ServiceTicket[])
            : []
        )
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load overview')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'awaiting_parts':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">After-Sales Service</h1>
            <p className="text-gray-600 mt-1">Service tickets, warranty management, and customer support</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/after-sales-service/knowledge"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all shadow-sm"
            >
              <Book className="h-5 w-5" />
              Knowledge Base
            </Link>
            <Link
              href="/after-sales-service/parts"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all shadow-sm"
            >
              <Layers className="h-5 w-5" />
              Spare Parts
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all shadow-md">
              <Wrench className="h-5 w-5" />
              New Service Ticket
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Open Tickets</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.openTickets}</p>
                <p className="text-xs text-blue-700 mt-1">{stats.totalTickets} total</p>
              </div>
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.customerSatisfaction}/5</p>
                <p className="text-xs text-green-700 mt-1">{stats.resolvedTickets} resolved</p>
              </div>
              <Star className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Service Calls</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.activeServiceCalls}</p>
                <p className="text-xs text-purple-700 mt-1">{stats.scheduledVisits} scheduled</p>
              </div>
              <Phone className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.avgResolutionTime}h</p>
                <p className="text-xs text-orange-700 mt-1">{stats.technicianUtilization}% utilization</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Service Tickets</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading service tickets...
              </div>
            ) : !error && recentTickets.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No recent service tickets.
              </div>
            ) : (
            <div className="space-y-2">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{ticket.id}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{ticket.customer}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">{ticket.product}</p>
                    <p className="text-sm text-gray-600 mt-1">{ticket.issue}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-50 mt-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">Assigned: {ticket.assignedTo}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.slaStatus === 'on_track' ? 'bg-green-50 text-green-700' :
                          ticket.slaStatus === 'at_risk' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                        <Zap className="h-3 w-3" />
                        SLA: {ticket.slaStatus.replace('_', ' ')}
                      </div>
                    </div>
                    <span className="text-gray-600 text-xs font-medium">ETA: {ticket.estimatedResolution}</span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Warranty Claims</h3>
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.warrantyClaimsThisMonth}</p>
            <p className="text-sm text-gray-600 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Pending Parts</h3>
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingParts}</p>
            <p className="text-sm text-gray-600 mt-1">Awaiting delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
