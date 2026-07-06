'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Package,
    CheckCircle,
    User,
    Calendar,
    ArrowLeft,
    FileText,
    Truck,
    Search,
    FolderKanban,
    Building2,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { LogisticsService } from '@/services/logistics.service';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface LoadingJob {
    id: string;
    woNumber: string;
    productName: string;
    quantity: number;
    packingComplete: boolean;
    status: 'Pending' | 'Loading' | 'Loaded' | 'Dispatched';
    loadingSupervisor: string;
    loadingDate?: string;
    dispatchBillNumber?: string;
    checklist: {
        id: string;
        item: string;
        checked: boolean;
    }[];
}

export default function LoadingDispatchPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [jobs, setJobs] = useState<LoadingJob[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadProjects();
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const rows = await LogisticsService.getLoadingJobs();
            setJobs((rows || []) as LoadingJob[]);
        } catch (error) {
            console.error('Error loading loading jobs:', error);
            setJobs([]);
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
                if (found) {
                    setSelectedProject(found);
                }
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        toast({ title: 'Project Selected', description: `Viewing loading jobs for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredJobs = jobs.filter((job) => filterStatus === 'all' || job.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dispatched':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Loaded':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Loading':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: jobs.length,
        dispatched: jobs.filter((j) => j.status === 'Dispatched').length,
        loading: jobs.filter((j) => j.status === 'Loading' || j.status === 'Loaded').length,
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Loading & Dispatch</h1>
                                <p className="text-sm text-gray-600">Select a project to view loading jobs</p>
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban className="h-5 w-5 text-blue-600" />
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
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Select Project</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main Content View
    return (
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Loading & Dispatch</h1>
                                <p className="text-sm text-gray-600">{selectedProject.name} • {selectedProject.clientName}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleChangeProject}>Change Project</Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Jobs</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Package className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">Loading</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.loading}</p>
                            </div>
                            <Truck className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600">Dispatched</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.dispatched}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border p-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Loading">Loading</option>
                        <option value="Loaded">Loaded</option>
                        <option value="Dispatched">Dispatched</option>
                    </select>
                </div>

                {/* Jobs List */}
                <div className="grid gap-2">
                    {filteredJobs.map((job) => {
                        const checkedCount = job.checklist.filter((c) => c.checked).length;
                        const totalChecks = job.checklist.length;
                        const progress = (checkedCount / totalChecks) * 100;

                        return (
                            <div key={job.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                <div className="flex items-start gap-2">
                                    <div className={`w-16 h-16 rounded-lg ${job.status === 'Dispatched' ? 'bg-purple-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                        <Truck className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold">{job.productName}</h3>
                                                <p className="text-sm text-gray-600">{job.woNumber} - {job.quantity} units</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Supervisor</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {job.loadingSupervisor}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Loading Date</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {job.loadingDate || 'Pending'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Dispatch Bill</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {job.dispatchBillNumber || 'Not generated'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    Loading Checklist: {checkedCount}/{totalChecks} items ({progress.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${job.status === 'Dispatched' ? 'bg-purple-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Checklist */}
                                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Loading Checklist:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {job.checklist.map((check) => (
                                                    <div key={check.id} className="flex items-center gap-2 text-xs">
                                                        {check.checked ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                                        )}
                                                        <span className={check.checked ? 'text-green-800' : 'text-gray-600'}>
                                                            {check.item}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
