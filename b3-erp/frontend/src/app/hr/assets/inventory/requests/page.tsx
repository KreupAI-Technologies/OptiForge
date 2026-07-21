'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, User, Calendar, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface AssetRequest {
  id: string;
  requestId: string;
  requestDate: string;
  requester: string;
  employeeCode: string;
  department: string;
  assetType: 'laptop' | 'desktop' | 'mobile' | 'monitor' | 'furniture' | 'other';
  assetName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  approver?: string;
  approvalDate?: string;
  fulfillmentDate?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fallbackRequests: AssetRequest[] = [
    {
      id: '1',
      requestId: 'REQ-2025-001',
      requestDate: '2025-10-20',
      requester: 'Rajesh Kumar',
      employeeCode: 'EMP345',
      department: 'Sales',
      assetType: 'laptop',
      assetName: 'Dell Latitude 5420',
      quantity: 1,
      priority: 'high',
      purpose: 'New joinee requirement',
      status: 'fulfilled',
      approver: 'IT Manager',
      approvalDate: '2025-10-21',
      fulfillmentDate: '2025-10-22'
    },
    {
      id: '2',
      requestId: 'REQ-2025-002',
      requestDate: '2025-10-22',
      requester: 'Priya Sharma',
      employeeCode: 'EMP412',
      department: 'Marketing',
      assetType: 'monitor',
      assetName: 'Dell 24" Monitor',
      quantity: 2,
      priority: 'medium',
      purpose: 'Dual monitor setup for design work',
      status: 'approved',
      approver: 'Admin Manager',
      approvalDate: '2025-10-23'
    },
    {
      id: '3',
      requestId: 'REQ-2025-003',
      requestDate: '2025-10-24',
      requester: 'Amit Patel',
      employeeCode: 'EMP287',
      department: 'Logistics',
      assetType: 'mobile',
      assetName: 'Samsung Galaxy S21',
      quantity: 1,
      priority: 'urgent',
      purpose: 'Field work - old phone damaged',
      status: 'pending'
    },
    {
      id: '4',
      requestId: 'REQ-2025-004',
      requestDate: '2025-10-23',
      requester: 'Sneha Reddy',
      employeeCode: 'EMP523',
      department: 'HR',
      assetType: 'furniture',
      assetName: 'Ergonomic Office Chair',
      quantity: 3,
      priority: 'low',
      purpose: 'New workstations setup',
      status: 'rejected',
      approver: 'Admin Manager',
      approvalDate: '2025-10-24',
      remarks: 'Budget constraints - defer to next quarter'
    },
    {
      id: '5',
      requestId: 'REQ-2025-005',
      requestDate: '2025-10-25',
      requester: 'Vikram Singh',
      employeeCode: 'EMP198',
      department: 'IT',
      assetType: 'desktop',
      assetName: 'HP Elite Desktop',
      quantity: 1,
      priority: 'high',
      purpose: 'Development workstation',
      status: 'pending'
    }
  ];

  const [mockRequests, setMockRequests] = useState<AssetRequest[]>(fallbackRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<AssetRequest | null>(null);

  const refresh = () => setReloadKey((k) => k + 1);

  const handleUpdateStatus = async (
    request: AssetRequest,
    payload: Partial<{ status: string; approver: string; approvalDate: string; fulfillmentDate: string; remarks: string }>,
  ) => {
    setBusyId(request.id);
    setActionError(null);
    try {
      await HrAssetsService.updateAssetRequest(request.id, payload);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (request: AssetRequest) =>
    handleUpdateStatus(request, {
      status: 'approved',
      approver: 'Admin Manager',
      approvalDate: new Date().toISOString().split('T')[0],
    });

  const handleReject = (request: AssetRequest) =>
    handleUpdateStatus(request, {
      status: 'rejected',
      approver: 'Admin Manager',
      approvalDate: new Date().toISOString().split('T')[0],
    });

  const handleFulfill = (request: AssetRequest) =>
    handleUpdateStatus(request, {
      status: 'fulfilled',
      fulfillmentDate: new Date().toISOString().split('T')[0],
    });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetRequests();
        if (cancelled) return;
        if (rows.length) {
          setMockRequests(
            rows.map((r) => ({
              id: r.id,
              requestId: r.requestId || '',
              requestDate: r.requestDate || '',
              requester: r.requester || '',
              employeeCode: r.employeeCode || '',
              department: r.department || '',
              assetType: (r.assetCategory as AssetRequest['assetType']) || 'other',
              assetName: r.assetName || '',
              quantity: Number(r.quantity ?? 0),
              priority: (r.priority as AssetRequest['priority']) || 'medium',
              purpose: r.purpose || '',
              status: (r.status as AssetRequest['status']) || 'pending',
              approver: r.approver || undefined,
              approvalDate: r.approvalDate || undefined,
              fulfillmentDate: r.fulfillmentDate || undefined,
              remarks: r.remarks || undefined,
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load requests');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredRequests = mockRequests.filter(r => {
    const statusMatch = selectedStatus === 'all' || r.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || r.priority === selectedPriority;
    const deptMatch = selectedDepartment === 'all' || r.department === selectedDepartment;
    return statusMatch && priorityMatch && deptMatch;
  });

  const stats = useMemo(() => ({
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    fulfilled: mockRequests.filter(r => r.status === 'fulfilled').length
  }), [mockRequests]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    fulfilled: 'bg-green-100 text-green-700'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Asset Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Manage employee asset requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Requests</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Approved</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Fulfilled</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.fulfilled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-2">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{request.assetName}</h3>
                    <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[request.priority]}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{request.quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requester</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {request.requester}
                </p>
                <p className="text-xs text-gray-600">{request.employeeCode} • {request.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Type</p>
                <p className="text-sm font-semibold text-gray-900">{request.assetType.charAt(0).toUpperCase() + request.assetType.slice(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purpose</p>
                <p className="text-sm text-gray-700">{request.purpose}</p>
              </div>
            </div>

            {(request.approver || request.remarks) && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                {request.approver && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approval Details</p>
                    <p className="text-sm text-gray-700">
                      Approved by: {request.approver} on {request.approvalDate && new Date(request.approvalDate).toLocaleDateString('en-IN')}
                    </p>
                    {request.fulfillmentDate && (
                      <p className="text-sm text-green-600">
                        Fulfilled on: {new Date(request.fulfillmentDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                )}
                {request.remarks && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-gray-700">{request.remarks}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setDetailRequest(request)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                View Details
              </button>
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={busyId === request.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-60"
                  >
                    {busyId === request.id ? 'Working…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    disabled={busyId === request.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              )}
              {request.status === 'approved' && (
                <button
                  onClick={() => handleFulfill(request)}
                  disabled={busyId === request.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60"
                >
                  {busyId === request.id ? 'Working…' : 'Mark as Fulfilled'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3" onClick={() => setDetailRequest(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold">Request Details</h2>
              <button onClick={() => setDetailRequest(null)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{detailRequest.assetName}</h3>
                <p className="text-sm text-gray-600">Request ID: {detailRequest.requestId}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500 uppercase">Requester</p><p className="font-medium text-gray-900">{detailRequest.requester} ({detailRequest.employeeCode})</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Department</p><p className="font-medium text-gray-900">{detailRequest.department}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Asset Type</p><p className="font-medium text-gray-900 capitalize">{detailRequest.assetType}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Quantity</p><p className="font-medium text-gray-900">{detailRequest.quantity}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Priority</p><p className="font-medium text-gray-900 capitalize">{detailRequest.priority}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Status</p><p className="font-medium text-gray-900 capitalize">{detailRequest.status}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Request Date</p><p className="font-medium text-gray-900">{detailRequest.requestDate}</p></div>
                {detailRequest.approver && <div><p className="text-xs text-gray-500 uppercase">Approver</p><p className="font-medium text-gray-900">{detailRequest.approver}</p></div>}
              </div>
              <div><p className="text-xs text-gray-500 uppercase">Purpose</p><p className="text-sm text-gray-700">{detailRequest.purpose}</p></div>
              {detailRequest.remarks && <div><p className="text-xs text-gray-500 uppercase">Remarks</p><p className="text-sm text-gray-700">{detailRequest.remarks}</p></div>}
              <button onClick={() => setDetailRequest(null)} className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
