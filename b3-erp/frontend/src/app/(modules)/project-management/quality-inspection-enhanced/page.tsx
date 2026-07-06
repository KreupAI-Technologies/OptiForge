'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  ClipboardCheck,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Plus,
  Trash2,
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

const FIELD_HELP = {
  inspectionType: {
    title: 'Inspection Type',
    content: 'In-Process: During production. Final: After completion. Pre-Dispatch: Before shipping.',
  },
  acceptanceCriteria: {
    title: 'Acceptance Criteria',
    content: 'Define pass/fail thresholds. Critical defects = automatic rejection.',
  },
};

interface ChecklistItem {
  id: string;
  parameter: string;
  specification: string;
  method: string;
  result: string;
  status: 'pass' | 'fail' | 'pending';
  remarks: string;
}

interface FormData {
  project: string;
  projectName: string;
  workOrder: string;
  inspectionType: string;
  inspectionDate: string;
  inspector: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  sampleSize: number;
  checklist: ChecklistItem[];
  overallResult: string;
  recommendations: string;
  photos: string[];
}

const STEPS = [
  { id: 'info', label: 'Basic Info', description: 'Product details' },
  { id: 'checklist', label: 'Inspection', description: 'Quality checks' },
  { id: 'results', label: 'Results', description: 'Document findings' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
];

const defaultChecklist: ChecklistItem[] = [
  { id: '1', parameter: 'Dimensions', specification: 'As per drawing ±1mm', method: 'Measurement', result: '', status: 'pending', remarks: '' },
  { id: '2', parameter: 'Surface Finish', specification: 'No scratches, uniform', method: 'Visual', result: '', status: 'pending', remarks: '' },
  { id: '3', parameter: 'Weld Quality', specification: 'No porosity, full penetration', method: 'Visual/Dye Test', result: '', status: 'pending', remarks: '' },
  { id: '4', parameter: 'Fit & Assembly', specification: 'All parts align correctly', method: 'Assembly check', result: '', status: 'pending', remarks: '' },
  { id: '5', parameter: 'Functionality', specification: 'All functions work as expected', method: 'Functional test', result: '', status: 'pending', remarks: '' },
];

const initialFormData: FormData = {
  project: '',
  projectName: '',
  workOrder: '',
  inspectionType: 'final',
  inspectionDate: new Date().toISOString().split('T')[0],
  inspector: '',
  productName: '',
  batchNumber: '',
  quantity: 0,
  sampleSize: 0,
  checklist: defaultChecklist,
  overallResult: '',
  recommendations: '',
  photos: [],
};

export default function QualityInspectionEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
    formData as unknown as Record<string, unknown>,
    { key: 'quality-inspection-form', debounceMs: 3000 }
  );

  const hasUnsavedChanges = formData.project !== '';
  useUnsavedChangesWarning(hasUnsavedChanges && !isSubmitting);

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) setFormData(draft as unknown as FormData);
  };

  const formFields = useMemo(() => [
    { name: 'project', required: true },
    { name: 'workOrder', required: true },
    { name: 'inspector', required: true },
  ], []);

  const stats = useMemo(() => {
    const passed = formData.checklist.filter(c => c.status === 'pass').length;
    const failed = formData.checklist.filter(c => c.status === 'fail').length;
    const pending = formData.checklist.filter(c => c.status === 'pending').length;
    return { passed, failed, pending, total: formData.checklist.length };
  }, [formData.checklist]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateChecklist = (id: string, field: keyof ChecklistItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      parameter: '',
      specification: '',
      method: '',
      result: '',
      status: 'pending',
      remarks: '',
    };
    setFormData(prev => ({ ...prev, checklist: [...prev.checklist, newItem] }));
  };

  const removeChecklistItem = (id: string) => {
    setFormData(prev => ({ ...prev, checklist: prev.checklist.filter(item => item.id !== id) }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!formData.project) newErrors.project = 'Select a project';
        if (!formData.workOrder) newErrors.workOrder = 'Enter work order';
        if (!formData.inspector) newErrors.inspector = 'Select inspector';
        break;
      case 1:
        if (stats.pending > 0) newErrors.checklist = 'Complete all inspection items';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await projectManagementService.createQualityInspection({
        companyId: 'default-company-id',
        projectId: formData.project,
        projectName: formData.projectName,
        inspectionType: formData.inspectionType,
        inspectionDate: formData.inspectionDate,
        inspectorName: formData.inspector,
        workPackage: formData.workOrder,
        overallStatus: formData.overallResult,
        passed: stats.passed,
        failed: stats.failed,
        pending: stats.pending,
        totalCheckPoints: stats.total,
        remarks: formData.recommendations,
      } as any);
      clearDraft();
      router.push('/project-management/quality-inspection');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Inspection Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
                <select
                  value={formData.project}
                  onChange={(e) => {
                    updateFormData('project', e.target.value);
                    updateFormData('projectName', e.target.options[e.target.selectedIndex].text);
                  }}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.project ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select project</option>
                  <option value="PRJ-001">Taj Hotels - Commercial Kitchen</option>
                  <option value="PRJ-002">BigBasket - Cold Room</option>
                </select>
                {errors.project && <p className="mt-1 text-sm text-red-500">{errors.project}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Order <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.workOrder}
                  onChange={(e) => updateFormData('workOrder', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.workOrder ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="WO-2025-XXX"
                />
                {errors.workOrder && <p className="mt-1 text-sm text-red-500">{errors.workOrder}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Inspection Type
                  <HelpIcon content={FIELD_HELP.inspectionType.content} title={FIELD_HELP.inspectionType.title} />
                </label>
                <select
                  value={formData.inspectionType}
                  onChange={(e) => updateFormData('inspectionType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="in-process">In-Process Inspection</option>
                  <option value="final">Final Inspection</option>
                  <option value="pre-dispatch">Pre-Dispatch Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Date</label>
                <input
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => updateFormData('inspectionDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inspector <span className="text-red-500">*</span></label>
                <select
                  value={formData.inspector}
                  onChange={(e) => updateFormData('inspector', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.inspector ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select inspector</option>
                  <option value="QC-001">Ravi Kumar - Senior QC</option>
                  <option value="QC-002">Priya Singh - QC Engineer</option>
                </select>
                {errors.inspector && <p className="mt-1 text-sm text-red-500">{errors.inspector}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => updateFormData('productName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 6-Burner Gas Range"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch/Lot Number</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => updateFormData('batchNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => updateFormData('quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sample Size</label>
                  <input
                    type="number"
                    value={formData.sampleSize}
                    onChange={(e) => updateFormData('sampleSize', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Inspection Checklist</h2>
              </div>
              <button onClick={addChecklistItem} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                <p className="text-xs text-green-700">Passed</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-xs text-red-700">Failed</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-yellow-700">Pending</p>
              </div>
            </div>

            {errors.checklist && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">{errors.checklist}</p>
              </div>
            )}

            <div className="space-y-2">
              {formData.checklist.map((item, index) => (
                <div key={item.id} className={`p-4 rounded-lg border ${item.status === 'pass' ? 'bg-green-50 border-green-200' :
                    item.status === 'fail' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                  }`}>
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Parameter</label>
                      <input
                        type="text"
                        value={item.parameter}
                        onChange={(e) => updateChecklist(item.id, 'parameter', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Specification</label>
                      <input
                        type="text"
                        value={item.specification}
                        onChange={(e) => updateChecklist(item.id, 'specification', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Result</label>
                      <input
                        type="text"
                        value={item.result}
                        onChange={(e) => updateChecklist(item.id, 'result', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Actual value"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateChecklist(item.id, 'status', 'pass')}
                          className={`flex-1 py-1.5 rounded text-sm font-medium ${item.status === 'pass' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                            }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateChecklist(item.id, 'status', 'fail')}
                          className={`flex-1 py-1.5 rounded text-sm font-medium ${item.status === 'fail' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                            }`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeChecklistItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.status === 'fail' && (
                    <div className="mt-3 ml-12">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => updateChecklist(item.id, 'remarks', e.target.value)}
                        className="w-full px-3 py-1.5 border border-red-300 rounded text-sm bg-white"
                        placeholder="Failure remarks (required)"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Results & Recommendations</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overall Result</label>
              <div className="grid grid-cols-3 gap-2">
                {['Approved', 'Conditional', 'Rejected'].map((result) => (
                  <button
                    key={result}
                    type="button"
                    onClick={() => updateFormData('overallResult', result)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${formData.overallResult === result
                        ? result === 'Approved' ? 'border-green-500 bg-green-50' :
                          result === 'Conditional' ? 'border-yellow-500 bg-yellow-50' :
                            'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {result === 'Approved' && <CheckCircle className="w-8 h-8 mb-2 text-green-600" />}
                    {result === 'Conditional' && <AlertTriangle className="w-8 h-8 mb-2 text-yellow-600" />}
                    {result === 'Rejected' && <XCircle className="w-8 h-8 mb-2 text-red-600" />}
                    <p className="font-medium">{result}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations / Corrective Actions</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => updateFormData('recommendations', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Document any recommended actions, rework required, or conditions for acceptance..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4" /> Photo Documentation
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drag photos here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review Inspection Report</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Work Order:</span>
                  <p className="font-medium text-gray-900">{formData.workOrder}</p>
                </div>
                <div>
                  <span className="text-gray-500">Product:</span>
                  <p className="font-medium text-gray-900">{formData.productName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Inspection Type:</span>
                  <p className="font-medium text-gray-900 capitalize">{formData.inspectionType}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Results Summary</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 border text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                    <p className="text-sm text-gray-500">Passed</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Checks</p>
                  </div>
                  <div className={`rounded-lg p-3 border text-center ${formData.overallResult === 'Approved' ? 'bg-green-50 border-green-200' :
                      formData.overallResult === 'Conditional' ? 'bg-yellow-50 border-yellow-200' :
                        formData.overallResult === 'Rejected' ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}>
                    <p className={`text-lg font-bold ${formData.overallResult === 'Approved' ? 'text-green-600' :
                        formData.overallResult === 'Conditional' ? 'text-yellow-600' :
                          'text-red-600'
                      }`}>{formData.overallResult || 'Pending'}</p>
                    <p className="text-sm text-gray-500">Overall</p>
                  </div>
                </div>
              </div>

              {formData.recommendations && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Recommendations</h3>
                  <p className="text-sm text-gray-700">{formData.recommendations}</p>
                </div>
              )}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Quality Inspection</h1>
              <p className="text-sm text-gray-600 mt-1">Phase 6: Quality & Packaging</p>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
              <FormProgressIndicator fields={formFields} values={formData as unknown as Record<string, unknown>} variant="circular" size="md" />
            </div>
          </div>
          {hasDraft && currentStep === 0 && (
            <DraftRecoveryBanner hasDraft={hasDraft} onRestore={handleRestoreDraft} onDiscard={clearDraft} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} variant="circles" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          {renderStepContent()}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/project-management/quality-inspection')} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" /> Cancel
            </button>
            <div className="flex items-center gap-3">
              <button onClick={goToPrevStep} disabled={currentStep === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}>
                <ArrowLeft className="w-5 h-5" /> Previous
              </button>
              {currentStep < STEPS.length - 1 ? (
                <button onClick={goToNextStep} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><Save className="w-5 h-5" /> Submit Report</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
