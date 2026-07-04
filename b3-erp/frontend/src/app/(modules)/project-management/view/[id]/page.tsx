'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
 ArrowLeft,
 Edit,
 Calendar,
 DollarSign,
 Users,
 Package,
 AlertTriangle,
 CheckCircle,
 Clock,
 TrendingUp,
 FileText,
 MapPin,
 Phone,
 Mail,
 Building2,
 MoreVertical,
 AlertCircle,
} from 'lucide-react';
import { ProjectViewService } from '@/services/project-view.service';

// Map a raw backend status onto the page's display status vocabulary.
function normalizeStatus(status?: string): string {
 switch ((status || '').toLowerCase()) {
  case 'completed':
  case 'closed':
   return 'Completed';
  case 'in_progress':
  case 'in progress':
  case 'active':
  case 'execution':
   return 'In Progress';
  case 'delayed':
  case 'at_risk':
   return 'Delayed';
  case 'planning':
  case 'pending':
  default:
   return 'Pending';
 }
}

export default function ViewProjectPage({ params }: { params: { id: string } }) {
 const [activeTab, setActiveTab] = useState('overview');

 const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);

 // Fields the backend does not model (team, deliverables, activity feed,
 // contract/invoicing) keep their showcase defaults; project header, financials,
 // milestones and task counts are wired to live data.
 const [project, setProject] = useState({
  id: params.id,
  projectNumber: '',
  projectName: '',
  projectType: '—',
  customer: '',
  customerId: '',
  location: '',
  salesOrderNumber: '—',
  description: '',
  startDate: '',
  endDate: '',
  actualStartDate: '',
  status: 'Pending',
  progress: 0,
  phase: '—',
  budget: 0,
  actualCost: 0,
  contractValue: 0,
  invoicedAmount: 0,
  receivedAmount: 0,
  projectManager: '—',
  projectManagerEmail: '',
  projectManagerPhone: '',
  priority: '—',
  department: 'Project Management',
  completedTasks: 0,
  totalTasks: 0,
  completedDeliverables: 5,
  totalDeliverables: 8,
  openIssues: 2,
  totalIssues: 7,
 });

 const [milestones, setMilestones] = useState<{ id: string; name: string; date: string; status: string }[]>([]);

 useEffect(() => {
  let cancelled = false;
  const load = async () => {
   setIsLoading(true);
   setLoadError(null);
   try {
    const [p, tasks, ms] = await Promise.all([
     ProjectViewService.getProject(params.id),
     ProjectViewService.getTasks(params.id).catch(() => []),
     ProjectViewService.getMilestones(params.id).catch(() => []),
    ]);
    if (cancelled) return;
    if (p) {
     const completedTasks = tasks.filter((t) => normalizeStatus(t.status) === 'Completed').length;
     setProject((prev) => ({
      ...prev,
      id: p.id ?? params.id,
      projectNumber: p.projectCode ?? prev.projectNumber,
      projectName: p.name ?? prev.projectName,
      projectType: p.projectType ?? prev.projectType,
      customer: p.clientName ?? prev.customer,
      customerId: p.clientContactPerson ?? prev.customerId,
      location: p.location ?? prev.location,
      description: p.description ?? prev.description,
      startDate: p.plannedStart ?? p.startDate ?? prev.startDate,
      endDate: p.plannedEnd ?? p.endDate ?? prev.endDate,
      status: normalizeStatus(p.status),
      progress: Math.round(Number(p.progress ?? 0)),
      priority: p.priority ?? prev.priority,
      budget: Number(p.budgetAllocated ?? 0),
      actualCost: Number(p.budgetSpent ?? p.totalExpenditure ?? 0),
      contractValue: Number(p.totalIncome ?? p.budgetAllocated ?? 0),
      projectManagerEmail: p.clientContactEmail ?? prev.projectManagerEmail,
      completedTasks,
      totalTasks: tasks.length,
     }));
    }
    setMilestones(
     ms.map((m, i) => ({
      id: String(m.id ?? i),
      name: m.name ?? 'Milestone',
      date: m.dueDate ?? m.completedDate ?? '',
      status: normalizeStatus(m.status),
     })),
    );
   } catch (err) {
    if (!cancelled) {
     setLoadError(err instanceof Error ? err.message : 'Failed to load project');
    }
   } finally {
    if (!cancelled) setIsLoading(false);
   }
  };
  load();
  return () => { cancelled = true; };
 }, [params.id]);

 // Team members (no backend endpoint — showcase defaults)
 const teamMembers = [
  { id: '1', name: 'Rajesh Kumar', role: 'Project Manager', allocation: 100, email: 'rajesh.kumar@b3macbis.com' },
  { id: '2', name: 'Suresh Patel', role: 'Installation Supervisor', allocation: 100, email: 'suresh.patel@b3macbis.com' },
  { id: '3', name: 'Ramesh Nair', role: 'Civil Engineer', allocation: 50, email: 'ramesh.nair@b3macbis.com' },
  { id: '4', name: 'Anjali Verma', role: 'Quality Inspector', allocation: 30, email: 'anjali.verma@b3macbis.com' },
  { id: '5', name: 'Installation Team', role: 'Technicians', allocation: 100, email: 'operations@b3macbis.com' },
 ];

 // Recent activities (no backend endpoint — showcase defaults)
 const activities = [
  { id: '1', date: '2024-03-14', type: 'Progress Update', description: 'Equipment installation 70% complete', user: 'Suresh Patel' },
  { id: '2', date: '2024-03-12', type: 'Issue Reported', description: 'Delay in equipment delivery from supplier', user: 'Rajesh Kumar' },
  { id: '3', date: '2024-03-10', type: 'Milestone Completed', description: 'Civil work and foundation completed', user: 'Ramesh Nair' },
  { id: '4', date: '2024-03-08', type: 'Payment Received', description: 'Second milestone payment received (₹12L)', user: 'Finance Team' },
  { id: '5', date: '2024-03-05', type: 'Quality Check', description: 'Installation quality inspection passed', user: 'Anjali Verma' },
 ];

 // Deliverables
 const deliverables = [
  { id: '1', name: 'Kitchen Equipment Delivery', type: 'Equipment', status: 'Completed', date: '2024-02-14' },
  { id: '2', name: 'Site Preparation & Civil Work', type: 'Installation', status: 'Completed', date: '2024-03-03' },
  { id: '3', name: 'Equipment Installation', type: 'Installation', status: 'In Progress', date: '2024-03-20' },
  { id: '4', name: 'Exhaust System Installation', type: 'Installation', status: 'Pending', date: '2024-04-05' },
  { id: '5', name: 'Testing Documentation', type: 'Documentation', status: 'Pending', date: '2024-04-18' },
  { id: '6', name: 'Staff Training Program', type: 'Training', status: 'Pending', date: '2024-04-25' },
  { id: '7', name: 'Final Commissioning', type: 'Service', status: 'Pending', date: '2024-04-28' },
  { id: '8', name: 'Project Handover', type: 'Documentation', status: 'Pending', date: '2024-04-30' },
 ];

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
   style: 'currency',
   currency: 'INR',
   minimumFractionDigits: 0,
  }).format(amount);
 };

 const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
   day: '2-digit',
   month: 'short',
   year: 'numeric',
  });
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Completed': return 'bg-green-100 text-green-700';
   case 'In Progress': return 'bg-blue-100 text-blue-700';
   case 'Pending': return 'bg-gray-100 text-gray-700';
   case 'Delayed': return 'bg-red-100 text-red-700';
   default: return 'bg-gray-100 text-gray-700';
  }
 };

 const calculateDaysRemaining = () => {
  if (!project.endDate) return 0;
  const today = new Date();
  const endDate = new Date(project.endDate);
  if (isNaN(endDate.getTime())) return 0;
  const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
 };

 const daysRemaining = calculateDaysRemaining();
 const profitMargin = project.contractValue > 0
  ? ((project.contractValue - project.budget) / project.contractValue) * 100
  : 0;
 const costOverrun = project.actualCost - (project.budget * (project.progress / 100));

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <Link
      href="/project-management"
      className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
     >
      <ArrowLeft className="w-4 h-4 text-gray-600" />
      <span className="text-gray-700">Back</span>
     </Link>
     <div>
      <div className="flex items-center gap-3">
       <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
       <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
        {project.status}
       </span>
      </div>
      <p className="text-gray-600 mt-1">{project.projectNumber} · {project.projectType}</p>
     </div>
    </div>
    <div className="flex items-center gap-3">
     <Link
      href={`/project-management/edit/${project.id}`}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
     >
      <Edit className="w-4 h-4" />
      Edit Project
     </Link>
     <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
      <MoreVertical className="w-4 h-4 text-gray-600" />
      <span className="text-gray-700">More</span>
     </button>
    </div>
   </div>

   {isLoading && (
    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
     <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
     Loading project…
    </div>
   )}
   {loadError && !isLoading && (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
     <AlertCircle className="h-4 w-4" />
     {loadError}
    </div>
   )}

   {/* Key Metrics */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Progress</p>
      <TrendingUp className="w-5 h-5 text-blue-600" />
     </div>
     <p className="text-3xl font-bold text-gray-900">{project.progress}%</p>
     <div className="mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2">
       <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${project.progress}%` }}
       ></div>
      </div>
     </div>
     <p className="text-sm text-gray-500 mt-2">{project.phase} phase</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Budget Utilization</p>
      <DollarSign className="w-5 h-5 text-green-600" />
     </div>
     <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.actualCost)}</p>
     <p className="text-sm text-gray-500 mt-1">of {formatCurrency(project.budget)}</p>
     <p className={`text-sm font-medium mt-2 ${costOverrun > 0 ? 'text-red-600' : 'text-green-600'}`}>
      {costOverrun > 0 ? '↑' : '↓'} {Math.abs(costOverrun / 1000).toFixed(0)}K {costOverrun > 0 ? 'over' : 'under'}
     </p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Timeline</p>
      <Calendar className="w-5 h-5 text-purple-600" />
     </div>
     <p className="text-3xl font-bold text-gray-900">{daysRemaining}</p>
     <p className="text-sm text-gray-500 mt-1">days remaining</p>
     <p className="text-sm text-gray-500 mt-2">
      Due: {formatDate(project.endDate)}
     </p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Team Size</p>
      <Users className="w-5 h-5 text-orange-600" />
     </div>
     <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
     <p className="text-sm text-gray-500 mt-1">active members</p>
     <p className="text-sm text-gray-500 mt-2">
      PM: {project.projectManager}
     </p>
    </div>
   </div>

   {/* Tabs */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="border-b border-gray-200">
     <nav className="flex -mb-px">
      {['overview', 'team', 'deliverables', 'milestones', 'financials', 'activity'].map((tab) => (
       <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-3 py-2 text-sm font-medium capitalize ${
         activeTab === tab
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
       >
        {tab}
       </button>
      ))}
     </nav>
    </div>

    <div className="p-6">
     {/* Overview Tab */}
     {activeTab === 'overview' && (
      <div className="space-y-3">
       {/* Project Details */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
         <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h3>
         <div className="space-y-3">
          <div>
           <p className="text-sm text-gray-500">Sales Order</p>
           <p className="text-sm font-medium text-gray-900">{project.salesOrderNumber}</p>
          </div>
          <div>
           <p className="text-sm text-gray-500">Customer</p>
           <div className="flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{project.customer}</p>
           </div>
           <p className="text-xs text-gray-500">{project.customerId}</p>
          </div>
          <div>
           <p className="text-sm text-gray-500">Location</p>
           <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{project.location}</p>
           </div>
          </div>
          <div>
           <p className="text-sm text-gray-500">Priority</p>
           <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
            {project.priority} - Critical
           </span>
          </div>
         </div>
        </div>

        <div>
         <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Manager</h3>
         <div className="space-y-3">
          <div>
           <p className="text-sm text-gray-500">Name</p>
           <p className="text-sm font-medium text-gray-900">{project.projectManager}</p>
           <p className="text-xs text-gray-500">{project.department}</p>
          </div>
          <div>
           <p className="text-sm text-gray-500">Email</p>
           <div className="flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${project.projectManagerEmail}`} className="text-sm text-blue-600 hover:text-blue-700">
             {project.projectManagerEmail}
            </a>
           </div>
          </div>
          <div>
           <p className="text-sm text-gray-500">Phone</p>
           <div className="flex items-center gap-2 mt-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${project.projectManagerPhone}`} className="text-sm text-blue-600 hover:text-blue-700">
             {project.projectManagerPhone}
            </a>
           </div>
          </div>
         </div>
        </div>
       </div>

       {/* Description */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
       </div>

       {/* Health Metrics */}
       <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-lg p-3">
         <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-900">Tasks</p>
         </div>
         <p className="text-2xl font-bold text-blue-900">
          {project.completedTasks}/{project.totalTasks}
         </p>
         <p className="text-xs text-blue-600 mt-1">
          {Math.round((project.completedTasks / project.totalTasks) * 100)}% complete
         </p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
         <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-900">Deliverables</p>
         </div>
         <p className="text-2xl font-bold text-green-900">
          {project.completedDeliverables}/{project.totalDeliverables}
         </p>
         <p className="text-xs text-green-600 mt-1">
          {Math.round((project.completedDeliverables / project.totalDeliverables) * 100)}% complete
         </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
         <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <p className="text-sm font-medium text-orange-900">Issues</p>
         </div>
         <p className="text-2xl font-bold text-orange-900">
          {project.openIssues}/{project.totalIssues}
         </p>
         <p className="text-xs text-orange-600 mt-1">open issues</p>
        </div>
       </div>
      </div>
     )}

     {/* Team Tab */}
     {activeTab === 'team' && (
      <div className="space-y-2">
       {teamMembers.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
         <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
           {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
           <p className="font-semibold text-gray-900">{member.name}</p>
           <p className="text-sm text-gray-600">{member.role}</p>
           <a href={`mailto:${member.email}`} className="text-xs text-blue-600 hover:text-blue-700">
            {member.email}
           </a>
          </div>
         </div>
         <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{member.allocation}%</p>
          <p className="text-xs text-gray-500">Allocation</p>
         </div>
        </div>
       ))}
      </div>
     )}

     {/* Deliverables Tab */}
     {activeTab === 'deliverables' && (
      <div className="space-y-3">
       {deliverables.map((deliverable) => (
        <div key={deliverable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
         <div className="flex-1">
          <div className="flex items-center gap-3">
           <p className="font-semibold text-gray-900">{deliverable.name}</p>
           <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(deliverable.status)}`}>
            {deliverable.status}
           </span>
           <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
            {deliverable.type}
           </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
           Due: {formatDate(deliverable.date)}
          </p>
         </div>
         <Link href={`/project-management/deliverables/view/${deliverable.id}`} className="text-blue-600 hover:text-blue-700">
          View
         </Link>
        </div>
       ))}
      </div>
     )}

     {/* Milestones Tab */}
     {activeTab === 'milestones' && (
      <div className="relative">
       <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
       <div className="space-y-3">
        {milestones.map((milestone, index) => (
         <div key={milestone.id} className="flex items-start gap-2 relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
           milestone.status === 'Completed' ? 'bg-green-500' :
           milestone.status === 'In Progress' ? 'bg-blue-500' :
           'bg-gray-300'
          }`}>
           {milestone.status === 'Completed' ? (
            <CheckCircle className="w-6 h-6 text-white" />
           ) : (
            <Clock className="w-6 h-6 text-white" />
           )}
          </div>
          <div className="flex-1">
           <p className="font-semibold text-gray-900">{milestone.name}</p>
           <p className="text-sm text-gray-600">{formatDate(milestone.date)}</p>
           <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(milestone.status)}`}>
            {milestone.status}
           </span>
          </div>
         </div>
        ))}
       </div>
      </div>
     )}

     {/* Financials Tab */}
     {activeTab === 'financials' && (
      <div className="space-y-3">
       <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-sm text-gray-600 mb-1">Contract Value</p>
         <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.contractValue)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-sm text-gray-600 mb-1">Estimated Budget</p>
         <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.budget)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-sm text-gray-600 mb-1">Actual Cost</p>
         <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.actualCost)}</p>
         <p className="text-sm text-gray-500 mt-1">
          {Math.round((project.actualCost / project.budget) * 100)}% of budget
         </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
         <p className="text-sm text-green-700 mb-1">Profit Margin</p>
         <p className="text-2xl font-bold text-green-900">{profitMargin.toFixed(1)}%</p>
         <p className="text-sm text-green-700 mt-1">
          {formatCurrency(project.contractValue - project.budget)}
         </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
         <p className="text-sm text-blue-700 mb-1">Invoiced Amount</p>
         <p className="text-2xl font-bold text-blue-900">{formatCurrency(project.invoicedAmount)}</p>
         <p className="text-sm text-blue-700 mt-1">
          {Math.round((project.invoicedAmount / project.contractValue) * 100)}% of contract
         </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
         <p className="text-sm text-purple-700 mb-1">Received Amount</p>
         <p className="text-2xl font-bold text-purple-900">{formatCurrency(project.receivedAmount)}</p>
         <p className="text-sm text-purple-700 mt-1">
          {Math.round((project.receivedAmount / project.invoicedAmount) * 100)}% collected
         </p>
        </div>
       </div>
      </div>
     )}

     {/* Activity Tab */}
     {activeTab === 'activity' && (
      <div className="space-y-2">
       {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
         </div>
         <div className="flex-1">
          <div className="flex items-center justify-between">
           <p className="font-semibold text-gray-900">{activity.type}</p>
           <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
          </div>
          <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
          <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
