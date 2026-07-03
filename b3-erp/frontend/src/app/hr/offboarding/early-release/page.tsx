'use client';

import { useState, useEffect } from 'react';
import { FastForward, Plus, AlertCircle } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface EarlyReleaseRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  noticePeriod: number;
  daysServed: number;
  daysToWaive: number;
  requestDate: string;
  proposedReleaseDate: string;
  reason: string;
  buyoutAmount?: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedOn?: string;
  remarks?: string;
}

export default function EarlyReleasePage() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [mockRequests, setMockRequests] = useState<EarlyReleaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('early-release');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as EarlyReleaseRequest[];
        setMockRequests(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockRequests: EarlyReleaseRequest[] = [
    {
      id: 'ER001',
      employeeId: 'EMP001',
      employeeName: 'Rahul Sharma',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
      noticePeriod: 60,
      daysServed: 30,
      daysToWaive: 30,
      requestDate: '2025-10-25',
      proposedReleaseDate: '2025-11-15',
      reason: 'New employer requires earlier joining',
      buyoutAmount: 180000,
      status: 'approved',
      approvedBy: 'CTO',
      approvedOn: '2025-10-26',
      remarks: 'Handover completed successfully'
    },
    {
      id: 'ER002',
      employeeId: 'EMP002',
      employeeName: 'Priya Singh',
      designation: 'Marketing Manager',
      department: 'Marketing',
      noticePeriod: 30,
      daysServed: 15,
      daysToWaive: 15,
      requestDate: '2025-10-26',
      proposedReleaseDate: '2025-11-05',
      reason: 'Family emergency - relocation required',
      status: 'pending'
    }
  ];

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Early Release Requests</h1>
          <p className="text-sm text-gray-600 mt-1">Request waiver of remaining notice period</p>
        </div>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Request Early Release
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FastForward className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Request Early Release</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Release Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days to Waive</label>
              <input
                type="number"
                placeholder="Number of days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Early Release</label>
              <textarea
                rows={4}
                placeholder="Please provide detailed reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">I agree to pay notice period buyout amount if applicable</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Submit Request
            </button>
            <button
              onClick={() => setShowRequestForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {mockRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{request.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{request.designation} • {request.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notice Period</p>
                <p className="text-sm font-semibold text-gray-900">{request.noticePeriod} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Days Served</p>
                <p className="text-sm font-semibold text-gray-900">{request.daysServed} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Days to Waive</p>
                <p className="text-sm font-semibold text-red-600">{request.daysToWaive} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Proposed Release</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(request.proposedReleaseDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reason</p>
              <p className="text-sm text-gray-900">{request.reason}</p>
            </div>

            {request.buyoutAmount && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                <p className="text-xs text-purple-500 uppercase font-medium mb-1">Notice Period Buyout</p>
                <p className="text-sm text-purple-900 font-semibold">
                  Amount: ₹{request.buyoutAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Calculated based on {request.daysToWaive} days remaining notice period
                </p>
              </div>
            )}

            {request.approvedBy && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                <p className="text-xs text-green-500 uppercase font-medium mb-1">Approval Details</p>
                <p className="text-sm text-green-900">
                  Approved by {request.approvedBy} on {new Date(request.approvedOn!).toLocaleDateString('en-IN')}
                </p>
                {request.remarks && <p className="text-sm text-green-800 mt-1">{request.remarks}</p>}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {request.status === 'pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    Reject
                  </button>
                </>
              )}
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Early Release Policy
        </h3>
        <ul className="text-sm text-orange-800 space-y-1 ml-7">
          <li>• Early release requires approval from reporting manager and department head</li>
          <li>• Employee must complete handover documentation and knowledge transfer</li>
          <li>• Notice period buyout = (Daily Gross Salary × Remaining Days)</li>
          <li>• Buyout amount deducted from final settlement</li>
          <li>• Early release not granted if critical project deliverables pending</li>
          <li>• Minimum 50% of notice period must be served</li>
        </ul>
      </div>
    </div>
  );
}
