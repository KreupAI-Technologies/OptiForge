'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Wrench,
    FolderKanban,
    Search,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface ReworkItem {
    id: string;
    defectId: string;
    component: string;
    defectType: string;
    priority: 'High' | 'Medium' | 'Low';
    assignedTo: string;
    status: 'Pending' | 'In Rework' | 'Completed' | 'Re-inspection';
    iterations: number;
}

const mockReworkItems: ReworkItem[] = [
    { id: 'RW-001', defectId: 'DEF-045', component: 'Cabinet Door #3', defectType: 'Surface Finish', priority: 'High', assignedTo: 'Ravi Kumar', status: 'In Rework', iterations: 1 },
    { id: 'RW-002', defectId: 'DEF-046', component: 'Side Panel', defectType: 'Dimension Mismatch', priority: 'Medium', assignedTo: 'Suresh P', status: 'Pending', iterations: 0 },
    { id: 'RW-003', defectId: 'DEF-043', component: 'Main Frame', defectType: 'Weld Quality', priority: 'High', assignedTo: 'Ravi Kumar', status: 'Re-inspection', iterations: 2 },
    { id: 'RW-004', defectId: 'DEF-044', component: 'Mounting Bracket', defectType: 'Coating Issue', priority: 'Low', assignedTo: 'Mohan S', status: 'Completed', iterations: 1 },
];

export default function ReworkLoopPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Rework state
    const [reworkItems, setReworkItems] = useState<ReworkItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Load projects
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const allProjects = await projectManagementService.getProjects();
                const projectInfos: ProjectInfo[] = allProjects.map((p: any) => ({
                    id: p.id,
                    name: p.projectName || p.name || `Project ${p.id}`,
                    clientName: p.clientName || p.customer || 'Unknown Client',
                    status: p.status || 'active',
                }));
                setProjects(projectInfos);

                const projectId = searchParams.get('projectId');
                if (projectId) {
                    const found = projectInfos.find(p => p.id === projectId);
                    if (found) {
                        setSelectedProject(found);
                    }
                }
            } catch (error) {
                console.error('Failed to load projects:', error);
                toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
            } finally {
                setProjectsLoading(false);
            }
        };
        loadProjects();
    }, [searchParams, toast]);

    // Load rework items when project is selected
    useEffect(() => {
        if (selectedProject) {
            setLoading(true);
            setTimeout(() => {
                setReworkItems(mockReworkItems);
                setLoading(false);
            }, 300);
        }
    }, [selectedProject]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/quality/rework?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing rework items for ${project.name}` });
    };

    const handleStatusChange = (id: string, newStatus: ReworkItem['status']) => {
        setReworkItems(reworkItems.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
        toast({
            title: 'Status Updated',
            description: `Rework item ${id} moved to ${newStatus}`,
        });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const getStatusColor = (status: ReworkItem['status']) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'In Rework': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'Re-inspection': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getPriorityColor = (priority: ReworkItem['priority']) => {
        switch (priority) {
            case 'High': return 'text-red-600';
            case 'Medium': return 'text-orange-600';
            default: return 'text-blue-600';
        }
    };

    // Project selection view
    if (!selectedProject) {
        return (
            <div className="w-full py-2 space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-orange-600" />
                        Rework Loop
                    </h1>
                    <p className="text-muted-foreground">
                        Select a project to manage defect corrections and rework iterations.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                    />
                </div>

                {/* Projects Grid */}
                {projectsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading projects...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredProjects.map((project) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300" onClick={() => handleProjectSelect(project)}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-5 w-5 text-blue-600" />
                                            <CardTitle className="text-lg">{project.name}</CardTitle>
                                        </div>
                                        <Badge variant="outline" className="capitalize">{project.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4" />
                                        <span>{project.clientName}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        Select Project
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Rework view
    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-orange-600" />
                        Rework Loop
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedProject(null)}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Change Project
                    </Button>
                    <Button onClick={() => router.push('/quality/approvals')}>
                        Next: QC Approval <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading rework items...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reworkItems.filter(i => i.status === 'Pending').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">In Rework</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {reworkItems.filter(i => i.status === 'In Rework').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Re-inspection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {reworkItems.filter(i => i.status === 'Re-inspection').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {reworkItems.filter(i => i.status === 'Completed').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rework Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Rework ID</th>
                                            <th className="p-4 font-medium">Defect Ref</th>
                                            <th className="p-4 font-medium">Component</th>
                                            <th className="p-4 font-medium">Defect Type</th>
                                            <th className="p-4 font-medium">Priority</th>
                                            <th className="p-4 font-medium">Assigned To</th>
                                            <th className="p-4 font-medium">Iterations</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reworkItems.map((item) => (
                                            <tr key={item.id} className="border-t hover:bg-muted/50">
                                                <td className="p-4 font-medium">{item.id}</td>
                                                <td className="p-4">{item.defectId}</td>
                                                <td className="p-4">{item.component}</td>
                                                <td className="p-4">{item.defectType}</td>
                                                <td className="p-4">
                                                    <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                                                        {item.priority}
                                                    </span>
                                                </td>
                                                <td className="p-4">{item.assignedTo}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="gap-1">
                                                        <RefreshCw className="h-3 w-3" />
                                                        {item.iterations}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={getStatusColor(item.status)}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {item.status === 'Pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleStatusChange(item.id, 'In Rework')}
                                                            >
                                                                <Wrench className="h-4 w-4 mr-1" />
                                                                Start
                                                            </Button>
                                                        )}
                                                        {item.status === 'In Rework' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleStatusChange(item.id, 'Re-inspection')}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                Send to QC
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
                </>
            )}
        </div>
    );
}
