'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  ClipboardCheck,
  Package,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { inspectionService, type CreateInspectionDto } from '@/services/inspection.service';

interface ChecklistItem {
  id: string;
  parameter: string;
  specification: string;
  method: string;
  acceptance: string;
}

interface InspectionFormData {
  inspectionNumber: string;
  inspectionName: string;
  inspectionType: 'incoming' | 'in-process' | 'final' | 'pre-shipment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  itemCode: string;
  itemName: string;
  itemDescription: string;
  lotNumber: string;
  lotQuantity: number;
  sampleSize: number;
  samplingPlan: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTo: string;
  workCenter: string;
  referenceDoc: string;
  checklist: ChecklistItem[];
  specialInstructions: string;
  equipmentRequired: string[];
}

const getInitialForm = (): InspectionFormData => ({
  inspectionNumber: `INS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  inspectionName: '',
  inspectionType: 'incoming',
  priority: 'medium',
  itemCode: '',
  itemName: '',
  itemDescription: '',
  lotNumber: '',
  lotQuantity: 0,
  sampleSize: 0,
  samplingPlan: 'AQL 1.0',
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: '09:00',
  assignedTo: '',
  workCenter: '',
  referenceDoc: '',
  checklist: [],
  specialInstructions: '',
  equipmentRequired: [],
});

const inspectors = ['Rahul Verma', 'Priya Singh', 'Amit Patel', 'Sunita Sharma'];
const workCenters = ['QC Lab 1', 'QC Lab 2', 'Incoming Inspection Area', 'Final Inspection Zone'];
const samplingPlans = ['AQL 0.65', 'AQL 1.0', 'AQL 1.5', 'AQL 2.5', '100% Inspection', 'Skip-Lot'];
const equipment = ['Vernier Caliper', 'Micrometer', 'CMM Machine', 'Surface Tester', 'Hardness Tester', 'Visual Inspection Kit'];

const items = [
  { code: 'RM-STL-001', name: 'Stainless Steel Sheets', description: 'SS304 Grade, 2mm thickness' },
  { code: 'RM-ALU-002', name: 'Aluminum Bars', description: '6061-T6, 25mm diameter' },
  { code: 'CP-PCB-001', name: 'Circuit Board Assembly', description: 'Main control board' },
  { code: 'FG-CAB-001', name: 'Finished Cabinet Unit', description: 'Modular kitchen cabinet' },
];

const standardChecklists: Record<string, ChecklistItem[]> = {
  incoming: [
    { id: '1', parameter: 'Visual Appearance', specification: 'No defects, scratches', method: 'Visual', acceptance: 'Pass/Fail' },
    { id: '2', parameter: 'Dimensional Check', specification: 'As per drawing', method: 'Measurement', acceptance: '±0.5mm' },
    { id: '3', parameter: 'Material Certificate', specification: 'Available', method: 'Document', acceptance: 'Present' },
  ],
  'in-process': [
    { id: '1', parameter: 'Process Parameters', specification: 'Within limits', method: 'Monitoring', acceptance: 'Pass/Fail' },
    { id: '2', parameter: 'In-process Dimensions', specification: 'As per WIP spec', method: 'Measurement', acceptance: '±0.3mm' },
  ],
  final: [
    { id: '1', parameter: 'Final Dimensions', specification: 'As per drawing', method: 'CMM/Manual', acceptance: '±0.1mm' },
    { id: '2', parameter: 'Surface Finish', specification: 'Ra < 1.6', method: 'Surface Tester', acceptance: 'Pass/Fail' },
    { id: '3', parameter: 'Functional Test', specification: 'All functions OK', method: 'Functional', acceptance: 'Pass/Fail' },
    { id: '4', parameter: 'Packaging', specification: 'As per spec', method: 'Visual', acceptance: 'Pass/Fail' },
  ],
  'pre-shipment': [
    { id: '1', parameter: 'Quantity Verification', specification: 'As per order', method: 'Count', acceptance: '100%' },
    { id: '2', parameter: 'Documentation', specification: 'Complete', method: 'Document', acceptance: 'All present' },
    { id: '3', parameter: 'Packaging Integrity', specification: 'No damage', method: 'Visual', acceptance: 'Pass/Fail' },
  ],
};

const FIELD_HELP = {
  inspectionType: {
    title: 'Inspection Type',
    content: 'Incoming: Raw materials. In-process: During production. Final: Completed products. Pre-shipment: Before dispatch.',
  },
  sampleSize: {
    title: 'Sample Size',
    content: 'Number of units to inspect from the lot. Based on AQL sampling plan and lot size.',
  },
  samplingPlan: {
    title: 'Sampling Plan',
    content: 'AQL (Acceptable Quality Level) determines the acceptable defect rate. Lower AQL = stricter inspection.',
  },
};

export default function NewInspectionEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<InspectionFormData>(getInitialForm);
  const [initialForm, setInitialForm] = useState<InspectionFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const steps: Step[] = [
    { id: '1', label: 'Basic Info', description: 'Type & priority' },
    { id: '2', label: 'Item', description: 'What to inspect' },
    { id: '3', label: 'Schedule', description: 'When & who' },
    { id: '4', label: 'Checklist', description: 'Parameters' },
    { id: '5', label: 'Review', description: 'Submit' },
  ];

  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 12;
    if (formData.inspectionName) filled++;
    if (formData.inspectionType) filled++;
    if (formData.itemCode) filled++;
    if (formData.lotQuantity > 0) filled++;
    if (formData.sampleSize > 0) filled++;
    if (formData.scheduledDate) filled++;
    if (formData.assignedTo) filled++;
    if (formData.workCenter) filled++;
    if (formData.checklist.length > 0) filled++;
    if (formData.equipmentRequired.length > 0) filled++;
    if (formData.lotNumber) filled++;
    if (currentStep === 4) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, currentStep]);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData as unknown as Record<string, unknown>, {
    key: 'quality-inspection-draft',
    debounceMs: 2000,
    onRestore: (data: Record<string, unknown>) => { setFormData(data as unknown as InspectionFormData); setShowDraftBanner(false); },
  });

  const hasChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialForm);
  }, [formData, initialForm]);

  useUnsavedChangesWarning(hasChanges);

  useEffect(() => {
    const initial = getInitialForm();
    setFormData(initial);
    setInitialForm(initial);
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  const handleInputChange = (field: keyof InspectionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

    // Auto-load checklist when type changes
    if (field === 'inspectionType' && standardChecklists[value]) {
      setFormData((prev) => ({ ...prev, checklist: standardChecklists[value] }));
    }
  };

  const selectItem = (item: typeof items[0]) => {
    setFormData((prev) => ({
      ...prev,
      itemCode: item.code,
      itemName: item.name,
      itemDescription: item.description,
    }));
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      parameter: '',
      specification: '',
      method: '',
      acceptance: '',
    };
    setFormData((prev) => ({ ...prev, checklist: [...prev.checklist, newItem] }));
  };

  const updateChecklistItem = (id: string, field: keyof ChecklistItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const removeChecklistItem = (id: string) => {
    setFormData((prev) => ({ ...prev, checklist: prev.checklist.filter(i => i.id !== id) }));
  };

  const toggleEquipment = (eq: string) => {
    setFormData((prev) => ({
      ...prev,
      equipmentRequired: prev.equipmentRequired.includes(eq)
        ? prev.equipmentRequired.filter(e => e !== eq)
        : [...prev.equipmentRequired, eq],
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.inspectionName) newErrors.inspectionName = 'Name required';
    }
    if (step === 1) {
      if (!formData.itemCode) newErrors.itemCode = 'Select an item';
      if (formData.lotQuantity <= 0) newErrors.lotQuantity = 'Lot quantity required';
      if (formData.sampleSize <= 0) newErrors.sampleSize = 'Sample size required';
    }
    if (step === 2) {
      if (!formData.scheduledDate) newErrors.scheduledDate = 'Date required';
      if (!formData.assignedTo) newErrors.assignedTo = 'Inspector required';
    }
    if (step === 3) {
      if (formData.checklist.length === 0) newErrors.checklist = 'Add at least one check parameter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 4)); };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const buildPayload = (): CreateInspectionDto => ({
    type: formData.inspectionType as CreateInspectionDto['type'],
    productName: formData.itemName,
    productCode: formData.itemCode,
    lotNumber: formData.lotNumber || undefined,
    totalQuantity: Number(formData.lotQuantity) || 0,
    sampledQuantity: Number(formData.sampleSize) || 0,
    scheduledDate: new Date(`${formData.scheduledDate}T${formData.scheduledTime || '09:00'}`),
    inspectorId: 'default-user-id',
    inspectorName: formData.assignedTo || 'Unassigned',
    workstation: formData.workCenter || undefined,
    notes: formData.specialInstructions || undefined,
  });

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    try {
      await inspectionService.createInspection(buildPayload());
      clearDraft();
      alert('Inspection scheduled successfully!');
      router.push('/quality/inspections');
    } catch (err) {
      console.error('Error scheduling inspection:', err);
      alert('Failed to schedule inspection');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await inspectionService.createInspection(buildPayload());
    } catch (err) {
      console.error('Error saving inspection draft:', err);
    }
    router.push('/quality/inspections');
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
    router.push('/quality/inspections');
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      <DraftRecoveryBanner
        hasDraft={showDraftBanner}
        onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
        onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
      />

      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Inspections</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Inspection</h1>
              <p className="text-gray-600 text-sm font-mono">{formData.inspectionNumber}</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      <div className="mb-2">
        <ProgressBar value={completionPercentage} max={100} label="Form completion" showValue variant="gradient" color="blue" />
      </div>

      <div className="mb-8">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(i) => { if (i <= currentStep) setCurrentStep(i); }} variant="circles" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Name *</label>
                <input
                  type="text"
                  value={formData.inspectionName}
                  onChange={(e) => handleInputChange('inspectionName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.inspectionName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Incoming Material Check - Steel Sheets Batch 2025-01"
                />
                {errors.inspectionName && <p className="text-xs text-red-500 mt-1">{errors.inspectionName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Inspection Type *
                  <HelpIcon {...FIELD_HELP.inspectionType} />
                </label>
                <select
                  value={formData.inspectionType}
                  onChange={(e) => handleInputChange('inspectionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="incoming">Incoming Inspection</option>
                  <option value="in-process">In-Process Inspection</option>
                  <option value="final">Final Inspection</option>
                  <option value="pre-shipment">Pre-Shipment Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Document</label>
                <input
                  type="text"
                  value={formData.referenceDoc}
                  onChange={(e) => handleInputChange('referenceDoc', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="PO/WO/GRN number"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Item Details */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              Item to Inspect
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => selectItem(item)}
                      className={`p-3 text-left border rounded-lg ${formData.itemCode === item.code ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.code} - {item.description}</p>
                    </button>
                  ))}
                </div>
                {errors.itemCode && <p className="text-xs text-red-500 mt-1">{errors.itemCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot/Batch Number</label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., LOT-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Quantity *</label>
                <input
                  type="number"
                  value={formData.lotQuantity}
                  onChange={(e) => handleInputChange('lotQuantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.lotQuantity ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.lotQuantity && <p className="text-xs text-red-500 mt-1">{errors.lotQuantity}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Sample Size *
                  <HelpIcon {...FIELD_HELP.sampleSize} />
                </label>
                <input
                  type="number"
                  value={formData.sampleSize}
                  onChange={(e) => handleInputChange('sampleSize', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.sampleSize ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.sampleSize && <p className="text-xs text-red-500 mt-1">{errors.sampleSize}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Sampling Plan
                  <HelpIcon {...FIELD_HELP.samplingPlan} />
                </label>
                <select
                  value={formData.samplingPlan}
                  onChange={(e) => handleInputChange('samplingPlan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {samplingPlans.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Schedule & Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Inspector *</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.assignedTo ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Inspector</option>
                  {inspectors.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Center / Location</label>
                <select
                  value={formData.workCenter}
                  onChange={(e) => handleInputChange('workCenter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Location</option>
                  {workCenters.map((wc) => <option key={wc} value={wc}>{wc}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Required</label>
                <div className="flex flex-wrap gap-2">
                  {equipment.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        formData.equipmentRequired.includes(eq)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any special handling or inspection requirements..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Checklist */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Inspection Checklist</h3>
              <button onClick={addChecklistItem} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Add Parameter</span>
              </button>
            </div>

            {errors.checklist && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.checklist}</div>
            )}

            {formData.checklist.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ClipboardCheck className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">No checklist items yet</p>
                <p className="text-sm text-gray-500">Select an inspection type to load standard checklist, or add custom parameters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.checklist.map((item, index) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Check #{index + 1}</span>
                      <button onClick={() => removeChecklistItem(item.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Parameter</label>
                        <input
                          type="text"
                          value={item.parameter}
                          onChange={(e) => updateChecklistItem(item.id, 'parameter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="What to check"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Specification</label>
                        <input
                          type="text"
                          value={item.specification}
                          onChange={(e) => updateChecklistItem(item.id, 'specification', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Expected value"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                        <input
                          type="text"
                          value={item.method}
                          onChange={(e) => updateChecklistItem(item.id, 'method', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="How to check"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Acceptance</label>
                        <input
                          type="text"
                          value={item.acceptance}
                          onChange={(e) => updateChecklistItem(item.id, 'acceptance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Criteria"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Inspection Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Number:</span><span className="font-mono">{formData.inspectionNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{formData.inspectionName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="capitalize">{formData.inspectionType}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Priority:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getPriorityColor(formData.priority)}`}>{formData.priority}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Item & Sampling</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Item:</span><span className="font-medium">{formData.itemName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lot:</span><span className="font-mono">{formData.lotNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lot Size:</span><span>{formData.lotQuantity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Sample:</span><span>{formData.sampleSize} ({formData.samplingPlan})</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formData.scheduledDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Time:</span><span>{formData.scheduledTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Inspector:</span><span>{formData.assignedTo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location:</span><span>{formData.workCenter || '-'}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Checklist Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Parameters:</span> {formData.checklist.length} checks</p>
                  <p><span className="text-gray-500">Equipment:</span> {formData.equipmentRequired.length > 0 ? formData.equipmentRequired.join(', ') : 'None specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Ready to Schedule</h4>
                  <p className="text-sm text-blue-800">
                    The inspection will be scheduled and the assigned inspector will be notified.
                    Results can be recorded after the scheduled date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 py-4">
        <div>
          {currentStep > 0 && (
            <button onClick={prevStep} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Save Draft</button>
          {currentStep < 4 ? (
            <button onClick={nextStep} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Send className="h-5 w-5" />
              <span>Schedule Inspection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
