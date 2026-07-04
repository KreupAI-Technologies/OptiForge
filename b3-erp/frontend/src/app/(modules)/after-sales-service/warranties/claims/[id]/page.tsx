'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WarrantyService } from '@/services/warranty.service';
import {
  FileText,
  Edit,
  Download,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  User,
  Package,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Send
} from 'lucide-react';

interface ClaimTimeline {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy: string;
  status?: string;
}

interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
}

export default function ClaimDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'documents'>('details');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [comment, setComment] = useState('');

  // Mock Claim Data
  const claim = {
    id: params.id,
    claimNumber: 'CLM-2025-0045',
    status: 'Pending Review',
    priority: 'High',

    // Warranty Info
    warrantyNumber: 'WRN-2025-0001',
    warrantyType: 'Standard',
    warrantyStartDate: '2024-06-15',
    warrantyEndDate: '2025-06-15',

    // Customer Info
    customer: {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },

    // Product Info
    product: {
      name: 'Commercial Gas Range - 6 Burner',
      serialNumber: 'CGR-2024-123456',
      modelNumber: 'CGR-6B-PRO',
      purchaseDate: '2024-06-10',
      installationDate: '2024-06-15'
    },

    // Claim Details
    dateRaised: '2025-02-15',
    issueReported: 'Gas burner ignition failure',
    detailedDescription: 'Customer reported that 3 out of 6 burners are not igniting properly. The control valve appears to be faulty and needs replacement. Issue started after routine cleaning. Gas supply is normal. Customer requests urgent repair as kitchen operations are affected.',

    // Inspection
    inspectionDate: '2025-02-16',
    inspectedBy: 'Rajesh Kumar',
    inspectionNotes: 'Inspected the equipment on-site. Confirmed that control valve is defective. Checked gas supply - no issues. Verified that damage is covered under warranty terms. Recommended immediate replacement of control valve assembly.',

    // Financial
    claimAmount: 8500,
    breakdownParts: 3500,
    breakdownLabor: 2000,
    breakdownMisc: 3000,

    // Assignment
    assignedTo: 'Rajesh Kumar',
    assignedDate: '2025-02-15',

    // Coverage
    coverageVerified: true,
    withinWarrantyPeriod: true,
    deductibleAmount: 0,

    createdDate: '2025-02-15T10:30:00',
    lastUpdated: '2025-02-16T14:45:00'
  };

  // Mock Timeline
  const timeline: ClaimTimeline[] = [
    {
      id: 'T1',
      date: '2025-02-15 10:30',
      action: 'Claim Filed',
      description: 'Warranty claim filed by customer service representative',
      performedBy: 'System',
      status: 'Filed'
    },
    {
      id: 'T2',
      date: '2025-02-15 11:15',
      action: 'Claim Assigned',
      description: 'Claim assigned to field engineer for inspection',
      performedBy: 'Operations Manager',
      status: 'Assigned'
    },
    {
      id: 'T3',
      date: '2025-02-16 09:00',
      action: 'Site Inspection Scheduled',
      description: 'Inspection scheduled for Feb 16, 2025 at 2:00 PM',
      performedBy: 'Rajesh Kumar',
      status: 'Scheduled'
    },
    {
      id: 'T4',
      date: '2025-02-16 14:45',
      action: 'Inspection Completed',
      description: 'On-site inspection completed. Defect confirmed. Report submitted.',
      performedBy: 'Rajesh Kumar',
      status: 'Inspected'
    },
    {
      id: 'T5',
      date: '2025-02-16 15:30',
      action: 'Under Review',
      description: 'Claim is now under review by warranty manager',
      performedBy: 'System',
      status: 'Review'
    }
  ];

  // Mock Documents
  const documents: ClaimDocument[] = [
    {
      id: 'DOC-001',
      name: 'Inspection Report.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedDate: '2025-02-16',
      uploadedBy: 'Rajesh Kumar'
    },
    {
      id: 'DOC-002',
      name: 'Defective Parts Photos.zip',
      type: 'ZIP',
      size: '5.8 MB',
      uploadedDate: '2025-02-16',
      uploadedBy: 'Rajesh Kumar'
    },
    {
      id: 'DOC-003',
      name: 'Warranty Certificate.pdf',
      type: 'PDF',
      size: '845 KB',
      uploadedDate: '2025-02-15',
      uploadedBy: 'System'
    },
    {
      id: 'DOC-004',
      name: 'Purchase Invoice.pdf',
      type: 'PDF',
      size: '1.2 MB',
      uploadedDate: '2025-02-15',
      uploadedBy: 'System'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
      case 'Under Investigation': return 'bg-orange-100 text-orange-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const amount = approvalAmount ? Number(approvalAmount) : undefined;
      await WarrantyService.approveClaim(params.id, amount);
      setShowApprovalModal(false);
      router.push('/after-sales-service/warranties/claims');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await WarrantyService.rejectClaim(params.id, rejectionReason);
      setShowRejectionModal(false);
      router.push('/after-sales-service/warranties/claims');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{claim.claimNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
              {claim.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(claim.priority)}`}>
              {claim.priority} Priority
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Filed on {formatDate(claim.dateRaised)} • Warranty: {claim.warrantyNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {claim.status === 'Pending Review' && (
            <>
              <button
                onClick={() => setShowRejectionModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  setApprovalAmount(claim.claimAmount.toString());
                  setShowApprovalModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Claim Amount</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(claim.claimAmount)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Parts: {formatCurrency(claim.breakdownParts)} • Labor: {formatCurrency(claim.breakdownLabor)}
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Assigned Engineer</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">{claim.assignedTo}</div>
          <div className="text-xs text-gray-500 mt-1">Assigned on {formatDate(claim.assignedDate)}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Inspection</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">Completed</div>
          <div className="text-xs text-gray-500 mt-1">{formatDate(claim.inspectionDate)} by {claim.inspectedBy}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Coverage Status</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-lg font-bold text-green-600">Verified</div>
          <div className="text-xs text-gray-500 mt-1">Within warranty period</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Claim Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents ({documents.length})
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Customer & Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-medium text-gray-900">{claim.customer.name}</div>
                  <div className="text-xs text-gray-500">{claim.customer.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="text-gray-900">{claim.customer.phone}</div>
                  <div className="text-gray-900">{claim.customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="text-gray-900">{claim.customer.address}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Product Name</div>
                  <div className="font-medium text-gray-900">{claim.product.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Serial Number</div>
                    <div className="text-gray-900">{claim.product.serialNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Model</div>
                    <div className="text-gray-900">{claim.product.modelNumber}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Purchase Date</div>
                    <div className="text-gray-900">{formatDate(claim.product.purchaseDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Installation Date</div>
                    <div className="text-gray-900">{formatDate(claim.product.installationDate)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Issue Details</h2>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Issue Reported</div>
                <div className="text-gray-900">{claim.issueReported}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Detailed Description</div>
                <div className="text-gray-700 bg-gray-50 p-3 rounded-md">{claim.detailedDescription}</div>
              </div>
            </div>
          </div>

          {/* Inspection Report */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Inspection Report</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-500">Inspection Date</div>
                  <div className="font-medium text-gray-900">{formatDate(claim.inspectionDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Inspected By</div>
                  <div className="font-medium text-gray-900">{claim.inspectedBy}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Inspection Notes</div>
                <div className="text-gray-700 bg-gray-50 p-3 rounded-md">{claim.inspectionNotes}</div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Parts Cost:</span>
                <span className="font-medium text-gray-900">{formatCurrency(claim.breakdownParts)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Labor Cost:</span>
                <span className="font-medium text-gray-900">{formatCurrency(claim.breakdownLabor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Miscellaneous (Travel, etc.):</span>
                <span className="font-medium text-gray-900">{formatCurrency(claim.breakdownMisc)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-900">Total Claim Amount:</span>
                <span className="font-bold text-gray-900">{formatCurrency(claim.claimAmount)}</span>
              </div>
              {claim.deductibleAmount > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Customer Deductible:</span>
                  <span className="font-medium">{formatCurrency(claim.deductibleAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warranty Coverage */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Warranty Coverage Verification</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Coverage Verified</span>
                </div>
                <span className="text-xs text-green-700">Issue is covered under warranty terms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Within Warranty Period</span>
                </div>
                <span className="text-xs text-green-700">
                  Valid until {formatDate(claim.warrantyEndDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Activity Timeline</h2>
          <div className="space-y-2">
            {timeline.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900">{item.action}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{item.description}</div>
                  <div className="text-xs text-gray-500">By {item.performedBy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Attached Documents</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              <Paperclip className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    {doc.type === 'PDF' ? (
                      <FileText className="w-6 h-6 text-red-600" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{doc.name}</h3>
                    <div className="text-xs text-gray-500">
                      {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(doc.uploadedDate)}</div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Download"
                   
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Approve Claim</h2>
              <p className="text-sm text-gray-500 mt-1">Review and approve this warranty claim</p>
            </div>

            <div className="p-6 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter approved amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original claim amount: {formatCurrency(claim.claimAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Notes</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Add any notes or comments..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Approving…' : 'Approve Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Claim</h2>
              <p className="text-sm text-gray-500 mt-1">Provide reason for claim rejection</p>
            </div>

            <div className="p-6 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                >
                  <option value="">Select reason</option>
                  <option value="Not Covered">Issue not covered under warranty</option>
                  <option value="Misuse">Damage due to misuse or negligence</option>
                  <option value="Expired">Warranty period expired</option>
                  <option value="Unauthorized">Unauthorized modifications detected</option>
                  <option value="Insufficient">Insufficient documentation</option>
                  <option value="Other">Other</option>
                </select>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Provide detailed explanation..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Rejecting…' : 'Reject Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
