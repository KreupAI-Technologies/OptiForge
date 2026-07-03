'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, User } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface NoticePeriodTracker {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriod: number;
  daysServed: number;
  daysRemaining: number;
  status: 'serving' | 'completed' | 'early-release' | 'bought-out';
  buyoutAmount?: number;
}

export default function NoticePeriodPage() {
  const [mockNoticePeriods, setMockNoticePeriods] = useState<NoticePeriodTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('notice-period');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as NoticePeriodTracker[];
        setMockNoticePeriods(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockNoticePeriods: NoticePeriodTracker[] = [
    {
      id: 'NP001',
      employeeId: 'EMP001',
      employeeName: 'Rahul Sharma',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
      resignationDate: '2025-10-15',
      lastWorkingDay: '2025-12-14',
      noticePeriod: 60,
      daysServed: 12,
      daysRemaining: 48,
      status: 'serving'
    },
    {
      id: 'NP002',
      employeeId: 'EMP002',
      employeeName: 'Priya Singh',
      designation: 'Marketing Manager',
      department: 'Marketing',
      resignationDate: '2025-10-20',
      lastWorkingDay: '2025-11-19',
      noticePeriod: 30,
      daysServed: 7,
      daysRemaining: 23,
      status: 'serving'
    },
    {
      id: 'NP003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Finance Executive',
      department: 'Finance',
      resignationDate: '2025-08-25',
      lastWorkingDay: '2025-09-24',
      noticePeriod: 30,
      daysServed: 30,
      daysRemaining: 0,
      status: 'completed'
    }
  ];

  const stats = {
    total: mockNoticePeriods.length,
    serving: mockNoticePeriods.filter(n => n.status === 'serving').length,
    completed: mockNoticePeriods.filter(n => n.status === 'completed').length,
    earlyRelease: mockNoticePeriods.filter(n => n.status === 'early-release').length
  };

  const statusColors = {
    serving: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    'early-release': 'bg-blue-100 text-blue-700',
    'bought-out': 'bg-purple-100 text-purple-700'
  };

  const getProgressPercentage = (daysServed: number, noticePeriod: number) => {
    return Math.min((daysServed / noticePeriod) * 100, 100);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Notice Period Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor employee notice period completion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Serving Notice</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.serving}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Early Release</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.earlyRelease}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {mockNoticePeriods.map(notice => (
          <div key={notice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{notice.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[notice.status]}`}>
                    {notice.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notice.designation} • {notice.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Resignation Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(notice.resignationDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Working Day</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(notice.lastWorkingDay).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notice Period</p>
                <p className="text-sm font-semibold text-gray-900">{notice.noticePeriod} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Days Remaining</p>
                <p className="text-sm font-semibold text-gray-900">{notice.daysRemaining} days</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">
                  {notice.daysServed}/{notice.noticePeriod} days ({Math.round(getProgressPercentage(notice.daysServed, notice.noticePeriod))}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    notice.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${getProgressPercentage(notice.daysServed, notice.noticePeriod)}%` }}
                />
              </div>
            </div>

            {notice.buyoutAmount && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                <p className="text-xs text-purple-500 uppercase font-medium mb-1">Notice Period Buyout</p>
                <p className="text-sm text-purple-900">Buyout Amount: ₹{notice.buyoutAmount.toLocaleString('en-IN')}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {notice.status === 'serving' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Request Early Release
                </button>
              )}
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Notice Period Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Standard notice period: 30-90 days based on designation</li>
          <li>• Early release requires management approval and handover completion</li>
          <li>• Notice period buyout calculated based on remaining days and salary</li>
          <li>• Employees must complete knowledge transfer and handover documentation</li>
          <li>• HR clearance required before final relieving</li>
        </ul>
      </div>
    </div>
  );
}
