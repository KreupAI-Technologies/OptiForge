'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
  Building2,
  User,
  Calendar,
  Users,
  Package,
  FileText,
  Save,
  X,
  Plus,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Layers,
  FileUp,
  Settings,
  FileDown,
  Copy,
  Trash2 as Trash,
  Star,
  Archive,
  Share2,
} from 'lucide-react';
import { StepIndicator } from '@/components/ui/StepIndicator';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  FormProgressIndicator,
} from '@/components/ui/FormUX';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { DragDropUpload, type FileItem } from '@/components/procurement/DragDropUpload';
import { Paperclip } from 'lucide-react';
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
import { useProjectContext } from '@/context/ProjectContext';
import { projectManagementService } from '@/services/ProjectManagementService';

// Field help content
const FIELD_HELP = {
  projectName: {
    title: 'Project Name',
    content: 'Enter a unique, descriptive name that identifies this project. Include client name and project type for easy recognition.',
  },
  projectType: {
    title: 'Project Type',
    content: 'Select the primary category of this project. This determines the default workflow phases and resource requirements.',
  },
  salesOrderNumber: {
    title: 'Sales Order Number',
    content: 'Reference to the approved sales order. This links the project to financial and customer information.',
  },
  priority: {
    title: 'Priority Level',
    content: 'P1-Critical: Immediate attention required. P2-High: Important timeline. P3-Medium: Standard delivery. P4-Low: Flexible timeline.',
  },
  estimatedBudget: {
    title: 'Estimated Budget',
    content: 'Internal cost estimate including materials, labor, and overhead. Used for profit margin calculations.',
  },
  contractValue: {
    title: 'Contract Value',
    content: 'Agreed value with the customer. The difference between contract value and budget represents projected profit.',
  },
  teamAllocation: {
    title: 'Team Allocation %',
    content: 'Percentage of working hours this team member will dedicate to the project. 100% = Full-time.',
  },
};

// Mock Options
const PROJECT_TYPES = [
  { label: 'Commercial Kitchen', value: 'Commercial Kitchen' },
  { label: 'Cold Room', value: 'Cold Room' },
  { label: 'Switchgear', value: 'Switchgear' },
  { label: 'HVAC System', value: 'HVAC System' },
  { label: 'Modular Kitchen', value: 'Modular Kitchen' },
  { label: 'Food Processing', value: 'Food Processing' },
];

const CUSTOMERS = [
  { label: 'Taj Hotels Limited', value: 'Taj Hotels Limited' },
  { label: 'Oberoi Group', value: 'Oberoi Group' },
  { label: 'ITC Hotels', value: 'ITC Hotels' },
  { label: 'Marriott International', value: 'Marriott International' },
  { label: 'Hyatt Regency', value: 'Hyatt Regency' },
];

const EMPLOYEES = [
  { label: 'Rajesh Kumar', value: 'Rajesh Kumar' },
  { label: 'Priya Sharma', value: 'Priya Sharma' },
  { label: 'Amit Patel', value: 'Amit Patel' },
  { label: 'Sunita Reddy', value: 'Sunita Reddy' },
  { label: 'Vikram Singh', value: 'Vikram Singh' },
  { label: 'Anjali Gupta', value: 'Anjali Gupta' },
];

const DEPARTMENTS = [
  { label: 'Project Management', value: 'Project Management' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Sales & Marketing', value: 'Sales & Marketing' },
];

const SALES_ORDERS = [
  { label: 'SO-2024-001', value: 'SO-2024-001', customerName: 'Taj Hotels Limited', customerId: 'CUST-001' },
  { label: 'SO-2024-002', value: 'SO-2024-002', customerName: 'Oberoi Group', customerId: 'CUST-002' },
  { label: 'SO-2024-003', value: 'SO-2024-003', customerName: 'ITC Hotels', customerId: 'CUST-003' },
  { label: 'SO-2024-004', value: 'SO-2024-004', customerName: 'Marriott International', customerId: 'CUST-004' },
  { label: 'SO-2024-005', value: 'SO-2024-005', customerName: 'Hyatt Regency', customerId: 'CUST-005' },
];

// Types
interface TeamMember {
  id: string;
  role: string;
  name: string;
  allocation: number;
}

interface Deliverable {
  id: string;
  name: string;
  type: string;
  plannedDate: string;
  details: string;
}

interface FormData {
  // Basic Information
  projectName: string;
  projectType: string;
  salesOrderNumber: string;
  customerId: string;
  customerName: string;
  location: string;
  description: string;
  // Timeline & Budget
  startDate: string;
  endDate: string;
  estimatedBudget: string;
  contractValue: string;
  currency: string;
  // Project Management
  projectManager: string;
  priority: string;
  department: string;
  // Team & Deliverables
  teamMembers: TeamMember[];
  deliverables: Deliverable[];
  // Scope
  scope: string;
  specialRequirements: string;
  safetyRequirements: string;
  // Documents
  attachments: FileItem[];
  [key: string]: any;
}

const STEPS = [
  { id: 'basic', label: 'Basic Info', description: 'Project details', icon: Building2 },
  { id: 'timeline', label: 'Timeline & Budget', description: 'Schedule and costs', icon: Calendar },
  { id: 'team', label: 'Team', description: 'Assign team members', icon: Users },
  { id: 'deliverables', label: 'Deliverables', description: 'Key milestones', icon: Package },
  { id: 'scope', label: 'Scope', description: 'Requirements', icon: FileText },
  { id: 'attachments', label: 'Attachments', description: 'Project documents', icon: Paperclip },
  { id: 'review', label: 'Review', description: 'Confirm and update', icon: CheckCircle },
];

const initialFormData: FormData = {
  projectName: '',
  projectType: 'Commercial Kitchen',
  salesOrderNumber: '',
  customerId: '',
  customerName: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
  estimatedBudget: '',
  contractValue: '',
  currency: 'INR',
  projectManager: '',
  priority: 'P2',
  department: 'Project Management',
  teamMembers: [{ id: '1', role: 'Project Manager', name: '', allocation: 100 }],
  deliverables: [{ id: '1', name: '', type: 'Equipment', plannedDate: '', details: '' }],
  scope: '',
  specialRequirements: '',
  safetyRequirements: '',
  attachments: [],
};

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { loadProject } = useProjectContext();
  const router = useRouter();
  const { id } = params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'wizard' | 'preview'>('wizard');

  // Template Modal States
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showDuplicateTemplateModal, setShowDuplicateTemplateModal] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [showTemplateSettingsModal, setShowTemplateSettingsModal] = useState(false);
  const [showShareTemplateModal, setShowShareTemplateModal] = useState(false);
  const [showExportTemplateModal, setShowExportTemplateModal] = useState(false);
  const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
  const [showArchiveTemplateModal, setShowArchiveTemplateModal] = useState(false);
  const [showFavoriteTemplateModal, setShowFavoriteTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // Fetch Project Data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const project = await projectManagementService.getProject(id);
        if (!mounted || !project) return;
        setFormData({
          ...initialFormData,
          projectName: project.name ?? '',
          projectType: project.projectType ?? initialFormData.projectType,
          salesOrderNumber: project.projectCode ?? '',
          customerName: project.clientName ?? '',
          location: project.location ?? '',
          description: project.description ?? '',
          startDate: project.startDate ?? '',
          endDate: project.endDate ?? '',
          estimatedBudget: project.budgetAllocated != null ? String(project.budgetAllocated) : '',
          contractValue: '',
          priority: project.priority ?? initialFormData.priority,
          projectManager: project.projectManagerId ?? '',
        });

        // Initialize global ProjectContext
        loadProject({
          id: id,
          name: project.name,
          projectType: project.projectType as any,
          customerName: project.clientName,
          status: project.status as any
        });
      } catch (error) {
        console.error('Error loading project:', error);
      }
    })();
    return () => { mounted = false; };
  }, [id, loadProject]);

  // Form field definitions for progress indicator
  const formFields = useMemo(() => [
    { name: 'projectName', required: true },
    { name: 'projectType', required: true },
    { name: 'salesOrderNumber', required: true },
    { name: 'customerName', required: true },
    { name: 'location', required: true },
    { name: 'startDate', required: true },
    { name: 'endDate', required: true },
    { name: 'estimatedBudget', required: true },
    { name: 'contractValue', required: true },
    { name: 'projectManager', required: true },
  ], []);

  // Calculate project duration
  const duration = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} days` : 'Invalid';
    }
    return '';
  }, [formData.startDate, formData.endDate]);

  // Calculate profit margin
  const profitMargin = useMemo(() => {
    const budget = parseFloat(formData.estimatedBudget) || 0;
    const contract = parseFloat(formData.contractValue) || 0;
    if (contract > 0 && budget > 0) {
      const profit = contract - budget;
      const percentage = ((profit / contract) * 100).toFixed(2);
      return { profit, percentage };
    }
    return null;
  }, [formData.estimatedBudget, formData.contractValue]);

  // Currency formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Team member functions
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { id: Date.now().toString(), role: '', name: '', allocation: 100 },
      ],
    }));
  };

  const removeTeamMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id),
    }));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  // Deliverable functions
  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        { id: Math.random().toString(36).substr(2, 9), name: '', type: 'Equipment', plannedDate: '', details: '' },
      ],
    }));
  };

  const removeDeliverable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d.id !== id),
    }));
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
        if (!formData.salesOrderNumber.trim()) newErrors.salesOrderNumber = 'Sales order number is required';
        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 1: // Timeline & Budget
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.estimatedBudget) newErrors.estimatedBudget = 'Budget is required';
        if (!formData.contractValue) newErrors.contractValue = 'Contract value is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 2: // Team
        if (!formData.projectManager) newErrors.projectManager = 'Project manager is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await projectManagementService.updateProject(id, {
        projectName: formData.projectName,
        projectType: formData.projectType,
        customer: formData.customerName,
        location: formData.location,
        salesOrderNumber: formData.salesOrderNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.estimatedBudget) || 0,
        contractValue: parseFloat(formData.contractValue) || 0,
      });

      // Initialize global ProjectContext
      loadProject({
        id: id,
        name: formData.projectName,
        projectType: formData.projectType as any,
        customerName: formData.customerName,
        status: 'Planning' // Or fetch the actual status
      });

      router.push('/project-management');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/project-management');
  };

  // Template Modal Handlers
  const [templateSaving, setTemplateSaving] = useState(false);
  const runTemplateSave = async (fn: () => Promise<unknown>, onDone: () => void) => {
    setTemplateSaving(true);
    try {
      const result = await fn();
      if (result === null) throw new Error('Request failed');
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save template. Please try again.');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleCreateTemplate = (data: any) => runTemplateSave(
    () => projectManagementService.createPmTemplate(data),
    () => setShowCreateTemplateModal(false),
  );

  const handleEditTemplate = (data: any) => runTemplateSave(
    () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
    () => { setShowEditTemplateModal(false); setSelectedTemplate(null); },
  );

  const handleDuplicateTemplate = (data: any) => runTemplateSave(
    () => projectManagementService.createPmTemplate({ ...selectedTemplate, ...data, id: undefined }),
    () => { setShowDuplicateTemplateModal(false); setSelectedTemplate(null); },
  );

  const handleDeleteTemplate = async () => {
    const templateId = selectedTemplate?.id;
    try {
      if (templateId) {
        await projectManagementService.deletePmTemplate(String(templateId));
      }
    } catch (err) {
      alert('Failed to delete template. Please try again.');
    } finally {
      setShowDeleteTemplateModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSettings = (data: any) => runTemplateSave(
    () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
    () => { setShowTemplateSettingsModal(false); setSelectedTemplate(null); },
  );

  const handleShareTemplate = (data: any) => runTemplateSave(
    () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
    () => { setShowShareTemplateModal(false); setSelectedTemplate(null); },
  );

  const handleExportTemplate = (_data: any) => {
    exportToCsv('project-template', selectedTemplate ? [selectedTemplate] : []);
    setShowExportTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleImportTemplate = (_file: File | null) => {
    // NEEDS BACKEND: no template import endpoint; file parsing must be server-side.
    alert('Template import is not available yet.');
    setShowImportTemplateModal(false);
  };

  const handleArchiveTemplate = () => runTemplateSave(
    () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), { status: 'archived' } as any),
    () => { setShowArchiveTemplateModal(false); setSelectedTemplate(null); },
  );

  const handleToggleFavorite = () => runTemplateSave(
    () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), { isFavorite: !selectedTemplate?.isFavorite } as any),
    () => { setShowFavoriteTemplateModal(false); setSelectedTemplate(null); },
  );

  // Render all steps for preview mode
  const renderAllSteps = () => {
    return (
      <div className="space-y-12">
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            {renderStepContent(step)}
          </div>
        ))}
      </div>
    );
  };

  // Render step content
  const renderStepContent = (stepOverride?: number) => {
    const activeStep = stepOverride !== undefined ? stepOverride : currentStep;
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.projectName.content} title={FIELD_HELP.projectName.title} />
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => updateFormData('projectName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.projectName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Taj Hotel Commercial Kitchen Installation"
                />
                {errors.projectName && <p className="mt-1 text-sm text-red-500">{errors.projectName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Project Type <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.projectType.content} title={FIELD_HELP.projectType.title} />
                </label>
                <SearchableSelect
                  options={PROJECT_TYPES}
                  value={formData.projectType}
                  onChange={(val) => updateFormData('projectType', val)}
                  placeholder="Select Project Type"
                  addNewLabel="Add Project Type"
                  addNewHref="/project-management/project-types"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Sales Order Number <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.salesOrderNumber.content} title={FIELD_HELP.salesOrderNumber.title} />
                </label>
                <SearchableSelect
                  options={SALES_ORDERS}
                  value={formData.salesOrderNumber}
                  onChange={(val) => {
                    updateFormData('salesOrderNumber', val);
                    const so = SALES_ORDERS.find(s => s.value === val);
                    if (so) {
                      updateFormData('customerName', so.customerName);
                      updateFormData('customerId', so.customerId);
                    }
                  }}
                  placeholder="Select Sales Order"
                  addNewLabel="Add Sales Order"
                  addNewHref="/sales/orders/create"
                  error={!!errors.salesOrderNumber}
                />
                {errors.salesOrderNumber && <p className="mt-1 text-sm text-red-500">{errors.salesOrderNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => updateFormData('customerId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CUST-XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={CUSTOMERS}
                  value={formData.customerName}
                  onChange={(val) => {
                    updateFormData('customerName', val);
                    const customerIdMap: Record<string, string> = {
                      'Taj Hotels Limited': 'CUST-001',
                      'Oberoi Group': 'CUST-002',
                      'ITC Hotels': 'CUST-003',
                    };
                    if (customerIdMap[val]) {
                      updateFormData('customerId', customerIdMap[val]);
                    }
                  }
                  }
                  placeholder="Select Customer"
                  addNewLabel="Add Customer"
                  addNewHref="/common-masters/customer-master"
                  error={!!errors.customerName}
                />
                {errors.customerName && <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the project scope and objectives..."
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Scope & Requirements</h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Scope</label>
                <textarea
                  value={formData.scope}
                  onChange={(e) => updateFormData('scope', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Define the project scope, inclusions, and exclusions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => updateFormData('specialRequirements', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special client requirements, certifications needed, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Safety Requirements</label>
                <textarea
                  value={formData.safetyRequirements}
                  onChange={(e) => updateFormData('safetyRequirements', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Safety protocols, PPE requirements, site restrictions..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Project Attachments</h2>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">
                Upload relevant project documents such as contracts, engineering drawings, site photos, or technical specifications.
              </p>
            </div>
            <DragDropUpload
              onFilesChange={(files) => updateFormData('attachments', files)}
              accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']}
              maxFiles={10}
              maxSize={20 * 1024 * 1024}
              autoUpload={false}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review & Update Project</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              {/* Basic Info Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Project Name:</span>
                    <p className="font-medium text-gray-900">{formData.projectName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Project Type:</span>
                    <p className="font-medium text-gray-900">{formData.projectType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sales Order:</span>
                    <p className="font-medium text-gray-900">{formData.salesOrderNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p className="font-medium text-gray-900">{formData.customerName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium text-gray-900">{formData.location || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline & Budget Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Timeline & Budget</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium text-gray-900">
                      {formData.startDate} to {formData.endDate} ({duration})
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <p className="font-medium text-gray-900">
                      {formData.estimatedBudget ? formatCurrency(parseFloat(formData.estimatedBudget)) : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Contract Value:</span>
                    <p className="font-medium text-gray-900">
                      {formData.contractValue ? formatCurrency(parseFloat(formData.contractValue)) : '-'}
                    </p>
                  </div>
                  {profitMargin && (
                    <div>
                      <span className="text-gray-500">Profit Margin:</span>
                      <p className={`font-medium ${profitMargin.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin.percentage}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Team</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Project Manager:</span>
                    <p className="font-medium text-gray-900">{formData.projectManager || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <p className="font-medium text-gray-900">{formData.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Team Members:</span>
                    <p className="font-medium text-gray-900">
                      {formData.teamMembers.filter(m => m.name).map(m => m.name).join(', ') || 'No members assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deliverables Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Deliverables</h3>
                {formData.deliverables.filter(d => d.name).length > 0 ? (
                  <ul className="space-y-2">
                    {formData.deliverables.filter(d => d.name).map((d) => (
                      <li key={d.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-900">{d.name}</span>
                          <span className="text-gray-500 text-xs">({d.type})</span>
                          {d.plannedDate && <span className="text-gray-400 text-xs">- {d.plannedDate}</span>}
                        </div>
                        {d.details && (
                          <p className="text-sm text-gray-600 pl-6 border-l-2 border-gray-100 ml-2">
                            {d.details}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No deliverables defined</p>
                )}
              </div>

              {/* Attachments Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Attachments</h3>
                {formData.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {formData.attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No attachments uploaded</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-3 py-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">Phase 1: Project Initiation</p>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode('wizard')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'wizard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Wizard Mode
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Preview Mode
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FormProgressIndicator
                fields={formFields}
                values={formData}
                variant="circular"
                size="md"
              />
            </div>
          </div>

          {/* Template Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowImportTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200 text-sm font-medium"
            >
              <Layers className="w-4 h-4" />
              Use Template
            </button>
            <button
              type="button"
              onClick={() => setShowCreateTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all border border-green-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
            <button
              type="button"
              onClick={() => setShowImportTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all border border-indigo-200 text-sm font-medium"
            >
              <FileUp className="w-4 h-4" />
              Import Template
            </button>
            <button
              type="button"
              onClick={() => setShowTemplateSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all border border-orange-200 text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Template Settings
            </button>
          </div>
        </div>

        {/* Step Indicator - Only in Wizard Mode */}
        {viewMode === 'wizard' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              variant="default"
            />
          </div>
        )}

        {/* Form Content */}
        {viewMode === 'wizard' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            {renderStepContent()}
          </div>
        ) : (
          <div className="mb-3">
            {renderAllSteps()}
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/project-management')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {viewMode === 'wizard' && (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
              )}

              {(viewMode === 'preview' || currentStep < STEPS.length - 1) ? (
                <button
                  type="button"
                  onClick={viewMode === 'preview' ? handleSubmit : goToNextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {viewMode === 'preview' ? (
                    <>
                      <Save className="w-5 h-5" />
                      Update Project
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Project
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Template Modals */}
        <CreateTemplateModal
          isOpen={showCreateTemplateModal}
          onClose={() => setShowCreateTemplateModal(false)}
          onCreate={handleCreateTemplate}
        />
        <EditTemplateModal
          isOpen={showEditTemplateModal}
          onClose={() => setShowEditTemplateModal(false)}
          onUpdate={handleEditTemplate}
          template={selectedTemplate}
        />
        <DuplicateTemplateModal
          isOpen={showDuplicateTemplateModal}
          onClose={() => setShowDuplicateTemplateModal(false)}
          onDuplicate={handleDuplicateTemplate}
          template={selectedTemplate}
        />
        <DeleteTemplateModal
          isOpen={showDeleteTemplateModal}
          onClose={() => setShowDeleteTemplateModal(false)}
          onDelete={handleDeleteTemplate}
          template={selectedTemplate}
        />
        <TemplateSettingsModal
          isOpen={showTemplateSettingsModal}
          onClose={() => setShowTemplateSettingsModal(false)}
          onSave={handleTemplateSettings}
          template={selectedTemplate}
        />
        <ShareTemplateModal
          isOpen={showShareTemplateModal}
          onClose={() => setShowShareTemplateModal(false)}
          onShare={handleShareTemplate}
          template={selectedTemplate}
        />
        <ExportTemplateModal
          isOpen={showExportTemplateModal}
          onClose={() => setShowExportTemplateModal(false)}
          onExport={handleExportTemplate}
          template={selectedTemplate}
        />
        <ImportTemplateModal
          isOpen={showImportTemplateModal}
          onClose={() => setShowImportTemplateModal(false)}
          onImport={handleImportTemplate}
        />
        <ArchiveTemplateModal
          isOpen={showArchiveTemplateModal}
          onClose={() => setShowArchiveTemplateModal(false)}
          onArchive={handleArchiveTemplate}
          template={selectedTemplate}
        />
        <FavoriteTemplateModal
          isOpen={showFavoriteTemplateModal}
          onClose={() => setShowFavoriteTemplateModal(false)}
          onToggleFavorite={handleToggleFavorite}
          template={selectedTemplate}
        />
      </div>
    </div>
  );
}
