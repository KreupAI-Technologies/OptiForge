'use client';

import { useState, useEffect, useCallback } from 'react';
import { crmService, asArray } from '@/services/crm.service';
import {
  Mail, Search, Plus, Eye, Edit, Copy, Trash2, Play, Pause,
  BarChart3, TrendingUp, Users, Target, Calendar, Clock,
  FileText, Send, CheckCircle, XCircle, AlertCircle, Zap,
  Filter, Download, Upload, Settings, Tag, MoreVertical,
  ArrowUpRight, Sparkles, Activity, MousePointer, Archive
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'welcome' | 'follow-up' | 'nurture' | 'promotional' | 'transactional';
  description: string;
  previewText: string;
  content: string;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  createdBy: string;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface AutomationSequence {
  id: string;
  name: string;
  trigger: 'new_lead' | 'status_change' | 'time_based' | 'form_submit' | 'purchase' | 'abandoned_cart';
  status: 'active' | 'paused' | 'draft';
  steps: number;
  enrolled: number;
  completed: number;
  avgCompletionTime: string;
}

function mapTemplate(t: any): EmailTemplate {
  return {
    id: String(t?.id ?? ''),
    name: t?.name ?? '',
    subject: t?.subject ?? '',
    category: (t?.category ?? 'follow-up') as EmailTemplate['category'],
    description: t?.description ?? '',
    previewText: t?.previewText ?? '',
    content: t?.content ?? '',
    status: (t?.status ?? 'draft') as EmailTemplate['status'],
    tags: Array.isArray(t?.tags) ? t.tags : [],
    usageCount: Number(t?.usageCount ?? 0),
    lastUsed: t?.lastUsed ?? '',
    createdAt: t?.createdAt ?? '',
    createdBy: t?.createdBy ?? '',
    openRate: Number(t?.openRate ?? 0),
    clickRate: Number(t?.clickRate ?? 0),
    conversionRate: Number(t?.conversionRate ?? 0),
  };
}

export default function EmailTemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sequences, setSequences] = useState<AutomationSequence[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.emailTemplates.getAll();
      setTemplates(asArray(data).map(mapTemplate));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load email templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await crmService.emailTemplates.getAll();
        if (!active) return;
        setTemplates(asArray(data).map(mapTemplate));
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? 'Failed to load email templates');
        setTemplates([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.campaignAutomations.getAll();
        if (!active) return;
        setSequences(
          asArray(data).map((s: any) => ({
            id: String(s?.id ?? ''),
            name: s?.name ?? '',
            trigger: (s?.trigger ?? s?.triggerType ?? 'new_lead') as AutomationSequence['trigger'],
            status: (s?.status ?? 'draft') as AutomationSequence['status'],
            steps: Array.isArray(s?.steps) ? s.steps.length : Number(s?.steps ?? 0),
            enrolled: Number(s?.enrolled ?? 0),
            completed: Number(s?.completed ?? 0),
            avgCompletionTime: s?.avgCompletionTime ?? '',
          })),
        );
      } catch {
        if (active) setSequences([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | EmailTemplate['category']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.status === 'active').length,
    totalSent: templates.reduce((sum, t) => sum + t.usageCount, 0),
    avgOpenRate: templates.length ? templates.reduce((sum, t) => sum + t.openRate, 0) / templates.length : 0,
    avgClickRate: templates.length ? templates.reduce((sum, t) => sum + t.clickRate, 0) / templates.length : 0,
    avgConversionRate: templates.length ? templates.reduce((sum, t) => sum + t.conversionRate, 0) / templates.length : 0
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-blue-100 text-blue-700';
      case 'follow-up': return 'bg-purple-100 text-purple-700';
      case 'nurture': return 'bg-green-100 text-green-700';
      case 'promotional': return 'bg-orange-100 text-orange-700';
      case 'transactional': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'new_lead': return <Users className="w-4 h-4" />;
      case 'status_change': return <Activity className="w-4 h-4" />;
      case 'time_based': return <Clock className="w-4 h-4" />;
      case 'form_submit': return <FileText className="w-4 h-4" />;
      case 'purchase': return <CheckCircle className="w-4 h-4" />;
      case 'abandoned_cart': return <AlertCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const handleCloneTemplate = async (template: EmailTemplate) => {
    try {
      await crmService.emailTemplates.create({
        name: `${template.name} (Copy)`,
        subject: template.subject,
        category: template.category,
        description: template.description,
        previewText: template.previewText,
        content: template.content,
        status: 'draft',
        tags: template.tags,
      } as any);
      await loadTemplates();
      addToast({
        title: 'Template Cloned',
        message: `"${template.name}" has been cloned successfully`,
        variant: 'success'
      });
    } catch {
      addToast({ title: 'Clone Failed', message: 'Could not clone template', variant: 'error' });
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    try {
      await crmService.emailTemplates.delete(template.id);
      await loadTemplates();
      addToast({
        title: 'Template Deleted',
        message: `"${template.name}" has been deleted`,
        variant: 'success'
      });
    } catch {
      addToast({ title: 'Delete Failed', message: `Could not delete "${template.name}"`, variant: 'error' });
    }
  };

  const handleToggleStatus = async (template: EmailTemplate) => {
    const newStatus = template.status === 'active' ? 'inactive' : 'active';
    try {
      await crmService.emailTemplates.update(template.id, { status: newStatus } as any);
      await loadTemplates();
      addToast({
        title: 'Status Updated',
        message: `Template is now ${newStatus}`,
        variant: 'success'
      });
    } catch {
      addToast({ title: 'Update Failed', message: 'Could not update template status', variant: 'error' });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await crmService.emailTemplates.create({
        name: 'New Template',
        subject: '',
        category: 'follow-up',
        status: 'draft',
      } as any);
      await loadTemplates();
      addToast({
        title: 'Template Created',
        message: 'New email template created successfully',
        variant: 'success'
      });
    } catch {
      addToast({ title: 'Create Failed', message: 'Could not create template', variant: 'error' });
    }
  };

  const handleRunABTest = (template: EmailTemplate) => {
    addToast({
      title: 'A/B Test Started',
      message: `A/B test initiated for "${template.name}"`,
      variant: 'info'
    });
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates & Automation</h1>
          <p className="text-sm text-gray-600 mt-1">Create, manage, and automate email campaigns</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalTemplates}</div>
          <div className="text-blue-100 text-sm">Total Templates</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeTemplates}</div>
          <div className="text-green-100 text-sm">Active</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalSent.toLocaleString()}</div>
          <div className="text-purple-100 text-sm">Emails Sent</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgOpenRate.toFixed(1)}%</div>
          <div className="text-orange-100 text-sm">Avg Open Rate</div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <MousePointer className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgClickRate.toFixed(1)}%</div>
          <div className="text-teal-100 text-sm">Avg Click Rate</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgConversionRate.toFixed(1)}%</div>
          <div className="text-pink-100 text-sm">Avg Conversion</div>
        </div>
      </div>

      {/* Automation Sequences Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Active Automation Sequences</h2>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {sequences.map(sequence => (
              <div key={sequence.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(sequence.trigger)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sequence.status)}`}>
                      {sequence.status}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{sequence.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Steps:</span>
                    <span className="font-medium text-gray-900">{sequence.steps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enrolled:</span>
                    <span className="font-medium text-gray-900">{sequence.enrolled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-gray-900">{sequence.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Time:</span>
                    <span className="font-medium text-gray-900">{sequence.avgCompletionTime}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${sequence.enrolled > 0 ? (sequence.completed / sequence.enrolled) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {(sequence.enrolled > 0 ? (sequence.completed / sequence.enrolled) * 100 : 0).toFixed(1)}% completion rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="welcome">Welcome</option>
              <option value="follow-up">Follow-up</option>
              <option value="nurture">Nurture</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    {template.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{template.description}</p>
                  <p className="text-sm text-gray-900 font-medium">Subject: {template.subject}</p>
                </div>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-4 gap-3 mb-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-blue-600 mb-1">
                    <Send className="w-3 h-3" />
                    <span className="text-xs">Sent</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">{template.usageCount}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-green-600 mb-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">Open</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">{template.openRate.toFixed(1)}%</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-purple-600 mb-1">
                    <MousePointer className="w-3 h-3" />
                    <span className="text-xs">Click</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900">{template.clickRate.toFixed(1)}%</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-orange-600 mb-1">
                    <Target className="w-3 h-3" />
                    <span className="text-xs">Conv</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900">{template.conversionRate.toFixed(1)}%</div>
                </div>
              </div>

              {/* Template Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span>Created by {template.createdBy}</span>
                  <span>Last used: {template.lastUsed}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Preview</span>
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Edit className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </button>
                <button
                  onClick={() => handleCloneTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Clone</span>
                </button>
                <button
                  onClick={() => handleRunABTest(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">A/B Test</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal Placeholder */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Template Name</label>
                  <p className="text-gray-900 mt-1">{selectedTemplate.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject Line</label>
                  <p className="text-gray-900 mt-1">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Preview Text</label>
                  <p className="text-gray-600 mt-1">{selectedTemplate.previewText}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Body</label>
                  <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-gray-600 italic">WYSIWYG Editor Placeholder</p>
                    <p className="text-sm text-gray-500 mt-2">Rich text editor would be implemented here with merge fields support: {'{'}{'{'} customer_name {'}'}{'}'}, {'{'}{'{'} company {'}'}{'}'}, etc.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
