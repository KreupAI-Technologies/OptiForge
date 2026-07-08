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
    Users,
    UserPlus,
    CheckCircle2,
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

interface Installer {
    id: string;
    name: string;
    role: string;
    skills: string[];
    status: 'Available' | 'Assigned';
}

function TeamAssignmentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [installers, setInstallers] = useState<Installer[]>([
        { id: '1', name: 'Rajesh Kumar', role: 'Lead', skills: ['Carpentry', 'Plumbing'], status: 'Available' },
        { id: '2', name: 'Suresh Babu', role: 'Technician', skills: ['Electrical', 'Assembly'], status: 'Available' },
        { id: '3', name: 'Mohan S', role: 'Helper', skills: ['Material Handling'], status: 'Available' },
    ]);

    const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (!selectedProject) {
            setAssignedTeam([]);
            return;
        }
        (async () => {
            try {
                const existing = await projectManagementService.getInstallationTeam(selectedProject.id);
                const ids = (existing || [])
                    .map((m: any) => String(m.installerId ?? ''))
                    .filter((id: string) => installers.some(i => i.id === id));
                setAssignedTeam(ids);
            } catch (error) {
                console.error('Error loading existing team:', error);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);

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
        toast({ title: 'Project Selected', description: `Viewing team assignment for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleAssign = (id: string) => {
        setAssignedTeam(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleConfirmAssignment = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            const members = installers
                .filter(i => assignedTeam.includes(i.id))
                .map(i => ({
                    installerId: i.id,
                    installerName: i.name,
                    role: i.role.toLowerCase(),
                    skills: i.skills,
                }));
            await projectManagementService.assignInstallationTeam(selectedProject.id, { members });
            toast({
                title: 'Team Assigned',
                description: `${assignedTeam.length} members assigned to the project.`,
            });
            router.push(`/installation/cabinet-align?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving team assignment:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record team assignment. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Team Assignment</h1>
                                <p className="text-sm text-gray-600">Select a project to assign team</p>
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
                        <Users className="h-8 w-8 text-orange-600" />
                        8.3 Team Assignment
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/tool-dispatch?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleConfirmAssignment}
                        disabled={assignedTeam.length === 0 || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Cabinet Align <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Available Installers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {installers.map((installer) => (
                            <div
                                key={installer.id}
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 ${assignedTeam.includes(installer.id) ? 'border-orange-600 bg-orange-50' : ''}`}
                                onClick={() => handleToggleAssign(installer.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${assignedTeam.includes(installer.id) ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                            <UserPlus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{installer.name}</div>
                                            <div className="text-sm text-muted-foreground">{installer.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {installer.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TeamAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading team...</div>}>
            <TeamAssignmentPageContent />
        </Suspense>
    );
}
