'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    ArrowLeft,
    FileText,
    AlertTriangle,
    Search,
    FolderKanban,
    Building2,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { PaymentService } from '@/services/payment.service';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface PaymentVerification {
    id: string;
    woNumber: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Credit Approved' | 'Override';
    paymentMethod?: string;
    receiptNumber?: string;
    creditApproval?: {
        approvedBy: string;
        approvalDate: string;
        creditLimit: number;
    };
    status: 'Verified' | 'Pending Verification' | 'Rejected' | 'Sales Notified';
    verifiedBy?: string;
    verificationDate?: string;
    notes?: string;
}

export default function PaymentVerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [actionId, setActionId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
        loadVerifications();
    }, []);

    const loadVerifications = async () => {
        try {
            const rows = await PaymentService.getVerificationQueue();
            setLoadError(null);
            setVerifications(
                (rows || []).map((r) => ({
                    id: r.id,
                    woNumber: r.woNumber,
                    customerName: r.customerName,
                    totalAmount: r.totalAmount,
                    paidAmount: r.paidAmount,
                    paymentStatus: r.paymentStatus as PaymentVerification['paymentStatus'],
                    paymentMethod: r.paymentMethod,
                    receiptNumber: r.receiptNumber,
                    status: r.status as PaymentVerification['status'],
                    verifiedBy: r.verifiedBy,
                    verificationDate: r.verificationDate,
                    notes: r.notes,
                }))
            );
        } catch (error: any) {
            console.error('Error loading verifications:', error);
            setLoadError(error?.message || 'Failed to load payment verification queue');
            setVerifications([]);
        }
    };

    const handleVerify = async (id: string) => {
        setActionId(id);
        try {
            await PaymentService.approvePayment(id);
            toast({ title: 'Payment Verified', description: 'Payment has been verified and approved.' });
            await loadVerifications();
        } catch (error: any) {
            toast({ title: 'Verification Failed', description: error?.message || 'Could not verify payment', variant: 'destructive' });
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = typeof window !== 'undefined' ? window.prompt('Reason for rejecting / marking this payment as bounced:') : '';
        if (reason === null) return;
        setActionId(id);
        try {
            await PaymentService.markBounced(id, reason || undefined);
            toast({ title: 'Payment Rejected', description: 'Payment has been marked as bounced.' });
            await loadVerifications();
        } catch (error: any) {
            toast({ title: 'Rejection Failed', description: error?.message || 'Could not reject payment', variant: 'destructive' });
        } finally {
            setActionId(null);
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
        toast({ title: 'Project Selected', description: `Viewing payment verifications for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredVerifications = verifications.filter(
        (ver) => filterStatus === 'all' || ver.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Sales Notified':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Pending Verification':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Paid':
            case 'Credit Approved':
                return 'bg-green-100 text-green-800';
            case 'Partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'Pending':
                return 'bg-red-100 text-red-800';
            case 'Override':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const stats = {
        total: verifications.length,
        verified: verifications.filter((v) => v.status === 'Verified').length,
        pending: verifications.filter((v) => v.status === 'Pending Verification' || v.status === 'Sales Notified').length,
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Payment Verification Gate</h1>
                                <p className="text-sm text-gray-600">Select a project to view payment verifications</p>
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban className="h-5 w-5 text-blue-600" />
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
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Select Project</Button>
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
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Payment Verification Gate</h1>
                                <p className="text-sm text-gray-600">{selectedProject.name} • {selectedProject.clientName}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleChangeProject}>Change Project</Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Verified</p>
                                <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
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
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Sales Notified">Sales Notified</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Verifications List */}
                <div className="grid gap-2">
                    {filteredVerifications.map((ver) => {
                        const paymentPercentage = (ver.paidAmount / ver.totalAmount) * 100;

                        return (
                            <div key={ver.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                <div className="flex items-start gap-2">
                                    <div className={`w-16 h-16 rounded-lg ${ver.status === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                                        <DollarSign className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold">{ver.customerName}</h3>
                                                <p className="text-sm text-gray-600">{ver.woNumber}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(ver.paymentStatus)}`}>
                                                    {ver.paymentStatus}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ver.status)}`}>
                                                    {ver.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Total Amount</p>
                                                <p className="font-bold text-gray-900">₹{ver.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Paid Amount</p>
                                                <p className="font-bold text-green-600">₹{ver.paidAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Payment Method</p>
                                                <p className="font-medium">{ver.paymentMethod || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Receipt Number</p>
                                                <p className="font-medium">{ver.receiptNumber || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Payment Progress */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    Payment: ₹{ver.paidAmount.toLocaleString()} / ₹{ver.totalAmount.toLocaleString()} ({paymentPercentage.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${paymentPercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${paymentPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Credit Approval */}
                                        {ver.creditApproval && (
                                            <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                                                <p className="text-xs font-semibold text-purple-900 mb-1">Credit Approval</p>
                                                <div className="grid grid-cols-3 gap-2 text-xs text-purple-800">
                                                    <span>Approved by: {ver.creditApproval.approvedBy}</span>
                                                    <span>Date: {ver.creditApproval.approvalDate}</span>
                                                    <span>Credit Limit: ₹{ver.creditApproval.creditLimit.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Verification Info */}
                                        {ver.verifiedBy && (
                                            <div className="bg-green-50 border border-green-200 rounded p-2 text-sm mb-2">
                                                <span className="font-medium text-green-800">
                                                    Verified by {ver.verifiedBy} on {ver.verificationDate}
                                                </span>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {ver.notes && (
                                            <div className={`border rounded p-2 text-sm ${ver.status === 'Verified' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                                                <strong>Note:</strong> {ver.notes}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {(ver.status === 'Pending Verification' || ver.status === 'Sales Notified') && (
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={actionId === ver.id}
                                                    onClick={() => handleVerify(ver.id)}
                                                >
                                                    {actionId === ver.id ? (
                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                    )}
                                                    Verify
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                                    disabled={actionId === ver.id}
                                                    onClick={() => handleReject(ver.id)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject / Bounced
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {loadError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {loadError}
                        </div>
                    )}

                    {!loadError && filteredVerifications.length === 0 && (
                        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                            No payment verifications found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
