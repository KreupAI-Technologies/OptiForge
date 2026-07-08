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
    Truck,
    Ship,
    Plane,
    MapPin,
    IndianRupee,
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

/**
 * Resolve (or create) the DeliveryCoordination record for a project.
 * Coordinations are keyed by woNumber + customerName (no projectId link exists
 * in the backend), so we derive woNumber from the project's code/id and match
 * on woNumber; if none exists we create one.
 */
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

interface TransportOption {
    id: string;
    mode: 'Road' | 'Rail' | 'Air' | 'Sea';
    provider: string;
    estimatedDays: number;
    cost: number;
    capacity: string;
    suitableFor: string;
}

export default function TransportSelectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Page data state
    const [destination] = useState('Bangalore, Karnataka');
    const [distance] = useState('350 km');
    const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const transportOptions: TransportOption[] = [
        { id: '1', mode: 'Road', provider: 'TCI Express', estimatedDays: 2, cost: 15000, capacity: '10 tons', suitableFor: 'Local & Regional' },
        { id: '2', mode: 'Road', provider: 'VRL Logistics', estimatedDays: 3, cost: 12000, capacity: '10 tons', suitableFor: 'Economy Option' },
        { id: '3', mode: 'Rail', provider: 'Indian Railways', estimatedDays: 5, cost: 8000, capacity: '20 tons', suitableFor: 'Bulk Shipment' },
        { id: '4', mode: 'Air', provider: 'Blue Dart', estimatedDays: 1, cost: 45000, capacity: '2 tons', suitableFor: 'Express Delivery' },
    ];

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
        toast({ title: 'Project Selected', description: `Viewing transport options for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleSelectTransport = async (id: string, provider: string) => {
        if (!selectedProject || submitting) return;
        setSubmitting(true);
        const option = transportOptions.find(o => o.id === id);
        try {
            const coordination = await resolveCoordination(selectedProject, {
                transporter: provider,
            });
            await LogisticsService.updateDeliveryCoordination(coordination.id, {
                transporter: provider,
                transportMethod: option?.mode === 'Road' ? 'Own Vehicle' : 'Third Party',
                status: 'Coordinated',
            });
            setSelectedTransport(id);
            toast({
                title: 'Transport Selected',
                description: `${provider} has been assigned to this delivery`,
                variant: 'success',
            });
        } catch (err) {
            console.error('Error selecting transport:', err);
            toast({
                title: 'Failed to Select Transport',
                description: err instanceof Error ? err.message : 'Could not save transport selection',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getModeIcon = (mode: TransportOption['mode']) => {
        switch (mode) {
            case 'Road': return <Truck className="h-5 w-5" />;
            case 'Rail': return <Truck className="h-5 w-5" />;
            case 'Air': return <Plane className="h-5 w-5" />;
            case 'Sea': return <Ship className="h-5 w-5" />;
        }
    };

    const getModeColor = (mode: TransportOption['mode']) => {
        switch (mode) {
            case 'Road': return 'bg-blue-100 text-blue-800';
            case 'Rail': return 'bg-green-100 text-green-800';
            case 'Air': return 'bg-purple-100 text-purple-800';
            case 'Sea': return 'bg-cyan-100 text-cyan-800';
        }
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Truck className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Transport Selection</h1>
                                <p className="text-sm text-gray-600">Select a project to choose transport method</p>
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
        <div className="w-full py-2 space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Truck className="h-8 w-8 text-orange-600" />
                        Transport Selection
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
                        onClick={() => router.push('/logistics/site-location')}
                        disabled={!selectedTransport}
                    >
                        Next: Site Location <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        <div>
                            <div className="font-medium">Delivery Destination</div>
                            <div className="text-blue-600 text-sm">{destination} • {distance} from factory</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {transportOptions.map((option) => (
                    <Card
                        key={option.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${selectedTransport === option.id ? 'border-2 border-orange-600' : ''
                            }`}
                        onClick={() => handleSelectTransport(option.id, option.provider)}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${getModeColor(option.mode)} hover:${getModeColor(option.mode)}`}>
                                            {getModeIcon(option.mode)}
                                            <span className="ml-1">{option.mode}</span>
                                        </Badge>
                                        {selectedTransport === option.id && (
                                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                                Selected
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl">{option.provider}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{option.suitableFor}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">Estimated Time</div>
                                    <div className="font-bold text-lg">{option.estimatedDays} days</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Cost</div>
                                    <div className="font-bold text-lg flex items-center">
                                        <IndianRupee className="h-4 w-4" />
                                        {option.cost.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Capacity</div>
                                    <div className="font-bold text-lg">{option.capacity}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedTransport && (
                <Card className="border-l-4 border-l-green-500 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-green-600">
                            ✓ Transport method selected. Click "Next" to proceed with site location details.
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
