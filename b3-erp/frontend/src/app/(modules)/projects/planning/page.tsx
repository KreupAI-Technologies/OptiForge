'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmProjectPlan } from '@/services/ProjectManagementService';
import { Plus, Search, Eye, Edit, Trash2, FolderKanban, Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, Download, Filter, ChevronLeft, ChevronRight, Target } from 'lucide-react';

interface ProjectPlan {
  id: string;
  projectCode: string;
  projectName: string;
  client: string;
  projectManager: string;
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  actualBudget: number;
  status: 'planning' | 'approved' | 'in_execution' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progressPercentage: number;
  phase: string;
  milestones: number;
  completedMilestones: number;
  teamSize: number;
  location: string;
  projectType: 'Commercial Kitchen' | 'Industrial Setup' | 'Hospital Equipment' | 'Institutional' | 'Residential' | 'Custom';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  plannedHours: number;
  actualHours: number;
}

const mockProjectPlans: ProjectPlan[] = [
  {
    id: 'PROJ-001',
    projectCode: 'PRJ-2025-001',
    projectName: 'Hotel Paradise Kitchen Setup',
    client: 'Hotel Paradise Ltd',
    projectManager: 'Rajesh Kumar',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    estimatedBudget: 45000000,
    actualBudget: 42000000,
    status: 'in_execution',
    priority: 'high',
    progressPercentage: 65,
    phase: 'Installation & Setup',
    milestones: 8,
    completedMilestones: 5,
    teamSize: 12,
    location: 'Mumbai, Maharashtra',
    projectType: 'Commercial Kitchen',
    riskLevel: 'medium',
    plannedHours: 2400,
    actualHours: 1560,
  },
  {
    id: 'PROJ-002',
    projectCode: 'PRJ-2025-002',
    projectName: 'City General Hospital Equipment',
    client: 'City General Hospital',
    projectManager: 'Priya Sharma',
    startDate: '2025-10-15',
    endDate: '2026-02-28',
    estimatedBudget: 78000000,
    actualBudget: 5000000,
    status: 'planning',
    priority: 'critical',
    progressPercentage: 15,
    phase: 'Planning & Design',
    milestones: 12,
    completedMilestones: 2,
    teamSize: 18,
    location: 'Bangalore, Karnataka',
    projectType: 'Hospital Equipment',
    riskLevel: 'high',
    plannedHours: 4800,
    actualHours: 720,
  },
  {
    id: 'PROJ-003',
    projectCode: 'PRJ-2025-003',
    projectName: 'Culinary Institute Kitchen Lab',
    client: 'Springfield Academy',
    projectManager: 'Amit Patel',
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    estimatedBudget: 28000000,
    actualBudget: 26500000,
    status: 'in_execution',
    priority: 'medium',
    progressPercentage: 80,
    phase: 'Final Testing',
    milestones: 6,
    completedMilestones: 5,
    teamSize: 8,
    location: 'Delhi NCR',
    projectType: 'Institutional',
    riskLevel: 'low',
    plannedHours: 1800,
    actualHours: 1440,
  },
  {
    id: 'PROJ-004',
    projectCode: 'PRJ-2025-004',
    projectName: 'Industrial Bakery Setup',
    client: 'Artisan Bakers Co',
    projectManager: 'Vikram Singh',
    startDate: '2025-11-01',
    endDate: '2026-03-31',
    estimatedBudget: 95000000,
    actualBudget: 8000000,
    status: 'approved',
    priority: 'high',
    progressPercentage: 5,
    phase: 'Resource Allocation',
    milestones: 15,
    completedMilestones: 1,
    teamSize: 25,
    location: 'Pune, Maharashtra',
    projectType: 'Industrial Setup',
    riskLevel: 'medium',
    plannedHours: 6000,
    actualHours: 300,
  },
  {
    id: 'PROJ-005',
    projectCode: 'PRJ-2025-005',
    projectName: 'Restaurant Group Chain Expansion',
    client: 'Restaurant Group LLC',
    projectManager: 'Neha Kulkarni',
    startDate: '2025-08-15',
    endDate: '2025-10-30',
    estimatedBudget: 52000000,
    actualBudget: 51000000,
    status: 'completed',
    priority: 'medium',
    progressPercentage: 100,
    phase: 'Handover Complete',
    milestones: 10,
    completedMilestones: 10,
    teamSize: 15,
    location: 'Hyderabad, Telangana',
    projectType: 'Commercial Kitchen',
    riskLevel: 'low',
    plannedHours: 3200,
    actualHours: 3100,
  },
];

const statusColors = {
  planning: 'bg-blue-100 text-blue-700',
  approved: 'bg-purple-100 text-purple-700',
  in_execution: 'bg-yellow-100 text-yellow-700',
  on_hold: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const riskLevelColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function mapPlan(p: PmProjectPlan): ProjectPlan {
  return {
    id: p.id,
    projectCode: p.projectCode ?? '',
    projectName: p.projectName ?? '',
    client: p.client ?? '',
    projectManager: p.projectManager ?? '',
    startDate: p.startDate ? String(p.startDate).slice(0, 10) : '',
    endDate: p.endDate ? String(p.endDate).slice(0, 10) : '',
    estimatedBudget: Number(p.estimatedBudget ?? 0),
    actualBudget: Number(p.actualBudget ?? 0),
    status: (p.status as ProjectPlan['status']) ?? 'planning',
    priority: (p.priority as ProjectPlan['priority']) ?? 'medium',
    progressPercentage: Number(p.progressPercentage ?? 0),
    phase: p.phase ?? '',
    milestones: Number(p.milestones ?? 0),
    completedMilestones: Number(p.completedMilestones ?? 0),
    teamSize: Number(p.teamSize ?? 0),
    location: p.location ?? '',
    projectType: (p.projectType as ProjectPlan['projectType']) ?? 'Custom',
    riskLevel: (p.riskLevel as ProjectPlan['riskLevel']) ?? 'low',
    plannedHours: Number(p.plannedHours ?? 0),
    actualHours: Number(p.actualHours ?? 0),
  };
}

export default function ProjectPlanningPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await projectManagementService.listProjectPlans();
        if (!cancelled) setProjects((rows ?? []).map(mapPlan));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load project plans');
          setProjects([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalProjects: projects.length,
    inExecution: projects.filter((p) => p.status === 'in_execution').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.estimatedBudget, 0),
  };

  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project plan?')) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="w-full min-h-screen px-3 py-2 ">
      {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading project plans...</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>)}
      {/* Stats with Add Button */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Execution</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inExecution}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Budget</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatIndianCurrency(stats.totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/projects/planning/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by code, name, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="approved">Approved</option>
          <option value="in_execution">In Execution</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client & Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{project.projectCode}</div>
                    <div className="text-sm text-gray-700">{project.projectName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{project.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{project.client}</div>
                    <div className="text-xs text-blue-600 mt-0.5 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {project.projectManager}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{project.startDate}</span>
                    </div>
                    <div className="flex items-center text-xs text-blue-600 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{project.endDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{formatIndianCurrency(project.estimatedBudget)}</div>
                    <div className="text-xs text-gray-500">Actual: {formatIndianCurrency(project.actualBudget)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{project.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.progressPercentage === 100
                              ? 'bg-green-500'
                              : project.progressPercentage >= 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${project.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {project.completedMilestones}/{project.milestones}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskLevelColors[project.riskLevel]}`}>
                      {project.riskLevel.charAt(0).toUpperCase() + project.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[project.priority]}`}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}>
                      {project.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/projects/planning/view/${project.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                       
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/projects/planning/edit/${project.id}`)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                       
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                       
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
