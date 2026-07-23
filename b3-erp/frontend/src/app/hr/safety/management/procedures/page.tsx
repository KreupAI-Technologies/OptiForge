'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  AlertTriangle,
  AlertCircle,
  PlayCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileCheck,
  X,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { HrSafetyService, SafetyTraining } from '@/services/hr-safety.service';

interface QuickGuide {
  title: string;
  meta: string;
  color: string;
  body: string;
}

// Static reference content for the quick-guide tiles (no backend record type
// exists for these training snippets); opened in a lightweight modal on click.
const QUICK_GUIDES: QuickGuide[] = [
  {
    title: 'Proper Lifting Technique',
    meta: 'Video • 2 min',
    color: 'text-purple-600',
    body: 'Keep your back straight and bend at the knees. Hold the load close to your body, lift with your legs, and avoid twisting. Ask for help or use a mechanical aid for loads over 25 kg.',
  },
  {
    title: 'Fire Extinguisher Usage',
    meta: 'Video • 3 min',
    color: 'text-blue-600',
    body: 'Remember P.A.S.S.: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep side to side. Always keep an exit behind you and evacuate if the fire grows.',
  },
  {
    title: 'PPE Selection Guide',
    meta: 'Interactive • 5 min',
    color: 'text-green-600',
    body: 'Match protective equipment to the hazard: eye protection for splash/impact, hearing protection above 85 dB, respiratory protection for airborne contaminants, and cut-resistant gloves for sharp materials. Inspect PPE before each use.',
  },
];

interface Procedure {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: number;
  duration: string;
  lastReview: string;
  importance: string;
  status: string;
}

interface ContactRow {
  name: string;
  number: string;
  type: string;
}

type Toast = { message: string; type: 'success' | 'error' };

export default function SafetyProceduresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [importantContacts, setImportantContacts] = useState<ContactRow[]>([]);
  const [activeGuide, setActiveGuide] = useState<QuickGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // View modal
  const [viewProc, setViewProc] = useState<Procedure | null>(null);

  // Status action
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    try {
      const [rows, contactRows] = await Promise.all([
        HrSafetyService.getTrainings('procedure'),
        HrSafetyService.getDrills('contact'),
      ]);
      const mapped: Procedure[] = rows.map((row: SafetyTraining) => {
        const meta = (row.meta || {}) as Record<string, unknown>;
        return {
          id: String(row.code ?? row.id ?? ''),
          title: row.title ?? '',
          category: row.category ?? '',
          description: row.description ?? '',
          steps: (meta.steps as number) ?? 0,
          duration: row.duration ?? '',
          lastReview: row.reviewDate ?? row.effectiveDate ?? '',
          importance: (meta.importance as string) ?? '',
          status: row.status ?? 'active',
        };
      });
      const contacts: ContactRow[] = contactRows
        .filter((c) => c.phone)
        .slice(0, 5)
        .map((c) => ({
          name: c.contactName ?? c.name ?? '',
          number: c.phone ?? '',
          type: c.serviceType ? 'External' : 'Internal',
        }));
      if (!cancelled) {
        setProcedures(mapped);
        setImportantContacts(contacts);
      }
    } catch (err) {
      if (!cancelled) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load procedures');
        setProcedures([]);
        setImportantContacts([]);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStartProcedure = async (proc: Procedure) => {
    setStatusUpdating(proc.id);
    try {
      await HrSafetyService.updateTraining(proc.id, { status: 'in_progress' });
      showToast(`"${proc.title}" started`, 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update procedure', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Emergency' && proc.importance === 'Critical') ||
      (activeTab === 'Routine' && proc.importance !== 'Critical');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading procedures…
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
            <ClipboardList className="h-8 w-8 text-orange-600" />
            Standard Operating Procedures
          </h1>
          <p className="text-gray-500 mt-1">Access safety protocols and emergency guides</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search procedures..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content: Procedure List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'All' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All Procedures
            </button>
            <button
              onClick={() => setActiveTab('Emergency')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Emergency' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Critical / Emergency
            </button>
            <button
              onClick={() => setActiveTab('Routine')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Routine' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Routine / Operational
            </button>
          </div>

          <div className="space-y-2">
            {filteredProcedures.map((proc) => (
              <div key={proc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 flex-1">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${proc.importance === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {proc.importance === 'Critical' ? <ShieldAlert className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{proc.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">{proc.id}</span>
                        {proc.importance === 'Critical' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">CRITICAL</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{proc.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <span className="flex items-center"><ClipboardList className="w-3 h-3 mr-1" /> {proc.steps} Steps</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {proc.duration}</span>
                        <span className="flex items-center">Updated: {proc.lastReview}</span>
                      </div>
                      {/* Per-card actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setViewProc(proc)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                        {proc.status !== 'in_progress' && (
                          <button
                            onClick={() => handleStartProcedure(proc)}
                            disabled={statusUpdating === proc.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            {statusUpdating === proc.id ? 'Updating…' : 'Start'}
                          </button>
                        )}
                        {proc.status === 'in_progress' && (
                          <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
                            <Clock className="h-3.5 w-3.5" />
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Emergency & Quick Actions */}
        <div className="space-y-3">
          {/* Emergency Contacts Card */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-3">
            <h3 className="text-lg font-bold text-red-800 flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Contacts
            </h3>
            <ul className="space-y-3">
              {importantContacts.map((contact, idx) => (
                <li key={idx} className="flex justify-between items-center pb-2 border-b border-red-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-red-900">{contact.name}</p>
                    <p className="text-xs text-red-600">{contact.type}</p>
                  </div>
                  <span className="text-sm font-bold text-red-800 bg-white px-2 py-1 rounded border border-red-100">
                    {contact.number}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-red-100">
              <button
                onClick={() => router.push('/hr/safety/incidents/tracking')}
                className="w-full py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </button>
            </div>
          </div>

          {/* Quick Guides */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Guides</h3>
            <div className="space-y-3">
              {QUICK_GUIDES.map((guide) => (
                <button
                  key={guide.title}
                  onClick={() => setActiveGuide(guide)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                >
                  <PlayCircle className={`w-8 h-8 ${guide.color} flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{guide.title}</p>
                    <p className="text-xs text-gray-500">{guide.meta}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Guide Modal */}
      {activeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setActiveGuide(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <PlayCircle className={`w-8 h-8 ${activeGuide.color} flex-shrink-0`} />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{activeGuide.title}</h2>
                  <p className="text-xs text-gray-500">{activeGuide.meta}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGuide(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{activeGuide.body}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveGuide(null)}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procedure Detail Modal */}
      {viewProc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewProc(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${viewProc.importance === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {viewProc.importance === 'Critical' ? <ShieldAlert className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewProc.title}</h2>
                  <p className="text-xs text-gray-500">{viewProc.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewProc(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Description</dt>
                <dd className="mt-1 text-gray-700">{viewProc.description || '—'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Category</dt>
                  <dd className="mt-1 text-gray-700">{viewProc.category || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Importance</dt>
                  <dd className="mt-1">
                    {viewProc.importance === 'Critical'
                      ? <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded font-medium">CRITICAL</span>
                      : <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">{viewProc.importance || 'Standard'}</span>
                    }
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Steps</dt>
                  <dd className="mt-1 font-medium text-gray-900">{viewProc.steps}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Duration</dt>
                  <dd className="mt-1 text-gray-700">{viewProc.duration || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Status</dt>
                  <dd className="mt-1 text-gray-700 capitalize">{viewProc.status.replace('_', ' ')}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Last Reviewed</dt>
                <dd className="mt-1 text-gray-700">{viewProc.lastReview || '—'}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end gap-2">
              {viewProc.status !== 'in_progress' && (
                <button
                  onClick={() => { setViewProc(null); handleStartProcedure(viewProc); }}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Start Procedure
                </button>
              )}
              <button
                onClick={() => setViewProc(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
