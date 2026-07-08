'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Factory,
  Users,
  Clock,
  GitBranch,
  Cog,
  Database,
  Shield,
  Bell,
  FileText,
  Zap,
  Loader2
} from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { productionSettingsService } from '@/services/production/production-settings.service';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

interface SettingsCounts {
  workCenters: number | null
  productionLines: number | null
  activeShifts: number | null
  routings: number | null
}

export default function ProductionSettingsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<SettingsCounts>({
    workCenters: null,
    productionLines: null,
    activeShifts: null,
    routings: null,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  // Live configuration counts from the production module
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCountsLoading(true);
      const [wc, lines, shifts, routings] = await Promise.all([
        ProductionOrphanService.getWorkCenters().catch(() => null),
        productionSettingsService.findAllProductionLines().catch(() => null),
        productionSettingsService.findAllShifts().catch(() => null),
        ProductionOrphanService.getRoutings().catch(() => null),
      ]);
      if (cancelled) return;
      const activeShifts = Array.isArray(shifts)
        ? shifts.filter((s: any) => String(s?.status ?? 'active').toLowerCase() === 'active').length
        : null;
      setCounts({
        workCenters: Array.isArray(wc) ? wc.length : null,
        productionLines: Array.isArray(lines) ? lines.length : null,
        activeShifts,
        routings: Array.isArray(routings) ? routings.length : null,
      });
      setCountsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const fmt = (n: number | null) => (countsLoading ? '…' : n == null ? '—' : String(n));

  const settingsCategories: SettingsCategory[] = [
    {
      id: 'work-centers',
      title: 'Work Centers',
      description: 'Configure production work centers, machines, and equipment',
      icon: <Factory className="w-8 h-8" />,
      path: '/production/settings/work-centers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'lines',
      title: 'Production Lines',
      description: 'Manage production lines, assembly lines, and manufacturing cells',
      icon: <GitBranch className="w-8 h-8" />,
      path: '/production/settings/lines',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'shifts',
      title: 'Shift Management',
      description: 'Set up work shifts, calendars, and production schedules',
      icon: <Clock className="w-8 h-8" />,
      path: '/production/settings/shifts',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      id: 'routing',
      title: 'Routing Configuration',
      description: 'Define production routings, operations, and workflows',
      icon: <Cog className="w-8 h-8" />,
      path: '/production/settings/routing',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Production Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Configure production parameters, work centers, shifts, and manufacturing settings
            </p>
          </div>
        </div>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {settingsCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleNavigate(category.path)}
            className={`${category.bgColor} ${category.hoverColor} border-2 border-gray-200 rounded-xl p-3 text-left transition-all hover:shadow-lg hover:border-${category.color.split('-')[1]}-300 group`}
          >
            <div className="flex items-start gap-2">
              <div className={`${category.color} ${category.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${category.color} mb-2`}>
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
              <ArrowLeft className={`w-5 h-5 ${category.color} transform rotate-180 group-hover:translate-x-1 transition-transform`} />
            </div>
          </button>
        ))}
      </div>

      {/* Additional Settings Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Additional Configuration Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Quality Standards</h3>
            </div>
            <p className="text-sm text-gray-600">Configure quality check parameters and tolerances</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Alerts & Notifications</h3>
            </div>
            <p className="text-sm text-gray-600">Set up production alerts and notification rules</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Document Templates</h3>
            </div>
            <p className="text-sm text-gray-600">Manage work order and report templates</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white">
        <div className="flex items-start gap-2">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Quick Tips</h3>
            <ul className="space-y-1 text-sm text-blue-100">
              <li>• Configure work centers before setting up production lines</li>
              <li>• Define shift patterns to enable accurate capacity planning</li>
              <li>• Routing configurations determine production flow and lead times</li>
              <li>• Regular review of settings ensures optimal production efficiency</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards — live counts from the production module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-6">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Work Centers</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {countsLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                {fmt(counts.workCenters)}
              </p>
            </div>
            <Factory className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Production Lines</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {countsLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                {fmt(counts.productionLines)}
              </p>
            </div>
            <GitBranch className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Shifts</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {countsLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                {fmt(counts.activeShifts)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Routings</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {countsLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                {fmt(counts.routings)}
              </p>
            </div>
            <Cog className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
