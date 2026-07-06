'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, Save, Clock, Mail, FileText } from 'lucide-react'
import { estimationReportScheduleService } from '@/services/estimation-report-schedule.service'

export default function ScheduleReportByIdPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string

  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [reportName, setReportName] = useState(`Report ${reportId}`)
  const [frequency, setFrequency] = useState('weekly')
  const [dayOfWeek, setDayOfWeek] = useState('monday')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [time, setTime] = useState('09:00')
  const [recipients, setRecipients] = useState('')
  const [format, setFormat] = useState('pdf')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Attempt to load an existing schedule for this id and prefill the form.
  useEffect(() => {
    if (!reportId) return
    let mounted = true
    const load = async () => {
      try {
        const s = await estimationReportScheduleService.getSchedule(reportId)
        if (!mounted || !s) return
        setScheduleId(s.id ?? reportId)
        if (s.reportType) setReportName(s.reportType)
        if (s.frequency) setFrequency(s.frequency)
        if (s.dayOfWeek) setDayOfWeek(s.dayOfWeek)
        if (s.dayOfMonth) setDayOfMonth(s.dayOfMonth)
        if (s.time) setTime(s.time)
        if (s.format) setFormat(s.format)
        if (Array.isArray(s.recipients)) setRecipients(s.recipients.join(', '))
        if (typeof s.isActive === 'boolean') setIsActive(s.isActive)
      } catch (e) {
        // No existing schedule for this id; treat as a new schedule for the report.
        console.warn('No existing schedule found for', reportId, e)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [reportId])

  const handleBack = () => {
    router.push('/estimation/analytics/reports')
  }

  const handleSave = async () => {
    if (!recipients.trim()) {
      alert('Please enter at least one recipient email')
      return
    }

    const payload = {
      reportType: reportName,
      frequency,
      dayOfWeek,
      dayOfMonth,
      time,
      format,
      recipients: recipients.split(',').map(e => e.trim()).filter(Boolean),
      isActive
    }

    setSaving(true)
    try {
      if (scheduleId) {
        await estimationReportScheduleService.updateSchedule(scheduleId, payload)
      } else {
        await estimationReportScheduleService.createSchedule(payload)
      }
      router.push('/estimation/analytics/reports')
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Failed to save schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Report</h1>
              <p className="text-sm text-gray-500 mt-1">{reportName}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="w-full space-y-3">
          {/* Report Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Report Details
            </h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="powerpoint">PowerPoint</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Schedule Configuration
            </h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              {frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <select
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day.toString()}>{day}</option>
                    ))}
                    <option value="last">Last Day of Month</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Recipients
            </h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  rows={3}
                  placeholder="Enter email addresses separated by commas&#10;e.g., manager@company.com, team@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple email addresses with commas</p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active (schedule is enabled)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Report: </span>
                  <span className="text-gray-900">{reportName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Schedule: </span>
                  <span className="text-gray-900">
                    {frequency === 'daily' && `Every day at ${time}`}
                    {frequency === 'weekly' && `Every ${dayOfWeek} at ${time}`}
                    {frequency === 'monthly' && `${dayOfMonth === 'last' ? 'Last day' : `Day ${dayOfMonth}`} of every month at ${time}`}
                    {frequency === 'quarterly' && `First day of every quarter at ${time}`}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">Recipients: </span>
                  <span className="text-gray-900">{recipients || 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
