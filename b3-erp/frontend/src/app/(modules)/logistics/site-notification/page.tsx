'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    ArrowRight,
    Users,
    Send,
    CheckCircle2,
    Calendar,
    Clock,
    Search,
    FolderKanban,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { LogisticsService, DeliveryCoordinationDto } from '@/services/logistics.service';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
    projectCode?: string;
}

/** Resolve (or create) the DeliveryCoordination record for a project. */
async function resolveCoordination(
    project: ProjectInfo,
    seed?: Partial<DeliveryCoordinationDto>,
): Promise<DeliveryCoordinationDto> {
    const woNumber = project.projectCode || project.id;
    const existing = await LogisticsService.getDeliveryCoordinations();
    const match = existing.find((c) => c.woNumber === woNumber);
    if (match) return match;
    return LogisticsService.createDeliveryCoordination({
        woNumber,
        customerName: project.clientName,
        ...seed,
    });
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    phone: string;
    status: 'Available' | 'Assigned' | 'Busy';
}

export default function SiteNotificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: '1', name: 'Rajesh Kumar', role: 'Senior Installation Engineer', phone: '+91 98765 11111', status: 'Available' },
        { id: '2', name: 'Suresh Babu', role: 'Installation Technician', phone: '+91 98765 22222', status: 'Available' },
        { id: '3', name: 'Mohan S', role: 'Installation Technician', phone: '+91 98765 33333', status: 'Available' },
    ]);

    const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
    const [notificationSent, setNotificationSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setError(null);
            const allProjects = await projectManagementService.getProjects();
            const projectInfos: ProjectInfo[] = allProjects.map((p: Project) => ({
                id: p.id,
                name: p.name || `Project ${p.id}`,
                clientName: p.clientName || 'Unknown Client',
                status: p.status || 'active',
                projectCode: p.projectCode,
            }));
            setProjects(projectInfos);

            const projectId = searchParams.get('projectId');
            if (projectId) {
                const found = projectInfos.find(p => p.id === projectId);
                if (found) {
                    setSelectedProject(found);
                }
            }
        } catch (err) {
            console.error('Error loading projects:', err);
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        toast({ title: 'Project Selected', description: `Viewing site notifications for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleMember = (id: string) => {
        setSelectedTeam(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSendNotification = async () => {
        if (!selectedProject || submitting) return;
        setSubmitting(true);
        try {
            const coordination = await resolveCoordination(selectedProject);
            await LogisticsService.updateDeliveryCoordination(coordination.id, {
                siteContactNotified: true,
                status: 'Site Informed',
            });
            setTeamMembers(teamMembers.map(member =>
                selectedTeam.includes(member.id) ? { ...member, status: 'Assigned' as const } : member
            ));
            setNotificationSent(true);
            toast({
                title: 'Installation Team Notified',
                description: `${selectedTeam.length} team member(s) have been notified about the delivery`,
                variant: 'success',
            });
        } catch (err) {
            console.error('Error notifying site contact:', err);
            toast({
                title: 'Failed to Notify',
                description: err instanceof Error ? err.message : 'Could not update site contact notification',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: TeamMember['status']) => {
        const styles = {
            'Available': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Assigned': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            'Busy': 'bg-red-100 text-red-800 hover:bg-red-100'
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
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Site Contact Notification</h1>
                                <p className="text-sm text-gray-600">Select a project to notify installation team</p>
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

                    {error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                            <p className="text-red-700 font-medium">Failed to load projects</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                            <Button className="mt-4" variant="outline" onClick={loadProjects}>Retry</Button>
                        </div>
                    ) : isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="rounded-lg border bg-white p-12 text-center text-gray-500">
                            No projects found.
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

    // Main Content View
    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8 text-orange-600" />
                        7.9 Site Contact Notification
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button
                        onClick={() => router.push('/installation/tool-prep')}
                        disabled={!notificationSent}
                    >
                        Phase 8: Installation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Delivery Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                        <div className="text-sm text-muted-foreground">Project</div>
                        <div className="font-medium">{selectedProject.name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Customer</div>
                        <div className="font-medium">{selectedProject.clientName}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Delivery Date</div>
                        <div className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Dec 18, 2024
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Items Delivered</div>
                        <div className="font-medium text-green-600">18 packages</div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Installation Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 ${selectedTeam.includes(member.id) ? 'border-orange-600 bg-orange-50' : ''
                                    }`}
                                onClick={() => handleToggleMember(member.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTeam.includes(member.id)}
                                            onChange={() => handleToggleMember(member.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div>
                                            <div className="font-medium">{member.name}</div>
                                            <div className="text-sm text-muted-foreground">{member.role}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{member.phone}</div>
                                        </div>
                                    </div>
                                    {getStatusBadge(member.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Message Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="font-medium">Subject: Installation Required - {selectedProject.name} Delivered</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                            {`Installation Team,

Materials for the following project have been delivered to site:

Project: ${selectedProject.name}
Customer: ${selectedProject.clientName}

Delivery Completed: Dec 18, 2024
Total Packages Received: 18
All items verified and in good condition.

Please coordinate with the site contact for installation scheduling.
Tools and team assignment details will follow.

Regards,
Logistics Team - B3 MACBIS`}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Installation */}
            <Card>
                <CardHeader>
                    <CardTitle>Installation Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-medium">Installation Start Date</label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    className="w-full border rounded px-3 py-2"
                                    defaultValue="2024-12-20"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estimated Duration</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    defaultValue="3 days"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action */}
            <div className="flex justify-end">
                {!notificationSent ? (
                    <Button
                        onClick={handleSendNotification}
                        disabled={selectedTeam.length === 0 || submitting}
                        size="lg"
                    >
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Notification & Schedule ({selectedTeam.length} selected)
                    </Button>
                ) : (
                    <Card className="flex-1 border-l-4 border-l-green-500 bg-green-50">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Installation team notified. Phase 7 Complete!</span>
                            </div>
                            <Button onClick={() => router.push('/installation/tool-prep')}>
                                Start Phase 8: Installation <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
