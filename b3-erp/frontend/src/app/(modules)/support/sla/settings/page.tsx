'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Clock, AlertTriangle, Bell, Calendar, Users, Settings as SettingsIcon } from 'lucide-react'
import { SlaSettingsService } from '@/services/support.service'

interface SLAConfig {
  id: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  responseTime: number
  responseUnit: 'minutes' | 'hours' | 'days'
  resolutionTime: number
  resolutionUnit: 'minutes' | 'hours' | 'days'
  escalationLevel1: number
  escalationLevel2: number
  escalationLevel3: number
  businessHoursOnly: boolean
  autoAssign: boolean
  notifyOnBreach: boolean
}

interface BusinessHours {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

interface EscalationRule {
  id: string
  level: number
  timeThreshold: number
  unit: 'minutes' | 'hours'
  escalateTo: string
  notifyChannels: string[]
  active: boolean
}

const DEFAULT_SLA_CONFIGS: SLAConfig[] = [
    {
      id: '1',
      priority: 'P0',
      responseTime: 15,
      responseUnit: 'minutes',
      resolutionTime: 4,
      resolutionUnit: 'hours',
      escalationLevel1: 50,
      escalationLevel2: 75,
      escalationLevel3: 90,
      businessHoursOnly: false,
      autoAssign: true,
      notifyOnBreach: true
    },
    {
      id: '2',
      priority: 'P1',
      responseTime: 1,
      responseUnit: 'hours',
      resolutionTime: 8,
      resolutionUnit: 'hours',
      escalationLevel1: 50,
      escalationLevel2: 75,
      escalationLevel3: 90,
      businessHoursOnly: false,
      autoAssign: true,
      notifyOnBreach: true
    },
    {
      id: '3',
      priority: 'P2',
      responseTime: 4,
      responseUnit: 'hours',
      resolutionTime: 24,
      resolutionUnit: 'hours',
      escalationLevel1: 50,
      escalationLevel2: 75,
      escalationLevel3: 90,
      businessHoursOnly: true,
      autoAssign: true,
      notifyOnBreach: true
    },
    {
      id: '4',
      priority: 'P3',
      responseTime: 24,
      responseUnit: 'hours',
      resolutionTime: 5,
      resolutionUnit: 'days',
      escalationLevel1: 50,
      escalationLevel2: 75,
      escalationLevel3: 90,
      businessHoursOnly: true,
      autoAssign: false,
      notifyOnBreach: false
    }
  ]

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'Monday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Friday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '13:00' },
  { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '13:00' }
]

const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    id: '1',
    level: 1,
    timeThreshold: 50,
    unit: 'minutes',
    escalateTo: 'Team Lead',
    notifyChannels: ['Email', 'SMS'],
    active: true
  },
  {
    id: '2',
    level: 2,
    timeThreshold: 75,
    unit: 'minutes',
    escalateTo: 'Manager',
    notifyChannels: ['Email', 'SMS', 'Phone'],
    active: true
  },
  {
    id: '3',
    level: 3,
    timeThreshold: 90,
    unit: 'minutes',
    escalateTo: 'Director',
    notifyChannels: ['Email', 'SMS', 'Phone', 'Slack'],
    active: true
  }
]

export default function SLASettings() {
  const [activeTab, setActiveTab] = useState<'sla-config' | 'business-hours' | 'escalation' | 'notifications'>('sla-config')
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>(DEFAULT_SLA_CONFIGS)
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(DEFAULT_BUSINESS_HOURS)
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(DEFAULT_ESCALATION_RULES)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await SlaSettingsService.getSlaSettings()
        if (cancelled) return
        if (Array.isArray(data?.slaConfigs) && data.slaConfigs.length) {
          setSlaConfigs(data.slaConfigs as unknown as SLAConfig[])
        }
        if (Array.isArray(data?.businessHours) && data.businessHours.length) {
          setBusinessHours(data.businessHours as unknown as BusinessHours[])
        }
        if (Array.isArray(data?.escalationRules) && data.escalationRules.length) {
          setEscalationRules(data.escalationRules as unknown as EscalationRule[])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load SLA settings')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setLoadError(null)
    try {
      await SlaSettingsService.saveSlaSettings({
        slaConfigs: slaConfigs as unknown as Array<Record<string, unknown>>,
        businessHours: businessHours as unknown as Array<Record<string, unknown>>,
        escalationRules: escalationRules as unknown as Array<Record<string, unknown>>,
      })
      setUnsavedChanges(false)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to save SLA settings')
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-500 text-white'
      case 'P1': return 'bg-orange-500 text-white'
      case 'P2': return 'bg-yellow-500 text-white'
      case 'P3': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Settings</h1>
          <p className="text-gray-600 mt-1">Configure SLA parameters, business hours, and escalation rules</p>
        </div>
        <div className="flex gap-3">
          {unsavedChanges && (
            <span className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading SLA settings…
        </div>
      )}
      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('sla-config')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sla-config'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA Configuration
              </div>
            </button>
            <button
              onClick={() => setActiveTab('business-hours')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'business-hours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Business Hours
              </div>
            </button>
            <button
              onClick={() => setActiveTab('escalation')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'escalation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Escalation Rules
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </div>
            </button>
          </nav>
        </div>

        {/* SLA Configuration Tab */}
        {activeTab === 'sla-config' && (
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Priority-based SLA Targets</h2>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Priority Level
              </button>
            </div>

            <div className="space-y-2">
              {slaConfigs.map((config) => (
                <div key={config.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(config.priority)}`}>
                        {config.priority}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {config.priority === 'P0' ? 'Critical' : config.priority === 'P1' ? 'High' : config.priority === 'P2' ? 'Medium' : 'Low'} Priority
                      </span>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Response Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Time Target
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={config.responseTime}
                          onChange={(e) => {
                            const updated = slaConfigs.map(c => 
                              c.id === config.id ? { ...c, responseTime: parseInt(e.target.value) } : c
                            )
                            setSlaConfigs(updated)
                            setUnsavedChanges(true)
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={config.responseUnit}
                          onChange={(e) => {
                            const updated = slaConfigs.map(c => 
                              c.id === config.id ? { ...c, responseUnit: e.target.value as any } : c
                            )
                            setSlaConfigs(updated)
                            setUnsavedChanges(true)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Resolution Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Time Target
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={config.resolutionTime}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={config.resolutionUnit}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Escalation Timing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Escalation Levels (% of target)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Level 1:</span>
                          <input
                            type="number"
                            value={config.escalationLevel1}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Level 2:</span>
                          <input
                            type="number"
                            value={config.escalationLevel2}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Level 3:</span>
                          <input
                            type="number"
                            value={config.escalationLevel3}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.businessHoursOnly}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Business hours only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.autoAssign}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Auto-assign tickets</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.notifyOnBreach}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Notify on SLA breach</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'business-hours' && (
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Business Hours Configuration</h2>
              <p className="text-sm text-gray-600">Define working hours for SLA calculations when business hours mode is enabled</p>
            </div>

            <div className="space-y-3">
              {businessHours.map((day) => (
                <div key={day.day} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer w-32">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) => {
                          const updated = businessHours.map(d =>
                            d.day === day.day ? { ...d, enabled: e.target.checked } : d
                          )
                          setBusinessHours(updated)
                          setUnsavedChanges(true)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{day.day}</span>
                    </label>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          type="time"
                          value={day.startTime}
                          disabled={!day.enabled}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        disabled={!day.enabled}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>

                    {day.enabled && (
                      <span className="text-sm text-gray-600">
                        ({Math.floor((new Date(`2000-01-01 ${day.endTime}`).getTime() - new Date(`2000-01-01 ${day.startTime}`).getTime()) / 3600000)} hours)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-3">
                <SettingsIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Holidays & Exceptions</h3>
                  <p className="text-sm text-blue-700">Configure public holidays and special exceptions in the System Settings to exclude them from SLA calculations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escalation Rules Tab */}
        {activeTab === 'escalation' && (
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Escalation Rules</h2>
                <p className="text-sm text-gray-600">Configure automatic escalation based on time thresholds</p>
              </div>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Rule
              </button>
            </div>

            <div className="space-y-2">
              {escalationRules.map((rule) => (
                <div key={rule.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
                        Level {rule.level}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.active}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Threshold
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={rule.timeThreshold}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={rule.unit}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Escalate To
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Team Lead">Team Lead</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                        <option value="VP">VP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Channels
                      </label>
                      <div className="space-y-2">
                        {['Email', 'SMS', 'Phone', 'Slack'].map((channel) => (
                          <label key={channel} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.notifyChannels.includes(channel)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{channel}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-600">Configure when and how stakeholders are notified about SLA events</p>
            </div>

            <div className="space-y-3">
              {/* SLA Breach Notifications */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">SLA Breach Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Notify assignee on breach</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Notify manager on breach</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Notify customer on breach</span>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>

              {/* Warning Notifications */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Warning Notifications (Before Breach)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Send warning at</span>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue="80" className="w-20 px-3 py-1 border border-gray-300 rounded-lg" />
                      <span className="text-sm text-gray-600">% of SLA time</span>
                    </div>
                  </div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Enable warning notifications</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>

              {/* Daily Digest */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Daily SLA Digest</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Send daily SLA summary</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Send time</span>
                    <input type="time" defaultValue="09:00" className="px-3 py-1 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
