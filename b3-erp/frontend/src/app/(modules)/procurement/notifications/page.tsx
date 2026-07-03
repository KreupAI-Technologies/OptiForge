'use client'

import React, { useState, useEffect } from 'react'
import {
  Bell, BellOff, Settings, Filter, Search, Check, X, Clock, AlertTriangle,
  CheckCircle, XCircle, Info, Package, ShoppingCart, FileText, DollarSign,
  Users, Calendar, TrendingUp, Mail, MessageSquare, Trash2, Archive,
  ChevronDown, ChevronRight, Eye, Star, Volume2, VolumeX, Smartphone,
  Monitor, Mail as MailIcon, RefreshCw, Download
} from 'lucide-react'
import {
  procurementOperationsService,
  ProcurementNotification,
} from '@/services/procurement-operations.service'

interface UINotification {
  id: string
  type: string
  priority: string
  title: string
  message: string
  timestamp: string
  read: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
  action: string
}

const NOTIFICATION_TYPE_MAP: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  order: { icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
  delivery: { icon: Package, color: 'text-green-600 bg-green-100' },
  alert: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
  approval: { icon: Clock, color: 'text-red-600 bg-red-100' },
  vendor: { icon: Users, color: 'text-purple-600 bg-purple-100' },
  contract: { icon: FileText, color: 'text-indigo-600 bg-indigo-100' },
  info: { icon: Info, color: 'text-gray-600 bg-gray-100' },
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function transformNotification(n: ProcurementNotification): UINotification {
  const meta = NOTIFICATION_TYPE_MAP[n.type] || NOTIFICATION_TYPE_MAP.info
  return {
    id: n.id,
    type: n.type || 'info',
    priority: n.priority || 'medium',
    title: n.title || 'Notification',
    message: n.message || '',
    timestamp: timeAgo(n.createdAt),
    read: !!n.read,
    icon: meta.icon,
    color: meta.color,
    action: n.action || '',
  }
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('all')

  // Notification Data (loaded from backend)
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const rows = await procurementOperationsService.getNotifications()
        if (mounted) {
          setNotifications(
            (Array.isArray(rows) ? rows : []).map(transformNotification),
          )
        }
      } catch (e) {
        if (mounted) {
          setError('Unable to load notifications.')
          setNotifications([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // Notification Preferences
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
    categories: {
      orders: true,
      deliveries: true,
      approvals: true,
      budget: true,
      vendors: false,
      contracts: true,
      payments: true,
      quality: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  })

  // Alert Rules
  const alertRules = [
    {
      id: 1,
      name: 'High Value PO Alert',
      description: 'Notify when PO value exceeds $100,000',
      enabled: true,
      channel: ['email', 'push'],
      condition: 'PO Value > $100,000',
    },
    {
      id: 2,
      name: 'Budget Threshold',
      description: 'Alert when department budget reaches 80%',
      enabled: true,
      channel: ['email', 'desktop'],
      condition: 'Budget Utilization > 80%',
    },
    {
      id: 3,
      name: 'Delivery Delay',
      description: 'Notify if delivery is delayed by more than 2 days',
      enabled: false,
      channel: ['sms', 'email'],
      condition: 'Delivery Delay > 2 days',
    },
    {
      id: 4,
      name: 'Contract Expiry',
      description: 'Remind 30 days before contract expiration',
      enabled: true,
      channel: ['email'],
      condition: 'Contract Expiry < 30 days',
    },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'starred') return false // Would need starred field
    if (filter !== 'all') return n.type === filter
    return true
  })

  const markAsRead = (id: string) => {
    console.log('Marking as read:', id)
  }

  const markAllAsRead = () => {
    console.log('Marking all as read')
  }

  const deleteNotification = (id: string) => {
    console.log('Deleting notification:', id)
  }

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div
      className={`flex items-start gap-2 p-3 border-b hover:bg-gray-50 cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={selectedNotifications.includes(notification.id)}
        onChange={() => toggleNotificationSelection(notification.id)}
        className="mt-1"
      />
      <div className={`p-2 rounded-lg ${notification.color}`}>
        <notification.icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{notification.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">{notification.timestamp}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                notification.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                notification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {notification.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {notification.action}
            </button>
            <button
              onClick={() => markAsRead(notification.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {notification.read ? <Eye className="h-4 w-4 text-gray-400" /> : <Check className="h-4 w-4 text-green-600" />}
            </button>
            <button
              onClick={() => deleteNotification(notification.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Trash2 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notification Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Delivery Channels */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Delivery Channels</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MailIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive notifications via email</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) => setPreferences({...preferences, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-500">Browser push notifications</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) => setPreferences({...preferences, push: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-500">Text message alerts for critical updates</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sms}
                    onChange={(e) => setPreferences({...preferences, sms: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Desktop Notifications</div>
                    <div className="text-sm text-gray-500">Native desktop alerts</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.desktop}
                    onChange={(e) => setPreferences({...preferences, desktop: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Categories */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Notification Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(preferences.categories).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="capitalize">{category}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        categories: {...preferences.categories, [category]: e.target.checked}
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Quiet Hours</h3>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">Enable Quiet Hours</div>
                  <div className="text-sm text-gray-500">Mute notifications during specified hours</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      quietHours: {...preferences.quietHours, enabled: e.target.checked}
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quietHours: {...preferences.quietHours, start: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quietHours: {...preferences.quietHours, end: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Settings
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-8 w-8 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-gray-600 mt-1">Manage alerts and notifications</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Refresh</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Download</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Unread</span>
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Urgent</span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.priority === 'urgent').length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Today</span>
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.timestamp.includes('hour') || n.timestamp.includes('minute')).length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Rules</span>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {alertRules.filter(r => r.enabled).length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs and Actions */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  {['all', 'unread', 'starred'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        activeTab === tab
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {selectedNotifications.length > 0 && (
                    <>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
                        <Archive className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Archive</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="order">Orders</option>
                  <option value="delivery">Deliveries</option>
                  <option value="approval">Approvals</option>
                  <option value="alert">Alerts</option>
                  <option value="vendor">Vendors</option>
                  <option value="contract">Contracts</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4 py-1.5 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        </div>

        {/* Alert Rules */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-lg font-semibold mb-2">Alert Rules</h3>
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">Condition: {rule.condition}</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {rule.channel.map((ch) => (
                      <span key={ch} className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400">
              + Add New Rule
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellOff className="h-5 w-5 text-gray-600" />
                  <span>Mute All Notifications</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-gray-600" />
                  <span>Archive Old Notifications</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-gray-600" />
                  <span>Export Notifications</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsPanel />}
    </div>
  )
}