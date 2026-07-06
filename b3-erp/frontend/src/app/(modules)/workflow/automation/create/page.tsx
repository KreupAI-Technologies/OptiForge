'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Zap, Clock, Target, Users, Bot,
    AlertCircle, CheckCircle, Plus, Trash2, GitBranch
} from 'lucide-react';
import { workflowAutomationService } from '@/services/workflow-automation.service';

interface TriggerCondition {
    id: string;
    field: string;
    operator: string;
    value: string;
}

export default function CreateAutomationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger: 'event',
        triggerDetails: '',
        category: 'procurement',
        priority: 'medium',
        action: '',
        actionDetails: '',
        isActive: true
    });

    const [conditions, setConditions] = useState<TriggerCondition[]>([
        { id: '1', field: '', operator: 'equals', value: '' }
    ]);

    const triggerTypes = [
        { id: 'schedule', label: 'Schedule', icon: Clock, description: 'Run at specific times or intervals' },
        { id: 'event', label: 'Event', icon: Zap, description: 'Trigger when something happens' },
        { id: 'condition', label: 'Condition', icon: Target, description: 'Run when conditions are met' },
        { id: 'manual', label: 'Manual', icon: Users, description: 'Trigger manually by users' }
    ];

    const categories = [
        { id: 'procurement', label: 'Procurement' },
        { id: 'production', label: 'Production' },
        { id: 'finance', label: 'Finance' },
        { id: 'hr', label: 'Human Resources' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'sales', label: 'Sales' },
        { id: 'quality', label: 'Quality' },
        { id: 'logistics', label: 'Logistics' }
    ];

    const priorities = [
        { id: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
        { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
        { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
        { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
    ];

    const actionTypes = [
        'Create Record',
        'Update Record',
        'Send Email Notification',
        'Send SMS Alert',
        'Create Task',
        'Assign to User',
        'Escalate Approval',
        'Generate Report',
        'Trigger Webhook',
        'Update Status',
        'Calculate Values',
        'Archive Record'
    ];

    const addCondition = () => {
        setConditions([...conditions, { id: Date.now().toString(), field: '', operator: 'equals', value: '' }]);
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            await workflowAutomationService.create('default-company-id', {
                name: formData.name,
                description: formData.description,
                trigger: formData.trigger,
                triggerDetails: formData.triggerDetails,
                action: formData.action,
                category: formData.category,
                priority: formData.priority,
                status: formData.isActive ? 'active' : 'inactive',
                conditions: conditions
                    .filter((c) => c.field)
                    .map((c) => ({ field: c.field, operator: c.operator, value: c.value })),
            });
            alert('Automation rule created successfully!');
            router.push('/workflow/automation');
        } catch (err) {
            console.error('Error creating automation rule:', err);
            alert('Failed to create automation rule');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
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
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create Automation Rule</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                                    Define trigger conditions and automated actions
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
                            Save Automation
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3">
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" /> Basic Information
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Rule Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Auto Purchase Requisition"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what this automation does..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Priority
                                    </label>
                                    <div className="flex gap-2">
                                        {priorities.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.priority === p.id
                                                        ? p.color + ' ring-2 ring-offset-1 ring-gray-400'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trigger Configuration */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-600" /> Trigger Configuration
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                                    Trigger Type *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {triggerTypes.map(trigger => {
                                        const Icon = trigger.icon;
                                        return (
                                            <button
                                                key={trigger.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, trigger: trigger.id })}
                                                className={`p-4 rounded-xl border text-left transition-all ${formData.trigger === trigger.id
                                                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 mb-2 ${formData.trigger === trigger.id ? 'text-orange-600' : 'text-gray-400'}`} />
                                                <p className="text-xs font-bold text-gray-900">{trigger.label}</p>
                                                <p className="text-[10px] text-gray-500 mt-1">{trigger.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {formData.trigger === 'schedule' && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <label className="block text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">
                                        Schedule Settings
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Daily at 6:00 PM, Every Monday, Hourly..."
                                        value={formData.triggerDetails}
                                        onChange={(e) => setFormData({ ...formData, triggerDetails: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm bg-white"
                                    />
                                </div>
                            )}

                            {formData.trigger === 'event' && (
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <label className="block text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2">
                                        Event Trigger
                                    </label>
                                    <select
                                        value={formData.triggerDetails}
                                        onChange={(e) => setFormData({ ...formData, triggerDetails: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-purple-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select an event...</option>
                                        <option value="record_created">When Record is Created</option>
                                        <option value="record_updated">When Record is Updated</option>
                                        <option value="status_changed">When Status Changes</option>
                                        <option value="approval_completed">When Approval is Completed</option>
                                        <option value="order_delivered">When Order is Delivered</option>
                                        <option value="payment_received">When Payment is Received</option>
                                        <option value="stock_low">When Stock is Low</option>
                                    </select>
                                </div>
                            )}

                            {formData.trigger === 'condition' && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <label className="block text-[10px] font-black text-green-700 uppercase tracking-widest mb-3">
                                        Conditions (All must be true)
                                    </label>
                                    <div className="space-y-2">
                                        {conditions.map((condition, index) => (
                                            <div key={condition.id} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Field"
                                                    className="flex-1 px-3 py-2 border border-green-200 rounded-lg text-sm bg-white"
                                                />
                                                <select className="px-3 py-2 border border-green-200 rounded-lg text-sm bg-white">
                                                    <option value="equals">Equals</option>
                                                    <option value="not_equals">Not Equals</option>
                                                    <option value="greater_than">Greater Than</option>
                                                    <option value="less_than">Less Than</option>
                                                    <option value="contains">Contains</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Value"
                                                    className="flex-1 px-3 py-2 border border-green-200 rounded-lg text-sm bg-white"
                                                />
                                                {conditions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCondition(condition.id)}
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addCondition}
                                            className="flex items-center gap-2 text-[10px] font-bold text-green-700 hover:text-green-800"
                                        >
                                            <Plus className="w-4 h-4" /> Add Condition
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Configuration */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-orange-600" /> Action Configuration
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Action Type *
                                </label>
                                <select
                                    value={formData.action}
                                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select an action...</option>
                                    {actionTypes.map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Action Details
                                </label>
                                <textarea
                                    value={formData.actionDetails}
                                    onChange={(e) => setFormData({ ...formData, actionDetails: e.target.value })}
                                    placeholder="Provide additional details about the action..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className={`w-5 h-5 ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Activate Automation</p>
                                    <p className="text-xs text-gray-500">The rule will start running immediately after saving</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
