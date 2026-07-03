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
    FileText,
    Receipt,
    Plus,
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

interface BillingEntry {
    id: string;
    invoiceNumber: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    dueDate: string;
    status: 'Draft' | 'Generated' | 'Sent' | 'Paid';
}

export default function BillingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [billingEntries, setBillingEntries] = useState<BillingEntry[]>([
        { id: '1', invoiceNumber: 'INV-2024-345', orderNumber: 'ORD-KT-345', customerName: 'Pearl Apartments', amount: 450000, taxAmount: 81000, totalAmount: 531000, dueDate: '2024-12-15', status: 'Sent' },
        { id: '2', invoiceNumber: 'INV-2024-346', orderNumber: 'ORD-KT-346', customerName: 'Villa Project', amount: 750000, taxAmount: 135000, totalAmount: 885000, dueDate: '2024-12-20', status: 'Draft' },
        { id: '3', invoiceNumber: 'INV-2024-343', orderNumber: 'ORD-KT-343', customerName: 'Prestige Heights', amount: 320000, taxAmount: 57600, totalAmount: 377600, dueDate: '2024-12-10', status: 'Paid' },
    ]);

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
        toast({ title: 'Project Selected', description: `Viewing billing for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleGenerateInvoice = (id: string) => {
        setBillingEntries(billingEntries.map(entry =>
            entry.id === id ? { ...entry, status: 'Generated' } : entry
        ));
        toast({
            title: 'Invoice Generated',
            description: 'Invoice has been generated successfully',
        });
    };

    const handleSendInvoice = (id: string) => {
        setBillingEntries(billingEntries.map(entry =>
            entry.id === id ? { ...entry, status: 'Sent' } : entry
        ));
        toast({
            title: 'Invoice Sent',
            description: 'Invoice has been sent to accounts team',
        });
    };

    const getStatusBadge = (status: BillingEntry['status']) => {
        const styles = {
            'Paid': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Sent': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            'Generated': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            'Draft': 'bg-gray-100 text-gray-800 hover:bg-gray-100'
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
                                <Receipt className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Billing to Accounts</h1>
                                <p className="text-sm text-gray-600">Select a project to manage billing</p>
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
        <div className="w-full py-2 space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-orange-600" />
                        Billing to Accounts
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button onClick={() => router.push('/logistics/transport-selection')}>
                        Next: Transport Selection <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {billingEntries.filter(e => e.status === 'Draft').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {billingEntries.filter(e => e.status === 'Generated').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {billingEntries.filter(e => e.status === 'Sent').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {billingEntries.filter(e => e.status === 'Paid').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Billing & Invoice Tracking</CardTitle>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            New Invoice
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Invoice #</th>
                                    <th className="p-4 font-medium">Order #</th>
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Tax</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billingEntries.map((entry) => (
                                    <tr key={entry.id} className="border-t hover:bg-muted/50">
                                        <td className="p-4 font-medium">{entry.invoiceNumber}</td>
                                        <td className="p-4">{entry.orderNumber}</td>
                                        <td className="p-4">{entry.customerName}</td>
                                        <td className="p-4">₹{entry.amount.toLocaleString()}</td>
                                        <td className="p-4">₹{entry.taxAmount.toLocaleString()}</td>
                                        <td className="p-4 font-semibold">₹{entry.totalAmount.toLocaleString()}</td>
                                        <td className="p-4">{entry.dueDate}</td>
                                        <td className="p-4">{getStatusBadge(entry.status)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {entry.status === 'Draft' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleGenerateInvoice(entry.id)}
                                                    >
                                                        Generate
                                                    </Button>
                                                )}
                                                {entry.status === 'Generated' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSendInvoice(entry.id)}
                                                    >
                                                        Send to Accounts
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
