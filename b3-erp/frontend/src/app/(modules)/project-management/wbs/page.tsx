'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import {
 Search,
 Plus,
 ChevronRight,
 ChevronDown,
 Edit,
 Trash2,
 CheckCircle,
 Clock,
 AlertCircle,
 FileText,
 Move,
 GitBranch,
 Eye,
 Users,
 TrendingUp,
 Download,
 Upload,
} from 'lucide-react';
import {
 AddWorkPackageModal,
 EditWBSItemModal,
 MoveWBSItemModal,
 DecomposeTaskModal,
 WBSDetailsModal,
 AssignResourcesModal,
 TrackProgressModal,
 WBSDependenciesModal,
 ExportWBSModal,
 ImportWBSTemplateModal,
} from '@/components/project-management/WBSModals';

interface WBSNode {
 id: string;
 code: string;
 name: string;
 type: 'Phase' | 'Activity' | 'Task';
 level: number;
 parent: string | null;
 children: WBSNode[];
 progress: number;
 status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
 startDate: string;
 endDate: string;
 assignedTo: string;
 estimatedHours: number;
 actualHours: number;
 budget: number;
 actualCost: number;
}

const seedWBS: WBSNode[] = [
 {
  id: '1',
  code: '1.0',
  name: 'Taj Hotel Commercial Kitchen Project',
  type: 'Phase',
  level: 0,
  parent: null,
  progress: 65,
  status: 'In Progress',
  startDate: '2024-01-15',
  endDate: '2024-04-30',
  assignedTo: 'Rajesh Kumar',
  estimatedHours: 2080,
  actualHours: 1352,
  budget: 8500000,
  actualCost: 5200000,
  children: [
   {
    id: '1.1',
    code: '1.1',
    name: 'Project Initiation',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 100,
    status: 'Completed',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    assignedTo: 'Rajesh Kumar',
    estimatedHours: 80,
    actualHours: 76,
    budget: 250000,
    actualCost: 240000,
    children: [
     {
      id: '1.1.1',
      code: '1.1.1',
      name: 'Site Survey',
      type: 'Activity',
      level: 2,
      parent: '1.1',
      progress: 100,
      status: 'Completed',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      assignedTo: 'Ramesh Nair',
      estimatedHours: 24,
      actualHours: 22,
      budget: 80000,
      actualCost: 75000,
      children: [],
     },
     {
      id: '1.1.2',
      code: '1.1.2',
      name: 'Requirements Analysis',
      type: 'Activity',
      level: 2,
      parent: '1.1',
      progress: 100,
      status: 'Completed',
      startDate: '2024-01-18',
      endDate: '2024-01-20',
      assignedTo: 'Rajesh Kumar',
      estimatedHours: 32,
      actualHours: 30,
      budget: 100000,
      actualCost: 95000,
      children: [],
     },
     {
      id: '1.1.3',
      code: '1.1.3',
      name: 'Project Planning',
      type: 'Activity',
      level: 2,
      parent: '1.1',
      progress: 100,
      status: 'Completed',
      startDate: '2024-01-21',
      endDate: '2024-01-25',
      assignedTo: 'Rajesh Kumar',
      estimatedHours: 24,
      actualHours: 24,
      budget: 70000,
      actualCost: 70000,
      children: [],
     },
    ],
   },
   {
    id: '1.2',
    code: '1.2',
    name: 'Procurement & Preparation',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 100,
    status: 'Completed',
    startDate: '2024-01-26',
    endDate: '2024-02-28',
    assignedTo: 'Procurement Team',
    estimatedHours: 320,
    actualHours: 305,
    budget: 4800000,
    actualCost: 4650000,
    children: [
     {
      id: '1.2.1',
      code: '1.2.1',
      name: 'Equipment Procurement',
      type: 'Activity',
      level: 2,
      parent: '1.2',
      progress: 100,
      status: 'Completed',
      startDate: '2024-01-26',
      endDate: '2024-02-15',
      assignedTo: 'Procurement Team',
      estimatedHours: 160,
      actualHours: 152,
      budget: 4200000,
      actualCost: 4100000,
      children: [],
     },
     {
      id: '1.2.2',
      code: '1.2.2',
      name: 'Material Procurement',
      type: 'Activity',
      level: 2,
      parent: '1.2',
      progress: 100,
      status: 'Completed',
      startDate: '2024-02-01',
      endDate: '2024-02-20',
      assignedTo: 'Procurement Team',
      estimatedHours: 120,
      actualHours: 115,
      budget: 450000,
      actualCost: 420000,
      children: [],
     },
     {
      id: '1.2.3',
      code: '1.2.3',
      name: 'Quality Inspection',
      type: 'Activity',
      level: 2,
      parent: '1.2',
      progress: 100,
      status: 'Completed',
      startDate: '2024-02-21',
      endDate: '2024-02-28',
      assignedTo: 'Anjali Verma',
      estimatedHours: 40,
      actualHours: 38,
      budget: 150000,
      actualCost: 130000,
      children: [],
     },
    ],
   },
   {
    id: '1.3',
    code: '1.3',
    name: 'Civil Work & Site Preparation',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 100,
    status: 'Completed',
    startDate: '2024-02-15',
    endDate: '2024-03-05',
    assignedTo: 'Civil Team',
    estimatedHours: 400,
    actualHours: 420,
    budget: 800000,
    actualCost: 850000,
    children: [
     {
      id: '1.3.1',
      code: '1.3.1',
      name: 'Floor Preparation',
      type: 'Activity',
      level: 2,
      parent: '1.3',
      progress: 100,
      status: 'Completed',
      startDate: '2024-02-15',
      endDate: '2024-02-22',
      assignedTo: 'Civil Team',
      estimatedHours: 160,
      actualHours: 172,
      budget: 300000,
      actualCost: 320000,
      children: [],
     },
     {
      id: '1.3.2',
      code: '1.3.2',
      name: 'Drainage & Plumbing',
      type: 'Activity',
      level: 2,
      parent: '1.3',
      progress: 100,
      status: 'Completed',
      startDate: '2024-02-23',
      endDate: '2024-03-01',
      assignedTo: 'Plumbing Team',
      estimatedHours: 120,
      actualHours: 128,
      budget: 250000,
      actualCost: 270000,
      children: [],
     },
     {
      id: '1.3.3',
      code: '1.3.3',
      name: 'Electrical Infrastructure',
      type: 'Activity',
      level: 2,
      parent: '1.3',
      progress: 100,
      status: 'Completed',
      startDate: '2024-02-25',
      endDate: '2024-03-05',
      assignedTo: 'Electrical Team',
      estimatedHours: 120,
      actualHours: 120,
      budget: 250000,
      actualCost: 260000,
      children: [],
     },
    ],
   },
   {
    id: '1.4',
    code: '1.4',
    name: 'Equipment Installation',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 70,
    status: 'In Progress',
    startDate: '2024-03-06',
    endDate: '2024-03-25',
    assignedTo: 'Suresh Patel',
    estimatedHours: 600,
    actualHours: 420,
    budget: 1500000,
    actualCost: 1050000,
    children: [
     {
      id: '1.4.1',
      code: '1.4.1',
      name: 'Cooking Equipment Installation',
      type: 'Activity',
      level: 2,
      parent: '1.4',
      progress: 85,
      status: 'In Progress',
      startDate: '2024-03-06',
      endDate: '2024-03-15',
      assignedTo: 'Installation Team A',
      estimatedHours: 240,
      actualHours: 204,
      budget: 600000,
      actualCost: 510000,
      children: [],
     },
     {
      id: '1.4.2',
      code: '1.4.2',
      name: 'Refrigeration Units Setup',
      type: 'Activity',
      level: 2,
      parent: '1.4',
      progress: 60,
      status: 'In Progress',
      startDate: '2024-03-10',
      endDate: '2024-03-20',
      assignedTo: 'Installation Team B',
      estimatedHours: 200,
      actualHours: 120,
      budget: 500000,
      actualCost: 300000,
      children: [],
     },
     {
      id: '1.4.3',
      code: '1.4.3',
      name: 'Exhaust System Installation',
      type: 'Activity',
      level: 2,
      parent: '1.4',
      progress: 50,
      status: 'In Progress',
      startDate: '2024-03-15',
      endDate: '2024-03-25',
      assignedTo: 'HVAC Team',
      estimatedHours: 160,
      actualHours: 96,
      budget: 400000,
      actualCost: 240000,
      children: [],
     },
    ],
   },
   {
    id: '1.5',
    code: '1.5',
    name: 'Testing & Commissioning',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 0,
    status: 'Not Started',
    startDate: '2024-03-26',
    endDate: '2024-04-20',
    assignedTo: 'QC Team',
    estimatedHours: 480,
    actualHours: 0,
    budget: 850000,
    actualCost: 0,
    children: [
     {
      id: '1.5.1',
      code: '1.5.1',
      name: 'Equipment Testing',
      type: 'Activity',
      level: 2,
      parent: '1.5',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-03-26',
      endDate: '2024-04-05',
      assignedTo: 'Test Team',
      estimatedHours: 200,
      actualHours: 0,
      budget: 350000,
      actualCost: 0,
      children: [],
     },
     {
      id: '1.5.2',
      code: '1.5.2',
      name: 'Safety Testing',
      type: 'Activity',
      level: 2,
      parent: '1.5',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-04-06',
      endDate: '2024-04-12',
      assignedTo: 'Safety Team',
      estimatedHours: 120,
      actualHours: 0,
      budget: 200000,
      actualCost: 0,
      children: [],
     },
     {
      id: '1.5.3',
      code: '1.5.3',
      name: 'Final Commissioning',
      type: 'Activity',
      level: 2,
      parent: '1.5',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-04-13',
      endDate: '2024-04-20',
      assignedTo: 'Commissioning Team',
      estimatedHours: 160,
      actualHours: 0,
      budget: 300000,
      actualCost: 0,
      children: [],
     },
    ],
   },
   {
    id: '1.6',
    code: '1.6',
    name: 'Training & Handover',
    type: 'Phase',
    level: 1,
    parent: '1',
    progress: 0,
    status: 'Not Started',
    startDate: '2024-04-21',
    endDate: '2024-04-30',
    assignedTo: 'Training Team',
    estimatedHours: 200,
    actualHours: 0,
    budget: 300000,
    actualCost: 0,
    children: [
     {
      id: '1.6.1',
      code: '1.6.1',
      name: 'Staff Training',
      type: 'Activity',
      level: 2,
      parent: '1.6',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-04-21',
      endDate: '2024-04-26',
      assignedTo: 'Training Team',
      estimatedHours: 120,
      actualHours: 0,
      budget: 180000,
      actualCost: 0,
      children: [],
     },
     {
      id: '1.6.2',
      code: '1.6.2',
      name: 'Documentation Handover',
      type: 'Activity',
      level: 2,
      parent: '1.6',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-04-27',
      endDate: '2024-04-28',
      assignedTo: 'Documentation Team',
      estimatedHours: 40,
      actualHours: 0,
      budget: 60000,
      actualCost: 0,
      children: [],
     },
     {
      id: '1.6.3',
      code: '1.6.3',
      name: 'Project Closure',
      type: 'Activity',
      level: 2,
      parent: '1.6',
      progress: 0,
      status: 'Not Started',
      startDate: '2024-04-29',
      endDate: '2024-04-30',
      assignedTo: 'Rajesh Kumar',
      estimatedHours: 40,
      actualHours: 0,
      budget: 60000,
      actualCost: 0,
      children: [],
     },
    ],
   },
  ],
 },
];

export default function WBSPage() {
 const [wbsTree, setWbsTree] = useState<WBSNode[]>(seedWBS);

 useEffect(() => {
  projectManagementService.listWbsNodes()
   .then((rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    // Rebuild nested tree from flat parentId-linked rows returned by the API
    const map = new Map<string, WBSNode>();
    rows.forEach((r: any) => {
     map.set(r.id, { ...r, parent: r.parentId ?? null, children: [] } as WBSNode);
    });
    const roots: WBSNode[] = [];
    map.forEach((node) => {
     const parentId = (node as any).parent as string | null;
     if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
     } else {
      roots.push(node);
     }
    });
    setWbsTree(roots);
   })
   .catch(() => { /* keep seed data on error */ });
 }, []);

 const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
 const [searchTerm, setSearchTerm] = useState('');

 // Modal states
 const [showAddPackage, setShowAddPackage] = useState(false);
 const [showEditItem, setShowEditItem] = useState(false);
 const [showMoveItem, setShowMoveItem] = useState(false);
 const [showDecompose, setShowDecompose] = useState(false);
 const [showDetails, setShowDetails] = useState(false);
 const [showAssignResources, setShowAssignResources] = useState(false);
 const [showTrackProgress, setShowTrackProgress] = useState(false);
 const [showDependencies, setShowDependencies] = useState(false);
 const [showExport, setShowExport] = useState(false);
 const [showImportTemplate, setShowImportTemplate] = useState(false);
 const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
 const [parentNode, setParentNode] = useState<WBSNode | null>(null);

 // Modal handlers
 const handleAddPackage = (workPackage: any) => {
  console.log('Adding work package:', workPackage);
  setShowAddPackage(false);
 };

 const handleEditItem = (updates: any) => {
  console.log('Updating item:', updates);
  setShowEditItem(false);
 };

 const handleMoveItem = (targetParent: string) => {
  console.log('Moving to:', targetParent);
  setShowMoveItem(false);
 };

 const handleDecompose = (subtasks: any[]) => {
  console.log('Creating subtasks:', subtasks);
  setShowDecompose(false);
 };

 const handleAssignResources = (resources: string[]) => {
  console.log('Assigning resources:', resources);
  setShowAssignResources(false);
 };

 const handleTrackProgress = (progress: any) => {
  console.log('Updating progress:', progress);
  setShowTrackProgress(false);
 };

 const handleUpdateDependencies = (dependencies: any) => {
  console.log('Updating dependencies:', dependencies);
  setShowDependencies(false);
 };

 const handleExport = (options: any) => {
  exportToCsv('wbs', wbsTree as unknown as Record<string, unknown>[]);
  setShowExport(false);
 };

 const handleImportTemplate = (templateId: string) => {
  console.log('Importing template:', templateId);
  setShowImportTemplate(false);
 };

 const openEditModal = (node: WBSNode) => {
  setSelectedNode(node);
  setShowEditItem(true);
 };

 const openDetailsModal = (node: WBSNode) => {
  setSelectedNode(node);
  setShowDetails(true);
 };

 const toggleNode = (nodeId: string) => {
  const newExpanded = new Set(expandedNodes);
  if (newExpanded.has(nodeId)) {
   newExpanded.delete(nodeId);
  } else {
   newExpanded.add(nodeId);
  }
  setExpandedNodes(newExpanded);
 };

 const renderNode = (node: WBSNode) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const indent = node.level * 32;

  const getStatusColor = (status: string) => {
   switch (status) {
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Not Started': return 'bg-gray-100 text-gray-700';
    case 'On Hold': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
   }
  };

  const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
   }).format(amount);
  };

  return (
   <div key={node.id}>
    <div
     className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200 transition-colors"
     style={{ paddingLeft: `${16 + indent}px` }}
    >
     {/* Expand/Collapse Button */}
     <div className="w-6 flex items-center justify-center flex-shrink-0">
      {hasChildren && (
       <button
        onClick={() => toggleNode(node.id)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
       >
        {isExpanded ? (
         <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
         <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
       </button>
      )}
     </div>

     {/* WBS Code */}
     <div className="w-20 flex-shrink-0">
      <span className="text-sm font-mono font-medium text-gray-700">{node.code}</span>
     </div>

     {/* Name & Type */}
     <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
       <p className={`font-medium text-gray-900 truncate ${
        node.type === 'Phase' ? 'text-base' : 'text-sm'
       }`}>
        {node.name}
       </p>
       <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded flex-shrink-0">
        {node.type}
       </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Assigned to: {node.assignedTo}</p>
     </div>

     {/* Progress */}
     <div className="w-32 flex-shrink-0">
      <div className="flex items-center gap-2">
       <div className="flex-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
         <div
          className={`h-2 rounded-full ${
           node.status === 'Completed' ? 'bg-green-500' :
           node.status === 'In Progress' ? 'bg-blue-500' :
           'bg-gray-400'
          }`}
          style={{ width: `${node.progress}%` }}
         ></div>
        </div>
       </div>
       <span className="text-sm font-medium text-gray-700 w-10 text-right">
        {node.progress}%
       </span>
      </div>
     </div>

     {/* Status */}
     <div className="w-28 flex-shrink-0">
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(node.status)}`}>
       {node.status}
      </span>
     </div>

     {/* Hours */}
     <div className="w-24 flex-shrink-0 text-right">
      <p className="text-sm font-medium text-gray-900">
       {node.actualHours}h / {node.estimatedHours}h
      </p>
      <p className="text-xs text-gray-500">
       {node.estimatedHours > 0 ? Math.round((node.actualHours / node.estimatedHours) * 100) : 0}%
      </p>
     </div>

     {/* Budget */}
     <div className="w-32 flex-shrink-0 text-right">
      <p className="text-sm font-medium text-gray-900">{formatCurrency(node.actualCost)}</p>
      <p className="text-xs text-gray-500">{formatCurrency(node.budget)}</p>
     </div>

     {/* Actions */}
     <div className="w-32 flex-shrink-0 flex items-center justify-end gap-2">
      <button
       onClick={() => openDetailsModal(node)}
       className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
       title="View Details"
      >
       <Eye className="w-4 h-4" />
      </button>
      <button
       onClick={() => openEditModal(node)}
       className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
       title="Edit"
      >
       <Edit className="w-4 h-4" />
      </button>
      <button
       onClick={() => {
        setSelectedNode(node);
        setShowTrackProgress(true);
       }}
       className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
       title="Track Progress"
      >
       <TrendingUp className="w-4 h-4" />
      </button>
     </div>
    </div>

    {/* Render Children */}
    {hasChildren && isExpanded && (
     <div>
      {node.children.map(child => renderNode(child))}
     </div>
    )}
   </div>
  );
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
   {/* Header Actions */}
   <div className="flex justify-between items-center mb-2">
    <div className="flex items-center gap-3">
     <button
      onClick={() => setShowImportTemplate(true)}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
     >
      <Upload className="w-5 h-5" />
      Import Template
     </button>
    </div>
    <div className="flex items-center gap-3">
     <button
      onClick={() => setShowExport(true)}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
     >
      <Download className="w-5 h-5" />
      Export WBS
     </button>
     <button
      onClick={() => setShowAddPackage(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
     >
      <Plus className="w-5 h-5" />
      Add Work Package
     </button>
    </div>
   </div>

   {/* Summary Stats */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center gap-2 mb-2">
      <FileText className="w-5 h-5 text-blue-600" />
      <p className="text-sm text-gray-600">Total Work Packages</p>
     </div>
     <p className="text-2xl font-bold text-gray-900">21</p>
     <p className="text-xs text-gray-500 mt-1">6 phases · 15 activities</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <p className="text-sm text-gray-600">Completed</p>
     </div>
     <p className="text-2xl font-bold text-green-900">12</p>
     <p className="text-xs text-gray-500 mt-1">57% of total work</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center gap-2 mb-2">
      <Clock className="w-5 h-5 text-blue-600" />
      <p className="text-sm text-gray-600">In Progress</p>
     </div>
     <p className="text-2xl font-bold text-blue-900">4</p>
     <p className="text-xs text-gray-500 mt-1">19% of total work</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center gap-2 mb-2">
      <AlertCircle className="w-5 h-5 text-gray-600" />
      <p className="text-sm text-gray-600">Not Started</p>
     </div>
     <p className="text-2xl font-bold text-gray-900">5</p>
     <p className="text-xs text-gray-500 mt-1">24% of total work</p>
    </div>
   </div>

   {/* Search & Filters */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
    <div className="relative">
     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
     <input
      type="text"
      placeholder="Search work packages..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     />
    </div>
   </div>

   {/* WBS Tree */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {/* Header Row */}
    <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
     <div className="w-6"></div>
     <div className="w-20">Code</div>
     <div className="flex-1">Work Package Name</div>
     <div className="w-32">Progress</div>
     <div className="w-28">Status</div>
     <div className="w-24 text-right">Hours</div>
     <div className="w-32 text-right">Budget (₹)</div>
     <div className="w-20"></div>
    </div>

    {/* Tree Content */}
    <div>
     {wbsTree.map(node => renderNode(node))}
    </div>
   </div>

   {/* Modals */}
   <AddWorkPackageModal
    isOpen={showAddPackage}
    onClose={() => setShowAddPackage(false)}
    parentNode={parentNode}
    onAdd={handleAddPackage}
   />

   {selectedNode && (
    <>
     <EditWBSItemModal
      isOpen={showEditItem}
      onClose={() => setShowEditItem(false)}
      item={selectedNode}
      onUpdate={handleEditItem}
     />

     <MoveWBSItemModal
      isOpen={showMoveItem}
      onClose={() => setShowMoveItem(false)}
      item={selectedNode}
      onMove={handleMoveItem}
     />

     <DecomposeTaskModal
      isOpen={showDecompose}
      onClose={() => setShowDecompose(false)}
      task={selectedNode}
      onDecompose={handleDecompose}
     />

     <WBSDetailsModal
      isOpen={showDetails}
      onClose={() => setShowDetails(false)}
      item={selectedNode}
     />

     <AssignResourcesModal
      isOpen={showAssignResources}
      onClose={() => setShowAssignResources(false)}
      item={selectedNode}
      onAssign={handleAssignResources}
     />

     <TrackProgressModal
      isOpen={showTrackProgress}
      onClose={() => setShowTrackProgress(false)}
      item={selectedNode}
      onUpdate={handleTrackProgress}
     />

     <WBSDependenciesModal
      isOpen={showDependencies}
      onClose={() => setShowDependencies(false)}
      item={selectedNode}
      onUpdate={handleUpdateDependencies}
     />
    </>
   )}

   <ExportWBSModal
    isOpen={showExport}
    onClose={() => setShowExport(false)}
    onExport={handleExport}
   />

   <ImportWBSTemplateModal
    isOpen={showImportTemplate}
    onClose={() => setShowImportTemplate(false)}
    onImport={handleImportTemplate}
   />
   </div>
  </div>
 );
}
