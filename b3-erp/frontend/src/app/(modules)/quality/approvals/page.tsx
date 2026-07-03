'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    ArrowLeft,
    FileText,
    Award,
    FolderKanban,
    Search,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { inspectionService as InspectionService } from '@/services/inspection.service';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface QCApproval {
    id: string;
    woNumber: string;
    productName: string;
    inspectionId: string;
    inspector: string;
    inspectionDate: string;
    status: 'Pending Approval' | 'Approved' | 'Rejected';
    manager: string;
    approvalDate?: string;
    certificateNumber?: string;
    remarks?: string;
}

// Map a raw inspection status/result into the page's QCApproval status.
const toApprovalStatus = (insp: any): QCApproval['status'] => {
    const status = String(insp?.status ?? '').toLowerCase();
    const result = String(insp?.overallResult ?? insp?.result ?? '').toLowerCase();
    if (insp?.approvedBy || insp?.approvedAt || status === 'approved' || status === 'closed') {
        return 'Approved';
    }
    if (status === 'rejected' || status === 'failed' || result === 'fail' || result === 'failed' || result === 'rejected') {
        return 'Rejected';
    }
    return 'Pending Approval';
};

const toDateString = (value: any): string | undefined => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toISOString().split('T')[0];
};

export default function QCApprovalsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');

    // Approvals state
    const [approvals, setApprovals] = useState<QCApproval[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
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

    // Load approvals when project is selected
    useEffect(() => {
        if (!selectedProject) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                // Backend returns raw Inspection ORM shape; map each inspection to
                // the page's QCApproval model (an approval gate per inspection).
                const raw = (await InspectionService.getAllInspections()) as any[];
                const list = Array.isArray(raw) ? raw : [];
                const mapped: QCApproval[] = list.map((insp: any, idx: number) => ({
                    id: String(insp?.id ?? insp?.inspectionNumber ?? idx),
                    woNumber: insp?.workOrderNumber ?? insp?.workOrderId ?? '-',
                    productName: insp?.productName ?? insp?.productCode ?? 'Unknown Product',
                    inspectionId: insp?.inspectionNumber ?? String(insp?.id ?? ''),
                    inspector: insp?.inspectorName ?? insp?.inspectorId ?? 'Unassigned',
                    inspectionDate:
                        toDateString(insp?.completedAt ?? insp?.scheduledDate ?? insp?.startedAt) ?? '-',
                    status: toApprovalStatus(insp),
                    manager: insp?.reviewerName ?? insp?.approvedBy ?? insp?.reviewerId ?? 'Unassigned',
                    approvalDate: toDateString(insp?.approvedAt),
                    certificateNumber: insp?.certificateNumber ?? undefined,
                    remarks: insp?.notes ?? undefined,
                }));
                if (!cancelled) setApprovals(mapped);
            } catch (error) {
                console.error('Failed to load QC approvals:', error);
                if (!cancelled) {
                    setApprovals([]);
                    toast({ title: 'Error', description: 'Failed to load QC approvals', variant: 'destructive' });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [selectedProject, toast]);

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        router.push(`/quality/approvals?projectId=${project.id}`);
        toast({ title: 'Project Selected', description: `Viewing QC approvals for ${project.name}` });
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredApprovals = approvals.filter((approval) => {
        return filterStatus === 'all' || approval.status === filterStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Pending Approval':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: approvals.length,
        approved: approvals.filter((a) => a.status === 'Approved').length,
        rejected: approvals.filter((a) => a.status === 'Rejected').length,
        pending: approvals.filter((a) => a.status === 'Pending Approval').length,
    };

    // Project selection view
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-3 py-2 space-y-3">
                    {/* Header */}
                    <div className="bg-white rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">QC Approval Gate</h1>
                                <p className="text-sm text-gray-600 mt-1">Select a project to view QC approvals</p>
                            </div>
                        </div>
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
            </div>
        );
    }

    // Approvals view
    return (
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">QC Approval Gate</h1>
                            <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
                        </div>
                        <Button variant="outline" onClick={() => setSelectedProject(null)}>
                            <FolderKanban className="w-4 h-4 mr-2" />
                            Change Project
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading approvals...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Approvals</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-gray-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600">Approved</p>
                                        <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-600">Rejected</p>
                                        <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-600" />
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

                        {/* Filters */}
                        <div className="bg-white rounded-lg border p-3">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                                <option value="all">All Status</option>
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Approvals List */}
                        <div className="grid gap-2">
                            {filteredApprovals.map((approval) => (
                                <div key={approval.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                                    <div className="flex items-start gap-2">
                                        <div className={`w-16 h-16 rounded-lg ${approval.status === 'Approved' ? 'bg-green-500' : approval.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                                            {approval.status === 'Approved' ? <Award className="w-8 h-8 text-white" /> : <FileText className="w-8 h-8 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold">{approval.productName}</h3>
                                                    <p className="text-sm text-gray-600">{approval.woNumber} - {approval.inspectionId}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(approval.status)}`}>
                                                    {approval.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Inspector</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {approval.inspector}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Inspection Date</p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {approval.inspectionDate}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Manager</p>
                                                    <p className="font-medium">{approval.manager}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Certificate</p>
                                                    <p className="font-medium">{approval.certificateNumber || <span className="text-gray-500">N/A</span>}</p>
                                                </div>
                                            </div>
                                            {approval.remarks && (
                                                <div className={`border rounded p-2 text-sm ${approval.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <strong>Remarks:</strong> {approval.remarks}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredApprovals.length === 0 && (
                                <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                                    No QC approvals found for this project.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
