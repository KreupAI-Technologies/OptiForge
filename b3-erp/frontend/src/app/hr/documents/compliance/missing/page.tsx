'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { AlertCircle, Upload, FileText, User, X } from 'lucide-react';
import { DocumentManagementService } from '@/services/document-management.service';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface MissingDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  documentType: string;
  category: 'personal' | 'education' | 'employment' | 'statutory';
  priority: 'high' | 'medium' | 'low';
  requestedOn: string;
  lastReminder?: string;
  remarks?: string;
}

export default function MissingDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [mockMissingDocs, setMockMissingDocs] = useState<MissingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [profileDoc, setProfileDoc] = useState<MissingDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<MissingDocument | null>(null);

  const [cancelledRef] = useState<{ current: boolean }>({ current: false });

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await DocumentManagementService.getMissingDocuments();
      const categories = ['personal', 'education', 'employment', 'statutory'];
      const mapped: MissingDocument[] = rows.map((r) => {
        const category = categories.includes(r.documentCategory)
          ? (r.documentCategory as MissingDocument['category'])
          : 'personal';
        return {
          id: r.id,
          employeeId: r.employeeId || r.employeeCode || '',
          employeeName: r.employeeName || '',
          department: r.department || '',
          documentType: r.documentName || r.documentType || '',
          category,
          // No explicit priority on compliance tracking; statutory items are high priority.
          priority: category === 'statutory' ? 'high' : 'medium',
          requestedOn: r.dueDate || r.submittedDate || '',
          lastReminder: r.lastReminderAt || undefined,
          remarks: undefined,
        };
      });
      if (!cancelledRef.current) setMockMissingDocs(mapped);
    } catch (err) {
      if (!cancelledRef.current) {
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load missing documents',
        );
        setMockMissingDocs([]);
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    loadData();
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendReminder = async (id: string) => {
    try {
      await DocumentManagementService.sendComplianceReminder(id);
      await loadData();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to send reminder',
      );
    }
  };

  const handleUploadDocument = (doc: MissingDocument) => {
    uploadTargetRef.current = doc;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const doc = uploadTargetRef.current;
    if (!file || !doc) return;
    e.target.value = '';
    setUploadingId(doc.id);
    setLoadError(null);
    try {
      await HrComplianceDocsService.uploadDocumentFile(
        file,
        {
          docCategory: doc.category,
          documentType: doc.documentType,
          title: doc.documentType,
          status: 'pending',
          meta: {
            employeeId: doc.employeeId,
            employeeName: doc.employeeName,
            department: doc.department,
          },
        },
        doc.id,
      );
      await loadData();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploadingId(null);
      uploadTargetRef.current = null;
    }
  };

  const handleViewEmployeeProfile = (doc: MissingDocument) => {
    setProfileDoc(doc);
  };

  const filteredDocs = useMemo(() => {
    return mockMissingDocs.filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || doc.priority === selectedPriority;
      return matchesCategory && matchesPriority;
    });
  }, [mockMissingDocs, selectedCategory, selectedPriority]);

  const stats = {
    total: mockMissingDocs.length,
    high: mockMissingDocs.filter(d => d.priority === 'high').length,
    medium: mockMissingDocs.filter(d => d.priority === 'medium').length,
    low: mockMissingDocs.filter(d => d.priority === 'low').length
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700'
  };

  const categoryLabels = {
    personal: 'Personal Documents',
    education: 'Education Documents',
    employment: 'Employment Documents',
    statutory: 'Statutory Documents'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Missing Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Track and follow up on pending document submissions</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading missing documents…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Missing</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.total}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">High Priority</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.high}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Medium Priority</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.medium}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Low Priority</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.low}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="personal">Personal Documents</option>
              <option value="education">Education Documents</option>
              <option value="employment">Employment Documents</option>
              <option value="statutory">Statutory Documents</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{doc.documentType}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${priorityColors[doc.priority]}`}>
                    {doc.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {categoryLabels[doc.category]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Document ID: {doc.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employee</p>
                <p className="text-sm font-semibold text-gray-900">{doc.employeeName}</p>
                <p className="text-xs text-gray-500">{doc.employeeId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-900">{doc.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requested On</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(doc.requestedOn).toLocaleDateString('en-IN')}
                </p>
              </div>
              {doc.lastReminder && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Reminder</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doc.lastReminder).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {doc.remarks && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-gray-700">{doc.remarks}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleUploadDocument(doc)}
                disabled={uploadingId === doc.id}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {uploadingId === doc.id ? 'Uploading…' : 'Upload Document'}
              </button>
              <button onClick={() => handleSendReminder(doc.id)} className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg font-medium text-sm">
                Send Reminder
              </button>
              <button onClick={() => handleViewEmployeeProfile(doc)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
                <User className="h-4 w-4" />
                View Employee Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No missing documents</h3>
          <p className="text-gray-600">All required documents have been submitted</p>
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Document Compliance Guidelines
        </h3>
        <ul className="text-sm text-orange-800 space-y-1 ml-7">
          <li>• <strong>High Priority:</strong> Statutory/mandatory documents required for compliance</li>
          <li>• <strong>Medium Priority:</strong> Important documents needed for employee records</li>
          <li>• <strong>Low Priority:</strong> Optional documents that enhance employee profile</li>
          <li>• Send automated reminders weekly for high priority documents</li>
          <li>• Escalate to department heads if documents not received within 30 days</li>
          <li>• Maintain audit trail of all document requests and reminders</li>
        </ul>
      </div>

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Employee Profile modal */}
      {profileDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Employee Summary</h2>
              <button onClick={() => setProfileDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profileDoc.employeeName}</p>
                <p className="text-sm text-gray-500">{profileDoc.employeeId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                <p className="font-semibold text-gray-900">{profileDoc.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Missing Document</p>
                <p className="font-semibold text-gray-900">{profileDoc.documentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Category</p>
                <p className="font-semibold text-gray-900 capitalize">{profileDoc.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Priority</p>
                <p className="font-semibold text-gray-900 uppercase">{profileDoc.priority}</p>
              </div>
              {profileDoc.requestedOn && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Requested On</p>
                  <p className="font-semibold text-gray-900">{new Date(profileDoc.requestedOn).toLocaleDateString('en-IN')}</p>
                </div>
              )}
              {profileDoc.lastReminder && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Reminder</p>
                  <p className="font-semibold text-gray-900">{new Date(profileDoc.lastReminder).toLocaleDateString('en-IN')}</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setProfileDoc(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
