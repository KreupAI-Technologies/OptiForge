'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WorkflowService } from '@/services/workflow.service';

interface TemplateStep {
    stepNumber: number;
    name: string;
    approverRole?: string;
    approverId?: string;
    condition?: string;
    slaHours?: number;
}

interface WorkflowTemplate {
    id?: string;
    name: string;
    description: string;
    category: string;
    type: 'sequential' | 'parallel' | 'conditional';
    steps: TemplateStep[];
    isActive: boolean;
}

export default function TemplateEditorPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [template, setTemplate] = useState<WorkflowTemplate>({
        name: '',
        description: '',
        category: 'procurement',
        type: 'sequential',
        steps: [],
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isEditMode = params.id && params.id !== 'create';

    useEffect(() => {
        if (isEditMode) {
            fetchTemplate();
        }
    }, [params.id]);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const data: any = await WorkflowService.getTemplateById(params.id);
            if (data) {
                setTemplate({
                    id: data.id,
                    name: data.name ?? '',
                    description: data.description ?? '',
                    category: data.category ?? 'procurement',
                    type: data.type ?? 'sequential',
                    steps: Array.isArray(data.steps)
                        ? data.steps.map((s: any, i: number) => ({
                            stepNumber: s.stepNumber ?? s.order ?? i + 1,
                            name: s.name ?? '',
                            approverRole: s.approverRole ?? s.assigneeName ?? '',
                            approverId: s.approverId ?? s.assigneeId,
                            condition: s.condition,
                            slaHours: s.slaHours ?? s.dueInDays,
                        }))
                        : [],
                    isActive: data.isActive ?? data.status === 'active',
                });
            }
        } catch (err) {
            setError('Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    const addStep = () => {
        const newStep: TemplateStep = {
            stepNumber: template.steps.length + 1,
            name: '',
            approverRole: '',
            slaHours: 24,
        };
        setTemplate({
            ...template,
            steps: [...template.steps, newStep],
        });
    };

    const removeStep = (index: number) => {
        const updatedSteps = template.steps.filter((_, i) => i !== index);
        // Renumber steps
        const renumbered = updatedSteps.map((step, idx) => ({
            ...step,
            stepNumber: idx + 1,
        }));
        setTemplate({
            ...template,
            steps: renumbered,
        });
    };

    const updateStep = (index: number, field: keyof TemplateStep, value: any) => {
        const updatedSteps = template.steps.map((step, idx) => {
            if (idx === index) {
                return { ...step, [field]: value };
            }
            return step;
        });
        setTemplate({
            ...template,
            steps: updatedSteps,
        });
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === template.steps.length - 1) return;

        const newSteps = [...template.steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

        // Renumber
        const renumbered = newSteps.map((step, idx) => ({
            ...step,
            stepNumber: idx + 1,
        }));

        setTemplate({
            ...template,
            steps: renumbered,
        });
    };

    const saveTemplate = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validation
            if (!template.name.trim()) {
                setError('Template name is required');
                return;
            }
            if (template.steps.length === 0) {
                setError('At least one step is required');
                return;
            }

            const payload = {
                name: template.name,
                description: template.description,
                category: template.category,
                steps: template.steps.map((s) => ({ ...s, order: s.stepNumber })),
            };

            if (isEditMode) {
                await WorkflowService.updateTemplate(params.id, payload);
            } else {
                await WorkflowService.createTemplate(payload);
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/workflow/templates');
            }, 1500);
        } catch (err) {
            setError('Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="w-full p-3">Loading template...</div>;
    }

    return (
        <div className="w-full p-3 ">
            {/* Header */}
            <div className="mb-3">
                <Link href="/workflow/templates">
                    <Button variant="ghost" size="sm" className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">
                    {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h1>
                <p className="text-gray-600 mt-2">
                    Define approval workflow steps and assign approvers
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-3 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-900">
                        Template saved successfully! Redirecting...
                    </AlertDescription>
                </Alert>
            )}

            {/* Basic Information */}
            <Card className="mb-3">
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div>
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                            id="name"
                            value={template.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplate({ ...template, name: e.target.value })}
                            placeholder="e.g., Purchase Requisition Approval"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={template.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplate({ ...template, description: e.target.value })}
                            placeholder="Describe the purpose of this workflow"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={template.category}
                                onValueChange={(value: string) => setTemplate({ ...template, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="procurement">Procurement</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="project">Project</SelectItem>
                                    <SelectItem value="hr">Human Resources</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="production">Production</SelectItem>
                                    <SelectItem value="logistics">Logistics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="type">Workflow Type</Label>
                            <Select
                                value={template.type}
                                onValueChange={(value: any) => setTemplate({ ...template, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sequential">Sequential (One after another)</SelectItem>
                                    <SelectItem value="parallel">Parallel (All at once)</SelectItem>
                                    <SelectItem value="conditional">Conditional (Based on rules)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card className="mb-3">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Workflow Steps</CardTitle>
                        <Button onClick={addStep} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Step
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {template.steps.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No steps defined yet.</p>
                            <Button onClick={addStep} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Step
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {template.steps.map((step, index) => (
                                <Card key={index} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex gap-2">
                                            {/* Drag Handle & Step Number */}
                                            <div className="flex flex-col items-center gap-2">
                                                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                                    {step.stepNumber}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveStep(index, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        ↑
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => moveStep(index, 'down')}
                                                        disabled={index === template.steps.length - 1}
                                                    >
                                                        ↓
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Step Fields */}
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <Label>Step Name *</Label>
                                                    <Input
                                                        value={step.name}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'name', e.target.value)}
                                                        placeholder="e.g., Manager Approval"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label>Approver Role *</Label>
                                                        <Select
                                                            value={step.approverRole || ''}
                                                            onValueChange={(value: string) => updateStep(index, 'approverRole', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                                <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                                                                <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                                                                <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                                                                <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                                                <SelectItem value="PROCUREMENT_HEAD">Procurement Head</SelectItem>
                                                                <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                                                                <SelectItem value="CEO">CEO</SelectItem>
                                                                <SelectItem value="TECHNICAL_HEAD">Technical Head</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label>SLA Hours</Label>
                                                        <Input
                                                            type="number"
                                                            value={step.slaHours || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'slaHours', parseInt(e.target.value) || 0)}
                                                            placeholder="24"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label>Condition (Optional)</Label>
                                                    <Input
                                                        value={step.condition || ''}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'condition', e.target.value)}
                                                        placeholder="e.g., amount > 10000"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This step will only be included if the condition is met
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeStep(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={saveTemplate} disabled={loading} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Template'}
                </Button>
                <Link href="/workflow/templates">
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>
        </div>
    );
}
