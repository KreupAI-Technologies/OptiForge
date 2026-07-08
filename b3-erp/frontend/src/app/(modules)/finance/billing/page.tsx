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
import { FinanceService } from '@/services/finance.service';
import { InvoiceService } from '@/services/invoice.service';

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

// Map backend invoice status -> the coarse billing lifecycle used on this page
const mapInvoiceStatus = (raw: string): BillingEntry['status'] => {
    const s = String(raw || '').toUpperCase();
    if (s === 'PAID') return 'Paid';
    if (s === 'DRAFT') return 'Draft';
    if (s === 'PENDING_APPROVAL' || s === 'PENDING') return 'Generated';
    return 'Sent';
};

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
    const [billingEntries, setBillingEntries] = useState<BillingEntry[]>([]);
    const [isLoadingBilling, setIsLoadingBilling] = useState(true);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
        loadBillingEntries();
    }, []);

    const loadBillingEntries = async () => {
        setIsLoadingBilling(true);
        try {
            const raw = await FinanceService.getInvoices();
            setBillingError(null);
            setBillingEntries(
                (Array.isArray(raw) ? raw : []).map((inv: any, i: number) => {
                    const amount = Number(inv.subtotal ?? inv.amount ?? 0);
                    const taxAmount = Number(inv.totalTax ?? inv.taxAmount ?? 0);
                    return {
                        id: String(inv.id ?? i + 1),
                        invoiceNumber: String(inv.invoiceNumber ?? ''),
                        orderNumber: String(inv.poNumber ?? inv.orderNumber ?? inv.reference ?? ''),
                        customerName: String(inv.customerName ?? inv.customer ?? ''),
                        amount,
                        taxAmount,
                        totalAmount: Number(inv.totalAmount ?? inv.total ?? amount + taxAmount),
                        dueDate: String(inv.dueDate ?? '').slice(0, 10),
                        status: mapInvoiceStatus(inv.status),
                    };
                })
            );
        } catch (error: any) {
            console.error('Error loading billing entries:', error);
            setBillingError(error?.message || 'Failed to load billing entries');
            setBillingEntries([]);
        } finally {
            setIsLoadingBilling(false);
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

    const handleGenerateInvoice = async (id: string) => {
        setActionId(id);
        try {
            await InvoiceService.submitInvoice(id);
            toast({
                title: 'Invoice Generated',
                description: 'Invoice has been submitted successfully',
            });
            await loadBillingEntries();
        } catch (error: any) {
            toast({
                title: 'Generate Failed',
                description: error?.message || 'Could not generate invoice',
                variant: 'destructive',
            });
        } finally {
            setActionId(null);
        }
    };

    const handleSendInvoice = async (id: string) => {
        setActionId(id);
        try {
            await InvoiceService.approveInvoice(id);
            toast({
                title: 'Invoice Sent',
                description: 'Invoice has been sent to accounts team',
            });
            await loadBillingEntries();
        } catch (error: any) {
            toast({
                title: 'Send Failed',
                description: error?.message || 'Could not send invoice',
                variant: 'destructive',
            });
        } finally {
            setActionId(null);
        }
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
                        <Button size="sm" onClick={() => router.push('/finance/invoices/add')}>
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
                                {isLoadingBilling && (
                                    <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading invoices...
                                    </td></tr>
                                )}
                                {!isLoadingBilling && billingError && (
                                    <tr><td colSpan={9} className="p-8 text-center text-red-600">{billingError}</td></tr>
                                )}
                                {!isLoadingBilling && !billingError && billingEntries.length === 0 && (
                                    <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No billing entries found.</td></tr>
                                )}
                                {!isLoadingBilling && !billingError && billingEntries.map((entry) => (
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
                                                        disabled={actionId === entry.id}
                                                        onClick={() => handleGenerateInvoice(entry.id)}
                                                    >
                                                        {actionId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                                                    </Button>
                                                )}
                                                {entry.status === 'Generated' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={actionId === entry.id}
                                                        onClick={() => handleSendInvoice(entry.id)}
                                                    >
                                                        {actionId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send to Accounts'}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => router.push(`/finance/invoices/view/${entry.id}`)}
                                                >
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
