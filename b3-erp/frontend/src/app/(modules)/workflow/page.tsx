'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Workflow, GitBranch, CheckCircle, Clock, Users, Settings, Plus, Play, Pause, Search, Filter } from 'lucide-react';
import { workflowConfigTemplateService } from '@/services/workflow-config-template.service';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  steps: number;
  activeInstances: number;
  status: 'active' | 'draft' | 'archived';
}

const COMPANY_ID = 'company-001';

export default function WorkflowPage() {
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const rows = await workflowConfigTemplateService.findAll(COMPANY_ID);
        if (!active) return;
        const mapped: WorkflowTemplate[] = rows.map((r) => ({
          id: r.id,
          name: r.name ?? '',
          description: r.description ?? '',
          category: r.category ?? '',
          triggerType: r.triggerType ?? '',
          steps: Number(r.steps ?? 0),
          activeInstances: Number(r.activeInstances ?? 0),
          status: (r.status ?? 'draft') as WorkflowTemplate['status'],
        }));
        setWorkflowTemplates(mapped);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load workflow templates',
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(workflowTemplates.map(w => w.category)))];

  const filteredWorkflows = workflowTemplates.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Workflow className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workflow Automation</h1>
                <p className="text-gray-600">Design and manage automated business workflows</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/workflow/approvals"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4" />
                My Approvals
              </Link>
              <Link
                href="/workflow/designer"
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 bg-white rounded-lg shadow border border-gray-200 p-3 text-sm text-gray-500">
            Loading workflow templates...
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 bg-red-50 rounded-lg border border-red-200 p-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <Workflow className="w-8 h-8 text-cyan-600" />
              <span className="text-2xl font-bold text-gray-900">{workflowTemplates.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Workflows</p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {workflowTemplates.filter(w => w.status === 'active').length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Active Workflows</p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {workflowTemplates.reduce((sum, w) => sum + w.activeInstances, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Running Instances</p>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">847</span>
            </div>
            <p className="text-sm text-gray-600">Completed This Month</p>
          </div>
        </div>

        {/* Workflows Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Workflow Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-cyan-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>

                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium text-gray-900">{workflow.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Trigger</span>
                      <span className="font-medium text-gray-900">{workflow.triggerType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps</span>
                      <span className="font-medium text-gray-900">{workflow.steps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Instances</span>
                      <span className="font-medium text-cyan-600">{workflow.activeInstances}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Workflow className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No workflows found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/workflow/designer"
            className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg p-3 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Workflow Designer</h3>
                <p className="text-cyan-100">Create custom workflows with drag-and-drop interface</p>
              </div>
              <Settings className="w-12 h-12 opacity-50" />
            </div>
          </Link>

          <Link
            href="/workflow/approvals"
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg p-3 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Pending Approvals</h3>
                <p className="text-purple-100">Review and approve workflow tasks assigned to you</p>
              </div>
              <Users className="w-12 h-12 opacity-50" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
