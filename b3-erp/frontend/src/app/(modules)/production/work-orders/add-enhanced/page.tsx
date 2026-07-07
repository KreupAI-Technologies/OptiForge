'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Factory,
  Calendar,
  Users,
  AlertCircle,
  Settings,
  Package,
  Clock,
  Hash,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  FormProgressIndicator,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';
import { workOrderService } from '@/services/work-order.service';
import { commonMastersService } from '@/services/common-masters.service';

const COMPANY_ID = 'default-company-id';

interface ProductOption {
  code: string;
  name: string;
  description: string;
  uom: string;
  bomRef: string;
}

interface MaterialRequirement {
  id: string;
  itemCode: string;
  description: string;
  requiredQty: number;
  uom: string;
  stockAvailable: number;
  stockStatus: 'available' | 'shortage' | 'critical';
}

interface Operation {
  id: string;
  sequence: number;
  operationName: string;
  workCenter: string;
  setupTime: number;
  runTime: number;
}

interface WorkOrderFormData {
  woNumber: string;
  createFrom: 'sales_order' | 'manual';
  productCode: string;
  productName: string;
  productDescription: string;
  quantity: number;
  uom: string;
  salesOrderRef: string;
  customerName: string;
  dueDate: string;
  urgency: 'normal' | 'urgent' | 'critical';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  plannedStartDate: string;
  plannedEndDate: string;
  workCenter: string;
  supervisor: string;
  bomRef: string;
  routingRef: string;
  materialRequirements: MaterialRequirement[];
  operations: Operation[];
  specialInstructions: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedOverheadCost: number;
}

const getInitialForm = (): WorkOrderFormData => ({
  woNumber: `WO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  createFrom: 'manual',
  productCode: '',
  productName: '',
  productDescription: '',
  quantity: 1,
  uom: 'Pcs',
  salesOrderRef: '',
  customerName: '',
  dueDate: '',
  urgency: 'normal',
  priority: 'Medium',
  plannedStartDate: '',
  plannedEndDate: '',
  workCenter: '',
  supervisor: '',
  bomRef: '',
  routingRef: '',
  materialRequirements: [],
  operations: [],
  specialInstructions: '',
  estimatedMaterialCost: 0,
  estimatedLaborCost: 0,
  estimatedOverheadCost: 0,
});

const workCenters = ['Assembly Line A', 'Assembly Line B', 'CNC Machining', 'Welding Station', 'Painting Booth', 'Quality Lab'];
const supervisors = ['Ramesh Kumar', 'Suresh Patel', 'Vikram Singh', 'Anjali Sharma'];
const uoms = ['Pcs', 'Kg', 'Mt', 'Lt', 'Set', 'Unit'];

// Field help content
const FIELD_HELP = {
  woNumber: {
    title: 'Work Order Number',
    content: 'Unique identifier for this work order. Auto-generated but can be modified if needed.',
  },
  createFrom: {
    title: 'Creation Source',
    content: 'Manual: Create standalone work order. Sales Order: Link to existing sales order for traceability.',
  },
  urgency: {
    title: 'Urgency Level',
    content: 'Normal: Standard scheduling. Urgent: Prioritize in queue. Critical: Immediate attention required.',
  },
  bomRef: {
    title: 'Bill of Materials',
    content: 'BOM reference defines material requirements. Auto-populated when product is selected.',
  },
  workCenter: {
    title: 'Work Center',
    content: 'Primary production area where this work order will be executed.',
  },
};

export default function AddWorkOrderEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WorkOrderFormData>(getInitialForm);
  const [initialForm, setInitialForm] = useState<WorkOrderFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const items = await commonMastersService.getItemsFull(COMPANY_ID);
        if (cancelled) return;
        setProducts(
          items.map((it) => ({
            code: it.code,
            name: it.name,
            description: it.description || '',
            uom: it.uom?.code || it.uom?.name || 'Pcs',
            bomRef: '',
          })),
        );
      } catch (err) {
        if (!cancelled) setProductsError('Failed to load products');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const steps: Step[] = [
    { id: '1', label: 'Product', description: 'Select product' },
    { id: '2', label: 'Schedule', description: 'Dates & priority' },
    { id: '3', label: 'Resources', description: 'Work center & team' },
    { id: '4', label: 'Materials', description: 'BOM & materials' },
    { id: '5', label: 'Review', description: 'Submit' },
  ];

  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 12;
    if (formData.productCode) filled++;
    if (formData.productName) filled++;
    if (formData.quantity > 0) filled++;
    if (formData.dueDate) filled++;
    if (formData.plannedStartDate) filled++;
    if (formData.plannedEndDate) filled++;
    if (formData.workCenter) filled++;
    if (formData.supervisor) filled++;
    if (formData.bomRef) filled++;
    if (formData.materialRequirements.length > 0) filled++;
    if (formData.operations.length > 0) filled++;
    if (currentStep === 4) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, currentStep]);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData as unknown as Record<string, unknown>, {
    key: 'work-order-draft',
    debounceMs: 2000,
    onRestore: (data) => {
      setFormData(data as unknown as WorkOrderFormData);
      setShowDraftBanner(false);
    },
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

  const handleInputChange = (field: keyof WorkOrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const selectProduct = (product: ProductOption) => {
    setFormData((prev) => ({
      ...prev,
      productCode: product.code,
      productName: product.name,
      productDescription: product.description,
      uom: product.uom || prev.uom,
      bomRef: product.bomRef,
      materialRequirements: [
        { id: '1', itemCode: 'MAT-001', description: 'Primary Material', requiredQty: 10, uom: 'Kg', stockAvailable: 50, stockStatus: 'available' },
        { id: '2', itemCode: 'MAT-002', description: 'Secondary Component', requiredQty: 5, uom: 'Pcs', stockAvailable: 3, stockStatus: 'shortage' },
      ],
      operations: [
        { id: '1', sequence: 1, operationName: 'Cutting', workCenter: 'CNC Machining', setupTime: 30, runTime: 60 },
        { id: '2', sequence: 2, operationName: 'Assembly', workCenter: 'Assembly Line A', setupTime: 15, runTime: 90 },
      ],
    }));
    setProductSearch('');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.productCode) newErrors.productCode = 'Select a product';
      if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (step === 1) {
      if (!formData.dueDate) newErrors.dueDate = 'Due date required';
      if (!formData.plannedStartDate) newErrors.plannedStartDate = 'Start date required';
      if (!formData.plannedEndDate) newErrors.plannedEndDate = 'End date required';
    }

    if (step === 2) {
      if (!formData.workCenter) newErrors.workCenter = 'Work center required';
      if (!formData.supervisor) newErrors.supervisor = 'Supervisor required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    try {
      await workOrderService.createWorkOrder(formData as any);
      clearDraft();
      router.push('/production/work-orders');
    } catch (error) {
      console.error('Failed to create work order:', error);
    }
  };

  const handleSaveDraft = () => {
    alert('Work order saved as draft!');
    router.push('/production/work-orders');
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
    router.push('/production/work-orders');
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const totalEstimatedCost = formData.estimatedMaterialCost + formData.estimatedLaborCost + formData.estimatedOverheadCost;

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
          onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
          lastSaved={lastSaved}
        />
      )}

      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Work Orders</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Factory className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Work Order</h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {formData.woNumber}
              </p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      <div className="mb-2">
        <FormProgressIndicator completedFields={completionPercentage} totalFields={100} variant="bar" showPercentage label="Form completion" />
      </div>

      <div className="mb-8">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(i) => { if (i <= currentStep) setCurrentStep(i); }} variant="circles" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Product Selection */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              Product Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Creation Source
                  <HelpIcon {...FIELD_HELP.createFrom} />
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="createFrom"
                      value="manual"
                      checked={formData.createFrom === 'manual'}
                      onChange={(e) => handleInputChange('createFrom', e.target.value)}
                      className="text-blue-600"
                    />
                    <span>Manual Entry</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="createFrom"
                      value="sales_order"
                      checked={formData.createFrom === 'sales_order'}
                      onChange={(e) => handleInputChange('createFrom', e.target.value)}
                      className="text-blue-600"
                    />
                    <span>From Sales Order</span>
                  </label>
                </div>
              </div>

              {formData.createFrom === 'sales_order' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order Reference</label>
                  <input
                    type="text"
                    value={formData.salesOrderRef}
                    onChange={(e) => handleInputChange('salesOrderRef', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="SO-2025-XXXX"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Product *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Search by code or name..."
                  />
                </div>
                {productsLoading && (
                  <p className="text-sm text-gray-500 mt-2">Loading products…</p>
                )}
                {!productsLoading && productsError && (
                  <p className="text-sm text-red-500 mt-2">{productsError}</p>
                )}
                {!productsLoading && !productsError && productSearch && (() => {
                  const matches = products.filter(p =>
                    p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.name.toLowerCase().includes(productSearch.toLowerCase()),
                  );
                  if (matches.length === 0) {
                    return <p className="text-sm text-gray-500 mt-2">No products found.</p>;
                  }
                  return (
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
                      {matches.map((p) => (
                        <button
                          key={p.code}
                          onClick={() => selectProduct(p)}
                          className="w-full p-3 text-left hover:bg-blue-50 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.code} - {p.description}</p>
                          </div>
                          <Plus className="h-4 w-4 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  );
                })()}
                {errors.productCode && <p className="text-xs text-red-500 mt-1">{errors.productCode}</p>}
              </div>

              {formData.productCode && (
                <>
                  <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-900">Selected Product</h4>
                    <p className="text-blue-800">{formData.productName}</p>
                    <p className="text-sm text-blue-700">{formData.productCode} - {formData.productDescription}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                      min="1"
                    />
                    {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                    <select
                      value={formData.uom}
                      onChange={(e) => handleInputChange('uom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {uoms.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Priority */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Schedule & Priority
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Urgency
                  <HelpIcon {...FIELD_HELP.urgency} />
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start Date *</label>
                <input
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.plannedStartDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.plannedStartDate && <p className="text-xs text-red-500 mt-1">{errors.plannedStartDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned End Date *</label>
                <input
                  type="date"
                  value={formData.plannedEndDate}
                  onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.plannedEndDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.plannedEndDate && <p className="text-xs text-red-500 mt-1">{errors.plannedEndDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer (if applicable)</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Customer name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Resources */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              Resources & Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Work Center *
                  <HelpIcon {...FIELD_HELP.workCenter} />
                </label>
                <select
                  value={formData.workCenter}
                  onChange={(e) => handleInputChange('workCenter', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.workCenter ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Work Center</option>
                  {workCenters.map((wc) => <option key={wc} value={wc}>{wc}</option>)}
                </select>
                {errors.workCenter && <p className="text-xs text-red-500 mt-1">{errors.workCenter}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor *</label>
                <select
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange('supervisor', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.supervisor ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.supervisor && <p className="text-xs text-red-500 mt-1">{errors.supervisor}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any special instructions for production..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Material Cost</label>
                <input
                  type="number"
                  value={formData.estimatedMaterialCost}
                  onChange={(e) => handleInputChange('estimatedMaterialCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Labor Cost</label>
                <input
                  type="number"
                  value={formData.estimatedLaborCost}
                  onChange={(e) => handleInputChange('estimatedLaborCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Overhead Cost</label>
                <input
                  type="number"
                  value={formData.estimatedOverheadCost}
                  onChange={(e) => handleInputChange('estimatedOverheadCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">Total Estimated Cost</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(totalEstimatedCost)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Materials & Operations */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Materials & Operations
            </h3>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  BOM Reference
                  <HelpIcon {...FIELD_HELP.bomRef} />
                </label>
                <span className="text-sm text-blue-600 font-medium">{formData.bomRef || 'Not selected'}</span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Material Requirements</h4>
              {formData.materialRequirements.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">Select a product to load materials</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Code</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Required</th>
                        <th className="px-3 py-2 text-right">Available</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.materialRequirements.map((mat) => (
                        <tr key={mat.id}>
                          <td className="px-3 py-2 font-mono text-xs">{mat.itemCode}</td>
                          <td className="px-3 py-2">{mat.description}</td>
                          <td className="px-3 py-2 text-right">{mat.requiredQty} {mat.uom}</td>
                          <td className="px-3 py-2 text-right">{mat.stockAvailable} {mat.uom}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mat.stockStatus === 'available' ? 'bg-green-100 text-green-700' :
                              mat.stockStatus === 'shortage' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {mat.stockStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Operations / Routing</h4>
              {formData.operations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Settings className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">Select a product to load operations</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.operations.map((op) => (
                    <div key={op.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {op.sequence}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{op.operationName}</p>
                        <p className="text-sm text-gray-500">{op.workCenter}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-500">Setup: {op.setupTime} min</p>
                        <p className="text-gray-500">Run: {op.runTime} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Work Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">WO Number:</span><span className="font-medium font-mono">{formData.woNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Product:</span><span className="font-medium">{formData.productName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Quantity:</span><span className="font-medium">{formData.quantity} {formData.uom}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Priority:</span><span className={`font-medium ${formData.priority === 'Critical' ? 'text-red-600' : ''}`}>{formData.priority}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Schedule & Resources</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Due Date:</span><span className="font-medium">{formData.dueDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Start:</span><span className="font-medium">{formData.plannedStartDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Work Center:</span><span className="font-medium">{formData.workCenter}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Supervisor:</span><span className="font-medium">{formData.supervisor}</span></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2">Estimated Costs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Material:</span><span>{formatCurrency(formData.estimatedMaterialCost)}</span></div>
                  <div className="flex justify-between"><span>Labor:</span><span>{formatCurrency(formData.estimatedLaborCost)}</span></div>
                  <div className="flex justify-between"><span>Overhead:</span><span>{formatCurrency(formData.estimatedOverheadCost)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-blue-300 font-bold">
                    <span>Total:</span><span>{formatCurrency(totalEstimatedCost)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Materials:</span> {formData.materialRequirements.length} items</p>
                  <p><span className="text-gray-500">Operations:</span> {formData.operations.length} steps</p>
                  <p><span className="text-gray-500">BOM:</span> {formData.bomRef}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <PlayCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Ready to Create Work Order</h4>
                  <p className="text-sm text-orange-800">
                    Upon submission, this work order will be created and materials will be reserved.
                    Production can begin on the scheduled start date.
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
          <button onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Save Draft
          </button>
          {currentStep < 4 ? (
            <button onClick={nextStep} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Send className="h-5 w-5" />
              <span>Create Work Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
