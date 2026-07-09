'use client';

import { useEffect, useMemo, useState } from 'react';
import { Network, Search, Filter, Expand, PlusCircle, ChevronRight, ChevronDown, CheckCircle2, Download, Users, DollarSign, Calendar, Minimize2, AlertCircle } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface WbsNode {
  id: string;
  wbsCode: string;
  name: string;
  description: string;
  projectCode: string;
  projectName: string;
  type: 'project' | 'phase' | 'deliverable' | 'work-package' | 'activity';
  owner: string;
  startDate: string;
  endDate: string;
  progress: number;
  budgetAllocated: number;
  budgetSpent: number;
  effortPlanned: number; // in hours
  effortActual: number; // in hours
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';
  children?: WbsNode[];
}

const VALID_WBS_TYPES: WbsNode['type'][] = ['project', 'phase', 'deliverable', 'work-package', 'activity'];
const VALID_WBS_STATUSES: WbsNode['status'][] = ['not-started', 'in-progress', 'completed', 'on-hold', 'delayed'];

export default function WorkBreakdownStructurePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<WbsNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listWbs();
        const list = Array.isArray(data) ? data : [];
        const nodes: WbsNode[] = list.map((r: any) => {
          const type = VALID_WBS_TYPES.includes(r.type) ? r.type : 'work-package';
          const status = VALID_WBS_STATUSES.includes(r.status) ? r.status : 'not-started';
          const node: WbsNode = {
            id: String(r.id ?? ''),
            wbsCode: r.code ?? '',
            name: r.name ?? '',
            description: r.description ?? '',
            projectCode: r.projectCode ?? '',
            projectName: r.projectName ?? '',
            type,
            owner: r.assignedTo ?? '',
            startDate: r.startDate ?? '',
            endDate: r.endDate ?? '',
            progress: Number(r.progress ?? 0),
            budgetAllocated: Number(r.budget ?? 0),
            budgetSpent: Number(r.actualCost ?? 0),
            effortPlanned: Number(r.estimatedHours ?? 0),
            effortActual: Number(r.actualHours ?? 0),
            status,
            children: []
          };
          return node;
        });

        // Build a tree from the flat list using parentId.
        const byId = new Map<string, WbsNode>();
        nodes.forEach((n) => byId.set(n.id, n));
        const roots: WbsNode[] = [];
        list.forEach((r: any, idx: number) => {
          const node = nodes[idx];
          const parentId = r.parentId != null ? String(r.parentId) : null;
          const parent = parentId ? byId.get(parentId) : undefined;
          if (parent) {
            parent.children!.push(node);
          } else {
            roots.push(node);
          }
        });
        // Drop empty children arrays so hasChildren checks behave.
        nodes.forEach((n) => {
          if (n.children && n.children.length === 0) delete n.children;
        });

        if (!cancelled) {
          setRows(roots);
          setExpanded(Object.fromEntries(roots.map((r) => [r.id, true])));
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load WBS');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const countNodes = (nodes: WbsNode[]): number => {
      return nodes.reduce((sum, node) => {
        return sum + 1 + (node.children ? countNodes(node.children) : 0);
      }, 0);
    };

    const countByStatus = (nodes: WbsNode[], status: string): number => {
      return nodes.reduce((sum, node) => {
        const count = node.status === status ? 1 : 0;
        return sum + count + (node.children ? countByStatus(node.children, status) : 0);
      }, 0);
    };

    const maxDepth = (nodes: WbsNode[], depth: number = 1): number => {
      return nodes.reduce((max, node) => {
        const nodeMax = node.children ? maxDepth(node.children, depth + 1) : depth;
        return Math.max(max, nodeMax);
      }, depth);
    };

    const totalWorkPackages = countNodes(rows);
    const completedPackages = countByStatus(rows, 'completed');
    const inProgressPackages = countByStatus(rows, 'in-progress');
    const notStartedPackages = countByStatus(rows, 'not-started');
    const wbsLevels = rows.length > 0 ? maxDepth(rows) : 0;

    const totalBudget = rows.reduce((sum, p) => sum + p.budgetAllocated, 0);

    return {
      totalWorkPackages,
      completedPackages,
      inProgressPackages,
      notStartedPackages,
      wbsLevels,
      totalBudget
    };
  }, [rows]);

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    const expand = (nodes: WbsNode[]) => {
      nodes.forEach(node => {
        allExpanded[node.id] = true;
        if (node.children) expand(node.children);
      });
    };
    expand(rows);
    setExpanded(allExpanded);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Network className="h-8 w-8 text-teal-600" />
          Work Breakdown Structure
        </h1>
        <p className="text-gray-600 mt-2">Hierarchical decomposition of project deliverables and work packages</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading WBS…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
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
              placeholder="Search WBS items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Expand className="h-4 w-4" />
              Expand All
            </button>
            <button onClick={collapseAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Minimize2 className="h-4 w-4" />
              Collapse All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Add Work Package
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Work Packages</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{stats.totalWorkPackages}</p>
            </div>
            <Network className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">WBS Levels</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.wbsLevels}</p>
            </div>
            <Network className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.completedPackages}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.inProgressPackages}</p>
            </div>
            <Network className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Not Started</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.notStartedPackages}</p>
            </div>
            <Network className="h-12 w-12 text-gray-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Budget</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">₹{(stats.totalBudget / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* WBS Tree */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Work Breakdown Structure</span>
        </div>

        <div className="p-4">
          <WbsTree nodes={rows} expanded={expanded} setExpanded={setExpanded} searchTerm={searchTerm} />
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">WBS Management Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">WBS Principles</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">100% Rule:</span> WBS includes 100% of work defined by project scope</li>
              <li><span className="font-medium">Mutually Exclusive:</span> No overlap between WBS elements at same level</li>
              <li><span className="font-medium">Deliverable-Oriented:</span> Focus on outcomes, not activities</li>
              <li><span className="font-medium">Manageable Size:</span> Work packages small enough to estimate and control</li>
              <li><span className="font-medium">8/80 Rule:</span> Work packages between 8-80 hours of effort</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">WBS Levels</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Level 1:</span> Project - Overall project goal</li>
              <li><span className="font-medium">Level 2:</span> Phase - Major project phases or deliverables</li>
              <li><span className="font-medium">Level 3:</span> Deliverable - Specific deliverable outcomes</li>
              <li><span className="font-medium">Level 4:</span> Work Package - Assignable work units</li>
              <li><span className="font-medium">Level 5:</span> Activity - Detailed tasks (optional)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">WBS Dictionary</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Unique WBS code for each element</li>
              <li>• Description of work included</li>
              <li>• Responsible organization/person</li>
              <li>• Schedule milestones</li>
              <li>• Cost estimates and budget</li>
              <li>• Quality requirements</li>
              <li>• Technical references</li>
              <li>• Contract information (if applicable)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Involve team in WBS development</li>
              <li>• Use consistent decomposition approach</li>
              <li>• Define clear acceptance criteria</li>
              <li>• Link WBS to schedule and budget</li>
              <li>• Review and baseline WBS before execution</li>
              <li>• Update WBS as project evolves</li>
              <li>• Use WBS for progress tracking</li>
              <li>• Maintain WBS dictionary documentation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">WBS Coding Structure</h3>
          <p className="text-sm text-blue-700 mb-2">
            Use hierarchical numbering to uniquely identify each WBS element:
          </p>
          <div className="text-sm text-blue-700 font-mono bg-white p-3 rounded">
            <div>1.0 - Project Level</div>
            <div className="ml-4">1.1 - Phase Level</div>
            <div className="ml-8">1.1.1 - Deliverable Level</div>
            <div className="ml-12">1.1.1.1 - Work Package Level</div>
            <div className="ml-16">1.1.1.1.1 - Activity Level</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WbsTree({
  nodes,
  expanded,
  setExpanded,
  searchTerm,
  level = 0
}: {
  nodes: WbsNode[];
  expanded: Record<string, boolean>;
  setExpanded: (v: Record<string, boolean>) => void;
  searchTerm: string;
  level?: number;
}) {
  const toggle = (id: string) => {
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  const getTypeColor = (type: WbsNode['type']) => {
    switch (type) {
      case 'project': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'phase': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'deliverable': return 'bg-green-100 text-green-700 border-green-300';
      case 'work-package': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'activity': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: WbsNode['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'not-started': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'on-hold': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'delayed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}>
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        const isExpanded = expanded[node.id];
        const matchesSearch = searchTerm === '' ||
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.wbsCode.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch && searchTerm !== '') return null;

        return (
          <div key={node.id} className="mb-3">
            <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                {hasChildren ? (
                  <button
                    onClick={() => toggle(node.id)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors mt-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                ) : (
                  <span className="inline-block w-7" />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{node.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeColor(node.type)}`}>
                      {node.type.toUpperCase().replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(node.status)}`}>
                      {node.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {node.progress === 100 && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{node.description}</p>

                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">WBS Code</p>
                      <p className="font-medium text-gray-900">{node.wbsCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {node.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(node.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(node.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₹{(node.budgetAllocated / 1000).toFixed(0)}K / ₹{(node.budgetSpent / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">Progress:</span>
                      <span className="text-xs font-medium text-gray-900">{node.progress}%</span>
                      <span className="text-xs text-gray-500">
                        ({node.effortActual}h / {node.effortPlanned}h)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 transition-all ${
                          node.progress >= 100 ? 'bg-green-600' :
                          node.progress >= 50 ? 'bg-blue-600' :
                          node.progress > 0 ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${node.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <div className="mt-2">
                <WbsTree
                  nodes={node.children!}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  searchTerm={searchTerm}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
