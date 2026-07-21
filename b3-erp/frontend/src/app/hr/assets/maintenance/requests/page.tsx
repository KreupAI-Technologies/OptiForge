'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wrench, User, Clock, AlertCircle, X } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface MaintenanceRequest {
  id: string;
  requestId: string;
  assetTag: string;
  assetName: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'monitor' | 'printer' | 'server' | 'network' | 'other';
  requestedBy: string;
  employeeCode: string;
  department: string;
  issueType: 'hardware_failure' | 'software_issue' | 'performance' | 'peripheral' | 'network' | 'other';
  issueDescription: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestDate: string;
  expectedDate?: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'on_hold';
  assignedTo?: string;
  approvedBy?: string;
  approvalDate?: string;
  estimatedCost?: number;
  location: string;
  contactNumber: string;
  attachments?: number;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailRequest, setDetailRequest] = useState<MaintenanceRequest | null>(null);
  const [showForm, setShowForm] = useState(false);


  const [mockRequests, setMockRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const applyTransition = async (
    item: MaintenanceRequest,
    payload: Partial<{ status: string; approvalDate: string }>,
  ) => {
    setTransitioningId(item.id);
    setLoadError(null);
    try {
      await HrAssetsService.updateAssetMaintenance(item.id, payload);
      setDetailRequest(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update request');
    } finally {
      setTransitioningId(null);
    }
  };

  const emptyForm = {
    assetTag: '',
    assetName: '',
    assetCategory: 'laptop',
    requestedBy: '',
    employeeCode: '',
    department: '',
    issueType: 'hardware_failure',
    issueDescription: '',
    priority: 'medium',
    location: '',
    contactNumber: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await HrAssetsService.createAssetMaintenance({
        recordType: 'request',
        assetTag: form.assetTag,
        assetName: form.assetName,
        assetCategory: form.assetCategory,
        requestedBy: form.requestedBy,
        employeeCode: form.employeeCode,
        department: form.department,
        issueType: form.issueType,
        issueDescription: form.issueDescription,
        priority: form.priority,
        requestDate: new Date().toISOString().slice(0, 10),
        status: 'pending',
        location: form.location,
        contactNumber: form.contactNumber,
      });
      setMockRequests((prev) => [
        {
          id: created.id,
          requestId: created.requestId || '',
          assetTag: created.assetTag || form.assetTag,
          assetName: created.assetName || form.assetName,
          assetCategory: (created.assetCategory as MaintenanceRequest['assetCategory']) || (form.assetCategory as MaintenanceRequest['assetCategory']),
          requestedBy: created.requestedBy || form.requestedBy,
          employeeCode: created.employeeCode || form.employeeCode,
          department: created.department || form.department,
          issueType: (created.issueType as MaintenanceRequest['issueType']) || (form.issueType as MaintenanceRequest['issueType']),
          issueDescription: created.issueDescription || form.issueDescription,
          priority: (created.priority as MaintenanceRequest['priority']) || (form.priority as MaintenanceRequest['priority']),
          requestDate: created.requestDate || new Date().toISOString().slice(0, 10),
          expectedDate: created.expectedDate || undefined,
          status: (created.status as MaintenanceRequest['status']) || 'pending',
          assignedTo: created.assignedTo || undefined,
          approvedBy: created.approvedBy || undefined,
          approvalDate: created.approvalDate || undefined,
          estimatedCost: created.estimatedCost != null ? Number(created.estimatedCost) : undefined,
          location: created.location || form.location,
          contactNumber: created.contactNumber || form.contactNumber,
          remarks: created.remarks || undefined,
        },
        ...prev,
      ]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetMaintenance('request');
        if (cancelled) return;
        {
          setMockRequests(
            rows.map((r) => ({
              id: r.id,
              requestId: r.requestId || '',
              assetTag: r.assetTag || '',
              assetName: r.assetName || '',
              assetCategory: (r.assetCategory as MaintenanceRequest['assetCategory']) || 'other',
              requestedBy: r.requestedBy || '',
              employeeCode: r.employeeCode || '',
              department: r.department || '',
              issueType: (r.issueType as MaintenanceRequest['issueType']) || 'other',
              issueDescription: r.issueDescription || '',
              priority: (r.priority as MaintenanceRequest['priority']) || 'medium',
              requestDate: r.requestDate || '',
              expectedDate: r.expectedDate || undefined,
              status: (r.status as MaintenanceRequest['status']) || 'pending',
              assignedTo: r.assignedTo || undefined,
              approvedBy: r.approvedBy || undefined,
              approvalDate: r.approvalDate || undefined,
              estimatedCost: r.estimatedCost != null ? Number(r.estimatedCost) : undefined,
              location: r.location || '',
              contactNumber: r.contactNumber || '',
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
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
    if (selectedCategory !== 'all' && r.assetCategory !== selectedCategory) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    inProgress: mockRequests.filter(r => r.status === 'in_progress').length,
    critical: mockRequests.filter(r => r.priority === 'critical' && (r.status === 'pending' || r.status === 'approved' || r.status === 'in_progress')).length,
    completed: mockRequests.filter(r => r.status === 'completed').length
  }), [mockRequests]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-gray-100 text-gray-700'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const categoryColors = {
    laptop: 'bg-blue-100 text-blue-700',
    desktop: 'bg-purple-100 text-purple-700',
    mobile: 'bg-green-100 text-green-700',
    monitor: 'bg-orange-100 text-orange-700',
    printer: 'bg-pink-100 text-pink-700',
    server: 'bg-red-100 text-red-700',
    network: 'bg-indigo-100 text-indigo-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const issueTypeLabel = {
    hardware_failure: 'Hardware Failure',
    software_issue: 'Software Issue',
    performance: 'Performance Issue',
    peripheral: 'Peripheral Issue',
    network: 'Network Issue',
    other: 'Other'
  };

  const statusLabel = {
    pending: 'Pending',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    on_hold: 'On Hold'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Raise and track asset maintenance requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Requests</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">In Progress</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Critical</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="printer">Printer</option>
              <option value="server">Server</option>
              <option value="network">Network</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowForm(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              New Request
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{request.assetName}</h3>
                    <p className="text-sm text-gray-600">Request: {request.requestId} • Asset: {request.assetTag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[request.assetCategory]}`}>
                    {request.assetCategory.charAt(0).toUpperCase() + request.assetCategory.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[request.priority]}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {statusLabel[request.status]}
                  </span>
                  {request.priority === 'critical' && (request.status === 'pending' || request.status === 'approved') && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Urgent Attention Required
                    </span>
                  )}
                </div>
              </div>
              {request.estimatedCost && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-blue-600">₹{request.estimatedCost.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Type</p>
              <p className="text-sm font-semibold text-gray-900 mb-2">{issueTypeLabel[request.issueType]}</p>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-gray-700">{request.issueDescription}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requested By</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-500" />
                  {request.requestedBy}
                </p>
                <p className="text-xs text-gray-600">{request.employeeCode} • {request.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {new Date(request.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{request.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact</p>
                <p className="text-sm font-semibold text-gray-900">{request.contactNumber}</p>
              </div>
            </div>

            {request.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                    <p className="text-sm font-semibold text-blue-900">{request.assignedTo}</p>
                  </div>
                  {request.approvedBy && (
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-medium mb-1">Approved By</p>
                      <p className="text-sm font-semibold text-blue-900">{request.approvedBy}</p>
                      <p className="text-xs text-blue-700">{request.approvalDate && new Date(request.approvalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {request.remarks && (
              <div className={`rounded-lg p-3 mb-2 ${request.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-xs uppercase font-medium mb-1 flex items-center gap-1 ${request.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                  <AlertCircle className="h-3 w-3" />
                  Remarks
                </p>
                <p className={`text-sm ${request.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'}`}>{request.remarks}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {request.attachments && (
                  <span>{request.attachments} attachment{request.attachments > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <button onClick={() => applyTransition(request, { status: 'approved', approvalDate: new Date().toISOString().slice(0, 10) })} disabled={transitioningId === request.id} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50">
                      Approve
                    </button>
                    <button onClick={() => applyTransition(request, { status: 'rejected' })} disabled={transitioningId === request.id} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">
                      Reject
                    </button>
                  </>
                )}
                {request.status === 'approved' && (
                  <button onClick={() => applyTransition(request, { status: 'in_progress' })} disabled={transitioningId === request.id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">
                    Start Work
                  </button>
                )}
                {request.status === 'in_progress' && (
                  <button onClick={() => applyTransition(request, { status: 'completed' })} disabled={transitioningId === request.id} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:opacity-50">
                    Mark Completed
                  </button>
                )}
                <button onClick={() => setDetailRequest(request)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {detailRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Maintenance Request Details</h2>
              <button onClick={() => setDetailRequest(null)} className="text-white hover:text-orange-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Name</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.assetName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Tag</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.assetTag}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request ID</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.requestId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requested By</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.requestedBy}</p>
                  <p className="text-xs text-gray-600">{detailRequest.employeeCode} • {detailRequest.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Type</p>
                  <p className="text-gray-900 font-semibold">{issueTypeLabel[detailRequest.issueType]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Priority</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.priority.charAt(0).toUpperCase() + detailRequest.priority.slice(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                  <p className="text-gray-900 font-semibold">{statusLabel[detailRequest.status]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.requestDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact Number</p>
                  <p className="text-gray-900 font-semibold">{detailRequest.contactNumber}</p>
                </div>
                {detailRequest.assignedTo && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                    <p className="text-gray-900 font-semibold">{detailRequest.assignedTo}</p>
                  </div>
                )}
                {detailRequest.approvedBy && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approved By</p>
                    <p className="text-gray-900 font-semibold">{detailRequest.approvedBy}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Description</p>
                  <p className="text-gray-700">{detailRequest.issueDescription}</p>
                </div>
                {detailRequest.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-gray-700">{detailRequest.remarks}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setDetailRequest(null)} className="w-full mt-5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">New Maintenance Request</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-blue-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              {submitError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                  <input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                  <input value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                  <select value={form.assetCategory} onChange={(e) => setForm({ ...form, assetCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="monitor">Monitor</option>
                    <option value="printer">Printer</option>
                    <option value="server">Server</option>
                    <option value="network">Network</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                  <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                  <input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                  <select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="hardware_failure">Hardware Failure</option>
                    <option value="software_issue">Software Issue</option>
                    <option value="performance">Performance Issue</option>
                    <option value="peripheral">Peripheral Issue</option>
                    <option value="network">Network Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {isSubmitting ? 'Creating…' : 'Create Request'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
