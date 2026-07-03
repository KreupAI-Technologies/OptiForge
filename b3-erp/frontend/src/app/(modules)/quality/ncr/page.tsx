'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ncrService as NCRService, NCR } from '@/services/ncr.service';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    FileText,
    User,
    Calendar,
    Package,
    FolderKanban,
    Search,
    Building2,
    Loader2,
    ArrowRight,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

export default function NCRPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // NCR state
    const [ncrs, setNcrs] = useState<NCR[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
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

    // Load NCRs when project is selected
    useEffect(() => {
        if (selectedProject) {
            loadNCRs();
        }
    }, [selectedProject]);

    const loadNCRs = async () => {
        setLoading(true);
        try {
            const data = await NCRService.getAllNCRs();
            setNcrs(data);
        } catch (error) {
            console.error('Failed to load NCRs:', error);
            toast({ title: 'Error', description: 'Failed to load NCRs', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/quality/ncr?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing NCRs for ${project.name}` });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredNCRs = ncrs.filter((ncr) => {
        const matchesStatus = filterStatus === 'all' || ncr.status === filterStatus;
        const matchesSeverity = filterSeverity === 'all' || ncr.severity === filterSeverity;
        return matchesStatus && matchesSeverity;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'closed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'open':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'pending-review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'major':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'minor':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: ncrs.length,
        open: ncrs.filter((n) => n.status === 'open').length,
        inProgress: ncrs.filter((n) => n.status === 'in-progress').length,
        closed: ncrs.filter((n) => n.status === 'closed').length,
    };

    // Project selection view
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-3 py-2 space-y-3">
                    {/* Header */}
                    <div className="bg-white rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Non-Conformance Reports</h1>
                                <p className="text-sm text-gray-600 mt-1">Select a project to view NCRs</p>
                            </div>
                        </div>
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
            </div>
        );
    }

    // NCR view
    return (
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">Non-Conformance Reports</h1>
                            <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedProject(null)}>
                                <FolderKanban className="w-4 h-4 mr-2" />
                                Change Project
                            </Button>
                            <Button onClick={() => router.push(`/quality/capa?projectId=${selectedProject.id}`)}>
                                CAPA <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading NCRs...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total NCRs</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-gray-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-600">Open</p>
                                        <p className="text-2xl font-bold text-red-900">{stats.open}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600">In Progress</p>
                                        <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600">Closed</p>
                                        <p className="text-2xl font-bold text-green-900">{stats.closed}</p>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg border p-3">
                            <div className="flex gap-2">
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="pending-review">Pending Review</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Severity</option>
                                    <option value="critical">Critical</option>
                                    <option value="major">Major</option>
                                    <option value="minor">Minor</option>
                                </select>
                            </div>
                        </div>

                        {/* NCR List */}
                        <div className="grid gap-2">
                            {filteredNCRs.map((ncr) => (
                                <div key={ncr.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                    <div className="flex items-start gap-2">
                                        <div className={`w-16 h-16 rounded-lg ${ncr.severity === 'critical' ? 'bg-red-500' : ncr.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                                            <AlertCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold">{ncr.title}</h3>
                                                    <p className="text-sm text-gray-600">{ncr.ncrNumber} - {ncr.source}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getSeverityColor(ncr.severity)}`}>
                                                        {ncr.severity}
                                                    </span>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(ncr.status)}`}>
                                                        {ncr.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Reported By</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {ncr.reportedBy}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(ncr.reportedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Assigned To</p>
                                                    <p className="font-medium">{ncr.assignedTo || <span className="text-gray-500">Unassigned</span>}</p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
                                                <strong>Description:</strong> {ncr.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
