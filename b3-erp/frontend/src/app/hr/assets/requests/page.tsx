'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, X, Eye, Package, User, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrAssetsService } from '@/services/hr-assets.service';

interface AssetRequest {
  id: string;
  requestId: string;
  requestedBy: string;
  employeeCode: string;
  department: string;
  designation: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'monitor' | 'printer' | 'furniture' | 'other';
  assetType: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  requestDate: string;
  requiredBy: string;
  businessJustification: string;
  estimatedCost?: number;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  fulfilledDate?: string;
  assignedAssets?: string[];
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    requester: '',
    employeeCode: '',
    department: '',
    designation: '',
    assetCategory: 'laptop',
    assetName: '',
    quantity: 1,
    priority: 'medium',
    purpose: '',
    requiredBy: new Date().toISOString().split('T')[0],
  });
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [approveFormData, setApproveFormData] = useState({
    approvedBy: '',
    remarks: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    reason: '',
    remarks: ''
  });
  const [fulfillFormData, setFulfillFormData] = useState({
    assetTags: '',
    fulfilledDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [mockRequests, setMockRequests] = useState<AssetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetRequests();
        if (cancelled) return;
        setMockRequests(
          rows.map((r) => ({
            id: r.id,
            requestId: r.requestId || '',
            requestedBy: r.requester || '',
            employeeCode: r.employeeCode || '',
            department: r.department || '',
            designation: r.designation || '',
            assetCategory: (r.assetCategory as AssetRequest['assetCategory']) || 'other',
            assetType: r.assetName || '',
            quantity: Number(r.quantity ?? 0),
            priority: (r.priority as AssetRequest['priority']) || 'medium',
            status: (r.status as AssetRequest['status']) || 'pending',
            requestDate: r.requestDate || '',
            requiredBy: r.fulfillmentDate || r.requestDate || '',
            businessJustification: r.purpose || '',
            estimatedCost: undefined,
            approvedBy: r.approver || undefined,
            approvalDate: r.approvalDate || undefined,
            rejectionReason: r.remarks || undefined,
            fulfilledDate: r.fulfillmentDate || undefined,
            assignedAssets: undefined,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load requests');
          setMockRequests([]);
        }
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
    if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
    if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    fulfilled: mockRequests.filter(r => r.status === 'fulfilled').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length
  }), [mockRequests]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    fulfilled: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const categoryColors = {
    laptop: 'bg-blue-100 text-blue-700',
    desktop: 'bg-purple-100 text-purple-700',
    mobile: 'bg-green-100 text-green-700',
    tablet: 'bg-teal-100 text-teal-700',
    monitor: 'bg-indigo-100 text-indigo-700',
    printer: 'bg-pink-100 text-pink-700',
    furniture: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const handleViewDetails = (request: AssetRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApprove = (request: AssetRequest) => {
    setSelectedRequest(request);
    setApproveFormData({ approvedBy: '', remarks: '' });
    setShowApproveModal(true);
  };

  const handleReject = (request: AssetRequest) => {
    setSelectedRequest(request);
    setRejectFormData({ reason: '', remarks: '' });
    setShowRejectModal(true);
  };

  const handleFulfill = (request: AssetRequest) => {
    setSelectedRequest(request);
    setFulfillFormData({
      assetTags: '',
      fulfilledDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowFulfillModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await HrAssetsService.createAssetRequest({
        requester: createFormData.requester,
        employeeCode: createFormData.employeeCode,
        department: createFormData.department,
        designation: createFormData.designation,
        assetCategory: createFormData.assetCategory,
        assetName: createFormData.assetName,
        quantity: Number(createFormData.quantity),
        priority: createFormData.priority,
        purpose: createFormData.purpose,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
      toast({ title: 'Request Created', description: 'New asset request has been submitted.' });
      setShowCreateModal(false);
      setCreateFormData({
        requester: '', employeeCode: '', department: '', designation: '',
        assetCategory: 'laptop', assetName: '', quantity: 1, priority: 'medium',
        purpose: '', requiredBy: new Date().toISOString().split('T')[0],
      });
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast({ title: 'Creation failed', description: err instanceof Error ? err.message : 'Could not create request.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await HrAssetsService.updateAssetRequest(selectedRequest.id, {
        status: 'approved',
        approver: approveFormData.approvedBy,
        approvalDate: new Date().toISOString().split('T')[0],
        remarks: approveFormData.remarks || undefined,
      });
      toast({ title: 'Request Approved', description: `Asset request ${selectedRequest.requestId} has been approved.` });
      setShowApproveModal(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast({ title: 'Approval failed', description: err instanceof Error ? err.message : 'Could not approve request.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await HrAssetsService.updateAssetRequest(selectedRequest.id, {
        status: 'rejected',
        remarks: `${rejectFormData.reason}: ${rejectFormData.remarks}`,
      });
      toast({ title: 'Request Rejected', description: `Asset request ${selectedRequest.requestId} has been rejected.` });
      setShowRejectModal(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast({ title: 'Rejection failed', description: err instanceof Error ? err.message : 'Could not reject request.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await HrAssetsService.updateAssetRequest(selectedRequest.id, {
        status: 'fulfilled',
        fulfillmentDate: fulfillFormData.fulfilledDate,
        remarks: fulfillFormData.notes || undefined,
      });
      toast({ title: 'Request Fulfilled', description: `Asset request ${selectedRequest.requestId} has been marked as fulfilled.` });
      setShowFulfillModal(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast({ title: 'Fulfillment failed', description: err instanceof Error ? err.message : 'Could not fulfill request.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Asset Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track asset requests</p>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Approved</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Fulfilled</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.fulfilled}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
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
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
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
          <div className="flex items-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
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
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{request.assetType}</h3>
                    <p className="text-sm text-gray-600">{request.requestId} • {request.requestedBy} ({request.employeeCode})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[request.assetCategory]}`}>
                    {request.assetCategory.charAt(0).toUpperCase() + request.assetCategory.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[request.priority]}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estimated Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{request.estimatedCost?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-900">{request.department}</p>
                <p className="text-xs text-gray-600">{request.designation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Quantity</p>
                <p className="text-sm font-semibold text-gray-900">{request.quantity} {request.quantity > 1 ? 'units' : 'unit'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {new Date(request.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Required By</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(request.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Business Justification</p>
              <p className="text-sm text-gray-700">{request.businessJustification}</p>
            </div>

            {request.status === 'approved' && request.approvedBy && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700 uppercase font-medium">Approved</p>
                </div>
                <p className="text-sm text-blue-900">
                  Approved by {request.approvedBy} on {new Date(request.approvalDate!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}

            {request.status === 'fulfilled' && request.fulfilledDate && (
              <div className="bg-green-50 rounded-lg p-3 mb-2 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700 uppercase font-medium">Fulfilled</p>
                </div>
                <p className="text-sm text-green-900 mb-2">
                  Fulfilled on {new Date(request.fulfilledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {request.assignedAssets && request.assignedAssets.length > 0 && (
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Assigned Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {request.assignedAssets.map((asset, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white text-green-700 text-xs font-semibold rounded border border-green-300">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {request.status === 'rejected' && request.rejectionReason && (
              <div className="bg-red-50 rounded-lg p-3 mb-2 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-700 uppercase font-medium">Rejected</p>
                </div>
                <p className="text-sm text-red-900">{request.rejectionReason}</p>
              </div>
            )}

            {request.status === 'pending' && request.priority === 'urgent' && (
              <div className="bg-red-50 rounded-lg p-3 mb-2 border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-700 uppercase font-medium">Urgent - Awaiting Approval</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(request)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                <Eye className="inline h-4 w-4 mr-1" />
                View Details
              </button>
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(request)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    <CheckCircle className="inline h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                  >
                    <XCircle className="inline h-4 w-4 mr-1" />
                    Reject
                  </button>
                </>
              )}
              {request.status === 'approved' && (
                <button
                  onClick={() => handleFulfill(request)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  <Package className="inline h-4 w-4 mr-1" />
                  Mark as Fulfilled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6" />
                <h2 className="text-xl font-bold">Asset Request Details</h2>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedRequest.assetType}</h3>
                  <p className="text-gray-600">Request ID: {selectedRequest.requestId}</p>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[selectedRequest.status]}`}>
                  {selectedRequest.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    Requestor Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedRequest.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Employee Code</p>
                      <p className="font-medium text-gray-900">{selectedRequest.employeeCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{selectedRequest.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Designation</p>
                      <p className="font-medium text-gray-900">{selectedRequest.designation}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Asset Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600">Category</p>
                      <p className="font-medium text-blue-900 capitalize">{selectedRequest.assetCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Type/Model</p>
                      <p className="font-medium text-blue-900">{selectedRequest.assetType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Quantity</p>
                      <p className="font-medium text-blue-900">{selectedRequest.quantity} unit(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Estimated Cost</p>
                      <p className="font-medium text-blue-900 text-xl">₹{selectedRequest.estimatedCost?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  Timeline & Priority
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Request Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRequest.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Required By</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRequest.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${priorityColors[selectedRequest.priority]}`}>
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3 bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">Business Justification</h4>
                <p className="text-sm text-yellow-800">{selectedRequest.businessJustification}</p>
              </div>

              {selectedRequest.approvedBy && (
                <div className="mb-3 bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Approval Information
                  </h4>
                  <p className="text-sm text-green-800">
                    Approved by {selectedRequest.approvedBy} on {selectedRequest.approvalDate && new Date(selectedRequest.approvalDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}

              {selectedRequest.assignedAssets && selectedRequest.assignedAssets.length > 0 && (
                <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Assigned Assets</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.assignedAssets.map((asset, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-blue-700 text-sm font-semibold rounded border border-blue-300">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Approve Asset Request</h2>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">{selectedRequest.assetType}</h3>
                <p className="text-sm text-green-700">Request ID: {selectedRequest.requestId}</p>
                <p className="text-sm text-green-700">Requested by: {selectedRequest.requestedBy} ({selectedRequest.department})</p>
              </div>

              <div className="mb-3 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Estimated Cost</p>
                <p className="text-4xl font-bold text-blue-700">₹{selectedRequest.estimatedCost?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedRequest.quantity} unit(s) of {selectedRequest.assetType}
                </p>
              </div>

              <form onSubmit={handleSubmitApprove} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={approveFormData.approvedBy}
                    onChange={(e) => setApproveFormData({...approveFormData, approvedBy: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., John Doe - IT Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Remarks
                  </label>
                  <textarea
                    value={approveFormData.remarks}
                    onChange={(e) => setApproveFormData({...approveFormData, remarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes or conditions..."
                  />
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Approval Confirmation</p>
                      <p className="text-xs text-green-800 mt-1">
                        By approving this request, you authorize the procurement/allocation of the specified asset(s).
                        The request will move to fulfillment stage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-60"
                  >
                    {submitting ? 'Approving…' : 'Approve Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Reject Asset Request</h2>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-900 mb-2">{selectedRequest.assetType}</h3>
                <p className="text-sm text-red-700">Request ID: {selectedRequest.requestId}</p>
                <p className="text-sm text-red-700">Requested by: {selectedRequest.requestedBy} ({selectedRequest.department})</p>
              </div>

              <form onSubmit={handleSubmitReject} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectFormData.reason}
                    onChange={(e) => setRejectFormData({...rejectFormData, reason: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select rejection reason</option>
                    <option value="budget_constraints">Budget Constraints</option>
                    <option value="duplicate_request">Duplicate Request</option>
                    <option value="insufficient_justification">Insufficient Business Justification</option>
                    <option value="alternative_available">Alternative Asset Available</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectFormData.remarks}
                    onChange={(e) => setRejectFormData({...rejectFormData, remarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed explanation for rejection..."
                    required
                  />
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Rejection Notice</p>
                      <p className="text-xs text-red-800 mt-1">
                        The requestor will be notified of this rejection along with the reason and remarks provided.
                        They may resubmit the request with additional justification if applicable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-60"
                  >
                    {submitting ? 'Rejecting…' : 'Reject Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill Modal */}
      {showFulfillModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6" />
                <h2 className="text-xl font-bold">Fulfill Asset Request</h2>
              </div>
              <button onClick={() => setShowFulfillModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">{selectedRequest.assetType}</h3>
                <p className="text-sm text-blue-700">Request ID: {selectedRequest.requestId}</p>
                <p className="text-sm text-blue-700">Assign to: {selectedRequest.requestedBy} ({selectedRequest.employeeCode})</p>
              </div>

              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Asset Category</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedRequest.assetCategory}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity Requested</p>
                    <p className="font-medium text-gray-900">{selectedRequest.quantity} unit(s)</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[selectedRequest.priority]}`}>
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitFulfill} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Tag(s) / Serial Number(s) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={fulfillFormData.assetTags}
                    onChange={(e) => setFulfillFormData({...fulfillFormData, assetTags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter asset tags separated by commas (e.g., LAP-2024-001, LAP-2024-002)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For multiple assets, enter all asset tags/serial numbers separated by commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fulfillment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fulfillFormData.fulfilledDate}
                    onChange={(e) => setFulfillFormData({...fulfillFormData, fulfilledDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fulfillment Notes
                  </label>
                  <textarea
                    value={fulfillFormData.notes}
                    onChange={(e) => setFulfillFormData({...fulfillFormData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes, delivery instructions, or conditions..."
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Fulfillment Confirmation</p>
                      <p className="text-xs text-blue-800 mt-1">
                        By marking this request as fulfilled, you confirm that the specified asset(s) have been allocated
                        and delivered to the requestor. The assets will be assigned to the employee in the system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : 'Mark as Fulfilled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFulfillModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6" />
                <h2 className="text-xl font-bold">New Asset Request</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitCreate} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requester <span className="text-red-500">*</span></label>
                    <input type="text" value={createFormData.requester} onChange={(e) => setCreateFormData({ ...createFormData, requester: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                    <input type="text" value={createFormData.employeeCode} onChange={(e) => setCreateFormData({ ...createFormData, employeeCode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" value={createFormData.department} onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input type="text" value={createFormData.designation} onChange={(e) => setCreateFormData({ ...createFormData, designation: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                    <select value={createFormData.assetCategory} onChange={(e) => setCreateFormData({ ...createFormData, assetCategory: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="laptop">Laptop</option>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                      <option value="monitor">Monitor</option>
                      <option value="printer">Printer</option>
                      <option value="furniture">Furniture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name / Type <span className="text-red-500">*</span></label>
                    <input type="text" value={createFormData.assetName} onChange={(e) => setCreateFormData({ ...createFormData, assetName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" min={1} value={createFormData.quantity} onChange={(e) => setCreateFormData({ ...createFormData, quantity: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select value={createFormData.priority} onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Justification / Purpose</label>
                  <textarea value={createFormData.purpose} onChange={(e) => setCreateFormData({ ...createFormData, purpose: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60">
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
