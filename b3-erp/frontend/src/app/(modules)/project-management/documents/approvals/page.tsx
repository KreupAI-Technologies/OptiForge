'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  User,
  Calendar,
  Mail,
  PenTool,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  documentNumber: string;
  documentName: string;
  version: string;
  documentType: string;
  projectName: string;
  sentToClient: string;
  clientEmail: string;
  sentDate: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  approvedBy?: string;
  approvalDate?: string;
  signatureUrl?: string;
  comments?: string;
  remindersSent: number;
}

const mockApprovals: ApprovalRequest[] = [
  {
    id: '1',
    documentNumber: 'D-2025-001',
    documentName: 'Equipment Layout Drawing - Rev 3',
    version: '3.0',
    documentType: 'Drawing',
    projectName: 'Taj Hotels - Commercial Kitchen Setup',
    sentToClient: 'Mr. Rajesh Kumar',
    clientEmail: 'rajesh.kumar@tajhotels.com',
    sentDate: '2025-01-20',
    dueDate: '2025-01-25',
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Kumar',
    approvalDate: '2025-01-22',
    signatureUrl: '/signatures/sign-001.png',
    comments: 'Layout approved. Please proceed with fabrication.',
    remindersSent: 0,
  },
  {
    id: '2',
    documentNumber: 'D-2025-002',
    documentName: 'Electrical SLD - Rev 2',
    version: '2.0',
    documentType: 'Drawing',
    projectName: 'Taj Hotels - Commercial Kitchen Setup',
    sentToClient: 'Mr. Rajesh Kumar',
    clientEmail: 'rajesh.kumar@tajhotels.com',
    sentDate: '2025-01-21',
    dueDate: '2025-01-26',
    status: 'Pending',
    remindersSent: 1,
  },
  {
    id: '3',
    documentNumber: 'D-2025-013',
    documentName: 'Kitchen Appliance Specifications',
    version: '1.0',
    documentType: 'Specification',
    projectName: 'Taj Hotels - Commercial Kitchen Setup',
    sentToClient: 'Mr. Rajesh Kumar',
    clientEmail: 'rajesh.kumar@tajhotels.com',
    sentDate: '2025-01-18',
    dueDate: '2025-01-23',
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Kumar',
    approvalDate: '2025-01-20',
    signatureUrl: '/signatures/sign-002.png',
    comments: 'Specifications meet our requirements.',
    remindersSent: 0,
  },
  {
    id: '4',
    documentNumber: 'D-2025-014',
    documentName: 'Refrigeration Equipment Specifications',
    version: '1.0',
    documentType: 'Specification',
    projectName: 'BigBasket Cold Storage Facility',
    sentToClient: 'Ms. Priya Sharma',
    clientEmail: 'priya.sharma@bigbasket.com',
    sentDate: '2025-01-15',
    dueDate: '2025-01-20',
    status: 'Rejected',
    approvedBy: 'Ms. Priya Sharma',
    approvalDate: '2025-01-19',
    comments: 'Temperature ranges need revision. Please update and resubmit.',
    remindersSent: 1,
  },
  {
    id: '5',
    documentNumber: 'D-2025-005',
    documentName: 'Plumbing Layout - Rev 1',
    version: '1.0',
    documentType: 'Drawing',
    projectName: 'L&T Campus - Industrial Kitchen',
    sentToClient: 'Mr. Deepak Joshi',
    clientEmail: 'deepak.joshi@lnt.com',
    sentDate: '2025-01-10',
    dueDate: '2025-01-15',
    status: 'Expired',
    remindersSent: 3,
  },
];

export default function ClientApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await projectManagementService.listDocumentApprovals();
        if (!active) return;
        if (rows && rows.length > 0) {
          setApprovals(rows.map((r) => ({
            id: r.id,
            documentNumber: r.documentNumber || '',
            documentName: r.documentName || '',
            version: r.version || '',
            documentType: r.documentType || '',
            projectName: r.projectName || '',
            sentToClient: r.sentToClient || '',
            clientEmail: r.clientEmail || '',
            sentDate: r.sentDate || '',
            dueDate: r.dueDate || '',
            status: (r.status as ApprovalRequest['status']) || 'Pending',
            approvedBy: r.approvedBy,
            approvalDate: r.approvalDate,
            signatureUrl: r.signatureUrl,
            comments: r.comments,
            remindersSent: r.remindersSent ?? 0,
          })));
        }
        setError(null);
      } catch (e) {
        if (active) setError('Failed to load approval requests');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filteredApprovals = approvals.filter(
    (a) => statusFilter === 'All' || a.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Expired':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: approvals.length,
    pending: approvals.filter((a) => a.status === 'Pending').length,
    approved: approvals.filter((a) => a.status === 'Approved').length,
    rejected: approvals.filter((a) => a.status === 'Rejected').length,
    expired: approvals.filter((a) => a.status === 'Expired').length,
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="px-3 py-2 space-y-3">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
        )}
        {loading && (
          <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading approvals…</div>
        )}
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                href="/project-management/documents"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Client Approvals & E-Signatures
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Phase 2: Send documents for client approval and receive e-signatures
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" />
              Send for Approval
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Approvals List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Approval Requests</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredApprovals.map((approval) => (
              <div key={approval.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(approval.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.documentName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {approval.documentNumber} • {approval.projectName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Sent To</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {approval.sentToClient}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {approval.clientEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sent Date</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {approval.sentDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {approval.dueDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reminders Sent</p>
                        <p className="font-medium text-gray-900">{approval.remindersSent}</p>
                      </div>
                    </div>

                    {approval.approvalDate && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">
                          {approval.status === 'Approved' ? 'Approved' : 'Rejected'} by{' '}
                          <span className="font-medium">{approval.approvedBy}</span> on{' '}
                          {approval.approvalDate}
                        </p>
                      </div>
                    )}

                    {approval.comments && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-900 mb-1">Client Comments:</p>
                        <p className="text-sm text-gray-700">{approval.comments}</p>
                      </div>
                    )}

                    {approval.signatureUrl && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowSignatureModal(true);
                          }}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <PenTool className="w-4 h-4" />
                          View E-Signature
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(approval.status)}`}
                    >
                      {approval.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      {approval.status === 'Pending' && (
                        <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                          <Send className="w-3 h-3 inline mr-1" />
                          Remind
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* E-Signature Modal */}
        {showSignatureModal && selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-3 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Client E-Signature</h2>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Document:</p>
                    <p className="font-medium text-gray-900">{selectedApproval.documentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approved By:</p>
                    <p className="font-medium text-gray-900">{selectedApproval.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approval Date:</p>
                    <p className="font-medium text-gray-900">{selectedApproval.approvalDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium text-gray-900">{selectedApproval.clientEmail}</p>
                  </div>
                </div>

                <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Digital Signature:</p>
                  <div className="bg-white border-2 border-blue-600 rounded-lg p-3 text-center">
                    <p className="text-2xl font-signature text-blue-600">
                      {selectedApproval.approvedBy}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Digitally signed on {selectedApproval.approvalDate}</p>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Verified Signature
                    </div>
                  </div>
                </div>

                {selectedApproval.comments && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Comments:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {selectedApproval.comments}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">About Client Approvals</h3>
              <p className="text-sm text-blue-700 mt-1">
                Steps 2.7-2.8: Send drawings and specifications to clients for approval via email.
                Clients can review, provide comments, and sign electronically. System tracks approval
                status, reminders, and maintains digital signature records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
