'use client'

import { useState, useEffect } from 'react'
import { Ticket, User, Clock, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { getTickets } from '@/services/support-management.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

interface AssignedRow {
  id: string
  ticketId: string
  subject: string
  assignee: string
  status: string
  slaRemaining: string
}

export default function AssignedTickets() {
  const [tickets, setTickets] = useState<AssignedRow[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = (await getTickets({ companyId: COMPANY_ID, limit: 500 })) as any
        const raw: any[] = Array.isArray(res) ? res : (res?.tickets ?? [])
        const filtered = raw.filter((t) =>
          t?.assigneeId || ['assigned', 'in_progress'].includes(t?.status)
        )
        const mapped: AssignedRow[] = filtered.map((t) => ({
          id: String(t?.id ?? ''),
          ticketId: t?.ticketNumber ?? '',
          subject: t?.subject ?? '',
          assignee: t?.assignee?.name ?? t?.assigneeId ?? '',
          status: t?.status ?? '',
          slaRemaining: t?.slaRemaining ?? '',
        }))
        if (!cancelled) setTickets(mapped)
      } catch {
        if (!cancelled) setTickets([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Tickets</h1>
          <p className="text-gray-600 mt-1">Tickets assigned to team members</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">{tickets.length}</div>
          <div className="text-sm text-gray-600">Assigned</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2"><code className="text-sm">{ticket.ticketId}</code></td>
                  <td className="px-3 py-2 text-sm">{ticket.subject}</td>
                  <td className="px-3 py-2 text-sm">{ticket.assignee}</td>
                  <td className="px-3 py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{ticket.status}</span></td>
                  <td className="px-3 py-2 text-sm">{ticket.slaRemaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
