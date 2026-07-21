'use client';

import React, { useState, useEffect } from 'react';
import {
  FileWarning,
  Search,
  Plus,
  ArrowRight,
  FileText,
  Download,
  Users,
  Clock,
  ShieldAlert,
  Flame,
  Droplets,
  Stethoscope,
  Zap,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  X
} from 'lucide-react';
import { HrSafetyService, SafetyDrill } from '@/services/hr-safety.service';

interface EmergencyPlan {
  id: string;
  title: string;
  icon: any;
  color: string;
  backgroundColor: string;
  status: string;
  lastReviewed: string;
  coordinators: string[];
  priority: string;
}

export default function EmergencyPlansPage() {
  const [emergencyPlans, setEmergencyPlans] = useState<EmergencyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    coordinator: '',
    lastReviewed: '',
    priority: 'High',
    status: 'Active',
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getDrills('plan');
      const mapped: EmergencyPlan[] = rows.map((row: SafetyDrill) => {
        const meta = (row.meta || {}) as any;
        const coordinators = Array.isArray(meta.coordinators)
          ? meta.coordinators
          : row.coordinator
            ? [row.coordinator]
            : [];
        return {
          id: String(row.code ?? row.id ?? ''),
          title: row.name ?? row.drillType ?? '',
          icon: ShieldAlert,
          color: meta.color ?? 'text-orange-600',
          backgroundColor: meta.backgroundColor ?? 'bg-orange-50',
          status: row.status ?? '',
          lastReviewed: row.conductedDate ?? row.scheduledDate ?? '',
          coordinators,
          priority: meta.priority ?? '',
        };
      });
      setEmergencyPlans(mapped);
      setSelectedPlan((prev) => mapped.find((p) => p.id === prev?.id) ?? mapped[0] ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load emergency plans');
      setEmergencyPlans([]);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await HrSafetyService.createDrill({
        recordType: 'plan',
        name: form.title,
        coordinator: form.coordinator,
        conductedDate: form.lastReviewed,
        status: form.status,
        meta: { priority: form.priority, coordinators: form.coordinator ? [form.coordinator] : [] },
      });
      setShowModal(false);
      setForm({ title: '', coordinator: '', lastReviewed: '', priority: 'High', status: 'Active' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading emergency plans…
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
            <ShieldAlert className="h-8 w-8 text-orange-600" />
            Emergency Response Plans (ERP)
          </h1>
          <p className="text-gray-500 mt-1">Institutional protocols for crisis management and workplace safety emergencies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Plans Navigation */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            {emergencyPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start justify-between ${selectedPlan?.id === plan.id
                    ? 'bg-orange-50 border-orange-200 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-orange-100'
                  }`}
              >
                <div className="flex gap-2">
                  <div className={`p-3 rounded-lg ${plan.backgroundColor} ${plan.color}`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${selectedPlan?.id === plan.id ? 'text-orange-900' : 'text-gray-900'}`}>{plan.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter">ID: {plan.id} · {plan.status}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${selectedPlan?.id === plan.id ? 'translate-x-1 text-orange-400' : 'text-gray-300'}`} />
              </div>
            ))}
          </div>

          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Drill Effectiveness</h4>
              <p className="text-xs text-blue-50 text-opacity-80 leading-relaxed font-medium">
                Recent data shows average evacuation time has decreased by <span className="text-white font-bold underline italic">14%</span> since the implementation of the new Fire Wardens program.
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                View Analytics <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <ShieldAlert className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </div>

        {/* Plan Detail View */}
        <div className="lg:col-span-2 space-y-3">
          {selectedPlan && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-3 rounded-xl ${selectedPlan.backgroundColor} ${selectedPlan.color}`}>
                  <selectedPlan.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlan.title}</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" /> Last Official Review: {selectedPlan.lastReviewed}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 text-gray-400"><Download className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 text-gray-400"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Quick Response Steps */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Core Response Sequence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-medium">
                  {[
                    { step: '1', title: 'Isolation', desc: 'Secure the immediate area and isolate hazards.' },
                    { step: '2', title: 'Activation', desc: 'Trigger the specific alert systems for this plan.' },
                    { step: '3', title: 'Deployment', desc: 'Dispatch Response Team to affected location.' }
                  ].map((item) => (
                    <div key={item.step} className="p-4 bg-gray-50 rounded-xl relative">
                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 italic">{item.step}</span>
                      <h4 className="text-xs font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Coordinators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Plan Leadership
                  </h3>
                  <div className="space-y-3">
                    {selectedPlan.coordinators.map((name: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-orange-600">
                            {name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-900">{name}</span>
                        </div>
                        <span className="text-[9px] bg-gray-50 px-2 py-0.5 rounded text-gray-400 uppercase font-bold tracking-tighter">Primary Contact</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Compliance Checklist
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Annual Review Completed',
                      'Physical Map Verified',
                      'Response Team Trained',
                      'Regulatory Filing Done'
                    ].map((check, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-gray-600 py-1 font-medium italic">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${i < 3 ? 'text-green-500' : 'text-gray-200'}`} />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center px-8">
              <button className="text-xs font-bold text-orange-600 hover:underline">Download Comprehensive PDF Guide</button>
              <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-black transition-colors uppercase tracking-widest">Acknowledge Training</button>
            </div>
          </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900">Create New Plan</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coordinator</label>
                <input value={form.coordinator} onChange={(e) => setForm({ ...form, coordinator: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Reviewed</label>
                  <input type="date" value={form.lastReviewed} onChange={(e) => setForm({ ...form, lastReviewed: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Under Review</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 p-4">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-gray-300">
                {saving ? 'Saving…' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
