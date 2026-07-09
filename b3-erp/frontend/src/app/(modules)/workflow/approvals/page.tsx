'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Filter, User, Users, FileText,
  TrendingUp, Calendar, DollarSign, ShoppingCart, Package,
  Briefcase, Activity, MessageSquare, ThumbsUp, ThumbsDown, Flag
} from 'lucide-react';
import {
  approvalService,
  type ApprovalAttachment,
  type ApprovalComment,
} from '@/services/ApprovalService';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: 'purchase_order' | 'expense' | 'leave' | 'quotation' | 'budget' | 'project' | 'invoice';
  referenceId: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  requestedDate: string;
  currentApprover: string;
  approvalLevel: string;
  totalLevels: number;
  deadline: string;
  daysRemaining: number;
  comments: number;
  attachments: number;
  history: Array<{
    approver: string;
    action: 'approved' | 'rejected' | 'pending';
    date: string;
    comment?: string;
  }>;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const typeIcons = {
  purchase_order: ShoppingCart,
  expense: DollarSign,
  leave: Calendar,
  quotation: FileText,
  budget: Briefcase,
  project: Package,
  invoice: FileText,
};

const typeColors = {
  purchase_order: 'bg-purple-100 text-purple-700',
  expense: 'bg-green-100 text-green-700',
  leave: 'bg-blue-100 text-blue-700',
  quotation: 'bg-indigo-100 text-indigo-700',
  budget: 'bg-orange-100 text-orange-700',
  project: 'bg-teal-100 text-teal-700',
  invoice: 'bg-pink-100 text-pink-700',
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<
    { kind: 'success' | 'error'; message: string } | null
  >(null);

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
        // Service returns the backend ApprovalRequest shape (documentType/
        // documentNumber/dueDate/justification/approvalHistory); map it
        // defensively to this page's ApprovalRequest model.
        const raw = (await approvalService.getApprovals()) as any[];
        const typeMap: Record<string, ApprovalRequest['type']> = {
          purchase_order: 'purchase_order',
          requisition: 'purchase_order',
          rfq: 'quotation',
          quotation: 'quotation',
          contract: 'project',
          vendor: 'purchase_order',
          payment: 'invoice',
          invoice: 'invoice',
          expense: 'expense',
          leave: 'leave',
          budget: 'budget',
          project: 'project',
        };
        const statusMap: Record<string, ApprovalRequest['status']> = {
          pending: 'pending',
          approved: 'approved',
          rejected: 'rejected',
          escalated: 'pending',
          expired: 'expired',
        };
        const priorityMap: Record<string, ApprovalRequest['priority']> = {
          low: 'low',
          medium: 'medium',
          high: 'high',
          urgent: 'urgent',
        };
        const dayMs = 1000 * 60 * 60 * 24;
        const mapped: ApprovalRequest[] = (raw ?? []).map((a) => {
          const rawType = String(a.documentType ?? a.type ?? '').toLowerCase();
          const rawStatus = String(a.status ?? '').toLowerCase();
          const rawPriority = String(a.priority ?? '').toLowerCase();
          const totalLevels = Number(a.totalLevels ?? 1);
          const level = Number(a.approvalLevel ?? 0);
          const deadline = a.dueDate ?? '';
          let daysRemaining = 0;
          if (deadline) {
            const diff = new Date(deadline).getTime() - Date.now();
            daysRemaining = Math.ceil(diff / dayMs);
          }
          const history = Array.isArray(a.approvalHistory)
            ? a.approvalHistory.map((h: any) => ({
                approver: h.approver ?? '',
                action:
                  h.action === 'approved' || h.action === 'rejected'
                    ? h.action
                    : 'pending',
                date: h.date ?? '',
                comment: h.comments ?? h.comment,
              }))
            : [];
          return {
            id: String(a.id ?? ''),
            title: a.title ?? '',
            description: a.justification ?? a.description ?? '',
            type: typeMap[rawType] ?? 'purchase_order',
            referenceId: a.documentNumber ?? a.referenceId ?? '',
            amount: a.amount !== null && a.amount !== undefined ? Number(a.amount) : undefined,
            status: statusMap[rawStatus] ?? 'pending',
            priority: priorityMap[rawPriority] ?? 'medium',
            requestedBy: a.requestedBy ?? '',
            requestedDate: a.requestedDate ?? '',
            currentApprover: a.currentApprover ?? '',
            approvalLevel: level && totalLevels ? `Level ${level} of ${totalLevels}` : (a.approvalLevel ?? ''),
            totalLevels,
            deadline,
            daysRemaining,
            comments: Number(a.comments ?? 0),
            attachments: Number(a.attachments ?? 0),
            history,
          };
        });
        setApprovals(mapped);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load approval requests');
        setApprovals([]);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');
  const itemsPerPage = 8;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded card state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Document-view state (attachments + comments) for the expanded approval.
  const [docViewApprovalId, setDocViewApprovalId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ApprovalAttachment[]>([]);
  const [comments, setComments] = useState<ApprovalComment[]>([]);
  const [isDocViewLoading, setIsDocViewLoading] = useState(false);
  const [docViewError, setDocViewError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const loadDocView = useCallback(async (approvalId: string) => {
    setIsDocViewLoading(true);
    setDocViewError(null);
    try {
      const [atts, cmts] = await Promise.all([
        approvalService.getAttachments(approvalId),
        approvalService.getComments(approvalId),
      ]);
      setAttachments(atts);
      setComments(cmts);
    } catch (err) {
      setAttachments([]);
      setComments([]);
      setDocViewError(
        err instanceof Error ? err.message : 'Failed to load attachments and comments.',
      );
    } finally {
      setIsDocViewLoading(false);
    }
  }, []);

  // Fetch attachments/comments whenever a card is expanded.
  useEffect(() => {
    if (expandedCard) {
      setDocViewApprovalId(expandedCard);
      setNewComment('');
      loadDocView(expandedCard);
    } else {
      setDocViewApprovalId(null);
      setAttachments([]);
      setComments([]);
      setDocViewError(null);
    }
  }, [expandedCard, loadDocView]);

  const handlePostComment = async () => {
    if (!docViewApprovalId || !newComment.trim() || isPostingComment) return;
    setIsPostingComment(true);
    try {
      await approvalService.addComment(docViewApprovalId, newComment.trim(), 'current-user-id');
      setNewComment('');
      await loadDocView(docViewApprovalId);
    } catch (err) {
      setDocViewError(
        err instanceof Error ? `Failed to post comment: ${err.message}` : 'Failed to post comment.',
      );
    } finally {
      setIsPostingComment(false);
    }
  };

  // Delegation modal state
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationApproval, setDelegationApproval] = useState<ApprovalRequest | null>(null);
  const [delegateTo, setDelegateTo] = useState('');

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
    const matchesType = typeFilter === 'all' || approval.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
    const matchesView = viewMode === 'all' || approval.status === 'pending';
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesView;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApprovals = filteredApprovals.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: approvals.length,
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
    urgent: approvals.filter((a) => a.priority === 'urgent' && a.status === 'pending').length,
    totalAmount: approvals
      .filter((a) => a.amount && a.status === 'pending')
      .reduce((sum, a) => sum + (a.amount || 0), 0),
  };

  // Open approval modal
  const openApprovalModal = (approval: ApprovalRequest, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setModalAction(action);
    setActionComment('');
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedApproval(null);
    setModalAction(null);
    setActionComment('');
  };

  // Submit approval/rejection
  const handleSubmitAction = async () => {
    if (!selectedApproval || !modalAction) return;

    setIsSubmitting(true);
    setActionFeedback(null);

    try {
      await approvalService.processAction(
        selectedApproval.id,
        'current-user-id',
        modalAction,
        actionComment || undefined
      );

      const title = selectedApproval.title;
      closeModal();
      // Re-fetch from the backend so status, level, and history reflect the
      // server's authoritative state rather than an optimistic guess.
      await loadApprovals();
      setActionFeedback({
        kind: 'success',
        message: `"${title}" ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error) {
      setActionFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? `Failed to submit action: ${error.message}`
            : 'Failed to submit action. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (approval: ApprovalRequest) => {
    openApprovalModal(approval, 'approve');
  };

  const handleReject = (approval: ApprovalRequest) => {
    openApprovalModal(approval, 'reject');
  };

  const handleDelegate = (approval: ApprovalRequest) => {
    setDelegationApproval(approval);
    setDelegateTo('');
    setShowDelegationModal(true);
  };

  // Delegate (reassign) the current pending step to another user via the
  // workflow backend, then re-fetch so the assignee reflects server state.
  const handleSubmitDelegation = async () => {
    if (!delegationApproval) return;
    if (!delegateTo.trim()) {
      setActionFeedback({
        kind: 'error',
        message: 'Please enter the user to delegate to.',
      });
      return;
    }
    const approval = delegationApproval;
    const target = delegateTo.trim();
    setShowDelegationModal(false);
    try {
      await approvalService.delegate(approval.id, 'current-user-id', target);
      await loadApprovals();
      setActionFeedback({
        kind: 'success',
        message: `"${approval.title}" delegated to ${target}.`,
      });
    } catch (error) {
      setActionFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? `Failed to delegate: ${error.message}`
            : 'Failed to delegate. Please try again.',
      });
    } finally {
      setDelegationApproval(null);
      setDelegateTo('');
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 2) return 'text-orange-600';
    if (days <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTypeIcon = (type: ApprovalRequest['type']) => {
    const Icon = typeIcons[type];
    return <Icon className="h-4 w-4" />;
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading approval requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && approvals.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No approval requests found.
        </div>
      )}
      {actionFeedback && (
        <div
          className={`mb-3 flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm ${
            actionFeedback.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {actionFeedback.kind === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {actionFeedback.message}
          </span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
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

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Urgent</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.urgent}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Pending Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">${(stats.totalAmount / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => setViewMode(viewMode === 'pending' ? 'all' : 'pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'pending'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {viewMode === 'pending' ? 'Show All' : 'Show Pending Only'}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search approvals by title, reference, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="expense">Expense</option>
              <option value="leave">Leave</option>
              <option value="quotation">Quotation</option>
              <option value="budget">Budget</option>
              <option value="project">Project</option>
              <option value="invoice">Invoice</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        )}
      </div>

      {/* Approval Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {paginatedApprovals.map((approval) => (
          <div
            key={approval.id}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all"
          >
            {/* Approval Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[approval.status]}`}>
                    {approval.status}
                  </span>
                  {/* Show resubmission badge if there's a rejection in history */}
                  {approval.history.some(h => h.action === 'rejected') && approval.status === 'pending' && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-300 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Resubmitted</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{approval.description}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full ${typeColors[approval.type]}`}>
                    {getTypeIcon(approval.type)}
                    <span>{approval.type.replace('_', ' ')}</span>
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[approval.priority]}`}>
                    {approval.priority}
                  </span>
                  <span className="text-xs text-gray-500">{approval.referenceId}</span>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-3 mb-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Requested By</p>
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">{approval.requestedBy}</span>
                </div>
              </div>
              {approval.amount && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">{formatAmount(approval.amount)}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Approver</p>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-900 truncate">{approval.currentApprover}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Approval Level</p>
                <span className="text-sm font-semibold text-gray-900">{approval.approvalLevel}</span>
              </div>
            </div>

            {/* Timeline and Status */}
            <div className="grid grid-cols-3 gap-3 mb-2 p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Requested</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-900">{approval.requestedDate}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-semibold text-gray-900">{approval.deadline}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Days Left</p>
                <div className="flex items-center space-x-1">
                  <Flag className={`h-3 w-3 ${getDaysRemainingColor(approval.daysRemaining)}`} />
                  <span className={`text-xs font-semibold ${getDaysRemainingColor(approval.daysRemaining)}`}>
                    {approval.daysRemaining > 0 ? approval.daysRemaining : 'Overdue'}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval History Progress */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">Approval Progress</p>
                <span className="text-xs text-gray-500">{approval.history.length} / {approval.totalLevels}</span>
              </div>
              <div className="flex items-center space-x-2">
                {approval.history.map((item, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div
                      className={`flex-1 h-2 rounded-full ${item.action === 'approved'
                        ? 'bg-green-500'
                        : item.action === 'rejected'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                        }`}
                    />
                  </div>
                ))}
                {Array.from({ length: approval.totalLevels - approval.history.length }).map((_, index) => (
                  <div key={`pending-${index}`} className="flex-1 h-2 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{approval.comments} comments</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{approval.attachments} files</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpandedCard(expandedCard === approval.id ? null : approval.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>{expandedCard === approval.id ? 'Hide Details' : 'View Details'}</span>
              </button>
              {approval.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleDelegate(approval)}
                    className="flex items-center justify-center px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Delegate to another user"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(approval)}
                    className="flex items-center justify-center px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(approval)}
                    className="flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Expanded Details Section */}
            {expandedCard === approval.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                {/* Previous Rejection Alert */}
                {approval.history.some(h => h.action === 'rejected') && approval.status === 'pending' && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Previously Rejected Request</h4>
                        <p className="text-sm text-amber-800 mb-2">
                          This request was previously rejected and has been resubmitted with modifications.
                          Review the complete history below to see previous feedback and changes made.
                        </p>
                        {approval.history.filter(h => h.action === 'rejected').map((rejection, idx) => (
                          <div key={idx} className="mt-2 p-2 bg-white rounded border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Rejected by {rejection.approver}</span> on {rejection.date}
                            </p>
                            {rejection.comment && (
                              <p className="text-sm text-gray-800 italic">"{rejection.comment}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Link — reference metadata. A document-viewer route/
                    endpoint is not yet available on the workflow backend, so we
                    surface the reference identifier rather than a dead action. */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1 flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Original Document</span>
                      </h4>
                      <p className="text-sm text-blue-700">
                        {approval.type.replace('_', ' ')} — {approval.referenceId || 'no reference'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments + comments (document view) — fetched live from
                    the workflow backend for the expanded approval. */}
                {docViewError && (
                  <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{docViewError}</span>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Attachments</span>
                  </h4>
                  {isDocViewLoading ? (
                    <p className="text-sm text-gray-500">Loading attachments…</p>
                  ) : attachments.length === 0 ? (
                    <p className="text-sm text-gray-500">No attachments.</p>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between rounded border border-gray-200 bg-white p-2"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm text-gray-800 truncate">{att.fileName}</span>
                            {att.version && (
                              <span className="text-xs text-gray-400">v{att.version}</span>
                            )}
                          </div>
                          {att.fileUrl && (
                            <a
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline flex-shrink-0"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comments</span>
                  </h4>
                  {isDocViewLoading ? (
                    <p className="text-sm text-gray-500">Loading comments…</p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((c) => (
                        <div key={c.id} className="rounded border border-gray-200 bg-white p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {c.authorName || c.authorId || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="mt-2 flex items-start space-x-2">
                    <textarea
                      value={docViewApprovalId === approval.id ? newComment : ''}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment…"
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      disabled={isPostingComment}
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={isPostingComment || !newComment.trim()}
                      className="px-3 py-2 rounded-lg text-white text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      {isPostingComment ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>

                {/* Approval History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Approval History</span>
                  </h4>
                  <div className="space-y-3">
                    {approval.history.map((event, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {event.action === 'approved' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : event.action === 'rejected' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{event.approver}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${event.action === 'approved' ? 'bg-green-100 text-green-700' :
                              event.action === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {event.action}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{event.date}</p>
                          {event.comment && (
                            <p className="text-sm text-gray-700 mt-1 italic bg-white p-2 rounded border border-gray-200">"{event.comment}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApprovals.length)} of {filteredApprovals.length} approval requests
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`px-3 py-2 border-b ${modalAction === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {modalAction === 'approve' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <h2 className={`text-xl font-bold ${modalAction === 'approve' ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {modalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-3 py-2">
              {/* Request Details */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-2">Request Details</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Title:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedApproval.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reference:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedApproval.referenceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requested By:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedApproval.requestedBy}</span>
                  </div>
                  {selectedApproval.amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{selectedApproval.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedApproval.description}</p>
                  </div>
                </div>
              </div>

              {/* Comment/Reason Input */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalAction === 'approve'
                    ? 'Comment (Optional)'
                    : 'Reason for Rejection (Required)'}
                  <span className="text-red-500 ml-1">{modalAction === 'reject' ? '*' : ''}</span>
                </label>
                <textarea
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder={modalAction === 'approve'
                    ? 'Add any comments or notes...'
                    : 'Please provide a reason for rejection...'}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {modalAction === 'reject' && !actionComment && (
                <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    A reason is required when rejecting an approval request.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={isSubmitting || (modalAction === 'reject' && !actionComment.trim())}
                className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 ${modalAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                  } disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {modalAction === 'approve' ? (
                      <><ThumbsUp className="h-4 w-4" /><span>Approve</span></>
                    ) : (
                      <><ThumbsDown className="h-4 w-4" /><span>Reject</span></>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Modal */}
      {showDelegationModal && delegationApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-3 py-2 border-b bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-purple-900">Delegate Task</h2>
                </div>
                <button
                  onClick={() => setShowDelegationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-3 py-2">
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-2">Task Details</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{delegationApproval.title}</p>
                  <p className="text-xs text-gray-600">{delegationApproval.referenceId}</p>
                  {delegationApproval.amount && (
                    <p className="text-sm font-bold text-gray-900">₹{delegationApproval.amount.toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegate To <span className="text-red-500">*</span>
                </label>
                <select
                  value={delegateTo}
                  onChange={(e) => setDelegateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a user...</option>
                  <option value="john_doe">John Doe - Finance Manager</option>
                  <option value="sarah_williams">Sarah Williams - Department Head</option>
                  <option value="mike_johnson">Mike Johnson - Procurement Manager</option>
                  <option value="emily_brown">Emily Brown - Finance Director</option>
                  <option value="david_miller">David Miller - CEO</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  The current pending approval step will be reassigned to the
                  selected user. They will see it in their pending queue.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDelegationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDelegation}
                disabled={!delegateTo}
                title="Delegate this approval to the selected user"
                className="px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                <Users className="h-4 w-4" />
                <span>Delegate Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
