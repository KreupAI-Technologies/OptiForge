'use client';

import { useState, useEffect } from 'react';
import { Settings, DollarSign, Clock, Users, Calendar, CheckCircle, AlertCircle, Save, Edit, Plus, Trash2, X } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { AddOTRateModal } from '@/components/hr/AddOTRateModal';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface OTRate {
  id: string;
  grade: string;
  designation: string;
  hourlyRate: number;
  multiplier: number;
  effectiveFrom: string;
  status: 'active' | 'inactive';
}

export default function OTSettingsPage() {
  const [activeTab, setActiveTab] = useState<'rates' | 'rules' | 'compoff' | 'limits'>('rates');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddRateModalOpen, setIsAddRateModalOpen] = useState(false);
  const [editRate, setEditRate] = useState<OTRate | null>(null);
  const [editForm, setEditForm] = useState({ grade: '', designation: '', hourlyRate: '', multiplier: '', effectiveFrom: '', status: 'active' as 'active' | 'inactive' });
  const [savingRate, setSavingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const openEditRate = (rate: OTRate) => {
    setEditRate(rate);
    setRateError(null);
    setEditForm({
      grade: rate.grade,
      designation: rate.designation,
      hourlyRate: String(rate.hourlyRate),
      multiplier: String(rate.multiplier),
      effectiveFrom: rate.effectiveFrom,
      status: rate.status,
    });
  };

  const handleUpdateRate = async () => {
    if (!editRate) return;
    setSavingRate(true);
    setRateError(null);
    try {
      const updated = await HrSelfServiceService.updateOvertimeRate(editRate.id, {
        grade: editForm.grade,
        designation: editForm.designation,
        hourlyRate: parseFloat(editForm.hourlyRate) || 0,
        multiplier: parseFloat(editForm.multiplier) || 0,
        effectiveFrom: editForm.effectiveFrom,
        status: editForm.status,
      });
      setOtRates((prev) => prev.map((r) => (r.id === editRate.id ? mapRate({ ...r, ...updated, ...editForm, hourlyRate: parseFloat(editForm.hourlyRate) || 0, multiplier: parseFloat(editForm.multiplier) || 0 }) : r)));
      setEditRate(null);
    } catch (err) {
      setRateError(err instanceof Error ? err.message : 'Failed to update OT rate');
    } finally {
      setSavingRate(false);
    }
  };

  const handleDeleteRate = async (rate: OTRate) => {
    if (!window.confirm(`Delete OT rate for ${rate.grade} - ${rate.designation}?`)) return;
    try {
      await HrSelfServiceService.deleteOvertimeRate(rate.id);
      setOtRates((prev) => prev.filter((r) => r.id !== rate.id));
    } catch (err) {
      setRateError(err instanceof Error ? err.message : 'Failed to delete OT rate');
    }
  };

  // OT Rate Configuration
  const [otRates, setOtRates] = useState<OTRate[]>([]);

  // General OT Rules
  const [otRules, setOtRules] = useState({
    minOTHours: 2,
    maxOTHoursPerDay: 4,
    maxOTHoursPerWeek: 20,
    maxOTHoursPerMonth: 80,
    weekendMultiplier: 2.0,
    holidayMultiplier: 2.5,
    nightShiftMultiplier: 1.5,
    requirePreApproval: true,
    autoApproveThreshold: 2,
    submissionDeadlineDays: 2
  });

  // Comp-Off Rules
  const [compOffRules, setCompOffRules] = useState({
    enabled: true,
    conversionRatio: 8, // 8 hours OT = 1 day comp-off
    expiryDays: 90,
    maxAccrualDays: 10,
    halfDayMinHours: 4,
    requireManagerApproval: true,
    allowNegativeBalance: false
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const mapRate = (r: any): OTRate => ({
    id: r.id,
    grade: r.grade || '',
    designation: r.designation || '',
    hourlyRate: Number(r.hourly_rate ?? r.hourlyRate ?? 0),
    multiplier: Number(r.multiplier ?? 1),
    effectiveFrom: r.effective_from ? String(r.effective_from).slice(0, 10) : (r.effectiveFrom || ''),
    status: (r.status === 'inactive' ? 'inactive' : 'active'),
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/hr/overtime-settings/rates?companyId=default-company-id`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => setOtRates(Array.isArray(rows) ? rows.map(mapRate) : []))
      .catch(() => setOtRates([]));

    fetch(`${API_BASE_URL}/hr/overtime-settings?companyId=default-company-id`)
      .then((res) => (res.ok ? res.json() : null))
      .then((s) => {
        if (s?.ot_rules) setOtRules((prev) => ({ ...prev, ...s.ot_rules }));
        if (s?.comp_off_rules) setCompOffRules((prev) => ({ ...prev, ...s.comp_off_rules }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rateColumns = [
    { key: 'grade', label: 'Grade', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'designation', label: 'Designation', sortable: true,
      render: (v: string) => <div className="text-gray-900">{v}</div>
    },
    { key: 'hourlyRate', label: 'Base Hourly Rate', sortable: true,
      render: (v: number) => (
        <div className="font-semibold text-green-700">₹{v.toLocaleString('en-IN')}/hr</div>
      )
    },
    { key: 'multiplier', label: 'OT Multiplier', sortable: true,
      render: (v: number) => (
        <div className="font-medium text-blue-700">{v}x</div>
      )
    },
    { key: 'calculated', label: 'OT Rate', sortable: false,
      render: (_: any, row: OTRate) => {
        const otRate = row.hourlyRate * row.multiplier;
        return (
          <div className="font-bold text-indigo-700">₹{otRate.toLocaleString('en-IN')}/hr</div>
        );
      }
    },
    { key: 'effectiveFrom', label: 'Effective From', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as any} />
    },
    { key: 'id', label: 'Actions', sortable: false,
      render: (_: any, row: OTRate) => (
        <div className="flex gap-2">
          <button onClick={() => openEditRate(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => handleDeleteRate(row)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete rate">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const handleSaveSettings = async () => {
    try {
      await fetch(`${API_BASE_URL}/hr/overtime-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'default-company-id', otRules, compOffRules }),
      });
      setIsEditMode(false);
    } catch {
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleAddRate = async (rateData: Omit<OTRate, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/hr/overtime-settings/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'default-company-id', ...rateData }),
      });
      if (res.ok) {
        const created = await res.json();
        setOtRates((prev) => [...prev, mapRate(created)]);
      }
    } catch {
      alert('Failed to add OT rate. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-600" />
          Overtime Settings & Configuration
        </h1>
        <p className="text-gray-600 mt-2">Configure OT rates, rules, and compensation policies</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex-1 px-3 py-2 font-medium transition-colors ${
              activeTab === 'rates'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              OT Rates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-3 py-2 font-medium transition-colors ${
              activeTab === 'rules'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              OT Rules
            </div>
          </button>
          <button
            onClick={() => setActiveTab('compoff')}
            className={`flex-1 px-3 py-2 font-medium transition-colors ${
              activeTab === 'compoff'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Comp-Off Policy
            </div>
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`flex-1 px-3 py-2 font-medium transition-colors ${
              activeTab === 'limits'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              OT Limits
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* OT Rates Tab */}
          {activeTab === 'rates' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Overtime Rate Configuration</h2>
                  <p className="text-sm text-gray-600 mt-1">Define OT rates by grade and designation</p>
                </div>
                <button
                  onClick={() => setIsAddRateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Rate
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Lowest OT Rate</p>
                  <p className="text-2xl font-bold text-green-700">₹{Math.min(...otRates.map(r => r.hourlyRate * r.multiplier)).toLocaleString('en-IN')}/hr</p>
                  <p className="text-xs text-gray-500 mt-1">Grade E1</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Highest OT Rate</p>
                  <p className="text-2xl font-bold text-blue-700">₹{Math.max(...otRates.map(r => r.hourlyRate * r.multiplier)).toLocaleString('en-IN')}/hr</p>
                  <p className="text-xs text-gray-500 mt-1">Grade M3</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Average OT Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ₹{Math.round(otRates.reduce((sum, r) => sum + (r.hourlyRate * r.multiplier), 0) / otRates.length).toLocaleString('en-IN')}/hr
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all grades</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Total Grades</p>
                  <p className="text-2xl font-bold text-yellow-700">{otRates.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active configurations</p>
                </div>
              </div>

              <DataTable data={otRates} columns={rateColumns} />

              {/* Rate Calculation Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  OT Rate Calculation Formula
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Regular OT Rate</strong> = Base Hourly Rate × OT Multiplier</p>
                  <p><strong>Weekend OT Rate</strong> = Regular OT Rate × Weekend Multiplier (2.0x)</p>
                  <p><strong>Holiday OT Rate</strong> = Regular OT Rate × Holiday Multiplier (2.5x)</p>
                  <p><strong>Night Shift OT</strong> = Regular OT Rate × Night Multiplier (1.5x)</p>
                </div>
              </div>
            </div>
          )}

          {/* OT Rules Tab */}
          {activeTab === 'rules' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Overtime Rules & Policies</h2>
                  <p className="text-sm text-gray-600 mt-1">Configure general OT eligibility and approval rules</p>
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditMode
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  {isEditMode ? 'Cancel Edit' : 'Edit Settings'}
                </button>
              </div>

              <div className="space-y-3">
                {/* OT Hours Limits */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">OT Hours Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum OT Hours (per request)
                      </label>
                      <input
                        type="number"
                        value={otRules.minOTHours}
                        onChange={(e) => setOtRules({ ...otRules, minOTHours: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum hours to qualify for OT</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum OT Hours (per day)
                      </label>
                      <input
                        type="number"
                        value={otRules.maxOTHoursPerDay}
                        onChange={(e) => setOtRules({ ...otRules, maxOTHoursPerDay: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum OT Hours (per week)
                      </label>
                      <input
                        type="number"
                        value={otRules.maxOTHoursPerWeek}
                        onChange={(e) => setOtRules({ ...otRules, maxOTHoursPerWeek: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum OT Hours (per month)
                      </label>
                      <input
                        type="number"
                        value={otRules.maxOTHoursPerMonth}
                        onChange={(e) => setOtRules({ ...otRules, maxOTHoursPerMonth: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Multipliers */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Special OT Multipliers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekend Multiplier
                      </label>
                      <input
                        type="number"
                        value={otRules.weekendMultiplier}
                        onChange={(e) => setOtRules({ ...otRules, weekendMultiplier: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Applied on Saturdays & Sundays</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Holiday Multiplier
                      </label>
                      <input
                        type="number"
                        value={otRules.holidayMultiplier}
                        onChange={(e) => setOtRules({ ...otRules, holidayMultiplier: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Applied on public holidays</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Night Shift Multiplier
                      </label>
                      <input
                        type="number"
                        value={otRules.nightShiftMultiplier}
                        onChange={(e) => setOtRules({ ...otRules, nightShiftMultiplier: parseFloat(e.target.value) })}
                        disabled={!isEditMode}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Applied for 10 PM - 6 AM</p>
                    </div>
                  </div>
                </div>

                {/* Approval Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval & Submission Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={otRules.requirePreApproval}
                        onChange={(e) => setOtRules({ ...otRules, requirePreApproval: e.target.checked })}
                        disabled={!isEditMode}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Require Pre-Approval</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Employees must get manager approval before working overtime
                        </div>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto-Approve Threshold (hours)
                        </label>
                        <input
                          type="number"
                          value={otRules.autoApproveThreshold}
                          onChange={(e) => setOtRules({ ...otRules, autoApproveThreshold: parseFloat(e.target.value) })}
                          disabled={!isEditMode}
                          step="0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">OT below this will be auto-approved</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Submission Deadline (days)
                        </label>
                        <input
                          type="number"
                          value={otRules.submissionDeadlineDays}
                          onChange={(e) => setOtRules({ ...otRules, submissionDeadlineDays: parseInt(e.target.value) })}
                          disabled={!isEditMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Days within which OT must be submitted</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comp-Off Policy Tab */}
          {activeTab === 'compoff' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Compensatory Off Policy</h2>
                  <p className="text-sm text-gray-600 mt-1">Configure comp-off conversion and utilization rules</p>
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditMode
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  {isEditMode ? 'Cancel Edit' : 'Edit Policy'}
                </button>
              </div>

              <div className="space-y-3">
                {/* Comp-Off Enable/Disable */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={compOffRules.enabled}
                      onChange={(e) => setCompOffRules({ ...compOffRules, enabled: e.target.checked })}
                      disabled={!isEditMode}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Enable Compensatory Off</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Allow employees to earn comp-off for overtime work instead of monetary compensation
                      </div>
                    </div>
                  </label>
                </div>

                {/* Conversion Rules */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conversion Ratio (hours → days)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={compOffRules.conversionRatio}
                          onChange={(e) => setCompOffRules({ ...compOffRules, conversionRatio: parseInt(e.target.value) })}
                          disabled={!isEditMode || !compOffRules.enabled}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <span className="text-gray-600">hours = 1 day</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">8 hours OT = 1 day comp-off</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Half Day Minimum Hours
                      </label>
                      <input
                        type="number"
                        value={compOffRules.halfDayMinHours}
                        onChange={(e) => setCompOffRules({ ...compOffRules, halfDayMinHours: parseFloat(e.target.value) })}
                        disabled={!isEditMode || !compOffRules.enabled}
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum OT hours for half-day comp-off</p>
                    </div>
                  </div>
                </div>

                {/* Accrual & Expiry */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Accrual & Expiry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Period (days)
                      </label>
                      <input
                        type="number"
                        value={compOffRules.expiryDays}
                        onChange={(e) => setCompOffRules({ ...compOffRules, expiryDays: parseInt(e.target.value) })}
                        disabled={!isEditMode || !compOffRules.enabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Days from earning date before expiry</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Accrual (days)
                      </label>
                      <input
                        type="number"
                        value={compOffRules.maxAccrualDays}
                        onChange={(e) => setCompOffRules({ ...compOffRules, maxAccrualDays: parseFloat(e.target.value) })}
                        disabled={!isEditMode || !compOffRules.enabled}
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum comp-off days an employee can accumulate</p>
                    </div>
                  </div>
                </div>

                {/* Additional Policies */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Policies</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={compOffRules.requireManagerApproval}
                        onChange={(e) => setCompOffRules({ ...compOffRules, requireManagerApproval: e.target.checked })}
                        disabled={!isEditMode || !compOffRules.enabled}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Require Manager Approval</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Manager must approve comp-off applications
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={compOffRules.allowNegativeBalance}
                        onChange={(e) => setCompOffRules({ ...compOffRules, allowNegativeBalance: e.target.checked })}
                        disabled={!isEditMode || !compOffRules.enabled}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Allow Negative Balance</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Employees can take comp-off in advance (will be deducted from future OT)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Policy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OT Limits Tab */}
          {activeTab === 'limits' && (
            <div>
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Overtime Limits Summary</h2>
                <p className="text-sm text-gray-600 mt-1">Overview of all OT limits and thresholds</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Per Day</p>
                      <p className="text-2xl font-bold text-yellow-700">{otRules.maxOTHoursPerDay} hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Maximum overtime hours allowed in a single day</p>
                </div>

                <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Per Week</p>
                      <p className="text-2xl font-bold text-blue-700">{otRules.maxOTHoursPerWeek} hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Maximum overtime hours allowed in a week</p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Per Month</p>
                      <p className="text-2xl font-bold text-indigo-700">{otRules.maxOTHoursPerMonth} hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Maximum overtime hours allowed in a month</p>
                </div>

                <div className="bg-white border-2 border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Auto-Approve</p>
                      <p className="text-2xl font-bold text-green-700">≤ {otRules.autoApproveThreshold} hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">OT requests below this are auto-approved</p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Minimum OT</p>
                      <p className="text-2xl font-bold text-purple-700">{otRules.minOTHours} hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Minimum hours required to qualify for OT</p>
                </div>

                <div className="bg-white border-2 border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="text-2xl font-bold text-red-700">{otRules.submissionDeadlineDays} days</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Submit OT requests within this period</p>
                </div>
              </div>

              {/* Multipliers Info */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Multipliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">{otRules.weekendMultiplier}x</div>
                    <div className="text-sm text-gray-700 font-medium">Weekend OT</div>
                    <div className="text-xs text-gray-500 mt-1">Saturday & Sunday</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">{otRules.holidayMultiplier}x</div>
                    <div className="text-sm text-gray-700 font-medium">Holiday OT</div>
                    <div className="text-xs text-gray-500 mt-1">Public holidays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{otRules.nightShiftMultiplier}x</div>
                    <div className="text-sm text-gray-700 font-medium">Night Shift OT</div>
                    <div className="text-xs text-gray-500 mt-1">10 PM - 6 AM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {!isEditMode && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Settings Configured</h3>
              <p className="text-sm text-green-700">
                All overtime settings are properly configured and active. Changes will apply immediately to new OT requests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add OT Rate Modal */}
      <AddOTRateModal
        isOpen={isAddRateModalOpen}
        onClose={() => setIsAddRateModalOpen(false)}
        onSubmit={handleAddRate}
      />

      {/* Edit OT Rate Modal */}
      {editRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3" onClick={() => setEditRate(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                <h2 className="text-xl font-bold">Edit OT Rate</h2>
              </div>
              <button onClick={() => setEditRate(null)} className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {rateError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {rateError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Code</label>
                  <input type="text" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input type="text" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Hourly Rate (₹)</label>
                  <input type="number" value={editForm.hourlyRate} onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })} step="10" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OT Multiplier</label>
                  <input type="number" value={editForm.multiplier} onChange={(e) => setEditForm({ ...editForm, multiplier: e.target.value })} step="0.1" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective From</label>
                  <input type="date" value={editForm.effectiveFrom} onChange={(e) => setEditForm({ ...editForm, effectiveFrom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t border-gray-200 rounded-b-lg">
              <button onClick={() => setEditRate(null)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateRate} disabled={savingRate} className="px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingRate ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
