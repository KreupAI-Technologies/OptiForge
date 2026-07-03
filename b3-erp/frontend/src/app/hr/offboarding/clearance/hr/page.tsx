'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

export default function HRClearancePage() {
  const [mockClearances, setMockClearances] = useState<
    Array<{ id: string; employeeName: string; status: string; items: any[]; [k: string]: any }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('clearance-hr');
        if (!active) return;
        setMockClearances(
          records.map((r: OffboardingTaskRecord) => ({
            id: r.id,
            employeeName: r.employeeName || '',
            status: r.status || 'pending',
            items: r.items || [],
            ...(r.data || {}),
          })),
        );
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const _unusedMockClearances = [
    {
      id: 'HR001',
      employeeName: 'Rahul Sharma',
      items: [
        { name: 'Exit Interview Completed', status: 'completed' },
        { name: 'ID Card Returned', status: 'completed' },
        { name: 'Employee Handbook Returned', status: 'completed' },
        { name: 'Knowledge Transfer Documentation', status: 'completed' },
        { name: 'No Dues Certificate', status: 'pending' },
        { name: 'Final Settlement Initiated', status: 'pending' }
      ],
      status: 'in-progress'
    }
  ];

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">HR Department Clearance</h1>
        <p className="text-sm text-gray-600 mt-1">HR documentation and formalities</p>
      </div>

      {mockClearances.map(clearance => (
        <div key={clearance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{clearance.employeeName}</h3>
          <div className="space-y-3">
            {clearance.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{item.name}</p>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  item.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
            <CheckCircle className="inline h-4 w-4 mr-2" />
            Complete HR Clearance
          </button>
        </div>
      ))}
    </div>
  );
}
