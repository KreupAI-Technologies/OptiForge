'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Cloud, Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity, Download, Upload, Settings, Shield, Key, Globe, Server, FileText, Calendar, Clock, Play, Pause, Eye, Plus, X, Filter, Zap, ArrowRight, ArrowLeft, Code, Terminal, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar, ScatterChart, Scatter } from 'recharts';
import { FinanceService, FinanceIntegration } from '@/services/finance.service';

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'banking' | 'payment' | 'tax' | 'accounting' | 'crm' | 'analytics' | 'custom';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'maintenance';
  connectionType: 'api' | 'sftp' | 'database' | 'webhook' | 'file' | 'manual';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
  lastSync: string;
  nextSync?: string;
  dataFlow: 'inbound' | 'outbound' | 'bidirectional';
  version: string;
  endpoint?: string;
}

interface DataMapping {
  id: string;
  integrationId: string;
  sourceName: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  dataType: string;
  defaultValue?: string;
  validation?: string;
}

interface SyncJob {
  id: string;
  integrationId: string;
  jobType: 'full' | 'incremental' | 'delta' | 'manual';
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'queued';
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  duration?: number;
}

interface APIEndpoint {
  id: string;
  integrationId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authentication: 'oauth2' | 'apikey' | 'basic' | 'token' | 'none';
  rateLimit: number;
  timeout: number;
  retryAttempts: number;
  active: boolean;
}

interface WebhookConfig {
  id: string;
  integrationId: string;
  event: string;
  url: string;
  method: 'POST' | 'PUT';
  headers?: any;
  active: boolean;
  retryPolicy: string;
  lastTriggered?: string;
  successRate: number;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  source: string;
  userId?: string;
}

interface DataTransfer {
  id: string;
  integrationId: string;
  direction: 'import' | 'export';
  entityType: string;
  recordCount: number;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: string;
  completionTime?: string;
  errorCount: number;
}

const FinancialIntegrations = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);

  // Integration configs / status — fetched from the finance backend.
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    FinanceService.getIntegrations()
      .then((rows: FinanceIntegration[]) => {
        if (!active) return;
        const mapped: Integration[] = rows.map((r) => ({
          id: r.id,
          name: r.name,
          type: (r.type as Integration['type']) || 'custom',
          provider: r.provider || '',
          status: (r.status as Integration['status']) || 'inactive',
          connectionType: ((r.connectionType ?? r.connection_type) as Integration['connectionType']) || 'api',
          frequency: (r.frequency as Integration['frequency']) || 'manual',
          lastSync: r.lastSync ?? r.last_sync ?? '',
          nextSync: r.nextSync ?? r.next_sync ?? undefined,
          dataFlow: ((r.dataFlow ?? r.data_flow) as Integration['dataFlow']) || 'inbound',
          version: r.version || '',
          endpoint: r.endpoint || undefined,
        }));
        setIntegrations(mapped);
      })
      .catch((e) => {
        if (active) setError(e?.message || 'Failed to load integrations');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dataMappings: DataMapping[] = [
    { id: 'MAP001', integrationId: 'INT001', sourceName: 'SAP', sourceField: 'CUSTOMER_ID', targetField: 'customerId', required: true, dataType: 'string' },
    { id: 'MAP002', integrationId: 'INT001', sourceName: 'SAP', sourceField: 'INVOICE_AMT', targetField: 'invoiceAmount', transformation: 'currency', required: true, dataType: 'number' },
    { id: 'MAP003', integrationId: 'INT002', sourceName: 'Bank', sourceField: 'transaction_id', targetField: 'transactionId', required: true, dataType: 'string' },
    { id: 'MAP004', integrationId: 'INT002', sourceName: 'Bank', sourceField: 'amount', targetField: 'amount', transformation: 'decimal(2)', required: true, dataType: 'number' },
    { id: 'MAP005', integrationId: 'INT003', sourceName: 'Stripe', sourceField: 'charge_id', targetField: 'paymentId', required: true, dataType: 'string' },
    { id: 'MAP006', integrationId: 'INT004', sourceName: 'QuickBooks', sourceField: 'Invoice.Id', targetField: 'invoiceId', required: true, dataType: 'string' }
  ];

  const syncJobs: SyncJob[] = [
    { id: 'JOB001', integrationId: 'INT001', jobType: 'incremental', status: 'completed', startTime: '2024-03-26 14:00:00', endTime: '2024-03-26 14:30:00', recordsProcessed: 1250, recordsFailed: 0, duration: 1800 },
    { id: 'JOB002', integrationId: 'INT002', jobType: 'full', status: 'completed', startTime: '2024-03-26 06:00:00', endTime: '2024-03-26 06:15:00', recordsProcessed: 5000, recordsFailed: 2, duration: 900 },
    { id: 'JOB003', integrationId: 'INT003', jobType: 'delta', status: 'running', startTime: '2024-03-26 15:45:00', recordsProcessed: 150, recordsFailed: 0 },
    { id: 'JOB004', integrationId: 'INT004', jobType: 'incremental', status: 'completed', startTime: '2024-03-26 15:00:00', endTime: '2024-03-26 15:05:00', recordsProcessed: 350, recordsFailed: 0, duration: 300 },
    { id: 'JOB005', integrationId: 'INT005', jobType: 'full', status: 'failed', startTime: '2024-03-25 06:00:00', endTime: '2024-03-25 06:02:00', recordsProcessed: 0, recordsFailed: 0, errorMessage: 'Authentication failed', duration: 120 }
  ];

  const apiEndpoints: APIEndpoint[] = [
    { id: 'API001', integrationId: 'INT001', method: 'GET', path: '/customers', description: 'Fetch customer data', authentication: 'oauth2', rateLimit: 100, timeout: 30000, retryAttempts: 3, active: true },
    { id: 'API002', integrationId: 'INT001', method: 'POST', path: '/invoices', description: 'Create invoice', authentication: 'oauth2', rateLimit: 50, timeout: 30000, retryAttempts: 3, active: true },
    { id: 'API003', integrationId: 'INT002', method: 'GET', path: '/transactions', description: 'Get bank transactions', authentication: 'apikey', rateLimit: 60, timeout: 20000, retryAttempts: 2, active: true },
    { id: 'API004', integrationId: 'INT003', method: 'POST', path: '/charges', description: 'Process payment', authentication: 'token', rateLimit: 100, timeout: 10000, retryAttempts: 1, active: true },
    { id: 'API005', integrationId: 'INT004', method: 'GET', path: '/company/invoices', description: 'Sync invoices', authentication: 'oauth2', rateLimit: 30, timeout: 45000, retryAttempts: 3, active: true }
  ];

  const webhookConfigs: WebhookConfig[] = [
    { id: 'WH001', integrationId: 'INT003', event: 'payment.succeeded', url: 'https://erp.company.com/webhooks/stripe', method: 'POST', active: true, retryPolicy: '3 attempts with exponential backoff', lastTriggered: '2024-03-26 15:45:00', successRate: 99.5 },
    { id: 'WH002', integrationId: 'INT003', event: 'payment.failed', url: 'https://erp.company.com/webhooks/stripe', method: 'POST', active: true, retryPolicy: '3 attempts with exponential backoff', lastTriggered: '2024-03-26 14:30:00', successRate: 100 },
    { id: 'WH003', integrationId: 'INT006', event: 'opportunity.updated', url: 'https://erp.company.com/webhooks/salesforce', method: 'POST', active: true, retryPolicy: '5 attempts with linear backoff', lastTriggered: '2024-03-26 15:50:00', successRate: 98.2 }
  ];

  const integrationLogs: IntegrationLog[] = [
    { id: 'LOG001', integrationId: 'INT001', timestamp: '2024-03-26 14:30:00', level: 'info', message: 'Sync completed successfully', source: 'SyncService' },
    { id: 'LOG002', integrationId: 'INT005', timestamp: '2024-03-25 06:02:00', level: 'error', message: 'Authentication failed: Invalid API key', source: 'AuthService' },
    { id: 'LOG003', integrationId: 'INT002', timestamp: '2024-03-26 06:15:00', level: 'warning', message: '2 transactions failed validation', source: 'ValidationService' },
    { id: 'LOG004', integrationId: 'INT003', timestamp: '2024-03-26 15:45:00', level: 'info', message: 'Webhook received: payment.succeeded', source: 'WebhookHandler' },
    { id: 'LOG005', integrationId: 'INT004', timestamp: '2024-03-26 15:05:00', level: 'info', message: 'Incremental sync completed: 350 records', source: 'SyncService' }
  ];

  // Analytics data
  const syncMetrics = [
    { hour: '00:00', success: 12, failed: 1 },
    { hour: '04:00', success: 8, failed: 0 },
    { hour: '08:00', success: 25, failed: 2 },
    { hour: '12:00', success: 30, failed: 1 },
    { hour: '16:00', success: 28, failed: 3 },
    { hour: '20:00', success: 15, failed: 0 }
  ];

  const dataVolumeByIntegration = [
    { name: 'SAP', inbound: 45000, outbound: 32000 },
    { name: 'Banking', inbound: 25000, outbound: 0 },
    { name: 'Stripe', inbound: 18000, outbound: 0 },
    { name: 'QuickBooks', inbound: 12000, outbound: 8000 },
    { name: 'Salesforce', inbound: 15000, outbound: 10000 }
  ];

  const apiPerformance = [
    { endpoint: 'SAP', avgResponse: 250, p95Response: 450, availability: 99.9 },
    { endpoint: 'Banking', avgResponse: 180, p95Response: 320, availability: 99.5 },
    { endpoint: 'Stripe', avgResponse: 120, p95Response: 200, availability: 99.99 },
    { endpoint: 'QuickBooks', avgResponse: 350, p95Response: 600, availability: 98.5 },
    { endpoint: 'Salesforce', avgResponse: 200, p95Response: 380, availability: 99.7 }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'active').length}/{integrations.length}
              </p>
              <p className="text-xs text-gray-500">All systems</p>
            </div>
            <Link2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Synced Today</p>
              <p className="text-2xl font-bold text-gray-900">125K</p>
              <p className="text-xs text-gray-500">Records</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Calls</p>
              <p className="text-2xl font-bold text-gray-900">8,542</p>
              <p className="text-xs text-gray-500">Last 24h</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Sync Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={syncMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="success" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Data Volume by Integration</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataVolumeByIntegration}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(1)}K records`} />
              <Legend />
              <Bar dataKey="inbound" fill="#3B82F6" />
              <Bar dataKey="outbound" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Integration Status</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {integrations.slice(0, 6).map(integration => (
            <div key={integration.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    integration.status === 'active' ? 'bg-green-500' :
                    integration.status === 'error' ? 'bg-red-500' :
                    integration.status === 'inactive' ? 'bg-gray-500' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-xs text-gray-500">{integration.provider}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs capitalize ${
                  integration.status === 'active' ? 'bg-green-100 text-green-800' :
                  integration.status === 'error' ? 'bg-red-100 text-red-800' :
                  integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {integration.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{integration.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span>{integration.lastSync && !isNaN(new Date(integration.lastSync).getTime()) ? new Date(integration.lastSync).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="capitalize">{integration.frequency}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <button
                  onClick={() => setSelectedIntegration(integration)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details
                </button>
                <div className="flex space-x-2">
                  {integration.status === 'active' ? (
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Pause className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Pause</span>
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                      <Play className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Play</span>
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Recent Sync Jobs</h3>
          <div className="space-y-3">
            {syncJobs.slice(0, 5).map(job => {
              const integration = integrations.find(i => i.id === job.integrationId);
              return (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{integration?.name}</p>
                    <p className="text-xs text-gray-500">
                      {job.jobType} • {job.recordsProcessed} records • {job.startTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">API Performance</h3>
          <div className="space-y-3">
            {apiPerformance.map(api => (
              <div key={api.endpoint} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{api.endpoint}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    api.availability >= 99.5 ? 'bg-green-100 text-green-800' :
                    api.availability >= 98 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {api.availability}% uptime
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Avg Response:</span>
                    <span className="ml-1 font-semibold">{api.avgResponse}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">P95 Response:</span>
                    <span className="ml-1 font-semibold">{api.p95Response}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Integration Configurations</h3>
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="erp">ERP</option>
              <option value="banking">Banking</option>
              <option value="payment">Payment</option>
              <option value="accounting">Accounting</option>
              <option value="tax">Tax</option>
            </select>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Integration</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Connection</th>
                <th className="text-left py-2">Data Flow</th>
                <th className="text-left py-2">Frequency</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Last Sync</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations
                .filter(i => filterType === 'all' || i.type === filterType)
                .map(integration => (
                  <tr key={integration.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-xs text-gray-500">{integration.provider}</p>
                      </div>
                    </td>
                    <td className="py-2 capitalize">{integration.type}</td>
                    <td className="py-2">
                      <span className="text-sm uppercase">{integration.connectionType}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center">
                        {integration.dataFlow === 'inbound' && <ArrowLeft className="h-4 w-4 text-blue-500 mr-1" />}
                        {integration.dataFlow === 'outbound' && <ArrowRight className="h-4 w-4 text-green-500 mr-1" />}
                        {integration.dataFlow === 'bidirectional' && (
                          <>
                            <ArrowLeft className="h-4 w-4 text-blue-500" />
                            <ArrowRight className="h-4 w-4 text-green-500" />
                          </>
                        )}
                        <span className="text-sm capitalize ml-1">{integration.dataFlow}</span>
                      </div>
                    </td>
                    <td className="py-2 capitalize">{integration.frequency}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        integration.status === 'active' ? 'bg-green-100 text-green-800' :
                        integration.status === 'error' ? 'bg-red-100 text-red-800' :
                        integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {integration.status}
                      </span>
                    </td>
                    <td className="py-2 text-sm">{integration.lastSync}</td>
                    <td className="text-center py-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setShowTestModal(true)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Terminal className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedIntegration(integration)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-yellow-300 rounded-lg hover:bg-yellow-50 text-sm">
                          <RefreshCw className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-600">Refresh</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIntegration && (
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{selectedIntegration.name} - Configuration</h3>
            <button onClick={() => setSelectedIntegration(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium mb-3">Connection Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-mono text-xs">{selectedIntegration.endpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span>{selectedIntegration.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Authentication:</span>
                  <span>OAuth 2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeout:</span>
                  <span>30 seconds</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Sync Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="capitalize">{selectedIntegration.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Sync:</span>
                  <span>{selectedIntegration.nextSync || 'Real-time'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retry Policy:</span>
                  <span>3 attempts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Handling:</span>
                  <span>Log and notify</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">API Endpoints</h4>
            <div className="space-y-2">
              {apiEndpoints
                .filter(api => api.integrationId === selectedIntegration.id)
                .map(api => (
                  <div key={api.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-xs font-mono mr-3 ${
                        api.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        api.method === 'POST' ? 'bg-green-100 text-green-800' :
                        api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {api.method}
                      </span>
                      <div>
                        <p className="font-mono text-sm">{api.path}</p>
                        <p className="text-xs text-gray-500">{api.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">Rate: {api.rateLimit}/min</span>
                      {api.active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDataMappingTab = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Data Field Mappings</h3>
          <button
            onClick={() => setShowMappingModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Source System</th>
                <th className="text-left py-2">Source Field</th>
                <th className="text-center py-2">→</th>
                <th className="text-left py-2">Target Field</th>
                <th className="text-left py-2">Data Type</th>
                <th className="text-left py-2">Transformation</th>
                <th className="text-center py-2">Required</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataMappings.map(mapping => (
                <tr key={mapping.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{mapping.sourceName}</td>
                  <td className="py-2 font-mono text-sm">{mapping.sourceField}</td>
                  <td className="text-center py-2">
                    <ArrowRight className="h-4 w-4 text-gray-400 inline" />
                  </td>
                  <td className="py-2 font-mono text-sm">{mapping.targetField}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {mapping.dataType}
                    </span>
                  </td>
                  <td className="py-2">
                    {mapping.transformation ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {mapping.transformation}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="text-center py-2">
                    {mapping.required ? (
                      <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 inline" />
                    )}
                  </td>
                  <td className="text-center py-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm mr-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Transformation Rules</h3>
          <div className="space-y-3">
            {[
              { name: 'Currency Conversion', description: 'Convert currency values to USD', count: 12 },
              { name: 'Date Formatting', description: 'Standardize date format to ISO 8601', count: 8 },
              { name: 'String Normalization', description: 'Uppercase and trim strings', count: 15 },
              { name: 'Decimal Precision', description: 'Round to 2 decimal places', count: 6 },
              { name: 'Code Mapping', description: 'Map external codes to internal', count: 20 }
            ].map((rule, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-gray-500">{rule.description}</p>
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded">
                    {rule.count} fields
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Validation Rules</h3>
          <div className="space-y-3">
            {[
              { field: 'Email', rule: 'Valid email format', status: 'active' },
              { field: 'Phone', rule: 'E.164 format', status: 'active' },
              { field: 'Amount', rule: 'Positive number', status: 'active' },
              { field: 'Tax ID', rule: 'Valid tax ID format', status: 'active' },
              { field: 'Country Code', rule: 'ISO 3166-1 alpha-2', status: 'inactive' }
            ].map((validation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{validation.field}</p>
                  <p className="text-xs text-gray-500">{validation.rule}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  validation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {validation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">System Health</h3>
          <div className="space-y-3">
            {integrations.map(integration => (
              <div key={integration.id} className="flex items-center justify-between">
                <span className="text-sm">{integration.name}</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    integration.status === 'active' ? 'bg-green-500' :
                    integration.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-gray-500">
                    {integration.status === 'active' ? 'Operational' :
                     integration.status === 'error' ? 'Error' :
                     'Degraded'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Sync Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
              { name: 'Success', value: 98.5, fill: '#10B981' },
              { name: 'Failed', value: 1.5, fill: '#EF4444' }
            ]}>
              <RadialBar dataKey="value" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                98.5%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-sm mt-4">
            <span>Success Rate</span>
            <span className="font-semibold">Last 24h</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Active Webhooks</h3>
          <div className="space-y-3">
            {webhookConfigs.map(webhook => (
              <div key={webhook.id} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{webhook.event}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    webhook.successRate >= 99 ? 'bg-green-100 text-green-800' :
                    webhook.successRate >= 95 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {webhook.successRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">Last: {webhook.lastTriggered}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Integration Logs</h3>
          <div className="flex space-x-2">
            <select className="border rounded px-3 py-2 text-sm">
              <option>All Levels</option>
              <option>Error</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Timestamp</th>
                <th className="text-left py-2">Integration</th>
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Message</th>
                <th className="text-left py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {integrationLogs.map(log => {
                const integration = integrations.find(i => i.id === log.integrationId);
                return (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{log.timestamp}</td>
                    <td className="py-2">{integration?.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="py-2">{log.message}</td>
                    <td className="py-2">{log.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Data Transfer Queue</h3>
          <div className="space-y-3">
            {[
              { entity: 'Invoices', direction: 'import', count: 250, status: 'processing' },
              { entity: 'Payments', direction: 'export', count: 125, status: 'queued' },
              { entity: 'Customers', direction: 'import', count: 50, status: 'completed' },
              { entity: 'Products', direction: 'import', count: 500, status: 'processing' }
            ].map((transfer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  {transfer.direction === 'import' ? (
                    <Download className="h-4 w-4 text-blue-500 mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{transfer.entity}</p>
                    <p className="text-xs text-gray-500">{transfer.count} records</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                  transfer.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {transfer.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Error Summary</h3>
          <div className="space-y-3">
            {[
              { error: 'Authentication Failed', count: 3, severity: 'critical' },
              { error: 'Rate Limit Exceeded', count: 8, severity: 'warning' },
              { error: 'Validation Failed', count: 12, severity: 'medium' },
              { error: 'Timeout', count: 5, severity: 'low' }
            ].map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 mr-2 ${
                    error.severity === 'critical' ? 'text-red-500' :
                    error.severity === 'warning' ? 'text-yellow-500' :
                    error.severity === 'medium' ? 'text-orange-500' :
                    'text-gray-500'
                  }`} />
                  <span className="text-sm">{error.error}</span>
                </div>
                <span className="font-semibold">{error.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Integrations</h2>
        <p className="text-gray-600">Manage external system integrations, data mappings, and API connections</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading integrations…
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {!loading && !error && integrations.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 mb-3">
          <Link2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          No integrations configured yet.
        </div>
      )}

      {!loading && !error && (
      <>
      <div className="bg-white rounded-lg shadow mb-3">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'integrations', 'data-mapping', 'monitoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'integrations' && renderIntegrationsTab()}
        {activeTab === 'data-mapping' && renderDataMappingTab()}
        {activeTab === 'monitoring' && renderMonitoringTab()}
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Configure Integration</h3>
              <button onClick={() => setShowConfigModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Integration Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>ERP</option>
                    <option>Banking</option>
                    <option>Payment</option>
                    <option>Accounting</option>
                    <option>Tax</option>
                    <option>CRM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Connection Type</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>API</option>
                  <option>SFTP</option>
                  <option>Database</option>
                  <option>Webhook</option>
                  <option>File Upload</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endpoint URL</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="https://api.example.com/v1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Authentication</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>OAuth 2.0</option>
                    <option>API Key</option>
                    <option>Basic Auth</option>
                    <option>Token</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sync Frequency</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Real-time</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Create Field Mapping</h3>
              <button onClick={() => setShowMappingModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Source System</label>
                  <select className="w-full border rounded px-3 py-2">
                    {integrations.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source Field</label>
                  <input type="text" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Field</label>
                  <input type="text" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Type</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>String</option>
                    <option>Number</option>
                    <option>Date</option>
                    <option>Boolean</option>
                    <option>Object</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transformation (Optional)</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">None</option>
                  <option>Currency Conversion</option>
                  <option>Date Format</option>
                  <option>String Normalization</option>
                  <option>Custom Script</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Required Field</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Enable Validation</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Create Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Test Integration Connection</h3>
              <button onClick={() => setShowTestModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
              <div>$ testing connection to api.example.com...</div>
              <div className="mt-2">✓ Connection established</div>
              <div>✓ Authentication successful</div>
              <div>✓ API version: 2.3.1</div>
              <div>✓ Rate limit: 100 requests/minute</div>
              <div className="mt-2">$ testing data retrieval...</div>
              <div>✓ GET /customers - 200 OK (250ms)</div>
              <div>✓ GET /invoices - 200 OK (180ms)</div>
              <div className="mt-2 text-green-300">All tests passed successfully!</div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default FinancialIntegrations;