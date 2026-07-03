'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Camera,
    User,
    Calendar,
    ArrowLeft,
    Package,
    Wrench,
    XCircle,
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

interface Defect {
    id: string;
    woNumber: string;
    productName: string;
    defectType: 'Dimensional' | 'Surface' | 'Assembly' | 'Material' | 'Functional';
    severity: 'Critical' | 'Major' | 'Minor';
    status: 'Reported' | 'Under Review' | 'Rework Assigned' | 'Resolved';
    reportedBy: string;
    reportedDate: string;
    description: string;
    reworkAssignedTo?: string;
}

const mockDefects: Defect[] = [
    {
        id: '1',
        woNumber: 'WO-2025-001',
        productName: 'SS304 Kitchen Sink Panel',
        defectType: 'Surface',
        severity: 'Minor',
        status: 'Resolved',
        reportedBy: 'QC Inspector Alice',
        reportedDate: '2025-01-22',
        description: 'Small scratch on visible surface',
        reworkAssignedTo: 'Finishing Team A',
    },
    {
        id: '2',
        woNumber: 'WO-2025-003',
        productName: 'Cabinet Frame Assembly',
        defectType: 'Dimensional',
        severity: 'Critical',
        status: 'Rework Assigned',
        reportedBy: 'QC Inspector Bob',
        reportedDate: '2025-01-23',
        description: 'Door frame 2mm off specification',
        reworkAssignedTo: 'Fabrication Team',
    },
    {
        id: '3',
        woNumber: 'WO-2025-004',
        productName: 'Drawer Slide Assembly',
        defectType: 'Assembly',
        severity: 'Major',
        status: 'Under Review',
        reportedBy: 'QC Inspector Carol',
        reportedDate: '2025-01-24',
        description: 'Soft-close mechanism not functioning properly',
    },
];

export default function DefectManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Defects state
    const [defects, setDefects] = useState<Defect[]>([]);
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
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

                // Check URL for project parameter
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

    // Load defects when project is selected
    useEffect(() => {
        if (selectedProject) {
            setLoading(true);
            // Simulate loading project-specific defects
            setTimeout(() => {
                setDefects(mockDefects);
                setLoading(false);
            }, 300);
        }
    }, [selectedProject]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/quality/defects?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing defects for ${project.name}` });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredDefects = defects.filter((defect) => {
        const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity;
        const matchesStatus = filterStatus === 'all' || defect.status === filterStatus;
        return matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Major':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Minor':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Rework Assigned':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Under Review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Reported':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: defects.length,
        critical: defects.filter((d) => d.severity === 'Critical').length,
        resolved: defects.filter((d) => d.status === 'Resolved').length,
        pending: defects.filter((d) => d.status !== 'Resolved').length,
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
                                <AlertTriangle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Defect Management & Rework</h1>
                                <p className="text-sm text-gray-600 mt-1">Select a project to view defects</p>
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

    // Defects view
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
                            <h1 className="text-3xl font-bold text-gray-900">Defect Management & Rework</h1>
                            <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
                        </div>
                        <Button variant="outline" onClick={() => setSelectedProject(null)}>
                            <FolderKanban className="w-4 h-4 mr-2" />
                            Change Project
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading defects...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Defects</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-gray-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-600">Critical</p>
                                        <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600">Resolved</p>
                                        <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
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
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg border p-3">
                            <div className="flex gap-2">
                                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Severity</option>
                                    <option value="Critical">❌ Critical</option>
                                    <option value="Major">⚠️ Major</option>
                                    <option value="Minor">⚡ Minor</option>
                                </select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                    <option value="all">All Status</option>
                                    <option value="Reported">Reported</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Rework Assigned">Rework Assigned</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                        </div>

                        {/* Defects List */}
                        <div className="grid gap-2">
                            {filteredDefects.map((defect) => (
                                <div key={defect.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                    <div className="flex items-start gap-2">
                                        <div className={`w-16 h-16 rounded-lg ${defect.severity === 'Critical' ? 'bg-red-500' : defect.severity === 'Major' ? 'bg-orange-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                                            <AlertTriangle className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold">{defect.defectType} Defect</h3>
                                                    <p className="text-sm text-gray-600">{defect.woNumber} - {defect.productName}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(defect.severity)}`}>
                                                        {defect.severity}
                                                    </span>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(defect.status)}`}>
                                                        {defect.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Reported By</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {defect.reportedBy}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {defect.reportedDate}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Rework Team</p>
                                                    <p className="font-medium">
                                                        {defect.reworkAssignedTo || <span className="text-gray-500">Not assigned</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
                                                <strong>Description:</strong> {defect.description}
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
