'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Eye, Edit, Trash2, Copy, Play, Pause,
  FileText, GitBranch, Users, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronLeft, ChevronRight, Settings, Download,
  Upload, Filter, Calendar, Tag, BarChart3, Activity
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { WorkflowService } from '@/services/workflow.service';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'automation' | 'notification' | 'custom';
  status: 'active' | 'draft' | 'archived';
  version: string;
  steps: number;
  usageCount: number;
  avgDuration: string;
  successRate: number;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  tags: string[];
}

const categoryColors = {
  approval: 'bg-blue-100 text-blue-700',
  automation: 'bg-green-100 text-green-700',
  notification: 'bg-purple-100 text-purple-700',
  custom: 'bg-orange-100 text-orange-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-700',
};

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Service returns a rich workflow-template shape; map it defensively to
        // this page's lightweight WorkflowTemplate model.
        const raw = (await WorkflowService.getAllWorkflowTemplates()) as any[];
        const categoryMap: Record<string, WorkflowTemplate['category']> = {
          approval: 'approval',
          automation: 'automation',
          notification: 'notification',
          custom: 'custom',
        };
        const statusMap: Record<string, WorkflowTemplate['status']> = {
          active: 'active',
          draft: 'draft',
          inactive: 'archived',
          archived: 'archived',
        };
        const mapped: WorkflowTemplate[] = (raw ?? []).map((t) => {
          const rawCategory = String(t.category ?? '').toLowerCase();
          const rawStatus = String(t.status ?? '').toLowerCase();
          return {
            id: String(t.id ?? t.code ?? ''),
            name: t.name ?? '',
            description: t.description ?? '',
            category: categoryMap[rawCategory] ?? 'custom',
            status: statusMap[rawStatus] ?? 'draft',
            version: String(t.version ?? '1'),
            steps: Array.isArray(t.steps) ? t.steps.length : Number(t.steps ?? 0),
            usageCount: Number(t.instanceCount ?? t.usageCount ?? 0),
            avgDuration: t.avgDuration ?? 'N/A',
            successRate: Number(t.successRate ?? 0),
            createdBy: t.createdBy ?? 'Unknown',
            createdAt: t.createdAt
              ? new Date(t.createdAt).toISOString().split('T')[0]
              : '',
            lastModified: t.updatedAt
              ? new Date(t.updatedAt).toISOString().split('T')[0]
              : (t.lastModified ?? ''),
            tags: Array.isArray(t.tags) ? t.tags : t.category ? [String(t.category)] : [],
          };
        });
        if (!cancelled) setTemplates(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load workflow templates');
          setTemplates([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.status === 'active').length,
    draft: templates.filter((t) => t.status === 'draft').length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    avgSuccessRate: (templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length).toFixed(1),
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow template?')) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const handleDuplicateTemplate = (template: WorkflowTemplate) => {
    const newTemplate = {
      ...template,
      id: `WT${String(templates.length + 1).padStart(3, '0')}`,
      name: `${template.name} (Copy)`,
      status: 'draft' as const,
      version: '1.0',
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleActivateTemplate = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, status: 'active' as const } : t
    ));
  };

  const handleBulkAction = (action: string) => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template');
      return;
    }

    switch (action) {
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)?`)) {
          setTemplates(templates.filter(t => !selectedTemplates.includes(t.id)));
          setSelectedTemplates([]);
        }
        break;
      case 'archive':
        setTemplates(templates.map(t =>
          selectedTemplates.includes(t.id) ? { ...t, status: 'archived' as const } : t
        ));
        setSelectedTemplates([]);
        break;
      case 'export':
        exportToCsv(
          'workflow-templates',
          filteredTemplates.filter((t) => selectedTemplates.includes(t.id)) as unknown as Record<string, unknown>[],
        );
        break;
    }
  };

  const toggleTemplateSelection = (id: string) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTemplates.length === paginatedTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(paginatedTemplates.map(t => t.id));
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
              <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                Design and manage reusable business process workflows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Import template functionality')}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={() => router.push('/workflow/templates/create')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading workflow templates…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && templates.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            No workflow templates found.
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Templates</p>
                <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</p>
                <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Draft</p>
                <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{stats.draft}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total Usage</p>
                <p className="text-2xl font-black text-purple-600 mt-1 italic tracking-tighter">{stats.totalUsage.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Success Rate</p>
                <p className="text-2xl font-black text-white mt-1 italic tracking-tighter">{stats.avgSuccessRate}%</p>
              </div>
              <div className="p-2 bg-gray-800 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${showFilters
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex gap-2 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="all">All Categories</option>
                <option value="approval">Approval</option>
                <option value="automation">Automation</option>
                <option value="notification">Notification</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTemplates.length > 0 && (
          <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedTemplates.length} template(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                <Download className="h-4 w-4 inline mr-1" />
                Export
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1.5 text-sm bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 text-sm bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {paginatedTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg border-2 p-3 hover:shadow-lg transition-all ${selectedTemplates.includes(template.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={() => toggleTemplateSelection(template.id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[template.status]}`}>
                        {template.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[template.category]}`}>
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500">v{template.version}</span>
                      <span className="text-xs text-gray-500">ID: {template.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-4 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Steps</p>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">{template.steps}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Usage</p>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">{template.usageCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg Duration</p>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">{template.avgDuration}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className={`h-4 w-4 ${getSuccessRateColor(template.successRate)}`} />
                    <span className={`text-sm font-semibold ${getSuccessRateColor(template.successRate)}`}>
                      {template.successRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Meta */}
              <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Created by {template.createdBy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Modified {template.lastModified}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/workflow/templates/view/${template.id}`)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => router.push(`/workflow/templates/edit/${template.id}`)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="flex items-center justify-center px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"

                >
                  <Copy className="h-4 w-4" />
                </button>
                {template.status === 'draft' && (
                  <button
                    onClick={() => handleActivateTemplate(template.id)}
                    className="flex items-center justify-center px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"

                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"

                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTemplates.length === paginatedTemplates.length && paginatedTemplates.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} templates
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
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
