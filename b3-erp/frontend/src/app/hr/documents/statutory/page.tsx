'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileCheck, Upload, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface StatutoryDocument {
  id: string;
  documentType: string;
  formNumber: string;
  documentName: string;
  uanNumber?: string;
  esicNumber?: string;
  uploadedOn: string;
  status: 'verified' | 'pending' | 'rejected';
  fileSize: string;
  fileName: string;
  verifiedBy?: string;
  verifiedOn?: string;
  remarks?: string;
}

export default function StatutoryDocumentsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mockDocuments, setMockDocuments] = useState<StatutoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getDocuments('statutory');
        const mapped: StatutoryDocument[] = rows.map((row) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            documentType: row.documentType ?? '',
            formNumber: row.documentNumber ?? '',
            documentName: row.title ?? '',
            uanNumber: meta.uanNumber ?? '',
            esicNumber: meta.esicNumber ?? '',
            uploadedOn: row.uploadedOn ?? '',
            status: (row.status ?? 'pending') as StatutoryDocument['status'],
            fileSize: row.fileSize ?? '',
            fileName: row.fileName ?? '',
            verifiedBy: row.verifiedBy ?? '',
            verifiedOn: row.verifiedOn ?? '',
            remarks: row.remarks ?? '',
          };
        });
        if (!cancelled) setMockDocuments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load statutory documents');
          setMockDocuments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter(doc => {
      const matchesType = selectedType === 'all' || doc.documentType === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, mockDocuments]);

  const documentTypes = ['all', ...Array.from(new Set(mockDocuments.map(d => d.documentType)))];

  const stats = {
    total: mockDocuments.length,
    verified: mockDocuments.filter(d => d.status === 'verified').length,
    pending: mockDocuments.filter(d => d.status === 'pending').length,
    rejected: mockDocuments.filter(d => d.status === 'rejected').length
  };

  const statusColors = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    verified: CheckCircle,
    pending: Clock,
    rejected: XCircle
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Statutory Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Manage PF, ESI, and other statutory compliance documents</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading statutory documents…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Total Documents</p>
              <p className="text-2xl font-bold text-teal-900 mt-1">{stats.total}</p>
            </div>
            <FileCheck className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Verified</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.verified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
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
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Document Types' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full md:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredDocuments.map(doc => {
          const StatusIcon = statusIcons[doc.status];

          return (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{doc.documentType}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[doc.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-md font-semibold text-gray-800">{doc.documentName}</p>
                  <p className="text-sm text-gray-600 mt-1">{doc.fileName} • {doc.fileSize}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Form Number</p>
                  <p className="text-sm font-semibold text-gray-900">{doc.formNumber}</p>
                </div>
                {doc.uanNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">UAN Number</p>
                    <p className="text-sm font-semibold text-teal-600">{doc.uanNumber}</p>
                  </div>
                )}
                {doc.esicNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">ESIC Number</p>
                    <p className="text-sm font-semibold text-teal-600">{doc.esicNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Uploaded On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doc.uploadedOn).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {doc.status === 'verified' && doc.verifiedBy && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified by <strong>{doc.verifiedBy}</strong> on {new Date(doc.verifiedOn!).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              )}

              {doc.remarks && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{doc.remarks}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg font-medium text-sm">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg font-medium text-sm">
                  <Download className="h-4 w-4" />
                  Download
                </button>
                {doc.status === 'pending' && (
                  <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm ml-auto">
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileCheck className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">No documents match the selected filters</p>
        </div>
      )}

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Statutory Document Requirements
        </h3>
        <ul className="text-sm text-teal-800 space-y-1 ml-7">
          <li>• <strong>PF Form 11</strong>: EPF member declaration form (mandatory for all employees)</li>
          <li>• <strong>PF Form 2</strong>: EPF & EPS nomination form</li>
          <li>• <strong>ESIC Form</strong>: ESI registration and nomination (for employees earning below ₹21,000/month)</li>
          <li>• <strong>Bank Details</strong>: Cancelled cheque or bank passbook first page</li>
          <li>• <strong>Professional Tax</strong>: PT enrollment certificate (state-specific)</li>
          <li>• All forms must be signed by employee with date</li>
          <li>• UAN and ESIC numbers must be accurate and verified</li>
          <li>• Upload documents in PDF format (Max size: 2MB per file)</li>
        </ul>
      </div>
    </div>
  );
}
