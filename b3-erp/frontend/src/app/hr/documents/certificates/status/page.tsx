'use client';

import { useState, useMemo, useEffect } from 'react';
import { Clock, Download, FileText, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';
import { DocumentManagementService } from '@/services/document-management.service';

interface CertificateRequest {
  id: string;
  type: 'experience' | 'salary' | 'employment';
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'generated' | 'delivered' | 'rejected';
  approvedBy?: string;
  approvedOn?: string;
  generatedOn?: string;
  deliveredOn?: string;
  rejectedReason?: string;
  deliveryMode: 'email' | 'physical' | 'both';
  fileUrl?: string;
  documentUrl?: string;
}

export default function CertificateStatusPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mockRequests, setMockRequests] = useState<CertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<CertificateRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getCertificateRequests();
        const mapped: CertificateRequest[] = rows.map((row) => ({
          id: String(row.id),
          type: (row.recordType ?? 'experience') as CertificateRequest['type'],
          purpose: row.purpose ?? '',
          requestDate: row.requestDate ?? '',
          status: (row.status ?? 'pending') as CertificateRequest['status'],
          approvedBy: row.approvedBy ?? '',
          approvedOn: row.approvedOn ?? '',
          generatedOn: row.generatedOn ?? '',
          deliveredOn: row.deliveredOn ?? '',
          rejectedReason: row.rejectedReason ?? '',
          deliveryMode: (row.deliveryMode ?? 'email') as CertificateRequest['deliveryMode'],
          fileUrl: (row as unknown as Record<string, unknown>).fileUrl as string | undefined,
          documentUrl: (row as unknown as Record<string, unknown>).documentUrl as string | undefined,
        }));
        if (!cancelled) setMockRequests(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load certificate requests');
          setMockRequests([]);
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

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this certificate request?')) return;
    try {
      await DocumentManagementService.cancelCertificateRequest(id);
      setMockRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const handleDownloadCertificate = (request: CertificateRequest) => {
    const url = request.fileUrl || request.documentUrl;
    if (url) {
      window.open(url, '_blank');
      return;
    }
    // Generate a client-side HTML certificate blob
    const typeLabel = typeLabels[request.type] ?? request.type;
    const requestedOn = request.requestDate
      ? new Date(request.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const deliveredOn = request.deliveredOn
      ? new Date(request.deliveredOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${typeLabel}</title>
<style>body{font-family:Georgia,serif;text-align:center;padding:60px;color:#1f2937}
.frame{border:8px double #2563eb;padding:48px;border-radius:12px}
h1{font-size:34px;color:#2563eb;margin-bottom:8px}
h2{font-size:22px;margin:24px 0}
.meta{color:#6b7280;margin-top:24px;font-size:14px}</style></head>
<body><div class="frame">
<h1>${typeLabel}</h1>
<p>This certifies the following request</p>
<h2>Purpose: ${request.purpose || '—'}</h2>
<div class="meta">
<p>Request ID: ${request.id} &bull; Requested on: ${requestedOn}</p>
${request.approvedBy ? `<p>Approved by: ${request.approvedBy}</p>` : ''}
${deliveredOn ? `<p>Delivered on: ${deliveredOn}</p>` : ''}
</div></div></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `certificate-${request.type}-${request.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const filteredRequests = useMemo(() => {
    return mockRequests.filter(req => {
      const matchesType = selectedType === 'all' || req.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, mockRequests]);

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    generated: mockRequests.filter(r => r.status === 'generated').length,
    delivered: mockRequests.filter(r => r.status === 'delivered').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    generated: 'bg-green-100 text-green-700',
    delivered: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const typeLabels = {
    experience: 'Experience Certificate',
    salary: 'Salary Certificate',
    employment: 'Employment Certificate'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Certificate Request Status</h1>
        <p className="text-sm text-gray-600 mt-1">Track all your certificate requests</p>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
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

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Approved</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Generated</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.generated}</p>
            </div>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="experience">Experience Certificate</option>
              <option value="salary">Salary Certificate</option>
              <option value="employment">Employment Certificate</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="generated">Generated</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{typeLabels[request.type]}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Request ID: {request.id} • {request.purpose}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(request.requestDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Delivery Mode</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{request.deliveryMode}</p>
              </div>
              {request.approvedBy && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approved By</p>
                  <p className="text-sm font-semibold text-gray-900">{request.approvedBy}</p>
                  <p className="text-xs text-gray-500">{new Date(request.approvedOn!).toLocaleDateString('en-IN')}</p>
                </div>
              )}
              {request.generatedOn && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Generated On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(request.generatedOn).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Pending Approval</p>
                    <p className="text-xs text-yellow-700 mt-1">Your request is being reviewed by HR department</p>
                  </div>
                </div>
              </div>
            )}

            {request.status === 'approved' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Approved - Being Generated</p>
                    <p className="text-xs text-blue-700 mt-1">Certificate is being prepared and will be ready soon</p>
                  </div>
                </div>
              </div>
            )}

            {request.status === 'generated' && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Certificate Generated</p>
                    <p className="text-xs text-green-700 mt-1">
                      {request.deliveryMode === 'email' && 'Certificate will be sent to your email'}
                      {request.deliveryMode === 'physical' && 'Collect physical copy from HR department'}
                      {request.deliveryMode === 'both' && 'Certificate will be emailed and physical copy is ready for collection'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {request.status === 'delivered' && (
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Delivered</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Delivered on {new Date(request.deliveredOn!).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {request.rejectedReason && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Request Rejected</p>
                    <p className="text-xs text-red-700 mt-1">{request.rejectedReason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {(request.status === 'delivered' || request.status === 'generated') && (
                <button
                  onClick={() => handleDownloadCertificate(request)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm"
                >
                  <Download className="h-4 w-4" />
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
              <button
                onClick={() => setDetailRequest(request)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">No certificate requests match the selected filters</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Request Processing Timeline
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• <strong>Pending:</strong> Request submitted and awaiting HR approval (1-2 days)</li>
          <li>• <strong>Approved:</strong> Request approved and certificate being prepared (1 day)</li>
          <li>• <strong>Generated:</strong> Certificate ready for delivery</li>
          <li>• <strong>Delivered:</strong> Certificate sent via email or available for physical collection</li>
          <li>• Average processing time: 2-3 working days</li>
          <li>• For urgent requests, contact HR department at hr@company.com</li>
        </ul>
      </div>

      {detailRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Certificate Request Details</h2>
              <button onClick={() => setDetailRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request ID</p>
                  <p className="text-sm font-semibold text-gray-900">{detailRequest.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900">{typeLabels[detailRequest.type]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[detailRequest.status]}`}>
                    {detailRequest.status.charAt(0).toUpperCase() + detailRequest.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Delivery Mode</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{detailRequest.deliveryMode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purpose</p>
                  <p className="text-sm text-gray-900">{detailRequest.purpose || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Request Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {detailRequest.requestDate ? new Date(detailRequest.requestDate).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
                {detailRequest.approvedBy && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approved By</p>
                    <p className="text-sm font-semibold text-gray-900">{detailRequest.approvedBy}</p>
                    {detailRequest.approvedOn && (
                      <p className="text-xs text-gray-500">{new Date(detailRequest.approvedOn).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                )}
                {detailRequest.generatedOn && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Generated On</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(detailRequest.generatedOn).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                {detailRequest.deliveredOn && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Delivered On</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(detailRequest.deliveredOn).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                {detailRequest.rejectedReason && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{detailRequest.rejectedReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              {(detailRequest.status === 'delivered' || detailRequest.status === 'generated') && (
                <button
                  onClick={() => { handleDownloadCertificate(detailRequest); setDetailRequest(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
              <button
                onClick={() => setDetailRequest(null)}
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
