'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { capaService as CAPAService, CAPA } from '@/services/capa.service';
import {
    Shield,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    FileText,
    User,
    Calendar,
    Target,
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

export default function CAPAPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // CAPA state
    const [capas, setCapas] = useState<CAPA[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
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

    // Load CAPAs when project is selected
    useEffect(() => {
        if (selectedProject) {
            loadCAPAs();
        }
    }, [selectedProject]);

    const loadCAPAs = async () => {
        setLoading(true);
        try {
            const data = await CAPAService.getAllCAPAs();
            setCapas(data);
        } catch (error) {
            console.error('Failed to load CAPAs:', error);
            toast({ title: 'Error', description: 'Failed to load CAPAs', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/quality/capa?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing CAPAs for ${project.name}` });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredCAPAs = capas.filter((capa) => {
        const matchesStatus = filterStatus === 'all' || capa.status === filterStatus;
        const matchesType = filterType === 'all' || capa.type === filterType;
        return matchesStatus && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'closed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'open':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'pending-verification':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'corrective':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'preventive':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: capas.length,
        open: capas.filter((c) => c.status === 'open').length,
        inProgress: capas.filter((c) => c.status === 'in-progress').length,
        closed: capas.filter((c) => c.status === 'closed').length,
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
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Corrective & Preventive Actions</h1>
                                <p className="text-sm text-gray-600 mt-1">Select a project to view CAPAs</p>
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

    // CAPA view
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
                            <h1 className="text-3xl font-bold text-gray-900">Corrective & Preventive Actions</h1>
                            <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedProject(null)}>
                                <FolderKanban className="w-4 h-4 mr-2" />
                                Change Project
                            </Button>
                            <Button onClick={() => router.push(`/quality/defects?projectId=${selectedProject.id}`)}>
                                Defects <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading CAPAs...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total CAPAs</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <Shield className="w-8 h-8 text-gray-600" />
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
                                    <option value="pending-verification">Pending Verification</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Types</option>
                                    <option value="corrective">Corrective</option>
                                    <option value="preventive">Preventive</option>
                                </select>
                            </div>
                        </div>

                        {/* CAPA List */}
                        <div className="grid gap-2">
                            {filteredCAPAs.map((capa) => (
                                <div key={capa.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                    <div className="flex items-start gap-2">
                                        <div className={`w-16 h-16 rounded-lg ${capa.type === 'corrective' ? 'bg-orange-500' : 'bg-purple-500'} flex items-center justify-center`}>
                                            <Shield className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold">{capa.title}</h3>
                                                    <p className="text-sm text-gray-600">{capa.capaNumber}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getTypeColor(capa.type)}`}>
                                                        {capa.type}
                                                    </span>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(capa.status)}`}>
                                                        {capa.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Initiated By</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {capa.initiatedBy}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(capa.initiatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Assigned To</p>
                                                    <p className="font-medium">{capa.assignedTo || <span className="text-gray-500">Unassigned</span>}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Target Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Target className="w-3 h-3" />
                                                        {new Date(capa.targetDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
                                                <strong>Root Cause:</strong> {capa.rootCause || 'Under investigation'}
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
