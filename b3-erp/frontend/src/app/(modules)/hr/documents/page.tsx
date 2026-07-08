'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, FolderOpen, Shield, BookOpen, Award, AlertTriangle,
  Plus, Search, Filter, Upload, Download, Eye, CheckCircle,
  XCircle, Clock, AlertCircle, Users, Calendar, Bell, Loader2, Trash2
} from 'lucide-react';
import { AttachmentsService, type Attachment } from '@/services/attachments.service';
import {
  DocumentManagementService,
  DocumentCategory,
  DocumentStatus,
  ComplianceDocumentCategory,
  PolicyCategory,
  PolicyStatus,
  CertificateType,
  CertificateRequestStatus,
  ComplianceStatus,
  type EmployeeDocument,
  type ComplianceDocument,
  type HRPolicy,
  type DocumentRepository,
  type CertificateRequest,
  type DocumentComplianceTracking,
  type DocumentDashboardStats,
} from '@/services/document-management.service';

// ============================================================================
// Types
// ============================================================================

type MainTab = 'employee_documents' | 'compliance_documents' | 'policies' | 'repository' | 'certificates' | 'tracking';
type EmployeeDocSubTab = 'personal' | 'educational' | 'employment' | 'upload';
type ComplianceSubTab = 'statutory_forms' | 'declarations' | 'nominations' | 'insurance_forms';
type PolicySubTab = 'employee_handbook' | 'leave_policy' | 'attendance_policy' | 'expense_policy' | 'code_of_conduct' | 'other';
type RepositorySubTab = 'browse' | 'search' | 'upload' | 'archive';
type CertificateSubTab = 'experience' | 'salary' | 'employment' | 'status';
type TrackingSubTab = 'missing' | 'expired' | 'reminders';

// ============================================================================
// Dashboard Component
// ============================================================================

function DocumentDashboard({ stats }: { stats: DocumentDashboardStats | null }) {
  if (!stats) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'blue' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: Clock, color: 'yellow' },
    { label: 'Pending Certificates', value: stats.pendingCertificates, icon: Award, color: 'purple' },
    { label: 'Missing Documents', value: stats.missingDocuments, icon: AlertCircle, color: 'red' },
    { label: 'Expired Documents', value: stats.expiredDocuments, icon: XCircle, color: 'red' },
    { label: 'Expiring Soon', value: stats.expiringDocuments, icon: AlertTriangle, color: 'orange' },
    { label: 'Published Policies', value: stats.publishedPolicies, icon: BookOpen, color: 'green' },
    { label: 'Pending Acknowledgments', value: stats.pendingAcknowledgments, icon: Users, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Employee Documents Component
// ============================================================================

function EmployeeDocumentsSection({ documents, category }: { documents: EmployeeDocument[]; category: DocumentCategory }) {
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED: return 'bg-green-900 text-green-300';
      case DocumentStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
      case DocumentStatus.REJECTED: return 'bg-red-900 text-red-300';
      case DocumentStatus.EXPIRED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const filteredDocs = documents.filter(d => d.documentCategory === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{category} Documents</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Document #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Document Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No documents found in this category
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{doc.documentNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{doc.employeeName}</p>
                      <p className="text-xs text-gray-500">{doc.employeeCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{doc.documentName}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{doc.documentType.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {doc.expiryDate || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      {doc.status === DocumentStatus.PENDING && (
                        <>
                          <button className="text-green-400 hover:text-green-300 text-sm">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Compliance Documents Component
// ============================================================================

function ComplianceDocumentsSection({ documents, category }: { documents: ComplianceDocument[]; category: ComplianceDocumentCategory }) {
  const filteredDocs = documents.filter(d => d.documentCategory === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{category.replace('_', ' ')}</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Document Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Form Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No compliance documents found
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{doc.documentCode}</span>
                  </td>
                  <td className="px-4 py-3 text-white">{doc.documentName}</td>
                  <td className="px-4 py-3 text-gray-300">{doc.employeeName || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{doc.formType?.replace('_', ' ') || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.status === 'acknowledged' ? 'bg-green-900 text-green-300' :
                      doc.status === 'submitted' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// HR Policies Component
// ============================================================================

function HRPoliciesSection({ policies, category }: { policies: HRPolicy[]; category: PolicyCategory }) {
  const filteredPolicies = policies.filter(p => p.policyCategory === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{category.replace('_', ' ')}</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          Add Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No policies found in this category
          </div>
        ) : (
          filteredPolicies.map((policy) => (
            <div key={policy.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{policy.policyName}</h4>
                  <p className="text-sm text-gray-400">{policy.policyCode} | v{policy.version}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  policy.status === PolicyStatus.PUBLISHED ? 'bg-green-900 text-green-300' :
                  policy.status === PolicyStatus.DRAFT ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {policy.status}
                </span>
              </div>
              {policy.summary && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{policy.summary}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Effective: {policy.effectiveFrom}
                </span>
                {policy.requiresAcknowledgment && (
                  <span className="text-blue-400">
                    {policy.acknowledgmentCount} acknowledged
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">
                  View
                </button>
                {policy.fileUrl && (
                  <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Document Repository Component
// ============================================================================

function DocumentRepositorySection({ documents }: { documents: DocumentRepository[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Document Repository</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-700 rounded">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{doc.documentName}</h4>
                <p className="text-sm text-gray-400 truncate">{doc.fileName}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{doc.fileSize ? `${doc.fileSize} KB` : ''}</span>
                  <span>|</span>
                  <span>{doc.downloadCount} downloads</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {doc.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Certificate Requests Component
// ============================================================================

function CertificateRequestsSection({ requests, type }: { requests: CertificateRequest[]; type?: CertificateType }) {
  const filteredRequests = type
    ? requests.filter(r => r.certificateType === type)
    : requests;

  const getStatusColor = (status: CertificateRequestStatus) => {
    switch (status) {
      case CertificateRequestStatus.ISSUED: return 'bg-green-900 text-green-300';
      case CertificateRequestStatus.APPROVED: return 'bg-blue-900 text-blue-300';
      case CertificateRequestStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
      case CertificateRequestStatus.REJECTED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {type ? type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Certificate Requests'}
        </h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Request #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Purpose</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Requested</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <span className="text-blue-400 font-mono text-sm">{request.requestNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white">{request.employeeName}</p>
                    <p className="text-xs text-gray-500">{request.department}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300 capitalize">
                  {request.certificateType.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-gray-300 truncate max-w-xs">
                  {request.purpose || '-'}
                </td>
                <td className="px-4 py-3 text-gray-300">{request.requestDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {request.status === CertificateRequestStatus.PENDING && (
                      <>
                        <button className="text-green-400 hover:text-green-300 text-sm">Approve</button>
                        <button className="text-red-400 hover:text-red-300 text-sm">Reject</button>
                      </>
                    )}
                    {request.status === CertificateRequestStatus.ISSUED && request.documentUrl && (
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Compliance Tracking Component
// ============================================================================

function ComplianceTrackingSection({ tracking, status }: { tracking: DocumentComplianceTracking[]; status: ComplianceStatus }) {
  const filteredTracking = tracking.filter(t => t.complianceStatus === status);

  const getStatusColor = (complianceStatus: ComplianceStatus) => {
    switch (complianceStatus) {
      case ComplianceStatus.MISSING: return 'bg-red-900 text-red-300';
      case ComplianceStatus.EXPIRED: return 'bg-red-900 text-red-300';
      case ComplianceStatus.EXPIRING_SOON: return 'bg-orange-900 text-orange-300';
      case ComplianceStatus.COMPLIANT: return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">
          {status === ComplianceStatus.EXPIRING_SOON ? 'Renewal Reminders' : `${status} Documents`}
        </h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
          <Bell className="h-4 w-4" />
          Send Reminders
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tracking #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Document</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due/Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reminders</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredTracking.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No {status} documents found
                </td>
              </tr>
            ) : (
              filteredTracking.map((item) => (
                <tr key={item.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{item.trackingCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{item.employeeName}</p>
                      <p className="text-xs text-gray-500">{item.department}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{item.documentName}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{item.documentCategory}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {item.expiryDate || item.dueDate || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{item.remindersSent} sent</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.complianceStatus)}`}>
                      {item.complianceStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        <Bell className="h-4 w-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300 text-sm">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Upload Documents Component (real file upload/list/delete)
// ============================================================================

// Owning-record type for HR employee-document uploads in the attachments store.
const HR_DOC_ENTITY_TYPE = 'hr-document';

function UploadDocumentsSection() {
  const [employeeId, setEmployeeId] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async (id: string) => {
    if (!id.trim()) {
      setAttachments([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const rows = await AttachmentsService.list(HR_DOC_ENTITY_TYPE, id.trim());
      setAttachments(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      setAttachments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    if (!employeeId.trim()) {
      setError('Enter an employee id before uploading.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      await Promise.all(
        files.map((file) =>
          AttachmentsService.upload(file, HR_DOC_ENTITY_TYPE, employeeId.trim()),
        ),
      );
      await load(employeeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await AttachmentsService.remove(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            onBlur={() => load(employeeId)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesChosen}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !employeeId.trim()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">File</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…
                </td>
              </tr>
            ) : attachments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {employeeId.trim()
                    ? 'No documents uploaded for this employee.'
                    : 'Enter an employee id to view and upload documents.'}
                </td>
              </tr>
            ) : (
              attachments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-white">{a.fileName}</td>
                  <td className="px-4 py-3 text-gray-300">{a.mimeType}</td>
                  <td className="px-4 py-3 text-gray-300">{(a.size / 1024).toFixed(0)} KB</td>
                  <td className="px-4 py-3 text-gray-300">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <a
                        href={AttachmentsService.downloadUrl(a.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function DocumentManagementPage() {
  const [mainTab, setMainTab] = useState<MainTab>('employee_documents');
  const [employeeDocSubTab, setEmployeeDocSubTab] = useState<EmployeeDocSubTab>('personal');
  const [complianceSubTab, setComplianceSubTab] = useState<ComplianceSubTab>('statutory_forms');
  const [policySubTab, setPolicySubTab] = useState<PolicySubTab>('employee_handbook');
  const [repositorySubTab, setRepositorySubTab] = useState<RepositorySubTab>('browse');
  const [certificateSubTab, setCertificateSubTab] = useState<CertificateSubTab>('experience');
  const [trackingSubTab, setTrackingSubTab] = useState<TrackingSubTab>('missing');

  const [dashboardStats, setDashboardStats] = useState<DocumentDashboardStats | null>(null);
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);
  const [policies, setPolicies] = useState<HRPolicy[]>([]);
  const [repositoryDocuments, setRepositoryDocuments] = useState<DocumentRepository[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [complianceTracking, setComplianceTracking] = useState<DocumentComplianceTracking[]>([]);

  useEffect(() => {
    loadDashboard();
    loadEmployeeDocuments();
    loadComplianceDocuments();
    loadPolicies();
    loadRepositoryDocuments();
    loadCertificateRequests();
    loadComplianceTracking();
  }, []);

  const loadDashboard = async () => {
    try {
      const stats = await DocumentManagementService.getDashboard();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadEmployeeDocuments = async () => {
    try {
      const result = await DocumentManagementService.getEmployeeDocuments();
      setEmployeeDocuments(result.data);
    } catch (error) {
      console.error('Error loading employee documents:', error);
    }
  };

  const loadComplianceDocuments = async () => {
    try {
      const result = await DocumentManagementService.getComplianceDocuments();
      setComplianceDocuments(result.data);
    } catch (error) {
      console.error('Error loading compliance documents:', error);
    }
  };

  const loadPolicies = async () => {
    try {
      const result = await DocumentManagementService.getHRPolicies();
      setPolicies(result.data);
    } catch (error) {
      console.error('Error loading policies:', error);
    }
  };

  const loadRepositoryDocuments = async () => {
    try {
      const result = await DocumentManagementService.getRepositoryDocuments();
      setRepositoryDocuments(result.data);
    } catch (error) {
      console.error('Error loading repository documents:', error);
    }
  };

  const loadCertificateRequests = async () => {
    try {
      const result = await DocumentManagementService.getCertificateRequests();
      setCertificateRequests(result.data);
    } catch (error) {
      console.error('Error loading certificate requests:', error);
    }
  };

  const loadComplianceTracking = async () => {
    try {
      const result = await DocumentManagementService.getComplianceTracking();
      setComplianceTracking(result.data);
    } catch (error) {
      console.error('Error loading compliance tracking:', error);
    }
  };

  const mainTabs = [
    { id: 'employee_documents' as MainTab, label: 'Employee Documents', icon: FileText },
    { id: 'compliance_documents' as MainTab, label: 'Compliance Documents', icon: Shield },
    { id: 'policies' as MainTab, label: 'HR Policies', icon: BookOpen },
    { id: 'repository' as MainTab, label: 'Document Repository', icon: FolderOpen },
    { id: 'certificates' as MainTab, label: 'Certificate Requests', icon: Award },
    { id: 'tracking' as MainTab, label: 'Compliance Tracking', icon: AlertTriangle },
  ];

  const employeeDocSubTabs = [
    { id: 'personal' as EmployeeDocSubTab, label: 'Personal Documents' },
    { id: 'educational' as EmployeeDocSubTab, label: 'Educational Documents' },
    { id: 'employment' as EmployeeDocSubTab, label: 'Employment Documents' },
    { id: 'upload' as EmployeeDocSubTab, label: 'Upload Documents' },
  ];

  const complianceSubTabs = [
    { id: 'statutory_forms' as ComplianceSubTab, label: 'Statutory Forms' },
    { id: 'declarations' as ComplianceSubTab, label: 'Declarations' },
    { id: 'nominations' as ComplianceSubTab, label: 'Nominations' },
    { id: 'insurance_forms' as ComplianceSubTab, label: 'Insurance Forms' },
  ];

  const policySubTabs = [
    { id: 'employee_handbook' as PolicySubTab, label: 'Employee Handbook' },
    { id: 'leave_policy' as PolicySubTab, label: 'Leave Policy' },
    { id: 'attendance_policy' as PolicySubTab, label: 'Attendance Policy' },
    { id: 'expense_policy' as PolicySubTab, label: 'Expense Policy' },
    { id: 'code_of_conduct' as PolicySubTab, label: 'Code of Conduct' },
    { id: 'other' as PolicySubTab, label: 'Other Policies' },
  ];

  const repositorySubTabs = [
    { id: 'browse' as RepositorySubTab, label: 'Browse Documents' },
    { id: 'search' as RepositorySubTab, label: 'Search Documents' },
    { id: 'upload' as RepositorySubTab, label: 'Upload Documents' },
    { id: 'archive' as RepositorySubTab, label: 'Document Archive' },
  ];

  const certificateSubTabs = [
    { id: 'experience' as CertificateSubTab, label: 'Experience Certificate' },
    { id: 'salary' as CertificateSubTab, label: 'Salary Certificate' },
    { id: 'employment' as CertificateSubTab, label: 'Employment Certificate' },
    { id: 'status' as CertificateSubTab, label: 'Request Status' },
  ];

  const trackingSubTabs = [
    { id: 'missing' as TrackingSubTab, label: 'Missing Documents' },
    { id: 'expired' as TrackingSubTab, label: 'Expired Documents' },
    { id: 'reminders' as TrackingSubTab, label: 'Renewal Reminders' },
  ];

  const getCurrentSubTabs = () => {
    switch (mainTab) {
      case 'employee_documents': return employeeDocSubTabs;
      case 'compliance_documents': return complianceSubTabs;
      case 'policies': return policySubTabs;
      case 'repository': return repositorySubTabs;
      case 'certificates': return certificateSubTabs;
      case 'tracking': return trackingSubTabs;
      default: return [];
    }
  };

  const getCurrentSubTab = () => {
    switch (mainTab) {
      case 'employee_documents': return employeeDocSubTab;
      case 'compliance_documents': return complianceSubTab;
      case 'policies': return policySubTab;
      case 'repository': return repositorySubTab;
      case 'certificates': return certificateSubTab;
      case 'tracking': return trackingSubTab;
      default: return '';
    }
  };

  const setCurrentSubTab = (tab: string) => {
    switch (mainTab) {
      case 'employee_documents': setEmployeeDocSubTab(tab as EmployeeDocSubTab); break;
      case 'compliance_documents': setComplianceSubTab(tab as ComplianceSubTab); break;
      case 'policies': setPolicySubTab(tab as PolicySubTab); break;
      case 'repository': setRepositorySubTab(tab as RepositorySubTab); break;
      case 'certificates': setCertificateSubTab(tab as CertificateSubTab); break;
      case 'tracking': setTrackingSubTab(tab as TrackingSubTab); break;
    }
  };

  const renderContent = () => {
    switch (mainTab) {
      case 'employee_documents':
        if (employeeDocSubTab === 'upload') {
          return <UploadDocumentsSection />;
        }
        const docCategory = employeeDocSubTab === 'personal' ? DocumentCategory.PERSONAL :
                          employeeDocSubTab === 'educational' ? DocumentCategory.EDUCATIONAL :
                          DocumentCategory.EMPLOYMENT;
        return <EmployeeDocumentsSection documents={employeeDocuments} category={docCategory} />;

      case 'compliance_documents':
        const compCategory = complianceSubTab === 'statutory_forms' ? ComplianceDocumentCategory.STATUTORY_FORM :
                            complianceSubTab === 'declarations' ? ComplianceDocumentCategory.DECLARATION :
                            complianceSubTab === 'nominations' ? ComplianceDocumentCategory.NOMINATION :
                            ComplianceDocumentCategory.INSURANCE_FORM;
        return <ComplianceDocumentsSection documents={complianceDocuments} category={compCategory} />;

      case 'policies':
        const polCategory = policySubTab === 'employee_handbook' ? PolicyCategory.EMPLOYEE_HANDBOOK :
                           policySubTab === 'leave_policy' ? PolicyCategory.LEAVE_POLICY :
                           policySubTab === 'attendance_policy' ? PolicyCategory.ATTENDANCE_POLICY :
                           policySubTab === 'expense_policy' ? PolicyCategory.EXPENSE_POLICY :
                           policySubTab === 'code_of_conduct' ? PolicyCategory.CODE_OF_CONDUCT :
                           PolicyCategory.OTHER;
        return <HRPoliciesSection policies={policies} category={polCategory} />;

      case 'repository':
        return <DocumentRepositorySection documents={repositoryDocuments} />;

      case 'certificates':
        if (certificateSubTab === 'status') {
          return <CertificateRequestsSection requests={certificateRequests} />;
        }
        const certType = certificateSubTab === 'experience' ? CertificateType.EXPERIENCE_CERTIFICATE :
                        certificateSubTab === 'salary' ? CertificateType.SALARY_CERTIFICATE :
                        CertificateType.EMPLOYMENT_CERTIFICATE;
        return <CertificateRequestsSection requests={certificateRequests} type={certType} />;

      case 'tracking':
        const trackStatus = trackingSubTab === 'missing' ? ComplianceStatus.MISSING :
                           trackingSubTab === 'expired' ? ComplianceStatus.EXPIRED :
                           ComplianceStatus.EXPIRING_SOON;
        return <ComplianceTrackingSection tracking={complianceTracking} status={trackStatus} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Document Management</h1>
            <p className="text-gray-400">Manage employee documents, policies, and compliance</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DocumentDashboard stats={dashboardStats} />

        {/* Main Tabs */}
        <div className="border-b border-gray-700 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  mainTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap gap-2">
          {getCurrentSubTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSubTab(tab.id)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                getCurrentSubTab() === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
