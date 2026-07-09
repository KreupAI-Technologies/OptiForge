'use client';

import { useState, useMemo, useEffect } from 'react';
import { GitBranch, Search, Filter, PlusCircle, Download, AlertTriangle, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ChangeRequest {
  id: string;
  changeNumber: string;
  title: string;
  description: string;
  projectCode: string;
  projectName: string;
  requestedBy: string;
  requestDate: string;
  category: 'scope' | 'schedule' | 'cost' | 'quality' | 'resource' | 'technical';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'implemented' | 'cancelled';
  impactCost: number;
  impactSchedule: number; // in days
  impactScope: 'major' | 'moderate' | 'minor';
  justification: string;
  approvedBy?: string;
  approvalDate?: string;
  implementationDate?: string;
  reviewComments?: string;
}

const CHANGE_CATEGORIES: ChangeRequest['category'][] = ['scope', 'schedule', 'cost', 'quality', 'resource', 'technical'];
const CHANGE_PRIORITIES: ChangeRequest['priority'][] = ['critical', 'high', 'medium', 'low'];
const CHANGE_STATUSES: ChangeRequest['status'][] = ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'implemented', 'cancelled'];
const CHANGE_SCOPES: ChangeRequest['impactScope'][] = ['major', 'moderate', 'minor'];

export default function ChangeRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [rows, setRows] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listChangeOrders();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: ChangeRequest[] = list.map((r: any) => {
          const categoryRaw = String(r.category ?? r.changeType ?? '').toLowerCase();
          const category = CHANGE_CATEGORIES.includes(categoryRaw as ChangeRequest['category'])
            ? (categoryRaw as ChangeRequest['category'])
            : 'scope';
          const priorityRaw = String(r.priority ?? '').toLowerCase();
          const priority = CHANGE_PRIORITIES.includes(priorityRaw as ChangeRequest['priority'])
            ? (priorityRaw as ChangeRequest['priority'])
            : 'medium';
          const statusRaw = String(r.status ?? '').toLowerCase().replace(/_/g, '-');
          const status = CHANGE_STATUSES.includes(statusRaw as ChangeRequest['status'])
            ? (statusRaw as ChangeRequest['status'])
            : 'draft';
          const scopeRaw = String(r.impactScope ?? '').toLowerCase();
          const impactScope = CHANGE_SCOPES.includes(scopeRaw as ChangeRequest['impactScope'])
            ? (scopeRaw as ChangeRequest['impactScope'])
            : 'minor';
          return {
            id: String(r.id ?? ''),
            changeNumber: String(r.changeOrderNumber ?? r.id ?? ''),
            title: String(r.title ?? ''),
            description: String(r.description ?? ''),
            projectCode: String(r.projectId ?? ''),
            projectName: String(r.projectName ?? ''),
            requestedBy: String(r.requestedBy ?? ''),
            requestDate: String(r.requestDate ?? ''),
            category,
            priority,
            status,
            impactCost: Number(r.impactOnCost ?? 0),
            impactSchedule: Number(r.impactOnSchedule ?? 0),
            impactScope,
            justification: String(r.reason ?? ''),
            approvedBy: r.approvedBy ? String(r.approvedBy) : undefined,
            approvalDate: r.approvalDate ? String(r.approvalDate) : undefined,
            implementationDate: r.implementationDate ? String(r.implementationDate) : undefined,
            reviewComments: r.remarks ? String(r.remarks) : undefined,
          };
        });
        setRows(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load change requests');
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Get unique projects
  const projects = useMemo(() =>
    ['all', ...Array.from(new Set(rows.map(c => c.projectName)))],
    [rows]
  );

  // Filter change requests
  const filteredChanges = useMemo(() => {
    return rows.filter(change => {
      const matchesSearch = searchTerm === '' ||
        change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.changeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = projectFilter === 'all' || change.projectName === projectFilter;
      const matchesStatus = statusFilter === 'all' || change.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || change.category === categoryFilter;

      return matchesSearch && matchesProject && matchesStatus && matchesCategory;
    });
  }, [rows, searchTerm, projectFilter, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRequests = rows.length;
    const draftCount = rows.filter(c => c.status === 'draft').length;
    const submittedCount = rows.filter(c => c.status === 'submitted').length;
    const underReviewCount = rows.filter(c => c.status === 'under-review').length;
    const approvedCount = rows.filter(c => c.status === 'approved').length;
    const rejectedCount = rows.filter(c => c.status === 'rejected').length;
    const implementedCount = rows.filter(c => c.status === 'implemented').length;

    const totalCostImpact = rows
      .filter(c => c.status === 'approved' || c.status === 'implemented')
      .reduce((sum, c) => sum + c.impactCost, 0);

    return {
      totalRequests,
      draftCount,
      submittedCount,
      underReviewCount,
      approvedCount,
      rejectedCount,
      implementedCount,
      totalCostImpact
    };
  }, [rows]);

  const getStatusColor = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under-review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'implemented': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ChangeRequest['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getImpactScopeColor = (scope: ChangeRequest['impactScope']) => {
    switch (scope) {
      case 'major': return 'text-red-700 font-semibold';
      case 'moderate': return 'text-yellow-700 font-semibold';
      case 'minor': return 'text-green-700 font-semibold';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <GitBranch className="h-8 w-8 text-teal-600" />
          Change Requests
        </h1>
        <p className="text-gray-600 mt-2">Manage project scope and requirement changes with impact analysis</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading change requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
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
              placeholder="Search change requests by title, number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCsv('change-requests', filteredChanges as unknown as Record<string, unknown>[])} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              New Change Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <p className="text-teal-600 text-xs font-medium">Total</p>
          <p className="text-2xl font-bold text-teal-900 mt-1">{stats.totalRequests}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-gray-600 text-xs font-medium">Draft</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draftCount}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-blue-600 text-xs font-medium">Submitted</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.submittedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-yellow-600 text-xs font-medium">Review</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.underReviewCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-green-600 text-xs font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.approvedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-purple-600 text-xs font-medium">Implemented</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.implementedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-red-600 text-xs font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejectedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-orange-600 text-xs font-medium">Cost Impact</p>
          <p className="text-lg font-bold text-orange-900 mt-1">₹{(stats.totalCostImpact / 100000).toFixed(1)}L</p>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="implemented">Implemented</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="scope">Scope</option>
            <option value="schedule">Schedule</option>
            <option value="cost">Cost</option>
            <option value="quality">Quality</option>
            <option value="resource">Resource</option>
            <option value="technical">Technical</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredChanges.length} of {rows.length} requests
          </div>
        </div>
      </div>

      {/* Change Requests List */}
      <div className="space-y-2">
        {filteredChanges.map((change) => (
          <div key={change.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{change.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(change.status)}`}>
                    {change.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(change.priority)}`}>
                    {change.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded border bg-gray-100 text-gray-700 border-gray-300 capitalize">
                    {change.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{change.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{change.changeNumber}</span>
                  <span>•</span>
                  <span>{change.projectName}</span>
                  <span>•</span>
                  <span>Requested by {change.requestedBy}</span>
                  <span>•</span>
                  <span>{new Date(change.requestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="text-xs text-orange-700 font-medium mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Cost Impact
                </p>
                <p className={`text-lg font-semibold ${change.impactCost >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {change.impactCost >= 0 ? '+' : ''}₹{change.impactCost.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <p className="text-xs text-orange-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Schedule Impact
                </p>
                <p className={`text-lg font-semibold ${change.impactSchedule > 0 ? 'text-red-700' : change.impactSchedule < 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {change.impactSchedule > 0 ? '+' : ''}{change.impactSchedule} days
                </p>
              </div>

              <div>
                <p className="text-xs text-orange-700 font-medium mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Scope Impact
                </p>
                <p className={`text-lg font-semibold capitalize ${getImpactScopeColor(change.impactScope)}`}>
                  {change.impactScope}
                </p>
              </div>
            </div>

            {/* Justification */}
            <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">Justification</p>
              <p className="text-sm text-blue-900">{change.justification}</p>
            </div>

            {/* Approval/Review Info */}
            {(change.approvedBy || change.reviewComments) && (
              <div className={`p-3 ${change.status === 'approved' || change.status === 'implemented' ? 'bg-green-50 border-green-200' : change.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg`}>
                {change.approvedBy && (
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      {change.status === 'rejected' ? 'Rejected' : 'Approved'} by {change.approvedBy}
                      {change.approvalDate && ` on ${new Date(change.approvalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                )}
                {change.implementationDate && (
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      Implemented on {new Date(change.implementationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {change.reviewComments && (
                  <div>
                    <p className="text-xs font-medium mb-1">Comments</p>
                    <p className="text-sm">{change.reviewComments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredChanges.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <GitBranch className="h-16 w-16 mb-2 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Change Requests Found</h3>
            <p className="text-gray-600">No change requests match your current filters</p>
          </div>
        )}
      </div>

      {/* Guidelines Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Change Management Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Change Request Process</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">1. Identify:</span> Recognize need for change with clear justification</li>
              <li><span className="font-medium">2. Document:</span> Submit formal change request with impact analysis</li>
              <li><span className="font-medium">3. Review:</span> Evaluate technical feasibility and impacts</li>
              <li><span className="font-medium">4. Approve:</span> Decision by change control board or authority</li>
              <li><span className="font-medium">5. Implement:</span> Execute approved changes with tracking</li>
              <li><span className="font-medium">6. Verify:</span> Confirm implementation and update baselines</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Impact Assessment</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Cost Impact:</span> Additional or reduced project costs</li>
              <li><span className="font-medium">Schedule Impact:</span> Effect on project timeline and milestones</li>
              <li><span className="font-medium">Scope Impact:</span> Changes to deliverables and requirements</li>
              <li><span className="font-medium">Quality Impact:</span> Effect on quality standards and acceptance</li>
              <li><span className="font-medium">Resource Impact:</span> Changes in team or material requirements</li>
              <li><span className="font-medium">Risk Impact:</span> New risks or risk mitigation opportunities</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Change Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Scope:</span> Additions, reductions, or modifications to deliverables</li>
              <li><span className="font-medium">Schedule:</span> Timeline accelerations or extensions</li>
              <li><span className="font-medium">Cost:</span> Budget increases, cost optimizations</li>
              <li><span className="font-medium">Quality:</span> Material upgrades, finish changes</li>
              <li><span className="font-medium">Resource:</span> Team augmentation, equipment changes</li>
              <li><span className="font-medium">Technical:</span> Design changes, technical specifications</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Document all changes formally with impact analysis</li>
              <li>• Get stakeholder buy-in before implementation</li>
              <li>• Update project baselines after approved changes</li>
              <li>• Track change request metrics and trends</li>
              <li>• Communicate changes to all affected parties</li>
              <li>• Link changes to issues, risks, and lessons learned</li>
              <li>• Review change log in project status meetings</li>
              <li>• Maintain audit trail for compliance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Change Control Board (CCB)</h3>
          <p className="text-sm text-blue-700 mb-2">
            The CCB is responsible for reviewing, approving, or rejecting change requests. Members typically include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
            <div>
              <p className="font-medium">Project Manager</p>
              <p>Chairs the CCB, manages process</p>
            </div>
            <div>
              <p className="font-medium">Technical Lead</p>
              <p>Assesses technical feasibility</p>
            </div>
            <div>
              <p className="font-medium">Commercial Manager</p>
              <p>Evaluates cost and contractual impacts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
