'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flag, Search, Filter, PlusCircle, Download, CalendarDays, Link2, TrendingUp, AlertTriangle, CheckCircle2, Clock, Target, Users, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

// Maps the backend milestone status vocabulary onto this page's status set.
const STATUS_MAP: Record<string, Milestone['status']> = {
  pending: 'planned',
  planned: 'planned',
  in_progress: 'in_progress',
  'in-progress': 'in_progress',
  achieved: 'achieved',
  completed: 'achieved',
  done: 'achieved',
  overdue: 'overdue',
  at_risk: 'at_risk',
  cancelled: 'cancelled',
};

type Milestone = {
  id: string;
  milestoneNumber: string;
  title: string;
  description: string;
  project: string;
  projectCode: string;
  phase: string;
  category: 'technical' | 'commercial' | 'quality' | 'delivery' | 'stakeholder' | 'regulatory';
  owner: string;
  department: string;
  baselineDate: string;
  currentDate: string;
  actualDate?: string;
  status: 'planned' | 'in_progress' | 'achieved' | 'overdue' | 'at_risk' | 'cancelled';
  progress: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  dependencies: string[];
  successCriteria: string[];
  approvers: string[];
  risks: number;
  delayDays?: number;
  completionNotes?: string;
};

const MILESTONES: Milestone[] = [
  {
    id: '1',
    milestoneNumber: 'MS-101',
    title: 'Design Sign-off Complete',
    description: 'Final design approval from client and regulatory authorities',
    project: 'Kitchen Fitout - Tower A',
    projectCode: 'KF-A',
    phase: 'Planning',
    category: 'stakeholder',
    owner: 'Priya Patel',
    department: 'Design',
    baselineDate: '2025-10-20',
    currentDate: '2025-10-20',
    actualDate: '2025-10-21',
    status: 'achieved',
    progress: 100,
    priority: 'critical',
    impact: 'high',
    dependencies: [],
    successCriteria: ['Client approval received', 'Regulatory clearance obtained', 'All drawings signed off'],
    approvers: ['Client PMO', 'Regulatory Authority', 'Internal QA'],
    risks: 0,
    delayDays: 1,
    completionNotes: 'Completed with minor delay due to client availability. All approvals secured.'
  },
  {
    id: '2',
    milestoneNumber: 'MS-102',
    title: 'Material Procurement Complete',
    description: 'All materials procured and delivered to site',
    project: 'Luxury Villa Wardrobes',
    projectCode: 'LVW',
    phase: 'Procurement',
    category: 'commercial',
    owner: 'Amit Singh',
    department: 'Procurement',
    baselineDate: '2025-10-25',
    currentDate: '2025-10-28',
    status: 'in_progress',
    progress: 75,
    priority: 'high',
    impact: 'high',
    dependencies: ['MS-101'],
    successCriteria: ['All POs issued', '90% materials on site', 'Quality inspection passed'],
    approvers: ['Procurement Manager', 'Project Manager', 'QC Head'],
    risks: 2,
    delayDays: 3,
    completionNotes: ''
  },
  {
    id: '3',
    milestoneNumber: 'MS-103',
    title: 'Assembly Line Ready',
    description: 'Production line setup and tested for full capacity',
    project: 'Corporate Pantry Rollout',
    projectCode: 'CPR',
    phase: 'Production Setup',
    category: 'technical',
    owner: 'Rahul Kumar',
    department: 'Manufacturing',
    baselineDate: '2025-10-22',
    currentDate: '2025-10-22',
    status: 'overdue',
    progress: 60,
    priority: 'critical',
    impact: 'high',
    dependencies: [],
    successCriteria: ['Line installed', 'Trial run successful', 'Safety certification'],
    approvers: ['Manufacturing Head', 'Safety Officer', 'Operations Manager'],
    risks: 3,
    delayDays: 5,
    completionNotes: ''
  },
  {
    id: '4',
    milestoneNumber: 'MS-104',
    title: 'QC Gate Pass - Phase 1',
    description: 'Quality control gate for first production batch',
    project: 'Showroom Refurbishment',
    projectCode: 'SR',
    phase: 'Quality Control',
    category: 'quality',
    owner: 'Neha Sharma',
    department: 'Quality',
    baselineDate: '2025-11-05',
    currentDate: '2025-11-05',
    status: 'planned',
    progress: 0,
    priority: 'high',
    impact: 'high',
    dependencies: ['MS-102'],
    successCriteria: ['Zero critical defects', 'Compliance checklist 100%', 'Customer preview approved'],
    approvers: ['QC Manager', 'Project Director', 'Client QA'],
    risks: 1,
    completionNotes: ''
  },
  {
    id: '5',
    milestoneNumber: 'MS-105',
    title: 'Installation Phase 1 Complete',
    description: 'First phase installation completed (Units 1-50)',
    project: 'Kitchen Fitout - Tower A',
    projectCode: 'KF-A',
    phase: 'Installation',
    category: 'delivery',
    owner: 'Vikram Rao',
    department: 'Site Operations',
    baselineDate: '2025-11-10',
    currentDate: '2025-11-10',
    status: 'in_progress',
    progress: 85,
    priority: 'critical',
    impact: 'high',
    dependencies: ['MS-101', 'MS-102'],
    successCriteria: ['50 units installed', 'Site inspection passed', 'Client walkthrough completed'],
    approvers: ['Site Manager', 'Client Representative', 'Safety Officer'],
    risks: 1,
    completionNotes: ''
  },
  {
    id: '6',
    milestoneNumber: 'MS-106',
    title: 'Regulatory Compliance Certificate',
    description: 'Fire safety and building code compliance certification',
    project: 'Showroom Refurbishment',
    projectCode: 'SR',
    phase: 'Compliance',
    category: 'regulatory',
    owner: 'Anjali Gupta',
    department: 'Legal & Compliance',
    baselineDate: '2025-11-15',
    currentDate: '2025-11-12',
    status: 'at_risk',
    progress: 40,
    priority: 'critical',
    impact: 'high',
    dependencies: ['MS-104'],
    successCriteria: ['Fire NOC obtained', 'Building code clearance', 'Occupancy permit ready'],
    approvers: ['Fire Department', 'Municipal Authority', 'Legal Head'],
    risks: 4,
    completionNotes: ''
  },
  {
    id: '7',
    milestoneNumber: 'MS-107',
    title: 'Customer UAT Sign-off',
    description: 'User acceptance testing completed by customer',
    project: 'Luxury Villa Wardrobes',
    projectCode: 'LVW',
    phase: 'Testing',
    category: 'stakeholder',
    owner: 'Priya Patel',
    department: 'Customer Success',
    baselineDate: '2025-11-18',
    currentDate: '2025-11-18',
    status: 'planned',
    progress: 0,
    priority: 'high',
    impact: 'medium',
    dependencies: ['MS-102'],
    successCriteria: ['Customer checklist approved', 'No major issues', 'Sign-off documentation'],
    approvers: ['Customer', 'Account Manager', 'Project Manager'],
    risks: 2,
    completionNotes: ''
  },
  {
    id: '8',
    milestoneNumber: 'MS-108',
    title: 'Full Production Capacity Achieved',
    description: 'Manufacturing line running at 100% capacity',
    project: 'Corporate Pantry Rollout',
    projectCode: 'CPR',
    phase: 'Production',
    category: 'technical',
    owner: 'Rahul Kumar',
    department: 'Manufacturing',
    baselineDate: '2025-11-20',
    currentDate: '2025-11-20',
    status: 'planned',
    progress: 0,
    priority: 'high',
    impact: 'high',
    dependencies: ['MS-103'],
    successCriteria: ['100% capacity for 5 days', 'Quality metrics met', 'Efficiency targets achieved'],
    approvers: ['Manufacturing Head', 'Operations Director', 'Quality Manager'],
    risks: 2,
    completionNotes: ''
  },
  {
    id: '9',
    milestoneNumber: 'MS-109',
    title: 'Site Handover - Phase 1',
    description: 'First phase handed over to client with documentation',
    project: 'Kitchen Fitout - Tower A',
    projectCode: 'KF-A',
    phase: 'Handover',
    category: 'delivery',
    owner: 'Vikram Rao',
    department: 'Site Operations',
    baselineDate: '2025-11-25',
    currentDate: '2025-11-25',
    status: 'planned',
    progress: 0,
    priority: 'critical',
    impact: 'high',
    dependencies: ['MS-105'],
    successCriteria: ['All snags cleared', 'Documentation complete', 'Training provided', 'Client acceptance'],
    approvers: ['Client Project Manager', 'Operations Director', 'Legal Team'],
    risks: 1,
    completionNotes: ''
  },
  {
    id: '10',
    milestoneNumber: 'MS-110',
    title: 'Payment Milestone 3',
    description: 'Third payment installment due and received',
    project: 'Luxury Villa Wardrobes',
    projectCode: 'LVW',
    phase: 'Finance',
    category: 'commercial',
    owner: 'Sanjay Mehta',
    department: 'Finance',
    baselineDate: '2025-11-28',
    currentDate: '2025-11-28',
    status: 'planned',
    progress: 0,
    priority: 'high',
    impact: 'medium',
    dependencies: ['MS-107'],
    successCriteria: ['Invoice raised', 'Payment received', 'Reconciliation complete'],
    approvers: ['Finance Manager', 'Customer Finance', 'CFO'],
    risks: 1,
    completionNotes: ''
  },
  {
    id: '11',
    milestoneNumber: 'MS-111',
    title: 'Warranty Period Starts',
    description: '12-month warranty period commences post final handover',
    project: 'Showroom Refurbishment',
    projectCode: 'SR',
    phase: 'Post-Delivery',
    category: 'delivery',
    owner: 'Anjali Gupta',
    department: 'Customer Service',
    baselineDate: '2025-12-01',
    currentDate: '2025-12-01',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    impact: 'low',
    dependencies: ['MS-106'],
    successCriteria: ['Warranty terms documented', 'Service team briefed', 'Customer contact established'],
    approvers: ['Customer Service Head', 'Legal Team', 'Operations Manager'],
    risks: 0,
    completionNotes: ''
  },
  {
    id: '12',
    milestoneNumber: 'MS-112',
    title: 'Project Closure Documentation',
    description: 'All project closure documents compiled and archived',
    project: 'Corporate Pantry Rollout',
    projectCode: 'CPR',
    phase: 'Closure',
    category: 'delivery',
    owner: 'Priya Patel',
    department: 'PMO',
    baselineDate: '2025-12-05',
    currentDate: '2025-12-05',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    impact: 'low',
    dependencies: ['MS-108', 'MS-109'],
    successCriteria: ['All documents archived', 'Lessons learned documented', 'Team debriefing complete'],
    approvers: ['PMO Director', 'Operations Head', 'Quality Manager'],
    risks: 0,
    completionNotes: ''
  },
  {
    id: '13',
    milestoneNumber: 'MS-113',
    title: 'Environmental Clearance Obtained',
    description: 'Environmental impact clearance for manufacturing expansion',
    project: 'Corporate Pantry Rollout',
    projectCode: 'CPR',
    phase: 'Regulatory',
    category: 'regulatory',
    owner: 'Ravi Shankar',
    department: 'Legal & Compliance',
    baselineDate: '2025-10-15',
    currentDate: '2025-10-15',
    actualDate: '2025-10-14',
    status: 'achieved',
    progress: 100,
    priority: 'critical',
    impact: 'high',
    dependencies: [],
    successCriteria: ['Environmental NOC', 'Pollution board clearance', 'Green certification'],
    approvers: ['Environmental Authority', 'State Pollution Board', 'Legal Head'],
    risks: 0,
    completionNotes: 'Achieved ahead of schedule. All certifications secured.'
  },
  {
    id: '14',
    milestoneNumber: 'MS-114',
    title: 'Vendor Quality Audit Passed',
    description: 'Third-party quality audit of all vendor supplies',
    project: 'Luxury Villa Wardrobes',
    projectCode: 'LVW',
    phase: 'Quality Control',
    category: 'quality',
    owner: 'Neha Sharma',
    department: 'Quality',
    baselineDate: '2025-10-18',
    currentDate: '2025-10-18',
    actualDate: '2025-10-19',
    status: 'achieved',
    progress: 100,
    priority: 'high',
    impact: 'medium',
    dependencies: [],
    successCriteria: ['All vendors audited', 'Compliance score >90%', 'Action items closed'],
    approvers: ['Quality Director', 'Procurement Head', 'Third-party Auditor'],
    risks: 0,
    delayDays: 1,
    completionNotes: 'All vendors passed with scores >92%. Minor delay due to vendor availability.'
  },
  {
    id: '15',
    milestoneNumber: 'MS-115',
    title: 'Team Training Certification Complete',
    description: 'All installation team members trained and certified',
    project: 'Kitchen Fitout - Tower A',
    projectCode: 'KF-A',
    phase: 'Training',
    category: 'technical',
    owner: 'Vikram Rao',
    department: 'HR & Training',
    baselineDate: '2025-10-12',
    currentDate: '2025-10-12',
    actualDate: '2025-10-12',
    status: 'achieved',
    progress: 100,
    priority: 'high',
    impact: 'medium',
    dependencies: [],
    successCriteria: ['100% team trained', 'Certifications issued', 'Competency tests passed'],
    approvers: ['Training Manager', 'Site Manager', 'HR Head'],
    risks: 0,
    completionNotes: 'All 25 team members certified. Training records updated.'
  }
];

export default function MilestonesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.listAllMilestones();
        const mapped: Milestone[] = (Array.isArray(raw) ? raw : []).map((m: any, i: number) => {
          const meta = (m.metadata ?? {}) as Record<string, any>;
          return {
            id: String(m.id ?? i),
            milestoneNumber: meta.milestoneNumber ?? `MS-${String(i + 1).padStart(3, '0')}`,
            title: m.name ?? m.title ?? '—',
            description: m.description ?? '',
            project: m.projectName ?? meta.projectName ?? m.projectId ?? '—',
            projectCode: meta.projectCode ?? '',
            phase: meta.phase ?? '',
            category: meta.category ?? 'technical',
            owner: meta.owner ?? '',
            department: meta.department ?? '',
            baselineDate: (meta.baselineDate ?? m.dueDate ?? '').toString().slice(0, 10),
            currentDate: (m.dueDate ?? '').toString().slice(0, 10),
            actualDate: m.completedDate ? m.completedDate.toString().slice(0, 10) : undefined,
            status: STATUS_MAP[m.status] ?? 'planned',
            progress: Number(meta.progress ?? 0),
            priority: meta.priority ?? 'medium',
            impact: meta.impact ?? 'medium',
            dependencies: Array.isArray(meta.dependencies) ? meta.dependencies : [],
            successCriteria: Array.isArray(meta.successCriteria) ? meta.successCriteria : [],
            approvers: Array.isArray(meta.approvers) ? meta.approvers : [],
            risks: Number(meta.risks ?? 0),
            delayDays: meta.delayDays,
            completionNotes: meta.completionNotes,
          };
        });
        if (!cancelled) setMilestones(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load milestones');
          setMilestones([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get unique values for filters
  const projects = useMemo(() => Array.from(new Set(milestones.map(m => m.project))), [milestones]);

  const filtered = useMemo(() => {
    return milestones.filter(m => {
      const matchSearch = [m.title, m.description, m.project, m.projectCode, m.milestoneNumber, m.owner, m.phase].some(
        v => v.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchProject = projectFilter === 'all' || m.project === projectFilter;
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const matchPriority = priorityFilter === 'all' || m.priority === priorityFilter;
      return matchSearch && matchProject && matchStatus && matchCategory && matchPriority;
    });
  }, [milestones, searchTerm, projectFilter, statusFilter, categoryFilter, priorityFilter]);

  // Calculate stats
  const totalMilestones = milestones.length;
  const achieved = milestones.filter(m => m.status === 'achieved').length;
  const inProgress = milestones.filter(m => m.status === 'in_progress').length;
  const overdue = milestones.filter(m => m.status === 'overdue').length;
  const atRisk = milestones.filter(m => m.status === 'at_risk').length;
  const avgProgress = totalMilestones > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / totalMilestones)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-50 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'planned': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      case 'at_risk': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="h-4 w-4" />;
      case 'commercial': return <TrendingUp className="h-4 w-4" />;
      case 'quality': return <CheckCircle2 className="h-4 w-4" />;
      case 'delivery': return <Flag className="h-4 w-4" />;
      case 'stakeholder': return <Users className="h-4 w-4" />;
      case 'regulatory': return <AlertTriangle className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Flag className="h-8 w-8 text-teal-600" />
          Milestones
        </h1>
        <p className="text-gray-600 mt-2">Track key project milestones, deliverables, and approval gates</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading milestones…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && milestones.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No milestones found.
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search milestones by title, project, owner, phase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('milestones', filtered)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Add Milestone
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="achieved">Achieved</option>
                <option value="overdue">Overdue</option>
                <option value="at_risk">At Risk</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="commercial">Commercial</option>
                <option value="quality">Quality</option>
                <option value="delivery">Delivery</option>
                <option value="stakeholder">Stakeholder</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats - 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-xs font-medium">Total Milestones</p>
              <p className="text-2xl font-bold text-teal-900 mt-1">{totalMilestones}</p>
            </div>
            <Flag className="h-10 w-10 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs font-medium">Achieved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{achieved}</p>
              <p className="text-xs text-green-600 mt-1">{Math.round((achieved/totalMilestones)*100)}% complete</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{inProgress}</p>
              <p className="text-xs text-blue-600 mt-1">Active tracking</p>
            </div>
            <Clock className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-xs font-medium">At Risk</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{atRisk}</p>
              <p className="text-xs text-orange-600 mt-1">Needs attention</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-xs font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{overdue}</p>
              <p className="text-xs text-red-600 mt-1">Critical action</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs font-medium">Avg Progress</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgProgress}%</p>
              <p className="text-xs text-purple-600 mt-1">Overall completion</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Milestones table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Milestone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project / Phase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Dependencies</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Risks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{m.title}</span>
                      <span className="text-xs text-gray-500">{m.milestoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{m.project}</span>
                      <span className="text-xs text-gray-500">{m.projectCode} • {m.phase}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{m.owner}</span>
                      <span className="text-xs text-gray-500">{m.department}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <CalendarDays className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Due:</span>
                        <span className="font-medium text-gray-700">{m.currentDate}</span>
                      </div>
                      {m.actualDate && (
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-gray-500">Actual:</span>
                          <span className="font-medium text-green-700">{m.actualDate}</span>
                        </div>
                      )}
                      {m.delayDays && m.delayDays > 0 && (
                        <span className="text-xs text-red-600">+{m.delayDays} day{m.delayDays > 1 ? 's' : ''} delay</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${m.progress >= 100 ? 'bg-green-600' : m.progress >= 50 ? 'bg-blue-600' : 'bg-yellow-500'}`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600 font-medium">{m.progress}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(m.status)}`}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(m.priority)}`}>
                      {m.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(m.category)}
                      <span className="text-sm text-gray-700 capitalize">{m.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {m.dependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.dependencies.map(d => (
                          <span key={d} className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-300 text-xs text-gray-700">
                            <Link2 className="h-3 w-3" />
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.risks > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {m.risks}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No milestones found matching the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Flag className="h-5 w-5 text-teal-600" />
          Milestone Management Guidelines
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Milestone Planning Best Practices</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>SMART Criteria:</strong> Ensure milestones are Specific, Measurable, Achievable, Relevant, and Time-bound</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Clear Success Criteria:</strong> Define measurable criteria that must be met for milestone completion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Approval Gates:</strong> Identify all required approvers and ensure sign-off authority is established</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dependency Management:</strong> Map all dependencies to prevent bottlenecks and schedule conflicts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Baseline Protection:</strong> Lock baseline dates once approved; track changes in current dates</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Milestone Categories</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Technical:</strong> Design completions, system readiness, capacity achievements, technical certifications</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Commercial:</strong> Payment milestones, contract sign-offs, procurement completions, vendor agreements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Quality:</strong> QC gate passes, audit completions, certification achievements, quality sign-offs</span>
              </li>
              <li className="flex items-start gap-2">
                <Flag className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Delivery:</strong> Installation completions, site handovers, warranty starts, project closures</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Stakeholder:</strong> Client approvals, UAT sign-offs, stakeholder reviews, executive presentations</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span><strong>Regulatory:</strong> Environmental clearances, safety certifications, compliance approvals, permits</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Status Management</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <span><strong>Planned:</strong> Milestone scheduled but work not yet started. Monitoring upcoming dependencies and resource availability</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span><strong>In Progress:</strong> Active work towards milestone completion. Regular progress tracking and stakeholder updates required</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                <span><strong>At Risk:</strong> Milestone facing challenges that may impact target date. Mitigation plan required immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                <span><strong>Overdue:</strong> Milestone past due date without completion. Escalation and recovery plan mandatory</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                <span><strong>Achieved:</strong> Milestone completed with all success criteria met and approvals obtained. Documentation archived</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Risk & Issue Management</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>Risk Tracking:</strong> Monitor risks that could impact milestone achievement. Update risk register weekly</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>Early Warning:</strong> Flag milestones as "At Risk" as soon as concerns emerge. Don't wait until overdue</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>Escalation Path:</strong> Critical and high-priority milestones require immediate escalation if at risk</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>Mitigation Plans:</strong> Document mitigation actions for all at-risk milestones with clear ownership</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dependency Delays:</strong> Monitor upstream dependencies daily. Proactively address blocking issues</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
