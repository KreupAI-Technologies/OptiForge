"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Plus, Save, Loader2 } from 'lucide-react';
import { useUserPreference } from '@/contexts/UserPreferenceContext'; // Use theme
import {
    workflowDefinitionService,
} from '@/services/workflow-definition.service';

// Default-empty starting canvas (used when there is no saved definition yet).
const initialNodes: Node[] = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' }, type: 'input' },
    { id: '2', position: { x: 0, y: 100 }, data: { label: 'Approval Step' } },
];
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

export default function WorkflowBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { preferences } = useUserPreference(); // For theme aware styling if needed

    const [definitionId, setDefinitionId] = useState<string | null>(null);
    const [name, setName] = useState<string>('Untitled Workflow');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // On mount, load the most recently updated saved definition (if any).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = await workflowDefinitionService.list();
                if (cancelled) return;
                if (list && list.length > 0) {
                    const def = list[0];
                    setDefinitionId(def.id);
                    setName(def.name || 'Untitled Workflow');
                    if (Array.isArray(def.nodes) && def.nodes.length > 0) {
                        setNodes(def.nodes as Node[]);
                    }
                    if (Array.isArray(def.edges)) {
                        setEdges(def.edges as Edge[]);
                    }
                }
            } catch (err) {
                // Non-fatal: keep the default-empty canvas so the builder still works.
                console.error('Failed to load workflow definition:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const addNode = () => {
        const id = `${nodes.length + 1}`;
        const newNode: Node = {
            id,
            data: { label: `Step ${id}` },
            position: {
                x: Math.random() * 400,
                y: Math.random() * 400,
            },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const saveWorkflow = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const saved = await workflowDefinitionService.saveDefinition(
                {
                    name: name || 'Untitled Workflow',
                    nodes,
                    edges,
                    status: 'draft',
                },
                definitionId ?? undefined,
            );
            setDefinitionId(saved.id);
            setName(saved.name || name);
            setMessage({ type: 'success', text: 'Workflow saved successfully.' });
        } catch (err) {
            console.error('Failed to save workflow:', err);
            const text =
                err instanceof Error ? err.message : 'Failed to save workflow.';
            setMessage({ type: 'error', text });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Workflow Designer</h1>
                    {message && (
                        <span
                            className={
                                message.type === 'success'
                                    ? 'text-sm text-green-600'
                                    : 'text-sm text-red-600'
                            }
                        >
                            {message.text}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Workflow name"
                        className="border rounded-md px-3 py-1 text-sm bg-background"
                        aria-label="Workflow name"
                    />
                    <Button onClick={addNode} variant="outline" disabled={loading}>
                        <Plus className="mr-2 h-4 w-4" /> Add Node
                    </Button>
                    <Button onClick={saveWorkflow} disabled={saving || loading}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Workflow'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-background relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
