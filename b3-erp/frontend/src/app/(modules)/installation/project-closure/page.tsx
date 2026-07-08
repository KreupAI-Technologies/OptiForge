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
    CheckCircle2,
    Archive,
    FileText,
    Star,
    Home,
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

function ProjectClosurePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [closed, setClosed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

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
        toast({ title: 'Project Selected', description: `Viewing project closure for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleCloseProject = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await projectManagementService.initiateProjectClosure(selectedProject.id);
            setClosed(true);
            toast({
                title: 'Project Closed',
                description: 'Project has been formally closed and a handover certificate generated.',
            });
        } catch (error) {
            console.error('Error closing project:', error);
            toast({
                variant: 'destructive',
                title: 'Closure Failed',
                description: 'Could not close the project. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Archive className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Project Closure</h1>
                                <p className="text-sm text-gray-600">Select a project to close</p>
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
                        <Archive className="h-8 w-8 text-orange-600" />
                        8.12 Project Closure
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/handover?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={() => router.push('/dashboard')}>
                        <Home className="mr-2 h-4 w-4" /> Go to Dashboard
                    </Button>
                </div>
            </div>

            {closed ? (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6 text-center py-12">
                        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-2">Project Successfully Closed!</h2>
                        <p className="text-green-700 max-w-md mb-8">
                            Thank you for your hard work. The project {selectedProject.name} has been completed and archived.
                        </p>
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" className="bg-white" onClick={() => window.print()}>
                                <FileText className="mr-2 h-4 w-4" /> Print Report
                            </Button>
                            <Button onClick={() => router.push('/projects')}>
                                View All Projects
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Project Name</div>
                                    <div className="font-medium">{selectedProject.name}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Client</div>
                                    <div className="font-medium">{selectedProject.clientName}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Project Status</div>
                                    <div className="font-medium capitalize">{selectedProject.status}</div>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-2">Deliverables Status</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" /> Manufacturing Completed
                                    </li>
                                    <li className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" /> Delivery Verified
                                    </li>
                                    <li className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" /> Installation Finished
                                    </li>
                                    <li className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" /> Client Handover Signed
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Feedback & Closure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium block mb-2">Project Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-1 hover:scale-110 transition-transform ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                        >
                                            <Star className="h-8 w-8 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-2">Closure Notes</label>
                                <textarea
                                    className="w-full border rounded-md p-3 text-sm h-32"
                                    placeholder="Enter any final notes, lessons learned, or issues encountered..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCloseProject}
                                disabled={rating === 0 || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                                Close Project
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function ProjectClosurePage() {
    return (
        <Suspense fallback={<div>Loading closure...</div>}>
            <ProjectClosurePageContent />
        </Suspense>
    );
}
