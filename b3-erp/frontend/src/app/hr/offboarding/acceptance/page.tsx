'use client';

import { useState, useEffect } from 'react';
import { Check, FileText, Calendar } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ResignationAcceptance {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  resignationDate: string;
  requestedLWD: string;
  acceptedLWD: string;
  noticePeriod: number;
  status: 'pending-acceptance' | 'accepted' | 'accepted-with-changes';
  acceptedBy?: string;
  acceptedOn?: string;
  acceptanceLetterGenerated?: boolean;
  remarks?: string;
}

export default function AcceptancePage() {
  const [mockAcceptances, setMockAcceptances] = useState<ResignationAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('acceptance');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as ResignationAcceptance[];
        setMockAcceptances(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockAcceptances: ResignationAcceptance[] = [
    {
      id: 'ACC001',
      employeeId: 'EMP001',
      employeeName: 'Rahul Sharma',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
      resignationDate: '2025-10-15',
      requestedLWD: '2025-12-14',
      acceptedLWD: '2025-12-14',
      noticePeriod: 60,
      status: 'accepted',
      acceptedBy: 'HR Manager',
      acceptedOn: '2025-10-18',
      acceptanceLetterGenerated: true,
      remarks: 'Resignation accepted as per company policy'
    },
    {
      id: 'ACC002',
      employeeId: 'EMP002',
      employeeName: 'Priya Singh',
      designation: 'Marketing Manager',
      department: 'Marketing',
      resignationDate: '2025-10-20',
      requestedLWD: '2025-11-19',
      acceptedLWD: '2025-11-19',
      noticePeriod: 30,
      status: 'pending-acceptance',
      acceptedBy: undefined
    },
    {
      id: 'ACC003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Finance Executive',
      department: 'Finance',
      resignationDate: '2025-10-25',
      requestedLWD: '2025-11-24',
      acceptedLWD: '2025-12-24',
      noticePeriod: 60,
      status: 'accepted-with-changes',
      acceptedBy: 'HR Manager',
      acceptedOn: '2025-10-26',
      acceptanceLetterGenerated: true,
      remarks: 'LWD extended by 30 days due to project commitments'
    }
  ];

  const stats = {
    total: mockAcceptances.length,
    pendingAcceptance: mockAcceptances.filter(a => a.status === 'pending-acceptance').length,
    accepted: mockAcceptances.filter(a => a.status === 'accepted').length,
    acceptedWithChanges: mockAcceptances.filter(a => a.status === 'accepted-with-changes').length
  };

  const statusColors = {
    'pending-acceptance': 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    'accepted-with-changes': 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Resignation Acceptance</h1>
        <p className="text-sm text-gray-600 mt-1">Accept resignation requests and generate acceptance letters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Check className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingAcceptance}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Accepted</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">With Changes</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.acceptedWithChanges}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {mockAcceptances.map(acceptance => (
          <div key={acceptance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{acceptance.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[acceptance.status]}`}>
                    {acceptance.status.replace(/-/g, ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{acceptance.designation} • {acceptance.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Resignation Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(acceptance.resignationDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requested LWD</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(acceptance.requestedLWD).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Accepted LWD</p>
                <p className={`text-sm font-semibold ${
                  acceptance.requestedLWD !== acceptance.acceptedLWD ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {new Date(acceptance.acceptedLWD).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notice Period</p>
                <p className="text-sm font-semibold text-gray-900">{acceptance.noticePeriod} days</p>
              </div>
            </div>

            {acceptance.status === 'accepted-with-changes' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                <p className="text-xs text-blue-500 uppercase font-medium mb-1">Changes Made</p>
                <p className="text-sm text-blue-900">
                  Last Working Day modified from {new Date(acceptance.requestedLWD).toLocaleDateString('en-IN')}
                  to {new Date(acceptance.acceptedLWD).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {acceptance.acceptedBy && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                <p className="text-xs text-green-500 uppercase font-medium mb-1">Acceptance Details</p>
                <p className="text-sm text-green-900">
                  Accepted by {acceptance.acceptedBy} on {new Date(acceptance.acceptedOn!).toLocaleDateString('en-IN')}
                </p>
                {acceptance.remarks && <p className="text-sm text-green-800 mt-1">{acceptance.remarks}</p>}
                {acceptance.acceptanceLetterGenerated && (
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700">Acceptance letter generated</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {acceptance.status === 'pending-acceptance' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Accept as Requested
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Accept with Changes
                  </button>
                </>
              )}
              {acceptance.acceptanceLetterGenerated && (
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm">
                  Download Acceptance Letter
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
          <Check className="h-5 w-5" />
          Resignation Acceptance Process
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Review resignation request and verify notice period compliance</li>
          <li>• Verify if employee has pending deliverables or handover responsibilities</li>
          <li>• Accept LWD as requested or propose alternative date with justification</li>
          <li>• Generate formal acceptance letter on company letterhead</li>
          <li>• Initiate offboarding checklist and clearance process</li>
          <li>• Communicate acceptance to employee and relevant stakeholders</li>
        </ul>
      </div>
    </div>
  );
}
