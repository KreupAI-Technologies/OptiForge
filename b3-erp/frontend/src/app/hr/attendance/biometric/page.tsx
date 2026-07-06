'use client';

import { useState, useMemo, useEffect } from 'react';
import { Fingerprint, Plus, Edit, Activity, MapPin, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { HrAttendanceService } from '@/services/hr-payroll.service';

interface BiometricDevice {
  id: string;
  deviceId: string;
  name: string;
  model: string;
  location: string;
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  lastSyncTime: string;
  totalPunchesToday: number;
  enrolledUsers: number;
  storageUsed: number;
  batteryBackup: boolean;
  installedDate: string;
}

export default function BiometricDevicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [rows, setRows] = useState<BiometricDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrAttendanceService.getBiometric();
        if (!cancelled) {
          const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
            id: String(r.id ?? r.details?.id ?? ''),
            deviceId: r.details?.deviceId ?? r.employeeCode ?? '',
            name: r.details?.name ?? r.employeeName ?? '',
            model: r.details?.model ?? '',
            location: r.details?.location ?? r.department ?? '',
            ipAddress: r.details?.ipAddress ?? '',
            port: r.details?.port ?? 4370,
            status: (r.status ?? r.details?.status ?? 'online') as BiometricDevice['status'],
            lastSyncTime: r.details?.lastSyncTime ?? r.date ?? '',
            totalPunchesToday: r.details?.totalPunchesToday ?? 0,
            enrolledUsers: r.details?.enrolledUsers ?? 0,
            storageUsed: r.details?.storageUsed ?? 0,
            batteryBackup: r.details?.batteryBackup ?? false,
            installedDate: r.details?.installedDate ?? '',
          } as BiometricDevice));
          setRows(mapped);
        }
      } catch (e) { if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRows([]); } }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredData = useMemo(() => {
    return rows.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, rows]);

  const stats = {
    total: rows.length,
    online: rows.filter(d => d.status === 'online').length,
    offline: rows.filter(d => d.status === 'offline').length,
    error: rows.filter(d => d.status === 'error').length,
    totalPunches: rows.reduce((sum, d) => sum + d.totalPunchesToday, 0)
  };

  const getStatusIcon = (status: string) => {
    if (status === 'online') return <Wifi className="w-4 h-4 text-green-500" />;
    if (status === 'offline') return <WifiOff className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  };

  const getTimeSince = (timeString: string) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const columns: Column<BiometricDevice>[] = [
    { id: 'name', accessor: 'name', label: 'Device Details', sortable: true,
      render: (v: string, row: BiometricDevice) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            row.status === 'online' ? 'bg-green-100' :
            row.status === 'offline' ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            <Fingerprint className={`w-5 h-5 ${
              row.status === 'online' ? 'text-green-600' :
              row.status === 'offline' ? 'text-red-600' : 'text-orange-600'
            }`} />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{row.deviceId} • {row.model}</div>
          </div>
        </div>
      )
    },
    { id: 'location', accessor: 'location', label: 'Location', sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{v}</span>
        </div>
      )
    },
    { id: 'ipAddress', accessor: 'ipAddress', label: 'Network', sortable: true,
      render: (v: string, row: BiometricDevice) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v}:{row.port}</div>
          <div className="flex items-center gap-1 mt-1">
            {getStatusIcon(row.status)}
            <span className={`text-xs ${
              row.status === 'online' ? 'text-green-600' :
              row.status === 'offline' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {row.status.toUpperCase()}
            </span>
          </div>
        </div>
      )
    },
    { id: 'totalPunchesToday', accessor: 'totalPunchesToday', label: 'Today\'s Activity', sortable: true,
      render: (v: number, row: BiometricDevice) => (
        <div className="text-sm">
          <div className="font-semibold text-blue-600">{v} punches</div>
          <div className="text-xs text-gray-500">{row.enrolledUsers} users enrolled</div>
        </div>
      )
    },
    { id: 'storageUsed', accessor: 'storageUsed', label: 'Storage', sortable: true,
      render: (v: number) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v}%</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full ${
                v >= 90 ? 'bg-red-500' : v >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${v}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { id: 'lastSyncTime', accessor: 'lastSyncTime', label: 'Last Sync', sortable: true,
      render: (v: string, row: BiometricDevice) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{getTimeSince(v)}</div>
          <div className="flex items-center gap-1 mt-1">
            {row.batteryBackup ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-xs text-gray-500">
              {row.batteryBackup ? 'Backup' : 'No backup'}
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Fingerprint className="h-8 w-8 text-blue-600" />
          Biometric Devices
        </h1>
        <p className="text-gray-600 mt-2">Manage and monitor biometric attendance devices</p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <Fingerprint className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
            <Wifi className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
            </div>
            <WifiOff className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-orange-600">{stats.error}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Punches</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPunches.toLocaleString()}</p>
            </div>
            <Activity className="h-10 w-10 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.offline > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <WifiOff className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Device Connectivity Issue</h3>
              <p className="text-sm text-red-700">{stats.offline} device{stats.offline > 1 ? 's are' : ' is'} offline. Check network connectivity immediately.</p>
            </div>
          </div>
        </div>
      )}
      {stats.error > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">Device Error Detected</h3>
              <p className="text-sm text-orange-700">{stats.error} device{stats.error > 1 ? 's require' : ' requires'} attention. Storage may be full or device needs maintenance.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by device name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Device
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Devices Table */}
      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
