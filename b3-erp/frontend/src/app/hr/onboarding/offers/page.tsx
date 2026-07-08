'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Send, Eye, Download, Plus, Edit, AlertCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface OfferLetter {
  id: string;
  offerNumber: string;
  candidateName: string;
  designation: string;
  department: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  ctc: number;
  joiningDate: string;
  offerDate: string;
  validTill: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sentBy: string;
  sentDate?: string;
  respondedDate?: string;
  location: string;
  reportingTo: string;
}

export default function Page() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);

  const [mockOffers, setMockOffers] = useState<OfferLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const records = await OnboardingTasksService.list('offers');
      const mapped = records.map((r: OnboardingTaskRecord) => ({
        id: r.id,
        employeeCode: r.employeeCode || '',
        employeeName: r.employeeName || '',
        designation: r.designation || '',
        department: r.department || '',
        joiningDate: r.joiningDate || '',
        status: (r.status as any) || 'pending',
        ...(r.data || {}),
      })) as unknown as OfferLetter[];
      setMockOffers(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    return mockOffers.filter(offer =>
      selectedStatus === 'all' || offer.status === selectedStatus
    );
  }, [selectedStatus, mockOffers]);

  const stats = {
    total: mockOffers.length,
    draft: mockOffers.filter(o => o.status === 'draft').length,
    sent: mockOffers.filter(o => o.status === 'sent').length,
    accepted: mockOffers.filter(o => o.status === 'accepted').length,
    rejected: mockOffers.filter(o => o.status === 'rejected').length,
    expired: mockOffers.filter(o => o.status === 'expired').length,
    acceptanceRate: (() => {
      const decided = mockOffers.filter(o => ['accepted', 'rejected'].includes(o.status)).length;
      return decided > 0
        ? Math.round((mockOffers.filter(o => o.status === 'accepted').length / decided) * 100)
        : 0;
    })()
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: Clock,
      sent: Send,
      accepted: CheckCircle,
      rejected: XCircle,
      expired: XCircle
    };
    const Icon = icons[status as keyof typeof icons];
    return <Icon className="h-4 w-4" />;
  };

  const handleViewDetails = (offer: OfferLetter) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const handleDownload = (offer: OfferLetter) => {
    toast({
      title: "Downloading Offer Letter",
      description: `Downloading ${offer.offerNumber} for ${offer.candidateName}`
    });
  };

  const handleSendOffer = (offer: OfferLetter) => {
    setSelectedOffer(offer);
    setShowSendModal(true);
  };

  const confirmSendOffer = async () => {
    if (!selectedOffer || submitting) return;
    setSubmitting(true);
    try {
      await OnboardingTasksService.update(selectedOffer.id, {
        status: 'sent',
        data: {
          ...(selectedOffer as any),
          sentDate: new Date().toISOString().split('T')[0],
        },
      });
      toast({
        title: 'Offer Letter Sent',
        description: `Offer letter ${selectedOffer.offerNumber} has been sent to ${selectedOffer.candidateName}`,
      });
      setShowSendModal(false);
      setSelectedOffer(null);
      await loadOffers();
    } catch {
      toast({ title: 'Failed to send offer', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'offerNumber', label: 'Offer No.', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'candidateName', label: 'Candidate', sortable: true,
      render: (v: string, row: OfferLetter) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: OfferLetter) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Reports to: {row.reportingTo}</div>
        </div>
      )
    },
    { key: 'employmentType', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'ctc', label: 'CTC (Annual)', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-gray-900">₹{(v / 100000).toFixed(1)}L</div>
    },
    { key: 'joiningDate', label: 'Joining Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'validTill', label: 'Valid Till', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {getStatusIcon(v)}
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: OfferLetter) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="p-1 hover:bg-blue-100 rounded"
            title="Download offer letter"
          >
            <Download className="h-4 w-4 text-blue-600" />
          </button>
          {row.status === 'draft' && (
            <button
              onClick={() => handleSendOffer(row)}
              className="p-1 hover:bg-green-100 rounded"
              title="Send offer letter"
            >
              <Send className="h-4 w-4 text-green-600" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading offers…</div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Offer Letters
          </h1>
          <p className="text-gray-600 mt-2">Manage job offers for selected candidates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Offer Letter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
            </div>
            <Send className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
            </div>
            <XCircle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accept Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.acceptanceRate}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <DataTable data={filteredOffers} columns={columns} />

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Offer Letter Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure all offer details are accurate before sending to candidate</li>
          <li>• Offer letters are valid for 30 days from the date of issue</li>
          <li>• Accepted offers automatically trigger onboarding checklist creation</li>
          <li>• CTC includes basic salary, allowances, and employer contributions</li>
          <li>• All offers must be approved by Department Head and HR Manager</li>
          <li>• Candidates can accept/reject offers through the candidate portal</li>
        </ul>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Offer Letter Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status Banner */}
              <div className={`rounded-lg p-3 ${
                selectedOffer.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                selectedOffer.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                selectedOffer.status === 'expired' ? 'bg-orange-50 border border-orange-200' :
                selectedOffer.status === 'sent' ? 'bg-blue-50 border border-blue-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedOffer.status)}
                  <span className="font-semibold">
                    Status: {selectedOffer.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Offer Number</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.offerNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Offer Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOffer.offerDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Candidate Name</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.candidateName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reporting To</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.reportingTo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{selectedOffer.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {selectedOffer.employmentType.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">Compensation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Annual CTC</p>
                    <p className="text-2xl font-bold text-green-600">₹{(selectedOffer.ctc / 100000).toFixed(2)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Gross (Approx)</p>
                    <p className="text-xl font-bold text-green-600">₹{(selectedOffer.ctc / 12).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Joining Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedOffer.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Till</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedOffer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {selectedOffer.sentDate && (
                    <div>
                      <p className="text-sm text-gray-600">Sent Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOffer.sentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {selectedOffer.respondedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Responded Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOffer.respondedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedOffer);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Letter
                </button>
                {selectedOffer.status === 'draft' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleSendOffer(selectedOffer);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Offer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Offer Confirmation Modal */}
      {showSendModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Send className="h-6 w-6 text-green-600" />
                Send Offer Letter
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  Are you sure you want to send this offer letter?
                </p>
                <div className="mt-3 space-y-1 text-sm text-green-800">
                  <p><strong>Offer Number:</strong> {selectedOffer.offerNumber}</p>
                  <p><strong>Candidate:</strong> {selectedOffer.candidateName}</p>
                  <p><strong>Designation:</strong> {selectedOffer.designation}</p>
                  <p><strong>CTC:</strong> ₹{(selectedOffer.ctc / 100000).toFixed(2)}L</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                The candidate will receive the offer letter via email and can accept/reject through the candidate portal.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendOffer}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Send Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
