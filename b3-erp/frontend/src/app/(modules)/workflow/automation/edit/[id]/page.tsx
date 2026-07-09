'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Save, AlertCircle, CheckCircle } from 'lucide-react';
import {
  workflowAutomationService,
  type AutomationRuleDTO,
} from '@/services/workflow-automation.service';

const COMPANY_ID = 'company-001';

interface FormState {
  name: string;
  description: string;
  trigger: string;
  triggerDetails: string;
  action: string;
  status: string;
  frequency: string;
  category: string;
  priority: string;
}

export default function WorkflowAutomationEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);
      try {
        const r = await workflowAutomationService.findOne(COMPANY_ID, params.id);
        if (cancelled) return;
        if (!r) {
          setNotFound(true);
          return;
        }
        setForm({
          name: r.name ?? '',
          description: r.description ?? '',
          trigger: r.trigger ?? '',
          triggerDetails: r.triggerDetails ?? '',
          action: r.action ?? '',
          status: r.status ?? 'draft',
          frequency: r.frequency ?? '',
          category: r.category ?? '',
          priority: r.priority ?? 'medium',
        });
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load automation rule';
          if (/not found|404/i.test(msg)) setNotFound(true);
          else setLoadError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload: Partial<AutomationRuleDTO> = {
        name: form.name,
        description: form.description,
        trigger: form.trigger,
        triggerDetails: form.triggerDetails,
        action: form.action,
        status: form.status,
        frequency: form.frequency,
        category: form.category,
        priority: form.priority,
      };
      await workflowAutomationService.update(COMPANY_ID, params.id, payload);
      router.push('/workflow/automation');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save automation rule');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Automation Rule</h1>
            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
              Update automation rule configuration
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading && (
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
            Loading automation rule...
          </div>
        )}
        {loadError && !isLoading && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {notFound && !isLoading && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-600">
            Automation rule not found.
          </div>
        )}

        {form && !isLoading && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {saveError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  <option value="procurement">Procurement</option>
                  <option value="production">Production</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                  <option value="inventory">Inventory</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={3}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Trigger</label>
                <select value={form.trigger} onChange={(e) => setField('trigger', e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  <option value="schedule">Schedule</option>
                  <option value="event">Event</option>
                  <option value="condition">Condition</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Details</label>
                <input
                  type="text"
                  value={form.triggerDetails}
                  onChange={(e) => setField('triggerDetails', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                <input
                  type="text"
                  value={form.action}
                  onChange={(e) => setField('action', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <input
                  type="text"
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="error">Error</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setField('priority', e.target.value)} className={inputCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/workflow/automation')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
