'use client';

import { useState, useMemo, useEffect } from 'react';
import { Briefcase, Upload, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService, HrDocument } from '@/services/hr-compliance-docs.service';

interface EmploymentDocument {
  id: string;
  documentType: string;
  companyName: string;
  designation: string;
  fromDate: string;
  toDate: string;
  duration: string;
  lastSalary?: string;
  reasonForLeaving?: string;
  uploadedOn: string;
  status: 'verified' | 'pending' | 'rejected';
  fileSize: string;
  fileName: string;
  verifiedBy?: string;
  verifiedOn?: string;
  remarks?: string;
}

export default function EmploymentDocumentsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [items, setItems] = useState<EmploymentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getDocuments('employment');
        if (!active) return;
        const mapped: EmploymentDocument[] = rows.map((r: HrDocument) => ({
          id: r.id,
          documentType: r.documentType || '',
          companyName: r.meta?.companyName || '',
          designation: r.meta?.designation || '',
          fromDate: r.meta?.fromDate || '',
          toDate: r.meta?.toDate || '',
          duration: r.meta?.duration || '',
          lastSalary: r.meta?.lastSalary,
          reasonForLeaving: r.meta?.reasonForLeaving,
          uploadedOn: r.uploadedOn || '',
          status: (r.status as EmploymentDocument['status']) || 'pending',
          fileSize: r.fileSize || '',
          fileName: r.fileName || '',
          verifiedBy: r.verifiedBy,
          verifiedOn: r.verifiedOn,
          remarks: r.remarks,
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load documents');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockDocuments: EmploymentDocument[] = [
    {
      id: 'EMP001',
      documentType: 'Experience Letter',
      companyName: 'ABC Technologies Pvt Ltd',
      designation: 'Senior Accountant',
      fromDate: '2020-01-15',
      toDate: '2023-12-31',
      duration: '3 years 11 months',
      lastSalary: '₹8,50,000',
      reasonForLeaving: 'Better opportunity',
      uploadedOn: '2024-01-10',
      status: 'verified',
      fileSize: '312 KB',
      fileName: 'abc_tech_experience_letter.pdf',
      verifiedBy: 'Kavita Sharma',
      verifiedOn: '2024-01-11'
    },
    {
      id: 'EMP002',
      documentType: 'Relieving Letter',
      companyName: 'ABC Technologies Pvt Ltd',
      designation: 'Senior Accountant',
      fromDate: '2020-01-15',
      toDate: '2023-12-31',
      duration: '3 years 11 months',
      uploadedOn: '2024-01-10',
      status: 'verified',
      fileSize: '245 KB',
      fileName: 'abc_tech_relieving_letter.pdf',
      verifiedBy: 'Kavita Sharma',
      verifiedOn: '2024-01-11'
    },
    {
      id: 'EMP003',
      documentType: 'Salary Slips (Last 3 months)',
      companyName: 'ABC Technologies Pvt Ltd',
      designation: 'Senior Accountant',
      fromDate: '2023-10-01',
      toDate: '2023-12-31',
      duration: '3 months',
      uploadedOn: '2024-01-10',
      status: 'verified',
      fileSize: '456 KB',
      fileName: 'abc_tech_salary_slips.pdf',
      verifiedBy: 'Kavita Sharma',
      verifiedOn: '2024-01-11'
    },
    {
      id: 'EMP004',
      documentType: 'Experience Letter',
      companyName: 'XYZ Consultants',
      designation: 'Junior Accountant',
      fromDate: '2018-06-01',
      toDate: '2019-12-31',
      duration: '1 year 7 months',
      lastSalary: '₹4,50,000',
      reasonForLeaving: 'Career growth',
      uploadedOn: '2024-01-10',
      status: 'verified',
      fileSize: '289 KB',
      fileName: 'xyz_consultants_experience.pdf',
      verifiedBy: 'Kavita Sharma',
      verifiedOn: '2024-01-12'
    },
    {
      id: 'EMP005',
      documentType: 'Appointment Letter',
      companyName: 'Current Company',
      designation: 'Finance Manager',
      fromDate: '2024-01-01',
      toDate: 'Present',
      duration: 'Current',
      uploadedOn: '2024-01-15',
      status: 'pending',
      fileSize: '198 KB',
      fileName: 'current_appointment_letter.pdf'
    }
  ];

  const sourceDocuments = items.length > 0 ? items : mockDocuments;

  const filteredDocuments = useMemo(() => {
    return sourceDocuments.filter(doc => {
      const matchesType = selectedType === 'all' || doc.documentType === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, sourceDocuments]);

  const documentTypes = ['all', ...Array.from(new Set(sourceDocuments.map(d => d.documentType)))];

  const stats = {
    total: sourceDocuments.length,
    verified: sourceDocuments.filter(d => d.status === 'verified').length,
    pending: sourceDocuments.filter(d => d.status === 'pending').length,
    rejected: sourceDocuments.filter(d => d.status === 'rejected').length
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
        <h1 className="text-2xl font-bold text-gray-900">Employment Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your previous employment records and certificates</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading documents…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Documents</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.total}</p>
            </div>
            <Briefcase className="h-8 w-8 text-indigo-600" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2">
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
                  <p className="text-md font-semibold text-gray-800">{doc.companyName}</p>
                  <p className="text-sm text-gray-600 mt-1">{doc.fileName} • {doc.fileSize}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Designation</p>
                  <p className="text-sm font-semibold text-gray-900">{doc.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employment Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doc.fromDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - {' '}
                    {doc.toDate === 'Present' ? 'Present' : new Date(doc.toDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Duration</p>
                  <p className="text-sm font-semibold text-indigo-600">{doc.duration}</p>
                </div>
                {doc.lastSalary && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Salary</p>
                    <p className="text-sm font-semibold text-gray-900">{doc.lastSalary} per annum</p>
                  </div>
                )}
                {doc.reasonForLeaving && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reason for Leaving</p>
                    <p className="text-sm font-semibold text-gray-900">{doc.reasonForLeaving}</p>
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
                <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm">
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
          <Briefcase className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">No documents match the selected filters</p>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Employment Document Requirements
        </h3>
        <ul className="text-sm text-indigo-800 space-y-1 ml-7">
          <li>• <strong>Experience Letters</strong>: From all previous employers on company letterhead</li>
          <li>• <strong>Relieving Letters</strong>: Mandatory from last employer (as per Indian labor laws)</li>
          <li>• <strong>Salary Slips</strong>: Last 3 months from previous employer for salary verification</li>
          <li>• <strong>Appointment Letter</strong>: Original appointment letter from previous companies</li>
          <li>• <strong>Form 16</strong>: Tax documents from previous employers (if applicable)</li>
          <li>• All documents must be on company letterhead with authorized signatory</li>
          <li>• Employment gap of more than 3 months requires explanation letter</li>
          <li>• Upload documents in PDF format (Max size: 2MB per file)</li>
        </ul>
      </div>
    </div>
  );
}
