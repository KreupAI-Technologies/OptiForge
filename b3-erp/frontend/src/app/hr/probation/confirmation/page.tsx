'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Users, Clock, XCircle, FileText, Calendar, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrTalentService } from '@/services/hr-talent.service';

interface ConfirmationRequest {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  joiningDate: string;
  probationEndDate: string;
  reviewScore: number;
  attendance: number;
  recommendation: 'confirm' | 'extend' | 'terminate';
  recommender: string;
  status: 'pending' | 'approved' | 'rejected';
  confirmationDate?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConfirmationRequest | null>(null);
  const [approveFormData, setApproveFormData] = useState({
    confirmationDate: '',
    remarks: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    reason: '',
    remarks: ''
  });

  const [rows, setRows] = useState<ConfirmationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getProbation<ConfirmationRequest>('confirmation');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredRequests = rows.filter(r =>
    selectedStatus === 'all' || r.status === selectedStatus
  );

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    rejected: rows.filter(r => r.status === 'rejected').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const recommendationColors = {
    confirm: 'bg-green-100 text-green-700',
    extend: 'bg-orange-100 text-orange-700',
    terminate: 'bg-red-100 text-red-700'
  };

  const handleApprove = (request: ConfirmationRequest) => {
    setSelectedRequest(request);
    setApproveFormData({
      confirmationDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setShowApproveModal(true);
  };

  const handleReject = (request: ConfirmationRequest) => {
    setSelectedRequest(request);
    setRejectFormData({
      reason: '',
      remarks: ''
    });
    setShowRejectModal(true);
  };

  const handleSubmitApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await HrTalentService.updateProbation<ConfirmationRequest>(selectedRequest.id, {
        status: 'approved',
        data: {
          status: 'approved',
          confirmationDate: approveFormData.confirmationDate,
          remarks: approveFormData.remarks,
        },
      });
      toast({
        title: "Confirmation Approved",
        description: `${selectedRequest.name} has been successfully confirmed and will receive a confirmation letter.`
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'approved', confirmationDate: approveFormData.confirmationDate, remarks: approveFormData.remarks }
            : r,
        ),
      );
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : 'Could not approve the confirmation',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await HrTalentService.updateProbation<ConfirmationRequest>(selectedRequest.id, {
        status: 'rejected',
        data: {
          status: 'rejected',
          remarks: `${rejectFormData.reason}: ${rejectFormData.remarks}`,
        },
      });
      toast({
        title: "Confirmation Rejected",
        description: `Confirmation request for ${selectedRequest.name} has been rejected. HR will be notified.`
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'rejected', remarks: `${rejectFormData.reason}: ${rejectFormData.remarks}` }
            : r,
        ),
      );
      setShowRejectModal(false);
      setSelectedRequest(null);
    } catch (err) {
      toast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : 'Could not reject the confirmation',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Confirmation Process</h1>
        <p className="text-sm text-gray-600 mt-1">Process probation confirmation requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{request.name}</h3>
                <p className="text-sm text-gray-600">{request.designation} • {request.employeeCode}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 mb-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Department:</span>
                <span className="font-semibold text-gray-900">{request.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Probation End:</span>
                <span className="font-semibold text-gray-900">{request.probationEndDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Review Score:</span>
                <span className="font-semibold text-green-600">{request.reviewScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Attendance:</span>
                <span className="font-semibold text-blue-600">{request.attendance}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recommendation:</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${recommendationColors[request.recommendation]}`}>
                  {request.recommendation.charAt(0).toUpperCase() + request.recommendation.slice(1)}
                </span>
              </div>
            </div>

            {request.remarks && (
              <div className="bg-gray-50 rounded p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-gray-700">{request.remarks}</p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-green-50 border-b border-green-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900">Approve Confirmation</h2>
                  <p className="text-sm text-green-700 mt-1">{selectedRequest.name} • {selectedRequest.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitApprove} className="p-6 space-y-3">
              {/* Employee Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Confirmation Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.joiningDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Probation End Date</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.probationEndDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Review Score</p>
                    <p className="text-sm font-semibold text-green-600">{selectedRequest.reviewScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Attendance</p>
                    <p className="text-sm font-semibold text-blue-600">{selectedRequest.attendance}%</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={approveFormData.confirmationDate}
                  onChange={(e) => setApproveFormData({...approveFormData, confirmationDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmation Remarks
                </label>
                <textarea
                  value={approveFormData.remarks}
                  onChange={(e) => setApproveFormData({...approveFormData, remarks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Enter any remarks or notes about the confirmation..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Confirmation Actions</p>
                    <ul className="text-xs text-green-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Employee will receive a confirmation letter via email</li>
                      <li>Employment status will be updated to "Confirmed"</li>
                      <li>HR records will be automatically updated</li>
                      <li>Reporting manager will be notified</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isSubmitting ? 'Approving…' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-red-50 border-b border-red-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-red-900">Reject Confirmation</h2>
                  <p className="text-sm text-red-700 mt-1">{selectedRequest.name} • {selectedRequest.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="p-6 space-y-3">
              {/* Employee Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Review Score</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.reviewScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Manager's Recommendation</p>
                    <p className={`text-sm font-semibold px-2 py-0.5 rounded inline-block ${recommendationColors[selectedRequest.recommendation]}`}>
                      {selectedRequest.recommendation.charAt(0).toUpperCase() + selectedRequest.recommendation.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectFormData.reason}
                  onChange={(e) => setRejectFormData({...rejectFormData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select rejection reason</option>
                  <option value="performance">Inadequate Performance</option>
                  <option value="attendance">Attendance Issues</option>
                  <option value="behavior">Behavioral Concerns</option>
                  <option value="skillgap">Skill Gap</option>
                  <option value="other">Other Reasons</option>
                </select>
              </div>

              {/* Additional Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Detailed Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectFormData.remarks}
                  onChange={(e) => setRejectFormData({...rejectFormData, remarks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Provide detailed explanation for the rejection decision..."
                  required
                />
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Rejection Consequences</p>
                    <ul className="text-xs text-red-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Employment will be terminated as per company policy</li>
                      <li>Employee will be notified via official communication</li>
                      <li>Exit process will be initiated automatically</li>
                      <li>HR and reporting manager will be informed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  {isSubmitting ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
