'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Trash2,
  Edit2,
  Eye,
  Download,
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

// Field help content
const FIELD_HELP = {
  project: {
    title: 'Project Selection',
    content: 'Select the project this BOQ belongs to. The BOQ will be linked to all project phases and procurement workflows.',
  },
  phase: {
    title: 'Project Phase',
    content: 'Select the phase this BOQ is for. Different phases may have different BOQ structures and approval workflows.',
  },
  version: {
    title: 'Version Number',
    content: 'Version number for tracking revisions. Use semantic versioning (1.0, 1.1, 2.0) for major/minor changes.',
  },
  fileFormat: {
    title: 'Supported Formats',
    content: 'Excel files (.xlsx, .xls) can be previewed and validated. PDF/Word files will be stored for reference only.',
  },
  validation: {
    title: 'Validation Rules',
    content: 'The system validates quantities, rates, and calculations. Discrepancies will be highlighted for review before submission.',
  },
};

// Types
interface BOQItem {
  id: string;
  item: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isValid: boolean;
  issues?: string[];
}

interface FormData {
  project: string;
  projectName: string;
  phase: string;
  version: string;
  description: string;
  file: File | null;
  fileName: string;
  fileSize: number;
  boqItems: BOQItem[];
  notes: string;
}

const STEPS = [
  { id: 'details', label: 'Document Details', description: 'Project and version info' },
  { id: 'upload', label: 'File Upload', description: 'Upload BOQ file' },
  { id: 'preview', label: 'Preview & Validate', description: 'Review extracted data' },
  { id: 'confirm', label: 'Confirm', description: 'Submit for approval' },
];

const initialFormData: FormData = {
  project: '',
  projectName: '',
  phase: '',
  version: '1.0',
  description: '',
  file: null,
  fileName: '',
  fileSize: 0,
  boqItems: [],
  notes: '',
};

// Mock data for preview
const mockBOQItems: BOQItem[] = [
  { id: '1', item: '1.0', description: 'Excavation and Earthwork', unit: 'm3', quantity: 500, rate: 450, amount: 225000, isValid: true },
  { id: '2', item: '2.0', description: 'PCC 1:4:8 Foundation', unit: 'm3', quantity: 150, rate: 4500, amount: 675000, isValid: true },
  { id: '3', item: '3.0', description: 'RCC M25 Grade Concrete', unit: 'm3', quantity: 350, rate: 8500, amount: 2975000, isValid: true },
  { id: '4', item: '4.0', description: 'Steel Reinforcement (Fe500)', unit: 'kg', quantity: 25000, rate: 75, amount: 1875000, isValid: true },
  { id: '5', item: '5.0', description: 'Brick Masonry Work', unit: 'm3', quantity: 400, rate: 6500, amount: 2600000, isValid: true },
  { id: '6', item: '6.0', description: 'Plastering (Internal)', unit: 'm2', quantity: 1200, rate: 320, amount: 384000, isValid: true },
  { id: '7', item: '7.0', description: 'Electrical Wiring', unit: 'lot', quantity: 1, rate: 450000, amount: 450000, isValid: false, issues: ['Rate exceeds budget estimate'] },
  { id: '8', item: '8.0', description: 'Plumbing Works', unit: 'lot', quantity: 1, rate: 280000, amount: 280000, isValid: true },
];

const PROJECTS = [
  { label: 'PRJ-2025-001 - Taj Hotels - Commercial Kitchen', value: 'PRJ-2025-001' },
  { label: 'PRJ-2025-002 - BigBasket - Cold Room', value: 'PRJ-2025-002' },
  { label: 'PRJ-2025-003 - L&T Campus - Industrial Kitchen', value: 'PRJ-2025-003' },
];

const PHASES = [
  { label: 'Phase 1 - Project Initiation', value: 'phase-1' },
  { label: 'Phase 2 - Design & Site Assessment', value: 'phase-2' },
  { label: 'Phase 3 - Technical Design & BOM', value: 'phase-3' },
  { label: 'Phase 4 - Procurement', value: 'phase-4' },
];

export default function UploadBOQEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [boqTemplate, setBoqTemplate] = useState<BOQItem[]>(mockBOQItems);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await projectManagementService.listBoqLineTemplates();
        if (!active || !rows || rows.length === 0) return;
        setBoqTemplate(rows.map((r) => ({
          id: r.id,
          item: r.item || '',
          description: r.description || '',
          unit: r.unit || '',
          quantity: r.quantity ?? 0,
          rate: r.rate ?? 0,
          amount: r.amount ?? 0,
          isValid: r.isValid ?? true,
        })));
      } catch {
        // keep static fallback
      }
    })();
    return () => { active = false; };
  }, []);

  // Auto-save draft
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
    formData as unknown as Record<string, unknown>,
    {
      key: 'boq-upload-form',
      debounceMs: 3000,
    }
  );

  // Unsaved changes warning
  const hasUnsavedChanges = formData.file !== null || formData.project !== '';
  useUnsavedChangesWarning(hasUnsavedChanges && !isSubmitting);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      // Can't restore file from draft, but restore other fields
      setFormData(prev => ({ ...prev, ...draft, file: null }));
    }
  };

  // Form fields for progress indicator
  const formFields = useMemo(() => [
    { name: 'project', required: true },
    { name: 'phase', required: true },
    { name: 'version', required: true },
    { name: 'file', required: true, validate: () => formData.file !== null },
  ], [formData.file]);

  // Calculate totals
  const totals = useMemo(() => {
    const items = formData.boqItems.length > 0 ? formData.boqItems : [];
    return {
      itemCount: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
      validItems: items.filter(i => i.isValid).length,
      invalidItems: items.filter(i => !i.isValid).length,
    };
  }, [formData.boqItems]);

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

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setFormData(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: file.size,
      // Mock parsing - in real app, this would parse the file
      boqItems: file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? boqTemplate : [],
    }));
  }, [boqTemplate]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Update BOQ item
  const updateBOQItem = (id: string, field: keyof BOQItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      boqItems: prev.boqItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate amount if quantity or rate changed
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Document Details
        if (!formData.project) newErrors.project = 'Please select a project';
        if (!formData.phase) newErrors.phase = 'Please select a phase';
        if (!formData.version.trim()) newErrors.version = 'Version is required';
        break;
      case 1: // File Upload
        if (!formData.file) newErrors.file = 'Please upload a BOQ file';
        break;
      case 2: // Preview
        if (formData.boqItems.some(item => !item.isValid)) {
          newErrors.items = 'Please resolve all validation issues before proceeding';
        }
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
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('BOQ uploaded:', formData);
      clearDraft();
      router.push('/project-management/documents');
    } catch (error) {
      console.error('Error uploading BOQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
            <p className="text-sm text-gray-600">Enter project and document information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Select Project <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.project.content} title={FIELD_HELP.project.title} />
                </label>
                <SearchableSelect
                  options={PROJECTS}
                  value={formData.project}
                  onChange={(val) => {
                    updateFormData('project', val);
                    const selectedProject = PROJECTS.find(p => p.value === val);
                    if (selectedProject) {
                      const projectNames: Record<string, string> = {
                        'PRJ-2025-001': 'Taj Hotels - Commercial Kitchen',
                        'PRJ-2025-002': 'BigBasket - Cold Room',
                        'PRJ-2025-003': 'L&T Campus - Industrial Kitchen',
                      };
                      updateFormData('projectName', projectNames[val] || '');
                    }
                  }}
                  placeholder="Select a project"
                  addNewLabel="Create Project"
                  addNewHref="/project-management/create-enhanced"
                  error={!!errors.project}
                />
                {errors.project && <p className="mt-1 text-sm text-red-500">{errors.project}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Project Phase <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.phase.content} title={FIELD_HELP.phase.title} />
                </label>
                <SearchableSelect
                  options={PHASES}
                  value={formData.phase}
                  onChange={(val) => updateFormData('phase', val)}
                  placeholder="Select phase"
                  error={!!errors.phase}
                />
                {errors.phase && <p className="mt-1 text-sm text-red-500">{errors.phase}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Version <span className="text-red-500">*</span>
                  <HelpIcon content={FIELD_HELP.version.content} title={FIELD_HELP.version.title} />
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => updateFormData('version', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.version ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., 1.0"
                />
                {errors.version && <p className="mt-1 text-sm text-red-500">{errors.version}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <input
                  type="text"
                  value="Bill of Quantities (BOQ)"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brief description of this BOQ version..."
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">File Upload</h2>
                <p className="text-sm text-gray-600">Upload your BOQ document</p>
              </div>
              <HelpIcon content={FIELD_HELP.fileFormat.content} title={FIELD_HELP.fileFormat.title} size="md" />
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : errors.file
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.pdf,.doc,.docx"
                onChange={handleFileInputChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <span className="text-base font-medium text-gray-900">
                    {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    XLSX, XLS (recommended), PDF, DOC up to 10MB
                  </p>
                </div>
              </label>
            </div>
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}

            {formData.file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                {formData.fileName.endsWith('x') ? (
                  <FileSpreadsheet className="w-10 h-10 text-green-600" />
                ) : (
                  <FileText className="w-10 h-10 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{formData.fileName}</p>
                  <p className="text-sm text-gray-500">{(formData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, file: null, fileName: '', fileSize: 0, boqItems: [] }))}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {formData.file && (formData.fileName.endsWith('.xlsx') || formData.fileName.endsWith('.xls')) && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Excel file detected</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {formData.boqItems.length} items extracted. Click Next to preview and validate.
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Preview & Validate</h2>
                <p className="text-sm text-gray-600">Review extracted BOQ items</p>
              </div>
              <HelpIcon content={FIELD_HELP.validation.content} title={FIELD_HELP.validation.title} size="md" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{totals.itemCount}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{totals.validItems}</p>
                <p className="text-sm text-green-700">Valid</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{totals.invalidItems}</p>
                <p className="text-sm text-red-700">Issues</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totals.totalAmount)}</p>
                <p className="text-sm text-blue-700">Total Value</p>
              </div>
            </div>

            {errors.items && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.items}</p>
              </div>
            )}

            {/* BOQ Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.boqItems.map((item) => (
                    <tr key={item.id} className={`${!item.isValid ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateBOQItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateBOQItem(item.id, 'quantity', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        ) : (
                          item.quantity.toLocaleString()
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateBOQItem(item.id, 'rate', parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        ) : (
                          formatCurrency(item.rate)
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isValid ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            {item.issues && (
                              <span className="text-xs text-red-600 mt-1">{item.issues[0]}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                          className={`p-1 rounded ${editingItem === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(totals.totalAmount)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Confirm Submission</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              {/* Document Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Document Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium text-gray-900">{formData.projectName || formData.project}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phase:</span>
                    <p className="font-medium text-gray-900">{formData.phase}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <p className="font-medium text-gray-900">{formData.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">File:</span>
                    <p className="font-medium text-gray-900">{formData.fileName}</p>
                  </div>
                </div>
              </div>

              {/* BOQ Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">BOQ Summary</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-gray-900">{totals.itemCount}</p>
                    <p className="text-sm text-gray-500">Line Items</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-green-600">{totals.validItems}</p>
                    <p className="text-sm text-gray-500">Validated Items</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalAmount)}</p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes for the approver..."
                />
              </div>

              {/* Approval Notice */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Approval Required</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This BOQ will be sent for approval to the Project Manager. You will be notified once it's approved.
                    </p>
                  </div>
                </div>
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
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Upload Bill of Quantities (BOQ)</h1>
              <p className="text-sm text-gray-600 mt-1">Phase 1: Project Initiation</p>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
              <FormProgressIndicator
                fields={formFields}
                values={formData as unknown as Record<string, unknown>}
                variant="circular"
                size="md"
              />
            </div>
          </div>

          {/* Draft Recovery Banner */}
          {hasDraft && currentStep === 0 && (
            <DraftRecoveryBanner
              hasDraft={hasDraft}
              onRestore={handleRestoreDraft}
              onDiscard={clearDraft}
            />
          )}
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            variant="circles"
          />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/project-management/documents')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <div className="flex items-center gap-3">
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

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Submit for Approval
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
