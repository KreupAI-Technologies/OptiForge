'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, FileText, GitBranch, Activity, Clock, Users,
  Calendar, AlertCircle, CheckCircle,
} from 'lucide-react';
import { WorkflowService, type WorkflowTemplate } from '@/services/workflow.service';

export default function WorkflowTemplateViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
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
        const t = await WorkflowService.getTemplateById(params.id);
        if (cancelled) return;
        if (!t) {
          setNotFound(true);
          return;
        }
        setTemplate(t);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load workflow template';
          if (/not found/i.test(msg)) setNotFound(true);
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

  const steps = Array.isArray(template?.steps) ? template!.steps : [];

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {template?.name || 'Workflow Template'}
              </h1>
              <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                Template detail
              </p>
            </div>
          </div>
          {template && (
            <button
              onClick={() => router.push(`/workflow/templates/edit/${params.id}`)}
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
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading workflow template…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {notFound && !isLoading && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Workflow template not found.
          </div>
        )}

        {template && !isLoading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Steps</p>
                <p className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                  {steps.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instances</p>
                <p className="text-2xl font-black text-purple-600 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {Number(template.instanceCount ?? 0)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Version</p>
                <p className="text-2xl font-black text-gray-900 mt-1">v{template.version ?? 1}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <p className="text-2xl font-black text-green-600 mt-1 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {String(template.status ?? '')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <p className="text-sm text-gray-600">{template.description || 'No description.'}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Code</p>
                  <p className="text-sm font-medium text-gray-900">{template.code || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="text-sm font-medium text-gray-900">{template.category || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Trigger</p>
                  <p className="text-sm font-medium text-gray-900">{template.triggerType || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Entity Type</p>
                  <p className="text-sm font-medium text-gray-900">{template.entityType || '—'}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>Created by {template.createdBy || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Updated{' '}
                    {template.updatedAt
                      ? new Date(template.updatedAt).toISOString().split('T')[0]
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Workflow Steps</h2>
              </div>
              {steps.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  This template has no steps defined.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {steps.map((step, index) => (
                    <div key={step.id ?? index} className="flex items-start gap-3 p-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.order ?? index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{step.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                            {String(step.type)}
                          </span>
                        </div>
                        {step.description && (
                          <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Assignee: {step.assigneeName || step.assigneeId || step.assigneeType || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
