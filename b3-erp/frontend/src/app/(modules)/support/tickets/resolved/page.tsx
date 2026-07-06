'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, User, Clock, Star } from 'lucide-react'
import { getTickets } from '@/services/support-management.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

interface ResolvedRow {
  id: string
  ticketId: string
  subject: string
  resolvedBy: string
  resolutionTime: string
  satisfaction: number
}

export default function ResolvedTickets() {
  const [tickets, setTickets] = useState<ResolvedRow[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = (await getTickets({ companyId: COMPANY_ID, status: 'resolved', limit: 500 })) as any
        const raw: any[] = Array.isArray(res) ? res : (res?.tickets ?? [])
        const mapped: ResolvedRow[] = raw.map((t) => ({
          id: String(t?.id ?? ''),
          ticketId: t?.ticketNumber ?? '',
          subject: t?.subject ?? '',
          resolvedBy: t?.assignee?.name ?? '',
          resolutionTime: '',
          satisfaction: Math.max(0, Math.round(Number(t?.csatScore ?? 0) || 0)),
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
          <h1 className="text-3xl font-bold text-gray-900">Resolved Tickets</h1>
          <p className="text-gray-600 mt-1">Successfully resolved support tickets</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{tickets.length}</div>
          <div className="text-sm text-gray-600">Resolved Today</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolution Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2"><code className="text-sm">{ticket.ticketId}</code></td>
                  <td className="px-3 py-2 text-sm">{ticket.subject}</td>
                  <td className="px-3 py-2 text-sm">{ticket.resolvedBy}</td>
                  <td className="px-3 py-2 text-sm">{ticket.resolutionTime}</td>
                  <td className="px-3 py-2"><div className="flex">{Array.from({length: ticket.satisfaction}).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
