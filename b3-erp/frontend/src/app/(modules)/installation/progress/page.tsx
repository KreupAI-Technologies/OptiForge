'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import {
    CheckCircle,
    Clock,
    User,
    Calendar,
    ArrowLeft,
    Camera,
    AlertCircle,
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

interface InstallationProgress {
    id: string;
    woNumber: string;
    projectName: string;
    installationTeam: string;
    startDate: string;
    status: 'In Progress' | 'Review Pending' | 'Approved' | 'Complete';
    progress: {
        cabinetAlignment: boolean;
        trialCompleted: boolean;
        buffingDone: boolean;
        accessoriesFixed: boolean;
        doorsAligned: boolean;
    };
    dailyReviews: number;
    photosUploaded: number;
    issues: number;
}

function InstallationProgressPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [progressData, setProgressData] = useState<InstallationProgress[]>([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressError, setProgressError] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadProgress(selectedProject);
        } else {
            setProgressData([]);
            setProgressError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);

    const loadProgress = async (project: ProjectInfo) => {
        setIsLoadingProgress(true);
        setProgressError(null);
        try {
            const reports: any[] = await projectManagementService.getInstallDailyReports(project.id);
            if (!reports || reports.length === 0) {
                setProgressData([]);
                return;
            }
            const latest = reports[0];
            const overall = Number(latest?.overallProgress ?? 0);
            const photos = reports.reduce((sum, r) => sum + (Array.isArray(r?.progressPhotos) ? r.progressPhotos.length : 0), 0);
            const cleaned = reports.some((r) => r?.isSiteCleaned);
            setProgressData([
                {
                    id: project.id,
                    woNumber: project.id,
                    projectName: project.name,
                    installationTeam: latest?.reportedBy || `${latest?.manpowerCount ?? 0} crew`,
                    startDate: (reports[reports.length - 1]?.reportDate || latest?.reportDate || '').toString().slice(0, 10),
                    status: overall >= 100 ? 'Complete' : overall > 0 ? 'In Progress' : 'Review Pending',
                    progress: {
                        cabinetAlignment: overall >= 60,
                        trialCompleted: overall >= 50,
                        buffingDone: cleaned,
                        accessoriesFixed: overall >= 85,
                        doorsAligned: overall >= 90,
                    },
                    dailyReviews: reports.length,
                    photosUploaded: photos,
                    issues: reports.filter((r) => r?.issuesEncountered).length,
                },
            ]);
        } catch (error) {
            console.error('Error loading installation progress:', error);
            setProgressError('Could not load installation progress for this project.');
            setProgressData([]);
        } finally {
            setIsLoadingProgress(false);
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
        toast({ title: 'Project Selected', description: `Viewing progress for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredProgress = progressData.filter(
        (p) => filterStatus === 'all' || p.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Complete':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Approved':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Review Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'In Progress':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: progressData.length,
        complete: progressData.filter((p) => p.status === 'Complete').length,
        inProgress: progressData.filter((p) => p.status === 'In Progress').length,
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Installation Progress Tracker</h1>
                                <p className="text-sm text-gray-600">Select a project to view progress</p>
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
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/installation/management?projectId=${selectedProject.id}`)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Installation Progress Tracker</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedProject.name} • {selectedProject.clientName}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleChangeProject}>
                            Change Project
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Installations</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <User className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600">In Progress</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.inProgress}</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-600" />
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
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review Pending">Review Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Complete">Complete</option>
                    </select>
                </div>

                {/* Progress List */}
                {isLoadingProgress ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                        <span className="ml-2 text-gray-600">Loading installation progress...</span>
                    </div>
                ) : progressError ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-red-600">{progressError}</div>
                ) : filteredProgress.length === 0 ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
                        No installation progress reports for this project yet.
                    </div>
                ) : (
                <div className="grid gap-2">
                    {filteredProgress.map((prog) => {
                        const progressArray = Object.values(prog.progress);
                        const completedSteps = progressArray.filter(Boolean).length;
                        const totalSteps = progressArray.length;
                        const percentage = (completedSteps / totalSteps) * 100;

                        return (
                            <div key={prog.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                <div className="flex items-start gap-2">
                                    <div className={`w-16 h-16 rounded-lg ${prog.status === 'Complete' ? 'bg-green-500' : 'bg-purple-500'} flex items-center justify-center`}>
                                        {prog.status === 'Complete' ? (
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        ) : (
                                            <Clock className="w-8 h-8 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold">{prog.projectName}</h3>
                                                <p className="text-sm text-gray-600">{prog.woNumber}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(prog.status)}`}>
                                                {prog.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Installation Team</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {prog.installationTeam}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Start Date</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {prog.startDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Daily Reviews</p>
                                                <p className="font-medium">{prog.dailyReviews} completed (8.10)</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    Installation Progress: {completedSteps}/{totalSteps} steps ({percentage.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${prog.status === 'Complete' ? 'bg-green-500' : 'bg-purple-500'}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Installation Checklist */}
                                        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Installation Checklist (8.8-8.12):</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className={`flex items-center gap-2 text-xs ${prog.progress.cabinetAlignment ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {prog.progress.cabinetAlignment ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    <span>8.8 - Cabinet Alignment (Horizontal & Vertical)</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${prog.progress.trialCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {prog.progress.trialCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    <span>8.9 - Trial Wall Installation Complete</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${prog.progress.buffingDone ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {prog.progress.buffingDone ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    <span>8.10 - Site Buffing & Polishing Done</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${prog.progress.accessoriesFixed ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {prog.progress.accessoriesFixed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    <span>8.11 - Accessories & Doors Fixed</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${prog.progress.doorsAligned ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {prog.progress.doorsAligned ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    <span>8.12 - Final Door Alignment Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documentation & Issues */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-blue-600" />
                                                <span className="text-blue-800">{prog.photosUploaded} Photos (8.13)</span>
                                            </div>
                                            {prog.issues > 0 && (
                                                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                    <span className="text-red-800">{prog.issues} Issues Logged</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}
            </div>
        </div>
    );
}

export default function InstallationProgressPage() {
    return (
        <Suspense fallback={<div>Loading progress...</div>}>
            <InstallationProgressPageContent />
        </Suspense>
    );
}
