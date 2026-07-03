'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    ArrowRight,
    Package,
    AlertTriangle,
    CheckCircle2,
    ShoppingCart,
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

interface PackingMaterial {
    id: string;
    name: string;
    category: 'Crates' | 'Wrapping' | 'Branding' | 'Protection';
    currentStock: number;
    required: number;
    unit: string;
    status: 'Available' | 'Low Stock' | 'Out of Stock';
}

const mockMaterials: PackingMaterial[] = [
    { id: 'PM-001', name: 'Wooden Crates (Large)', category: 'Crates', currentStock: 45, required: 20, unit: 'pcs', status: 'Available' },
    { id: 'PM-002', name: 'Wrapping Rolls (Bubble)', category: 'Wrapping', currentStock: 8, required: 15, unit: 'rolls', status: 'Low Stock' },
    { id: 'PM-003', name: 'Branding Stickers', category: 'Branding', currentStock: 500, required: 100, unit: 'pcs', status: 'Available' },
    { id: 'PM-004', name: 'Thermocol Sheets', category: 'Protection', currentStock: 0, required: 25, unit: 'sheets', status: 'Out of Stock' },
    { id: 'PM-005', name: 'Wooden Crates (Medium)', category: 'Crates', currentStock: 30, required: 10, unit: 'pcs', status: 'Available' },
    { id: 'PM-006', name: 'Stretch Film', category: 'Wrapping', currentStock: 12, required: 8, unit: 'rolls', status: 'Available' },
];

export default function PackingMaterialsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Materials state
    const [materials, setMaterials] = useState<PackingMaterial[]>([]);
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

    // Load materials when project is selected
    useEffect(() => {
        if (selectedProject) {
            setLoading(true);
            setTimeout(() => {
                setMaterials(mockMaterials);
                setLoading(false);
            }, 300);
        }
    }, [selectedProject]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/packaging/materials?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing packing materials for ${project.name}` });
    };

    const handleRequestPurchase = (id: string, name: string) => {
        toast({
            title: 'Purchase Request Created',
            description: `Purchase request initiated for ${name}`,
        });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const getStatusBadge = (status: PackingMaterial['status']) => {
        switch (status) {
            case 'Available':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />{status}</Badge>;
            case 'Low Stock':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>;
            case 'Out of Stock':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>;
        }
    };

    const availableCount = materials.filter(m => m.status === 'Available').length;
    const lowStockCount = materials.filter(m => m.status === 'Low Stock').length;
    const outOfStockCount = materials.filter(m => m.status === 'Out of Stock').length;

    // Project selection view
    if (!selectedProject) {
        return (
            <div className="w-full py-2 space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8 text-orange-600" />
                        Check Packing Materials
                    </h1>
                    <p className="text-muted-foreground">
                        Select a project to verify packing materials availability.
                    </p>
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
        );
    }

    // Materials view
    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8 text-orange-600" />
                        Check Packing Materials
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedProject(null)}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Change Project
                    </Button>
                    <Button onClick={() => router.push('/packaging/operations')}>
                        Next: Package Products <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading materials...</span>
                </div>
            ) : (
                <>
                    {(lowStockCount > 0 || outOfStockCount > 0) && (
                        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                            <CardContent className="pt-6 flex items-start gap-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                                <div>
                                    <h3 className="font-bold text-yellow-700">Stock Alert</h3>
                                    <p className="text-yellow-600">
                                        {outOfStockCount > 0 && `${outOfStockCount} material(s) out of stock. `}
                                        {lowStockCount > 0 && `${lowStockCount} material(s) running low. `}
                                        Create purchase requests before proceeding to packaging.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Packing Material Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Material ID</th>
                                            <th className="p-4 font-medium">Material Name</th>
                                            <th className="p-4 font-medium">Category</th>
                                            <th className="p-4 font-medium">Current Stock</th>
                                            <th className="p-4 font-medium">Required</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((material) => (
                                            <tr key={material.id} className="border-t hover:bg-muted/50">
                                                <td className="p-4 font-medium">{material.id}</td>
                                                <td className="p-4">{material.name}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{material.category}</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <span className={material.currentStock < material.required ? 'text-red-600 font-bold' : ''}>
                                                        {material.currentStock} {material.unit}
                                                    </span>
                                                </td>
                                                <td className="p-4">{material.required} {material.unit}</td>
                                                <td className="p-4">
                                                    {getStatusBadge(material.status)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {material.status !== 'Available' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleRequestPurchase(material.id, material.name)}
                                                        >
                                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                                            Request
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
