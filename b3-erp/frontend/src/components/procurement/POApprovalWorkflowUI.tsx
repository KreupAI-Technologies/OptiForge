'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
  Users,
  ChevronRight,
  MessageSquare,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Send,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Eye,
  History,
  ArrowRight,
} from 'lucide-react';

// Types
export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'skipped' | 'current';

export interface Approver {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  department: string;
}

export interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  status: ApprovalStepStatus;
  approver: Approver;
  approvalDate?: string;
  comments?: string;
  delegatedTo?: Approver;
  threshold?: number;
  isParallel?: boolean;
  parallelApprovers?: Approver[];
  requiredApprovals?: number;
  currentApprovals?: number;
}

export interface PurchaseOrderApproval {
  id: string;
  poNumber: string;
  title: string;
  description: string;
  vendor: {
    name: string;
    id: string;
  };
  amount: number;
  currency: string;
  requestedBy: Approver;
  requestDate: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  steps: ApprovalStep[];
  currentStepIndex: number;
  attachments: { name: string; size: string }[];
  history: {
    action: string;
    user: string;
    date: string;
    details?: string;
  }[];
}

interface POApprovalWorkflowUIProps {
  purchaseOrder?: PurchaseOrderApproval;
  onApprove?: (poId: string, stepId: string, comments: string) => void;
  onReject?: (poId: string, stepId: string, reason: string) => void;
  onDelegate?: (poId: string, stepId: string, delegateToId: string) => void;
  onRequestInfo?: (poId: string, message: string) => void;
  currentUserId?: string;
}

// Sample data
const samplePurchaseOrder: PurchaseOrderApproval = {
  id: 'PO-2024-001234',
  poNumber: 'PO-2024-001234',
  title: 'CNC Machine Tooling & Components',
  description: 'Purchase of precision tooling and replacement components for CNC machining center upgrades in Production Line B.',
  vendor: {
    name: 'Precision Components Inc.',
    id: 'V001',
  },
  amount: 125750.00,
  currency: 'USD',
  requestedBy: {
    id: 'U001',
    name: 'John Smith',
    role: 'Production Manager',
    email: 'john.smith@company.com',
    department: 'Production',
  },
  requestDate: '2024-01-15T09:30:00Z',
  urgency: 'high',
  category: 'Capital Equipment',
  currentStepIndex: 2,
  attachments: [
    { name: 'Technical_Specifications.pdf', size: '2.4 MB' },
    { name: 'Vendor_Quote_Q2024-789.pdf', size: '1.1 MB' },
    { name: 'Budget_Justification.xlsx', size: '456 KB' },
  ],
  steps: [
    {
      id: 'step1',
      name: 'Department Review',
      description: 'Initial review by department head',
      status: 'approved',
      approver: {
        id: 'U002',
        name: 'Sarah Johnson',
        role: 'Department Head',
        email: 'sarah.johnson@company.com',
        department: 'Production',
      },
      approvalDate: '2024-01-15T14:22:00Z',
      comments: 'Approved. Essential for Q1 production targets.',
      threshold: 50000,
    },
    {
      id: 'step2',
      name: 'Budget Verification',
      description: 'Finance team budget allocation check',
      status: 'approved',
      approver: {
        id: 'U003',
        name: 'Michael Chen',
        role: 'Finance Manager',
        email: 'michael.chen@company.com',
        department: 'Finance',
      },
      approvalDate: '2024-01-16T10:15:00Z',
      comments: 'Budget available in CapEx allocation. Verified against FY2024 budget.',
      threshold: 100000,
    },
    {
      id: 'step3',
      name: 'VP Operations Approval',
      description: 'Senior management approval for high-value purchases',
      status: 'current',
      approver: {
        id: 'U004',
        name: 'Lisa Anderson',
        role: 'VP Operations',
        email: 'lisa.anderson@company.com',
        department: 'Operations',
      },
      threshold: 100000,
    },
    {
      id: 'step4',
      name: 'CFO Final Approval',
      description: 'Executive approval for purchases over $100,000',
      status: 'pending',
      approver: {
        id: 'U005',
        name: 'Robert Williams',
        role: 'Chief Financial Officer',
        email: 'robert.williams@company.com',
        department: 'Executive',
      },
      threshold: 100000,
    },
    {
      id: 'step5',
      name: 'Procurement Processing',
      description: 'Final processing and PO generation',
      status: 'pending',
      approver: {
        id: 'U006',
        name: 'Emily Davis',
        role: 'Procurement Lead',
        email: 'emily.davis@company.com',
        department: 'Procurement',
      },
    },
  ],
  history: [
    { action: 'Created', user: 'John Smith', date: '2024-01-15T09:30:00Z', details: 'Purchase requisition submitted' },
    { action: 'Assigned', user: 'System', date: '2024-01-15T09:31:00Z', details: 'Routed to Department Review' },
    { action: 'Approved', user: 'Sarah Johnson', date: '2024-01-15T14:22:00Z', details: 'Department approval granted' },
    { action: 'Approved', user: 'Michael Chen', date: '2024-01-16T10:15:00Z', details: 'Budget verified and approved' },
    { action: 'Assigned', user: 'System', date: '2024-01-16T10:16:00Z', details: 'Escalated to VP Operations' },
  ],
};

export function POApprovalWorkflowUI({
  purchaseOrder = samplePurchaseOrder,
  onApprove,
  onReject,
  onDelegate,
  onRequestInfo,
  currentUserId = 'U004',
}: POApprovalWorkflowUIProps) {
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'details' | 'attachments'>('workflow');

  const getStepStatusConfig = (status: ApprovalStepStatus) => {
    switch (status) {
      case 'approved':
        return {
          icon: Check,
          bgColor: 'bg-green-500',
          textColor: 'text-green-600',
          borderColor: 'border-green-500',
          lightBg: 'bg-green-50 dark:bg-green-900/20',
        };
      case 'rejected':
        return {
          icon: X,
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          borderColor: 'border-red-500',
          lightBg: 'bg-red-50 dark:bg-red-900/20',
        };
      case 'current':
        return {
          icon: Clock,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-500',
          lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        };
      case 'skipped':
        return {
          icon: ArrowRight,
          bgColor: 'bg-gray-400',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-400',
          lightBg: 'bg-gray-50 dark:bg-gray-800',
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-300',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-300',
          lightBg: 'bg-gray-50 dark:bg-gray-800',
        };
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical' };
      case 'high':
        return { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Medium' };
      default:
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', label: 'Low' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const currentStep = purchaseOrder.steps.find(s => s.status === 'current');
  const isCurrentApprover = currentStep?.approver.id === currentUserId;
  const completedSteps = purchaseOrder.steps.filter(s => s.status === 'approved').length;
  const totalSteps = purchaseOrder.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const handleApprove = () => {
    if (currentStep) {
      onApprove?.(purchaseOrder.id, currentStep.id, approvalComment);
      setApprovalComment('');
    }
  };

  const handleReject = () => {
    if (currentStep && rejectReason.trim()) {
      onReject?.(purchaseOrder.id, currentStep.id, rejectReason);
      setRejectReason('');
      setShowRejectModal(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {purchaseOrder.poNumber}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyConfig(purchaseOrder.urgency).color}`}>
                {getUrgencyConfig(purchaseOrder.urgency).label} Priority
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {purchaseOrder.title}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(purchaseOrder.amount, purchaseOrder.currency)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {purchaseOrder.vendor.name}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Approval Progress: Step {completedSteps + 1} of {totalSteps}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-gray-200 dark:border-gray-700 -mb-2">
          {(['workflow', 'details', 'attachments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'workflow' && (
          <div className="space-y-3">
            {/* Approval Chain Visualization */}
            <div className="relative">
              <div className="flex items-start justify-between">
                {purchaseOrder.steps.map((step, index) => {
                  const config = getStepStatusConfig(step.status);
                  const Icon = config.icon;
                  const isLast = index === purchaseOrder.steps.length - 1;

                  return (
                    <div key={step.id} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        {/* Step Icon */}
                        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center z-10`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>

                        {/* Step Info */}
                        <div className="mt-3 text-center">
                          <p className={`text-sm font-medium ${config.textColor}`}>
                            {step.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {step.approver.name}
                          </p>
                          {step.approvalDate && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(step.approvalDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Connector Line */}
                      {!isLast && (
                        <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full ${
                              step.status === 'approved' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ width: step.status === 'approved' ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Step Details */}
            {currentStep && (
              <div className={`mt-8 p-3 rounded-lg ${getStepStatusConfig('current').lightBg} border ${getStepStatusConfig('current').borderColor}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Current Step: {currentStep.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentStep.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentStep.approver.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentStep.approver.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval Actions (if current user is approver) */}
                {isCurrentApprover && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Comments (optional)
                      </label>
                      <textarea
                        value={approvalComment}
                        onChange={(e) => setApprovalComment(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Add comments for approval record..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const message = window.prompt('What information do you need from the requester?');
                          if (message && message.trim()) {
                            onRequestInfo?.(purchaseOrder.id, message.trim());
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Request Info
                      </button>
                      <button
                        onClick={() => {
                          const delegateTo = window.prompt('Delegate this approval to (user id / name):');
                          if (delegateTo && delegateTo.trim() && currentStep) {
                            onDelegate?.(purchaseOrder.id, currentStep.id, delegateTo.trim());
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Delegate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step Details List */}
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Approval Steps
              </h3>
              {purchaseOrder.steps.map((step, index) => {
                const config = getStepStatusConfig(step.status);
                const Icon = config.icon;

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === 'current' ? config.borderColor : 'border-gray-200 dark:border-gray-700'
                    } ${config.lightBg}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Step {index + 1}: {step.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {step.approver.name} ({step.approver.role})
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            step.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            step.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            step.status === 'current' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                          </span>
                        </div>
                        {step.comments && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            &ldquo;{step.comments}&rdquo;
                          </p>
                        )}
                        {step.approvalDate && (
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(step.approvalDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Purchase Order Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PO Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{purchaseOrder.poNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vendor</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{purchaseOrder.vendor.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(purchaseOrder.amount, purchaseOrder.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Request Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(purchaseOrder.requestDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Requester Information</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{purchaseOrder.requestedBy.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{purchaseOrder.requestedBy.role}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{purchaseOrder.requestedBy.department}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {purchaseOrder.description}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Supporting Documents</h3>
            <div className="space-y-2">
              {purchaseOrder.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Reject Purchase Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Please provide a reason for rejecting this purchase order.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="Enter rejection reason..."
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POApprovalWorkflowUI;
