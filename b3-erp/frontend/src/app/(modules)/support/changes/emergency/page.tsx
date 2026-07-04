'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle, XCircle, Play, FileText, Users, Calendar, Eye, MessageSquare, Filter, Search, AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface EmergencyChange {
  id: string
  ticketNumber: string
  title: string
  severity: 'Critical' | 'High' | 'Urgent'
  category: string
  status: 'In Progress' | 'Completed' | 'Failed' | 'Rolled Back' | 'Pending Start'
  requester: string
  implementer: string
  reportedDate: string
  startedDate: string
  completedDate: string
  duration: string
  businessImpact: string
  affectedSystems: string[]
  affectedUsers: string
  rootCause: string
  resolution: string
  downtime: boolean
  actualDowntime: string
  approvedBy: string
  approvalMethod: 'Verbal' | 'Email' | 'Emergency CAB'
  postImplementationReview: boolean
  rollbackExecuted: boolean
}

export default function EmergencyChanges() {
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChange, setSelectedChange] = useState<EmergencyChange | null>(null)
  const [emergencyChanges, setEmergencyChanges] = useState<EmergencyChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getScheduledChanges()
        const mapped: EmergencyChange[] = raw.map((r: any, i: number) => ({
          id: String(r.id ?? i),
          ticketNumber: r.ticketNumber ?? r.changeNumber ?? r.code ?? '',
          title: r.title ?? r.name ?? '',
          severity: r.severity ?? 'Critical',
          category: r.category ?? '',
          status: r.status ?? 'Pending Start',
          requester: r.requester ?? r.requestedBy ?? '',
          implementer: r.implementer ?? r.assignedTo ?? '',
          reportedDate: r.reportedDate ?? r.createdAt ?? '',
          startedDate: r.startedDate ?? '',
          completedDate: r.completedDate ?? '',
          duration: r.duration ?? '',
          businessImpact: r.businessImpact ?? '',
          affectedSystems: Array.isArray(r.affectedSystems) ? r.affectedSystems : [],
          affectedUsers: r.affectedUsers ?? '',
          rootCause: r.rootCause ?? '',
          resolution: r.resolution ?? '',
          downtime: r.downtime ?? false,
          actualDowntime: r.actualDowntime ?? 'N/A',
          approvedBy: r.approvedBy ?? '',
          approvalMethod: r.approvalMethod ?? 'Verbal',
          postImplementationReview: r.postImplementationReview ?? false,
          rollbackExecuted: r.rollbackExecuted ?? false,
        }))
        if (!cancelled) setEmergencyChanges(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setEmergencyChanges([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Statistics
  const stats = {
    total: emergencyChanges.length,
    inProgress: emergencyChanges.filter(c => c.status === 'In Progress').length,
    completed: emergencyChanges.filter(c => c.status === 'Completed').length,
    thisMonth: emergencyChanges.filter(c => {
      const changeDate = new Date(c.reportedDate)
      const now = new Date()
      return changeDate.getMonth() === now.getMonth() && changeDate.getFullYear() === now.getFullYear()
    }).length,
    avgResolutionTime: '2.5h',
    pendingReview: emergencyChanges.filter(c => c.postImplementationReview === false && c.status === 'Completed').length
  }

  const filteredChanges = emergencyChanges.filter(change => {
    const matchesStatus = selectedStatus === 'All' || change.status === selectedStatus
    const matchesSearch = searchTerm === '' || 
      change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Urgent': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Failed': return 'bg-red-100 text-red-700'
      case 'Rolled Back': return 'bg-yellow-100 text-yellow-700'
      case 'Pending Start': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Emergency Changes
          </h1>
          <p className="text-gray-600 mt-1">Urgent changes that bypass normal approval process</p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Emergency Change Protocol</h3>
            <p className="text-sm text-red-800 mt-1">
              Emergency changes should only be used for critical situations that pose immediate risk to business operations, 
              security, or data integrity. Post-implementation review is mandatory for all emergency changes.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Emergency</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <Play className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold mt-1">{stats.thisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold mt-1">{stats.avgResolutionTime}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingReview}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-600" />
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
                placeholder="Search by ticket number, title, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Rolled Back">Rolled Back</option>
            <option value="Pending Start">Pending Start</option>
          </select>
        </div>
      </div>

      {/* Emergency Changes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Ticket</th>
                <th className="text-left p-3 font-medium text-gray-600">Title</th>
                <th className="text-left p-3 font-medium text-gray-600">Severity</th>
                <th className="text-left p-3 font-medium text-gray-600">Status</th>
                <th className="text-left p-3 font-medium text-gray-600">Reported</th>
                <th className="text-left p-3 font-medium text-gray-600">Duration</th>
                <th className="text-left p-3 font-medium text-gray-600">Implementer</th>
                <th className="text-left p-3 font-medium text-gray-600">Review</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredChanges
                .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime())
                .map((change) => (
                  <tr key={change.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{change.ticketNumber}</div>
                      <div className="text-xs text-gray-500">{change.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium max-w-xs truncate">{change.title}</div>
                      <div className="text-xs text-gray-500">
                        {change.affectedSystems.length} systems affected
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(change.severity)}`}>
                        {change.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                        {change.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(change.reportedDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(change.reportedDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{change.duration}</div>
                      {change.downtime && (
                        <div className="text-xs text-red-600">
                          Downtime: {change.actualDowntime}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{change.implementer}</div>
                      <div className="text-xs text-gray-500">
                        Approved: {change.approvalMethod}
                      </div>
                    </td>
                    <td className="p-4">
                      {change.postImplementationReview ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      )}
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
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    {selectedChange.title}
                  </h2>
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
              {/* Status and Severity */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getSeverityColor(selectedChange.severity)}`}>
                    {selectedChange.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(selectedChange.status)}`}>
                    {selectedChange.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium mt-1">{selectedChange.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Downtime</p>
                  <p className={`font-medium mt-1 ${selectedChange.downtime ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedChange.actualDowntime}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reported:</span>
                    <span className="font-medium">{selectedChange.reportedDate}</span>
                  </div>
                  {selectedChange.startedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">{selectedChange.startedDate}</span>
                    </div>
                  )}
                  {selectedChange.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{selectedChange.completedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Impact */}
              <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                <h3 className="font-medium mb-2 text-red-900">Business Impact</h3>
                <p className="text-sm text-red-800">{selectedChange.businessImpact}</p>
              </div>

              {/* Affected Systems */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Affected Systems ({selectedChange.affectedSystems.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedChange.affectedSystems.map((system, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Root Cause & Resolution */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-lg p-3">
                  <h3 className="font-medium mb-2">Root Cause</h3>
                  <p className="text-sm text-gray-700">{selectedChange.rootCause}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <h3 className="font-medium mb-2">Resolution</h3>
                  <p className="text-sm text-gray-700">{selectedChange.resolution}</p>
                </div>
              </div>

              {/* Team & Approval */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Requester</p>
                  <p className="font-medium mt-1">{selectedChange.requester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Implementer</p>
                  <p className="font-medium mt-1">{selectedChange.implementer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-medium mt-1">{selectedChange.approvedBy}</p>
                  <p className="text-xs text-gray-500">via {selectedChange.approvalMethod}</p>
                </div>
              </div>

              {/* Post-Implementation Review */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedChange.postImplementationReview ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      Post-Implementation Review: {selectedChange.postImplementationReview ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  {!selectedChange.postImplementationReview && selectedChange.status === 'Completed' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Schedule Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
