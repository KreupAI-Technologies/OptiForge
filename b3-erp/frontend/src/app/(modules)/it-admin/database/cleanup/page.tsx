'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Database, AlertTriangle, CheckCircle, Play, BarChart3, HardDrive, Clock, Archive } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface CleanupTask {
  id: string;
  name: string;
  description: string;
  category: 'logs' | 'temp' | 'orphaned' | 'duplicates' | 'archived';
  estimatedSpace: string;
  recordCount: number;
  lastRun?: string;
  impact: 'low' | 'medium' | 'high';
  automated: boolean;
  enabled: boolean;
}

interface CleanupHistory {
  id: string;
  taskName: string;
  executedAt: string;
  recordsDeleted: number;
  spaceFreed: string;
  duration: string;
  status: 'success' | 'partial' | 'failed';
}

export default function DatabaseCleanupPage() {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [cleanupTasks, setCleanupTasks] = useState<CleanupTask[]>([
    {
      id: '1',
      name: 'Old Application Logs',
      description: 'Delete application logs older than 90 days',
      category: 'logs',
      estimatedSpace: '2.4 GB',
      recordCount: 1245678,
      lastRun: '2024-01-15',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '2',
      name: 'System Error Logs',
      description: 'Delete system error logs older than 60 days',
      category: 'logs',
      estimatedSpace: '856 MB',
      recordCount: 345789,
      lastRun: '2024-01-15',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '3',
      name: 'Temporary Files',
      description: 'Remove temporary upload files and cache',
      category: 'temp',
      estimatedSpace: '1.2 GB',
      recordCount: 8934,
      lastRun: '2024-01-18',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '4',
      name: 'Session Data',
      description: 'Clean expired user sessions older than 7 days',
      category: 'temp',
      estimatedSpace: '145 MB',
      recordCount: 45678,
      lastRun: '2024-01-19',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '5',
      name: 'Orphaned Records',
      description: 'Delete records with missing foreign key references',
      category: 'orphaned',
      estimatedSpace: '345 MB',
      recordCount: 2345,
      lastRun: '2024-01-10',
      impact: 'medium',
      automated: false,
      enabled: false
    },
    {
      id: '6',
      name: 'Orphaned Attachments',
      description: 'Remove files without database references',
      category: 'orphaned',
      estimatedSpace: '678 MB',
      recordCount: 1234,
      lastRun: '2024-01-12',
      impact: 'low',
      automated: false,
      enabled: false
    },
    {
      id: '7',
      name: 'Duplicate Customers',
      description: 'Find and merge duplicate customer records',
      category: 'duplicates',
      estimatedSpace: '12 MB',
      recordCount: 156,
      impact: 'high',
      automated: false,
      enabled: false
    },
    {
      id: '8',
      name: 'Duplicate Products',
      description: 'Identify duplicate product SKUs and consolidate',
      category: 'duplicates',
      estimatedSpace: '8 MB',
      recordCount: 89,
      impact: 'high',
      automated: false,
      enabled: false
    },
    {
      id: '9',
      name: 'Archived Orders',
      description: 'Move completed orders older than 1 year to archive',
      category: 'archived',
      estimatedSpace: '3.4 GB',
      recordCount: 12456,
      lastRun: '2024-01-01',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '10',
      name: 'Archived Transactions',
      description: 'Archive financial transactions older than 2 years',
      category: 'archived',
      estimatedSpace: '2.8 GB',
      recordCount: 45678,
      lastRun: '2024-01-01',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '11',
      name: 'Old Email Queue',
      description: 'Delete sent emails older than 30 days',
      category: 'logs',
      estimatedSpace: '456 MB',
      recordCount: 234567,
      lastRun: '2024-01-18',
      impact: 'low',
      automated: true,
      enabled: true
    },
    {
      id: '12',
      name: 'Audit Trail',
      description: 'Archive audit logs older than 3 years',
      category: 'archived',
      estimatedSpace: '5.6 GB',
      recordCount: 2345678,
      lastRun: '2024-01-01',
      impact: 'low',
      automated: true,
      enabled: true
    }
  ]);

  const [cleanupHistory, setCleanupHistory] = useState<CleanupHistory[]>([]);

  const loadCleanupHistory = useCallback(async () => {
    try {
      const records = await ItAdminService.getBackupRecords({ type: 'cleanup' });
      const mapped: CleanupHistory[] = (records ?? []).map((rec) => {
        const status: CleanupHistory['status'] =
          rec.status === 'success' || rec.status === 'partial' || rec.status === 'failed'
            ? rec.status
            : rec.status === 'completed'
              ? 'success'
              : 'partial';
        return {
          id: rec.id,
          taskName: rec.name,
          executedAt: rec.completedAt ?? rec.startedAt ?? rec.createdAt,
          recordsDeleted: 0,
          spaceFreed: rec.size ?? '',
          duration: rec.duration ?? '',
          status,
        };
      });
      setCleanupHistory(mapped);
    } catch {
      setCleanupHistory([]);
    }
  }, []);

  useEffect(() => {
    loadCleanupHistory();
  }, [loadCleanupHistory]);

  const categories = [
    { id: 'logs', name: 'Logs & History', icon: BarChart3, color: 'blue' },
    { id: 'temp', name: 'Temporary Data', icon: Clock, color: 'green' },
    { id: 'orphaned', name: 'Orphaned Data', icon: AlertTriangle, color: 'orange' },
    { id: 'duplicates', name: 'Duplicates', icon: CheckCircle, color: 'purple' },
    { id: 'archived', name: 'Archiving', icon: Archive, color: 'indigo' }
  ];

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleRunCleanup = () => {
    if (selectedTasks.length > 0) {
      setShowConfirmation(true);
    }
  };

  const confirmCleanup = async () => {
    try {
      await ItAdminService.createBackupRecord({
        name: 'Cleanup ' + new Date().toISOString(),
        type: 'cleanup',
        status: 'completed',
        automated: false,
      });
      await loadCleanupHistory();
    } catch {
      // best-effort; ignore failures
    }
    setShowConfirmation(false);
    setSelectedTasks([]);
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const totalEstimatedSpace = cleanupTasks
    .filter(task => selectedTasks.includes(task.id))
    .reduce((acc, task) => {
      const sizeInGB = parseFloat(task.estimatedSpace.replace(' GB', '').replace(' MB', '')) * (task.estimatedSpace.includes('MB') ? 0.001 : 1);
      return acc + sizeInGB;
    }, 0);

  const totalRecords = cleanupTasks
    .filter(task => selectedTasks.includes(task.id))
    .reduce((acc, task) => acc + task.recordCount, 0);

  const stats = {
    totalSpace: '18.9 GB',
    automatedTasks: cleanupTasks.filter(t => t.automated).length,
    enabledTasks: cleanupTasks.filter(t => t.enabled).length,
    lastCleanup: cleanupHistory[0]?.executedAt.split(' ')[0] || 'Never'
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2 w-full max-w-full">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Database Cleanup</h1>
          <p className="text-sm text-gray-500 mt-1">Manage data retention and optimize database storage</p>
        </div>
        <button
          onClick={handleRunCleanup}
          disabled={selectedTasks.length === 0}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          Run Cleanup {selectedTasks.length > 0 && `(${selectedTasks.length})`}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cleanable Space</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSpace}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Automated Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{stats.automatedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Enabled Tasks</p>
              <p className="text-2xl font-bold text-green-600">{stats.enabledTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Cleanup</p>
              <p className="text-lg font-bold text-gray-900">{stats.lastCleanup}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">
                {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                Estimated space to free: <span className="font-bold">{totalEstimatedSpace.toFixed(2)} GB</span> ({totalRecords.toLocaleString()} records)
              </p>
            </div>
            <button
              onClick={() => setSelectedTasks([])}
              className="text-sm text-blue-700 hover:text-blue-800 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Cleanup History */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Recent Cleanups</h2>

          <div className="space-y-3">
            {cleanupHistory.map((history) => (
              <div key={history.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-4 h-4 ${history.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`} />
                  <p className="font-semibold text-sm text-gray-900">{history.taskName}</p>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>{history.executedAt}</p>
                  <p className="text-green-700 font-medium">{history.spaceFreed} freed</p>
                  <p>{history.recordsDeleted.toLocaleString()} records • {history.duration}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-purple-900 mb-2">Total Freed</h3>
            <p className="text-3xl font-bold text-purple-900">3.7 GB</p>
            <p className="text-xs text-purple-700 mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Cleanup Tasks */}
        <div className="lg:col-span-3 space-y-3">
          {categories.map((category) => {
            const categoryTasks = cleanupTasks.filter(t => t.category === category.id);
            if (categoryTasks.length === 0) return null;

            const IconComponent = category.icon;

            return (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`w-5 h-5 ${getCategoryColor(category.color)}`} />
                  <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                  <span className="text-sm text-gray-600">({categoryTasks.length})</span>
                </div>

                <div className="space-y-3">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${selectedTasks.includes(task.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTask(task.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <h3 className="font-bold text-gray-900">{task.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(task.impact)}`}>
                              {task.impact.charAt(0).toUpperCase() + task.impact.slice(1)} Impact
                            </span>
                            {task.automated && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                Automated
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 ml-7">{task.description}</p>

                          <div className="grid grid-cols-3 gap-2 ml-7">
                            <div>
                              <p className="text-xs text-gray-600">Estimated Space</p>
                              <p className="font-semibold text-gray-900">{task.estimatedSpace}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Records</p>
                              <p className="font-semibold text-gray-900">{task.recordCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Last Run</p>
                              <p className="font-semibold text-gray-900">{task.lastRun || 'Never'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">Cleanup Safety Guidelines</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>High Impact:</strong> Review carefully before running - may affect operations</li>
                  <li>• <strong>Medium Impact:</strong> May require data validation after cleanup</li>
                  <li>• <strong>Low Impact:</strong> Safe to run - minimal operational impact</li>
                  <li>• Always create a backup before running cleanup tasks</li>
                  <li>• Test cleanup tasks on staging environment first</li>
                  <li>• Automated tasks run according to configured schedules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-md w-full p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Cleanup</h2>
            </div>

            <p className="text-gray-600 mb-2">
              You are about to run {selectedTasks.length} cleanup task{selectedTasks.length > 1 ? 's' : ''}.
              This will delete approximately <strong>{totalEstimatedSpace.toFixed(2)} GB</strong> of data
              ({totalRecords.toLocaleString()} records).
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. Ensure you have a recent backup.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmCleanup}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm & Run
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
