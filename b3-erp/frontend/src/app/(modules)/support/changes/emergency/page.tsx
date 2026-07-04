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

  const emergencyChanges: EmergencyChange[] = [
    {
      id: '1',
      ticketNumber: 'CHG-EMRG-2024-089',
      title: 'Critical Security Patch - Zero-Day Vulnerability',
      severity: 'Critical',
      category: 'Security',
      status: 'Completed',
      requester: 'Sarah Johnson',
      implementer: 'Security Team',
      reportedDate: '2024-10-20 14:30',
      startedDate: '2024-10-20 15:00',
      completedDate: '2024-10-20 17:45',
      duration: '2h 45m',
      businessImpact: 'All external-facing systems vulnerable to exploitation. Immediate patching required.',
      affectedSystems: ['Web Servers', 'Application Servers', 'API Gateway', 'Load Balancers'],
      affectedUsers: 'All',
      rootCause: 'Critical zero-day vulnerability discovered in web server software',
      resolution: 'Applied emergency security patches to all affected systems. Verified vulnerability closure.',
      downtime: true,
      actualDowntime: '15 minutes',
      approvedBy: 'CIO - Mike Chen',
      approvalMethod: 'Verbal',
      postImplementationReview: true,
      rollbackExecuted: false
    },
    {
      id: '2',
      ticketNumber: 'CHG-EMRG-2024-088',
      title: 'Database Server Failure - Primary Node',
      severity: 'Critical',
      category: 'Infrastructure',
      status: 'Completed',
      requester: 'Monitoring System',
      implementer: 'Database Team',
      reportedDate: '2024-10-19 03:15',
      startedDate: '2024-10-19 03:20',
      completedDate: '2024-10-19 05:30',
      duration: '2h 10m',
      businessImpact: 'Complete ERP system outage. All business operations halted.',
      affectedSystems: ['Production Database', 'ERP System', 'Reporting System'],
      affectedUsers: 'All',
      rootCause: 'Hardware failure on primary database server. Storage controller malfunction.',
      resolution: 'Executed failover to standby database node. Replaced failed hardware component.',
      downtime: true,
      actualDowntime: '2 hours 10 minutes',
      approvedBy: 'IT Director - Tom Wilson',
      approvalMethod: 'Emergency CAB',
      postImplementationReview: true,
      rollbackExecuted: false
    },
    {
      id: '3',
      ticketNumber: 'CHG-EMRG-2024-090',
      title: 'Network Core Switch Failure',
      severity: 'Critical',
      category: 'Network',
      status: 'In Progress',
      requester: 'Network Operations',
      implementer: 'Michael Zhang',
      reportedDate: '2024-10-21 09:15',
      startedDate: '2024-10-21 09:30',
      completedDate: '',
      duration: 'Ongoing',
      businessImpact: 'Building A network connectivity lost. 200+ users affected.',
      affectedSystems: ['Core Switch', 'Access Layer', 'VoIP System'],
      affectedUsers: '200+',
      rootCause: 'Core switch hardware failure. Power supply unit malfunction.',
      resolution: 'In progress: Installing backup switch, reconfiguring network topology.',
      downtime: true,
      actualDowntime: 'Ongoing',
      approvedBy: 'Network Manager - David Kumar',
      approvalMethod: 'Verbal',
      postImplementationReview: false,
      rollbackExecuted: false
    },
    {
      id: '4',
      ticketNumber: 'CHG-EMRG-2024-087',
      title: 'Ransomware Attack Response',
      severity: 'Critical',
      category: 'Security',
      status: 'Completed',
      requester: 'Security Operations Center',
      implementer: 'Incident Response Team',
      reportedDate: '2024-10-15 22:45',
      startedDate: '2024-10-15 23:00',
      completedDate: '2024-10-16 08:30',
      duration: '9h 30m',
      businessImpact: 'Suspected ransomware infection. File servers quarantined. Limited operations.',
      affectedSystems: ['File Servers', 'Backup System', 'Email System'],
      affectedUsers: 'All',
      rootCause: 'Phishing email led to malware infection. Automated containment triggered.',
      resolution: 'Isolated infected systems, restored from clean backups, enhanced security controls.',
      downtime: true,
      actualDowntime: '8 hours',
      approvedBy: 'CISO - Emily Davis',
      approvalMethod: 'Emergency CAB',
      postImplementationReview: true,
      rollbackExecuted: false
    },
    {
      id: '5',
      ticketNumber: 'CHG-EMRG-2024-086',
      title: 'Payment Gateway Outage',
      severity: 'High',
      category: 'Application',
      status: 'Completed',
      requester: 'Finance Department',
      implementer: 'Application Team',
      reportedDate: '2024-10-14 11:20',
      startedDate: '2024-10-14 11:35',
      completedDate: '2024-10-14 13:15',
      duration: '1h 40m',
      businessImpact: 'Unable to process customer payments. Revenue generation stopped.',
      affectedSystems: ['Payment Gateway', 'E-commerce Platform'],
      affectedUsers: 'All Customers',
      rootCause: 'SSL certificate expiration on payment gateway. Monitoring alert missed.',
      resolution: 'Renewed and installed new SSL certificate. Restored payment processing.',
      downtime: true,
      actualDowntime: '1 hour 40 minutes',
      approvedBy: 'CFO - James Wilson',
      approvalMethod: 'Email',
      postImplementationReview: true,
      rollbackExecuted: false
    },
    {
      id: '6',
      ticketNumber: 'CHG-EMRG-2024-091',
      title: 'Email System Configuration Error',
      severity: 'High',
      category: 'Infrastructure',
      status: 'Pending Start',
      requester: 'Help Desk',
      implementer: 'Messaging Team',
      reportedDate: '2024-10-21 14:00',
      startedDate: '',
      completedDate: '',
      duration: 'Not started',
      businessImpact: 'Emails not being delivered. Critical business communications affected.',
      affectedSystems: ['Email Server', 'Mail Gateway'],
      affectedUsers: 'All',
      rootCause: 'Configuration change from previous maintenance caused mail routing failure.',
      resolution: 'Pending: Rollback recent configuration changes, restore mail flow.',
      downtime: false,
      actualDowntime: 'N/A',
      approvedBy: 'IT Manager - Lisa Chen',
      approvalMethod: 'Verbal',
      postImplementationReview: false,
      rollbackExecuted: false
    },
    {
      id: '7',
      ticketNumber: 'CHG-EMRG-2024-085',
      title: 'Data Center Cooling System Failure',
      severity: 'Critical',
      category: 'Facilities',
      status: 'Completed',
      requester: 'Facilities Team',
      implementer: 'Infrastructure Team',
      reportedDate: '2024-10-12 16:30',
      startedDate: '2024-10-12 16:45',
      completedDate: '2024-10-12 19:20',
      duration: '2h 35m',
      businessImpact: 'Server room temperature rising rapidly. Risk of hardware damage and outages.',
      affectedSystems: ['All Data Center Equipment'],
      affectedUsers: 'All',
      rootCause: 'HVAC system compressor failure. Backup cooling insufficient.',
      resolution: 'Emergency shutdown of non-critical systems, portable cooling deployed, HVAC repaired.',
      downtime: true,
      actualDowntime: '30 minutes (partial)',
      approvedBy: 'Operations Director - Robert Brown',
      approvalMethod: 'Emergency CAB',
      postImplementationReview: true,
      rollbackExecuted: false
    },
    {
      id: '8',
      ticketNumber: 'CHG-EMRG-2024-084',
      title: 'DDoS Attack Mitigation',
      severity: 'High',
      category: 'Security',
      status: 'Completed',
      requester: 'Network Security',
      implementer: 'Security Team',
      reportedDate: '2024-10-10 10:15',
      startedDate: '2024-10-10 10:25',
      completedDate: '2024-10-10 12:40',
      duration: '2h 15m',
      businessImpact: 'Website and customer portal unreachable due to DDoS attack.',
      affectedSystems: ['Web Servers', 'Firewall', 'Load Balancer'],
      affectedUsers: 'External Users',
      rootCause: 'Coordinated DDoS attack targeting public-facing services.',
      resolution: 'Activated DDoS protection service, implemented rate limiting, blocked attack sources.',
      downtime: true,
      actualDowntime: '1 hour 30 minutes',
      approvedBy: 'CISO - Emily Davis',
      approvalMethod: 'Verbal',
      postImplementationReview: true,
      rollbackExecuted: false
    }
  ]

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
