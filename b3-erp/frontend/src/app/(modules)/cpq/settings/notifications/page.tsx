'use client'

import { useEffect, useState } from 'react'
import { cpqNotificationSettingService } from '@/services/cpq/cpq-orphans.service'
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Save,
  Eye,
  Edit,
  Trash2,
  Plus,
  Send,
  Settings
} from 'lucide-react'

export default function CPQSettingsNotificationsPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: 'Quote Created',
      subject: 'Your Quote #{{quote_number}} is Ready',
      recipient: 'Customer',
      trigger: 'Quote Creation',
      active: true,
      body: 'Dear {{customer_name}},\n\nThank you for your interest. Please find your quote attached.\n\nQuote Number: {{quote_number}}\nTotal Value: {{quote_value}}\nValid Until: {{valid_until}}\n\nBest regards,\n{{sales_rep_name}}'
    },
    {
      id: 2,
      name: 'Approval Required',
      subject: 'Quote #{{quote_number}} Requires Your Approval',
      recipient: 'Approver',
      trigger: 'Approval Request',
      active: true,
      body: 'Hello {{approver_name}},\n\nQuote #{{quote_number}} requires your approval.\n\nCustomer: {{customer_name}}\nValue: {{quote_value}}\nDiscount: {{discount_percent}}%\nReason: {{approval_reason}}\n\nPlease review and approve/reject.'
    },
    {
      id: 3,
      name: 'Quote Approved',
      subject: 'Quote #{{quote_number}} Approved',
      recipient: 'Sales Rep',
      trigger: 'Quote Approval',
      active: true,
      body: 'Hi {{sales_rep_name}},\n\nQuote #{{quote_number}} has been approved by {{approver_name}}.\n\nYou can now proceed with sending it to the customer.\n\nApproval Notes: {{approval_notes}}'
    },
    {
      id: 4,
      name: 'Quote Rejected',
      subject: 'Quote #{{quote_number}} Rejected',
      recipient: 'Sales Rep',
      trigger: 'Quote Rejection',
      active: true,
      body: 'Hi {{sales_rep_name}},\n\nQuote #{{quote_number}} was rejected by {{approver_name}}.\n\nReason: {{rejection_reason}}\n\nPlease revise and resubmit.'
    },
    {
      id: 5,
      name: 'Quote Expiring Soon',
      subject: 'Reminder: Quote #{{quote_number}} Expiring in {{days_left}} Days',
      recipient: 'Customer',
      trigger: 'Expiry Reminder',
      active: true,
      body: 'Dear {{customer_name}},\n\nThis is a reminder that your quote #{{quote_number}} will expire in {{days_left}} days.\n\nPlease contact us if you need an extension or have any questions.'
    },
    {
      id: 6,
      name: 'SLA Breach Warning',
      subject: 'SLA Alert: Quote #{{quote_number}} Pending Response',
      recipient: 'Sales Manager',
      trigger: 'SLA Breach',
      active: true,
      body: 'Alert: Quote #{{quote_number}} has exceeded SLA threshold.\n\nTime Pending: {{hours_pending}} hours\nSLA Target: {{sla_target}} hours\nAssigned To: {{sales_rep_name}}\n\nImmediate action required.'
    }
  ])

  useEffect(() => {
    let active = true
    cpqNotificationSettingService
      .findAll('email-template')
      .then((rows) => {
        if (!active) return
        if (!Array.isArray(rows) || rows.length === 0) return
        const cfg = (r: any) => (r.config ?? {}) as any
        const mapped = rows.map((r, idx) => ({
          id: idx + 1,
          name: r.name ?? '',
          subject: r.subject ?? '',
          recipient: cfg(r).recipient ?? '',
          trigger: cfg(r).trigger ?? '',
          active: r.enabled !== false,
          body: cfg(r).body ?? ''
        }))
        setEmailTemplates(mapped as any)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    quoteCreated: { email: true, inApp: true, sms: false },
    quoteApproved: { email: true, inApp: true, sms: false },
    quoteRejected: { email: true, inApp: true, sms: true },
    approvalRequired: { email: true, inApp: true, sms: true },
    quoteExpiring: { email: true, inApp: false, sms: false },
    slaBreach: { email: true, inApp: true, sms: true },
    quoteSent: { email: true, inApp: true, sms: false },
    quoteViewed: { email: false, inApp: true, sms: false },
    quoteAccepted: { email: true, inApp: true, sms: true },
    contractSigned: { email: true, inApp: true, sms: true }
  })

  // Escalation Rules
  const [escalationRules, setEscalationRules] = useState([
    {
      id: 1,
      trigger: 'Quote Pending Approval',
      threshold: 4,
      unit: 'hours',
      escalateTo: 'Sales Manager',
      action: 'Email + SMS',
      active: true
    },
    {
      id: 2,
      trigger: 'Customer No Response',
      threshold: 3,
      unit: 'days',
      escalateTo: 'Sales Rep',
      action: 'Email',
      active: true
    },
    {
      id: 3,
      trigger: 'High Value Quote Pending',
      threshold: 2,
      unit: 'hours',
      escalateTo: 'VP Sales',
      action: 'Email + In-App',
      active: true
    },
    {
      id: 4,
      trigger: 'Quote Expiring Unactioned',
      threshold: 2,
      unit: 'days',
      escalateTo: 'Sales Manager',
      action: 'Email',
      active: true
    }
  ])

  // Alert Thresholds
  const [alertThresholds, setAlertThresholds] = useState({
    approvalDelayHours: 4,
    responseDelayDays: 3,
    expiryWarningDays: 7,
    highValueQuote: 1000000,
    highDiscountPercent: 20,
    slaBreachHours: 24
  })

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('success')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const toggleNotification = (event: string, channel: 'email' | 'inApp' | 'sms') => {
    setNotificationSettings({
      ...notificationSettings,
      [event]: {
        ...notificationSettings[event as keyof typeof notificationSettings],
        [channel]: !notificationSettings[event as keyof typeof notificationSettings][channel]
      }
    })
    setHasChanges(true)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure email templates, alerts, and escalation rules</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Test
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
              hasChanges && saveStatus !== 'saving'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {saveStatus === 'success' && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Notification settings saved successfully!</p>
        </div>
      )}

      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Templates</h3>
              <p className="text-sm text-gray-600">Customize notification email templates</p>
            </div>
          </div>
          <button className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        <div className="space-y-3">
          {emailTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 cursor-pointer"
              onClick={() => setSelectedTemplate(selectedTemplate === template.id.toString() ? null : template.id.toString())}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-2 h-2 rounded-full ${template.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                        {template.trigger}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                        To: {template.recipient}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    aria-label="View"
                   
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    aria-label="Edit"
                   
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete"
                   
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {selectedTemplate === template.id.toString() && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email Body:</label>
                  <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 whitespace-pre-wrap">
                    {template.body}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Notification Channels</h3>
            <p className="text-sm text-gray-600">Choose how you want to be notified for each event</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Event</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">Email</span>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  <Bell className="h-4 w-4" />
                  <span className="text-xs">In-App</span>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">SMS</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(notificationSettings).map(([event, channels]) => (
                <tr key={event} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 capitalize">
                      {event.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={() => toggleNotification(event, 'email')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={() => toggleNotification(event, 'inApp')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={() => toggleNotification(event, 'sms')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Escalation Rules</h3>
              <p className="text-sm text-gray-600">Automatic escalation for delayed actions</p>
            </div>
          </div>
          <button className="px-4 py-2 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trigger</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Threshold</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Escalate To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {escalationRules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{rule.trigger}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-orange-600 font-bold">
                      {rule.threshold} {rule.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900">{rule.escalateTo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        aria-label="Edit"
                       
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        aria-label="Delete"
                       
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Clock className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Alert Thresholds</h3>
            <p className="text-sm text-gray-600">Configure when alerts should be triggered</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approval Delay (Hours)</label>
            <input
              type="number"
              value={alertThresholds.approvalDelayHours}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, approvalDelayHours: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Delay (Days)</label>
            <input
              type="number"
              value={alertThresholds.responseDelayDays}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, responseDelayDays: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Warning (Days)</label>
            <input
              type="number"
              value={alertThresholds.expiryWarningDays}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, expiryWarningDays: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">High Value Quote (₹)</label>
            <input
              type="number"
              value={alertThresholds.highValueQuote}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, highValueQuote: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">High Discount (%)</label>
            <input
              type="number"
              value={alertThresholds.highDiscountPercent}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, highDiscountPercent: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SLA Breach (Hours)</label>
            <input
              type="number"
              value={alertThresholds.slaBreachHours}
              onChange={(e) => {
                setAlertThresholds({ ...alertThresholds, slaBreachHours: parseInt(e.target.value) })
                setHasChanges(true)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
