'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, Plus, Download, RotateCcw, Trash2, CheckCircle, XCircle, Clock, HardDrive, Calendar, Settings } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in-progress' | 'failed' | 'scheduled';
  size: string;
  timestamp: string;
  duration: string;
  location: string;
  tables: number;
  records: number;
  compression: string;
  encryption: boolean;
}

interface ScheduledBackup {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  type: 'full' | 'incremental';
  retention: number;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

export default function DatabaseBackupPage() {
  const router = useRouter();
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBackups = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const records = await ItAdminService.getBackupRecords();
        if (cancelled) return;
        const mapped: Backup[] = records.map((record) => ({
          id: record.id,
          name: record.name,
          type: (record.type as Backup['type']) || 'full',
          status: (record.status as Backup['status']) || 'scheduled',
          size: record.size || '0 MB',
          timestamp: record.completedAt || record.startedAt || record.createdAt || '',
          duration: record.duration || '-',
          location: record.location || '',
          tables: 0,
          records: 0,
          compression: 'gzip',
          encryption: false
        }));
        setBackups(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load backup records');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadBackups();

    return () => {
      cancelled = true;
    };
  }, []);

  const [scheduledBackups, setScheduledBackups] = useState<ScheduledBackup[]>([
    {
      id: 's1',
      name: 'Daily Full Backup',
      frequency: 'daily',
      time: '02:00',
      type: 'full',
      retention: 7,
      enabled: true,
      lastRun: '2024-01-20 02:00:00',
      nextRun: '2024-01-21 02:00:00'
    },
    {
      id: 's2',
      name: 'Hourly Incremental',
      frequency: 'daily',
      time: 'Every 6 hours',
      type: 'incremental',
      retention: 3,
      enabled: true,
      lastRun: '2024-01-20 14:00:00',
      nextRun: '2024-01-20 20:00:00'
    },
    {
      id: 's3',
      name: 'Weekly Archive',
      frequency: 'weekly',
      time: 'Sunday 03:00',
      type: 'full',
      retention: 30,
      enabled: true,
      lastRun: '2024-01-15 03:00:00',
      nextRun: '2024-01-22 03:00:00'
    },
    {
      id: 's4',
      name: 'Monthly Archive',
      frequency: 'monthly',
      time: '1st of month 04:00',
      type: 'full',
      retention: 365,
      enabled: false,
      nextRun: '2024-02-01 04:00:00'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 border-green-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
      scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      full: 'bg-purple-50 text-purple-700 border-purple-300',
      incremental: 'bg-blue-50 text-blue-700 border-blue-300',
      differential: 'bg-indigo-50 text-indigo-700 border-indigo-300'
    };
    return colors[type as keyof typeof colors] || colors.full;
  };

  const stats = {
    totalBackups: backups.filter(b => b.status === 'completed').length,
    totalSize: '7.3 GB',
    lastBackup: backups.find(b => b.status === 'completed')?.timestamp || 'Never',
    avgDuration: '9m 45s',
    successRate: 83.3
  };

  const handleCreateBackup = () => {
    console.log('Creating new backup');
  };

  const handleRestore = (backupId: string) => {
    console.log('Restoring backup:', backupId);
  };

  const handleDelete = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
  };

  const toggleSchedule = (scheduleId: string) => {
    setScheduledBackups(prev =>
      prev.map(s =>
        s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2 w-full max-w-full">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 text-sm">
          Loading...
        </div>
      )}
      {loadError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {loadError}
        </div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Database Backup</h1>
          <p className="text-sm text-gray-500 mt-1">Manage database backups and restore points</p>
        </div>
        <button
          onClick={handleCreateBackup}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Backup
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Total Backups</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">Total Size</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Last Backup</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{stats.lastBackup.split(' ')[0]}</p>
          <p className="text-xs text-gray-600">{stats.lastBackup.split(' ')[1]}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-gray-600">Avg Duration</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgDuration}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Backup History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Backup History</h2>

          <div className="space-y-2">
            {backups.map((backup) => (
              <div key={backup.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{backup.name}</h3>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(backup.status)}`}>
                        {getStatusIcon(backup.status)}
                        {backup.status.charAt(0).toUpperCase() + backup.status.slice(1).replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(backup.type)}`}>
                        {backup.type.charAt(0).toUpperCase() + backup.type.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Size</p>
                        <p className="font-semibold text-gray-900">{backup.size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">{backup.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Tables</p>
                        <p className="font-semibold text-gray-900">{backup.tables.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Records</p>
                        <p className="font-semibold text-gray-900">{backup.records.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      <p><Calendar className="w-3 h-3 inline mr-1" />{backup.timestamp}</p>
                      <p className="mt-1 truncate">{backup.location}</p>
                    </div>
                  </div>

                  {backup.status === 'completed' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleRestore(backup.id)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"

                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600"

                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(backup.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"

                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className={`px-2 py-1 rounded ${backup.compression === 'gzip' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {backup.compression}
                    </span>
                    {backup.encryption && (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Encrypted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Backup Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Full backups capture complete database state</li>
              <li>• Incremental backups only save changes since last backup</li>
              <li>• All backups are compressed and encrypted by default</li>
              <li>• Retention policies automatically delete old backups</li>
              <li>• Test restores periodically to ensure backup integrity</li>
            </ul>
          </div>
        </div>

        {/* Scheduled Backups */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Scheduled Backups</h2>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {scheduledBackups.map((schedule) => (
                <div key={schedule.id} className={`border-2 rounded-lg p-3 ${schedule.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{schedule.name}</h3>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><Clock className="w-3 h-3 inline mr-1" />{schedule.time}</p>
                        <p className="flex items-center gap-1">
                          <span className={`px-1.5 py-0.5 rounded ${getTypeColor(schedule.type)}`}>
                            {schedule.type}
                          </span>
                          <span>• Retention: {schedule.retention} days</span>
                        </p>
                        {schedule.lastRun && (
                          <p>Last: {schedule.lastRun.split(' ')[0]}</p>
                        )}
                        <p className="text-blue-700 font-medium">Next: {schedule.nextRun.split(' ')[0]}</p>
                      </div>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={() => toggleSchedule(schedule.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-900">Backup Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Backup Location</p>
                <p className="text-sm font-medium text-gray-900">/var/backups/erp</p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Compression</p>
                <p className="text-sm font-medium text-gray-900">gzip (Level 6)</p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Encryption</p>
                <p className="text-sm font-medium text-gray-900">AES-256</p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Default Retention</p>
                <p className="text-sm font-medium text-gray-900">7 days</p>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              Configure Settings
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">Next Scheduled Backup</p>
                <p className="text-sm text-yellow-700">Daily Full Backup</p>
                <p className="text-xs text-yellow-600">Tomorrow at 02:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
