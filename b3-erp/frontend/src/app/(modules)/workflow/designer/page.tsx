'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Workflow,
  ArrowLeft,
  Save,
  Play,
  GitBranch,
  Circle,
  Square,
  Diamond,
  Users,
  Mail,
  Clock,
  CheckCircle,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  workflowRepositoryService,
  WorkflowDefinitionDTO,
} from '@/services/workflow-repository.service';

export default function WorkflowDesignerPage() {
  const [definitions, setDefinitions] = useState<WorkflowDefinitionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    workflowRepositoryService
      .getDefinitions()
      .then((data) => {
        if (!active) return;
        setDefinitions(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((e) => {
        if (active) setError(e?.message ?? 'Failed to load workflow definitions');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = definitions.find((d) => d.id === selectedId) ?? null;

  const nodeTypes = [
    { id: 'start', name: 'Start', icon: Circle, color: 'bg-green-500' },
    { id: 'action', name: 'Action', icon: Square, color: 'bg-blue-500' },
    { id: 'condition', name: 'Condition', icon: Diamond, color: 'bg-yellow-500' },
    { id: 'approval', name: 'Approval', icon: Users, color: 'bg-purple-500' },
    { id: 'notification', name: 'Notification', icon: Mail, color: 'bg-orange-500' },
    { id: 'delay', name: 'Delay', icon: Clock, color: 'bg-gray-500' },
    { id: 'end', name: 'End', icon: CheckCircle, color: 'bg-red-500' },
  ];

  // No drag-drop persistence yet; the visual editor is read-only over real
  // definitions. Save is a labeled no-op until an authoring endpoint is wired.
  const handleSave = () => {
    setSaveMsg('Visual editing is read-only for now — changes are not saved.');
    setTimeout(() => setSaveMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/workflow"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-cyan-600" />
                <h1 className="text-xl font-bold text-gray-900">Workflow Designer</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                <Play className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
          {saveMsg && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4" />
              {saveMsg}
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-6 py-2">
        <div className="grid grid-cols-12 gap-3">
          {/* Left Sidebar - Workflow Details */}
          <div className="col-span-3 space-y-3">
            {/* Definition Picker */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900 mb-2">Workflow Details</h3>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading definitions…
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-sm text-red-600 py-4">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              ) : definitions.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  No workflow definitions found.
                </p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Workflow Definition
                    </label>
                    <select
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {definitions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (v{d.version})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selected && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-600">
                          {selected.description || '—'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-100 text-cyan-700">
                          {selected.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            selected.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {selected.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                          {selected.steps?.length ?? 0} steps
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Node Palette */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900 mb-2">Workflow Elements</h3>
              <div className="space-y-2">
                {nodeTypes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.id}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
                    >
                      <div className={`${node.color} w-8 h-8 rounded flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{node.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Canvas (renders real steps of the selected definition) */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 h-[calc(100vh-200px)]">
              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selected ? `${selected.name} — Steps` : 'Workflow Canvas'}
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 h-full overflow-auto">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading workflow…
                  </div>
                ) : error ? (
                  <div className="h-full flex items-center justify-center text-red-600">
                    <AlertCircle className="w-6 h-6 mr-2" /> {error}
                  </div>
                ) : !selected || !selected.steps || selected.steps.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <GitBranch className="w-16 h-16 text-gray-400 mb-2 mx-auto" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No steps defined
                      </h4>
                      <p className="text-gray-600">
                        This workflow definition has no steps to visualize yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.steps.map((step, idx) => (
                      <div key={step.id ?? idx}>
                        <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{step.name}</p>
                            {step.description && (
                              <p className="text-sm text-gray-600 mt-0.5">
                                {step.description}
                              </p>
                            )}
                            {step.actions && step.actions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {step.actions.map((a, ai) => (
                                  <span
                                    key={ai}
                                    className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
                                  >
                                    {a.type}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {idx < selected.steps!.length - 1 && (
                          <div className="flex justify-center py-1">
                            <div className="w-px h-4 bg-gray-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Triggers / Metadata */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900 mb-2">Triggers</h3>
              {selected && selected.triggers && selected.triggers.length > 0 ? (
                <div className="space-y-2">
                  {selected.triggers.map((t, i) => (
                    <div
                      key={i}
                      className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      {t.event}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Settings className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
                  <p className="text-sm text-gray-600">
                    {selected ? 'No triggers defined for this workflow.' : 'Select a workflow to view its triggers.'}
                  </p>
                </div>
              )}
            </div>

            {/* Version info */}
            {selected && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-3 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Version Info</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Version</dt>
                    <dd className="text-gray-900 font-medium">v{selected.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status</dt>
                    <dd className="text-gray-900 font-medium">{selected.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Updated</dt>
                    <dd className="text-gray-900 font-medium">
                      {selected.updatedAt
                        ? new Date(selected.updatedAt).toLocaleDateString()
                        : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
