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
    Wrench,
    Package,
    CheckCircle,
    Users,
    Calendar,
    ArrowLeft,
    Bell,
    Clock,
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

interface InstallationManagement {
    id: string;
    woNumber: string;
    projectName: string;
    siteLocation: string;
    status: 'Planning' | 'Tools Ready' | 'Team Assigned' | 'Dispatched' | 'On Site';
    toolList: {
        prepared: boolean;
        packed: boolean;
        dispatched: boolean;
    };
    team: {
        assigned: boolean;
        teamLead: string;
        members: number;
        notified: boolean;
    };
    scheduledDate: string;
    toolsDispatchedDate?: string;
}

const TOOL_LIST = [
    'Power Drills & Bits',
    'Screwdrivers Set',
    'Spirit Levels',
    'Measuring Tapes',
    'Laser Level',
    'Circular Saw',
    'Jigsaw',
    'Adhesives & Sealants',
    'Safety Equipment',
    'Clamps & Clips',
];

function InstallationManagementPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [installations, setInstallations] = useState<InstallationManagement[]>([]);
    const [isLoadingMgmt, setIsLoadingMgmt] = useState(false);
    const [mgmtError, setMgmtError] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadManagement(selectedProject);
        } else {
            setInstallations([]);
            setMgmtError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]);

    const loadManagement = async (project: ProjectInfo) => {
        setIsLoadingMgmt(true);
        setMgmtError(null);
        try {
            const summary: any = await projectManagementService.getInstallationManagementSummary(project.id);
            const hasData = !!summary && (
                (summary.tools?.total ?? 0) > 0 ||
                (summary.team?.members ?? 0) > 0 ||
                (summary.readiness?.total ?? 0) > 0 ||
                (summary.crates?.total ?? 0) > 0 ||
                summary.status !== 'planning'
            );
            if (!hasData) {
                setInstallations([]);
                return;
            }

            const statusMap: Record<string, InstallationManagement['status']> = {
                on_site: 'On Site',
                dispatched: 'Dispatched',
                team_assigned: 'Team Assigned',
                tools_ready: 'Tools Ready',
                planning: 'Planning',
            };

            setInstallations([
                {
                    id: project.id,
                    woNumber: project.id,
                    projectName: project.name,
                    siteLocation: project.clientName,
                    status: statusMap[summary.status] ?? 'Planning',
                    toolList: {
                        prepared: !!summary.tools?.prepared,
                        packed: !!summary.tools?.packed,
                        dispatched: !!summary.tools?.dispatched,
                    },
                    team: {
                        assigned: !!summary.team?.assigned,
                        teamLead: summary.team?.teamLead || '—',
                        members: Number(summary.team?.members ?? 0),
                        notified: !!summary.team?.notified,
                    },
                    scheduledDate: (summary.scheduledDate || '').toString().slice(0, 10),
                },
            ]);
        } catch (error) {
            console.error('Error loading installation management:', error);
            setMgmtError('Could not load installation management data for this project.');
            setInstallations([]);
        } finally {
            setIsLoadingMgmt(false);
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
        toast({ title: 'Project Selected', description: `Viewing installation management for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredInstallations = installations.filter(
        (inst) => filterStatus === 'all' || inst.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Site':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Dispatched':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Team Assigned':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Tools Ready':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Planning':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: installations.length,
        onSite: installations.filter((i) => i.status === 'On Site').length,
        planning: installations.filter((i) => i.status === 'Planning' || i.status === 'Tools Ready').length,
    };

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
                                <h1 className="text-2xl font-bold text-gray-900">Installation Management</h1>
                                <p className="text-sm text-gray-600">Select a project to manage installation</p>
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
                            <Button variant="ghost" size="icon" onClick={() => router.push('/logistics/loading')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Installation Management</h1>
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
                                <p className="text-sm text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Wrench className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">On Site</p>
                                <p className="text-2xl font-bold text-green-900">{stats.onSite}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Planning</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.planning}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
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
                        <option value="Planning">Planning</option>
                        <option value="Tools Ready">Tools Ready</option>
                        <option value="Team Assigned">Team Assigned</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="On Site">On Site</option>
                    </select>
                </div>

                {/* Installations List */}
                {isLoadingMgmt ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                        <span className="ml-2 text-gray-600">Loading installation management...</span>
                    </div>
                ) : mgmtError ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-red-600">{mgmtError}</div>
                ) : filteredInstallations.length === 0 ? (
                    <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
                        No installation management records for this project yet.
                    </div>
                ) : (
                <div className="grid gap-2">
                    {filteredInstallations.map((inst) => (
                        <div key={inst.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                            <div className="flex items-start gap-2">
                                <div className={`w-16 h-16 rounded-lg ${inst.status === 'On Site' ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                    <Wrench className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold">{inst.projectName}</h3>
                                            <p className="text-sm text-gray-600">{inst.woNumber} - {inst.siteLocation}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(inst.status)}`}>
                                            {inst.status}
                                        </span>
                                    </div>

                                    {/* Tool List Progress */}
                                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-4 h-4 text-blue-600" />
                                            <p className="text-xs font-semibold text-blue-900">Tool List Management (8.1, 8.3, 8.6)</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className={`flex items-center gap-1 ${inst.toolList.prepared ? 'text-green-600' : 'text-gray-500'}`}>
                                                {inst.toolList.prepared ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                <span>List Prepared (8.1)</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${inst.toolList.packed ? 'text-green-600' : 'text-gray-500'}`}>
                                                {inst.toolList.packed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                <span>Tools Packed (8.3)</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${inst.toolList.dispatched ? 'text-green-600' : 'text-gray-500'}`}>
                                                {inst.toolList.dispatched ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                <span>Dispatched (8.6)</span>
                                            </div>
                                        </div>
                                        {inst.toolsDispatchedDate && (
                                            <p className="text-xs text-blue-700 mt-2">Dispatched on: {inst.toolsDispatchedDate}</p>
                                        )}
                                    </div>

                                    {/* Team Assignment */}
                                    <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-purple-600" />
                                            <p className="text-xs font-semibold text-purple-900">Team Coordination (8.4, 8.5, 8.7)</p>
                                        </div>
                                        {inst.team.assigned ? (
                                            <div className="text-xs text-purple-800">
                                                <p className="font-medium">Team Lead: {inst.team.teamLead}</p>
                                                <p>Team Size: {inst.team.members} members</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {inst.team.notified ? (
                                                        <>
                                                            <Bell className="w-3 h-3 text-green-600" />
                                                            <span className="text-green-600">Team Notified (8.5)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            <span>Notification Pending</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">Team not yet assigned</p>
                                        )}
                                    </div>

                                    {/* Schedule */}
                                    <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                            <span className="text-xs text-gray-500">Installation Date:</span>
                                            <span className="font-medium">{inst.scheduledDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Tool List Reference */}
                <div className="bg-white rounded-lg border p-3">
                    <h3 className="text-lg font-bold mb-3">Standard Tool List (8.1)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {TOOL_LIST.map((tool, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <Wrench className="w-4 h-4 text-blue-600" />
                                <span>{tool}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InstallationManagementPage() {
    return (
        <Suspense fallback={<div>Loading management...</div>}>
            <InstallationManagementPageContent />
        </Suspense>
    );
}
