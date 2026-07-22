'use client';

import { useState, useMemo, useEffect } from 'react';
import { Shield, Upload, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService, HrDocument } from '@/services/hr-compliance-docs.service';

interface InsuranceDocument {
  id: string;
  insuranceType: string;
  policyNumber: string;
  insuranceProvider: string;
  coverageAmount: number;
  policyStartDate: string;
  policyEndDate: string;
  premiumAmount?: number;
  uploadedOn: string;
  status: 'active' | 'pending' | 'expired';
  fileSize: string;
  fileName: string;
  fileUrl?: string;
  nominees?: string[];
}

export default function InsuranceDocumentsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [items, setItems] = useState<InsuranceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const emptyForm = {
    insuranceType: '',
    policyNumber: '',
    insuranceProvider: '',
    coverageAmount: '',
    premiumAmount: '',
    policyStartDate: '',
    policyEndDate: '',
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const rows = await HrComplianceDocsService.getDocuments('insurance');
      const mapped: InsuranceDocument[] = rows.map((r: HrDocument) => ({
        id: r.id,
        insuranceType: r.documentType || '',
        policyNumber: r.documentNumber || '',
        insuranceProvider: r.issuingAuthority || '',
        coverageAmount: r.meta?.coverageAmount || 0,
        policyStartDate: r.issueDate || '',
        policyEndDate: r.expiryDate || '',
        premiumAmount: r.meta?.premiumAmount,
        uploadedOn: r.uploadedOn || '',
        status: (r.status as InsuranceDocument['status']) || 'pending',
        fileSize: r.fileSize || '',
        fileName: r.fileName || '',
        fileUrl: r.fileUrl,
        nominees: r.meta?.nominees,
      }));
      setItems(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!file) return;
    setIsSaving(true);
    setError(null);
    try {
      await HrComplianceDocsService.uploadDocumentFile(file, {
        docCategory: 'insurance',
        documentType: form.insuranceType,
        documentNumber: form.policyNumber,
        issuingAuthority: form.insuranceProvider,
        title: form.insuranceType,
        issueDate: form.policyStartDate || undefined,
        expiryDate: form.policyEndDate || undefined,
        status: 'pending',
        meta: {
          coverageAmount: form.coverageAmount ? Number(form.coverageAmount) : 0,
          premiumAmount: form.premiumAmount ? Number(form.premiumAmount) : undefined,
        },
      });
      await load();
      setForm({ ...emptyForm });
      setFile(null);
      setShowUploadForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create document');
    } finally {
      setIsSaving(false);
    }
  };

  const sourceDocuments = items;

  const filteredDocuments = useMemo(() => {
    return sourceDocuments.filter(doc => {
      const matchesType = selectedType === 'all' || doc.insuranceType === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, sourceDocuments]);

  const insuranceTypes = ['all', ...Array.from(new Set(sourceDocuments.map(d => d.insuranceType)))];

  const stats = {
    total: sourceDocuments.length,
    active: sourceDocuments.filter(d => d.status === 'active').length,
    pending: sourceDocuments.filter(d => d.status === 'pending').length,
    totalCoverage: sourceDocuments.filter(d => d.status === 'active').reduce((sum, d) => sum + d.coverageAmount, 0)
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700'
  };

  const isExpiringSoon = (endDate: string) => {
    const expiry = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Insurance Documents</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your company-provided insurance policies and documents</p>
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Policies</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Coverage</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(stats.totalCoverage / 100000).toFixed(1)}L</p>
            </div>
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Documents</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {insuranceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Insurance Types' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowUploadForm(true)}
              className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredDocuments.map(doc => {
          const expiringSoon = isExpiringSoon(doc.policyEndDate);

          return (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{doc.insuranceType}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[doc.status]}`}>
                      {doc.status === 'active' && <CheckCircle className="h-3 w-3" />}
                      {doc.status === 'pending' && <Clock className="h-3 w-3" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    {expiringSoon && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Renewing Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{doc.fileName} • {doc.fileSize}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Policy Number</p>
                  <p className="text-sm font-semibold text-gray-900">{doc.policyNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Insurance Provider</p>
                  <p className="text-sm font-semibold text-gray-900">{doc.insuranceProvider}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Coverage Amount</p>
                  <p className="text-lg font-bold text-green-600">₹{doc.coverageAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Policy Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doc.policyStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to{' '}
                    {new Date(doc.policyEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {doc.premiumAmount && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Premium Amount</p>
                    <p className="text-sm font-semibold text-gray-900">₹{doc.premiumAmount.toLocaleString('en-IN')} per year</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Uploaded On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doc.uploadedOn).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {doc.nominees && doc.nominees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Nominees</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.nominees.map((nominee, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {nominee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                  disabled={!doc.fileUrl}
                  title={doc.fileUrl ? 'View policy' : 'No file attached'}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  View Policy
                </button>
                <a
                  href={doc.fileUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.fileName || undefined}
                  aria-disabled={!doc.fileUrl}
                  title={doc.fileUrl ? 'Download document' : 'No file attached'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${doc.fileUrl ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 pointer-events-none opacity-40'}`}
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Shield className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No insurance documents found</h3>
          <p className="text-gray-600">No documents match the selected filters</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Insurance Coverage Information
        </h3>
        <ul className="text-sm text-green-800 space-y-1 ml-7">
          <li>• <strong>Group Health Insurance</strong>: ₹5,00,000 coverage for employee + dependents optional</li>
          <li>• <strong>Group Term Life Insurance</strong>: ₹10,00,000 coverage (10x annual CTC)</li>
          <li>• <strong>Personal Accident Insurance</strong>: ₹15,00,000 coverage for accidental death/disability</li>
          <li>• <strong>Maternity Coverage</strong>: Up to ₹1,00,000 (included in health insurance)</li>
          <li>• All premiums are paid by the company (employee contribution may apply for dependents)</li>
          <li>• Cashless hospitalization available at 5000+ network hospitals across India</li>
          <li>• Claim intimation must be done within 24 hours of hospitalization</li>
          <li>• Policy renewal happens annually on April 1st</li>
        </ul>
      </div>

      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Add Insurance Document</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Insurance Type</label>
                <input type="text" value={form.insuranceType} onChange={(e) => setForm(f => ({ ...f, insuranceType: e.target.value }))} placeholder="e.g., Group Health Insurance" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Policy Number</label>
                <input type="text" value={form.policyNumber} onChange={(e) => setForm(f => ({ ...f, policyNumber: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Insurance Provider</label>
                <input type="text" value={form.insuranceProvider} onChange={(e) => setForm(f => ({ ...f, insuranceProvider: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">File</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                {file && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Coverage Amount (₹)</label>
                <input type="number" value={form.coverageAmount} onChange={(e) => setForm(f => ({ ...f, coverageAmount: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Premium Amount (₹, optional)</label>
                <input type="number" value={form.premiumAmount} onChange={(e) => setForm(f => ({ ...f, premiumAmount: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Policy Start Date</label>
                <input type="date" value={form.policyStartDate} onChange={(e) => setForm(f => ({ ...f, policyStartDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Policy End Date</label>
                <input type="date" value={form.policyEndDate} onChange={(e) => setForm(f => ({ ...f, policyEndDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setForm({ ...emptyForm }); setFile(null); setShowUploadForm(false); }} disabled={isSaving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleCreate} disabled={isSaving || !form.insuranceType.trim() || !file} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">{isSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
