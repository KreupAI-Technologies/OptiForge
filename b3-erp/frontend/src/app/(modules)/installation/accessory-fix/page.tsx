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
    Settings,
    CheckCircle2,
    Wrench,
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

interface Accessory {
    id: string;
    name: string;
    location: string;
    status: 'Pending' | 'Installed' | 'Testing';
}

const CHECKLIST_TYPE = 'accessory-fix';

function AccessoryFixPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [accessories, setAccessories] = useState<Accessory[]>([]);
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
            setAccessories(items.map((it) => ({
                id: it.id,
                name: it.label,
                location: it.subLabel || '',
                status: (it.status as Accessory['status']) || 'Pending',
            })));
        } catch (error) {
            console.error('Error loading accessory checklist:', error);
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
        toast({ title: 'Project Selected', description: `Viewing accessories for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleStatusChange = (id: string, status: Accessory['status']) => {
        setAccessories(accessories.map(a =>
            a.id === id ? { ...a, status } : a
        ));
        projectManagementService.updateInstallationChecklistItem(id, { status }).catch((error) => {
            console.error('Error saving accessory status:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save accessory. Please retry.' });
        });
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            const installed = accessories.filter(a => a.status === 'Installed').length;
            await projectManagementService.completeInstallationChecklist(selectedProject.id, CHECKLIST_TYPE);
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Accessory fix completed: ${installed}/${accessories.length} accessories installed and tested (${accessories.map(a => a.name).join(', ')}).`,
                overallProgress: 85,
            });
            toast({
                title: 'Accessories Installed',
                description: 'All accessories fixed and tested. Progress saved.',
            });
            router.push(`/installation/final-align?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving accessory fix progress:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record accessory fix progress. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: Accessory['status']) => {
        const styles = {
            'Installed': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Pending': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            'Testing': 'bg-blue-100 text-blue-800 hover:bg-blue-100'
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
                                <Settings className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Accessory Fix</h1>
                                <p className="text-sm text-gray-600">Select a project to install accessories</p>
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
                        <Settings className="h-8 w-8 text-orange-600" />
                        8.6 Accessory Fix
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/trial-wall?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={accessories.some(a => a.status !== 'Installed') || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Final Align <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Accessory Installation List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Accessory Name</th>
                                    <th className="p-4 font-medium">Location</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessories.map((item) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/50">
                                        <td className="p-4 font-medium">{item.name}</td>
                                        <td className="p-4">{item.location}</td>
                                        <td className="p-4">{getStatusBadge(item.status)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.status === 'Pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(item.id, 'Testing')}
                                                    >
                                                        <Wrench className="h-4 w-4 mr-1" />
                                                        Install
                                                    </Button>
                                                )}
                                                {item.status === 'Testing' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600"
                                                        onClick={() => handleStatusChange(item.id, 'Installed')}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Verify
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AccessoryFixPage() {
    return (
        <Suspense fallback={<div>Loading accessories...</div>}>
            <AccessoryFixPageContent />
        </Suspense>
    );
}
