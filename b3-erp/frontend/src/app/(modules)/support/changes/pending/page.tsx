'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, XCircle, Users, Calendar, Filter, Search, Eye, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface PendingChange {
  id: string
  ticketNumber: string
  title: string
  type: 'Standard' | 'Normal' | 'Emergency'
  category: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  requester: string
  department: string
  submittedDate: string
  implementationDate: string
  affectedSystems: number
  affectedUsers: string
  status: 'Pending Review' | 'CAB Review' | 'Awaiting Approval' | 'Under Assessment'
  reviewers: string[]
  approvals: number
  rejections: number
  daysWaiting: number
  riskLevel: 'High' | 'Medium' | 'Low'
}

export default function PendingChanges() {
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getScheduledChanges()
        const mapped: PendingChange[] = raw.map((r: any, i: number) => ({
          id: String(r.id ?? i),
          ticketNumber: r.ticketNumber ?? r.changeNumber ?? r.code ?? '',
          title: r.title ?? r.name ?? '',
          type: r.type ?? 'Normal',
          category: r.category ?? '',
          priority: r.priority ?? 'P3',
          requester: r.requester ?? r.requestedBy ?? '',
          department: r.department ?? '',
          submittedDate: r.submittedDate ?? r.createdAt ?? '',
          implementationDate: r.implementationDate ?? r.scheduledDate ?? '',
          affectedSystems: typeof r.affectedSystems === 'number'
            ? r.affectedSystems
            : Array.isArray(r.affectedSystems) ? r.affectedSystems.length : 0,
          affectedUsers: r.affectedUsers ?? '',
          status: r.status ?? 'Pending Review',
          reviewers: Array.isArray(r.reviewers) ? r.reviewers : [],
          approvals: r.approvals ?? 0,
          rejections: r.rejections ?? 0,
          daysWaiting: r.daysWaiting ?? 0,
          riskLevel: r.riskLevel ?? 'Low',
        }))
        if (!cancelled) setPendingChanges(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setPendingChanges([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Statistics
  const stats = {
    totalPending: pendingChanges.length,
    cabReview: pendingChanges.filter(c => c.status === 'CAB Review').length,
    awaitingApproval: pendingChanges.filter(c => c.status === 'Awaiting Approval').length,
    avgWaitTime: Math.round(pendingChanges.reduce((sum, c) => sum + c.daysWaiting, 0) / pendingChanges.length),
    highRisk: pendingChanges.filter(c => c.riskLevel === 'High').length,
    emergency: pendingChanges.filter(c => c.type === 'Emergency').length
  }

  const filteredChanges = pendingChanges.filter(change => {
    const matchesType = selectedType === 'All' || change.type === selectedType
    const matchesStatus = selectedStatus === 'All' || change.status === selectedStatus
    const matchesSearch = searchTerm === '' || 
      change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.requester.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700 border-red-200'
      case 'P1': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'P2': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'P3': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'bg-red-100 text-red-700'
      case 'Normal': return 'bg-blue-100 text-blue-700'
      case 'Standard': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-gray-100 text-gray-700'
      case 'CAB Review': return 'bg-purple-100 text-purple-700'
      case 'Awaiting Approval': return 'bg-blue-100 text-blue-700'
      case 'Under Assessment': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Changes</h1>
          <p className="text-gray-600 mt-1">Changes awaiting review and approval</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading pending changes…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold mt-1">{stats.totalPending}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CAB Review</p>
              <p className="text-2xl font-bold mt-1">{stats.cabReview}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Awaiting Approval</p>
              <p className="text-2xl font-bold mt-1">{stats.awaitingApproval}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold mt-1">{stats.avgWaitTime}d</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold mt-1">{stats.highRisk}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency</p>
              <p className="text-2xl font-bold mt-1">{stats.emergency}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticket number, title, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Emergency">Emergency</option>
            <option value="Normal">Normal</option>
            <option value="Standard">Standard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending Review">Pending Review</option>
            <option value="CAB Review">CAB Review</option>
            <option value="Awaiting Approval">Awaiting Approval</option>
            <option value="Under Assessment">Under Assessment</option>
          </select>
        </div>
      </div>

      {/* Changes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Ticket</th>
                <th className="text-left p-3 font-medium text-gray-600">Title</th>
                <th className="text-left p-3 font-medium text-gray-600">Type</th>
                <th className="text-left p-3 font-medium text-gray-600">Priority</th>
                <th className="text-left p-3 font-medium text-gray-600">Requester</th>
                <th className="text-left p-3 font-medium text-gray-600">Status</th>
                <th className="text-left p-3 font-medium text-gray-600">Approvals</th>
                <th className="text-left p-3 font-medium text-gray-600">Wait Time</th>
                <th className="text-left p-3 font-medium text-gray-600">Risk</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredChanges.map((change) => (
                <tr key={change.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{change.ticketNumber}</div>
                    <div className="text-xs text-gray-500">{change.category}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium max-w-xs truncate">{change.title}</div>
                    <div className="text-xs text-gray-500">
                      Impl: {new Date(change.implementationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(change.type)}`}>
                      {change.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(change.priority)}`}>
                      {change.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-sm">{change.requester}</div>
                    <div className="text-xs text-gray-500">{change.department}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                      {change.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium">{change.approvals}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        <span className="text-sm font-medium">{change.rejections}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {change.reviewers.length} reviewers
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{change.daysWaiting} days</div>
                    <div className="text-xs text-gray-500">
                      {new Date(change.submittedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getRiskColor(change.riskLevel)}`}>
                      {change.riskLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedChange(change)}
                        className="p-1 hover:bg-gray-100 rounded"
                       
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                       
                      >
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedChange.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedChange.ticketNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedChange(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTypeColor(selectedChange.type)}`}>
                    {selectedChange.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getPriorityColor(selectedChange.priority)}`}>
                    {selectedChange.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(selectedChange.status)}`}>
                    {selectedChange.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className={`font-medium mt-1 ${getRiskColor(selectedChange.riskLevel)}`}>
                    {selectedChange.riskLevel}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Affected Systems</p>
                  <p className="font-medium mt-1">{selectedChange.affectedSystems} systems</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Affected Users</p>
                  <p className="font-medium mt-1">{selectedChange.affectedUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Implementation Date</p>
                  <p className="font-medium mt-1">{new Date(selectedChange.implementationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Waiting</p>
                  <p className="font-medium mt-1">{selectedChange.daysWaiting} days</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reviewers</p>
                <div className="flex flex-wrap gap-2">
                  {selectedChange.reviewers.map((reviewer, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {reviewer}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Approve Change
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  <ThumbsDown className="h-4 w-4" />
                  Reject Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
