'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Download, Upload, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { HrComplianceDocsService, ComplianceReturn } from '@/services/hr-compliance-docs.service';

interface LWFReturn {
  id: string;
  returnMonth: string;
  state: string;
  registrationNumber: string;
  dueDate: string;
  filingDate?: string;
  status: 'draft' | 'filed' | 'overdue' | 'pending_approval';
  totalEmployees: number;
  coveredEmployees: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  challanNumber?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [items, setItems] = useState<LWFReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await HrComplianceDocsService.getReturns('lwf');
      const mapped: LWFReturn[] = rows.map((r: ComplianceReturn) => ({
        id: r.id,
        returnMonth: r.returnMonth || '',
        state: r.state || '',
        registrationNumber: r.registrationNumber || '',
        dueDate: r.dueDate || '',
        filingDate: r.filingDate,
        status: (r.status as LWFReturn['status']) || 'draft',
        totalEmployees: r.totalEmployees || 0,
        coveredEmployees: r.coveredEmployees || 0,
        employeeContribution: r.employeeContribution || 0,
        employerContribution: r.employerContribution || 0,
        totalContribution: r.totalContribution || 0,
        challanNumber: r.challanNumber,
        remarks: r.remarks,
      }));
      setItems(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ status: 'draft' });

  const handleCreate = async () => {
    try {
      setSaving(true);
      await HrComplianceDocsService.createReturn({
        returnType: 'lwf',
        status: 'draft',
        returnMonth: form.returnMonth || undefined,
        establishment: form.establishment || undefined,
        registrationNumber: form.registrationNumber || undefined,
        dueDate: form.dueDate || undefined,
        totalEmployees: form.totalEmployees ? Number(form.totalEmployees) : undefined,
        coveredEmployees: form.coveredEmployees ? Number(form.coveredEmployees) : undefined,
        totalPaid: form.totalPaid ? Number(form.totalPaid) : undefined,
      });
      setShowAdd(false);
      setForm({ status: 'draft' });
      await load();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create return');
    } finally {
      setSaving(false);
    }
  };

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleSubmitReturn = async (id: string) => {
    try {
      setSubmittingId(id);
      const updated = await HrComplianceDocsService.submitReturn(id);
      setItems(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, status: 'filed', filingDate: updated.filingDate || new Date().toISOString().slice(0, 10) }
            : r,
        ),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit return');
    } finally {
      setSubmittingId(null);
    }
  };

  const sourceLWFReturns = items;

  const filteredReturns = sourceLWFReturns.filter(ret => {
    const returnDate = new Date(ret.returnMonth);
    const matchesMonth = returnDate.getMonth() === selectedMonth;
    const matchesYear = returnDate.getFullYear() === selectedYear;
    const matchesStatus = selectedStatus === 'all' || ret.status === selectedStatus;
    return matchesMonth && matchesYear && matchesStatus;
  });

  const stats = {
    totalReturns: sourceLWFReturns.length,
    filed: sourceLWFReturns.filter(r => r.status === 'filed').length,
    pending: sourceLWFReturns.filter(r => r.status === 'pending_approval' || r.status === 'draft').length,
    overdue: sourceLWFReturns.filter(r => r.status === 'overdue').length
  };

  const statusColors = {
    filed: 'bg-green-100 text-green-700 border-green-300',
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    overdue: 'bg-red-100 text-red-700 border-red-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  const statusIcons = {
    filed: CheckCircle,
    draft: FileText,
    overdue: AlertCircle,
    pending_approval: Clock
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-600" />
            Labour Welfare Fund Returns
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monthly LWF contribution returns</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium flex items-center gap-2 shrink-0"
        >
          <FileText className="h-4 w-4" />
          New Return
        </button>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading returns…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Total Returns</p>
              <p className="text-3xl font-bold text-cyan-900 mt-1">{stats.totalReturns}</p>
              <p className="text-xs text-cyan-700 mt-1">Monthly returns</p>
            </div>
            <Users className="h-10 w-10 text-cyan-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Filed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.filed}</p>
              <p className="text-xs text-green-700 mt-1">Successfully filed</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-yellow-700 mt-1">Awaiting action</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
              <p className="text-xs text-red-700 mt-1">Past due date</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Status</option>
              <option value="filed">Filed</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="draft">Draft</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredReturns.length > 0 ? (
          filteredReturns.map((lwfReturn) => {
            const StatusIcon = statusIcons[lwfReturn.status];
            return (
              <div key={lwfReturn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        LWF Return - {new Date(lwfReturn.returnMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[lwfReturn.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {lwfReturn.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">State: {lwfReturn.state}</p>
                    <p className="text-xs text-gray-600">Registration Number: {lwfReturn.registrationNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Due Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(lwfReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {lwfReturn.filingDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filing Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(lwfReturn.filingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Employees</p>
                    <p className="text-sm font-bold text-gray-900">{lwfReturn.totalEmployees}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Covered Employees</p>
                    <p className="text-sm font-bold text-gray-900">{lwfReturn.coveredEmployees}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Employee Contribution</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(lwfReturn.employeeContribution)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Employer Contribution</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(lwfReturn.employerContribution)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Total Contribution</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(lwfReturn.totalContribution)}</p>
                  </div>
                </div>

                {lwfReturn.challanNumber && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Challan Number</p>
                    <p className="text-sm font-bold text-gray-900">{lwfReturn.challanNumber}</p>
                  </div>
                )}

                {lwfReturn.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{lwfReturn.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Return
                  </button>
                  {lwfReturn.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitReturn(lwfReturn.id)}
                      disabled={submittingId === lwfReturn.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {submittingId === lwfReturn.id ? 'Submitting...' : 'Submit Return'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Users className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600">No LWF returns for the selected filters</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">New LWF Return</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Month</label>
                <input type="month" value={form.returnMonth || ''} onChange={(e) => setForm({ ...form, returnMonth: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment</label>
                <input type="text" value={form.establishment || ''} onChange={(e) => setForm({ ...form, establishment: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input type="text" value={form.registrationNumber || ''} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Employees</label>
                <input type="number" value={form.totalEmployees || ''} onChange={(e) => setForm({ ...form, totalEmployees: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Covered Employees</label>
                <input type="number" value={form.coveredEmployees || ''} onChange={(e) => setForm({ ...form, coveredEmployees: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Paid</label>
                <input type="number" value={form.totalPaid || ''} onChange={(e) => setForm({ ...form, totalPaid: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status || 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="draft">Draft</option>
                  <option value="filed">Filed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
