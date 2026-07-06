'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle, Plus, Search, Filter, Eye, Users, Calendar,
  TrendingUp, Clock, FileText, ChevronRight, BarChart
} from 'lucide-react'
import { ITILService } from '@/services/support.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

const mapStatus = (status: string): Problem['status'] => {
  switch (status) {
    case 'open': return 'Investigating'
    case 'root_cause_identified': return 'Root Cause Identified'
    case 'known_error': return 'Known Error'
    case 'resolved':
    case 'closed': return 'Resolved'
    default: return 'New'
  }
}

interface Problem {
  id: string
  problemId: string
  title: string
  description: string
  status: 'New' | 'Investigating' | 'Known Error' | 'Root Cause Identified' | 'Resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  relatedIncidents: number
  createdAt: string
  assignedTo: string
  category: string
  impact: string
  workaround?: string
}

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [problems, setProblems] = useState<Problem[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await ITILService.getProblems(COMPANY_ID)
        const rows = Array.isArray((res as any)?.data) ? (res as any).data : []
        const mapped: Problem[] = rows.map((p: any) => ({
          id: p?.id ?? '',
          problemId: p?.problemNumber ?? '',
          title: p?.title ?? '',
          description: p?.description ?? '',
          status: mapStatus(p?.status ?? ''),
          priority: (p?.priority ?? 'medium') as Problem['priority'],
          relatedIncidents: p?.relatedIncidents ?? 0,
          createdAt: p?.createdAt ? String(p.createdAt).slice(0, 10) : '',
          assignedTo: p?.assignedTo ?? '',
          category: p?.category ?? '',
          impact: p?.impact ?? '',
          workaround: p?.workaround ?? ''
        }))
        if (mounted) setProblems(mapped)
      } catch (e) {
        if (mounted) setProblems([])
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const stats = {
    totalProblems: problems.length,
    investigating: problems.filter(p => p.status === 'Investigating').length,
    knownErrors: problems.filter(p => p.status === 'Known Error').length,
    rootCauseIdentified: problems.filter(p => p.status === 'Root Cause Identified').length,
    resolved: problems.filter(p => p.status === 'Resolved').length,
    avgResolutionTime: '—'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-gray-600 bg-gray-100'
      case 'Investigating':
        return 'text-blue-600 bg-blue-100'
      case 'Known Error':
        return 'text-yellow-600 bg-yellow-100'
      case 'Root Cause Identified':
        return 'text-purple-600 bg-purple-100'
      case 'Resolved':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.problemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || problem.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || problem.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Problem Management</h1>
          <p className="text-gray-600 mt-1">Track and resolve recurring issues and root causes</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FileText className="h-4 w-4 inline mr-2" />
            View Known Errors
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 inline mr-2" />
            Create Problem
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Problems</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProblems}</p>
            </div>
            <AlertTriangle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Investigating</p>
              <p className="text-3xl font-bold mt-1">{stats.investigating}</p>
            </div>
            <Search className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Known Errors</p>
              <p className="text-3xl font-bold mt-1">{stats.knownErrors}</p>
            </div>
            <FileText className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">RCA Complete</p>
              <p className="text-3xl font-bold mt-1">{stats.rootCauseIdentified}</p>
            </div>
            <BarChart className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Resolved</p>
              <p className="text-3xl font-bold mt-1">{stats.resolved}</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg Resolution</p>
              <p className="text-2xl font-bold mt-1">{stats.avgResolutionTime}</p>
            </div>
            <Clock className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems by ID, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Known Error">Known Error</option>
              <option value="Root Cause Identified">Root Cause Identified</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Problems</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredProblems.length} of {problems.length} problems
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredProblems.map((problem) => (
            <div key={problem.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {problem.problemId}
                    </code>
                    <span className={`px-2 py-1 text-xs font-medium border rounded ${getPriorityColor(problem.priority)}`}>
                      {problem.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(problem.status)}`}>
                      {problem.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{problem.description}</p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{problem.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{problem.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{problem.relatedIncidents} related incidents</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{problem.category}</span>
                    </div>
                  </div>

                  {problem.workaround && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Workaround:</strong> {problem.workaround}
                      </p>
                    </div>
                  )}

                  {problem.impact && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Impact:</strong> {problem.impact}
                      </p>
                    </div>
                  )}
                </div>

                <button className="ml-4 inline-flex items-center gap-1.5 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-sm">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">About Problem Management</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Problems are identified from recurring incidents with the same root cause</li>
              <li>• Root Cause Analysis (RCA) helps prevent future incidents</li>
              <li>• Known Errors are documented problems with workarounds</li>
              <li>• Resolving a problem prevents related incidents from recurring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
