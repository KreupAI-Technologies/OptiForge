'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { exportToCsv } from '@/lib/export';
import {
    Search,
    Filter,
    Plus,
    FolderKanban,
    Calendar,
    Users,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
    Eye,
    Edit,
    MoreVertical,
    Package,
    MapPin,
    Download,
    Copy,
    Archive,
    UserPlus,
    StickyNote,
    BarChart3,
} from 'lucide-react';
import { useProjectContext } from '@/context/ProjectContext';
import {
    AdvancedFilterModal,
    BulkUpdateModal,
    CloneProjectModal,
    QuickViewModal,
    AssignManagerModal,
    ExportProjectsModal,
    ArchiveProjectModal,
    ProjectTimelineModal,
    TeamMembersModal,
    QuickNotesModal,
} from '@/components/project-management/ProjectListModals';
import { ProjectRoadmapModal } from '@/components/project-management/ProjectRoadmapModal';
import { WorkflowQuickActions } from '@/components/project-management/WorkflowQuickActions';
import { projectManagementService, Project as ServiceProject } from '@/services/ProjectManagementService';
import { DocumentControlWidget } from '@/components/project-management/DocumentControlWidget';

interface Project {
    id: string;
    projectNumber: string;
    projectName: string;
    projectType: 'Commercial Kitchen' | 'Cold Room' | 'Switchgear' | 'HVAC System' | 'Modular Kitchen';
    customer: string;
    location: string;
    salesOrderNumber: string;
    projectManager: string;
    startDate: string;
    endDate: string;
    actualEndDate?: string;
    status: 'Planning' | 'In Progress' | 'On Hold' | 'Delayed' | 'Completed' | 'Cancelled';
    progress: number;
    budget: number;
    actualCost: number;
    phase: string;
    priority: 'P1' | 'P2' | 'P3';
    awardDate: string;
    clientContactPerson?: string;
    clientContactEmail?: string;
    handoverStatus?: 'pending' | 'approved' | 'rejected' | 'n/a';
    team: number;
    deliverables: number;
    completedDeliverables: number;
}

const mockProjects: Project[] = [
    {
        id: '1',
        projectNumber: 'PRJ-2024-001',
        projectName: 'Taj Hotel Commercial Kitchen Installation',
        projectType: 'Commercial Kitchen',
        customer: 'Taj Hotels Limited',
        location: 'Mumbai, Maharashtra',
        salesOrderNumber: 'SO-2024-456',
        projectManager: 'Rajesh Kumar',
        startDate: '2024-01-15',
        endDate: '2024-04-30',
        status: 'In Progress',
        progress: 65,
        budget: 8500000,
        actualCost: 5200000,
        phase: 'Installation',
        priority: 'P1',
        awardDate: '2024-01-05',
        team: 12,
        deliverables: 8,
        completedDeliverables: 5,
    },
    {
        id: '2',
        projectNumber: 'PRJ-2024-002',
        projectName: 'BigBasket Cold Storage Facility',
        projectType: 'Cold Room',
        customer: 'BigBasket Pvt Ltd',
        location: 'Bangalore, Karnataka',
        salesOrderNumber: 'SO-2024-478',
        projectManager: 'Priya Sharma',
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        status: 'In Progress',
        progress: 45,
        budget: 12000000,
        actualCost: 4800000,
        phase: 'Civil Work',
        priority: 'P1',
        team: 18,
        deliverables: 12,
        completedDeliverables: 4,
    },
    {
        id: '3',
        projectNumber: 'PRJ-2024-003',
        projectName: 'L&T Switchgear Panel Manufacturing',
        projectType: 'Switchgear',
        customer: 'Larsen & Toubro Limited',
        location: 'Pune, Maharashtra',
        salesOrderNumber: 'SO-2024-489',
        projectManager: 'Amit Patel',
        startDate: '2024-01-10',
        endDate: '2024-03-20',
        status: 'Delayed',
        progress: 75,
        budget: 6500000,
        actualCost: 5400000,
        phase: 'Testing & Commissioning',
        priority: 'P2',
        team: 8,
        deliverables: 6,
        completedDeliverables: 4,
    },
    {
        id: '4',
        projectNumber: 'PRJ-2024-004',
        projectName: 'ITC Grand Kitchen Renovation',
        projectType: 'Commercial Kitchen',
        customer: 'ITC Hotels',
        location: 'Delhi NCR',
        salesOrderNumber: 'SO-2024-501',
        projectManager: 'Sunita Reddy',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        status: 'Planning',
        progress: 15,
        budget: 9500000,
        actualCost: 950000,
        phase: 'Detailed Design',
        priority: 'P1',
        team: 10,
        deliverables: 10,
        completedDeliverables: 1,
    },
    {
        id: '5',
        projectNumber: 'PRJ-2024-005',
        projectName: 'Godrej Cold Room Installation',
        projectType: 'Cold Room',
        customer: 'Godrej Appliances',
        location: 'Hyderabad, Telangana',
        salesOrderNumber: 'SO-2024-512',
        projectManager: 'Vikram Singh',
        startDate: '2024-02-15',
        endDate: '2024-05-30',
        status: 'In Progress',
        progress: 55,
        budget: 7800000,
        actualCost: 4200000,
        phase: 'Equipment Installation',
        priority: 'P2',
        team: 14,
        deliverables: 9,
        completedDeliverables: 5,
    },
    {
        id: '6',
        projectNumber: 'PRJ-2023-089',
        projectName: 'Marriott Kitchen Equipment Setup',
        projectType: 'Commercial Kitchen',
        customer: 'Marriott International',
        location: 'Chennai, Tamil Nadu',
        salesOrderNumber: 'SO-2023-892',
        projectManager: 'Anjali Verma',
        startDate: '2023-11-01',
        endDate: '2024-02-28',
        actualEndDate: '2024-03-05',
        status: 'Completed',
        progress: 100,
        budget: 7200000,
        actualCost: 7450000,
        phase: 'Closed',
        priority: 'P1',
        team: 11,
        deliverables: 7,
        completedDeliverables: 7,
    },
    {
        id: '7',
        projectNumber: 'PRJ-2024-006',
        projectName: 'Siemens HT Switchgear Project',
        projectType: 'Switchgear',
        customer: 'Siemens India',
        location: 'Bangalore, Karnataka',
        salesOrderNumber: 'SO-2024-523',
        projectManager: 'Manoj Kumar',
        startDate: '2024-03-10',
        endDate: '2024-06-15',
        status: 'In Progress',
        progress: 35,
        budget: 15000000,
        actualCost: 4500000,
        phase: 'Manufacturing',
        priority: 'P1',
        team: 20,
        deliverables: 15,
        completedDeliverables: 4,
    },
    {
        id: '8',
        projectNumber: 'PRJ-2024-007',
        projectName: 'Prestige Modular Kitchen - Luxury Villas',
        projectType: 'Modular Kitchen',
        customer: 'Prestige Estates Projects',
        location: 'Gurgaon, Haryana',
        salesOrderNumber: 'SO-2024-534',
        projectManager: 'Neha Gupta',
        startDate: '2024-02-20',
        endDate: '2024-07-20',
        status: 'In Progress',
        progress: 42,
        budget: 18000000,
        actualCost: 6800000,
        phase: 'Manufacturing & Assembly',
        priority: 'P2',
        team: 25,
        deliverables: 50,
        completedDeliverables: 18,
    },
    {
        id: '9',
        projectNumber: 'PRJ-2024-008',
        projectName: 'Zomato Cloud Kitchen Setup',
        projectType: 'Commercial Kitchen',
        customer: 'Zomato Limited',
        location: 'Noida, UP',
        salesOrderNumber: 'SO-2024-545',
        projectManager: 'Karan Malhotra',
        startDate: '2024-03-05',
        endDate: '2024-05-05',
        status: 'On Hold',
        progress: 28,
        budget: 5500000,
        actualCost: 1400000,
        phase: 'Site Preparation',
        priority: 'P3',
        team: 7,
        deliverables: 6,
        completedDeliverables: 1,
    },
    {
        id: '10',
        projectNumber: 'PRJ-2024-009',
        projectName: 'Reliance Retail Cold Chain',
        projectType: 'Cold Room',
        customer: 'Reliance Retail Limited',
        location: 'Ahmedabad, Gujarat',
        salesOrderNumber: 'SO-2024-556',
        projectManager: 'Deepak Joshi',
        startDate: '2024-01-20',
        endDate: '2024-04-20',
        status: 'Delayed',
        progress: 68,
        budget: 11000000,
        actualCost: 8200000,
        phase: 'Commissioning',
        priority: 'P1',
        team: 16,
        deliverables: 11,
        completedDeliverables: 7,
    },
];

export default function ProjectsListPage() {
    const { loadProject, activeProject, clearProject } = useProjectContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch projects from backend using ProjectManagementService
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const data = await projectManagementService.getProjects();
                // Map service data to local Project interface
                const mappedProjects: Project[] = data.map((p: ServiceProject) => ({
                    id: p.id,
                    projectNumber: p.projectCode || `PRJ-${p.id}`,
                    projectName: p.name,
                    projectType: (p.projectType as Project['projectType']) || 'Commercial Kitchen',
                    customer: p.clientName,
                    location: p.location || 'N/A',
                    salesOrderNumber: `SO-${p.id}`,
                    projectManager: p.projectManagerId || 'Unassigned',
                    startDate: p.startDate || new Date().toISOString().split('T')[0],
                    endDate: p.endDate || new Date().toISOString().split('T')[0],
                    status: (p.status as Project['status']) || 'Planning',
                    progress: p.progress || 0,
                    budget: p.budgetAllocated || 0,
                    actualCost: p.budgetSpent || 0,
                    phase: p.status || 'Planning',
                    priority: (p.priority as Project['priority']) || 'P2',
                    awardDate: p.awardDate || p.startDate || new Date().toISOString().split('T')[0],
                    clientContactPerson: p.clientContactPerson,
                    clientContactEmail: p.clientContactEmail,
                    team: 0,
                    deliverables: 0,
                    completedDeliverables: 0,
                }));

                // If no projects returned from service, fallback to mockProjects
                if (mappedProjects.length > 0) {
                    setProjects(mappedProjects);
                } else {
                    setProjects(mockProjects);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                // Use mock data as fallback
                setProjects(mockProjects);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Modal states
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);
    const [showCloneProject, setShowCloneProject] = useState(false);
    const [showQuickView, setShowQuickView] = useState(false);
    const [showAssignManager, setShowAssignManager] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showTeamMembers, setShowTeamMembers] = useState(false);
    const [showQuickNotes, setShowQuickNotes] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);

    // Load project into global context when selected locally
    useEffect(() => {
        if (selectedProject) {
            loadProject({
                id: selectedProject.id,
                name: selectedProject.projectName,
                projectType: selectedProject.projectType,
                customerName: selectedProject.customer,
                status: selectedProject.status
            });
        }
    }, [selectedProject, loadProject]);

    // Calculate statistics
    const stats = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'In Progress').length,
        delayed: projects.filter(p => p.status === 'Delayed').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
        totalActualCost: projects.reduce((sum, p) => sum + p.actualCost, 0),
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
        const matchesType = typeFilter === 'All' || project.projectType === typeFilter;
        const matchesPriority = priorityFilter === 'All' || project.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });

    // Pagination
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Planning': return 'bg-purple-100 text-purple-700';
            case 'Delayed': return 'bg-red-100 text-red-700';
            case 'On Hold': return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getHandoverStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'n/a': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'P1': return 'bg-red-100 text-red-700';
            case 'P2': return 'bg-orange-100 text-orange-700';
            case 'P3': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Modal handlers
    const handleAdvancedFilter = (filters: any) => {
        console.log('Applying filters:', filters);
        setShowAdvancedFilter(false);
    };

    const handleBulkUpdate = (updates: any) => {
        console.log('Bulk updating:', updates);
        setShowBulkUpdate(false);
    };

    const handleCloneProject = (options: any) => {
        console.log('Cloning project with options:', options);
        setShowCloneProject(false);
    };

    const handleAssignManager = (manager: string, notes: string) => {
        console.log('Assigning manager:', manager, notes);
        setShowAssignManager(false);
    };

    const handleExport = (options: any) => {
        exportToCsv('projects', filteredProjects as unknown as Record<string, unknown>[]);
        setShowExport(false);
    };

    const handleArchive = (reason: string, preserveData: boolean) => {
        console.log('Archiving project:', reason, preserveData);
        setShowArchive(false);
    };

    const handleSaveNote = (note: any) => {
        console.log('Saving note:', note);
    };

    const openQuickView = (project: Project) => {
        setSelectedProject(project);
        setShowQuickView(true);
    };

    const openCloneModal = (project: Project) => {
        setSelectedProject(project);
        setShowCloneProject(true);
    };

    const openAssignManager = (project: Project) => {
        setSelectedProject(project);
        setShowAssignManager(true);
    };

    const openArchiveModal = (project: Project) => {
        setSelectedProject(project);
        setShowArchive(true);
    };

    const openTimelineModal = (project: Project) => {
        setSelectedProject(project);
        setShowTimeline(true);
    };

    const openTeamMembersModal = (project: Project) => {
        setSelectedProject(project);
        setShowTeamMembers(true);
    };

    const openQuickNotesModal = (project: Project) => {
        setSelectedProject(project);
        setShowQuickNotes(true);
    };

    const openRoadmapModal = (project: Project) => {
        setSelectedProject(project);
        setShowRoadmap(true);
    };

    return (
        <div className="w-full min-h-screen px-3 py-2 space-y-3">
            {/* One-Line Header: Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm relative z-10">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="All">All Status</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delayed">Delayed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="All">All Types</option>
                    <option value="Commercial Kitchen">Kitchen</option>
                    <option value="Cold Room">Cold Room</option>
                    <option value="Switchgear">Switchgear</option>
                    <option value="HVAC System">HVAC</option>
                    <option value="Modular Kitchen">Modular</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="All">All Priority</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Med</option>
                    <option value="P3">P3 - Low</option>
                </select>

                <div className="flex items-center gap-1.5 ml-auto">
                    <button
                        onClick={() => setShowAdvancedFilter(true)}
                        className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-2.5 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        title="Advanced Filters"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden xl:inline">Filters</span>
                    </button>

                    <button
                        onClick={() => setShowExport(true)}
                        className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-2.5 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        title="Export"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden xl:inline">Export</span>
                    </button>

                    {selectedProjects.length > 0 && (
                        <button
                            onClick={() => setShowBulkUpdate(true)}
                            className="flex items-center gap-1.5 bg-purple-600 text-white px-2.5 py-1.5 text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Update ({selectedProjects.length})</span>
                        </button>
                    )}

                    <Link
                        href="/project-management/create-enhanced"
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Total Projects</p>
                            <p className="text-xl font-black text-gray-900 leading-none mt-1">{stats.total}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">In Progress</p>
                            <p className="text-xl font-black text-blue-900 leading-none mt-1">{stats.inProgress}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-[10px] text-red-500 font-bold mt-1">{stats.delayed} delayed items</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Total Budget</p>
                            <p className="text-xl font-black text-emerald-700 leading-none mt-1">{formatCurrency(stats.totalBudget)}</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-50 rounded flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Completion</p>
                            <p className="text-xl font-black text-green-900 leading-none mt-1">
                                {Math.round((stats.completed / stats.total) * 100)}%
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflow Quick Actions - Enhanced Forms Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                    <WorkflowQuickActions variant="compact" />
                </div>
                <div>
                    <DocumentControlWidget />
                </div>
            </div>


            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative z-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Project Details</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Client & PM</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status & Progress</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Handover Gate</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Financials</th>
                                <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                                                <Package className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[200px]">{project.projectName}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-black text-gray-400">{project.projectNumber}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-sm font-semibold text-gray-800 leading-tight">{project.customer}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">PM: {project.projectManager}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-xs font-bold text-gray-700">{formatDate(project.startDate)}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">to {formatDate(project.endDate)}</div>
                                        {project.awardDate && (
                                            <div className="mt-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-sm inline-block">
                                                Awarded: {formatDate(project.awardDate)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                            <span className="text-xs font-black text-gray-900">{project.progress}%</span>
                                        </div>
                                        <div className="w-24 bg-gray-100 rounded-full h-1 mt-1">
                                            <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-black uppercase ${getHandoverStatusColor(project.handoverStatus || 'pending')}`}>
                                            {project.handoverStatus === 'approved' && <CheckCircle className="w-2.5 h-2.5" />}
                                            {project.handoverStatus || 'pending'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-xs font-black text-emerald-700">{formatCurrency(project.budget)}</div>
                                        <div className="text-[10px] text-gray-500 font-bold">{formatCurrency(project.actualCost)} spent</div>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openQuickView(project)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Quick View">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <Link href={`/project-management/edit/${project.id}`} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Link>
                                            <button onClick={() => openTimelineModal(project)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="Timeline">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => openTeamMembersModal(project)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Team">
                                                <Users className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="relative group">
                                                <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                </button>
                                                {/* Action Dropdown */}
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                    <button
                                                        onClick={() => openRoadmapModal(project)}
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                                                    >
                                                        <BarChart3 className="w-3.5 h-3.5" />
                                                        Interactive Roadmap
                                                    </button>
                                                    <button
                                                        onClick={() => openTimelineModal(project)}
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Schedule View
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        Assign Resources
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of{' '}
                        {filteredProjects.length} projects
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
            <AdvancedFilterModal
                isOpen={showAdvancedFilter}
                onClose={() => setShowAdvancedFilter(false)}
                onApply={handleAdvancedFilter}
            />

            <BulkUpdateModal
                isOpen={showBulkUpdate}
                onClose={() => setShowBulkUpdate(false)}
                selectedProjects={selectedProjects}
                onUpdate={handleBulkUpdate}
            />

            {
                selectedProject && (
                    <>
                        <CloneProjectModal
                            isOpen={showCloneProject}
                            onClose={() => setShowCloneProject(false)}
                            project={selectedProject}
                            onClone={handleCloneProject}
                        />

                        <QuickViewModal
                            isOpen={showQuickView}
                            onClose={() => setShowQuickView(false)}
                            project={selectedProject}
                        />

                        <AssignManagerModal
                            isOpen={showAssignManager}
                            onClose={() => setShowAssignManager(false)}
                            project={selectedProject}
                            onAssign={handleAssignManager}
                        />

                        <ArchiveProjectModal
                            isOpen={showArchive}
                            onClose={() => setShowArchive(false)}
                            project={selectedProject}
                            onArchive={handleArchive}
                        />

                        <ProjectRoadmapModal
                            isOpen={showRoadmap}
                            onClose={() => setShowRoadmap(false)}
                            project={selectedProject}
                        />

                        <ProjectTimelineModal
                            isOpen={showTimeline}
                            onClose={() => setShowTimeline(false)}
                            project={selectedProject}
                        />

                        <TeamMembersModal
                            isOpen={showTeamMembers}
                            onClose={() => setShowTeamMembers(false)}
                            project={selectedProject}
                        />

                        <QuickNotesModal
                            isOpen={showQuickNotes}
                            onClose={() => setShowQuickNotes(false)}
                            project={selectedProject}
                            onSaveNote={handleSaveNote}
                        />
                    </>
                )
            }

            <ExportProjectsModal
                isOpen={showExport}
                onClose={() => setShowExport(false)}
                selectedProjects={filteredProjects}
                onExport={handleExport}
            />
        </div >
    );
}
