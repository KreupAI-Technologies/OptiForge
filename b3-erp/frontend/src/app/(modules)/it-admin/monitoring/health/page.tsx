'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, Globe, Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Filter, Download, Eye, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface SystemHealthMetric {
  id: string;
  category: string;
  service: string;
  status: string;
  uptime: string;
  responseTime: number;
  lastCheck: string;
  endpoint?: string;
  errorCount: number;
  warningCount: number;
}

interface ServerHealth {
  id: string;
  serverName: string;
  type: string;
  status: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  lastRestart: string;
  location: string;
}

interface HealthStats {
  overallHealth: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  avgResponseTime: number;
  totalUptime: number;
}

const SystemHealthPage = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SystemHealthMetric | ServerHealth | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleExport = () => {
    exportToCsv('system-health', filteredServices as unknown as Record<string, unknown>[]);
  };

  const handleRefresh = () => {
    showToast('Refreshing health metrics...', 'info');
  };

  const handleViewDetails = (itemId: string) => {
    showToast(`Viewing details for: ${itemId}`, 'info');
  };

  const [services] = useState<SystemHealthMetric[]>([
    {
      id: '1',
      category: 'Application',
      service: 'Web Application',
      status: 'Healthy',
      uptime: '99.98%',
      responseTime: 145,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'https://erp.company.com',
      errorCount: 0,
      warningCount: 2,
    },
    {
      id: '2',
      category: 'Application',
      service: 'API Gateway',
      status: 'Healthy',
      uptime: '99.95%',
      responseTime: 89,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'https://api.company.com',
      errorCount: 0,
      warningCount: 0,
    },
    {
      id: '3',
      category: 'Database',
      service: 'Primary Database',
      status: 'Healthy',
      uptime: '99.99%',
      responseTime: 12,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'postgresql://db.company.com:5432',
      errorCount: 0,
      warningCount: 1,
    },
    {
      id: '4',
      category: 'Database',
      service: 'Replica Database',
      status: 'Degraded',
      uptime: '98.50%',
      responseTime: 245,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'postgresql://db-replica.company.com:5432',
      errorCount: 3,
      warningCount: 5,
    },
    {
      id: '5',
      category: 'Cache',
      service: 'Redis Cache',
      status: 'Healthy',
      uptime: '99.97%',
      responseTime: 5,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'redis://cache.company.com:6379',
      errorCount: 0,
      warningCount: 0,
    },
    {
      id: '6',
      category: 'Message Queue',
      service: 'RabbitMQ',
      status: 'Healthy',
      uptime: '99.92%',
      responseTime: 23,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'amqp://mq.company.com:5672',
      errorCount: 0,
      warningCount: 1,
    },
    {
      id: '7',
      category: 'Storage',
      service: 'File Storage',
      status: 'Healthy',
      uptime: '99.96%',
      responseTime: 156,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 's3://storage.company.com',
      errorCount: 0,
      warningCount: 0,
    },
    {
      id: '8',
      category: 'External',
      service: 'Payment Gateway',
      status: 'Down',
      uptime: '95.20%',
      responseTime: 0,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'https://payment.provider.com/api',
      errorCount: 12,
      warningCount: 8,
    },
    {
      id: '9',
      category: 'External',
      service: 'SMS Gateway',
      status: 'Healthy',
      uptime: '99.80%',
      responseTime: 342,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'https://sms.provider.com/api',
      errorCount: 0,
      warningCount: 3,
    },
    {
      id: '10',
      category: 'External',
      service: 'Email Service',
      status: 'Healthy',
      uptime: '99.85%',
      responseTime: 567,
      lastCheck: '2025-10-21 18:30:00',
      endpoint: 'smtp://mail.provider.com:587',
      errorCount: 0,
      warningCount: 2,
    },
  ]);

  const [servers] = useState<ServerHealth[]>([
    {
      id: '1',
      serverName: 'WEB-01',
      type: 'Web Server',
      status: 'Healthy',
      cpu: 45,
      memory: 62,
      disk: 48,
      network: 35,
      uptime: '45 days',
      lastRestart: '2025-09-06 10:00:00',
      location: 'Mumbai DC',
    },
    {
      id: '2',
      serverName: 'WEB-02',
      type: 'Web Server',
      status: 'Healthy',
      cpu: 52,
      memory: 58,
      disk: 51,
      network: 42,
      uptime: '45 days',
      lastRestart: '2025-09-06 10:05:00',
      location: 'Mumbai DC',
    },
    {
      id: '3',
      serverName: 'DB-MASTER',
      type: 'Database Server',
      status: 'Healthy',
      cpu: 68,
      memory: 78,
      disk: 65,
      network: 58,
      uptime: '90 days',
      lastRestart: '2025-07-23 08:00:00',
      location: 'Mumbai DC',
    },
    {
      id: '4',
      serverName: 'DB-REPLICA',
      type: 'Database Server',
      status: 'Warning',
      cpu: 82,
      memory: 88,
      disk: 72,
      network: 65,
      uptime: '30 days',
      lastRestart: '2025-09-21 14:00:00',
      location: 'Bangalore DC',
    },
    {
      id: '5',
      serverName: 'APP-01',
      type: 'Application Server',
      status: 'Healthy',
      cpu: 55,
      memory: 65,
      disk: 42,
      network: 48,
      uptime: '45 days',
      lastRestart: '2025-09-06 10:15:00',
      location: 'Mumbai DC',
    },
    {
      id: '6',
      serverName: 'CACHE-01',
      type: 'Cache Server',
      status: 'Healthy',
      cpu: 38,
      memory: 72,
      disk: 28,
      network: 52,
      uptime: '60 days',
      lastRestart: '2025-08-22 09:00:00',
      location: 'Mumbai DC',
    },
  ]);

  const stats: HealthStats = {
    overallHealth: 92,
    healthyServices: services.filter(s => s.status === 'Healthy').length,
    degradedServices: services.filter(s => s.status === 'Degraded').length,
    downServices: services.filter(s => s.status === 'Down').length,
    avgResponseTime: Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length),
    totalUptime: 99.2,
  };

  const filteredServices = services.filter(service => {
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  const filteredServers = servers.filter(server => {
    const matchesStatus = filterStatus === 'all' || server.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time === 0) return 'text-red-600';
    if (time < 100) return 'text-green-600';
    if (time < 300) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getUsageColor = (usage: number) => {
    if (usage < 70) return 'bg-green-600';
    if (usage < 85) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleRefreshClick = () => {
    handleRefresh();
  };

  const handleExportClick = () => {
    handleExport();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Activity className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health Monitoring</h1>
              <p className="text-gray-600">Real-time system and service health status</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
                showToast(autoRefresh ? 'Auto refresh disabled' : 'Auto refresh enabled', 'info');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            <button
              onClick={handleRefreshClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-sky-300 text-sky-700 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExportClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-sky-300 text-sky-700 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Overall Health Score */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2 opacity-90">Overall System Health</h2>
              <div className="text-5xl font-bold mb-2">{stats.overallHealth}%</div>
              <p className="text-sm opacity-90">All systems operational</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Average Uptime</div>
              <div className="text-3xl font-bold">{stats.totalUptime}%</div>
              <div className="text-sm opacity-90 mt-2">Last 30 days</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.healthyServices}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Degraded</span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.degradedServices}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Down</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.downServices}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Response</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${getResponseTimeColor(stats.avgResponseTime)}`}>
            {stats.avgResponseTime}ms
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Services</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{services.length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Servers</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{servers.length}</div>
        </div>
      </div>
    </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Tabs */}
      <div className="flex-none border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              Services ({services.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'servers'
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Server className="w-4 h-4" />
              Servers ({servers.length})
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-3">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-sky-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Healthy">Healthy</option>
            <option value="Degraded">Degraded</option>
            <option value="Warning">Warning</option>
            <option value="Down">Down</option>
          </select>
          {activeTab === 'services' && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Application">Application</option>
              <option value="Database">Database</option>
              <option value="Cache">Cache</option>
              <option value="Message Queue">Message Queue</option>
              <option value="Storage">Storage</option>
              <option value="External">External Services</option>
            </select>
          )}
        </div>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Uptime</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Response Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Issues</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Check</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{service.service}</div>
                        {service.endpoint && (
                          <code className="text-xs text-gray-500">{service.endpoint}</code>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{service.uptime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`text-sm font-bold ${getResponseTimeColor(service.responseTime)}`}>
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {service.errorCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {service.errorCount} errors
                          </span>
                        )}
                        {service.warningCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {service.warningCount} warnings
                          </span>
                        )}
                        {service.errorCount === 0 && service.warningCount === 0 && (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {service.lastCheck}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(service);
                          handleViewDetails(service.id);
                        }}
                        className="text-sky-600 hover:text-sky-700 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No services found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Servers Tab */}
      {activeTab === 'servers' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Server</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">CPU</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Memory</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Disk</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Uptime</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServers.map((server) => (
                  <tr key={server.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(server.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                          {server.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{server.serverName}</div>
                        <div className="text-xs text-gray-500">{server.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                        {server.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Cpu className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{server.cpu}%</span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getUsageColor(server.cpu)}`}
                            style={{ width: `${server.cpu}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{server.memory}%</span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getUsageColor(server.memory)}`}
                            style={{ width: `${server.memory}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <HardDrive className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{server.disk}%</span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getUsageColor(server.disk)}`}
                            style={{ width: `${server.disk}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{server.uptime}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(server);
                          handleViewDetails(server.id);
                        }}
                        className="text-sky-600 hover:text-sky-700 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredServers.length === 0 && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No servers found matching your criteria</p>
            </div>
          )}
        </div>
      )}
      </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {'service' in selectedItem ? 'Service Details' : 'Server Details'}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Close</span>
              </button>
            </div>

            <div className="p-6">
              {'service' in selectedItem ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Service Name</label>
                    <div className="bg-gray-50 rounded-lg p-3 font-medium text-gray-900">{selectedItem.service}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.category}</div>
                    </div>
                  </div>
                  {selectedItem.endpoint && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Endpoint</label>
                      <code className="block bg-gray-50 rounded-lg p-3 text-sm text-gray-900 break-all">{selectedItem.endpoint}</code>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Uptime</label>
                      <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">{selectedItem.uptime}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Response Time</label>
                      <div className={`bg-gray-50 rounded-lg p-3 font-bold ${getResponseTimeColor(selectedItem.responseTime)}`}>
                        {selectedItem.responseTime > 0 ? `${selectedItem.responseTime}ms` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Server Name</label>
                    <div className="bg-gray-50 rounded-lg p-3 font-medium text-gray-900">{selectedItem.serverName}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.type}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">CPU Usage</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold text-gray-900">{selectedItem.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(selectedItem.cpu)}`}
                            style={{ width: `${selectedItem.cpu}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Memory Usage</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold text-gray-900">{selectedItem.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(selectedItem.memory)}`}
                            style={{ width: `${selectedItem.memory}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Uptime</label>
                      <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">{selectedItem.uptime}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.location}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPage;
