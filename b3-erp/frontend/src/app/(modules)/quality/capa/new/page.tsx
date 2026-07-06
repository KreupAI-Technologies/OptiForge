'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { capaService, CAPAType, CAPASource, CAPAPriority, type CreateCAPADto } from '@/services/capa.service';

export default function CreateCAPAPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        capaNumber: `CAPA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        type: '',
        priority: '',
        description: '',
        problemStatement: '',
        rootCauseAnalysis: '',
        actionPlan: '',
        ownerName: '',
        targetDate: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: CreateCAPADto = {
            title: formData.title,
            description: formData.description,
            type: (formData.type as CAPAType) || CAPAType.CORRECTIVE,
            source: CAPASource.INTERNAL_OBSERVATION,
            priority: (formData.priority as CAPAPriority) || CAPAPriority.MEDIUM,
            problemStatement: formData.problemStatement,
            impactDescription: formData.description,
            affectedAreas: [],
            targetCompletionDate: new Date(formData.targetDate),
            ownerId: 'default-user-id',
            ownerName: formData.ownerName || 'Unassigned',
            ownerDepartment: 'Quality',
            notes: [formData.rootCauseAnalysis, formData.actionPlan, formData.notes]
                .filter(Boolean)
                .join('\n\n') || undefined,
        };

        try {
            await capaService.createCAPA(payload);

            addToast({
                title: 'Success',
                message: 'CAPA created successfully',
                variant: 'success'
            });
            router.push('/quality/capa');
        } catch (error) {
            console.error('Error creating CAPA:', error);
            addToast({
                title: 'Error',
                message: 'Failed to create CAPA',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-3">
            <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Create Corrective/Preventive Action</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        New CAPA Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Brief title of the action"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capaNumber">CAPA Number *</Label>
                                <Input
                                    id="capaNumber"
                                    name="capaNumber"
                                    value={formData.capaNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: string) => handleSelectChange('type', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corrective">Corrective Action</SelectItem>
                                        <SelectItem value="preventive">Preventive Action</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority *</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: string) => handleSelectChange('priority', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ownerName">Owner Name</Label>
                                <Input
                                    id="ownerName"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    placeholder="Person responsible"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="targetDate">Target Date *</Label>
                                <Input
                                    id="targetDate"
                                    name="targetDate"
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Detailed description..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="problemStatement">Problem Statement *</Label>
                            <Textarea
                                id="problemStatement"
                                name="problemStatement"
                                value={formData.problemStatement}
                                onChange={handleChange}
                                required
                                placeholder="Define the problem clearly..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rootCauseAnalysis">Root Cause Analysis *</Label>
                            <Textarea
                                id="rootCauseAnalysis"
                                name="rootCauseAnalysis"
                                value={formData.rootCauseAnalysis}
                                onChange={handleChange}
                                required
                                placeholder="Analysis of why this happened..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="actionPlan">Action Plan *</Label>
                            <Textarea
                                id="actionPlan"
                                name="actionPlan"
                                value={formData.actionPlan}
                                onChange={handleChange}
                                required
                                placeholder="Steps to be taken..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    'Creating...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create CAPA
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
