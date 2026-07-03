'use client'

import { useState, useEffect } from 'react'
import { SupportKnownErrorService } from '@/services/support.service'
import {
  Search, Filter, Plus, FileText, AlertCircle, CheckCircle, Clock,
  Users, Link, ChevronRight, Database, Server, Network, Shield
} from 'lucide-react'

interface KnownError {
  id: string
  errorId: string
  title: string
  description: string
  workaround: string
  status: 'Active' | 'Resolved' | 'Under Review'
  category: string
  affectedSystems: string[]
  relatedProblems: string[]
  documentedBy: string
  documentedDate: string
  lastUpdated: string
  affectedUsers: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function KnownErrors() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [stats] = useState({
    totalErrors: 18,
    active: 12,
    resolved: 6,
    underReview: 0,
    avgResolutionTime: '12 days',
    mostCommon: 'Database'
  })

  const [errors, setErrors] = useState<KnownError[]>([
    {
      id: '1',
      errorId: 'KE-2024-008',
      title: 'Database Connection Pool Exhaustion',
      description: 'Application fails to connect to database during peak hours due to connection pool being exhausted. Error message: "Unable to acquire connection from pool"',
      workaround: 'Restart application server to reset connection pool. Temporary increase of max_connections parameter provides relief for 2-3 hours.',
      status: 'Active',
      category: 'Database',
      affectedSystems: ['ERP Application', 'Reporting Module', 'API Gateway'],
      relatedProblems: ['PRB-2024-012', 'PRB-2024-015'],
      documentedBy: 'Rajesh Kumar',
      documentedDate: '2024-10-18',
      lastUpdated: '2024-10-20',
      affectedUsers: 450,
      severity: 'critical'
    },
    {
      id: '2',
      errorId: 'KE-2024-007',
      title: 'Email Service SMTP Authentication Failure',
      description: 'Periodic SMTP authentication failures when sending emails through corporate mail server. Error occurs approximately every 3-4 hours.',
      workaround: 'Configure email retry mechanism with exponential backoff. Emails eventually send successfully after 2-3 retry attempts.',
      status: 'Active',
      category: 'Integration',
      affectedSystems: ['Email Service', 'Notification Module'],
      relatedProblems: ['PRB-2024-009'],
      documentedBy: 'Priya Sharma',
      documentedDate: '2024-10-15',
      lastUpdated: '2024-10-19',
      affectedUsers: 200,
      severity: 'medium'
    },
    {
      id: '3',
      errorId: 'KE-2024-006',
      title: 'API Rate Limiting Triggered During Batch Operations',
      description: 'Third-party API rate limits exceeded when processing large batch imports. Error: "429 Too Many Requests"',
      workaround: 'Split batch operations into smaller chunks of 50 records with 2-second delays between batches.',
      status: 'Active',
      category: 'Integration',
      affectedSystems: ['Import Service', 'Data Sync Module'],
      relatedProblems: ['PRB-2024-007'],
      documentedBy: 'Amit Patel',
      documentedDate: '2024-10-12',
      lastUpdated: '2024-10-18',
      affectedUsers: 80,
      severity: 'medium'
    },
    {
      id: '4',
      errorId: 'KE-2024-005',
      title: 'Session Timeout Not Respected in Mobile App',
      description: 'Mobile application maintains session beyond configured 30-minute timeout period, potentially causing security concerns.',
      workaround: 'Users should manually log out after completing work. Server-side validation still enforces timeout for critical operations.',
      status: 'Under Review',
      category: 'Security',
      affectedSystems: ['Mobile App', 'Authentication Service'],
      relatedProblems: ['PRB-2024-005'],
      documentedBy: 'Sneha Reddy',
      documentedDate: '2024-10-10',
      lastUpdated: '2024-10-17',
      affectedUsers: 320,
      severity: 'high'
    },
    {
      id: '5',
      errorId: 'KE-2024-004',
      title: 'Report Generation Memory Leak',
      description: 'Long-running report generation processes cause gradual memory consumption increase, eventually leading to out-of-memory errors.',
      workaround: 'Schedule reports during off-peak hours and restart report service daily at 2 AM to clear memory.',
      status: 'Active',
      category: 'Performance',
      affectedSystems: ['Reporting Service', 'Analytics Dashboard'],
      relatedProblems: ['PRB-2024-004', 'PRB-2024-011'],
      documentedBy: 'Vikram Singh',
      documentedDate: '2024-10-08',
      lastUpdated: '2024-10-16',
      affectedUsers: 150,
      severity: 'high'
    },
    {
      id: '6',
      errorId: 'KE-2024-003',
      title: 'File Upload Fails for PDF Files Over 10MB',
      description: 'PDF file uploads fail with "Request Entity Too Large" error when file size exceeds 10MB, despite 50MB limit being configured.',
      workaround: 'Compress PDF files before uploading or split large PDFs into multiple smaller documents.',
      status: 'Resolved',
      category: 'Application',
      affectedSystems: ['Document Management', 'File Upload Service'],
      relatedProblems: ['PRB-2024-003'],
      documentedBy: 'Rajesh Kumar',
      documentedDate: '2024-10-05',
      lastUpdated: '2024-10-15',
      affectedUsers: 0,
      severity: 'medium'
    }
  ])

  useEffect(() => {
    let cancelled = false
    SupportKnownErrorService.getErrors()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setErrors(rows as unknown as KnownError[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.errorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || error.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || error.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200'
      case 'Resolved': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database': return <Database className="h-4 w-4" />
      case 'Network': return <Network className="h-4 w-4" />
      case 'Security': return <Shield className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Known Error Database</h1>
          <p className="text-gray-600 mt-1">Documented errors with workarounds and solutions</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700">
          <Plus className="h-4 w-4 inline mr-2" />
          Document New Error
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Errors</p>
              <p className="text-2xl font-bold mt-1">{stats.totalErrors}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active</p>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Resolved</p>
              <p className="text-2xl font-bold mt-1">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Under Review</p>
              <p className="text-2xl font-bold mt-1">{stats.underReview}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Avg Resolution</p>
              <p className="text-2xl font-bold mt-1">{stats.avgResolutionTime}</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Most Common</p>
              <p className="text-lg font-bold mt-1">{stats.mostCommon}</p>
            </div>
            <Database className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="Under Review">Under Review</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Database">Database</option>
            <option value="Application">Application</option>
            <option value="Network">Network</option>
            <option value="Security">Security</option>
            <option value="Integration">Integration</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Known Errors List */}
      <div className="space-y-2">
        {filteredErrors.map((error) => (
          <div key={error.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(error.severity)}`}>
                  {getCategoryIcon(error.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {error.errorId}
                    </code>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(error.status)}`}>
                      {error.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                      {error.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{error.title}</h3>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-sm">
                <span>View</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                <p className="text-sm text-gray-600">{error.description}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 mb-1">Workaround:</p>
                <p className="text-sm text-green-800">{error.workaround}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Affected Systems:</p>
                  <div className="flex flex-wrap gap-1">
                    {error.affectedSystems.map((system, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Related Problems:</p>
                  <div className="flex flex-wrap gap-1">
                    {error.relatedProblems.map((problem, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200 font-mono">
                        {problem}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {error.affectedUsers} users affected
                  </span>
                  <span>Documented by {error.documentedBy}</span>
                  <span>Category: {error.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Created: {error.documentedDate}</span>
                  <span>Updated: {error.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-2">About Known Error Database</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Known Errors are documented problems with identified root causes</li>
              <li>• Each entry includes workarounds to minimize business impact</li>
              <li>• Link related incidents and problems for comprehensive tracking</li>
              <li>• Active errors require ongoing workarounds until permanent fix is deployed</li>
              <li>• Resolved errors are kept for knowledge base and future reference</li>
            </ul>
          </div>
        </div>
      </div>

      {filteredErrors.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No known errors found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
