'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import {
    CheckCircle,
    Camera,
    User,
    Calendar,
    ArrowLeft,
    FileText,
    Award,
    Sparkles,
    Search,
    Loader2,
    FolderKanban,
    Building2
} from 'lucide-react';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface HandoverStep {
    id: string;
    stepNo: number;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    notes?: string | null;
    completedAt?: string | null;
}

function ClientHandoverPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [steps, setSteps] = useState<HandoverStep[]>([]);
    const [isLoadingClosure, setIsLoadingClosure] = useState(false);
    const [closureError, setClosureError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadChecklist(selectedProject);
        } else {
            setSteps([]);
            setClosureError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);

    const loadChecklist = async (project: ProjectInfo) => {
        setIsLoadingClosure(true);
        setClosureError(null);
        try {
            const data = await projectManagementService.getHandoverChecklist(project.id);
            const list: HandoverStep[] = (Array.isArray(data) ? data : [])
                .map((s: any) => ({
                    id: String(s.id),
                    stepNo: Number(s.stepNo),
                    title: String(s.title),
                    status: s.status,
                    notes: s.notes ?? null,
                    completedAt: s.completedAt ?? null,
                }))
                .sort((a, b) => a.stepNo - b.stepNo);
            setSteps(list);
        } catch (error) {
            console.error('Error loading handover checklist:', error);
            setClosureError('Could not load handover checklist for this project.');
            setSteps([]);
        } finally {
            setIsLoadingClosure(false);
        }
    };

    const handleToggleStep = async (step: HandoverStep) => {
        if (!selectedProject) return;
        const nextStatus = step.status === 'completed' ? 'pending' : 'completed';
        setUpdatingStepId(step.id);
        try {
            const updated = await projectManagementService.updateHandoverStep(step.id, { status: nextStatus });
            setSteps(prev =>
                prev.map(s =>
                    s.id === step.id
                        ? {
                            ...s,
                            status: (updated?.status ?? nextStatus) as HandoverStep['status'],
                            completedAt: updated?.completedAt ?? (nextStatus === 'completed' ? new Date().toISOString() : null),
                        }
                        : s,
                ),
            );
        } catch (error) {
            console.error('Error updating handover step:', error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update this handover step. Please try again.',
            });
        } finally {
            setUpdatingStepId(null);
        }
    };

    const handleInitiateHandover = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await projectManagementService.initiateProjectClosure(selectedProject.id);
            toast({
                title: 'Handover Initiated',
                description: 'Handover certificate generated. Proceed to project closure.',
            });
            router.push(`/installation/project-closure?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error initiating handover:', error);
            toast({
                variant: 'destructive',
                title: 'Handover Failed',
                description: 'Project is not ready for handover, or the request failed. Ensure all snags are cleared and billing is settled.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadProjects = async () => {
        try {
            const allProjects = await projectManagementService.getProjects();
            const projectInfos: ProjectInfo[] = allProjects.map((p: Project) => ({
                id: p.id,
                name: p.name || `Project ${p.id}`,
                clientName: p.clientName || 'Unknown Client',
                status: p.status || 'active',
            }));
            setProjects(projectInfos);

            const projectId = searchParams.get('projectId');
            if (projectId) {
                const found = projectInfos.find(p => p.id === projectId);
                if (found) setSelectedProject(found);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        toast({ title: 'Project Selected', description: `Viewing handover for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredSteps = steps.filter(
        (s) => filterStatus === 'all' || s.status === filterStatus
    );

    const completedSteps = steps.filter((s) => s.status === 'completed').length;
    const totalSteps = steps.length;
    const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    const stats = {
        total: totalSteps,
        closed: completedSteps,
        pending: totalSteps - completedSteps,
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Award className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Client Handover & Closure</h1>
                                <p className="text-sm text-gray-600">Select a project for handover</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban className="h-5 w-5 text-orange-600" />
                                                <CardTitle className="text-base">{project.name}</CardTitle>
                                            </div>
                                            <Badge variant="outline" className="capitalize">{project.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Building2 className="h-4 w-4" />
                                            <span>{project.clientName}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Select Project</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/installation/progress?projectId=${selectedProject.id}`)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Client Handover & Closure</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedProject.name} • {selectedProject.clientName}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleChangeProject}>
                                Change Project
                            </Button>
                            <Button onClick={handleInitiateHandover} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Award className="mr-2 h-4 w-4" /> Initiate Handover
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Closed</p>
                                <p className="text-2xl font-bold text-green-900">{stats.closed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border p-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Steps</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Handover Checklist (8.13-8.20) */}
                {isLoadingClosure ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                        <span className="ml-2 text-gray-600">Loading handover checklist...</span>
                    </div>
                ) : closureError ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-red-600">{closureError}</div>
                ) : steps.length === 0 ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
                        No handover checklist for this project yet.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border p-3 space-y-3">
                        {/* Overall progress */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-700">
                                    Handover Progress: {completedSteps}/{totalSteps} steps ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <p className="text-xs font-semibold text-gray-700">Handover Checklist (8.13-8.20)</p>
                        <div className="grid gap-2">
                            {filteredSteps.map((step) => {
                                const done = step.status === 'completed';
                                return (
                                    <button
                                        key={step.id}
                                        type="button"
                                        onClick={() => handleToggleStep(step)}
                                        disabled={updatingStepId === step.id}
                                        className={`w-full text-left flex items-center justify-between gap-3 rounded-lg border p-3 transition hover:bg-gray-50 ${done ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {updatingStepId === step.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                                            ) : done ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-400" />
                                            )}
                                            <div>
                                                <p className={`text-sm font-medium ${done ? 'text-green-800' : 'text-gray-800'}`}>
                                                    8.{12 + step.stepNo} - {step.title}
                                                </p>
                                                {step.completedAt && done && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {String(step.completedAt).slice(0, 10)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded-full border ${done ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                                            {done ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClientHandoverPage() {
    return (
        <Suspense fallback={<div>Loading handover...</div>}>
            <ClientHandoverPageContent />
        </Suspense>
    );
}
