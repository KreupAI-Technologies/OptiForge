'use client'

import { useState, useEffect } from 'react'
import { Ticket, Clock, User, Search, Filter, Eye, MessageSquare, AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface TicketItem {
  id: string
  ticketId: string
  subject: string
  requester: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  createdAt: string
  slaRemaining: string
  assignee: string
  comments: number
}

export default function OpenTickets() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getOmnichannel()
        const mapped: TicketItem[] = raw.map((r: any, i: number) => ({
          id: String(r.id ?? i),
          ticketId: r.ticketId ?? r.ticketNumber ?? r.conversationId ?? r.reference ?? String(r.id ?? i),
          subject: r.subject ?? r.title ?? r.lastMessage ?? '',
          requester: r.requester ?? r.customerName ?? r.customer ?? r.from ?? '',
          category: r.category ?? r.channel ?? '',
          priority: (r.priority ?? 'medium') as TicketItem['priority'],
          status: r.status ?? 'Open',
          createdAt: r.createdAt ?? r.created ?? '',
          slaRemaining: r.slaRemaining ?? r.sla ?? '',
          assignee: r.assignee ?? r.assignedTo ?? r.agent ?? 'Unassigned',
          comments: r.comments ?? r.messageCount ?? 0,
        }))
        if (!cancelled) setTickets(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setTickets([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSLAColor = (sla: string) => {
    if (sla === 'Overdue') return 'text-red-600'
    const hours = parseInt(sla.split('h')[0])
    if (hours < 4) return 'text-red-600'
    if (hours < 12) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter
    return matchesSearch && matchesPriority && matchesCategory
  })

  const categories = Array.from(new Set(tickets.map(t => t.category)))

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Open Tickets</h1>
          <p className="text-gray-600 mt-1">Active support tickets requiring attention</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{tickets.length}</div>
          <div className="text-sm text-gray-600">Total Open</div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading open tickets…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA Remaining
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-blue-600" />
                      <code className="text-sm font-mono text-gray-900">{ticket.ticketId}</code>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    {ticket.comments > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.comments} comments
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{ticket.requester}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium border rounded ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ticket.assignee}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className={`h-4 w-4 ${getSLAColor(ticket.slaRemaining)}`} />
                      <span className={`text-sm font-medium ${getSLAColor(ticket.slaRemaining)}`}>
                        {ticket.slaRemaining}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {ticket.createdAt}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg text-sm">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
