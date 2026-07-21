'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  History,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Plus,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyPpe } from '@/services/hr-safety.service';

interface AssignedPPE {
  id: string;
  employee: string;
  item: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  condition: string;
}

export default function PPETrackingPage() {
  const [filter, setFilter] = useState('All');
  const [assignedPPE, setAssignedPPE] = useState<AssignedPPE[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee: '',
    item: '',
    issuedDate: '',
    expiryDate: '',
    condition: 'New',
    status: 'Compliant',
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getPpe('assignment');
      const mapped: AssignedPPE[] = rows.map((row: SafetyPpe) => ({
        id: String(row.itemCode ?? row.id ?? ''),
        employee: row.employeeName ?? '',
        item: row.itemName ?? '',
        issuedDate: row.issuedDate ?? '',
        expiryDate: row.expiryDate ?? '',
        status: row.status ?? '',
        condition: row.condition ?? '',
      }));
      setAssignedPPE(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load assigned PPE');
      setAssignedPPE([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalItems = assignedPPE.length;
  const expiringSoon = assignedPPE.filter(
    (u) => u.status === 'Expiring' || u.status === 'Expired',
  ).length;
  const compliantCount = assignedPPE.filter((u) => u.status === 'Compliant').length;
  const complianceRate = totalItems
    ? Math.round((compliantCount / totalItems) * 1000) / 10
    : 0;
  const replacementRequests = assignedPPE.filter(
    (u) => u.condition === 'Poor' || u.status === 'Expired',
  ).length;

  const handleCreate = async () => {
    if (!form.employee || !form.item) return;
    setSaving(true);
    try {
      await HrSafetyService.createPpe({
        recordType: 'assignment',
        employeeName: form.employee,
        itemName: form.item,
        issuedDate: form.issuedDate,
        expiryDate: form.expiryDate,
        condition: form.condition,
        status: form.status,
      });
      setShowModal(false);
      setForm({ employee: '', item: '', issuedDate: '', expiryDate: '', condition: 'New', status: 'Compliant' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading assigned PPE…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-orange-600" />
            PPE Tracking
          </h1>
          <p className="text-gray-500 mt-1">Monitor the lifecycle, condition, and compliance of PPE across the workforce</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <History className="w-4 h-4 mr-2" />
            History
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Direct Assignment
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Active Units</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> 2.4% increase since last month
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Site Compliance</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{complianceRate}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${complianceRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiring / Expired</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{expiringSoon}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] text-red-600 mt-4 font-bold uppercase tracking-tighter">Requires replacement</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Review Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{replacementRequests}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <User className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-orange-600 mt-4 font-bold uppercase tracking-tighter cursor-pointer hover:underline">View All Requests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['All', 'Compliant', 'Expiring', 'Expired'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${filter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search item or employee..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-64" />
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded border border-gray-100"><Filter className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2">Status & Tracking ID</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Equipment Item</th>
                <th className="px-3 py-2">Issue Date</th>
                <th className="px-3 py-2">Expiration</th>
                <th className="px-3 py-2">Condition</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {assignedPPE.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {unit.status === 'Compliant' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                        unit.status === 'Expired' ? <XCircle className="w-4 h-4 text-red-500" /> :
                          <Clock className="w-4 h-4 text-orange-500" />}
                      <span className="text-[11px] font-mono text-gray-400">{unit.id}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-900">{unit.employee}</td>
                  <td className="px-3 py-2 text-gray-600">{unit.item}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-400">{unit.issuedDate}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className={`text-xs ${unit.status === 'Expired' ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{unit.expiryDate}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Approx. {unit.status === 'Expired' ? 'Overdue' : 'Remaining'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.condition === 'Good' || unit.condition === 'New' ? 'bg-green-50 text-green-700' :
                      unit.condition === 'Fair' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                      }`}>
                      {unit.condition}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Showing <strong>{assignedPPE.length}</strong> of <strong>{totalItems}</strong> assigned units</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <button className="text-orange-600 font-bold hover:underline">Download Comprehensive Tracking Report</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-400 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-white border border-orange-200 rounded text-xs text-orange-600 font-bold">1</button>
            <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">2</button>
            <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900">Direct Assignment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee</label>
                <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Equipment Item</label>
                <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issue Date</label>
                  <input type="date" value={form.issuedDate} onChange={(e) => setForm({ ...form, issuedDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiration</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>Compliant</option>
                    <option>Expiring</option>
                    <option>Expired</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.employee || !form.item}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-gray-300">
                {saving ? 'Saving…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
