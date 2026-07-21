'use client'

import { useState, useEffect } from 'react'
import { Shield, User, Clock, FileText, Search, Filter, Download } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  record: string
  oldValue: string
  newValue: string
  ipAddress: string
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await FinanceService.getAuditTrail()
        const mapped: AuditLog[] = (data || []).map((a: any) => {
          let changesStr = ''
          if (a.changes != null) {
            changesStr = typeof a.changes === 'string' ? a.changes : JSON.stringify(a.changes)
          }
          return {
            id: String(a.id),
            timestamp: a.createdAt ?? '',
            user: a.performedBy ?? '-',
            action: String(a.action ?? '').toUpperCase(),
            module: a.entityType ?? '-',
            record: a.entityId ?? '-',
            oldValue: a.description ?? '-',
            newValue: changesStr || '-',
            ipAddress: a.ipAddress ?? '-',
          }
        })
        setLogs(mapped)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load audit trail')
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  // Export the loaded audit logs to CSV (real client-side export from fetched data).
  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Record', 'Old Value', 'New Value', 'IP Address']
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const rows = logs.map((l) =>
      [l.timestamp, l.user, l.action, l.module, l.record, l.oldValue, l.newValue, l.ipAddress]
        .map(escape)
        .join(',')
    )
    const csv = [headers.map(escape).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700'
      case 'UPDATE': return 'bg-blue-100 text-blue-700'
      case 'DELETE': return 'bg-red-100 text-red-700'
      case 'APPROVE': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-1">Complete transaction and change history</p>
          </div>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Actions</option>
              <option>CREATE</option>
              <option>UPDATE</option>
              <option>DELETE</option>
              <option>APPROVE</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Modules</option>
              <option>Journal Entry</option>
              <option>Invoice</option>
              <option>Payment</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Module</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Record</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">Loading audit logs…</td></tr>
              )}
              {error && (
                <tr><td colSpan={6} className="px-3 py-4 text-sm text-red-600 text-center">{error}</td></tr>
              )}
              {!loading && !error && logs.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">No audit logs found.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{log.timestamp}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{log.module}</td>
                  <td className="px-3 py-2 text-sm font-mono text-gray-900">{log.record}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs">
                      {log.oldValue !== '-' && (
                        <div className="text-red-600">Old: {log.oldValue}</div>
                      )}
                      {log.newValue !== '-' && (
                        <div className="text-green-600">New: {log.newValue}</div>
                      )}
                    </div>
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
