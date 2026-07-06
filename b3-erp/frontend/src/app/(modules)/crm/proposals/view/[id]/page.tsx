'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import { ArrowLeft, Edit, Trash2, Download, Send, Copy, FileText, DollarSign, Calendar, User, AlertCircle, CheckCircle, XCircle, Clock, Eye, Package, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui';

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  customer: string;
  customerCompany: string;
  contactPerson: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'negotiation';
  totalValue: number;
  sections: number;
  pages: number;
  submittedDate?: string;
  viewedDate?: string;
  respondedDate?: string;
  validUntil: string;
  probability: number;
  assignedTo: string;
  tags: string[];
  notes: string;
  attachments: number;
  lastActivity: string;
  createdDate: string;
}

export default function ProposalViewPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw: any = await crmService.proposals.getById(proposalId);
        if (!cancelled && raw && typeof raw === 'object') {
          setProposal({
            id: raw.id ?? proposalId,
            proposalNumber: raw.proposalNumber ?? raw.number ?? proposalId,
            title: raw.title ?? '',
            customer: raw.customerName ?? raw.contactPerson ?? '',
            customerCompany: raw.customerCompany ?? raw.customerName ?? '',
            contactPerson: raw.contactPerson ?? raw.contactName ?? '',
            status: (raw.status ?? 'draft') as Proposal['status'],
            totalValue: Number(raw.totalValue ?? raw.amount ?? 0),
            sections: Number(raw.sections ?? (Array.isArray(raw.sectionList) ? raw.sectionList.length : 0)),
            pages: Number(raw.pages ?? 0),
            submittedDate: raw.submittedDate ? raw.submittedDate.toString().slice(0, 10) : undefined,
            viewedDate: raw.viewedDate ? raw.viewedDate.toString().slice(0, 10) : undefined,
            respondedDate: raw.respondedDate ? raw.respondedDate.toString().slice(0, 10) : undefined,
            validUntil: (raw.validUntil ?? new Date().toISOString()).toString().slice(0, 10),
            probability: Number(raw.probability ?? 0),
            assignedTo: raw.assignedToName ?? raw.ownerName ?? '',
            tags: Array.isArray(raw.tags) ? raw.tags : [],
            notes: raw.notes ?? '',
            attachments: Array.isArray(raw.attachments) ? raw.attachments.length : Number(raw.attachments ?? 0),
            lastActivity: (raw.updatedAt ?? raw.createdAt ?? '').toString().slice(0, 10),
            createdDate: (raw.createdAt ?? '').toString().slice(0, 10),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load proposal');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [proposalId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-blue-700">Loading proposal…</div>
    );
  }

  if (!proposal) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-2">
            {loadError ? loadError : "The proposal you're looking for doesn't exist."}
          </p>
          <Link href="/crm/proposals" className="text-blue-600 hover:underline">
            Return to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'viewed': return 'bg-purple-100 text-purple-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      case 'negotiation': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'negotiation': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleEdit = () => {
    router.push(`/crm/proposals/edit/${proposal.id}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    router.push('/crm/proposals');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${proposal.proposalNumber}.pdf`;
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const confirmSend = () => {
    setShowSendDialog(false);
    router.push('/crm/proposals');
  };

  const handleCopy = () => {
    router.push('/crm/proposals');
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{proposal.proposalNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getStatusColor(proposal.status)}`}>
                {getStatusIcon(proposal.status)}
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
              {isExpiringSoon(proposal.validUntil) && proposal.status !== 'accepted' && proposal.status !== 'rejected' && proposal.status !== 'expired' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Expiring Soon
                </span>
              )}
            </div>
            <h2 className="text-xl text-gray-700 mb-1">{proposal.title}</h2>
            <p className="text-gray-600">{proposal.customerCompany}</p>
          </div>

          <div className="flex items-center gap-2">
            {proposal.status === 'draft' && (
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                <span>Send Proposal</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-900">Total Value</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">${(proposal.totalValue / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">Win Probability</p>
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{proposal.probability}%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Document</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-900">{proposal.sections} sections</p>
          <p className="text-sm text-blue-700">{proposal.pages} pages</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-900">Valid Until</p>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-lg font-bold text-orange-900">{new Date(proposal.validUntil).toLocaleDateString()}</p>
          <p className="text-sm text-orange-700">
            {Math.ceil((new Date(proposal.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Proposal Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Proposal Overview</h2>
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Executive Summary</h3>
                <p className="text-gray-600 leading-relaxed">
                  This comprehensive proposal outlines our recommended approach for {proposal.title.toLowerCase()}.
                  Our solution is designed to address your specific business needs while ensuring scalability,
                  security, and measurable ROI.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Key Deliverables</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Complete system design and architecture documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Full implementation with testing and quality assurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Training and knowledge transfer sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Post-implementation support and maintenance</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                <p className="text-gray-600">
                  Estimated project duration: 12-16 weeks from contract signature. Detailed project plan
                  with milestones and deliverable dates included in the full proposal document.
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {proposal.tags && proposal.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {proposal.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {proposal.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-gray-700">{proposal.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Proposal Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Proposal Details</h2>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Proposal Number</p>
                <p className="text-sm font-medium text-gray-900">{proposal.proposalNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${getStatusColor(proposal.status)}`}>
                  {getStatusIcon(proposal.status)}
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Created Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(proposal.createdDate).toLocaleDateString()}</p>
              </div>

              {proposal.submittedDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(proposal.submittedDate).toLocaleDateString()}</p>
                </div>
              )}

              {proposal.viewedDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Viewed Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(proposal.viewedDate).toLocaleDateString()}</p>
                </div>
              )}

              {proposal.respondedDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Responded Date</p>
                  <p className="text-sm font-medium text-green-600">{new Date(proposal.respondedDate).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Last Activity</p>
                <p className="text-sm font-medium text-gray-900">{new Date(proposal.lastActivity).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">{proposal.assignedTo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Attachments</p>
                <p className="text-sm font-medium text-gray-900">{proposal.attachments} files</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.customerCompany}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-sm font-medium text-gray-900">{proposal.contactPerson}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-blue-600">contact@{proposal.customerCompany.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">123 Business St<br />Suite 456<br />San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Proposal"
        message={`Are you sure you want to delete ${proposal.proposalNumber} - "${proposal.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Send Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onConfirm={confirmSend}
        title="Send Proposal"
        message={`Are you sure you want to send ${proposal.proposalNumber} to ${proposal.customerCompany}?`}
        confirmLabel="Send"
        variant="info"
      />
    </div>
  );
}
