'use client';

import { useState, useEffect } from 'react';
import { exportToCsv } from '@/lib/export';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertTriangle, Users, Package, Target, Settings, Calendar, Download, Target as TargetIcon, GitCompare, Bell, Send, Share2, Bookmark } from 'lucide-react';
import {
 CustomDashboardModal,
 TimePeriodFilterModal,
 ExportAnalyticsModal,
 KPIConfigurationModal,
 DrillDownDetailsModal,
 ComparisonAnalysisModal,
 AlertThresholdModal,
 ScheduleAnalyticsModal,
 ShareAnalyticsModal,
 SavedViewsModal,
} from '@/components/project-management/AnalyticsModals';
import { projectManagementService, Project, PmAnalyticsSummary } from '@/services/ProjectManagementService';

interface ProjectMetrics {
 totalProjects: number;
 activeProjects: number;
 completedProjects: number;
 delayedProjects: number;
 totalRevenue: number;
 totalCost: number;
 profitMargin: number;
 avgProjectDuration: number;
 onTimeDelivery: number;
 customerSatisfaction: number;
}

interface MonthlyData {
 month: string;
 revenue: number;
 cost: number;
 profit: number;
 projectsCompleted: number;
}

interface ProjectTypeMetrics {
 type: string;
 count: number;
 revenue: number;
 avgDuration: number;
 successRate: number;
 color: string;
}

interface ResourceUtilization {
 department: string;
 allocated: number;
 available: number;
 utilization: number;
 efficiency: number;
}

export default function ProjectAnalyticsPage() {
 const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
 const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'projects'>('revenue');
 const [isLoading, setIsLoading] = useState(true);
 const [projects, setProjects] = useState<Project[]>([]);
 const [summary, setSummary] = useState<PmAnalyticsSummary | null>(null);

 // Modal states
 const [isCustomDashboardModalOpen, setIsCustomDashboardModalOpen] = useState(false);
 const [isTimePeriodFilterModalOpen, setIsTimePeriodFilterModalOpen] = useState(false);
 const [isExportAnalyticsModalOpen, setIsExportAnalyticsModalOpen] = useState(false);
 const [isKPIConfigurationModalOpen, setIsKPIConfigurationModalOpen] = useState(false);
 const [isDrillDownDetailsModalOpen, setIsDrillDownDetailsModalOpen] = useState(false);
 const [isComparisonAnalysisModalOpen, setIsComparisonAnalysisModalOpen] = useState(false);
 const [isAlertThresholdModalOpen, setIsAlertThresholdModalOpen] = useState(false);
 const [isScheduleAnalyticsModalOpen, setIsScheduleAnalyticsModalOpen] = useState(false);
 const [isShareAnalyticsModalOpen, setIsShareAnalyticsModalOpen] = useState(false);
 const [isSavedViewsModalOpen, setIsSavedViewsModalOpen] = useState(false);
 const [drillDownMetric, setDrillDownMetric] = useState<string | null>(null);
 const [drillDownData, setDrillDownData] = useState<any>(null);

 // Fetch projects from service
 useEffect(() => {
  const fetchProjects = async () => {
   setIsLoading(true);
   try {
    const [data, summaryData] = await Promise.all([
     projectManagementService.getProjects(),
     projectManagementService.getPmAnalyticsSummary(),
    ]);
    setProjects(data);
    setSummary(summaryData);
   } catch (error) {
    console.error('Error fetching projects for analytics:', error);
   } finally {
    setIsLoading(false);
   }
  };
  fetchProjects();
 }, []);

 // Compute metrics: prefer aggregated backend summary, then derive from
 // fetched projects, then fall back to static defaults.
 const computedMetrics: ProjectMetrics = summary ? {
  totalProjects: summary.metrics.totalProjects,
  activeProjects: summary.metrics.activeProjects,
  completedProjects: summary.metrics.completedProjects,
  delayedProjects: summary.metrics.delayedProjects,
  totalRevenue: summary.metrics.totalRevenue,
  totalCost: summary.metrics.totalCost,
  profitMargin: summary.metrics.profitMargin,
  avgProjectDuration: 92,
  onTimeDelivery: summary.metrics.onTimeDelivery,
  customerSatisfaction: 4.2,
 } : projects.length > 0 ? {
  totalProjects: projects.length,
  activeProjects: projects.filter(p => p.status === 'In Progress').length,
  completedProjects: projects.filter(p => p.status === 'Completed').length,
  delayedProjects: projects.filter(p => p.status === 'Delayed').length,
  totalRevenue: projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0),
  totalCost: projects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0),
  profitMargin: projects.length > 0
   ? Math.round(((projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0) - projects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0)) / projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0)) * 100 * 10) / 10
   : 28.4,
  avgProjectDuration: 92,
  onTimeDelivery: projects.length > 0
   ? Math.round((projects.filter(p => p.status !== 'Delayed').length / projects.length) * 100)
   : 78,
  customerSatisfaction: 4.2,
 } : {
  totalProjects: 45,
  activeProjects: 18,
  completedProjects: 22,
  delayedProjects: 5,
  totalRevenue: 125000000,
  totalCost: 89500000,
  profitMargin: 28.4,
  avgProjectDuration: 92,
  onTimeDelivery: 78,
  customerSatisfaction: 4.2,
 };

 // Use computed metrics
 const metrics = computedMetrics;

 const monthlyData: MonthlyData[] = [
  { month: 'Jul 24', revenue: 8500000, cost: 6200000, profit: 2300000, projectsCompleted: 2 },
  { month: 'Aug 24', revenue: 11200000, cost: 8100000, profit: 3100000, projectsCompleted: 3 },
  { month: 'Sep 24', revenue: 9800000, cost: 7000000, profit: 2800000, projectsCompleted: 2 },
  { month: 'Oct 24', revenue: 13500000, cost: 9800000, profit: 3700000, projectsCompleted: 4 },
  { month: 'Nov 24', revenue: 12100000, cost: 8700000, profit: 3400000, projectsCompleted: 3 },
  { month: 'Dec 24', revenue: 15200000, cost: 10800000, profit: 4400000, projectsCompleted: 4 },
  { month: 'Jan 25', revenue: 16800000, cost: 12100000, profit: 4700000, projectsCompleted: 4 },
 ];

 const fallbackProjectTypeMetrics: ProjectTypeMetrics[] = [
  { type: 'Commercial Kitchen', count: 18, revenue: 52000000, avgDuration: 105, successRate: 83, color: 'bg-blue-500' },
  { type: 'Cold Room', count: 12, revenue: 38000000, avgDuration: 78, successRate: 92, color: 'bg-cyan-500' },
  { type: 'Industrial Kitchen', count: 8, revenue: 28000000, avgDuration: 120, successRate: 75, color: 'bg-green-500' },
  { type: 'Modular Kitchen', count: 5, revenue: 5500000, avgDuration: 42, successRate: 100, color: 'bg-purple-500' },
  { type: 'Switchgear', count: 2, revenue: 15000000, avgDuration: 150, successRate: 50, color: 'bg-orange-500' },
 ];

 const projectTypeMetrics: ProjectTypeMetrics[] =
  summary && summary.projectTypeMetrics.length > 0
   ? summary.projectTypeMetrics.map((t) => ({
      type: t.type,
      count: t.count,
      revenue: t.revenue,
      avgDuration: t.avgDuration,
      successRate: t.successRate,
      color: t.color,
     }))
   : fallbackProjectTypeMetrics;

 const resourceUtilization: ResourceUtilization[] = [
  { department: 'Installation Team', allocated: 85, available: 15, utilization: 85, efficiency: 92 },
  { department: 'Project Management', allocated: 78, available: 22, utilization: 78, efficiency: 88 },
  { department: 'Quality Control', allocated: 62, available: 38, utilization: 62, efficiency: 95 },
  { department: 'Design & Engineering', allocated: 70, available: 30, utilization: 70, efficiency: 90 },
  { department: 'Procurement', allocated: 55, available: 45, utilization: 55, efficiency: 85 },
  { department: 'Service & Support', allocated: 48, available: 52, utilization: 48, efficiency: 87 },
 ];

 const fallbackTopProjects = [
  { name: 'Taj Hotels - Commercial Kitchen', revenue: 8500000, profit: 2550000, margin: 30, status: 'In Progress' },
  { name: 'L&T Campus - Industrial Kitchen', revenue: 12000000, profit: 3000000, margin: 25, status: 'In Progress' },
  { name: 'Siemens - Switchgear Unit', revenue: 15000000, profit: 3750000, margin: 25, status: 'In Progress' },
  { name: 'ITC Grand - Bakery Setup', revenue: 3500000, profit: 1050000, margin: 30, status: 'Completed' },
  { name: 'BigBasket - Cold Room', revenue: 4200000, profit: 1260000, margin: 30, status: 'Completed' },
 ];

 const topProjects =
  summary && summary.topProjects.length > 0 ? summary.topProjects : fallbackTopProjects;

 const getMaxValue = () => {
  return Math.max(...monthlyData.map(d => {
   if (selectedMetric === 'revenue') return d.revenue;
   if (selectedMetric === 'profit') return d.profit;
   return d.projectsCompleted * 3000000;
  }));
 };

 const maxValue = getMaxValue();

 // Modal Handlers
 const handleSaveDashboardConfig = (config: any) => {
  console.log('Dashboard Config:', config);
  setIsCustomDashboardModalOpen(false);
 };

 const handleApplyTimePeriodFilter = (filter: any) => {
  console.log('Time Period Filter:', filter);
  setIsTimePeriodFilterModalOpen(false);
 };

 const handleExportAnalytics = (exportConfig: any) => {
  exportToCsv('project-analytics', projects as unknown as Record<string, unknown>[]);
  setIsExportAnalyticsModalOpen(false);
 };

 const handleSaveKPIConfiguration = (config: any) => {
  console.log('KPI Configuration:', config);
  setIsKPIConfigurationModalOpen(false);
 };

 const handleComparisonAnalysis = () => {
  setIsComparisonAnalysisModalOpen(false);
 };

 const handleSaveAlertThresholds = (thresholds: any) => {
  console.log('Alert Thresholds:', thresholds);
  setIsAlertThresholdModalOpen(false);
 };

 const handleScheduleAnalytics = (schedule: any) => {
  console.log('Schedule Analytics:', schedule);
  setIsScheduleAnalyticsModalOpen(false);
 };

 const handleShareAnalytics = (shareData: any) => {
  console.log('Share Analytics:', shareData);
  setIsShareAnalyticsModalOpen(false);
 };

 const handleLoadView = (viewId: string) => {
  console.log('Load View:', viewId);
  setIsSavedViewsModalOpen(false);
 };

 const handleDrillDown = (metric: string, data: any) => {
  setDrillDownMetric(metric);
  setDrillDownData(data);
  setIsDrillDownDetailsModalOpen(true);
 };

 if (isLoading) {
  return (
   <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
     <p className="text-gray-600">Loading analytics data...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
    {/* Page Header with Actions */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
     <div>
      <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
      <p className="text-sm text-gray-600 mt-1">Comprehensive insights into project performance</p>
     </div>
     <div className="flex flex-wrap gap-2">
      <button
       onClick={() => setIsSavedViewsModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Bookmark className="h-4 w-4 mr-2" />
       Saved Views
      </button>
      <button
       onClick={() => setIsCustomDashboardModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Settings className="h-4 w-4 mr-2" />
       Customize
      </button>
      <button
       onClick={() => setIsTimePeriodFilterModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Calendar className="h-4 w-4 mr-2" />
       Time Filter
      </button>
      <button
       onClick={() => setIsKPIConfigurationModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <TargetIcon className="h-4 w-4 mr-2" />
       KPI Config
      </button>
      <button
       onClick={() => setIsComparisonAnalysisModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <GitCompare className="h-4 w-4 mr-2" />
       Compare
      </button>
      <button
       onClick={() => setIsAlertThresholdModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Bell className="h-4 w-4 mr-2" />
       Alerts
      </button>
      <button
       onClick={() => setIsScheduleAnalyticsModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Send className="h-4 w-4 mr-2" />
       Schedule
      </button>
      <button
       onClick={() => setIsShareAnalyticsModalOpen(true)}
       className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
       <Share2 className="h-4 w-4 mr-2" />
       Share
      </button>
      <button
       onClick={() => setIsExportAnalyticsModalOpen(true)}
       className="inline-flex items-center px-3 py-2 bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700 transition-colors"
      >
       <Download className="h-4 w-4 mr-2" />
       Export
      </button>
     </div>
    </div>

   {/* Time Range Filter */}
   <div className="flex justify-end space-x-2 mb-2">
    <button
     onClick={() => setTimeRange('month')}
     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      timeRange === 'month'
       ? 'bg-blue-600 text-white'
       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
     }`}
    >
     Month
    </button>
     <button
      onClick={() => setTimeRange('quarter')}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
       timeRange === 'quarter'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
     >
      Quarter
     </button>
     <button
      onClick={() => setTimeRange('year')}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
       timeRange === 'year'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
     >
      Year
     </button>
    </div>
   </div>

   {/* Key Metrics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
    <div
     onClick={() => handleDrillDown('Total Projects', { total: metrics.totalProjects, active: metrics.activeProjects, completed: metrics.completedProjects })}
     className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
     <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-blue-100 rounded-lg">
       <BarChart3 className="h-6 w-6 text-blue-600" />
      </div>
      <span className="text-xs text-green-600 font-semibold flex items-center">
       <TrendingUp className="h-3 w-3 mr-1" />
       +12%
      </span>
     </div>
     <p className="text-sm text-gray-600">Total Projects</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalProjects}</p>
     <p className="text-xs text-gray-500 mt-1">{metrics.activeProjects} Active, {metrics.completedProjects} Completed</p>
    </div>

    <div
     onClick={() => handleDrillDown('Total Revenue', { revenue: metrics.totalRevenue, cost: metrics.totalCost })}
     className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
     <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-green-100 rounded-lg">
       <DollarSign className="h-6 w-6 text-green-600" />
      </div>
      <span className="text-xs text-green-600 font-semibold flex items-center">
       <TrendingUp className="h-3 w-3 mr-1" />
       +18%
      </span>
     </div>
     <p className="text-sm text-gray-600">Total Revenue</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">₹{(metrics.totalRevenue / 10000000).toFixed(1)}Cr</p>
     <p className="text-xs text-gray-500 mt-1">Cost: ₹{(metrics.totalCost / 10000000).toFixed(1)}Cr</p>
    </div>

    <div
     onClick={() => handleDrillDown('Profit Margin', { margin: metrics.profitMargin, profit: metrics.totalRevenue - metrics.totalCost })}
     className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
     <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-purple-100 rounded-lg">
       <Target className="h-6 w-6 text-purple-600" />
      </div>
      <span className="text-xs text-green-600 font-semibold flex items-center">
       <TrendingUp className="h-3 w-3 mr-1" />
       +5%
      </span>
     </div>
     <p className="text-sm text-gray-600">Profit Margin</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.profitMargin}%</p>
     <p className="text-xs text-gray-500 mt-1">Profit: ₹{((metrics.totalRevenue - metrics.totalCost) / 10000000).toFixed(1)}Cr</p>
    </div>

    <div
     onClick={() => handleDrillDown('Avg Duration', { avgDuration: metrics.avgProjectDuration })}
     className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
     <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-yellow-100 rounded-lg">
       <Clock className="h-6 w-6 text-yellow-600" />
      </div>
      <span className="text-xs text-red-600 font-semibold flex items-center">
       <TrendingDown className="h-3 w-3 mr-1" />
       -3%
      </span>
     </div>
     <p className="text-sm text-gray-600">Avg Duration</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgProjectDuration}</p>
     <p className="text-xs text-gray-500 mt-1">Days per project</p>
    </div>

    <div
     onClick={() => handleDrillDown('On-Time Delivery', { onTimeDelivery: metrics.onTimeDelivery, delayed: metrics.delayedProjects })}
     className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
     <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-cyan-100 rounded-lg">
       <CheckCircle className="h-6 w-6 text-cyan-600" />
      </div>
      <span className="text-xs text-yellow-600 font-semibold flex items-center">
       <TrendingDown className="h-3 w-3 mr-1" />
       -5%
      </span>
     </div>
     <p className="text-sm text-gray-600">On-Time Delivery</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.onTimeDelivery}%</p>
     <p className="text-xs text-gray-500 mt-1">{metrics.delayedProjects} Delayed projects</p>
    </div>
   </div>

   {/* Charts Section */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
    {/* Revenue Trend Chart */}
    <div className="lg:col-span-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
     <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
      <div className="flex space-x-2">
       <button
        onClick={() => setSelectedMetric('revenue')}
        className={`px-3 py-1 rounded text-sm font-medium ${
         selectedMetric === 'revenue'
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
        }`}
       >
        Revenue
       </button>
       <button
        onClick={() => setSelectedMetric('profit')}
        className={`px-3 py-1 rounded text-sm font-medium ${
         selectedMetric === 'profit'
          ? 'bg-green-100 text-green-700'
          : 'text-gray-600 hover:bg-gray-100'
        }`}
       >
        Profit
       </button>
       <button
        onClick={() => setSelectedMetric('projects')}
        className={`px-3 py-1 rounded text-sm font-medium ${
         selectedMetric === 'projects'
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-600 hover:bg-gray-100'
        }`}
       >
        Projects
       </button>
      </div>
     </div>

     <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-2">
       {monthlyData.map((data, index) => {
        const value =
         selectedMetric === 'revenue' ? data.revenue :
         selectedMetric === 'profit' ? data.profit :
         data.projectsCompleted * 3000000;
        const height = (value / maxValue) * 100;
        const color =
         selectedMetric === 'revenue' ? 'bg-blue-500' :
         selectedMetric === 'profit' ? 'bg-green-500' :
         'bg-purple-500';

        return (
         <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-gray-100 rounded-t relative group">
           <div
            className={`${color} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer`}
            style={{ height: `${Math.max(height, 5)}%` }}
           >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
             {selectedMetric === 'projects'
              ? `${data.projectsCompleted} projects`
              : `₹${(value / 100000).toFixed(1)}L`}
            </div>
           </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">{data.month}</p>
         </div>
        );
       })}
      </div>
     </div>
    </div>

    {/* Customer Satisfaction */}
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
     <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Satisfaction</h3>
     <div className="flex flex-col items-center justify-center h-48">
      <div className="relative w-40 h-40">
       <svg className="w-40 h-40 transform -rotate-90">
        <circle
         cx="80"
         cy="80"
         r="70"
         stroke="#E5E7EB"
         strokeWidth="12"
         fill="none"
        />
        <circle
         cx="80"
         cy="80"
         r="70"
         stroke="#10B981"
         strokeWidth="12"
         fill="none"
         strokeDasharray={`${(metrics.customerSatisfaction / 5) * 440} 440`}
         strokeLinecap="round"
        />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-gray-900">{metrics.customerSatisfaction}</p>
        <p className="text-sm text-gray-600">out of 5.0</p>
       </div>
      </div>
      <div className="mt-6 text-center">
       <p className="text-sm text-gray-600">Based on {metrics.completedProjects} projects</p>
       <div className="flex items-center justify-center mt-2 space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
         <span
          key={star}
          className={`text-2xl ${
           star <= Math.round(metrics.customerSatisfaction)
            ? 'text-yellow-400'
            : 'text-gray-300'
          }`}
         >
          ★
         </span>
        ))}
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Project Type Distribution & Resource Utilization */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {/* Project Type Metrics */}
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
     <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Type Analysis</h3>
     <div className="space-y-2">
      {projectTypeMetrics.map((type) => (
       <div key={type.type}>
        <div className="flex justify-between items-center mb-2">
         <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${type.color} rounded-full`}></div>
          <span className="text-sm font-medium text-gray-900">{type.type}</span>
         </div>
         <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">{type.count} projects</span>
         </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
         <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">Revenue</p>
          <p className="font-semibold text-gray-900">₹{(type.revenue / 10000000).toFixed(1)}Cr</p>
         </div>
         <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">Avg Duration</p>
          <p className="font-semibold text-gray-900">{type.avgDuration}d</p>
         </div>
         <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">Success Rate</p>
          <p className={`font-semibold ${
           type.successRate >= 90 ? 'text-green-600' :
           type.successRate >= 75 ? 'text-yellow-600' :
           'text-red-600'
          }`}>{type.successRate}%</p>
         </div>
        </div>
       </div>
      ))}
     </div>
    </div>

    {/* Resource Utilization */}
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
     <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Utilization</h3>
     <div className="space-y-2">
      {resourceUtilization.map((resource) => (
       <div key={resource.department}>
        <div className="flex justify-between items-center mb-2">
         <span className="text-sm font-medium text-gray-900">{resource.department}</span>
         <span className="text-sm font-semibold text-gray-900">{resource.utilization}%</span>
        </div>
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
         <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
           resource.utilization >= 80 ? 'bg-red-500' :
           resource.utilization >= 60 ? 'bg-yellow-500' :
           'bg-green-500'
          }`}
          style={{ width: `${resource.utilization}%` }}
         ></div>
         <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
          <span className={`font-medium ${resource.utilization > 50 ? 'text-white' : 'text-gray-700'}`}>
           Allocated: {resource.allocated}%
          </span>
          <span className="font-medium text-gray-700">
           Available: {resource.available}%
          </span>
         </div>
        </div>
        <div className="flex justify-between mt-1">
         <span className="text-xs text-gray-500">Efficiency: {resource.efficiency}%</span>
         <span className={`text-xs font-medium ${
          resource.utilization >= 80 ? 'text-red-600' :
          resource.utilization >= 60 ? 'text-yellow-600' :
          'text-green-600'
         }`}>
          {resource.utilization >= 80 ? 'Overutilized' :
           resource.utilization >= 60 ? 'Optimal' :
           'Underutilized'}
         </span>
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>

   {/* Top Projects by Revenue */}
   <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Projects by Revenue</h3>
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
       {topProjects.map((project, index) => (
        <tr key={index} className="hover:bg-gray-50">
         <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
         <td className="px-4 py-3 text-sm text-right text-gray-900">
          ₹{(project.revenue / 100000).toFixed(1)}L
         </td>
         <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
          ₹{(project.profit / 100000).toFixed(1)}L
         </td>
         <td className="px-4 py-3 text-sm text-right">
          <span className={`font-semibold ${
           project.margin >= 30 ? 'text-green-600' :
           project.margin >= 20 ? 'text-blue-600' :
           'text-yellow-600'
          }`}>
           {project.margin}%
          </span>
         </td>
         <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
           project.status === 'Completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
          }`}>
           {project.status}
          </span>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   {/* Key Insights */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
     <div className="flex items-start space-x-3">
      <div className="p-2 bg-green-100 rounded-lg">
       <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      <div>
       <p className="text-sm font-semibold text-green-900">Strong Revenue Growth</p>
       <p className="text-xs text-green-700 mt-1">
        Revenue increased by 18% this quarter. Commercial Kitchen and Switchgear projects are key contributors.
       </p>
      </div>
     </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
     <div className="flex items-start space-x-3">
      <div className="p-2 bg-yellow-100 rounded-lg">
       <AlertTriangle className="h-5 w-5 text-yellow-600" />
      </div>
      <div>
       <p className="text-sm font-semibold text-yellow-900">Resource Optimization Needed</p>
       <p className="text-xs text-yellow-700 mt-1">
        Installation Team is at 85% utilization. Consider hiring or reallocating resources for upcoming projects.
       </p>
      </div>
     </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
     <div className="flex items-start space-x-3">
      <div className="p-2 bg-blue-100 rounded-lg">
       <Users className="h-5 w-5 text-blue-600" />
      </div>
      <div>
       <p className="text-sm font-semibold text-blue-900">High Customer Satisfaction</p>
       <p className="text-xs text-blue-700 mt-1">
        4.2/5.0 rating across {metrics.completedProjects} projects. Modular Kitchen segment achieving 100% success rate.
       </p>
      </div>
     </div>
    </div>
   </div>

   {/* All Modals */}
   <CustomDashboardModal
    isOpen={isCustomDashboardModalOpen}
    onClose={() => setIsCustomDashboardModalOpen(false)}
    onSave={handleSaveDashboardConfig}
   />

   <TimePeriodFilterModal
    isOpen={isTimePeriodFilterModalOpen}
    onClose={() => setIsTimePeriodFilterModalOpen(false)}
    onApply={handleApplyTimePeriodFilter}
   />

   <ExportAnalyticsModal
    isOpen={isExportAnalyticsModalOpen}
    onClose={() => setIsExportAnalyticsModalOpen(false)}
    onExport={handleExportAnalytics}
   />

   <KPIConfigurationModal
    isOpen={isKPIConfigurationModalOpen}
    onClose={() => setIsKPIConfigurationModalOpen(false)}
    onSave={handleSaveKPIConfiguration}
   />

   <DrillDownDetailsModal
    isOpen={isDrillDownDetailsModalOpen}
    onClose={() => setIsDrillDownDetailsModalOpen(false)}
    metric={drillDownMetric}
    data={drillDownData}
   />

   <ComparisonAnalysisModal
    isOpen={isComparisonAnalysisModalOpen}
    onClose={() => setIsComparisonAnalysisModalOpen(false)}
    metrics={metrics}
   />

   <AlertThresholdModal
    isOpen={isAlertThresholdModalOpen}
    onClose={() => setIsAlertThresholdModalOpen(false)}
    onSave={handleSaveAlertThresholds}
   />

   <ScheduleAnalyticsModal
    isOpen={isScheduleAnalyticsModalOpen}
    onClose={() => setIsScheduleAnalyticsModalOpen(false)}
    onSchedule={handleScheduleAnalytics}
   />

   <ShareAnalyticsModal
    isOpen={isShareAnalyticsModalOpen}
    onClose={() => setIsShareAnalyticsModalOpen(false)}
    onShare={handleShareAnalytics}
   />

   <SavedViewsModal
    isOpen={isSavedViewsModalOpen}
    onClose={() => setIsSavedViewsModalOpen(false)}
    onLoad={handleLoadView}
   />
  </div>
 );
}
