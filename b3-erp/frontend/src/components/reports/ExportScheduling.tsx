'use client'
import { useEffect, useMemo, useState } from 'react'
import { Calendar, Download, Mail, Clock } from 'lucide-react'
import {
  fetchReportSchedulesByCompany,
  type ReportSchedule,
} from '@/services/reports-management.service'

export default function ExportScheduling() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const rows = await fetchReportSchedulesByCompany()
        if (active) setSchedules(rows)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load schedules')
          setSchedules([])
        }
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const scheduledCount = schedules.length
    const emailRecipients = schedules.reduce(
      (sum, s) => sum + (Array.isArray(s.recipients) ? s.recipients.length : 0),
      0,
    )
    // Most common frequency across active schedules.
    const freqCounts = schedules.reduce<Record<string, number>>((acc, s) => {
      const f = s.frequency || 'unknown'
      acc[f] = (acc[f] || 0) + 1
      return acc
    }, {})
    const mostCommon =
      Object.entries(freqCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    const mostCommonLabel = mostCommon === '—'
      ? '—'
      : mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1)
    return { scheduledCount, emailRecipients, mostCommonLabel }
  }, [schedules])

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-green-600" />
          Export Scheduling
        </h2>
        <p className="text-gray-600 mt-1">Automated report distribution via email and file exports</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Calendar className="h-8 w-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {isLoading ? '…' : stats.scheduledCount}
          </div>
          <div className="text-sm text-gray-600">Scheduled Reports</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Download className="h-8 w-8 text-blue-600 mb-3" />
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {isLoading
              ? '…'
              : schedules.reduce((sum, s) => sum + (s.successCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Successful Runs</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Mail className="h-8 w-8 text-purple-600 mb-3" />
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {isLoading ? '…' : stats.emailRecipients}
          </div>
          <div className="text-sm text-gray-600">Email Recipients</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Clock className="h-8 w-8 text-orange-600 mb-3" />
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {isLoading ? '…' : stats.mostCommonLabel}
          </div>
          <div className="text-sm text-gray-600">Most Common</div>
        </div>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Schedules</h3>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading schedules…</div>
        ) : schedules.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No report schedules configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.scheduleName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{s.frequency}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 uppercase">{s.outputFormat}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{s.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
