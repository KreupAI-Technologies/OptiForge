'use client';

import { useEffect, useState, useMemo } from 'react';
import { LayoutDashboard, Search, Filter, FolderKanban, TrendingUp, AlertCircle, Clock, CheckCircle2, Users, DollarSign, Calendar, Target, Activity } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  projectManager: string;
  client: string;
  category: 'construction' | 'it' | 'manufacturing' | 'infrastructure' | 'r&d';
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'at-risk' | 'delayed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  plannedEndDate: string;
  progressPercent: number;
  budget: number;
  spent: number;
  forecast: number;
  teamSize: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  tasksTotal: number;
  tasksCompleted: number;
  issuesOpen: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  healthScore: number;
  lastUpdated: string;
}

// Mock data for projects
const mockProjectsData: Project[] = [
  {
    id: 'PROJ-001',
    projectCode: 'PROJ-2025-001',
    projectName: 'Manufacturing Plant Expansion',
    projectManager: 'Rajesh Kumar',
    client: 'ABC Manufacturing Ltd.',
    category: 'construction',
    status: 'active',
    priority: 'critical',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    plannedEndDate: '2026-03-31',
    progressPercent: 45,
    budget: 35000000,
    spent: 18500000,
    forecast: 36200000,
    teamSize: 28,
    milestonesTotal: 12,
    milestonesCompleted: 5,
    tasksTotal: 187,
    tasksCompleted: 89,
    issuesOpen: 8,
    riskLevel: 'medium',
    healthScore: 72,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-002',
    projectCode: 'PROJ-2025-002',
    projectName: 'ERP System Implementation',
    projectManager: 'Amit Patel',
    client: 'XYZ Industries',
    category: 'it',
    status: 'active',
    priority: 'high',
    startDate: '2025-05-01',
    endDate: '2025-12-31',
    plannedEndDate: '2025-12-31',
    progressPercent: 62,
    budget: 8500000,
    spent: 6100000,
    forecast: 8800000,
    teamSize: 15,
    milestonesTotal: 8,
    milestonesCompleted: 5,
    tasksTotal: 124,
    tasksCompleted: 81,
    issuesOpen: 12,
    riskLevel: 'high',
    healthScore: 65,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-003',
    projectCode: 'PROJ-2025-003',
    projectName: 'Solar Power Installation',
    projectManager: 'Sunita Reddy',
    client: 'Green Energy Corp',
    category: 'infrastructure',
    status: 'active',
    priority: 'high',
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    plannedEndDate: '2025-11-30',
    progressPercent: 78,
    budget: 12500000,
    spent: 9800000,
    forecast: 12300000,
    teamSize: 12,
    milestonesTotal: 6,
    milestonesCompleted: 4,
    tasksTotal: 89,
    tasksCompleted: 72,
    issuesOpen: 3,
    riskLevel: 'low',
    healthScore: 88,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-004',
    projectCode: 'PROJ-2025-004',
    projectName: 'Warehouse Automation',
    projectManager: 'Vikram Singh',
    client: 'Logistics Solutions Ltd.',
    category: 'manufacturing',
    status: 'at-risk',
    priority: 'critical',
    startDate: '2025-08-01',
    endDate: '2026-01-31',
    plannedEndDate: '2026-01-31',
    progressPercent: 38,
    budget: 18500000,
    spent: 8900000,
    forecast: 19200000,
    teamSize: 22,
    milestonesTotal: 10,
    milestonesCompleted: 3,
    tasksTotal: 156,
    tasksCompleted: 62,
    issuesOpen: 18,
    riskLevel: 'critical',
    healthScore: 58,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-005',
    projectCode: 'PROJ-2025-005',
    projectName: 'Quality Lab Setup',
    projectManager: 'Meera Iyer',
    client: 'Precision Testing Inc.',
    category: 'infrastructure',
    status: 'active',
    priority: 'medium',
    startDate: '2025-07-01',
    endDate: '2026-01-31',
    plannedEndDate: '2026-01-31',
    progressPercent: 55,
    budget: 9200000,
    spent: 5400000,
    forecast: 9100000,
    teamSize: 10,
    milestonesTotal: 8,
    milestonesCompleted: 4,
    tasksTotal: 98,
    tasksCompleted: 56,
    issuesOpen: 5,
    riskLevel: 'low',
    healthScore: 82,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-006',
    projectCode: 'PROJ-2024-018',
    projectName: 'Product Development - Series X',
    projectManager: 'Priya Sharma',
    client: 'Innovation Labs',
    category: 'r&d',
    status: 'active',
    priority: 'high',
    startDate: '2024-10-01',
    endDate: '2025-12-31',
    plannedEndDate: '2025-12-31',
    progressPercent: 71,
    budget: 15500000,
    spent: 11800000,
    forecast: 15200000,
    teamSize: 18,
    milestonesTotal: 15,
    milestonesCompleted: 11,
    tasksTotal: 203,
    tasksCompleted: 152,
    issuesOpen: 7,
    riskLevel: 'medium',
    healthScore: 76,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-007',
    projectCode: 'PROJ-2025-007',
    projectName: 'Office Renovation',
    projectManager: 'Karthik Nair',
    client: 'Corporate Spaces Ltd.',
    category: 'construction',
    status: 'completed',
    priority: 'low',
    startDate: '2025-03-01',
    endDate: '2025-08-31',
    plannedEndDate: '2025-09-30',
    progressPercent: 100,
    budget: 4500000,
    spent: 4380000,
    forecast: 4380000,
    teamSize: 8,
    milestonesTotal: 6,
    milestonesCompleted: 6,
    tasksTotal: 67,
    tasksCompleted: 67,
    issuesOpen: 0,
    riskLevel: 'low',
    healthScore: 95,
    lastUpdated: '2025-09-05'
  },
  {
    id: 'PROJ-008',
    projectCode: 'PROJ-2024-022',
    projectName: 'Network Infrastructure Upgrade',
    projectManager: 'Deepak Verma',
    client: 'TechCorp India',
    category: 'it',
    status: 'completed',
    priority: 'medium',
    startDate: '2024-11-01',
    endDate: '2025-05-31',
    plannedEndDate: '2025-05-31',
    progressPercent: 100,
    budget: 6800000,
    spent: 6650000,
    forecast: 6650000,
    teamSize: 12,
    milestonesTotal: 9,
    milestonesCompleted: 9,
    tasksTotal: 112,
    tasksCompleted: 112,
    issuesOpen: 0,
    riskLevel: 'low',
    healthScore: 92,
    lastUpdated: '2025-06-10'
  },
  {
    id: 'PROJ-009',
    projectCode: 'PROJ-2025-009',
    projectName: 'Supply Chain Optimization',
    projectManager: 'Anjali Gupta',
    client: 'Supply Solutions Inc.',
    category: 'it',
    status: 'planning',
    priority: 'medium',
    startDate: '2025-11-01',
    endDate: '2026-04-30',
    plannedEndDate: '2026-04-30',
    progressPercent: 12,
    budget: 7500000,
    spent: 450000,
    forecast: 7500000,
    teamSize: 6,
    milestonesTotal: 10,
    milestonesCompleted: 0,
    tasksTotal: 135,
    tasksCompleted: 18,
    issuesOpen: 2,
    riskLevel: 'low',
    healthScore: 85,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-010',
    projectCode: 'PROJ-2025-010',
    projectName: 'Equipment Modernization',
    projectManager: 'Suresh Pillai',
    client: 'Manufacturing Hub Ltd.',
    category: 'manufacturing',
    status: 'on-hold',
    priority: 'low',
    startDate: '2025-09-01',
    endDate: '2026-02-28',
    plannedEndDate: '2026-02-28',
    progressPercent: 22,
    budget: 11200000,
    spent: 2800000,
    forecast: 11500000,
    teamSize: 14,
    milestonesTotal: 8,
    milestonesCompleted: 1,
    tasksTotal: 94,
    tasksCompleted: 24,
    issuesOpen: 6,
    riskLevel: 'medium',
    healthScore: 68,
    lastUpdated: '2025-10-15'
  },
  {
    id: 'PROJ-011',
    projectCode: 'PROJ-2025-011',
    projectName: 'Bridge Construction - Phase 2',
    projectManager: 'Ramesh Krishnan',
    client: 'Infrastructure Development Corp',
    category: 'infrastructure',
    status: 'delayed',
    priority: 'critical',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    plannedEndDate: '2025-09-30',
    progressPercent: 68,
    budget: 42000000,
    spent: 31500000,
    forecast: 43800000,
    teamSize: 35,
    milestonesTotal: 14,
    milestonesCompleted: 9,
    tasksTotal: 245,
    tasksCompleted: 172,
    issuesOpen: 22,
    riskLevel: 'critical',
    healthScore: 52,
    lastUpdated: '2025-10-20'
  },
  {
    id: 'PROJ-012',
    projectCode: 'PROJ-2024-015',
    projectName: 'Mobile App Development',
    projectManager: 'Neha Kapoor',
    client: 'Digital Solutions Ltd.',
    category: 'it',
    status: 'completed',
    priority: 'high',
    startDate: '2024-08-01',
    endDate: '2025-03-31',
    plannedEndDate: '2025-03-31',
    progressPercent: 100,
    budget: 5200000,
    spent: 5050000,
    forecast: 5050000,
    teamSize: 9,
    milestonesTotal: 7,
    milestonesCompleted: 7,
    tasksTotal: 156,
    tasksCompleted: 156,
    issuesOpen: 0,
    riskLevel: 'low',
    healthScore: 94,
    lastUpdated: '2025-04-05'
  }
];

const CATEGORIES: Project['category'][] = ['construction', 'it', 'manufacturing', 'infrastructure', 'r&d'];
const STATUSES: Project['status'][] = ['planning', 'active', 'on-hold', 'completed', 'at-risk', 'delayed'];
const PRIORITIES: Project['priority'][] = ['critical', 'high', 'medium', 'low'];
const RISK_LEVELS: Project['riskLevel'][] = ['low', 'medium', 'high', 'critical'];

// Backend project-plan status → dashboard Project status union.
const PLAN_STATUS_MAP: Record<string, Project['status']> = {
  planning: 'planning',
  approved: 'planning',
  in_execution: 'active',
  on_hold: 'on-hold',
  completed: 'completed',
  cancelled: 'on-hold',
};

export default function ProjectsDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [rows, setRows] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listProjectPlans();
        if (cancelled) return;
        const list: Record<string, unknown>[] = Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
        const mapped: Project[] = list.map((r: Record<string, unknown>) => {
          const startDate = String(r.startDate ?? '');
          const endDate = String(r.endDate ?? '');
          return {
            id: String(r.id ?? ''),
            projectCode: String(r.projectCode ?? ''),
            projectName: String(r.projectName ?? ''),
            projectManager: String(r.projectManager ?? ''),
            client: String(r.client ?? ''),
            category: CATEGORIES.includes(r.projectType as Project['category'])
              ? (r.projectType as Project['category'])
              : 'construction',
            status: PLAN_STATUS_MAP[String(r.status ?? '')]
              ?? (STATUSES.includes(r.status as Project['status']) ? (r.status as Project['status']) : 'planning'),
            priority: PRIORITIES.includes(r.priority as Project['priority'])
              ? (r.priority as Project['priority'])
              : 'medium',
            startDate,
            endDate,
            plannedEndDate: endDate,
            progressPercent: Number(r.progressPercentage ?? 0),
            budget: Number(r.estimatedBudget ?? 0),
            spent: Number(r.actualBudget ?? 0),
            forecast: Number(r.actualBudget ?? 0),
            teamSize: Number(r.teamSize ?? 0),
            milestonesTotal: Number(r.milestones ?? 0),
            milestonesCompleted: Number(r.completedMilestones ?? 0),
            tasksTotal: 0,
            tasksCompleted: 0,
            issuesOpen: 0,
            riskLevel: RISK_LEVELS.includes(r.riskLevel as Project['riskLevel'])
              ? (r.riskLevel as Project['riskLevel'])
              : 'low',
            healthScore: 0,
            lastUpdated: String(r.updatedAt ?? ''),
          };
        });
        setRows(mapped);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load projects');
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = rows.length;
    const activeProjects = rows.filter(p => p.status === 'active').length;
    const completedProjects = rows.filter(p => p.status === 'completed').length;
    const atRiskProjects = rows.filter(p => ['at-risk', 'delayed'].includes(p.status)).length;
    const planningProjects = rows.filter(p => p.status === 'planning').length;
    const onHoldProjects = rows.filter(p => p.status === 'on-hold').length;

    const totalBudget = rows.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = rows.reduce((sum, p) => sum + p.spent, 0);
    const totalForecast = rows.reduce((sum, p) => sum + p.forecast, 0);
    const totalTeamMembers = rows.reduce((sum, p) => sum + p.teamSize, 0);

    const avgProgress = totalProjects > 0 ? rows.reduce((sum, p) => sum + p.progressPercent, 0) / totalProjects : 0;
    const avgHealthScore = totalProjects > 0 ? rows.reduce((sum, p) => sum + p.healthScore, 0) / totalProjects : 0;

    const criticalProjects = rows.filter(p => p.priority === 'critical').length;
    const highPriorityProjects = rows.filter(p => p.priority === 'high').length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      atRiskProjects,
      planningProjects,
      onHoldProjects,
      totalBudget,
      totalSpent,
      totalForecast,
      totalTeamMembers,
      avgProgress,
      avgHealthScore,
      criticalProjects,
      highPriorityProjects
    };
  }, [rows]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return rows.filter(project => {
      const matchesSearch =
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedPriority, rows]);

  const getCategoryBadge = (category: string) => {
    const badges = {
      'construction': 'bg-orange-100 text-orange-800',
      'it': 'bg-blue-100 text-blue-800',
      'manufacturing': 'bg-purple-100 text-purple-800',
      'infrastructure': 'bg-green-100 text-green-800',
      'r&d': 'bg-pink-100 text-pink-800'
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'planning': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'at-risk': 'bg-orange-100 text-orange-800',
      'delayed': 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRiskBadge = (risk: string) => {
    const badges = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return badges[risk as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-blue-600';
    if (status === 'at-risk' || status === 'delayed') return 'bg-red-600';
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-teal-600" />
          Projects Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Portfolio overview with project status, progress, and key metrics • FY 2025-26</p>
      </div>

      {isLoading && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Loading projects...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Summary Cards - 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-teal-700 text-sm font-medium">Total Projects</p>
            <FolderKanban className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-900">{stats.totalProjects}</p>
          <p className="text-xs text-teal-600 mt-1">{stats.totalTeamMembers} team members</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 text-sm font-medium">Active</p>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.activeProjects}</p>
          <p className="text-xs text-green-600 mt-1">{stats.planningProjects} in planning</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-sm font-medium">Completed</p>
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.completedProjects}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.onHoldProjects} on hold</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-700 text-sm font-medium">At Risk</p>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.atRiskProjects}</p>
          <p className="text-xs text-red-600 mt-1">{stats.criticalProjects} critical</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-700 text-sm font-medium">Total Budget</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">₹{(stats.totalBudget / 10000000).toFixed(1)}Cr</p>
          <p className="text-xs text-purple-600 mt-1">₹{(stats.totalSpent / 10000000).toFixed(1)}Cr spent</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-700 text-sm font-medium">Avg Health</p>
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-900">{stats.avgHealthScore.toFixed(0)}%</p>
          <p className="text-xs text-indigo-600 mt-1">{stats.avgProgress.toFixed(0)}% avg progress</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <input
              type="text"
              placeholder="Search projects, PM, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="construction">Construction</option>
              <option value="it">IT</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="r&d">R&D</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="at-risk">At Risk</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-2 mb-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{project.projectName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(project.category)}`}>
                    {project.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                    {project.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(project.priority)}`}>
                    {project.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-teal-600">{project.projectCode}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    PM: {project.projectManager}
                  </span>
                  <span>•</span>
                  <span>Client: {project.client}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">Health Score:</span>
                  <span className={`text-lg font-bold ${getHealthScoreColor(project.healthScore)}`}>
                    {project.healthScore}%
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadge(project.riskLevel)}`}>
                  {project.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Progress: {project.progressPercent}%</span>
                <span className="text-xs text-gray-600">
                  {project.tasksCompleted}/{project.tasksTotal} tasks • {project.milestonesCompleted}/{project.milestonesTotal} milestones
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(project.progressPercent, project.status)}`}
                  style={{ width: `${project.progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Project Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Budget</p>
                <p className="text-lg font-bold text-blue-900">₹{(project.budget / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-blue-700 mt-1">
                  {(project.budget > 0 ? (project.spent / project.budget) * 100 : 0).toFixed(0)}% spent
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1">Actual Spent</p>
                <p className="text-lg font-bold text-purple-900">₹{(project.spent / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-purple-700 mt-1">To date</p>
              </div>

              <div className={`rounded-lg p-3 border ${
                project.forecast <= project.budget
                  ? 'bg-green-50 border-green-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <p className={`text-xs font-medium mb-1 ${
                  project.forecast <= project.budget ? 'text-green-600' : 'text-red-600'
                }`}>
                  Forecast EAC
                </p>
                <p className={`text-lg font-bold ${
                  project.forecast <= project.budget ? 'text-green-900' : 'text-red-900'
                }`}>
                  ₹{(project.forecast / 10000000).toFixed(2)}Cr
                </p>
                <p className={`text-xs mt-1 ${
                  project.forecast <= project.budget ? 'text-green-700' : 'text-red-700'
                }`}>
                  {project.forecast <= project.budget ? 'Under' : 'Over'} budget
                </p>
              </div>

              <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                <p className="text-xs text-teal-600 font-medium mb-1">Team Size</p>
                <p className="text-lg font-bold text-teal-900">{project.teamSize}</p>
                <p className="text-xs text-teal-700 mt-1">{project.issuesOpen} open issues</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-orange-600 font-medium mb-1">Timeline</p>
                <p className="text-sm font-bold text-orange-900">
                  {new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - {new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
                {project.endDate !== project.plannedEndDate && (
                  <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Delayed
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-teal-600" />
          Project Dashboard Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Project Status Types</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 font-bold">•</span>
                <span><strong>Planning:</strong> Project initiation phase, requirements gathering, resource allocation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Active:</strong> Execution in progress, on track, no major issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>On Hold:</strong> Temporarily paused, awaiting decisions or resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Completed:</strong> All deliverables complete, project closed successfully</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>At Risk:</strong> Issues affecting timeline, budget, or quality; intervention needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Delayed:</strong> Behind schedule, exceeding planned end date</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Health Score Indicators</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>80-100% (Healthy):</strong> On track, all parameters within acceptable range</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>60-79% (Caution):</strong> Some concerns, requires monitoring and possible corrective action</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Below 60% (Critical):</strong> Significant issues, immediate intervention required</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-3 italic">
              Health score is calculated based on schedule performance, cost performance, quality metrics, resource utilization, and issue resolution rate.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Priority Levels</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Critical:</strong> Business-critical, requires immediate attention and top resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>High:</strong> Important for business, significant impact on operations or revenue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>Medium:</strong> Standard priority, scheduled in regular workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Low:</strong> Nice-to-have, can be deferred if resources are constrained</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Daily Monitoring:</strong> Review dashboard daily for status updates and alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Weekly Reviews:</strong> Conduct team meetings to discuss progress and blockers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Monthly Reporting:</strong> Generate comprehensive reports for stakeholders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Risk Management:</strong> Address at-risk projects immediately with mitigation plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Resource Optimization:</strong> Balance team allocation across active projects</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
