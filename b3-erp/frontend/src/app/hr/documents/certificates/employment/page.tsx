'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, FileText, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';
import { DocumentManagementService } from '@/services/document-management.service';

interface EmploymentCertificateRequest {
  id: string;
  requestDate: string;
  purpose: string;
  addressedTo: string;
  includeDetails: {
    designation: boolean;
    department: boolean;
    joiningDate: boolean;
    salary: boolean;
    reportingManager: boolean;
  };
  deliveryMode: 'email' | 'physical' | 'both';
  status: 'pending' | 'approved' | 'generated' | 'delivered';
  requestedBy: string;
  approvedBy?: string;
  approvedOn?: string;
  generatedOn?: string;
  deliveredOn?: string;
  remarks?: string;
}

const parseIncludeDetails = (
  raw?: string,
): EmploymentCertificateRequest['includeDetails'] => {
  const fallback = {
    designation: false,
    department: false,
    joiningDate: false,
    salary: false,
    reportingManager: false,
  };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return {
      designation: Boolean(parsed?.designation),
      department: Boolean(parsed?.department),
      joiningDate: Boolean(parsed?.joiningDate),
      salary: Boolean(parsed?.salary),
      reportingManager: Boolean(parsed?.reportingManager),
    };
  } catch {
    return fallback;
  }
};

export default function EmploymentCertificatePage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [mockRequests, setMockRequests] = useState<EmploymentCertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [purpose, setPurpose] = useState('');
  const [addressedTo, setAddressedTo] = useState('');
  const [includeDesignation, setIncludeDesignation] = useState(true);
  const [includeDepartment, setIncludeDepartment] = useState(true);
  const [includeJoiningDate, setIncludeJoiningDate] = useState(true);
  const [includeSalary, setIncludeSalary] = useState(false);
  const [includeReportingManager, setIncludeReportingManager] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'email' | 'physical' | 'both'>('email');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await HrComplianceDocsService.getCertificateRequests('employment');
      const mapped: EmploymentCertificateRequest[] = rows.map((row) => ({
        id: String(row.id),
        requestDate: row.requestDate ?? '',
        purpose: row.purpose ?? '',
        addressedTo: row.addressedTo ?? '',
        includeDetails: parseIncludeDetails(row.includeDetails),
        deliveryMode: (row.deliveryMode ?? 'email') as EmploymentCertificateRequest['deliveryMode'],
        status: (row.status ?? 'pending') as EmploymentCertificateRequest['status'],
        requestedBy: row.requestedBy ?? '',
        approvedBy: row.approvedBy ?? '',
        approvedOn: row.approvedOn ?? '',
        generatedOn: row.generatedOn ?? '',
        deliveredOn: row.deliveredOn ?? '',
        remarks: row.remarks ?? '',
      }));
      setMockRequests(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load certificate requests');
      setMockRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setPurpose('');
    setAddressedTo('');
    setIncludeDesignation(true);
    setIncludeDepartment(true);
    setIncludeJoiningDate(true);
    setIncludeSalary(false);
    setIncludeReportingManager(false);
    setDeliveryMode('email');
    setRemarks('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLoadError(null);
    try {
      await HrComplianceDocsService.createCertificateRequest({
        recordType: 'employment',
        requestDate: new Date().toISOString().slice(0, 10),
        purpose,
        addressedTo,
        includeDetails: JSON.stringify({
          designation: includeDesignation,
          department: includeDepartment,
          joiningDate: includeJoiningDate,
          salary: includeSalary,
          reportingManager: includeReportingManager,
        }),
        deliveryMode,
        remarks,
        status: 'pending',
      });
      await load();
      resetForm();
      setShowRequestForm(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this certificate request?')) return;
    try {
      await DocumentManagementService.cancelCertificateRequest(id);
      setMockRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    delivered: mockRequests.filter(r => r.status === 'delivered').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    generated: 'bg-green-100 text-green-700',
    delivered: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employment Certificate</h1>
          <p className="text-sm text-gray-600 mt-1">Request employment verification certificates</p>
        </div>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading certificate requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Delivered</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">New Employment Certificate Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Rental Agreement, Bank Account"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Addressed To</label>
              <input
                type="text"
                value={addressedTo}
                onChange={(e) => setAddressedTo(e.target.value)}
                placeholder="e.g., Property Owner, Bank Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Details</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeDesignation}
                  onChange={(e) => setIncludeDesignation(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Current Designation</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeDepartment}
                  onChange={(e) => setIncludeDepartment(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Department</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeJoiningDate}
                  onChange={(e) => setIncludeJoiningDate(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Date of Joining</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeSalary}
                  onChange={(e) => setIncludeSalary(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Salary Details</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeReportingManager}
                  onChange={(e) => setIncludeReportingManager(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Reporting Manager</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value as 'email' | 'physical' | 'both')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email Only</option>
                <option value="physical">Physical Copy Only</option>
                <option value="both">Both Email & Physical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (if physical)</label>
              <input
                type="number"
                min="1"
                max="5"
                defaultValue="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any specific requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !purpose.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button
              onClick={() => { resetForm(); setShowRequestForm(false); }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {mockRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{request.purpose}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Request ID: {request.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(request.requestDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Addressed To</p>
                <p className="text-sm font-semibold text-gray-900">{request.addressedTo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Delivery Mode</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{request.deliveryMode}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Included Details</p>
              <div className="flex flex-wrap gap-2">
                {request.includeDetails.designation && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Designation</span>
                )}
                {request.includeDetails.department && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Department</span>
                )}
                {request.includeDetails.joiningDate && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Joining Date</span>
                )}
                {request.includeDetails.salary && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Salary</span>
                )}
                {request.includeDetails.reportingManager && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Reporting Manager</span>
                )}
              </div>
            </div>

            {request.approvedBy && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approved By</p>
                  <p className="text-sm font-semibold text-gray-900">{request.approvedBy}</p>
                  <p className="text-xs text-gray-500">{new Date(request.approvedOn!).toLocaleDateString('en-IN')}</p>
                </div>
                {request.generatedOn && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Generated On</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(request.generatedOn).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {request.deliveredOn && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Delivered On</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(request.deliveredOn).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {request.remarks && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-gray-700">{request.remarks}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {(request.status === 'delivered' || request.status === 'generated') && (
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm">
                  Download Certificate
                </button>
              )}
              {request.status === 'pending' && (
                <button
                  onClick={() => handleCancel(request.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Employment Certificate Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Employment certificates are processed within 2-3 working days</li>
          <li>• Certificates confirm your current employment status with the company</li>
          <li>• You can choose which details to include based on your requirement</li>
          <li>• Salary information requires additional approval from Finance department</li>
          <li>• Certificates are issued on company letterhead with authorized signature</li>
          <li>• For physical copies, collect from HR department during office hours</li>
          <li>• Email copies are digitally signed and password protected</li>
          <li>• Maximum 3 requests per month allowed</li>
        </ul>
      </div>
    </div>
  );
}
