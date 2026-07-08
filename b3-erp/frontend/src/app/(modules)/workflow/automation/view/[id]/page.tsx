'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Bot, Activity, CheckCircle, Clock, Users,
  GitBranch, Zap, Target, AlertCircle,
} from 'lucide-react';
import {
  workflowAutomationService,
  type AutomationRuleDTO,
} from '@/services/workflow-automation.service';

const COMPANY_ID = 'company-001';

export default function WorkflowAutomationViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rule, setRule] = useState<AutomationRuleDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
        setRule(r);
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

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
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
              <h1 className="text-2xl font-bold text-gray-900">{rule?.name || 'Automation Rule'}</h1>
              <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                Automation rule detail
              </p>
            </div>
          </div>
          {rule && (
            <button
              onClick={() => router.push(`/workflow/automation/edit/${params.id}`)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
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

        {rule && !isLoading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Executions</p>
                <p className="text-2xl font-black text-purple-600 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {Number(rule.executionCount ?? 0)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Success Rate</p>
                <p className="text-2xl font-black text-green-600 mt-1 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {Number(rule.successRate ?? 0)}%
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{rule.status || '—'}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{rule.priority || '—'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <p className="text-sm text-gray-600">{rule.description || 'No description.'}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="text-sm font-medium text-gray-900">{rule.category || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Frequency</p>
                  <p className="text-sm font-medium text-gray-900">{rule.frequency || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Avg Time</p>
                  <p className="text-sm font-medium text-gray-900">{rule.avgExecutionTime || '—'}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>Created by {rule.createdByName || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Trigger</h3>
                </div>
                <p className="text-sm font-medium text-blue-700">{rule.trigger || '—'}</p>
                <p className="text-sm text-gray-600 mt-1">{rule.triggerDetails || ''}</p>
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last run: {rule.lastRun || '—'} · Next run: {rule.nextRun || '—'}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Action</h3>
                </div>
                <p className="text-sm font-medium text-green-700">{rule.action || '—'}</p>
                {Array.isArray(rule.conditions) && rule.conditions.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {rule.conditions.length} condition(s)
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
