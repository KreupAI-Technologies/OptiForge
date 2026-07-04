'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Settings, Database, Server, Activity, AlertTriangle, CheckCircle, TrendingUp, HardDrive, Cpu, Network } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface RecentActivity {
  user: string;
  action: string;
  time: string;
  type: string;
}

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function activityType(severity?: string, status?: string): string {
  const s = (severity || status || '').toLowerCase();
  if (s.includes('error') || s.includes('critical') || s.includes('fail')) return 'warning';
  if (s.includes('warn')) return 'warning';
  if (s.includes('success') || s.includes('ok')) return 'success';
  return 'info';
}

export default function ITAdminDashboard() {
  const router = useRouter();

  const systemStats = {
    totalUsers: 248,
    activeUsers: 215,
    inactiveUsers: 33,
    totalGroups: 18,
    activeServers: 12,
    totalServers: 15,
    serverUptime: 99.8,
    storageUsed: 72,
    cpuUsage: 45,
    memoryUsage: 68,
    networkTraffic: 1250,
    pendingTickets: 8,
    resolvedToday: 15,
    securityAlerts: 3
  };

  const quickActions = [
    { title: 'Create User', icon: Users, link: '/it-admin/users/create', color: 'bg-blue-500' },
    { title: 'Manage Roles', icon: Shield, link: '/it-admin/roles', color: 'bg-purple-500' },
    { title: 'System Settings', icon: Settings, link: '/it-admin/settings', color: 'bg-green-500' },
    { title: 'Database Backup', icon: Database, link: '/it-admin/backup', color: 'bg-orange-500' },
    { title: 'Server Status', icon: Server, link: '/it-admin/servers', color: 'bg-cyan-500' },
    { title: 'Activity Logs', icon: Activity, link: '/it-admin/logs', color: 'bg-indigo-500' }
  ];

  const fallbackActivities: RecentActivity[] = [
    { user: 'Rajesh Kumar', action: 'Created new user account', time: '10 mins ago', type: 'success' },
    { user: 'System', action: 'Database backup completed', time: '25 mins ago', type: 'success' },
    { user: 'Priya Sharma', action: 'Modified user permissions', time: '1 hour ago', type: 'info' },
    { user: 'System', action: 'Security alert: Failed login attempts', time: '2 hours ago', type: 'warning' },
    { user: 'Amit Patel', action: 'Updated system configuration', time: '3 hours ago', type: 'info' }
  ];

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(fallbackActivities);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoadingActivities(true);
      setActivitiesError(null);
      try {
        const res = await ItAdminService.getAuditLogs({ limit: '5', page: '1' });
        const logs = Array.isArray(res?.data) ? res.data : [];
        if (logs.length > 0) {
          const mapped: RecentActivity[] = logs.map((log) => ({
            user: log.userName || log.userId || 'System',
            action:
              log.description ||
              [log.action, log.module].filter(Boolean).join(' - ') ||
              'Activity recorded',
            time: relativeTime(log.createdAt),
            type: activityType(log.severity, log.status),
          }));
          if (!cancelled) setRecentActivities(mapped);
        }
        // If no logs yet, keep the illustrative fallback list.
      } catch (err) {
        if (!cancelled) {
          setActivitiesError(
            err instanceof Error ? err.message : 'Failed to load recent activities',
          );
        }
      } finally {
        if (!cancelled) setIsLoadingActivities(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const systemHealth = [
    { name: 'Web Server', status: 'healthy', uptime: '99.9%', lastCheck: '2 mins ago' },
    { name: 'Database Server', status: 'healthy', uptime: '99.8%', lastCheck: '2 mins ago' },
    { name: 'Application Server', status: 'healthy', uptime: '99.7%', lastCheck: '3 mins ago' },
    { name: 'File Server', status: 'warning', uptime: '98.5%', lastCheck: '5 mins ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900">IT Administration</h1>
        <p className="text-sm text-gray-500 mt-1">System overview and management dashboard</p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.totalUsers}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.activeUsers}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Active Users</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.totalGroups}</span>
          </div>
          <p className="text-sm font-medium opacity-90">User Groups</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Server className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.activeServers}/{systemStats.totalServers}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Active Servers</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.serverUptime}%</span>
          </div>
          <p className="text-sm font-medium opacity-90">Uptime</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.pendingTickets}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Pending Tickets</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{systemStats.securityAlerts}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Security Alerts</p>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Storage</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">{systemStats.storageUsed}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${systemStats.storageUsed}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">2.16 TB / 3.00 TB used</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">CPU Usage</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">{systemStats.cpuUsage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-600 h-3 rounded-full" style={{ width: `${systemStats.cpuUsage}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">18 / 40 cores utilized</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Memory</h3>
            </div>
            <span className="text-2xl font-bold text-purple-600">{systemStats.memoryUsage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${systemStats.memoryUsage}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">54.4 GB / 80 GB used</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Network</h3>
            </div>
            <span className="text-2xl font-bold text-orange-600">{systemStats.networkTraffic}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-orange-600 h-3 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">GB/hour throughput</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => router.push(action.link)}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className={`${action.color} p-3 rounded-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">System Health</h2>
          <div className="space-y-3">
            {systemHealth.map((system, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{system.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Uptime: {system.uptime}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getHealthColor(system.status)}`}>
                    {system.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{system.lastCheck}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Recent Activities</h2>
          {isLoadingActivities && (
            <p className="text-xs text-gray-400 mb-2">Loading activities...</p>
          )}
          {activitiesError && (
            <p className="text-xs text-red-500 mb-2">{activitiesError}</p>
          )}
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            <button
              onClick={() => router.push('/it-admin/users/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Create User
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push('/it-admin/users/active')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <p className="text-3xl font-bold text-green-600 mb-1">{systemStats.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </button>
            <button
              onClick={() => router.push('/it-admin/users/inactive')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
            >
              <p className="text-3xl font-bold text-red-600 mb-1">{systemStats.inactiveUsers}</p>
              <p className="text-sm text-gray-600">Inactive Users</p>
            </button>
            <button
              onClick={() => router.push('/it-admin/users/groups')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <p className="text-3xl font-bold text-purple-600 mb-1">{systemStats.totalGroups}</p>
              <p className="text-sm text-gray-600">User Groups</p>
            </button>
            <button
              onClick={() => router.push('/it-admin/users/bulk')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <p className="text-sm font-medium text-blue-600 mb-1">Bulk Operations</p>
              <p className="text-xs text-gray-600">Import/Export Users</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Today's Summary</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tickets Resolved</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.resolvedToday}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending Tickets</p>
                <p className="text-2xl font-bold text-orange-600">{systemStats.pendingTickets}</p>
              </div>
              <Activity className="w-10 h-10 text-orange-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Security Alerts</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.securityAlerts}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
