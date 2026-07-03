'use client'

import { useState, useEffect } from 'react'
import {
  GitBranch,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  AlertCircle,
  Activity,
  Database,
  Users,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  Play,
  Pause,
  Loader2
} from 'lucide-react'
import { cpqIntegrationSyncLogService } from '@/services/cpq/cpq-orphans.service'

export default function CPQIntegrationCRMPage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'overview' | 'mapping' | 'logs' | 'settings'>('overview')

  // Integration Status
  const [integrationStatus, setIntegrationStatus] = useState({
    connected: true,
    crmSystem: 'Salesforce',
    lastSync: '2025-10-20 14:30:00',
    syncFrequency: 'Real-time',
    totalRecordsSynced: 12547,
    failedRecords: 12,
    apiCallsToday: 2840,
    apiLimit: 15000
  })

  // Data Flow
  const dataFlows = [
    {
      id: 1,
      name: 'Lead to Quote',
      source: 'CRM Leads',
      destination: 'CPQ Quotes',
      status: 'active',
      direction: 'bidirectional',
      recordsToday: 45,
      lastRun: '2 minutes ago',
      success: true
    },
    {
      id: 2,
      name: 'Opportunity Sync',
      source: 'CRM Opportunities',
      destination: 'CPQ Opportunities',
      status: 'active',
      direction: 'bidirectional',
      recordsToday: 32,
      lastRun: '5 minutes ago',
      success: true
    },
    {
      id: 3,
      name: 'Contact Sync',
      source: 'CRM Contacts',
      destination: 'CPQ Customers',
      status: 'active',
      direction: 'pull',
      recordsToday: 128,
      lastRun: '10 minutes ago',
      success: true
    },
    {
      id: 4,
      name: 'Account Sync',
      source: 'CRM Accounts',
      destination: 'CPQ Companies',
      status: 'active',
      direction: 'pull',
      recordsToday: 18,
      lastRun: '15 minutes ago',
      success: true
    },
    {
      id: 5,
      name: 'Quote Status Update',
      source: 'CPQ Quotes',
      destination: 'CRM Opportunities',
      status: 'active',
      direction: 'push',
      recordsToday: 67,
      lastRun: '1 minute ago',
      success: false
    }
  ]

  // Field Mapping
  const fieldMappings = [
    { crmField: 'Account.Name', cpqField: 'Company.Name', type: 'Text', mapped: true, direction: 'pull' },
    { crmField: 'Account.Industry', cpqField: 'Company.Industry', type: 'Picklist', mapped: true, direction: 'pull' },
    { crmField: 'Contact.Email', cpqField: 'Customer.Email', type: 'Email', mapped: true, direction: 'pull' },
    { crmField: 'Contact.Phone', cpqField: 'Customer.Phone', type: 'Phone', mapped: true, direction: 'pull' },
    { crmField: 'Opportunity.Name', cpqField: 'Quote.Title', type: 'Text', mapped: true, direction: 'bidirectional' },
    { crmField: 'Opportunity.Amount', cpqField: 'Quote.TotalValue', type: 'Currency', mapped: true, direction: 'bidirectional' },
    { crmField: 'Opportunity.CloseDate', cpqField: 'Quote.ValidUntil', type: 'Date', mapped: true, direction: 'bidirectional' },
    { crmField: 'Opportunity.Stage', cpqField: 'Quote.Status', type: 'Picklist', mapped: true, direction: 'bidirectional' },
    { crmField: 'Lead.Email', cpqField: 'Quote.CustomerEmail', type: 'Email', mapped: true, direction: 'pull' },
    { crmField: 'Lead.Status', cpqField: 'Quote.LeadStatus', type: 'Picklist', mapped: true, direction: 'push' }
  ]

  // Sync Logs
  const [syncLogs, setSyncLogs] = useState<{
    id: string
    timestamp: string
    operation: string
    records: number
    status: string
    duration: string
    message: string
  }[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [logsError, setLogsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLogsLoading(true)
    setLogsError(null)
    cpqIntegrationSyncLogService
      .findAll()
      .then((rows) => {
        if (!active) return
        const mapped = (rows || []).map((r) => ({
          id: r.id,
          timestamp: r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
          operation: r.operation ?? '',
          records: Number(r.records) || 0,
          status: r.status ?? 'success',
          duration: r.duration ?? '',
          message: r.message ?? ''
        }))
        setSyncLogs(mapped)
      })
      .catch((err: any) => {
        if (!active) return
        setLogsError(err?.message || 'Failed to load sync logs')
      })
      .finally(() => {
        if (active) setLogsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleManualSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }, 2000)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Integration</h2>
          <p className="text-sm text-gray-600 mt-1">Connect CPQ with your CRM system for seamless data flow</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={syncStatus === 'syncing'}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
              syncStatus === 'syncing'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Now
              </>
            )}
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-green-600">Connection Status</p>
              {integrationStatus.connected ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-green-900">
              {integrationStatus.connected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-xs text-green-700 mt-1">CRM: {integrationStatus.crmSystem}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-600">Last Sync</p>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-900">2 min ago</p>
            <p className="text-xs text-blue-700 mt-1">Mode: {integrationStatus.syncFrequency}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-purple-600">Records Synced</p>
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">{integrationStatus.totalRecordsSynced.toLocaleString()}</p>
            <p className="text-xs text-purple-700 mt-1">Failed: {integrationStatus.failedRecords}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-orange-600">API Usage</p>
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{integrationStatus.apiCallsToday}</p>
            <div className="mt-2 bg-orange-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-600 h-full"
                style={{ width: `${(integrationStatus.apiCallsToday / integrationStatus.apiLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-orange-700 mt-1">Limit: {integrationStatus.apiLimit}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 border-b border-gray-200">
        <div className="flex gap-3">
          {['overview', 'mapping', 'logs', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Data Flows */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Data Flows</h3>
                <p className="text-sm text-gray-600">Active synchronization flows</p>
              </div>
            </div>

            <div className="space-y-3">
              {dataFlows.map((flow) => (
                <div key={flow.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${flow.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium text-gray-900">{flow.name}</p>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            flow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {flow.status}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                            {flow.recordsToday} records today
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{flow.source}</span>
                          {flow.direction === 'bidirectional' ? (
                            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                          ) : flow.direction === 'pull' ? (
                            <ArrowRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="font-medium">{flow.destination}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs">Last run: {flow.lastRun}</span>
                        </div>
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
                        aria-label="Settings"
                       
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      {flow.status === 'active' ? (
                        <button
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          aria-label="Pause"
                         
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          aria-label="Play"
                         
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowLeftRight className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Field Mapping</h3>
              <p className="text-sm text-gray-600">Map CRM fields to CPQ fields</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CRM Field</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Direction</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPQ Field</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {fieldMappings.map((mapping, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">{mapping.crmField}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {mapping.direction === 'bidirectional' ? (
                        <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                      ) : mapping.direction === 'pull' ? (
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-orange-600" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-purple-600">{mapping.cpqField}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                        {mapping.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {mapping.mapped ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sync Logs</h3>
              <p className="text-sm text-gray-600">Recent synchronization activity</p>
            </div>
          </div>

          {logsLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading sync logs...
            </div>
          )}
          {!logsLoading && logsError && (
            <div className="flex items-center gap-2 text-sm text-red-600 py-4">
              <XCircle className="h-4 w-4" />
              {logsError}
            </div>
          )}
          {!logsLoading && !logsError && syncLogs.length === 0 && (
            <div className="text-sm text-gray-500 py-4">No sync activity yet</div>
          )}

          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {log.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-gray-900">{log.operation}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {log.records} records
                        </span>
                        <span className="text-xs text-gray-500">{log.duration}</span>
                      </div>
                      <p className="text-sm text-gray-600">{log.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Integration Settings</h3>
              <p className="text-sm text-gray-600">Configure CRM integration parameters</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CRM System</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="salesforce">Salesforce</option>
                <option value="dynamics">Microsoft Dynamics 365</option>
                <option value="hubspot">HubSpot</option>
                <option value="zoho">Zoho CRM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="realtime">Real-time</option>
                <option value="5min">Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
              <input
                type="url"
                defaultValue="https://api.salesforce.com/v52.0/"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                defaultValue="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Enable automatic retry on failure</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Send email notifications on sync errors</label>
            </div>

            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">CRM Integration Benefits</p>
          <p className="text-sm text-blue-700 mt-1">
            Seamless synchronization between CRM and CPQ ensures data consistency, reduces manual entry, and provides real-time visibility across sales processes.
          </p>
        </div>
      </div>
    </div>
  )
}
