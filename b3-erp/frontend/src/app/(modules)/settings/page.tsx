'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, User, Bell, Shield, Database, Globe, Palette, Zap, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { dashboardOverviewService, type DashboardOverviewMetrics } from '@/services/dashboard-overview.service';

const settingsCategories = [
  {
    id: 'account',
    name: 'Account Settings',
    description: 'Manage your personal account preferences',
    icon: User,
    color: 'bg-blue-500',
    href: '/profile',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Configure notification preferences',
    icon: Bell,
    color: 'bg-green-500',
    href: '/settings/notifications',
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    description: 'Password, 2FA, and security settings',
    icon: Shield,
    color: 'bg-red-500',
    href: '/profile#security',
  },
  {
    id: 'system',
    name: 'System Configuration',
    description: 'System-wide settings and preferences',
    icon: Settings,
    color: 'bg-purple-500',
    href: '/it-admin/system',
  },
  {
    id: 'data',
    name: 'Data Management',
    description: 'Backup, import, and export settings',
    icon: Database,
    color: 'bg-orange-500',
    href: '/it-admin/database/backup',
  },
  {
    id: 'localization',
    name: 'Localization',
    description: 'Language, timezone, and regional settings',
    icon: Globe,
    color: 'bg-indigo-500',
    href: '/settings/localization',
  },
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Theme and display preferences',
    icon: Palette,
    color: 'bg-pink-500',
    href: '/settings/appearance',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Third-party integrations and APIs',
    icon: Zap,
    color: 'bg-yellow-500',
    href: '/it-admin/system/integrations',
  },
];

const quickSettings = [
  { name: 'Change Password', href: '/profile#security' },
  { name: 'Manage Notifications', href: '/settings/notifications' },
  { name: 'User Permissions', href: '/it-admin/roles/permissions' },
  { name: 'System Backup', href: '/it-admin/database/backup' },
];

export default function SettingsPage() {
  const [metrics, setMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardOverviewService.getOverview();
        if (cancelled) return;
        setMetrics(res.metrics);
        setGeneratedAt(res.generatedAt);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load system status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and system preferences</p>
            </div>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickSettings.map((setting) => (
              <Link
                key={setting.name}
                href={setting.href}
                className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center"
              >
                <h3 className="font-medium text-gray-900">{setting.name}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">All Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status (live) */}
        <div className="mt-12 bg-white rounded-lg shadow border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            {generatedAt && !loading && !error && (
              <span className="text-xs text-gray-500">
                As of {new Date(generatedAt).toLocaleString()}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading system status…</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-700 py-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employees</p>
                <p className="font-semibold text-gray-900">{metrics?.employees ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customers</p>
                <p className="font-semibold text-gray-900">{metrics?.customers ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Inventory Items</p>
                <p className="font-semibold text-gray-900">{metrics?.inventoryItems ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                <p className="font-semibold text-gray-900">{metrics?.openTickets ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
