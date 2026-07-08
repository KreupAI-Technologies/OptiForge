'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import { projectManagementService, PmTemplate } from '@/services/ProjectManagementService';
import {
 Layers,
 Plus,
 Edit,
 Copy,
 Trash2,
 Eye,
 CheckCircle,
 Clock,
 Users,
 Calendar,
 DollarSign,
 FileText,
 Settings,
 Star,
 TrendingUp,
 Share2,
 Download,
 Upload,
 Archive,
} from 'lucide-react';
import {
 CreateTemplateModal,
 EditTemplateModal,
 DuplicateTemplateModal,
 DeleteTemplateModal,
 TemplateSettingsModal,
 ShareTemplateModal,
 ExportTemplateModal,
 ImportTemplateModal,
 ArchiveTemplateModal,
 FavoriteTemplateModal,
} from '@/components/project-management/TemplatesModals';

interface ProjectTemplate {
 id: string;
 templateName: string;
 projectType: string;
 description: string;
 category: 'Standard' | 'Custom' | 'Industry';
 complexity: 'Simple' | 'Medium' | 'Complex';
 estimatedDuration: string;
 estimatedBudget: string;
 phases: TemplatePhase[];
 milestones: number;
 tasks: number;
 resources: string[];
 deliverables: string[];
 defaultSettings: TemplateSettings;
 usageCount: number;
 lastUsed: string;
 createdBy: string;
 createdDate: string;
 isActive: boolean;
 isFavorite: boolean;
 tags: string[];
}

interface TemplatePhase {
 phaseName: string;
 duration: string;
 milestones: number;
 tasks: number;
 description: string;
}

interface TemplateSettings {
 defaultCurrency: string;
 budgetApprovalRequired: boolean;
 qualityChecksRequired: boolean;
 riskAssessmentRequired: boolean;
 changeOrderApprovalLevels: number;
 documentationMandatory: boolean;
}

export default function ProjectTemplatesPage() {
 const router = useRouter();
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [complexityFilter, setComplexityFilter] = useState('all');
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
 const [showDetailModal, setShowDetailModal] = useState(false);
 const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [submitting, setSubmitting] = useState(false);
 const [actionError, setActionError] = useState<string | null>(null);
 const [actionSuccess, setActionSuccess] = useState<string | null>(null);

 // Defensive transform: coerce backend rows into the ProjectTemplate shape.
 const normalizeTemplate = (t: PmTemplate): ProjectTemplate => ({
  id: String(t.id),
  templateName: t.templateName ?? '',
  projectType: t.projectType ?? '',
  description: t.description ?? '',
  category: (t.category as ProjectTemplate['category']) ?? 'Standard',
  complexity: (t.complexity as ProjectTemplate['complexity']) ?? 'Medium',
  estimatedDuration: t.estimatedDuration ?? '',
  estimatedBudget: t.estimatedBudget ?? '',
  phases: Array.isArray(t.phases) ? t.phases : [],
  milestones: Number(t.milestones ?? 0),
  tasks: Number(t.tasks ?? 0),
  resources: Array.isArray(t.resources) ? t.resources : [],
  deliverables: Array.isArray(t.deliverables) ? t.deliverables : [],
  defaultSettings: t.defaultSettings ?? {
   defaultCurrency: 'INR',
   budgetApprovalRequired: false,
   qualityChecksRequired: false,
   riskAssessmentRequired: false,
   changeOrderApprovalLevels: 1,
   documentationMandatory: false,
  },
  usageCount: Number(t.usageCount ?? 0),
  lastUsed: t.lastUsed ?? '',
  createdBy: t.createdBy ?? '',
  createdDate: t.createdDate ?? '',
  isActive: t.isActive ?? true,
  isFavorite: t.isFavorite ?? false,
  tags: Array.isArray(t.tags) ? t.tags : [],
 });

 const refreshTemplates = async () => {
  const rows = await projectManagementService.listPmTemplates();
  setTemplates(rows.map(normalizeTemplate));
 };

 useEffect(() => {
  let mounted = true;
  const load = async () => {
   setIsLoading(true);
   setLoadError(null);
   try {
    await refreshTemplates();
   } catch (err) {
    console.error('Error loading templates:', err);
    if (mounted) setLoadError('Failed to load templates');
   } finally {
    if (mounted) setIsLoading(false);
   }
  };
  load();
  return () => {
   mounted = false;
  };
 }, []);

 const runAction = async (fn: () => Promise<void>, success: string, close: () => void) => {
  setSubmitting(true);
  setActionError(null);
  setActionSuccess(null);
  try {
   await fn();
   await refreshTemplates();
   setActionSuccess(success);
   close();
  } catch (err) {
   setActionError(err instanceof Error ? err.message : 'Action failed');
  } finally {
   setSubmitting(false);
  }
 };

 // Modal states for new modals
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDuplicateModal, setShowDuplicateModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showSettingsModal, setShowSettingsModal] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showImportModal, setShowImportModal] = useState(false);
 const [showArchiveModal, setShowArchiveModal] = useState(false);
 const [showFavoriteModal, setShowFavoriteModal] = useState(false);

 // Handlers
 const handleEdit = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowEditModal(true);
 };

 const handleDuplicate = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowDuplicateModal(true);
 };

 const handleDelete = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowDeleteModal(true);
 };

 const handleSettings = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowSettingsModal(true);
 };

 const handleShare = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowShareModal(true);
 };

 const handleExport = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowExportModal(true);
 };

 const handleArchive = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowArchiveModal(true);
 };

 const handleFavorite = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowFavoriteModal(true);
 };

 const handleCreate = (data: any) => {
  runAction(
   () => projectManagementService.createPmTemplate({ ...(data ?? {}) }).then(() => undefined),
   'Template created',
   () => setShowCreateModal(false)
  );
 };

 const handleEditSave = (data: any) => {
  if (!selectedTemplate) { setShowEditModal(false); return; }
  runAction(
   () => projectManagementService.updatePmTemplate(selectedTemplate.id, { ...(data ?? {}) }).then(() => undefined),
   'Template updated',
   () => { setShowEditModal(false); setSelectedTemplate(null); }
  );
 };

 const handleDuplicateSave = (data: any) => {
  if (!selectedTemplate) { setShowDuplicateModal(false); return; }
  const src = selectedTemplate;
  runAction(
   () => projectManagementService.createPmTemplate({
    templateName: String(data?.newName ?? `${src.templateName} (Copy)`),
    projectType: src.projectType,
    category: src.category,
    complexity: src.complexity,
    description: src.description,
    estimatedDuration: src.estimatedDuration,
    estimatedBudget: src.estimatedBudget,
    phases: src.phases,
    milestones: src.milestones,
    tasks: src.tasks,
    resources: src.resources,
    deliverables: src.deliverables,
    defaultSettings: src.defaultSettings,
    tags: src.tags,
   }).then(() => undefined),
   'Template duplicated',
   () => { setShowDuplicateModal(false); setSelectedTemplate(null); }
  );
 };

 const handleDeleteConfirm = async () => {
  if (!selectedTemplate) { setShowDeleteModal(false); return; }
  await runAction(
   () => projectManagementService.deletePmTemplate(selectedTemplate.id),
   'Template deleted',
   () => { setShowDeleteModal(false); setSelectedTemplate(null); }
  );
 };

 const handleSettingsSave = (data: any) => {
  if (!selectedTemplate) { setShowSettingsModal(false); return; }
  runAction(
   () => projectManagementService.updatePmTemplate(selectedTemplate.id, {
    defaultSettings: { ...selectedTemplate.defaultSettings, ...(data ?? {}) },
   }).then(() => undefined),
   'Settings saved',
   () => { setShowSettingsModal(false); setSelectedTemplate(null); }
  );
 };

 const handleShareSave = (data: any) => {
  // Sharing has no dedicated backend endpoint; persist the share scope as a tag.
  if (!selectedTemplate) { setShowShareModal(false); return; }
  const scope = String(data?.shareWith ?? data ?? 'team');
  runAction(
   () => projectManagementService.updatePmTemplate(selectedTemplate.id, {
    tags: Array.from(new Set([...(selectedTemplate.tags ?? []), `shared:${scope}`])),
   }).then(() => undefined),
   'Template shared',
   () => { setShowShareModal(false); setSelectedTemplate(null); }
  );
 };

 const handleExportSave = (data: any) => {
  exportToCsv('project-templates', filteredTemplates as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
  setSelectedTemplate(null);
 };

 const handleImportSave = (data: any) => {
  // Client-side import: no bulk-import endpoint; leave file handling to future backend.
  setShowImportModal(false);
 };

 const handleArchiveSave = () => {
  if (!selectedTemplate) { setShowArchiveModal(false); return; }
  runAction(
   () => projectManagementService.updatePmTemplate(selectedTemplate.id, { isActive: false }).then(() => undefined),
   'Template archived',
   () => { setShowArchiveModal(false); setSelectedTemplate(null); }
  );
 };

 const handleFavoriteSave = () => {
  if (!selectedTemplate) { setShowFavoriteModal(false); return; }
  runAction(
   () => projectManagementService.updatePmTemplate(selectedTemplate.id, {
    isFavorite: !selectedTemplate.isFavorite,
   }).then(() => undefined),
   selectedTemplate.isFavorite ? 'Removed from favorites' : 'Added to favorites',
   () => { setShowFavoriteModal(false); setSelectedTemplate(null); }
  );
 };


 const filteredTemplates = templates.filter((template) => {
  const matchesSearch =
   template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
   template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
  const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
  return matchesSearch && matchesCategory && matchesComplexity;
 });

 const getCategoryColor = (category: string) => {
  switch (category) {
   case 'Standard':
    return 'text-blue-600 bg-blue-50';
   case 'Custom':
    return 'text-purple-600 bg-purple-50';
   case 'Industry':
    return 'text-green-600 bg-green-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 const getComplexityColor = (complexity: string) => {
  switch (complexity) {
   case 'Simple':
    return 'text-green-600 bg-green-50';
   case 'Medium':
    return 'text-yellow-600 bg-yellow-50';
   case 'Complex':
    return 'text-red-600 bg-red-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 return (
  <div className="h-screen flex flex-col overflow-hidden">
   <div className="flex-1 overflow-y-auto overflow-x-hidden">
    <div className="px-3 py-2">
     {isLoading && (
      <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading templates…</div>
     )}
     {loadError && !isLoading && (
      <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
     )}
     {actionError && (
      <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
     )}
     {actionSuccess && (
      <div className="mb-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{actionSuccess}</div>
     )}
     {/* Action Bar */}
     <div className="mb-3">
      <div className="flex items-center justify-end gap-3 mb-2">
       <button
        onClick={() => setShowImportModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
       >
        <Upload className="w-4 h-4" />
        Import Template
       </button>
       <button
        onClick={() => setShowCreateModal(true)}
        disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-60"
       >
        <Plus className="w-4 h-4" />
        {submitting ? 'Saving…' : 'Create Template'}
       </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Templates</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{templates.length}</p>
        <p className="text-xs text-green-600 mt-1">{templates.filter(t => t.isActive).length} active</p>
       </div>
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Layers className="w-6 h-6 text-blue-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Most Used</p>
        <p className="text-lg font-bold text-gray-900 mt-1 truncate">
         {[...templates].sort((a, b) => b.usageCount - a.usageCount)[0]?.templateName.split('-')[0]}
        </p>
        <p className="text-xs text-gray-500 mt-1">
         {[...templates].sort((a, b) => b.usageCount - a.usageCount)[0]?.usageCount} times
        </p>
       </div>
       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-green-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Favorites</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {templates.filter(t => t.isFavorite).length}
        </p>
        <p className="text-xs text-yellow-600 mt-1">Marked as favorite</p>
       </div>
       <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
        <Star className="w-6 h-6 text-yellow-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Usage</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {templates.reduce((sum, t) => sum + t.usageCount, 0)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Projects created</p>
       </div>
       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-purple-600" />
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
    <div className="flex flex-col md:flex-row gap-2">
     <div className="flex-1">
      <input
       type="text"
       placeholder="Search templates by name, description, or tags..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
     </div>
     <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Categories</option>
      <option value="Standard">Standard</option>
      <option value="Custom">Custom</option>
      <option value="Industry">Industry</option>
     </select>
     <select
      value={complexityFilter}
      onChange={(e) => setComplexityFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Complexity</option>
      <option value="Simple">Simple</option>
      <option value="Medium">Medium</option>
      <option value="Complex">Complex</option>
     </select>
    </div>
   </div>

   {/* Templates Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {filteredTemplates.map((template) => (
     <div
      key={template.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
     >
      <div className="flex items-start justify-between mb-2">
       <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
         <h3 className="text-lg font-semibold text-gray-900">{template.templateName}</h3>
         {template.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
        </div>
        <p className="text-sm text-gray-600">{template.projectType}</p>
       </div>
      </div>

      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>

      <div className="space-y-2 mb-2">
       <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Category:</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
         {template.category}
        </span>
       </div>
       <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Complexity:</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(template.complexity)}`}>
         {template.complexity}
        </span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 flex items-center gap-1">
         <Clock className="w-3 h-3" /> Duration:
        </span>
        <span className="text-gray-900">{template.estimatedDuration}</span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 flex items-center gap-1">
         <DollarSign className="w-3 h-3" /> Budget:
        </span>
        <span className="text-gray-900">{template.estimatedBudget}</span>
       </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
       <div className="bg-blue-50 rounded-lg p-2">
        <p className="text-lg font-bold text-blue-600">{template.phases.length}</p>
        <p className="text-xs text-gray-600">Phases</p>
       </div>
       <div className="bg-green-50 rounded-lg p-2">
        <p className="text-lg font-bold text-green-600">{template.milestones}</p>
        <p className="text-xs text-gray-600">Milestones</p>
       </div>
       <div className="bg-purple-50 rounded-lg p-2">
        <p className="text-lg font-bold text-purple-600">{template.tasks}</p>
        <p className="text-xs text-gray-600">Tasks</p>
       </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-2">
       <p className="text-xs text-gray-500 mb-2">
        Used {template.usageCount} times • Last used {new Date(template.lastUsed).toLocaleDateString('en-IN')}
       </p>
       <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag, idx) => (
         <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
          {tag}
         </span>
        ))}
        {template.tags.length > 3 && (
         <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
        )}
       </div>
      </div>

      <div className="space-y-2">
       <div className="flex gap-2">
        <button
         onClick={() => {
          setSelectedTemplate(template);
          setShowDetailModal(true);
         }}
         className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 text-sm"
        >
         <Eye className="w-4 h-4" />
         View Details
        </button>
        <button
         onClick={() => handleDuplicate(template)}
         className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
        >
         <Copy className="w-4 h-4" />
        </button>
        <button
         onClick={() => handleEdit(template)}
         className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
         <Edit className="w-4 h-4 text-gray-600" />
        </button>
       </div>

       <div className="flex gap-2">
        <button
         onClick={() => handleShare(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Share"
        >
         <Share2 className="w-3.5 h-3.5 text-gray-600" />
         <span className="text-gray-700">Share</span>
        </button>
        <button
         onClick={() => handleExport(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Export"
        >
         <Download className="w-3.5 h-3.5 text-gray-600" />
         <span className="text-gray-700">Export</span>
        </button>
        <button
         onClick={() => handleSettings(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Settings"
        >
         <Settings className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button
         onClick={() => handleFavorite(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Favorite"
        >
         <Star className={`w-3.5 h-3.5 ${template.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
        </button>
        <button
         onClick={() => handleArchive(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Archive"
        >
         <Archive className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button
         onClick={() => handleDelete(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-300 rounded-lg hover:bg-red-50 text-xs"
         title="Delete"
        >
         <Trash2 className="w-3.5 h-3.5 text-red-600" />
        </button>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Template Detail Modal */}
   {showDetailModal && selectedTemplate && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
       <div className="flex items-start justify-between">
        <div>
         <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.templateName}</h2>
         <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
        </div>
        <button
         onClick={() => {
          setShowDetailModal(false);
          setSelectedTemplate(null);
         }}
         className="text-gray-400 hover:text-gray-600"
        >
         ✕
        </button>
       </div>
      </div>

      <div className="p-6 space-y-3">
       {/* Overview */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
         <div>
          <p className="text-sm text-gray-600">Project Type</p>
          <p className="font-medium text-gray-900">{selectedTemplate.projectType}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Duration</p>
          <p className="font-medium text-gray-900">{selectedTemplate.estimatedDuration}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Budget Range</p>
          <p className="font-medium text-gray-900">{selectedTemplate.estimatedBudget}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Complexity</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(selectedTemplate.complexity)}`}>
           {selectedTemplate.complexity}
          </span>
         </div>
        </div>
       </div>

       {/* Phases */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Phases</h3>
        <div className="space-y-3">
         {selectedTemplate.phases.map((phase, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-3">
           <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{phase.phaseName}</h4>
            <span className="text-sm text-gray-600">{phase.duration}</span>
           </div>
           <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
           <div className="flex gap-2 text-xs text-gray-500">
            <span>{phase.milestones} milestones</span>
            <span>{phase.tasks} tasks</span>
           </div>
          </div>
         ))}
        </div>
       </div>

       {/* Resources */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Resources</h3>
        <div className="flex flex-wrap gap-2">
         {selectedTemplate.resources.map((resource, idx) => (
          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
           <Users className="w-3 h-3 mr-1" />
           {resource}
          </span>
         ))}
        </div>
       </div>

       {/* Deliverables */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Deliverables</h3>
        <div className="grid grid-cols-2 gap-2">
         {selectedTemplate.deliverables.map((deliverable, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
           <CheckCircle className="w-4 h-4 text-green-600" />
           {deliverable}
          </div>
         ))}
        </div>
       </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
       <button
        onClick={() => {
         setShowDetailModal(false);
         setSelectedTemplate(null);
        }}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
       >
        Close
       </button>
       <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
        Use This Template
       </button>
      </div>
     </div>
    </div>
   )}

   {/* All Modals */}
   <CreateTemplateModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreate}
   />

   <EditTemplateModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedTemplate(null);
    }}
    onUpdate={handleEditSave}
    template={selectedTemplate}
   />

   <DuplicateTemplateModal
    isOpen={showDuplicateModal}
    onClose={() => {
     setShowDuplicateModal(false);
     setSelectedTemplate(null);
    }}
    onDuplicate={handleDuplicateSave}
    template={selectedTemplate}
   />

   <DeleteTemplateModal
    isOpen={showDeleteModal}
    onClose={() => {
     setShowDeleteModal(false);
     setSelectedTemplate(null);
    }}
    onDelete={handleDeleteConfirm}
    template={selectedTemplate}
   />

   <TemplateSettingsModal
    isOpen={showSettingsModal}
    onClose={() => {
     setShowSettingsModal(false);
     setSelectedTemplate(null);
    }}
    onSave={handleSettingsSave}
    template={selectedTemplate}
   />

   <ShareTemplateModal
    isOpen={showShareModal}
    onClose={() => {
     setShowShareModal(false);
     setSelectedTemplate(null);
    }}
    onShare={handleShareSave}
    template={selectedTemplate}
   />

   <ExportTemplateModal
    isOpen={showExportModal}
    onClose={() => {
     setShowExportModal(false);
     setSelectedTemplate(null);
    }}
    onExport={handleExportSave}
    template={selectedTemplate}
   />

   <ImportTemplateModal
    isOpen={showImportModal}
    onClose={() => setShowImportModal(false)}
    onImport={handleImportSave}
   />

   <ArchiveTemplateModal
    isOpen={showArchiveModal}
    onClose={() => {
     setShowArchiveModal(false);
     setSelectedTemplate(null);
    }}
    onArchive={handleArchiveSave}
    template={selectedTemplate}
   />

   <FavoriteTemplateModal
    isOpen={showFavoriteModal}
    onClose={() => {
     setShowFavoriteModal(false);
     setSelectedTemplate(null);
    }}
    onToggleFavorite={handleFavoriteSave}
    template={selectedTemplate}
   />
    </div>
   </div>
  </div>
 );
}
