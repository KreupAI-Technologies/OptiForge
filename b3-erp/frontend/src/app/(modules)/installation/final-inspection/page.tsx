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
    ClipboardCheck,
    CheckCircle2,
    AlertOctagon,
    ThumbsUp,
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

interface InspectionPoint {
    id: string;
    category: 'Functionality' | 'Aesthetics' | 'Cleanliness' | 'Safety';
    item: string;
    status: 'Pass' | 'Fail' | 'Pending';
}

const CHECKLIST_TYPE = 'final-inspection';

function FinalInspectionPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [points, setPoints] = useState<InspectionPoint[]>([]);
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
            setPoints(items.map((it) => ({
                id: it.id,
                category: (it.category as InspectionPoint['category']) || 'Functionality',
                item: it.label,
                status: (it.status as InspectionPoint['status']) || 'Pending',
            })));
        } catch (error) {
            console.error('Error loading final inspection checklist:', error);
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
        toast({ title: 'Project Selected', description: `Viewing final inspection for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleStatusChange = (id: string, status: InspectionPoint['status']) => {
        setPoints(points.map(p =>
            p.id === id ? { ...p, status } : p
        ));
        projectManagementService.updateInstallationChecklistItem(id, { status }).catch((error) => {
            console.error('Error saving inspection result:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save inspection result. Please retry.' });
        });
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            const passed = points.filter(p => p.status === 'Pass').length;
            await projectManagementService.completeInstallationChecklist(selectedProject.id, CHECKLIST_TYPE);
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Final inspection completed: ${passed}/${points.length} checkpoints passed across ${Array.from(new Set(points.map(p => p.category))).join(', ')}.`,
                overallProgress: 95,
            });
            toast({
                title: 'Inspection Completed',
                description: 'Site is ready for cleaning and handover. Progress saved.',
            });
            router.push(`/installation/kitchen-cleaning?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving inspection progress:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record inspection result. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: InspectionPoint['status']) => {
        const styles = {
            'Pass': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Fail': 'bg-red-100 text-red-800 hover:bg-red-100',
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
                                <ClipboardCheck className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Final Inspection</h1>
                                <p className="text-sm text-gray-600">Select a project for final inspection</p>
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
                        <ClipboardCheck className="h-8 w-8 text-orange-600" />
                        8.9 Final Inspection
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/photo-doc?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={points.some(p => p.status !== 'Pass') || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Kitchen Cleaning <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Inspection Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {points.map((point) => (
                                <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <div>
                                        <div className="font-medium">{point.item}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{point.category}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {point.status === 'Pending' || point.status === 'Fail' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleStatusChange(point.id, 'Pass')}
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                                    Pass
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleStatusChange(point.id, 'Fail')}
                                                >
                                                    <AlertOctagon className="h-4 w-4 mr-1" />
                                                    Fail
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(point.status)}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStatusChange(point.id, 'Pending')}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {Math.round((points.filter(p => p.status === 'Pass').length / points.length) * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Passed</span>
                                <span className="font-medium text-green-600">{points.filter(p => p.status === 'Pass').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Failed</span>
                                <span className="font-medium text-red-600">{points.filter(p => p.status === 'Fail').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Pending</span>
                                <span className="font-medium text-gray-600">{points.filter(p => p.status === 'Pending').length}</span>
                            </div>
                        </div>
                        {points.some(p => p.status === 'Fail') && (
                            <div className="bg-red-50 p-3 rounded text-sm text-red-800 flex items-start gap-2">
                                <AlertOctagon className="h-4 w-4 mt-0.5" />
                                <div>
                                    Fix failed items before proceeding to cleaning.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function FinalInspectionPage() {
    return (
        <Suspense fallback={<div>Loading inspection...</div>}>
            <FinalInspectionPageContent />
        </Suspense>
    );
}
