'use client';

import { useState, useMemo, useEffect } from 'react';
import { Target, Search, Filter, PlusCircle, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ScopeItem {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  projectCode: string;
  projectName: string;
  category: 'deliverable' | 'feature' | 'function' | 'constraint' | 'assumption';
  type: 'in-scope' | 'out-of-scope';
  status: 'defined' | 'approved' | 'changed' | 'removed';
  wbsReference: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedDuration: number; // in days
  dependencies: string[];
  approvedBy?: string;
  approvedDate?: string;
  notes: string;
}

const mockScopeData: ScopeItem[] = [
  {
    id: '1',
    itemCode: 'SC-1001',
    itemName: 'Kitchen Base Cabinets',
    description: '12 base cabinets with soft-close drawers, modular construction, 18mm BWP plywood',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-1.3.1',
    priority: 'critical',
    estimatedCost: 280000,
    estimatedDuration: 12,
    dependencies: ['SC-1002'],
    approvedBy: 'Amit Singh',
    approvedDate: '2025-10-01',
    notes: 'Client approved final design on 2025-09-28'
  },
  {
    id: '2',
    itemCode: 'SC-1002',
    itemName: 'Kitchen Wall Cabinets',
    description: '8 wall-mounted cabinets with glass shutters, LED strip lighting provision',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-1.3.2',
    priority: 'high',
    estimatedCost: 180000,
    estimatedDuration: 10,
    dependencies: [],
    approvedBy: 'Amit Singh',
    approvedDate: '2025-10-01',
    notes: 'Includes soft-close hinges'
  },
  {
    id: '3',
    itemCode: 'SC-1003',
    itemName: 'Granite Countertop',
    description: 'Black galaxy granite, 18mm thickness, polished finish, 12 sq.m area',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-1.3.3',
    priority: 'high',
    estimatedCost: 120000,
    estimatedDuration: 5,
    dependencies: ['SC-1001'],
    approvedBy: 'Amit Singh',
    approvedDate: '2025-10-01',
    notes: 'Client to provide sample approval'
  },
  {
    id: '4',
    itemCode: 'SC-1004',
    itemName: 'Kitchen Appliances',
    description: 'Procurement and installation of hob, chimney, microwave, dishwasher',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'deliverable',
    type: 'out-of-scope',
    status: 'defined',
    wbsReference: '-',
    priority: 'medium',
    estimatedCost: 0,
    estimatedDuration: 0,
    dependencies: [],
    notes: 'Client to directly purchase appliances, we provide cutouts only'
  },
  {
    id: '5',
    itemCode: 'SC-1005',
    itemName: 'Electrical Wiring',
    description: 'New electrical points and wiring for kitchen appliances',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'constraint',
    type: 'out-of-scope',
    status: 'defined',
    wbsReference: '-',
    priority: 'high',
    estimatedCost: 0,
    estimatedDuration: 0,
    dependencies: [],
    notes: 'Building MEP contractor to handle, coordinate for cutout locations'
  },
  {
    id: '6',
    itemCode: 'SC-1006',
    itemName: 'Backsplash Tiling',
    description: '6mm glass backsplash with digital print, 8 sq.m area',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    category: 'deliverable',
    type: 'in-scope',
    status: 'changed',
    wbsReference: 'WBS-1.3.4',
    priority: 'medium',
    estimatedCost: 45000,
    estimatedDuration: 3,
    dependencies: ['SC-1003'],
    approvedBy: 'Amit Singh',
    approvedDate: '2025-10-15',
    notes: 'Changed from ceramic tiles to glass as per client request, approved change order CO-001'
  },
  {
    id: '7',
    itemCode: 'SC-2001',
    itemName: 'Wardrobe Carcass',
    description: 'Built-in wardrobe frames, 6 units, BWP plywood construction',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-2.3.1',
    priority: 'critical',
    estimatedCost: 320000,
    estimatedDuration: 15,
    dependencies: [],
    approvedBy: 'Design Lead',
    approvedDate: '2025-10-05',
    notes: 'Floor-to-ceiling wardrobes as per architectural drawings'
  },
  {
    id: '8',
    itemCode: 'SC-2002',
    itemName: 'Wardrobe Shutters',
    description: 'Hinged shutters with laminate finish, soft-close hinges, mirror panels',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-2.3.2',
    priority: 'critical',
    estimatedCost: 280000,
    estimatedDuration: 12,
    dependencies: ['SC-2001'],
    approvedBy: 'Design Lead',
    approvedDate: '2025-10-05',
    notes: 'Client selected matt finish laminate'
  },
  {
    id: '9',
    itemCode: 'SC-2003',
    itemName: 'Wardrobe Internals',
    description: 'Shelves, drawers, shoe racks, tie racks as per layout',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-2.3.3',
    priority: 'high',
    estimatedCost: 180000,
    estimatedDuration: 8,
    dependencies: ['SC-2001'],
    approvedBy: 'Design Lead',
    approvedDate: '2025-10-05',
    notes: 'Premium fittings as per spec'
  },
  {
    id: '10',
    itemCode: 'SC-2004',
    itemName: 'Walk-in Wardrobe Conversion',
    description: 'Convert spare room to walk-in wardrobe with seating',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    category: 'feature',
    type: 'out-of-scope',
    status: 'defined',
    wbsReference: '-',
    priority: 'low',
    estimatedCost: 0,
    estimatedDuration: 0,
    dependencies: [],
    notes: 'Client may consider in phase 2, structural work required'
  },
  {
    id: '11',
    itemCode: 'SC-3001',
    itemName: 'Pantry Base Units',
    description: 'Modular base units, 8 linear meters, stainless steel countertop',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-3.2.1',
    priority: 'critical',
    estimatedCost: 240000,
    estimatedDuration: 10,
    dependencies: [],
    approvedBy: 'Project Manager',
    approvedDate: '2025-10-10',
    notes: 'Fire-rated materials as per office compliance'
  },
  {
    id: '12',
    itemCode: 'SC-3002',
    itemName: 'Pantry Wall Units',
    description: 'Wall-mounted storage units, 6 linear meters, glass shutters',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-3.2.2',
    priority: 'high',
    estimatedCost: 160000,
    estimatedDuration: 8,
    dependencies: ['SC-3001'],
    approvedBy: 'Project Manager',
    approvedDate: '2025-10-10',
    notes: 'Easy-access design for office use'
  },
  {
    id: '13',
    itemCode: 'SC-3003',
    itemName: 'Plumbing Fixtures',
    description: 'Sink, faucet, water purifier installation',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    category: 'constraint',
    type: 'out-of-scope',
    status: 'defined',
    wbsReference: '-',
    priority: 'medium',
    estimatedCost: 0,
    estimatedDuration: 0,
    dependencies: [],
    notes: 'Building facilities team to handle plumbing work'
  },
  {
    id: '14',
    itemCode: 'SC-4001',
    itemName: 'Display Wall System',
    description: 'Modular display wall with LED lighting, 15 meters length',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-4.3.1',
    priority: 'critical',
    estimatedCost: 480000,
    estimatedDuration: 12,
    dependencies: [],
    approvedBy: 'Contracts Manager',
    approvedDate: '2025-10-15',
    notes: 'Client approved 3D mockup'
  },
  {
    id: '15',
    itemCode: 'SC-4002',
    itemName: 'Reception Desk',
    description: 'Custom reception desk with storage, Corian top, 3 meters length',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    category: 'deliverable',
    type: 'in-scope',
    status: 'approved',
    wbsReference: 'WBS-4.3.2',
    priority: 'high',
    estimatedCost: 180000,
    estimatedDuration: 8,
    dependencies: [],
    approvedBy: 'Contracts Manager',
    approvedDate: '2025-10-15',
    notes: 'Brand logo to be backlit'
  }
];

export default function ScopeManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [scopeData, setScopeData] = useState<ScopeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.listScope();
        const mapped: ScopeItem[] = (raw ?? []).map((r: any) => ({
          id: String(r.id),
          itemCode: r.itemCode ?? '',
          itemName: r.itemName ?? '',
          description: r.description ?? '',
          projectCode: r.projectCode ?? '',
          projectName: r.projectName ?? '',
          category: r.category ?? 'deliverable',
          type: r.type ?? 'in-scope',
          status: r.status ?? 'defined',
          wbsReference: r.wbsReference ?? '-',
          priority: r.priority ?? 'medium',
          estimatedCost: Number(r.estimatedCost ?? 0),
          estimatedDuration: Number(r.estimatedDuration ?? 0),
          dependencies: Array.isArray(r.dependencies) ? r.dependencies : [],
          approvedBy: r.approvedBy ?? undefined,
          approvedDate: r.approvedDate ?? undefined,
          notes: r.notes ?? '',
        }));
        if (!cancelled) setScopeData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load scope items');
          setScopeData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Get unique values for filters
  const projects = useMemo(() =>
    ['all', ...Array.from(new Set(scopeData.map(s => s.projectName)))],
    [scopeData]
  );

  // Filter scope items
  const filteredItems = useMemo(() => {
    return scopeData.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = projectFilter === 'all' || item.projectName === projectFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesProject && matchesType && matchesStatus && matchesCategory;
    });
  }, [scopeData, searchTerm, projectFilter, typeFilter, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const inScopeItems = scopeData.filter(s => s.type === 'in-scope').length;
    const outOfScopeItems = scopeData.filter(s => s.type === 'out-of-scope').length;
    const changedItems = scopeData.filter(s => s.status === 'changed').length;
    const approvedItems = scopeData.filter(s => s.status === 'approved').length;
    const totalCost = scopeData
      .filter(s => s.type === 'in-scope')
      .reduce((sum, s) => sum + s.estimatedCost, 0);
    const inScopeDurations = scopeData.filter(s => s.type === 'in-scope').map(s => s.estimatedDuration);
    const totalDuration = inScopeDurations.length ? Math.max(...inScopeDurations) : 0;

    return {
      inScopeItems,
      outOfScopeItems,
      changedItems,
      approvedItems,
      totalCost,
      totalDuration
    };
  }, [scopeData]);

  const getTypeColor = (type: ScopeItem['type']) => {
    switch (type) {
      case 'in-scope': return 'bg-green-50 text-green-700 border-green-200';
      case 'out-of-scope': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: ScopeItem['status']) => {
    switch (status) {
      case 'defined': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'changed': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'removed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ScopeItem['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="h-8 w-8 text-teal-600" />
          Scope Management
        </h1>
        <p className="text-gray-600 mt-2">Define and manage project scope boundaries, deliverables, and exclusions</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading scope items…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search scope items by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCsv('scope-management', filteredItems as unknown as Record<string, unknown>[])} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Add Scope Item
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">In Scope</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.inScopeItems}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Out of Scope</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.outOfScopeItems}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Changed</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.changedItems}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.approvedItems}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Cost</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">₹{(stats.totalCost / 100000).toFixed(1)}L</p>
            </div>
            <Target className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Max Duration</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{stats.totalDuration}d</p>
            </div>
            <Target className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {project === 'all' ? 'All Projects' : project}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="in-scope">In Scope</option>
            <option value="out-of-scope">Out of Scope</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="defined">Defined</option>
            <option value="approved">Approved</option>
            <option value="changed">Changed</option>
            <option value="removed">Removed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="deliverable">Deliverable</option>
            <option value="feature">Feature</option>
            <option value="function">Function</option>
            <option value="constraint">Constraint</option>
            <option value="assumption">Assumption</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredItems.length} of {scopeData.length} items
          </div>
        </div>
      </div>

      {/* Scope Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.itemName}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(item.type)}`}>
                    {item.type === 'in-scope' ? <CheckCircle className="inline h-3 w-3 mr-1" /> : <XCircle className="inline h-3 w-3 mr-1" />}
                    {item.type.toUpperCase().replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border bg-gray-100 text-gray-700 border-gray-300 capitalize`}>
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{item.itemCode}</span>
                  <span>•</span>
                  <span>{item.projectName}</span>
                  <span>•</span>
                  <span>WBS: {item.wbsReference}</span>
                  <span>•</span>
                  <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority.toUpperCase()} Priority
                  </span>
                </div>
              </div>
            </div>

            {item.type === 'in-scope' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
                  <p className="text-sm font-medium text-gray-900">₹{item.estimatedCost.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Duration</p>
                  <p className="text-sm font-medium text-gray-900">{item.estimatedDuration} days</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Approved By</p>
                  <p className="text-sm font-medium text-gray-900">{item.approvedBy || '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Approved Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.approvedDate ? new Date(item.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            )}

            {item.dependencies.length > 0 && (
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Dependencies</p>
                <div className="flex items-center gap-2">
                  {item.dependencies.map((dep) => (
                    <span key={dep} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded border border-blue-300">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Target className="h-16 w-16 mb-2 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Scope Items Found</h3>
            <p className="text-gray-600">No scope items match your current filters</p>
          </div>
        )}
      </div>

      {/* Guidelines Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Scope Management Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Scope Definition</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Deliverables:</span> Tangible outputs and products to be delivered</li>
              <li><span className="font-medium">Features:</span> Functional characteristics and capabilities</li>
              <li><span className="font-medium">Boundaries:</span> Clear definition of what is included and excluded</li>
              <li><span className="font-medium">Acceptance Criteria:</span> Standards for deliverable approval</li>
              <li><span className="font-medium">Assumptions:</span> Factors considered true for planning purposes</li>
              <li><span className="font-medium">Constraints:</span> Limitations and restrictions on the project</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Scope Control</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Baseline:</span> Approved version of scope used for comparison</li>
              <li><span className="font-medium">Change Control:</span> Formal process for scope modifications</li>
              <li><span className="font-medium">Scope Creep:</span> Uncontrolled expansion of scope without adjustments</li>
              <li><span className="font-medium">Gold Plating:</span> Adding features beyond requirements</li>
              <li><span className="font-medium">Variance Analysis:</span> Compare actual vs planned scope</li>
              <li><span className="font-medium">Impact Assessment:</span> Evaluate cost, time, quality effects</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Scope Verification</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Review deliverables against acceptance criteria</li>
              <li>• Obtain formal acceptance from stakeholders</li>
              <li>• Document completion of scope items</li>
              <li>• Conduct quality inspections</li>
              <li>• Validate against original requirements</li>
              <li>• Address any deviations or defects</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Involve stakeholders in scope definition</li>
              <li>• Document scope clearly and comprehensively</li>
              <li>• Link scope to WBS and schedule</li>
              <li>• Establish change control process early</li>
              <li>• Review scope regularly with team</li>
              <li>• Track and manage scope changes formally</li>
              <li>• Communicate exclusions explicitly</li>
              <li>• Maintain traceability to requirements</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Scope Baseline</h3>
          <p className="text-sm text-green-700">
            The scope baseline consists of the approved scope statement, WBS, and WBS dictionary. It serves as the
            reference point for all scope-related decisions and changes. Any modification to the baseline requires
            formal change control approval. Regular comparison of actual deliverables against the baseline helps
            identify variances and scope creep early.
          </p>
        </div>
      </div>
    </div>
  );
}
