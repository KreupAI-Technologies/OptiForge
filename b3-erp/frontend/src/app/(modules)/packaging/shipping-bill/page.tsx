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
    FileText,
    Package,
    Printer,
    Download,
    CheckCircle2,
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

interface ShippingBillItem {
    id: string;
    itemDescription: string;
    quantity: number;
    packageType: string;
    weight: string;
    dimensions: string;
}

interface ShippingBill {
    billNumber: string;
    orderNumber: string;
    customerName: string;
    destination: string;
    items: ShippingBillItem[];
    totalPackages: number;
    totalWeight: string;
    status: 'Draft' | 'Generated' | 'Printed';
}

const mockBills: ShippingBill[] = [
    {
        billNumber: 'SB-2024-001',
        orderNumber: 'ORD-KT-345',
        customerName: 'Pearl Apartments - Tower A',
        destination: 'Bangalore, Karnataka',
        items: [
            { id: '1', itemDescription: 'Modular Kitchen Cabinet Set', quantity: 15, packageType: 'Wooden Crate', weight: '450 kg', dimensions: '200x80x60 cm' },
            { id: '2', itemDescription: 'Kitchen Accessories Kit', quantity: 3, packageType: 'Cardboard Box', weight: '25 kg', dimensions: '50x40x30 cm' },
        ],
        totalPackages: 18,
        totalWeight: '475 kg',
        status: 'Generated'
    },
    {
        billNumber: 'SB-2024-002',
        orderNumber: 'ORD-KT-346',
        customerName: 'Villa Project - Phase 2',
        destination: 'Chennai, Tamil Nadu',
        items: [
            { id: '1', itemDescription: 'Kitchen Base Units', quantity: 20, packageType: 'Wooden Crate', weight: '600 kg', dimensions: '220x90x70 cm' },
        ],
        totalPackages: 20,
        totalWeight: '600 kg',
        status: 'Draft'
    }
];

export default function ShippingBillPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Bills state
    const [bills, setBills] = useState<ShippingBill[]>([]);
    const [selectedBill, setSelectedBill] = useState<ShippingBill | null>(null);
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

    // Load bills when project is selected
    useEffect(() => {
        if (selectedProject) {
            setLoading(true);
            setTimeout(() => {
                setBills(mockBills);
                setSelectedBill(mockBills[0]);
                setLoading(false);
            }, 300);
        }
    }, [selectedProject]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/packaging/shipping-bill?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing shipping bills for ${project.name}` });
    };

    const handleGenerateBill = (billNumber: string) => {
        setBills(bills.map(bill =>
            bill.billNumber === billNumber ? { ...bill, status: 'Generated' } : bill
        ));
        toast({
            title: 'Shipping Bill Generated',
            description: `${billNumber} has been generated successfully`,
        });
    };

    const handlePrintBill = (billNumber: string) => {
        setBills(bills.map(bill =>
            bill.billNumber === billNumber ? { ...bill, status: 'Printed' } : bill
        ));
        toast({
            title: 'Printing Shipping Bill',
            description: `${billNumber} is being sent to printer`,
        });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const getStatusBadge = (status: ShippingBill['status']) => {
        switch (status) {
            case 'Printed':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
            case 'Generated':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Project selection view
    if (!selectedProject) {
        return (
            <div className="w-full py-2 space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-orange-600" />
                        Generate Shipping Bill
                    </h1>
                    <p className="text-muted-foreground">
                        Select a project to create and manage shipping documentation.
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

    // Bills view
    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-orange-600" />
                        Generate Shipping Bill
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
                    <Button onClick={() => router.push('/packaging/staging')}>
                        Next: Dispatch Staging <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading shipping bills...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Bills List */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Shipping Bills</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {bills.map((bill) => (
                                <div
                                    key={bill.billNumber}
                                    className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 ${selectedBill?.billNumber === bill.billNumber ? 'border-orange-600 bg-orange-50' : ''
                                        }`}
                                    onClick={() => setSelectedBill(bill)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium">{bill.billNumber}</div>
                                        {getStatusBadge(bill.status)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {bill.customerName}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {bill.totalPackages} packages • {bill.totalWeight}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Bill Details */}
                    {selectedBill && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Bill Details: {selectedBill.billNumber}</CardTitle>
                                    <div className="flex gap-2">
                                        {selectedBill.status === 'Draft' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleGenerateBill(selectedBill.billNumber)}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Generate
                                            </Button>
                                        )}
                                        {selectedBill.status === 'Generated' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handlePrintBill(selectedBill.billNumber)}
                                            >
                                                <Printer className="h-4 w-4 mr-1" />
                                                Print
                                            </Button>
                                        )}
                                        {selectedBill.status === 'Printed' && (
                                            <Button size="sm" variant="outline">
                                                <Download className="h-4 w-4 mr-1" />
                                                Download PDF
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Header Info */}
                                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Order Number</div>
                                        <div className="font-medium">{selectedBill.orderNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Customer</div>
                                        <div className="font-medium">{selectedBill.customerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Destination</div>
                                        <div className="font-medium">{selectedBill.destination}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Status</div>
                                        <div>{getStatusBadge(selectedBill.status)}</div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                    <h3 className="font-semibold mb-3">Package Items</h3>
                                    <div className="rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="p-3 text-left font-medium">Description</th>
                                                    <th className="p-3 text-left font-medium">Qty</th>
                                                    <th className="p-3 text-left font-medium">Package Type</th>
                                                    <th className="p-3 text-left font-medium">Weight</th>
                                                    <th className="p-3 text-left font-medium">Dimensions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedBill.items.map((item) => (
                                                    <tr key={item.id} className="border-t">
                                                        <td className="p-3">{item.itemDescription}</td>
                                                        <td className="p-3">{item.quantity}</td>
                                                        <td className="p-3">{item.packageType}</td>
                                                        <td className="p-3">{item.weight}</td>
                                                        <td className="p-3">{item.dimensions}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-muted/30 font-medium">
                                                <tr>
                                                    <td className="p-3">Total</td>
                                                    <td className="p-3">{selectedBill.totalPackages}</td>
                                                    <td className="p-3">-</td>
                                                    <td className="p-3">{selectedBill.totalWeight}</td>
                                                    <td className="p-3">-</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
