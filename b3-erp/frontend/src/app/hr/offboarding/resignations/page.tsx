'use client';

import { useState, useMemo, useEffect } from 'react';
import { LogOut, Plus, Calendar, User, FileText, X, CheckCircle, XCircle, Eye, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ResignationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriod: number;
  reason: string;
  status: 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'withdrawn';
  submittedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
  remarks?: string;
}

export default function ResignationsPage() {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequest | null>(null);
  const [acceptFormData, setAcceptFormData] = useState({
    acceptanceDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: '',
    remarks: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    reason: '',
    remarks: ''
  });

  const [mockResignations, setMockResignations] = useState<ResignationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resignationForm, setResignationForm] = useState({
    resignationDate: '',
    lastWorkingDay: '',
    reason: '',
    comments: '',
  });

  const loadResignations = async () => {
    try {
      setLoading(true);
      const records = await OffboardingTasksService.list('resignations');
      const mapped = records.map((r: OffboardingTaskRecord) => ({
        id: r.id,
        employeeCode: r.employeeCode || '',
        employeeName: r.employeeName || '',
        designation: r.designation || '',
        department: r.department || '',
        status: (r.status as any) || 'pending',
        ...(r.data || {}),
      })) as unknown as ResignationRequest[];
      setMockResignations(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResignations();
  }, []);

  const filteredResignations = useMemo(() => {
    if (selectedStatus === 'all') return mockResignations;
    return mockResignations.filter(r => r.status === selectedStatus);
  }, [selectedStatus, mockResignations]);

  const stats = {
    total: mockResignations.length,
    submitted: mockResignations.filter(r => r.status === 'submitted').length,
    underReview: mockResignations.filter(r => r.status === 'under-review').length,
    accepted: mockResignations.filter(r => r.status === 'accepted').length,
    rejected: mockResignations.filter(r => r.status === 'rejected').length
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    'under-review': 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-700'
  };

  const calculateTenure = (joiningDate: string, resignationDate: string) => {
    const start = new Date(joiningDate);
    const end = new Date(resignationDate);
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
  };

  const handleViewDetails = (resignation: ResignationRequest) => {
    setSelectedResignation(resignation);
    setShowDetailsModal(true);
  };

  const handleAccept = (resignation: ResignationRequest) => {
    setSelectedResignation(resignation);
    setAcceptFormData({
      acceptanceDate: new Date().toISOString().split('T')[0],
      lastWorkingDate: resignation.lastWorkingDay,
      remarks: ''
    });
    setShowAcceptModal(true);
  };

  const handleReject = (resignation: ResignationRequest) => {
    setSelectedResignation(resignation);
    setRejectFormData({
      reason: '',
      remarks: ''
    });
    setShowRejectModal(true);
  };

  const handleSubmitAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResignation || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedResignation.id, {
        status: 'accepted',
        data: {
          ...(selectedResignation as any),
          acceptanceDate: acceptFormData.acceptanceDate,
          lastWorkingDay: acceptFormData.lastWorkingDate,
          remarks: acceptFormData.remarks,
        },
      });
      toast({
        title: 'Resignation Accepted',
        description: `Resignation for ${selectedResignation.employeeName} has been accepted. Offboarding process initiated.`,
      });
      setShowAcceptModal(false);
      setSelectedResignation(null);
      await loadResignations();
    } catch {
      toast({ title: 'Failed to accept resignation', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResignation || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedResignation.id, {
        status: 'rejected',
        data: {
          ...(selectedResignation as any),
          rejectionReason: rejectFormData.reason,
          remarks: rejectFormData.remarks,
        },
      });
      toast({
        title: 'Resignation Rejected',
        description: `Resignation for ${selectedResignation.employeeName} has been rejected.`,
      });
      setShowRejectModal(false);
      setSelectedResignation(null);
      await loadResignations();
    } catch {
      toast({ title: 'Failed to reject resignation', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.create({
        feature: 'resignations',
        status: 'submitted',
        data: {
          resignationDate: resignationForm.resignationDate,
          lastWorkingDay: resignationForm.lastWorkingDay,
          reason: resignationForm.reason,
          remarks: resignationForm.comments,
          submittedOn: new Date().toISOString().split('T')[0],
        },
      });
      toast({
        title: 'Resignation Submitted',
        description: 'Your resignation has been submitted and is pending review.',
      });
      setResignationForm({ resignationDate: '', lastWorkingDay: '', reason: '', comments: '' });
      setShowSubmitForm(false);
      await loadResignations();
    } catch {
      toast({ title: 'Failed to submit resignation', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resignation Requests</h1>
          <p className="text-sm text-gray-600 mt-1">Manage employee resignation submissions</p>
        </div>
        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Submit Resignation
        </button>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading resignations…</div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <LogOut className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Submitted</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.underReview}</p>
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

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {showSubmitForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Submit Resignation</h2>
          <form onSubmit={handleSubmitResignation}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resignation Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={resignationForm.resignationDate}
                  onChange={(e) => setResignationForm({ ...resignationForm, resignationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intended Last Working Day <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={resignationForm.lastWorkingDay}
                  onChange={(e) => setResignationForm({ ...resignationForm, lastWorkingDay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Resignation <span className="text-red-500">*</span></label>
                <select
                  required
                  value={resignationForm.reason}
                  onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason</option>
                  <option>Better Opportunity</option>
                  <option>Higher Education</option>
                  <option>Personal Reasons</option>
                  <option>Health Issues</option>
                  <option>Relocation</option>
                  <option>Career Change</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                <textarea
                  rows={4}
                  placeholder="Please provide any additional details..."
                  value={resignationForm.comments}
                  onChange={(e) => setResignationForm({ ...resignationForm, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit Resignation'}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under-review">Under Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredResignations.map(resignation => (
          <div key={resignation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{resignation.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[resignation.status]}`}>
                    {resignation.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{resignation.designation} • {resignation.department}</p>
                <p className="text-xs text-gray-500 mt-1">Request ID: {resignation.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Resignation Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(resignation.resignationDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Working Day</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(resignation.lastWorkingDay).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notice Period</p>
                <p className="text-sm font-semibold text-gray-900">{resignation.noticePeriod} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Tenure</p>
                <p className="text-sm font-semibold text-gray-900">
                  {calculateTenure(resignation.joiningDate, resignation.resignationDate)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reason</p>
              <p className="text-sm text-gray-900">{resignation.reason}</p>
            </div>

            {resignation.reviewedBy && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                <p className="text-xs text-blue-500 uppercase font-medium mb-1">Review Details</p>
                <p className="text-sm text-blue-900">
                  Reviewed by {resignation.reviewedBy} on {new Date(resignation.reviewedOn!).toLocaleDateString('en-IN')}
                </p>
                {resignation.remarks && <p className="text-sm text-blue-800 mt-1">{resignation.remarks}</p>}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {resignation.status === 'submitted' && (
                <>
                  <button
                    onClick={() => handleAccept(resignation)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(resignation)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleViewDetails(resignation)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedResignation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedResignation.employeeName}</h2>
                  <p className="text-sm text-gray-600">{selectedResignation.designation} • {selectedResignation.department}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 ${
                selectedResignation.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                selectedResignation.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                selectedResignation.status === 'under-review' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  selectedResignation.status === 'accepted' ? 'text-green-700' :
                  selectedResignation.status === 'rejected' ? 'text-red-700' :
                  selectedResignation.status === 'under-review' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  Status: {selectedResignation.status.replace('-', ' ').toUpperCase()}
                </p>
              </div>

              {/* Employee Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-600" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Request ID</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.department}</p>
                  </div>
                </div>
              </div>

              {/* Resignation Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  Resignation Details
                </h3>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.joiningDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Tenure</p>
                    <p className="text-sm font-semibold text-gray-900">{calculateTenure(selectedResignation.joiningDate, selectedResignation.resignationDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Resignation Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.resignationDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Working Day</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.lastWorkingDay).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Notice Period</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.noticePeriod} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Submitted On</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.submittedOn).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Reason for Resignation</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedResignation.reason}</p>
                </div>
              </div>

              {/* Review Information */}
              {selectedResignation.reviewedBy && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Review Information</h3>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-blue-600">Reviewed By</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedResignation.reviewedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Reviewed On</p>
                        <p className="text-sm font-semibold text-blue-900">{new Date(selectedResignation.reviewedOn!).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    {selectedResignation.remarks && (
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Remarks</p>
                        <p className="text-sm text-blue-900">{selectedResignation.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                {selectedResignation.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleAccept(selectedResignation);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleReject(selectedResignation);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Resignation Modal */}
      {showAcceptModal && selectedResignation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-green-50 border-b border-green-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900">Accept Resignation</h2>
                  <p className="text-sm text-green-700 mt-1">{selectedResignation.employeeName} • {selectedResignation.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccept} className="p-6 space-y-3">
              {/* Employee Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Resignation Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.resignationDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Notice Period</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.noticePeriod} days</p>
                  </div>
                </div>
              </div>

              {/* Acceptance Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Acceptance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={acceptFormData.acceptanceDate}
                  onChange={(e) => setAcceptFormData({...acceptFormData, acceptanceDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Last Working Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={acceptFormData.lastWorkingDate}
                  onChange={(e) => setAcceptFormData({...acceptFormData, lastWorkingDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Remarks
                </label>
                <textarea
                  value={acceptFormData.remarks}
                  onChange={(e) => setAcceptFormData({...acceptFormData, remarks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Enter any remarks or instructions..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Acceptance Actions</p>
                    <ul className="text-xs text-green-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Offboarding process will be initiated automatically</li>
                      <li>Employee and manager will be notified via email</li>
                      <li>Clearance checklist will be created</li>
                      <li>Exit interview will be scheduled</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {submitting ? 'Accepting…' : 'Accept Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Resignation Modal */}
      {showRejectModal && selectedResignation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-red-50 border-b border-red-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-red-900">Reject Resignation</h2>
                  <p className="text-sm text-red-700 mt-1">{selectedResignation.employeeName} • {selectedResignation.id}</p>
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
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Requested Last Working Day</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedResignation.lastWorkingDay).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reason</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedResignation.reason}</p>
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
                  <option value="insufficient_notice">Insufficient Notice Period</option>
                  <option value="pending_projects">Pending Critical Projects</option>
                  <option value="contractual">Contractual Obligations Not Met</option>
                  <option value="documentation">Incomplete Documentation</option>
                  <option value="other">Other Reasons</option>
                </select>
              </div>

              {/* Detailed Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Detailed Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectFormData.remarks}
                  onChange={(e) => setRejectFormData({...rejectFormData, remarks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Provide detailed explanation for rejecting the resignation..."
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
                      <li>Employee will be notified via official communication</li>
                      <li>HR and reporting manager will be informed</li>
                      <li>Employee may need to re-submit with corrected information</li>
                      <li>Ensure proper justification is documented</li>
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
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {submitting ? 'Rejecting…' : 'Reject Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
