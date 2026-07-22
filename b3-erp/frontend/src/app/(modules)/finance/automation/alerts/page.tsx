'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle, Clock, DollarSign, TrendingUp, Settings, Mail, MessageSquare } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'
import { ItAdminService, NotificationRuleDto } from '@/services/it-admin.service'

interface Alert {
  id: string
  title: string
  message: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'payment' | 'approval' | 'budget' | 'compliance' | 'reconciliation' | 'threshold'
  timestamp: string
  read: boolean
  actionRequired: boolean
  relatedTo: string
  priority: 'high' | 'medium' | 'low'
}

interface NotificationRule {
  id: string
  name: string
  description: string
  trigger: string
  condition: string
  recipients: string[]
  channels: ('email' | 'sms' | 'in_app')[]
  status: 'active' | 'paused'
  frequency: string
}

const SEVERITY_TO_TYPE: Record<string, Alert['type']> = {
  critical: 'critical',
  high: 'critical',
  warning: 'warning',
  medium: 'warning',
  info: 'info',
  low: 'info',
  success: 'success',
}

const KNOWN_CATEGORIES: Alert['category'][] = ['payment', 'approval', 'budget', 'compliance', 'reconciliation', 'threshold']

export default function AlertsNotificationsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FinanceService.getAlerts()
      const mapped: Alert[] = (data || []).map((a: any) => {
        const sev = String(a.severity ?? '').toLowerCase()
        const cat = String(a.category ?? '').toLowerCase()
        return {
          id: String(a.id),
          title: a.name ?? 'Alert',
          message: a.message ?? '',
          type: SEVERITY_TO_TYPE[sev] ?? 'info',
          category: (KNOWN_CATEGORIES.includes(cat as Alert['category']) ? cat : 'threshold') as Alert['category'],
          timestamp: a.lastTriggeredAt ?? '',
          read: !(a.isEnabled ?? true),
          actionRequired: sev === 'critical' || sev === 'high',
          relatedTo: a.conditionType ?? (a.thresholdValue != null ? String(a.thresholdValue) : '-'),
          priority: sev === 'critical' || sev === 'high' ? 'high' : sev === 'warning' || sev === 'medium' ? 'medium' : 'low',
        }
      })
      setAlerts(mapped)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const handleCreateAlert = async (data: any) => {
    try {
      await FinanceService.createAlert(data)
      await loadAlerts()
    } catch (e) {
      console.error('Failed to create alert', e)
    }
  }

  const handleToggleAlert = async (id: string, isEnabled: boolean) => {
    try {
      await FinanceService.updateAlert(id, { isEnabled })
      await loadAlerts()
    } catch (e) {
      console.error('Failed to update alert', e)
    }
  }

  const handleDeleteAlert = async (id: string) => {
    try {
      await FinanceService.deleteAlert(id)
      await loadAlerts()
    } catch (e) {
      console.error('Failed to delete alert', e)
    }
  }

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([])

  // Map a single backend channel ('email' | 'sms' | 'in-app') to the page's
  // channel union ('email' | 'sms' | 'in_app').
  const mapChannel = (channel: string): NotificationRule['channels'][number] => {
    switch (channel) {
      case 'sms':
        return 'sms'
      case 'in-app':
      case 'in_app':
        return 'in_app'
      default:
        return 'email'
    }
  }

  const mapRule = (dto: NotificationRuleDto): NotificationRule => ({
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    trigger: dto.eventType,
    condition: dto.conditions ? JSON.stringify(dto.conditions) : '—',
    recipients: dto.recipients ?? [],
    channels: [mapChannel(dto.channel)],
    status: dto.isActive ? 'active' : 'paused',
    frequency: 'Event-driven'
  })

  const loadNotificationRules = async () => {
    try {
      const data = await ItAdminService.getNotificationRules()
      setNotificationRules((data ?? []).map(mapRule))
    } catch (e) {
      console.error('Failed to load notification rules', e)
      setNotificationRules([])
    }
  }

  useEffect(() => {
    loadNotificationRules()
  }, [])

  const handleCreateRule = async () => {
    try {
      await ItAdminService.createNotificationRule({
        companyId: 'default-company-id',
        name: 'New Notification Rule',
        eventType: 'invoice.overdue',
        channel: 'email',
        recipients: [],
        isActive: true
      })
      await loadNotificationRules()
    } catch (e) {
      console.error('Failed to create notification rule', e)
    }
  }

  const handleToggleRule = async (rule: NotificationRule) => {
    try {
      await ItAdminService.updateNotificationRule(rule.id, {
        name: rule.name,
        isActive: rule.status !== 'active'
      })
      await loadNotificationRules()
    } catch (e) {
      console.error('Failed to update notification rule', e)
    }
  }

  const handleDeleteRule = async (rule: NotificationRule) => {
    try {
      await ItAdminService.deleteNotificationRule(rule.id)
      await loadNotificationRules()
    } catch (e) {
      console.error('Failed to delete notification rule', e)
    }
  }

  // "Test" has no backend counterpart; client-side no-op with a descriptive
  // title rather than a faked send.
  const handleTestRule = (rule: NotificationRule) => {
    console.info(`Test dispatch is not available for rule "${rule.name}".`)
  }

  const stats = {
    totalAlerts: alerts.length,
    unreadAlerts: alerts.filter((a) => !a.read).length,
    criticalAlerts: alerts.filter((a) => a.type === 'critical').length,
    actionRequired: alerts.filter((a) => a.actionRequired).length,
    activeRules: notificationRules.filter((r) => r.status === 'active').length,
    alertsToday: alerts.length,
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning': return <Bell className="h-5 w-5 text-yellow-600" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      default: return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment': return 'bg-red-100 text-red-700'
      case 'approval': return 'bg-purple-100 text-purple-700'
      case 'budget': return 'bg-orange-100 text-orange-700'
      case 'compliance': return 'bg-blue-100 text-blue-700'
      case 'reconciliation': return 'bg-green-100 text-green-700'
      case 'threshold': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
            <p className="text-gray-600 mt-1">Smart notification system for financial events</p>
          </div>
          <button
            onClick={() => handleCreateAlert({ companyId: 'default-company-id', name: 'New Alert', isEnabled: true })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700"
          >
            <Settings className="h-5 w-5" />
            Configure Rules
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading alerts…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-6 w-6 text-rose-600" />
              <span className="text-sm text-gray-600">Total Alerts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-600">Unread</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.unreadAlerts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <span className="text-sm text-gray-600">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="text-sm text-gray-600">Action Required</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.actionRequired}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-600">Active Rules</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.alertsToday}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
            {!loading && alerts.length === 0 && (
              <p className="text-sm text-gray-500">No alerts found.</p>
            )}
            {alerts.map((alert) => (
              <div key={alert.id} className={`rounded-xl shadow-sm border-2 p-5 ${getAlertColor(alert.type)} ${!alert.read ? 'ring-2 ring-offset-2 ring-rose-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-xs text-gray-600">{alert.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(alert.category)}`}>
                      {alert.category.toUpperCase()}
                    </span>
                    {alert.actionRequired && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        ACTION
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Related to: <span className="font-mono font-semibold">{alert.relatedTo}</span></span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-white"
                    >
                      Dismiss
                    </button>
                    {alert.actionRequired && (
                      <button
                        onClick={() => handleToggleAlert(alert.id, alert.read)}
                        className="px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Notification Rules</h2>
              <button
                onClick={handleCreateRule}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white"
              >
                New Rule
              </button>
            </div>
            {notificationRules.length === 0 && (
              <p className="text-sm text-gray-500">No notification rules configured.</p>
            )}
            {notificationRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rule.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Trigger:</span>
                      <span className="text-gray-900 ml-1">{rule.trigger}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Condition:</span>
                      <span className="text-gray-900 ml-1">{rule.condition}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Channels:</p>
                    <div className="flex gap-2">
                      {rule.channels.map((channel) => (
                        <span key={channel} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {channel === 'email' && <Mail className="h-3 w-3" />}
                          {channel === 'sms' && <MessageSquare className="h-3 w-3" />}
                          {channel === 'in_app' && <Bell className="h-3 w-3" />}
                          {channel.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Recipients: {rule.recipients.length}</p>
                    <div className="flex flex-wrap gap-1">
                      {rule.recipients.map((recipient, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    {rule.status === 'active' ? 'Pause Rule' : 'Activate Rule'}
                  </button>
                  <button
                    onClick={() => handleTestRule(rule)}
                    title="Test dispatch is not available for this rule"
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-sm p-3 text-white">
          <h3 className="text-lg font-semibold mb-2">Notification Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Event-Based Triggers</h4>
              <ul className="space-y-1 text-sm">
                <li>• Payment due date reminders</li>
                <li>• Budget threshold violations</li>
                <li>• Approval workflow alerts</li>
                <li>• Compliance deadline reminders</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Multi-Channel Delivery</h4>
              <ul className="space-y-1 text-sm">
                <li>• In-app notifications</li>
                <li>• Email alerts with attachments</li>
                <li>• SMS for critical alerts</li>
                <li>• Mobile push notifications</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Smart Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Role-based notification routing</li>
                <li>• Escalation workflows</li>
                <li>• Digest mode for batch alerts</li>
                <li>• Custom notification templates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
