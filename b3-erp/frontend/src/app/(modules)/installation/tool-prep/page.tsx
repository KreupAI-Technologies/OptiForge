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
    Wrench,
    CheckCircle2,
    AlertTriangle,
    Package,
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

interface Tool {
    id: string;
    name: string;
    category: 'Power Tool' | 'Hand Tool' | 'Safety Gear' | 'Measuring';
    status: 'Available' | 'In Use' | 'Maintenance' | 'Missing';
    condition: 'Good' | 'Fair' | 'Poor';
    lastChecked: string;
}

function ToolPrepPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [tools, setTools] = useState<Tool[]>([
        { id: 'T-001', name: 'Cordless Drill Set', category: 'Power Tool', status: 'Available', condition: 'Good', lastChecked: '2024-12-01' },
        { id: 'T-002', name: 'Laser Level', category: 'Measuring', status: 'Available', condition: 'Good', lastChecked: '2024-12-01' },
        { id: 'T-003', name: 'Safety Helmet', category: 'Safety Gear', status: 'Available', condition: 'Good', lastChecked: '2024-11-28' },
        { id: 'T-004', name: 'Installation Hammer', category: 'Hand Tool', status: 'Available', condition: 'Fair', lastChecked: '2024-11-15' },
        { id: 'T-005', name: 'Jigsaw', category: 'Power Tool', status: 'Maintenance', condition: 'Poor', lastChecked: '2024-12-02' },
    ]);

    const [selectedTools, setSelectedTools] = useState<string[]>([]);
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
        toast({ title: 'Project Selected', description: `Viewing tool prep for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleTool = (id: string) => {
        setSelectedTools(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleConfirmPrep = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await Promise.all(
                selectedTools.map(id => {
                    const tool = tools.find(t => t.id === id);
                    return projectManagementService.issueInstallTool({
                        toolId: id,
                        projectId: selectedProject.id,
                        condition: tool?.condition || 'Good',
                        issuedBy: 'Installation Coordinator',
                    });
                })
            );
            toast({
                title: 'Tools Prepared',
                description: `${selectedTools.length} tool(s) issued to site for dispatch.`,
            });
            router.push(`/installation/tool-dispatch?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error issuing tools:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not issue tools to site. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: Tool['status']) => {
        const styles = {
            'Available': 'bg-green-100 text-green-800 hover:bg-green-100',
            'In Use': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            'Maintenance': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            'Missing': 'bg-red-100 text-red-800 hover:bg-red-100'
        };
        return <Badge className={styles[status]}>{status}</Badge>;
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tool Preparation</h1>
                                <p className="text-sm text-gray-600">Select a project to prepare tools</p>
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
                        <Wrench className="h-8 w-8 text-orange-600" />
                        8.1 Tool Preparation
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/logistics/site-notification')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleConfirmPrep}
                        disabled={selectedTools.length === 0 || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Tool Dispatch <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {tools.filter(t => t.status === 'Available').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Selected for Job</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {selectedTools.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {tools.filter(t => t.status === 'Maintenance').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tool Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 w-12">
                                        <input type="checkbox" className="rounded border-gray-300" disabled />
                                    </th>
                                    <th className="p-4 font-medium">Tool Name</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Condition</th>
                                    <th className="p-4 font-medium">Last Checked</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.map((tool) => (
                                    <tr
                                        key={tool.id}
                                        className={`border-t hover:bg-muted/50 cursor-pointer ${selectedTools.includes(tool.id) ? 'bg-blue-50' : ''}`}
                                        onClick={() => tool.status === 'Available' && handleToggleTool(tool.id)}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTools.includes(tool.id)}
                                                onChange={() => { }}
                                                disabled={tool.status !== 'Available'}
                                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                        </td>
                                        <td className="p-4 font-medium">{tool.name}</td>
                                        <td className="p-4">{tool.category}</td>
                                        <td className="p-4">{tool.condition}</td>
                                        <td className="p-4">{tool.lastChecked}</td>
                                        <td className="p-4">{getStatusBadge(tool.status)}</td>
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

export default function ToolPrepPage() {
    return (
        <Suspense fallback={<div>Loading tool prep...</div>}>
            <ToolPrepPageContent />
        </Suspense>
    );
}
