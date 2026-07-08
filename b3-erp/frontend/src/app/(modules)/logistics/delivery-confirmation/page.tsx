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
    PackageCheck,
    CheckCircle2,
    Camera,
    FileText,
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

interface DeliveryItem {
    id: string;
    packageId: string;
    description: string;
    quantity: number;
    received: boolean;
    condition: 'Good' | 'Damaged' | 'Missing';
    notes: string;
}

export default function DeliveryConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
        { id: '1', packageId: 'PKG-001', description: 'Main Cabinet Units', quantity: 10, received: true, condition: 'Good', notes: '' },
        { id: '2', packageId: 'PKG-002', description: 'Side Panels', quantity: 5, received: true, condition: 'Good', notes: '' },
        { id: '3', packageId: 'PKG-003', description: 'Accessories Kit', quantity: 3, received: false, condition: 'Missing', notes: 'Not received at site' },
    ]);

    const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
    const [signatureUploaded, setSignatureUploaded] = useState(false);
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
        toast({ title: 'Project Selected', description: `Viewing delivery confirmation for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleToggleReceived = (id: string) => {
        setDeliveryItems(deliveryItems.map(item =>
            item.id === id ? {
                ...item,
                received: !item.received,
                condition: !item.received ? 'Good' : 'Missing'
            } : item
        ));
    };

    const handleConditionChange = (id: string, condition: DeliveryItem['condition']) => {
        setDeliveryItems(deliveryItems.map(item =>
            item.id === id ? { ...item, condition } : item
        ));
    };

    const handleUploadSignature = () => {
        setSignatureUploaded(true);
        toast({
            title: 'Signature Uploaded',
            description: 'Customer signature has been captured',
        });
    };

    const handleConfirmDelivery = async () => {
        if (!selectedProject || submitting) return;
        setSubmitting(true);
        try {
            const coordination = await resolveCoordination(selectedProject);
            await LogisticsService.updateDeliveryCoordination(coordination.id, {
                status: 'Ready',
            });
            setDeliveryConfirmed(true);
            toast({
                title: 'Delivery Confirmed',
                description: 'Delivery receipt and unloading sign-off completed',
                variant: 'success',
            });
        } catch (err) {
            console.error('Error confirming delivery:', err);
            toast({
                title: 'Failed to Confirm Delivery',
                description: err instanceof Error ? err.message : 'Could not record delivery confirmation',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getConditionBadge = (condition: DeliveryItem['condition']) => {
        const styles = {
            'Good': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Damaged': 'bg-red-100 text-red-800 hover:bg-red-100',
            'Missing': 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        };
        return <Badge className={styles[condition]}>{condition}</Badge>;
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <PackageCheck className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Delivery Confirmation</h1>
                                <p className="text-sm text-gray-600">Select a project to confirm delivery</p>
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
                        <PackageCheck className="h-8 w-8 text-orange-600" />
                        7.8 Delivery Confirmation
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
                        onClick={() => router.push('/logistics/site-notification')}
                        disabled={!deliveryConfirmed}
                    >
                        Next: Site Notification <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Delivery Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveryItems.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {deliveryItems.filter(i => i.received).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Damaged</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {deliveryItems.filter(i => i.condition === 'Damaged').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Missing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                            {deliveryItems.filter(i => i.condition === 'Missing').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle>Package Receipt Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Package ID</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Qty</th>
                                    <th className="p-4 font-medium">Received</th>
                                    <th className="p-4 font-medium">Condition</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryItems.map((item) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/50">
                                        <td className="p-4 font-medium">{item.packageId}</td>
                                        <td className="p-4">{item.description}</td>
                                        <td className="p-4">{item.quantity}</td>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={item.received}
                                                onChange={() => handleToggleReceived(item.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={item.condition}
                                                onChange={(e) => handleConditionChange(item.id, e.target.value as DeliveryItem['condition'])}
                                                disabled={!item.received}
                                                className="text-sm border rounded px-2 py-1"
                                            >
                                                <option value="Good">Good</option>
                                                <option value="Damaged">Damaged</option>
                                                <option value="Missing">Missing</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button size="sm" variant="ghost">
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Signature & POD */}
            <Card>
                <CardHeader>
                    <CardTitle>Proof of Delivery (POD)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Customer Signature</div>
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                {signatureUploaded ? (
                                    <div className="text-green-600 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Signature Captured
                                    </div>
                                ) : (
                                    <div>
                                        <Button onClick={handleUploadSignature}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Capture Signature
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Delivery Photos</div>
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Button variant="outline">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Upload Photos
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">Site photos for documentation</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation */}
            <div className="flex justify-end">
                {!deliveryConfirmed ? (
                    <Button
                        onClick={handleConfirmDelivery}
                        disabled={!signatureUploaded || deliveryItems.filter(i => i.received).length === 0 || submitting}
                        size="lg"
                    >
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Confirm Delivery & Unloading
                    </Button>
                ) : (
                    <Card className="flex-1 border-l-4 border-l-green-500 bg-green-50">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Delivery confirmed successfully</span>
                            </div>
                            <Button onClick={() => router.push('/logistics/site-notification')}>
                                Notify Installation Team <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
