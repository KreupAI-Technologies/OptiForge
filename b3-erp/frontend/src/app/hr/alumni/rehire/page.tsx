'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, CheckCircle, Clock, XCircle, Calendar, Briefcase, Mail, Phone, TrendingUp, AlertCircle, X, Eye, ThumbsUp, ThumbsDown, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface RehireCandidate {
  id: string;
  employeeCode: string;
  name: string;
  previousDesignation: string;
  department: string;
  exitDate: string;
  exitReason: string;
  tenure: string;
  proposedDesignation: string;
  proposedDepartment: string;
  proposedCTC: number;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  eligibilityScore: number;
  performanceRating: string;
  noticePeriodServed: boolean;
  pendingDues: boolean;
  backgroundCheckStatus: 'pending' | 'cleared' | 'issues';
  comments?: string;
}

export default function Page() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RehireCandidate | null>(null);
  const [approveFormData, setApproveFormData] = useState({
    joiningDate: '',
    offerCTC: 0,
    approvalRemarks: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    rejectionReason: '',
    detailedRemarks: ''
  });
  const [holdFormData, setHoldFormData] = useState({
    holdReason: '',
    expectedResolutionDate: '',
    remarks: ''
  });
  const [rows, setRows] = useState<RehireCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getAlumni({ kind: 'rehire' });
        const mapped: RehireCandidate[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          name: r.name ?? '',
          previousDesignation: r.previousDesignation ?? '',
          department: r.department ?? '',
          exitDate: r.exitDate ?? '',
          exitReason: r.reasonForLeaving ?? '',
          tenure: r.tenure ?? '',
          proposedDesignation: r.proposedDesignation ?? '',
          proposedDepartment: r.proposedDepartment ?? '',
          proposedCTC: Number(r.proposedCTC ?? 0),
          requestedBy: r.requestedBy ?? '',
          requestDate: r.requestDate ?? '',
          status: (r.status as RehireCandidate['status']) ?? 'pending',
          eligibilityScore: Number(r.eligibilityScore ?? 0),
          performanceRating: r.performanceRating ?? '',
          noticePeriodServed: false,
          pendingDues: false,
          backgroundCheckStatus: (r.backgroundCheckStatus as RehireCandidate['backgroundCheckStatus']) ?? 'pending',
          comments: r.comments ?? undefined,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load rehire candidates');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockCandidates: RehireCandidate[] = rows.length ? rows : [
    {
      id: '1',
      employeeCode: 'EMP001',
      name: 'Rajesh Kumar',
      previousDesignation: 'Senior Production Manager',
      department: 'Production',
      exitDate: '2024-08-31',
      exitReason: 'Career Growth',
      tenure: '6 years 5 months',
      proposedDesignation: 'General Manager - Production',
      proposedDepartment: 'Production',
      proposedCTC: 1800000,
      requestedBy: 'Suresh Iyer (VP Operations)',
      requestDate: '2025-10-15',
      status: 'pending',
      eligibilityScore: 95,
      performanceRating: 'Excellent',
      noticePeriodServed: true,
      pendingDues: false,
      backgroundCheckStatus: 'cleared',
      comments: 'Excellent track record. Left for higher position at Tata Motors. Willing to return.'
    },
    {
      id: '2',
      employeeCode: 'EMP123',
      name: 'Amit Patel',
      previousDesignation: 'Quality Assurance Lead',
      department: 'Quality',
      exitDate: '2023-12-31',
      exitReason: 'Career Growth',
      tenure: '6 years 10 months',
      proposedDesignation: 'Quality Manager',
      proposedDepartment: 'Quality',
      proposedCTC: 1500000,
      requestedBy: 'Madhav Singh (Head QA)',
      requestDate: '2025-10-10',
      status: 'approved',
      eligibilityScore: 92,
      performanceRating: 'Outstanding',
      noticePeriodServed: true,
      pendingDues: false,
      backgroundCheckStatus: 'cleared',
      comments: 'Six Sigma Black Belt certified. High performer.'
    },
    {
      id: '3',
      employeeCode: 'EMP078',
      name: 'Sneha Reddy',
      previousDesignation: 'Maintenance Engineer',
      department: 'Maintenance',
      exitDate: '2024-06-30',
      exitReason: 'Career Growth',
      tenure: '4 years 5 months',
      proposedDesignation: 'Senior Maintenance Engineer',
      proposedDepartment: 'Maintenance',
      proposedCTC: 1200000,
      requestedBy: 'Ramesh Nair (Maintenance Head)',
      requestDate: '2025-10-05',
      status: 'on_hold',
      eligibilityScore: 85,
      performanceRating: 'Good',
      noticePeriodServed: true,
      pendingDues: false,
      backgroundCheckStatus: 'pending',
      comments: 'Awaiting background verification clearance from L&T.'
    },
    {
      id: '4',
      employeeCode: 'EMP145',
      name: 'Karthik Menon',
      previousDesignation: 'Production Supervisor',
      department: 'Production',
      exitDate: '2023-03-15',
      exitReason: 'Personal Reasons',
      tenure: '3 years 2 months',
      proposedDesignation: 'Production Supervisor',
      proposedDepartment: 'Production',
      proposedCTC: 900000,
      requestedBy: 'Suresh Iyer (VP Operations)',
      requestDate: '2025-09-25',
      status: 'rejected',
      eligibilityScore: 65,
      performanceRating: 'Average',
      noticePeriodServed: false,
      pendingDues: true,
      backgroundCheckStatus: 'issues',
      comments: 'Did not serve full notice period. Pending dues of ₹25,000.'
    }
  ];

  const filteredCandidates = mockCandidates.filter(c =>
    selectedStatus === 'all' || c.status === selectedStatus
  );

  const stats = {
    total: mockCandidates.length,
    pending: mockCandidates.filter(c => c.status === 'pending').length,
    approved: mockCandidates.filter(c => c.status === 'approved').length,
    rejected: mockCandidates.filter(c => c.status === 'rejected').length,
    avgEligibilityScore: Math.round(
      mockCandidates.reduce((sum, c) => sum + c.eligibilityScore, 0) / mockCandidates.length
    )
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-orange-100 text-orange-700'
  };

  const getEligibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewDetails = (candidate: RehireCandidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const handleApprove = (candidate: RehireCandidate) => {
    setSelectedCandidate(candidate);
    setApproveFormData({
      joiningDate: '',
      offerCTC: candidate.proposedCTC,
      approvalRemarks: ''
    });
    setShowApproveModal(true);
  };

  const handleReject = (candidate: RehireCandidate) => {
    setSelectedCandidate(candidate);
    setRejectFormData({
      rejectionReason: '',
      detailedRemarks: ''
    });
    setShowRejectModal(true);
  };

  const handleHold = (candidate: RehireCandidate) => {
    setSelectedCandidate(candidate);
    setHoldFormData({
      holdReason: '',
      expectedResolutionDate: '',
      remarks: ''
    });
    setShowHoldModal(true);
  };

  const submitApproval = () => {
    toast({
      title: "Rehire Approved",
      description: `${selectedCandidate?.name}'s rehire request has been approved.`
    });
    setShowApproveModal(false);
  };

  const submitRejection = () => {
    toast({
      title: "Rehire Rejected",
      description: `${selectedCandidate?.name}'s rehire request has been rejected.`
    });
    setShowRejectModal(false);
  };

  const submitHold = () => {
    toast({
      title: "Request On Hold",
      description: `${selectedCandidate?.name}'s rehire request has been put on hold.`
    });
    setShowHoldModal(false);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Alumni Rehire Process</h1>
        <p className="text-sm text-gray-600 mt-1">Manage rehiring requests for former employees</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading rehire candidates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Score</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgEligibilityScore}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'on_hold', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Requests' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rehire Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Role
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposed Role
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eligibility
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-semibold text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-600">{candidate.employeeCode}</div>
                      <div className="text-xs text-gray-500">Exit: {candidate.exitDate}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.previousDesignation}</div>
                      <div className="text-xs text-gray-600">{candidate.department}</div>
                      <div className="text-xs text-gray-500">Tenure: {candidate.tenure}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.proposedDesignation}</div>
                      <div className="text-xs text-gray-600">{candidate.proposedDepartment}</div>
                      <div className="text-xs text-gray-900 font-semibold">
                        ₹{(candidate.proposedCTC / 100000).toFixed(1)}L
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className={`text-2xl font-bold ${getEligibilityColor(candidate.eligibilityScore)}`}>
                        {candidate.eligibilityScore}
                      </div>
                      <div className="text-xs text-gray-600">{candidate.performanceRating}</div>
                      <div className="flex gap-1 mt-1">
                        {candidate.noticePeriodServed && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Notice Served
                          </span>
                        )}
                        {candidate.pendingDues && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            Dues Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[candidate.status]}`}>
                      {candidate.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(candidate)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {candidate.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(candidate)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Approve"
                          >
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleHold(candidate)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Put On Hold"
                          >
                            <Pause className="w-4 h-4 text-orange-600" />
                          </button>
                          <button
                            onClick={() => handleReject(candidate)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Reject"
                          >
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <UserPlus className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rehire requests found</h3>
          <p className="text-gray-600">No requests match the selected filter</p>
        </div>
      )}

      {/* Eligibility Criteria Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Rehire Eligibility Criteria</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Minimum eligibility score: 70/100</li>
              <li>• Notice period must be served (full/buyout)</li>
              <li>• No pending dues or clearances</li>
              <li>• Performance rating: Good or above</li>
              <li>• Background verification clearance required</li>
              <li>• Cooling period: Minimum 6 months from exit date</li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">Rehire Request Details</h2>
                <p className="text-sm text-blue-100 mt-1">{selectedCandidate.employeeCode}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Candidate Information */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Candidate Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employee Code</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exit Date</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.exitDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exit Reason</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.exitReason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tenure</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.tenure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance Rating</p>
                    <p className="font-semibold text-green-600">{selectedCandidate.performanceRating}</p>
                  </div>
                </div>
              </div>

              {/* Previous vs Proposed Role */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Previous Role
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">Designation</p>
                      <p className="font-semibold text-blue-900">{selectedCandidate.previousDesignation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Department</p>
                      <p className="font-semibold text-blue-900">{selectedCandidate.department}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Proposed Role
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-green-600">Designation</p>
                      <p className="font-semibold text-green-900">{selectedCandidate.proposedDesignation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Department</p>
                      <p className="font-semibold text-green-900">{selectedCandidate.proposedDepartment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Proposed CTC</p>
                      <p className="font-bold text-green-900 text-lg">
                        ₹{(selectedCandidate.proposedCTC / 100000).toFixed(1)}L per annum
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Assessment */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3">Eligibility Assessment</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 mb-1">Eligibility Score</p>
                    <p className={`text-3xl font-bold ${getEligibilityColor(selectedCandidate.eligibilityScore)}`}>
                      {selectedCandidate.eligibilityScore}/100
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-600 mb-1">Notice Period</p>
                    <p className={`text-lg font-bold ${selectedCandidate.noticePeriodServed ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCandidate.noticePeriodServed ? '✓ Served' : '✗ Not Served'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-600 mb-1">Pending Dues</p>
                    <p className={`text-lg font-bold ${!selectedCandidate.pendingDues ? 'text-green-600' : 'text-red-600'}`}>
                      {!selectedCandidate.pendingDues ? '✓ Clear' : '✗ Pending'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-purple-600 mb-1">Background Check Status</p>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedCandidate.backgroundCheckStatus === 'cleared' ? 'bg-green-100 text-green-700' :
                    selectedCandidate.backgroundCheckStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedCandidate.backgroundCheckStatus.charAt(0).toUpperCase() + selectedCandidate.backgroundCheckStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h3 className="font-bold text-orange-900 mb-3">Request Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-orange-600">Requested By</p>
                    <p className="font-semibold text-orange-900">{selectedCandidate.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600">Request Date</p>
                    <p className="font-semibold text-orange-900">{selectedCandidate.requestDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-orange-600">Comments</p>
                    <p className="font-semibold text-orange-900">{selectedCandidate.comments || 'No comments provided'}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span className="text-gray-700 font-medium">Current Status:</span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[selectedCandidate.status]}`}>
                  {selectedCandidate.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              {selectedCandidate.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApprove(selectedCandidate);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleHold(selectedCandidate);
                    }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Put On Hold
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleReject(selectedCandidate);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">Approve Rehire Request</h2>
                <p className="text-sm text-green-100 mt-1">{selectedCandidate.name} - {selectedCandidate.employeeCode}</p>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Proposed Position Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h3 className="font-bold text-green-900 mb-3">Proposed Position</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-green-600">Designation</p>
                    <p className="font-semibold text-green-900">{selectedCandidate.proposedDesignation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Department</p>
                    <p className="font-semibold text-green-900">{selectedCandidate.proposedDepartment}</p>
                  </div>
                </div>
              </div>

              {/* Approval Form */}
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={approveFormData.joiningDate}
                    onChange={(e) => setApproveFormData({...approveFormData, joiningDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer CTC (₹ per annum) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={approveFormData.offerCTC}
                    onChange={(e) => setApproveFormData({...approveFormData, offerCTC: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Proposed CTC: ₹{(selectedCandidate.proposedCTC / 100000).toFixed(1)}L
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={approveFormData.approvalRemarks}
                    onChange={(e) => setApproveFormData({...approveFormData, approvalRemarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter approval remarks, special conditions, or notes..."
                    required
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Next Steps After Approval</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Offer letter will be generated automatically</li>
                      <li>• HR will coordinate with the candidate for joining formalities</li>
                      <li>• Background verification (if pending) must be completed before joining</li>
                      <li>• All pending dues (if any) must be cleared before joining</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">Reject Rehire Request</h2>
                <p className="text-sm text-red-100 mt-1">{selectedCandidate.name} - {selectedCandidate.employeeCode}</p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Candidate Summary */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Candidate Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Previous Designation</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.previousDesignation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proposed Designation</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.proposedDesignation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eligibility Score</p>
                    <p className={`font-bold ${getEligibilityColor(selectedCandidate.eligibilityScore)}`}>
                      {selectedCandidate.eligibilityScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance Rating</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.performanceRating}</p>
                  </div>
                </div>
              </div>

              {/* Rejection Form */}
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectFormData.rejectionReason}
                    onChange={(e) => setRejectFormData({...rejectFormData, rejectionReason: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select rejection reason</option>
                    <option value="eligibility_score">Low Eligibility Score</option>
                    <option value="performance_concerns">Performance Concerns</option>
                    <option value="notice_period">Notice Period Not Served</option>
                    <option value="pending_dues">Pending Dues/Clearances</option>
                    <option value="background_check">Background Check Issues</option>
                    <option value="position_filled">Position Already Filled</option>
                    <option value="exit_circumstances">Exit Circumstances</option>
                    <option value="other">Other Reasons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectFormData.detailedRemarks}
                    onChange={(e) => setRejectFormData({...rejectFormData, detailedRemarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed explanation for the rejection..."
                    required
                  />
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Important Notice</p>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• This action cannot be undone</li>
                      <li>• The candidate and requesting manager will be notified</li>
                      <li>• Detailed remarks are required for record-keeping</li>
                      <li>• Future rehire requests may be affected</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {showHoldModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">Put Rehire Request On Hold</h2>
                <p className="text-sm text-orange-100 mt-1">{selectedCandidate.name} - {selectedCandidate.employeeCode}</p>
              </div>
              <button
                onClick={() => setShowHoldModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Candidate Summary */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Candidate Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proposed Role</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.proposedDesignation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested By</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.requestedBy}</p>
                  </div>
                </div>
              </div>

              {/* Hold Form */}
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hold Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={holdFormData.holdReason}
                    onChange={(e) => setHoldFormData({...holdFormData, holdReason: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select hold reason</option>
                    <option value="background_verification">Awaiting Background Verification</option>
                    <option value="clearance_pending">Clearance Pending</option>
                    <option value="budget_approval">Budget Approval Pending</option>
                    <option value="position_review">Position Under Review</option>
                    <option value="reference_check">Reference Check in Progress</option>
                    <option value="additional_info">Additional Information Required</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Resolution Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={holdFormData.expectedResolutionDate}
                    onChange={(e) => setHoldFormData({...holdFormData, expectedResolutionDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated date by which the hold reason will be resolved
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={holdFormData.remarks}
                    onChange={(e) => setHoldFormData({...holdFormData, remarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide additional context or action items..."
                    required
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900 mb-1">While On Hold</p>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• The request will be marked as "On Hold"</li>
                      <li>• Both the candidate and requesting manager will be notified</li>
                      <li>• You can resume processing once the hold reason is resolved</li>
                      <li>• Regular follow-ups will be sent before the expected resolution date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowHoldModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitHold}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Put On Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
