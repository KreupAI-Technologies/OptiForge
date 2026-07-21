'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  Upload,
  Plus
} from 'lucide-react';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

interface CertificationRecord {
  id: number | string;
  employee: string;
  role: string;
  cert: string;
  provider: string;
  issued: string;
  expires: string;
  status: string;
}

function toDisplayStatus(s?: string): string {
  if (!s) return 'Active';
  return s === 'active' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CertificationsPage() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeName: '',
    employeeCode: '',
    certificationName: '',
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await TrainingDevelopmentService.getCertifications();
      const mapped: CertificationRecord[] = (Array.isArray(data) ? data : []).map((r: any) => ({
        id: r.id ?? '',
        employee: r.employeeName ?? '',
        role: r.employeeCode ?? '',
        cert: r.certificationName ?? r.name ?? '',
        provider: r.issuingAuthority ?? r.issuer ?? '',
        issued: r.issueDate ?? '',
        expires: r.expiryDate ?? '',
        status: toDisplayStatus(r.status),
      }));
      setCertifications(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load certifications');
      setCertifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [renewFor, setRenewFor] = useState<CertificationRecord | null>(null);
  const [renewDate, setRenewDate] = useState('');
  const [renewSaving, setRenewSaving] = useState(false);
  const [uploadFor, setUploadFor] = useState<CertificationRecord | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadSaving, setUploadSaving] = useState(false);

  const handleRenew = async () => {
    if (!renewFor || !renewDate) return;
    setRenewSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await TrainingDevelopmentService.renewCertification(String(renewFor.id), { newExpiryDate: renewDate });
      setRenewFor(null);
      setRenewDate('');
      setActionSuccess('Certification renewed.');
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to renew certification.');
    } finally {
      setRenewSaving(false);
    }
  };

  const openUpload = (cert: CertificationRecord) => {
    setActionError(null);
    setActionSuccess(null);
    setUploadUrl('');
    setUploadFor(cert);
  };

  const handleUpload = async () => {
    if (!uploadFor || !uploadUrl.trim()) return;
    setUploadSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await TrainingDevelopmentService.uploadCertificate(String(uploadFor.id), uploadUrl.trim());
      setActionSuccess(`Certificate attached for ${uploadFor.employee}.`);
      setUploadFor(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to upload certificate.');
    } finally {
      setUploadSaving(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived from fetched certifications: those expiring within 60 days.
  const expiryAlerts = React.useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    return certifications
      .map((c) => {
        if (!c.expires) return null;
        const exp = new Date(c.expires).getTime();
        if (isNaN(exp)) return null;
        const daysLeft = Math.ceil((exp - now) / DAY);
        if (daysLeft < 0 || daysLeft > 60) return null;
        return {
          record: c,
          employee: c.employee,
          cert: c.cert,
          expiry: c.expires,
          daysLeft,
          status: daysLeft <= 14 ? 'Critical' : 'Warning',
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [certifications]);

  // Derived compliance breakdown from certification statuses.
  const complianceData = React.useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    let compliant = 0;
    let expiring = 0;
    let nonCompliant = 0;
    certifications.forEach((c) => {
      const exp = c.expires ? new Date(c.expires).getTime() : NaN;
      const daysLeft = isNaN(exp) ? Infinity : Math.ceil((exp - now) / DAY);
      if (c.status !== 'Active' || daysLeft < 0) nonCompliant += 1;
      else if (daysLeft <= 60) expiring += 1;
      else compliant += 1;
    });
    return [
      { name: 'Compliant', value: compliant, color: '#22c55e' },
      { name: 'Non-Compliant', value: nonCompliant, color: '#ef4444' },
      { name: 'Expiring Soon', value: expiring, color: '#f59e0b' },
    ];
  }, [certifications]);

  const complianceRate = React.useMemo(() => {
    const total = certifications.length;
    if (total === 0) return 0;
    const compliant = complianceData.find((d) => d.name === 'Compliant')?.value ?? 0;
    return Math.round((compliant / total) * 100);
  }, [certifications, complianceData]);

  const handleExportReport = () => {
    const header = ['Employee', 'Employee Code', 'Certification', 'Provider', 'Issued', 'Expires', 'Status'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = certifications.map((c) =>
      [c.employee, c.role, c.cert, c.provider, c.issued, c.expires, c.status].map(escape).join(','),
    );
    const csv = [header.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certifications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddCertification = async () => {
    if (!form.employeeName || !form.certificationName) {
      setSubmitError('Please provide an employee and a certification name.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await TrainingDevelopmentService.createCertification({
        employeeName: form.employeeName,
        employeeCode: form.employeeCode || undefined,
        certificationName: form.certificationName,
        issuingAuthority: form.issuingAuthority || undefined,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
      });
      setShowAddModal(false);
      setForm({
        employeeName: '',
        employeeCode: '',
        certificationName: '',
        issuingAuthority: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
      });
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add certification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            Certification Tracking
          </h1>
          <p className="text-gray-500 mt-1">Manage professional certifications and compliance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportReport}
            disabled={certifications.length === 0}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading certifications…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionSuccess}</div>
      )}

      {/* Expiry Alerts & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Compliance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-gray-900 w-full text-left mb-2">Overall Compliance</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-gray-900">{complianceRate}%</span>
            <p className="text-xs text-gray-500">Compliance Rate</p>
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Expiring Within 60 Days
          </h2>
          <div className="space-y-3">
            {expiryAlerts.map((alert) => (
              <div key={alert.record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.status === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{alert.cert}</h3>
                    <p className="text-xs text-gray-500">{alert.employee} • Expires {alert.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${alert.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {alert.daysLeft} days left
                  </span>
                  <button
                    onClick={() => { setRenewFor(alert.record); setRenewDate(''); setActionError(null); setActionSuccess(null); }}
                    className="text-xs font-medium text-purple-600 hover:text-purple-800"
                  >
                    Renew
                  </button>
                </div>
              </div>
            ))}
            {expiryAlerts.length === 0 && (
              <p className="text-sm text-gray-500">No certifications expiring soon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Certification Repository Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">All Certifications</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Employee / Role</th>
                <th className="px-3 py-2">Certification</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Validity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-gray-900">{cert.employee}</p>
                    <p className="text-xs text-gray-500">{cert.role}</p>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">{cert.cert}</td>
                  <td className="px-3 py-2">{cert.provider}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col text-xs">
                      <span className="text-green-700">Issued: {cert.issued}</span>
                      <span className="text-red-700">Expires: {cert.expires}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${cert.status === 'Active' ? 'text-green-700 bg-green-50 ring-green-600/20' :
                        'text-amber-700 bg-amber-50 ring-amber-600/20'
                      }`}>
                      {cert.status === 'Active' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setRenewFor(cert); setRenewDate(''); setActionError(null); setActionSuccess(null); }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
                      >
                        <RefreshCw className="h-3 w-3" /> Renew
                      </button>
                      <button
                        onClick={() => openUpload(cert)}
                        disabled={actionId === String(cert.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        <Upload className="h-3 w-3" /> Upload
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-3 m-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Add Certification</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <input
                  type="text"
                  value={form.employeeName}
                  onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input
                  type="text"
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g. EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  value={form.certificationName}
                  onChange={(e) => setForm({ ...form, certificationName: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g. AWS Solutions Architect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={form.issuingAuthority}
                  onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Add Certification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Certification Modal */}
      {renewFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 m-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Renew Certification</h2>
            <p className="text-sm text-gray-500 mb-4">{renewFor.cert} • {renewFor.employee}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Expiry Date</label>
            <input
              type="date"
              value={renewDate}
              onChange={(e) => setRenewDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRenewFor(null)}
                disabled={renewSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={renewSaving || !renewDate}
                className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {renewSaving ? 'Renewing…' : 'Renew'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Certificate Modal */}
      {uploadFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 m-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Upload Certificate</h2>
            <p className="text-sm text-gray-500 mb-4">{uploadFor.cert} • {uploadFor.employee}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
            <input
              type="text"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="https://…/certificate.pdf"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setUploadFor(null)}
                disabled={uploadSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadSaving || !uploadUrl.trim()}
                className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {uploadSaving ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
