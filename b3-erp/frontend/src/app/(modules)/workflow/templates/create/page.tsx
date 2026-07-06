'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Plus, Trash2, GitBranch, Play,
    Settings, Users, Clock, AlertCircle, FileText,
    Mail, MessageSquare, CheckSquare, Zap, Target
} from 'lucide-react';
import { WorkflowService } from '@/services/workflow.service';

interface WorkflowStep {
    id: string;
    type: 'approval' | 'automation' | 'notification' | 'condition';
    name: string;
    description: string;
    assigneeType?: 'user' | 'role' | 'manager' | 'requester';
    assigneeValue?: string;
    config?: any;
}

export default function CreateWorkflowTemplatePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'approval',
        version: '1.0',
        tags: ''
    });

    const [steps, setSteps] = useState<WorkflowStep[]>([
        {
            id: '1',
            type: 'approval',
            name: 'Initial Review',
            description: 'First level manager approval',
            assigneeType: 'manager'
        }
    ]);

    const addStep = (type: WorkflowStep['type']) => {
        const newStep: WorkflowStep = {
            id: Date.now().toString(),
            type,
            name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
            description: '',
            assigneeType: type === 'approval' ? 'user' : undefined
        };
        setSteps([...steps, newStep]);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
        setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            await WorkflowService.createTemplate({
                name: formData.name,
                description: formData.description,
                category: formData.category,
                steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
            });
            alert('Workflow template created successfully!');
            router.push('/workflow/templates');
        } catch (err) {
            console.error('Error creating workflow template:', err);
            alert('Failed to create workflow template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50 text-sm font-medium">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <GitBranch className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-none">Create Workflow Template</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                    Design a new reusable business process workflow
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest"
                        >
                            <Save className="w-4 h-4" />
                            Save Template
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Left Side: Configuration */}
                <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto p-3 space-y-3">
                    <div className="space-y-2">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-600" /> Basic Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Template Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Multi-level PO Approval"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose of this workflow..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="approval">Approval</option>
                                        <option value="automation">Automation</option>
                                        <option value="notification">Notification</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Initial Version</label>
                                    <input
                                        type="text"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="finance, procurement, critical"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-orange-600" /> Add Workflow Steps
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => addStep('approval')}
                                className="flex flex-col items-center gap-2 p-3 border border-gray-100 bg-gray-50 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all group"
                            >
                                <CheckSquare className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Approval</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => addStep('automation')}
                                className="flex flex-col items-center gap-2 p-3 border border-gray-100 bg-gray-50 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all group"
                            >
                                <Zap className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Automation</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => addStep('notification')}
                                className="flex flex-col items-center gap-2 p-3 border border-gray-100 bg-gray-50 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all group"
                            >
                                <Mail className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Notify</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => addStep('condition')}
                                className="flex flex-col items-center gap-2 p-3 border border-gray-100 bg-gray-50 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all group"
                            >
                                <Target className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Condition</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Builder View */}
                <div className="flex-1 bg-gray-100 overflow-y-auto p-12">
                    <div className="max-w-2xl space-y-8">
                        {/* Start Node */}
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                                <Play className="w-5 h-5 text-white fill-white ml-1" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-gray-400">Workflow Triggered</p>
                            <div className="w-px h-8 bg-gray-300 mt-2"></div>
                        </div>

                        {/* Steps Nodes */}
                        {steps.map((step, index) => (
                            <div key={step.id} className="relative flex flex-col items-center">
                                <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                    <div className="flex">
                                        <div className={`w-2 flex-shrink-0 ${step.type === 'approval' ? 'bg-blue-500' :
                                                step.type === 'automation' ? 'bg-green-500' :
                                                    step.type === 'notification' ? 'bg-purple-500' : 'bg-orange-500'
                                            }`}></div>
                                        <div className="flex-1 p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[10px] font-black">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={step.name}
                                                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                                        className="bg-transparent font-bold text-gray-900 border-b border-transparent focus:border-orange-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeStep(step.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                                                    <input
                                                        type="text"
                                                        value={step.description}
                                                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                                        placeholder="Optional step details..."
                                                        className="w-full px-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:ring-1 focus:ring-orange-500"
                                                    />
                                                </div>
                                                {step.type === 'approval' && (
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assign To</label>
                                                        <select
                                                            value={step.assigneeType}
                                                            onChange={(e) => updateStep(step.id, { assigneeType: e.target.value as any })}
                                                            className="w-full px-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:ring-1 focus:ring-orange-500"
                                                        >
                                                            <option value="user">Specific User</option>
                                                            <option value="role">Role</option>
                                                            <option value="manager">Direct Manager</option>
                                                            <option value="requester">Requester</option>
                                                        </select>
                                                    </div>
                                                )}
                                                {step.type === 'condition' && (
                                                    <div>
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Criteria</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., amount > 5000"
                                                            className="w-full px-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:ring-1 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="w-px h-8 bg-gray-300"></div>
                                )}
                            </div>
                        ))}

                        {/* End Node */}
                        <div className="flex flex-col items-center">
                            <div className="w-px h-8 bg-gray-300"></div>
                            <div className="w-10 h-10 bg-white border-4 border-gray-900 rounded-full flex items-center justify-center shadow-md">
                                <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-gray-400">Workflow Ends</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
