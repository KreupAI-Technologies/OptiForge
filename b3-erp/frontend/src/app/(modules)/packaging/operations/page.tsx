'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Package,
    CheckCircle,
    Clock,
    User,
    Calendar,
    ArrowLeft,
    Tag,
    Box,
    FolderKanban,
    Search,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { PackagingService, PackagingJobDto } from '@/services/packaging.service';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface PackingJob {
    id: string;
    woNumber: string;
    productName: string;
    quantity: number;
    status: 'In Queue' | 'Packing' | 'Labeled' | 'Complete';
    packingTeam: string;
    startDate?: string;
    completionDate?: string;
    materialsUsed: {
        crates: number;
        wrapping: string;
        thermocol: number;
        stickers: number;
    };
}

function mapJob(m: PackagingJobDto): PackingJob {
    const mu = m.materialsUsed || {};
    return {
        id: m.id || '',
        woNumber: m.woNumber || '',
        productName: m.productName || '',
        quantity: Number(m.quantity) || 0,
        status: (m.status || 'In Queue') as PackingJob['status'],
        packingTeam: m.packingTeam || '',
        startDate: m.startDate || '',
        completionDate: m.completionDate || '',
        materialsUsed: {
            crates: Number(mu.crates) || 0,
            wrapping: String(mu.wrapping || ''),
            thermocol: Number(mu.thermocol) || 0,
            stickers: Number(mu.stickers) || 0,
        },
    };
}

export default function PackagingOperationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Jobs state
    const [jobs, setJobs] = useState<PackingJob[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadJobs = async (projectId: string) => {
        setLoading(true);
        try {
            const data = await PackagingService.getJobs(projectId);
            setJobs(Array.isArray(data) ? data.map(mapJob) : []);
        } catch (error) {
            console.error('Failed to load jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (job: PackingJob, newStatus: PackingJob['status']) => {
        try {
            setUpdatingId(job.id);
            const payload: Partial<PackagingJobDto> = { status: newStatus };
            if (newStatus === 'Complete') {
                payload.completionDate = new Date().toISOString().slice(0, 10);
            } else if (newStatus === 'Packing' && !job.startDate) {
                payload.startDate = new Date().toISOString().slice(0, 10);
            }
            await PackagingService.updateJob(job.id, payload);
            toast({
                title: newStatus === 'Complete' ? 'Job Completed' : 'Job Started',
                description: `${job.productName} is now ${newStatus}.`,
            });
            if (selectedProject) await loadJobs(selectedProject.id);
        } catch (error) {
            console.error('Failed to update job:', error);
            toast({
                title: 'Update Failed',
                description: error instanceof Error ? error.message : 'Could not update the job.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingId(null);
        }
    };

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

    // Load jobs when project is selected
    useEffect(() => {
        if (!selectedProject) return;
        loadJobs(selectedProject.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/packaging/operations?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing packaging operations for ${project.name}` });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredJobs = jobs.filter((job) => filterStatus === 'all' || job.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Complete':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Labeled':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Packing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'In Queue':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: jobs.length,
        complete: jobs.filter((j) => j.status === 'Complete').length,
        inProgress: jobs.filter((j) => j.status === 'Packing' || j.status === 'Labeled').length,
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
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Packaging Operations</h1>
                                <p className="text-sm text-gray-600 mt-1">Select a project to view packaging jobs</p>
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

    // Jobs view
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
                            <h1 className="text-3xl font-bold text-gray-900">Packaging Operations</h1>
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
                        <span className="ml-2 text-gray-600">Loading jobs...</span>
                    </div>
                ) : (
                    <>
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
                                        <p className="text-sm text-yellow-600">In Progress</p>
                                        <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600">Complete</p>
                                        <p className="text-2xl font-bold text-green-900">{stats.complete}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="bg-white rounded-lg border p-3">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                <option value="all">All Status</option>
                                <option value="In Queue">In Queue</option>
                                <option value="Packing">Packing</option>
                                <option value="Labeled">Labeled</option>
                                <option value="Complete">Complete</option>
                            </select>
                        </div>

                        {/* Jobs List */}
                        <div className="grid gap-2">
                            {filteredJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                    <div className="flex items-start gap-2">
                                        <div className={`w-16 h-16 rounded-lg ${job.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                            <Package className="w-8 h-8 text-white" />
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
                                            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Packing Team</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {job.packingTeam}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Start Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {job.startDate || 'Pending'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Completion</p>
                                                    <p className="font-medium">{job.completionDate || <span className="text-gray-500">In progress</span>}</p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                <p className="text-xs font-semibold text-blue-900 mb-2">Materials Used:</p>
                                                <div className="grid grid-cols-4 gap-2 text-xs">
                                                    <div>
                                                        <Box className="w-4 h-4 inline mr-1" />
                                                        <span className="font-medium">{job.materialsUsed.crates} Crates</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">{job.materialsUsed.wrapping} Wrapping</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">{job.materialsUsed.thermocol} Thermocol</span>
                                                    </div>
                                                    <div>
                                                        <Tag className="w-4 h-4 inline mr-1" />
                                                        <span className="font-medium">{job.materialsUsed.stickers} Stickers</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-3 border-t pt-4">
                                            <button
                                                onClick={() => {
                                                    toast({
                                                        title: "Job Details",
                                                        description: `Viewing details for ${job.woNumber}`,
                                                    });
                                                }}
                                                className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                            >
                                                View Details
                                            </button>
                                            {job.status === 'In Queue' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(job, 'Packing')}
                                                    disabled={updatingId === job.id}
                                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updatingId === job.id ? 'Starting…' : 'Start Packing'}
                                                </button>
                                            )}
                                            {job.status === 'Packing' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(job, 'Complete')}
                                                    disabled={updatingId === job.id}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updatingId === job.id ? 'Completing…' : 'Complete Job'}
                                                </button>
                                            )}
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
