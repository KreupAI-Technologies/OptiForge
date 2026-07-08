'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Package,
  BarChart3,
  ArrowRight,
  Filter,
  RefreshCw,
  Layout,
  Download,
  Bell,
  Zap,
  Activity,
  Target,
} from 'lucide-react';
import {
  CreateProjectModal,
  QuickActionsModal,
  FilterDashboardModal,
  CustomizeWidgetsModal,
  ExportDashboardModal,
  ViewAlertsModal,
  RefreshDashboardModal,
  ViewDetailsModal,
} from '@/components/project-management/DashboardModals';
import { StatHighlight, PremiumCard } from '@/components/dashboard/DashboardWidgets';
import { ProjectProfitabilityGauge } from '@/components/project-management/ProjectProfitabilityGauge';

interface RecentProject {
  id: string;
  name: string;
  progress: number;
  status: string;
  dueDate: string;
  manager: string;
  budget: number;
  spent: number;
}

interface ResourceRow {
  role: string;
  allocated: number;
  available: number;
  utilization: number;
}

export default function ProjectDashboardPage() {
  // Data + fetch states
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [resourceData, setResourceData] = useState<ResourceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const router = useRouter();

  const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [plansRaw, utilRaw] = await Promise.all([
          projectManagementService.getPmProjectPlansRaw(),
          projectManagementService.getPmResourceUtilization(),
        ]);
        const projects: RecentProject[] = (plansRaw || []).map((p: any) => ({
          id: String(p.id ?? p.projectId ?? p.projectCode ?? ''),
          name: p.projectName ?? p.name ?? p.projectCode ?? 'Project',
          progress: Number(p.progressPercentage ?? p.progress ?? 0),
          status: p.status ?? 'On Track',
          dueDate: p.endDate ?? p.dueDate ?? '',
          manager: p.projectManager ?? p.manager ?? '',
          budget: Number(p.estimatedBudget ?? p.budget ?? 0),
          spent: Number(p.actualBudget ?? p.spent ?? 0),
        }));
        const resources: ResourceRow[] = (utilRaw || []).map((r: any) => {
          const allocated = Number(r.allocated ?? r.allocatedCount ?? r.utilized ?? 0);
          const available = Number(r.available ?? r.availableCount ?? 0);
          return {
            role: r.role ?? r.resourceType ?? r.name ?? 'Resource',
            allocated,
            available,
            utilization: Number(
              r.utilization ?? r.utilizationPercentage ??
              (allocated + available > 0 ? Math.round((allocated / (allocated + available)) * 100) : 0),
            ),
          };
        });
        setRecentProjects(projects);
        setResourceData(resources);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setRecentProjects([]);
        setResourceData([]);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => { loadDashboard(); }, []);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Statistics — derived from fetched projects/resources where possible.
  const stats = useMemo(() => {
    const totalProjects = recentProjects.length;
    const activeProjects = recentProjects.filter(
      (p) => !/complete|closed|done/i.test(p.status),
    ).length;
    const completedProjects = recentProjects.filter((p) => /complete|closed|done/i.test(p.status)).length;
    const delayedProjects = recentProjects.filter((p) => /delay|at risk|overdue/i.test(p.status)).length;
    const totalBudget = recentProjects.reduce((s, p) => s + (p.budget || 0), 0);
    const spentAmount = recentProjects.reduce((s, p) => s + (p.spent || 0), 0);
    const resourceUtilization = resourceData.length
      ? Math.round(resourceData.reduce((s, r) => s + (r.utilization || 0), 0) / resourceData.length)
      : 0;
    const avgProjectHealth = totalProjects
      ? Math.round(recentProjects.reduce((s, p) => s + (p.progress || 0), 0) / totalProjects)
      : 0;
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      delayedProjects,
      totalBudget,
      spentAmount,
      plannedRevenue: 0,
      actualRevenue: 0,
      resourceUtilization,
      avgProjectHealth,
    };
  }, [recentProjects, resourceData]);

  // Upcoming Milestones
  const upcomingMilestones = [
    { project: 'Taj Hotel Kitchen', milestone: 'Equipment Installation Complete', date: '2024-03-25', days: 8 },
    { project: 'BigBasket Cold Storage', milestone: 'Panel Assembly Complete', date: '2024-03-30', days: 13 },
    { project: 'L&T Switchgear', milestone: 'Final Testing & Documentation', date: '2024-03-20', days: 3 },
    { project: 'ITC Grand Kitchen', milestone: 'Design Approval', date: '2024-01-15', days: -2 },
  ];

  // Project Health Trend (last 6 months)
  const healthTrend = [
    { month: 'Oct', score: 68 },
    { month: 'Nov', score: 72 },
    { month: 'Dec', score: 70 },
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 73 },
    { month: 'Mar', score: 72 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-700';
      case 'At Risk': return 'bg-yellow-100 text-yellow-700';
      case 'Delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handler functions
  const handleCreateProject = (_data: any) => {
    setShowCreateModal(false);
    router.push('/project-management/create');
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActionsModal(false);
    if (action) router.push(action);
  };

  const handleApplyFilters = (_filters: any) => {
    // Filters apply to the client-side derived views; dismiss the modal.
    setShowFilterModal(false);
  };

  const handleSaveWidgets = (_widgets: any) => {
    setShowCustomizeModal(false);
  };

  const handleExport = (_settings: any) => {
    exportToCsv('project-dashboard', recentProjects as unknown as Record<string, unknown>[]);
    setShowExportModal(false);
  };

  const handleRefresh = () => {
    loadDashboard();
    setShowRefreshModal(false);
  };

  const openDetailsModal = (project: any) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  return (
    <div className="w-full min-h-screen px-3 py-2 space-y-3 bg-slate-50 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-100 mt-1">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">
              Project Portfolio
            </h1>
            <p className="text-sm text-gray-500 font-medium">Real-time execution oversight and strategic metrics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQuickActionsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-black uppercase tracking-tight text-[9px] hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Launch Action</span>
          </button>
          <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all shadow-sm group"
            title="Filter Insights"
          >
            <Filter className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
          </button>
          <button
            onClick={() => setShowRefreshModal(true)}
            className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all shadow-sm group"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
          </button>
          <Link
            href="/project-management/create-enhanced"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-black uppercase tracking-tight text-[9px] hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatHighlight
          label="Portfolio Health"
          value={`${stats.avgProjectHealth}%`}
          subValue="↑ 2.4% this week"
          icon={Activity}
          colorClass="bg-blue-600"
        />
        <StatHighlight
          label="Budget Utilization"
          value={Math.round((stats.spentAmount / stats.totalBudget) * 100) + '%'}
          subValue={`${formatCurrency(stats.spentAmount)} spent`}
          icon={DollarSign}
          colorClass="bg-emerald-600"
        />
        <StatHighlight
          label="Resource Load"
          value={`${stats.resourceUtilization}%`}
          subValue="85th percentile peak"
          icon={Users}
          colorClass="bg-indigo-600"
        />
        <StatHighlight
          label="Critical Risks"
          value={stats.delayedProjects.toString()}
          subValue="Action required"
          icon={AlertTriangle}
          colorClass="bg-rose-600"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ProjectProfitabilityGauge
          income={stats.actualRevenue}
          expenditure={stats.spentAmount}
          profit={stats.actualRevenue - stats.spentAmount}
          margin={((stats.actualRevenue - stats.spentAmount) / stats.actualRevenue) * 100}
        />

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-none mb-1">Resource Orbit</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Deployment Efficiency</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-3">
            {resourceData.slice(0, 4).map((resource, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{resource.role}</span>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">{resource.utilization}% UTILIZED</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${resource.utilization >= 85 ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                      resource.utilization >= 75 ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' :
                        'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                    style={{ width: `${resource.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Projects and Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-2 rounded-xl border border-white/50">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Focus Projects</h3>
            <Link href="/project-management" className="text-[9px] font-black text-blue-600 uppercase tracking-tight hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Deep Dive <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          {loadError && (
            <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
              {loadError}
            </div>
          )}
          {isLoading && !loadError && (
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight p-2">Loading projects…</div>
          )}
          {!isLoading && !loadError && recentProjects.length === 0 && (
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight p-2">No projects to display</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentProjects.map((project) => (
              <PremiumCard
                key={project.id}
                className="p-3 border-l-4 border-l-blue-600 group cursor-pointer hover:border-l-blue-400 rounded-xl"
                onClick={() => openDetailsModal(project)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-gray-900 leading-tight mb-0.5 group-hover:text-blue-600 transition-colors truncate">{project.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Lead: {project.manager}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight flex-shrink-0 ${getStatusColor(project.status).replace('bg-', 'bg-opacity-20 text-').replace('text-', 'text-opacity-100 ')}`}>
                    {project.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tight">EXECUTION PHASE</span>
                    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-700 to-blue-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[8px] font-bold">{new Date(project.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <p className="text-[8px] font-black text-gray-900 uppercase tracking-tight">BUDGET: {Math.round(project.spent / 100000)}L / {Math.round(project.budget / 100000)}L</p>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-2 rounded-xl border border-white/50">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Milestone Watch</h3>
            <Target className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            {upcomingMilestones.map((milestone, index) => (
              <PremiumCard key={index} className="p-3 flex items-start gap-3 hover:bg-white transition-colors cursor-pointer group rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${milestone.days < 0 ? 'bg-rose-600 shadow-rose-100' :
                  milestone.days <= 7 ? 'bg-orange-600 shadow-orange-100' :
                    'bg-blue-600 shadow-blue-100'
                  }`}>
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight mb-0.5 group-hover:text-blue-600 transition-colors truncate">{milestone.milestone}</h4>
                  <p className="text-[9px] text-gray-500 font-bold mb-2 truncate">{milestone.project}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[8px] font-bold">{new Date(milestone.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-md ${milestone.days < 0 ? 'bg-rose-50 text-rose-600' :
                      milestone.days === 0 ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                      {milestone.days < 0 ? `${Math.abs(milestone.days)}D OVER` :
                        milestone.days === 0 ? 'DUE' :
                          `${milestone.days}D REM`}
                    </span>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
          <button className="w-full py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-tight text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
            Exploded View
          </button>
        </div>
      </div>

      {/* Bottom Intelligence Pannel Placeholder */}
      <PremiumCard className="p-6 text-center bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white relative overflow-hidden group rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 group-hover:scale-110 transition-transform duration-[10s]"></div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10 shadow-xl">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2 italic">Next-Gen Predictive AI</h2>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-[10px] mb-4 max-w-sm mx-auto leading-relaxed">System is synthesizing historical performance for neural forecasting</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-900 rounded-lg font-black uppercase tracking-tight text-[9px] shadow-xl transform hover:scale-105 active:scale-95 transition-all">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Enable Neural Insights</span>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] group-hover:bg-blue-400/30 transition-all duration-700"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-[60px] group-hover:bg-indigo-400/30 transition-all duration-700"></div>
      </PremiumCard>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />

      <QuickActionsModal
        isOpen={showQuickActionsModal}
        onClose={() => setShowQuickActionsModal(false)}
        onAction={handleQuickAction}
      />

      <FilterDashboardModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />

      <CustomizeWidgetsModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        onSave={handleSaveWidgets}
      />

      <ExportDashboardModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <ViewAlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
      />

      <RefreshDashboardModal
        isOpen={showRefreshModal}
        onClose={() => setShowRefreshModal(false)}
        onRefresh={handleRefresh}
      />

      <ViewDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </div>
  );
}
