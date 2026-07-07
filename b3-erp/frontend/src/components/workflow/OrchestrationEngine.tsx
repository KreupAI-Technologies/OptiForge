'use client'

import { useState, useEffect } from 'react'
import { GitBranch, Play, Plus, Settings, Zap, ArrowRight, Circle, Square, Diamond, Loader2 } from 'lucide-react'
import { workflowRepositoryService, WorkflowDefinitionDTO } from '@/services/workflow-repository.service'

export type NodeType = 'trigger' | 'action' | 'condition' | 'loop' | 'delay' | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  status: 'draft' | 'active' | 'paused';
  version: string;
}

// Map a backend WorkflowDefinition into the visual Workflow shape used here.
function mapDefinitionToWorkflow(def: WorkflowDefinitionDTO): Workflow {
  const status: Workflow['status'] =
    def.status === 'active' ? 'active' : def.status === 'inactive' ? 'paused' : 'draft';

  const nodes: WorkflowNode[] = [];

  // Trigger node(s) from definition triggers
  (def.triggers ?? []).forEach((t, i) => {
    nodes.push({
      id: `T${i + 1}`,
      type: 'trigger',
      label: t.event || 'Trigger',
      config: (t.conditions as any) ?? { event: t.event },
      position: { x: i, y: 0 },
      connections: [],
    });
  });

  // Step nodes from definition steps
  (def.steps ?? []).forEach((s, i) => {
    const firstAction = s.actions?.[0]?.type;
    nodes.push({
      id: s.id || `S${i + 1}`,
      type: s.conditions && Object.keys(s.conditions).length > 0 ? 'condition' : 'action',
      label: s.name || `Step ${i + 1}`,
      config: firstAction ? { action: firstAction } : (s.conditions as any) ?? {},
      position: { x: i + 1, y: 0 },
      connections: s.nextSteps ?? [],
    });
  });

  return {
    id: def.id,
    name: def.name,
    description: def.description ?? '',
    status,
    version: `v${def.version ?? 1}`,
    nodes,
  };
}

export default function OrchestrationEngine() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const defs = await workflowRepositoryService.getDefinitions();
        if (!cancelled) setWorkflows(defs.map(mapDefinitionToWorkflow));
      } catch (err) {
        console.error('Failed to load workflow definitions:', err);
        if (!cancelled) setError('Failed to load workflow definitions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'trigger': return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'action': return <Square className="h-5 w-5 text-blue-600" />;
      case 'condition': return <Diamond className="h-5 w-5 text-purple-600" />;
      case 'loop': return <Circle className="h-5 w-5 text-green-600" />;
      case 'delay': return <Circle className="h-5 w-5 text-orange-600" />;
      case 'end': return <Circle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <GitBranch className="h-8 w-8 text-blue-600" />
              Workflow Orchestration Engine
            </h2>
            <p className="text-gray-600 mt-1">Visual workflow builder with drag-and-drop nodes</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            New Workflow
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white shadow-lg border border-gray-200 p-12 flex items-center justify-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Loading workflows...
        </div>
      )}

      {!loading && error && (
        <div className="bg-white shadow-lg border border-red-200 p-6 text-center text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && workflows.length === 0 && (
        <div className="bg-white shadow-lg border border-gray-200 p-12 text-center text-gray-600">
          <GitBranch className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          No workflow definitions found.
        </div>
      )}

      {!loading && !error && workflows.map((workflow) => (
        <div key={workflow.id} className="bg-white shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{workflow.version}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.toUpperCase()}
                </span>
                <button className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  Test
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50">
            <div className="space-y-2">
              {workflow.nodes.map((node, idx) => (
                <div key={node.id} className="flex items-center gap-2">
                  <div className={`p-4 bg-white border-2 rounded-lg shadow-sm ${
                    node.type === 'trigger' ? 'border-yellow-300' :
                    node.type === 'action' ? 'border-blue-300' :
                    node.type === 'condition' ? 'border-purple-300' :
                    'border-gray-300'
                  } hover:shadow-md transition-shadow min-w-[200px]`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getNodeIcon(node.type)}
                      <span className="text-xs font-medium text-gray-600 uppercase">{node.type}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{node.label}</p>
                    {Object.keys(node.config).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        {JSON.stringify(node.config).length > 50
                          ? JSON.stringify(node.config).substring(0, 50) + '...'
                          : JSON.stringify(node.config)}
                      </div>
                    )}
                  </div>
                  {node.connections.length > 0 && idx < workflow.nodes.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {workflow.nodes.length} nodes • {workflow.nodes.filter(n => n.type === 'condition').length} conditions
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Configure
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
