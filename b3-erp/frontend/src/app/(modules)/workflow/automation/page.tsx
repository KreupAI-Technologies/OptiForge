'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { workflowAutomationService } from '@/services/workflow-automation.service';
import {
  Plus, Search, Eye, Edit, Trash2, Play, Pause, Power,
  Zap, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp,
  ChevronLeft, ChevronRight, Settings, RefreshCw, Calendar,
  Activity, Filter, BarChart3, Target, Bot, Users, GitBranch
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'schedule' | 'event' | 'condition' | 'manual';
  triggerDetails: string;
  action: string;
  status: 'active' | 'paused' | 'error' | 'draft';
  frequency: string;
  lastRun: string;
  nextRun: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: string;
  category: 'procurement' | 'production' | 'finance' | 'hr' | 'inventory' | 'sales';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  createdAt: string;
}

const COMPANY_ID = 'company-001';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const categoryColors = {
  procurement: 'bg-purple-100 text-purple-700',
  production: 'bg-indigo-100 text-indigo-700',
  finance: 'bg-green-100 text-green-700',
  hr: 'bg-pink-100 text-pink-700',
  inventory: 'bg-teal-100 text-teal-700',
  sales: 'bg-blue-100 text-blue-700',
};

const triggerIcons = {
  schedule: Clock,
  event: Zap,
  condition: Target,
  manual: Users,
};

export default function WorkflowAutomationPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await workflowAutomationService.findAll(COMPANY_ID);
        if (!active) return;
        const mapped: AutomationRule[] = rows.map((r) => ({
          id: r.id,
          name: r.name ?? '',
          description: r.description ?? '',
          trigger: (r.trigger ?? 'manual') as AutomationRule['trigger'],
          triggerDetails: r.triggerDetails ?? '',
          action: r.action ?? '',
          status: (r.status ?? 'draft') as AutomationRule['status'],
          frequency: r.frequency ?? '',
          lastRun: r.lastRun ?? '',
          nextRun: r.nextRun ?? '',
          executionCount: Number(r.executionCount ?? 0),
          successRate: Number(r.successRate ?? 0),
          avgExecutionTime: r.avgExecutionTime ?? '',
          category: (r.category ?? 'production') as AutomationRule['category'],
          priority: (r.priority ?? 'medium') as AutomationRule['priority'],
          createdBy: r.createdByName ?? '',
          createdAt: r.createdAt ?? '',
        }));
        setAutomations(mapped);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load automations',
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch =
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || automation.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || automation.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAutomations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAutomations = filteredAutomations.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: automations.length,
    active: automations.filter((a) => a.status === 'active').length,
    paused: automations.filter((a) => a.status === 'paused').length,
    error: automations.filter((a) => a.status === 'error').length,
    totalExecutions: automations.reduce((sum, a) => sum + a.executionCount, 0),
    avgSuccessRate: automations.length
      ? (automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length).toFixed(1)
      : '0.0',
  };

  const handleToggleAutomation = (id: string) => {
    setAutomations(automations.map(a =>
      a.id === id
        ? { ...a, status: a.status === 'active' ? 'paused' as const : 'active' as const }
        : a
    ));
  };

  const handleDeleteAutomation = (id: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setAutomations(automations.filter((a) => a.id !== id));
    }
  };

  const handleRunNow = (automation: AutomationRule) => {
    alert(`Running automation: ${automation.name}`);
    const updatedAutomations = automations.map(a =>
      a.id === automation.id
        ? {
          ...a,
          lastRun: new Date().toISOString().split('T').join(' ').substring(0, 16),
          executionCount: a.executionCount + 1,
        }
        : a
    );
    setAutomations(updatedAutomations);
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTriggerIcon = (trigger: AutomationRule['trigger']) => {
    const Icon = triggerIcons[trigger];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
              <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                Manage automation rules and scheduled tasks
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/workflow/automation/create')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="h-4 w-4" />
            New Automation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading && (
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
            Loading automation rules...
          </div>
        )}
        {loadError && !isLoading && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Rules</p>
                <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600" />
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
                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Paused</p>
                <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{stats.paused}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Pause className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Errors</p>
                <p className="text-2xl font-black text-red-600 mt-1 italic tracking-tighter">{stats.error}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Executions</p>
                <p className="text-2xl font-black text-purple-600 mt-1 italic tracking-tighter">{stats.totalExecutions.toLocaleString()}</p>
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
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search automations by name, description, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="procurement">Procurement</option>
                <option value="production">Production</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
                <option value="inventory">Inventory</option>
                <option value="sales">Sales</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          )}
        </div>

        {/* Automation Rules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {paginatedAutomations.map((automation) => (
            <div
              key={automation.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all"
            >
              {/* Automation Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[automation.status]}`}>
                      {automation.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[automation.priority]}`}>
                      {automation.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[automation.category]}`}>
                      {automation.category}
                    </span>
                    <span className="text-xs text-gray-500">ID: {automation.id}</span>
                  </div>
                </div>
              </div>

              {/* Trigger and Action Info */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTriggerIcon(automation.trigger)}
                    <p className="text-xs font-medium text-blue-900">Trigger</p>
                  </div>
                  <p className="text-xs text-blue-700 font-semibold">{automation.trigger}</p>
                  <p className="text-xs text-gray-600 mt-1">{automation.triggerDetails}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <GitBranch className="h-4 w-4 text-green-700" />
                    <p className="text-xs font-medium text-green-900">Action</p>
                  </div>
                  <p className="text-xs text-green-700 font-semibold">{automation.action}</p>
                  <p className="text-xs text-gray-600 mt-1">{automation.frequency}</p>
                </div>
              </div>

              {/* Execution Stats */}
              <div className="grid grid-cols-4 gap-3 mb-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Executions</p>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">{automation.executionCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className={`h-3 w-3 ${getSuccessRateColor(automation.successRate)}`} />
                    <span className={`text-sm font-semibold ${getSuccessRateColor(automation.successRate)}`}>
                      {automation.successRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                  <span className="text-sm font-semibold text-gray-900">{automation.avgExecutionTime}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Next Run</p>
                  <span className="text-xs font-semibold text-gray-900 truncate block">{automation.nextRun}</span>
                </div>
              </div>

              {/* Execution Timeline */}
              <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Last: {automation.lastRun}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{automation.createdBy}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAutomation(automation.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${automation.status === 'active'
                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                >
                  {automation.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRunNow(automation)}
                  className="flex items-center justify-center px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"

                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/workflow/automation/edit/${automation.id}`)}
                  className="flex items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"

                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/workflow/automation/view/${automation.id}`)}
                  className="flex items-center justify-center px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"

                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAutomation(automation.id)}
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
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAutomations.length)} of {filteredAutomations.length} automation rules
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
