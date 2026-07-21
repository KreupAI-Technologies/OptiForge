'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import {
    ArrowLeft,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Trash2,
    Brush,
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

interface CleaningTask {
    id: string;
    area: string;
    status: 'Pending' | 'Cleaned';
}

const CHECKLIST_TYPE = 'kitchen-cleaning';

function KitchenCleaningPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [tasks, setTasks] = useState<CleaningTask[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) loadChecklist(selectedProject.id);
    }, [selectedProject]);

    const loadChecklist = async (projectId: string) => {
        try {
            const items = await projectManagementService.getInstallationChecklist(projectId, CHECKLIST_TYPE);
            setTasks(items.map((it) => ({
                id: it.id,
                area: it.label,
                status: (it.status as CleaningTask['status']) || 'Pending',
            })));
        } catch (error) {
            console.error('Error loading kitchen cleaning checklist:', error);
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
        toast({ title: 'Project Selected', description: `Viewing kitchen cleaning for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleStatus = (id: string) => {
        const current = tasks.find(t => t.id === id);
        const nextStatus: CleaningTask['status'] = current?.status === 'Pending' ? 'Cleaned' : 'Pending';
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, status: nextStatus } : t
        ));
        projectManagementService.updateInstallationChecklistItem(id, { status: nextStatus }).catch((error) => {
            console.error('Error saving cleaning task:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save task. Please retry.' });
        });
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await projectManagementService.completeInstallationChecklist(selectedProject.id, CHECKLIST_TYPE);
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Kitchen cleaning completed: ${tasks.map(t => t.area).join(', ')}.`,
                isSiteCleaned: true,
                overallProgress: 98,
            });
            toast({
                title: 'Cleaning Completed',
                description: 'Site is ready for client handover. Progress saved.',
            });
            router.push(`/installation/handover?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving cleaning progress:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record cleaning completion. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: CleaningTask['status']) => {
        const styles = {
            'Cleaned': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Pending': 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        };
        return <Badge className={styles[status]}>{status}</Badge>;
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Kitchen Cleaning</h1>
                                <p className="text-sm text-gray-600">Select a project for kitchen cleaning</p>
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
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-orange-600" />
                        8.10 Kitchen Cleaning
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/final-inspection?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={tasks.some(t => t.status === 'Pending') || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Client Handover <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Cleaning Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${task.status === 'Cleaned' ? 'bg-green-50 border-green-200' : ''}`}
                                    onClick={() => handleToggleStatus(task.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${task.status === 'Cleaned' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {task.status === 'Cleaned' ? <CheckCircle2 className="h-5 w-5" /> : <Brush className="h-4 w-4" />}
                                        </div>
                                        <span className={`font-medium ${task.status === 'Cleaned' ? 'text-green-800' : ''}`}>{task.area}</span>
                                    </div>
                                    {getStatusBadge(task.status)}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Waste Disposal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Disposal Guidelines
                            </h4>
                            <ul className="text-sm text-orange-700 space-y-2 list-disc list-inside">
                                <li>Separate recyclable packaging (cardboard, plastic)</li>
                                <li>Dispose of wood scraps and sawdust safely</li>
                                <li>Ensure no hazardous materials are left behind</li>
                                <li>Leave the site broom-clean and vacuumed</li>
                            </ul>
                        </div>
                        <div className="text-center p-3 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold mb-2">Ready for Handover?</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Ensure the kitchen is sparkling clean. First impressions matter!
                            </p>
                            <div className="flex justify-center gap-2 text-sm">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-2xl">{tasks.filter(t => t.status === 'Cleaned').length}</span>
                                    <span className="text-muted-foreground">Cleaned</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-2xl">{tasks.length}</span>
                                    <span className="text-muted-foreground">Total</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function KitchenCleaningPage() {
    return (
        <Suspense fallback={<div>Loading cleaning...</div>}>
            <KitchenCleaningPageContent />
        </Suspense>
    );
}
