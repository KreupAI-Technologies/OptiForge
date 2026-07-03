'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { exportToCsv } from '@/lib/export';
import { projectManagementService, PmDeliverable } from '@/services/ProjectManagementService';
import {
    Search,
    Plus,
    Package,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    Edit,
    FileText,
    User,
    Upload,
    History,
    CheckSquare,
    Link2,
    ClipboardCheck,
    Users,
    Download,
    GitBranch,
    Network,
} from 'lucide-react';
import {
    CreateDeliverableModal,
    EditDeliverableModal,
    UploadDocumentModal,
    VersionHistoryModal,
    ReviewApprovalModal,
    LinkToTasksModal,
    QualityChecklistModal,
    DeliverableTimelineModal,
    StakeholderSignOffModal,
    DeliverableTemplatesModal,
    ExportDeliverablesModal,
    DeliverableDependenciesModal,
} from '@/components/project-management/DeliverablesModals';

interface Deliverable {
    id: string;
    deliverableNumber: string;
    deliverableName: string;
    projectNumber: string;
    projectName: string;
    type: 'Equipment' | 'Installation' | 'Documentation' | 'Training' | 'Service';
    description: string;
    assignedTo: string;
    plannedDate: string;
    actualDate?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'On Hold';
    progress: number;
    dependencies: string[];
    quantity: number;
    unit: string;
    notes: string;
}

const mockDeliverables: Deliverable[] = [
    {
        id: '1',
        deliverableNumber: 'DEL-001',
        deliverableName: 'Kitchen Equipment Delivery',
        projectNumber: 'PRJ-2024-001',
        projectName: 'Taj Hotel Commercial Kitchen',
        type: 'Equipment',
        description: 'Commercial cooking range, ovens, and refrigeration units',
        assignedTo: 'Logistics Team',
        plannedDate: '2024-02-15',
        actualDate: '2024-02-14',
        status: 'Completed',
        progress: 100,
        dependencies: [],
        quantity: 25,
        unit: 'Units',
        notes: 'All equipment delivered in good condition',
    },
    {
        id: '2',
        deliverableNumber: 'DEL-002',
        deliverableName: 'Site Preparation & Civil Work',
        projectNumber: 'PRJ-2024-001',
        projectName: 'Taj Hotel Commercial Kitchen',
        type: 'Installation',
        description: 'Floor reinforcement, drainage, and electrical infrastructure',
        assignedTo: 'Civil Team',
        plannedDate: '2024-03-01',
        actualDate: '2024-03-03',
        status: 'Completed',
        progress: 100,
        dependencies: ['DEL-001'],
        quantity: 1,
        unit: 'Phase',
        notes: 'Minor delays due to weather',
    },
    {
        id: '3',
        deliverableNumber: 'DEL-003',
        deliverableName: 'Equipment Installation',
        projectNumber: 'PRJ-2024-001',
        projectName: 'Taj Hotel Commercial Kitchen',
        type: 'Installation',
        description: 'Installation of cooking equipment, exhaust systems, and refrigeration',
        assignedTo: 'Rajesh Kumar',
        plannedDate: '2024-03-20',
        status: 'In Progress',
        progress: 65,
        dependencies: ['DEL-002'],
        quantity: 25,
        unit: 'Units',
        notes: 'Refrigeration pending',
    },
    {
        id: '4',
        deliverableNumber: 'DEL-004',
        deliverableName: 'Cold Room Panel Assembly',
        projectNumber: 'PRJ-2024-002',
        projectName: 'BigBasket Cold Storage',
        type: 'Installation',
        description: 'Assembly of insulated panels and door systems',
        assignedTo: 'Priya Sharma',
        plannedDate: '2024-03-10',
        status: 'In Progress',
        progress: 45,
        dependencies: ['DEL-005'],
        quantity: 120,
        unit: 'Panels',
        notes: 'On track',
    },
    {
        id: '5',
        deliverableNumber: 'DEL-005',
        deliverableName: 'Cold Room Materials Procurement',
        projectNumber: 'PRJ-2024-002',
        projectName: 'BigBasket Cold Storage',
        type: 'Equipment',
        description: 'Insulated panels, refrigeration units, and control systems',
        assignedTo: 'Procurement Team',
        plannedDate: '2024-02-20',
        actualDate: '2024-02-18',
        status: 'Completed',
        progress: 100,
        dependencies: [],
        quantity: 150,
        unit: 'Items',
        notes: 'All materials received',
    },
    {
        id: '6',
        deliverableNumber: 'DEL-006',
        deliverableName: 'Switchgear Testing Documentation',
        projectNumber: 'PRJ-2024-003',
        projectName: 'L&T Switchgear Panel',
        type: 'Documentation',
        description: 'Complete testing reports, FAT certificates, and compliance documents',
        assignedTo: 'QA Team',
        plannedDate: '2024-03-15',
        status: 'Delayed',
        progress: 75,
        dependencies: ['DEL-007'],
        quantity: 1,
        unit: 'Set',
        notes: 'Waiting for final test results',
    },
    {
        id: '7',
        deliverableNumber: 'DEL-007',
        deliverableName: 'Switchgear Manufacturing',
        projectNumber: 'PRJ-2024-003',
        projectName: 'L&T Switchgear Panel',
        type: 'Equipment',
        description: 'Manufacturing of HT switchgear panels',
        assignedTo: 'Production Team',
        plannedDate: '2024-02-28',
        actualDate: '2024-03-05',
        status: 'Completed',
        progress: 100,
        dependencies: [],
        quantity: 8,
        unit: 'Panels',
        notes: 'Manufacturing completed with minor delays',
    },
    {
        id: '8',
        deliverableNumber: 'DEL-008',
        deliverableName: 'Staff Training Program',
        projectNumber: 'PRJ-2024-001',
        projectName: 'Taj Hotel Commercial Kitchen',
        type: 'Training',
        description: 'Training hotel staff on equipment operation and maintenance',
        assignedTo: 'Training Team',
        plannedDate: '2024-04-15',
        status: 'Not Started',
        progress: 0,
        dependencies: ['DEL-003'],
        quantity: 15,
        unit: 'Staff',
        notes: 'Scheduled after installation completion',
    },
    {
        id: '9',
        deliverableNumber: 'DEL-009',
        deliverableName: 'Design & Drawings Approval',
        projectNumber: 'PRJ-2024-004',
        projectName: 'ITC Grand Kitchen Renovation',
        type: 'Documentation',
        description: 'Detailed engineering drawings and layout plans',
        assignedTo: 'Design Team',
        plannedDate: '2024-03-10',
        status: 'In Progress',
        progress: 80,
        dependencies: [],
        quantity: 1,
        unit: 'Set',
        notes: 'Client review pending',
    },
    {
        id: '10',
        deliverableNumber: 'DEL-010',
        deliverableName: 'Commissioning & Handover',
        projectNumber: 'PRJ-2024-005',
        projectName: 'Godrej Cold Room',
        type: 'Service',
        description: 'Final commissioning, testing, and project handover',
        assignedTo: 'Commissioning Team',
        plannedDate: '2024-05-25',
        status: 'Not Started',
        progress: 0,
        dependencies: ['DEL-011'],
        quantity: 1,
        unit: 'Project',
        notes: 'Pending installation completion',
    },
];

export default function DeliverablesListPage() {
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listDeliverables();
                if (!mounted) return;
                const mapped: Deliverable[] = (Array.isArray(rows) ? rows : []).map((r: PmDeliverable) => ({
                    id: r.id,
                    deliverableNumber: r.deliverableNumber ?? '',
                    deliverableName: r.deliverableName ?? '',
                    projectNumber: r.projectNumber ?? '',
                    projectName: r.projectName ?? '',
                    type: (r.type as Deliverable['type']) ?? 'Documentation',
                    description: r.description ?? '',
                    assignedTo: r.assignedTo ?? '',
                    plannedDate: r.plannedDate ?? '',
                    actualDate: r.actualDate,
                    status: (r.status as Deliverable['status']) ?? 'Not Started',
                    progress: Number(r.progress ?? 0),
                    dependencies: Array.isArray(r.dependencies) ? r.dependencies : [],
                    quantity: Number(r.quantity ?? 0),
                    unit: r.unit ?? '',
                    notes: r.notes ?? '',
                }));
                // Fall back to sample data when the backend has no rows yet.
                setDeliverables(mapped.length > 0 ? mapped : mockDeliverables);
            } catch (e) {
                if (!mounted) return;
                setError('Failed to load deliverables');
                setDeliverables(mockDeliverables);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [showCreateDeliverable, setShowCreateDeliverable] = useState(false);
    const [showEditDeliverable, setShowEditDeliverable] = useState(false);
    const [showUploadDocument, setShowUploadDocument] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showReviewApproval, setShowReviewApproval] = useState(false);
    const [showLinkToTasks, setShowLinkToTasks] = useState(false);
    const [showQualityChecklist, setShowQualityChecklist] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showStakeholderSignOff, setShowStakeholderSignOff] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showDependencies, setShowDependencies] = useState(false);
    const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

    // Calculate statistics
    const stats = {
        total: deliverables.length,
        completed: deliverables.filter(d => d.status === 'Completed').length,
        inProgress: deliverables.filter(d => d.status === 'In Progress').length,
        delayed: deliverables.filter(d => d.status === 'Delayed').length,
        notStarted: deliverables.filter(d => d.status === 'Not Started').length,
    };

    // Filter deliverables
    const filteredDeliverables = deliverables.filter(deliverable => {
        const matchesSearch =
            deliverable.deliverableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deliverable.deliverableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deliverable.projectName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || deliverable.status === statusFilter;
        const matchesType = typeFilter === 'All' || deliverable.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDeliverables.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDeliverables = filteredDeliverables.slice(startIndex, startIndex + itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Delayed': return 'bg-red-100 text-red-700';
            case 'On Hold': return 'bg-yellow-100 text-yellow-700';
            case 'Not Started': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'In Progress': return <Clock className="w-4 h-4" />;
            case 'Delayed': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Modal handlers
    const handleCreateDeliverable = (deliverable: any) => {
        console.log('Creating deliverable:', deliverable);
        setShowCreateDeliverable(false);
    };

    const handleEditDeliverable = (deliverable: any) => {
        console.log('Editing deliverable:', deliverable);
        setShowEditDeliverable(false);
        setSelectedDeliverable(null);
    };

    const handleUploadDocument = (document: any) => {
        console.log('Uploading document:', document);
        setShowUploadDocument(false);
        setSelectedDeliverable(null);
    };

    const handleReviewApproval = (decision: string, comments: string) => {
        console.log('Review decision:', decision, comments);
        setShowReviewApproval(false);
        setSelectedDeliverable(null);
    };

    const handleLinkToTasks = (tasks: string[]) => {
        console.log('Linking tasks:', tasks);
        setShowLinkToTasks(false);
        setSelectedDeliverable(null);
    };

    const handleQualityChecklist = (checklist: any) => {
        console.log('Quality checklist:', checklist);
        setShowQualityChecklist(false);
        setSelectedDeliverable(null);
    };

    const handleStakeholderSignOff = (signOff: any) => {
        console.log('Stakeholder sign-off:', signOff);
        setShowStakeholderSignOff(false);
        setSelectedDeliverable(null);
    };

    const handleApplyTemplate = (template: any) => {
        console.log('Applying template:', template);
        setShowTemplates(false);
    };

    const handleExport = (format: string) => {
        exportToCsv('deliverables', filteredDeliverables as unknown as Record<string, unknown>[]);
        setShowExport(false);
    };

    const handleDependencies = (dependencies: any) => {
        console.log('Managing dependencies:', dependencies);
        setShowDependencies(false);
        setSelectedDeliverable(null);
    };

    const openEditModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowEditDeliverable(true);
    };

    const openUploadModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowUploadDocument(true);
    };

    const openReviewModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowReviewApproval(true);
    };

    const openLinkTasksModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowLinkToTasks(true);
    };

    const openQualityModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowQualityChecklist(true);
    };

    const openTimelineModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowTimeline(true);
    };

    const openVersionHistoryModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowVersionHistory(true);
    };

    const openDependenciesModal = (deliverable: Deliverable) => {
        setSelectedDeliverable(deliverable);
        setShowDependencies(true);
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
            <div className="px-3 py-2 space-y-3">
                {loading && (
                    <div className="text-sm text-gray-500">Loading deliverables…</div>
                )}
                {error && (
                    <div className="text-sm text-red-600">{error} — showing sample data.</div>
                )}
                {/* Header Actions */}
                <div className="flex justify-between mb-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FileText className="w-5 h-5" />
                            Templates
                        </button>
                        <button
                            onClick={() => setShowExport(true)}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Export
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCreateDeliverable(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Deliverable
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Delayed</p>
                                <p className="text-2xl font-bold text-red-900 mt-1">{stats.delayed}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Not Started</p>
                                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.notStarted}</p>
                            </div>
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search deliverables..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="All">All Status</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                            <option value="On Hold">On Hold</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="All">All Types</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Installation">Installation</option>
                            <option value="Documentation">Documentation</option>
                            <option value="Training">Training</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                </div>

                {/* Deliverables List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {paginatedDeliverables.map((deliverable) => (
                            <div key={deliverable.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1">
                                        {/* Icon */}
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-6 h-6 text-blue-600" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {deliverable.deliverableName}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                                                    {getStatusIcon(deliverable.status)}
                                                    {deliverable.status}
                                                </span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {deliverable.type}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{deliverable.description}</p>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">Deliverable #</p>
                                                    <p className="text-sm font-medium text-gray-900">{deliverable.deliverableNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Project</p>
                                                    <p className="text-sm font-medium text-gray-900">{deliverable.projectNumber}</p>
                                                    <p className="text-xs text-gray-500">{deliverable.projectName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Assigned To</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <p className="text-sm font-medium text-gray-900">{deliverable.assignedTo}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {deliverable.quantity} {deliverable.unit}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-600">Progress</span>
                                                    <span className="text-xs font-medium text-gray-900">{deliverable.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${deliverable.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Timeline */}
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">Planned:</span>
                                                    <span className="font-medium text-gray-900">{formatDate(deliverable.plannedDate)}</span>
                                                </div>
                                                {deliverable.actualDate && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-gray-600">Actual:</span>
                                                        <span className="font-medium text-green-900">{formatDate(deliverable.actualDate)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dependencies */}
                                            {deliverable.dependencies.length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">Dependencies: </span>
                                                    <span className="text-xs text-blue-600">{deliverable.dependencies.join(', ')}</span>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {deliverable.notes && (
                                                <div className="mt-2 text-sm text-gray-600 italic">
                                                    Note: {deliverable.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openTimelineModal(deliverable)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Timeline"
                                            >
                                                <GitBranch className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(deliverable)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit Deliverable"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openUploadModal(deliverable)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Upload Document"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openVersionHistoryModal(deliverable)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Version History"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openReviewModal(deliverable)}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Review & Approval"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openLinkTasksModal(deliverable)}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Link to Tasks"
                                            >
                                                <Link2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openQualityModal(deliverable)}
                                                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                                title="Quality Checklist"
                                            >
                                                <ClipboardCheck className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDependenciesModal(deliverable)}
                                                className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                title="Dependencies"
                                            >
                                                <Network className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDeliverables.length)} of{' '}
                            {filteredDeliverables.length} deliverables
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <CreateDeliverableModal
                    isOpen={showCreateDeliverable}
                    onClose={() => setShowCreateDeliverable(false)}
                    onCreate={handleCreateDeliverable}
                />

                {selectedDeliverable && (
                    <>
                        <EditDeliverableModal
                            isOpen={showEditDeliverable}
                            onClose={() => {
                                setShowEditDeliverable(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onSave={handleEditDeliverable}
                        />

                        <UploadDocumentModal
                            isOpen={showUploadDocument}
                            onClose={() => {
                                setShowUploadDocument(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onUpload={handleUploadDocument}
                        />

                        <VersionHistoryModal
                            isOpen={showVersionHistory}
                            onClose={() => {
                                setShowVersionHistory(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                        />

                        <ReviewApprovalModal
                            isOpen={showReviewApproval}
                            onClose={() => {
                                setShowReviewApproval(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onSubmit={handleReviewApproval}
                        />

                        <LinkToTasksModal
                            isOpen={showLinkToTasks}
                            onClose={() => {
                                setShowLinkToTasks(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onLink={handleLinkToTasks}
                        />

                        <QualityChecklistModal
                            isOpen={showQualityChecklist}
                            onClose={() => {
                                setShowQualityChecklist(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onSave={handleQualityChecklist}
                        />

                        <DeliverableTimelineModal
                            isOpen={showTimeline}
                            onClose={() => {
                                setShowTimeline(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                        />

                        <StakeholderSignOffModal
                            isOpen={showStakeholderSignOff}
                            onClose={() => {
                                setShowStakeholderSignOff(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onSubmit={handleStakeholderSignOff}
                        />

                        <DeliverableDependenciesModal
                            isOpen={showDependencies}
                            onClose={() => {
                                setShowDependencies(false);
                                setSelectedDeliverable(null);
                            }}
                            deliverable={selectedDeliverable}
                            onSave={handleDependencies}
                        />
                    </>
                )}

                <DeliverableTemplatesModal
                    isOpen={showTemplates}
                    onClose={() => setShowTemplates(false)}
                    onApply={handleApplyTemplate}
                />

                <ExportDeliverablesModal
                    isOpen={showExport}
                    onClose={() => setShowExport(false)}
                    deliverables={filteredDeliverables}
                    onExport={handleExport}
                />
            </div>
        </div>
    );
}
