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
    Bell,
    Send,
    Mail,
    MessageSquare,
    CheckCircle2,
    Search,
    FolderKanban,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface NotificationRecipient {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    selected: boolean;
}

export default function TransporterNotificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [recipients, setRecipients] = useState<NotificationRecipient[]>([
        { id: '1', name: 'TCI Express - Dispatch Coordinator', role: 'Transporter', phone: '+91 98765 11111', email: 'dispatch@tciexpress.com', selected: true },
        { id: '2', name: 'Driver: Ramesh Kumar', role: 'Assigned Driver', phone: '+91 98765 22222', email: 'ramesh.driver@tci.com', selected: true },
        { id: '3', name: 'Logistics Manager', role: 'Internal', phone: '+91 98765 33333', email: 'logistics@b3macbis.com', selected: true },
    ]);

    const [notificationSent, setNotificationSent] = useState(false);

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
        toast({ title: 'Project Selected', description: `Viewing transporter notifications for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleRecipient = (id: string) => {
        setRecipients(recipients.map(r =>
            r.id === id ? { ...r, selected: !r.selected } : r
        ));
    };

    const handleSendNotification = () => {
        const selectedCount = recipients.filter(r => r.selected).length;
        setNotificationSent(true);
        toast({
            title: 'Notifications Sent',
            description: `Pickup details sent to ${selectedCount} recipient(s) via SMS and Email`,
        });
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Bell className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Transporter Notification</h1>
                                <p className="text-sm text-gray-600">Select a project to notify transporter</p>
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

    // Main Content View
    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bell className="h-8 w-8 text-orange-600" />
                        7.5 Transporter Notification
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
                        onClick={() => router.push('/logistics/loading')}
                        disabled={!notificationSent}
                    >
                        Next: Loading <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Shipment Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                        <div className="text-sm text-muted-foreground">Order Number</div>
                        <div className="font-medium">ORD-KT-345</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Destination</div>
                        <div className="font-medium">Bangalore, KA</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Pickup Date</div>
                        <div className="font-medium">Dec 18, 2024</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Weight</div>
                        <div className="font-medium">475 kg</div>
                    </div>
                </CardContent>
            </Card>

            {/* Recipients */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Recipients</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recipients.map((recipient) => (
                            <div
                                key={recipient.id}
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 ${recipient.selected ? 'border-orange-600 bg-orange-50' : ''
                                    }`}
                                onClick={() => handleToggleRecipient(recipient.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={recipient.selected}
                                            onChange={() => handleToggleRecipient(recipient.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
                                        />
                                        <div>
                                            <div className="font-medium">{recipient.name}</div>
                                            <Badge variant="outline" className="mt-1">{recipient.role}</Badge>
                                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {recipient.phone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    {recipient.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notification Content Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="font-medium">Subject: Pickup Request - {selectedProject.name}</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                            {`Dear Transporter,

Please arrange pickup for the following shipment:

Project: ${selectedProject.name}
Customer: ${selectedProject.clientName}
Pickup Date: Dec 18, 2024
Pickup Time: 9:00 AM - 11:00 AM

Shipment Details:
- Total Packages: 18
- Total Weight: 475 kg
- Package Type: Wooden Crates & Boxes

Please confirm receipt and provide driver details.

Regards,
Logistics Team - B3 MACBIS`}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                {!notificationSent ? (
                    <Button
                        onClick={handleSendNotification}
                        disabled={recipients.filter(r => r.selected).length === 0}
                        size="lg"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification ({recipients.filter(r => r.selected).length} recipient{recipients.filter(r => r.selected).length !== 1 ? 's' : ''})
                    </Button>
                ) : (
                    <Card className="flex-1 border-l-4 border-l-green-500 bg-green-50">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Notifications sent successfully</span>
                            </div>
                            <Button onClick={() => router.push('/logistics/loading')}>
                                Continue to Loading <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
