'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  purchaseRequisitionService,
  type CreatePurchaseRequisitionDto,
  type PRPriority,
} from '@/services/purchase-requisition.service';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Upload,
  FileText,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Save,
  Send,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
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

interface RequisitionItem {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  totalPrice: number;
  vendor?: string;
  notes?: string;
}

interface RequisitionForm {
  prNumber: string;
  requestDate: string;
  department: string;
  requestedBy: string;
  requestedByEmail: string;
  requestedByPhone: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  purpose: string;
  projectCode: string;
  costCenter: string;
  deliveryDate: string;
  deliveryLocation: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  contactPerson: string;
  contactPhone: string;
  items: RequisitionItem[];
  budgetCode: string;
  budgetAvailable: number;
  estimatedTotal: number;
  currencyCode: string;
  approver: string;
  justification: string;
  alternativeOptions: string;
  notes: string;
  termsAccepted: boolean;
}

const getInitialForm = (): RequisitionForm => ({
  prNumber: 'PR-2025-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
  requestDate: new Date().toISOString().split('T')[0],
  department: '',
  requestedBy: '',
  requestedByEmail: '',
  requestedByPhone: '',
  priority: 'medium',
  purpose: '',
  projectCode: '',
  costCenter: '',
  deliveryDate: '',
  deliveryLocation: '',
  deliveryAddress: '',
  deliveryInstructions: '',
  contactPerson: '',
  contactPhone: '',
  items: [],
  budgetCode: '',
  budgetAvailable: 0,
  estimatedTotal: 0,
  currencyCode: 'INR',
  approver: '',
  justification: '',
  alternativeOptions: '',
  notes: '',
  termsAccepted: false,
});

const departments = ['Production', 'Maintenance', 'Quality Control', 'R&D', 'Administration', 'IT', 'Finance', 'HR', 'Procurement', 'Sales', 'Marketing'];
const categories = ['Raw Materials', 'Components', 'Tools', 'Equipment', 'Consumables', 'Services', 'Software', 'Office Supplies', 'Safety Equipment', 'Other'];
const units = ['Pcs', 'Kg', 'Lt', 'Mt', 'Box', 'Roll', 'Set', 'Pack', 'Hour', 'Day', 'Month'];

const deliveryLocations = [
  { id: 'warehouse-main', name: 'Main Warehouse', address: '123 Industrial Ave, Sector 5' },
  { id: 'warehouse-secondary', name: 'Secondary Warehouse', address: '456 Storage Rd, Sector 8' },
  { id: 'production-floor', name: 'Production Floor', address: 'Building A, Ground Floor' },
  { id: 'office-building', name: 'Office Building', address: 'Corporate Tower, 5th Floor' },
  { id: 'rd-lab', name: 'R&D Laboratory', address: 'Innovation Center, Building C' },
];

const approvers = [
  { id: '1', name: 'Amit Sharma', role: 'Department Head', limit: 500000 },
  { id: '2', name: 'Priya Patel', role: 'Finance Manager', limit: 1000000 },
  { id: '3', name: 'Rajesh Kumar', role: 'GM Operations', limit: 2500000 },
  { id: '4', name: 'Vijay Singh', role: 'Director', limit: 5000000 },
];

const itemCatalog = [
  { code: 'STL-001', name: 'Stainless Steel Sheet', category: 'Raw Materials', unit: 'Kg', price: 850 },
  { code: 'CMP-002', name: 'Circuit Board', category: 'Components', unit: 'Pcs', price: 2500 },
  { code: 'TLS-003', name: 'Drill Bit Set', category: 'Tools', unit: 'Set', price: 1200 },
  { code: 'CNS-004', name: 'Lubricant Oil', category: 'Consumables', unit: 'Lt', price: 450 },
  { code: 'SFT-005', name: 'Safety Helmet', category: 'Safety Equipment', unit: 'Pcs', price: 350 },
];

// Field help content
const FIELD_HELP = {
  priority: {
    title: 'Priority Level',
    content: 'Low: Routine items (7+ days). Medium: Standard (3-7 days). High: Needed soon (1-3 days). Urgent: Critical/emergency needs.',
  },
  purpose: {
    title: 'Purpose/Reason',
    content: 'Describe why these items are needed. Include project context, business justification, and impact if not procured.',
  },
  budgetCode: {
    title: 'Budget Code',
    content: 'The cost center or budget account to charge. Contact Finance if unsure which code to use.',
  },
  approver: {
    title: 'Approver Selection',
    content: 'Approver is auto-suggested based on total value. Higher value requisitions require senior approval.',
  },
  justification: {
    title: 'Business Justification',
    content: 'Explain the business need. Include ROI if applicable, alternatives considered, and urgency factors.',
  },
};

export default function AddRequisitionEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<RequisitionForm>(getInitialForm);
  const [initialForm, setInitialForm] = useState<RequisitionForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RequisitionItem>>({
    itemCode: '',
    itemName: '',
    description: '',
    category: '',
    quantity: 1,
    unit: 'Pcs',
    estimatedPrice: 0,
    totalPrice: 0,
  });

  // Step definitions
  const steps: Step[] = [
    { id: '1', label: 'Basic Info', description: 'Requester details' },
    { id: '2', label: 'Items', description: 'What to procure' },
    { id: '3', label: 'Delivery', description: 'When & where' },
    { id: '4', label: 'Budget', description: 'Approval & budget' },
    { id: '5', label: 'Review', description: 'Submit' },
  ];

  // Calculate form completion
  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 12;
    if (form.department) filled++;
    if (form.requestedBy) filled++;
    if (form.requestedByEmail) filled++;
    if (form.purpose) filled++;
    if (form.items.length > 0) filled++;
    if (form.deliveryDate) filled++;
    if (form.deliveryLocation) filled++;
    if (form.budgetCode) filled++;
    if (form.approver) filled++;
    if (form.justification) filled++;
    if (form.termsAccepted) filled++;
    if (currentStep === 4) filled++;
    return Math.round((filled / total) * 100);
  }, [form, currentStep]);

  // Calculate estimated total
  useEffect(() => {
    const total = form.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (total !== form.estimatedTotal) {
      setForm((prev) => ({ ...prev, estimatedTotal: total }));
    }
  }, [form.items]);

  // Auto-save
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(form as unknown as Record<string, unknown>, {
    key: 'purchase-requisition-draft',
    debounceMs: 2000,
    onRestore: (data) => {
      setForm(data as unknown as RequisitionForm);
      setShowDraftBanner(false);
    },
  });

  // Unsaved changes detection
  const hasChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  useUnsavedChangesWarning(hasChanges);

  // Initialize
  useEffect(() => {
    const initial = getInitialForm();
    setForm(initial);
    setInitialForm(initial);
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.department) newErrors.department = 'Department required';
      if (!form.requestedBy) newErrors.requestedBy = 'Name required';
      if (!form.requestedByEmail) newErrors.requestedByEmail = 'Email required';
      if (form.requestedByEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.requestedByEmail)) {
        newErrors.requestedByEmail = 'Invalid email';
      }
      if (!form.purpose) newErrors.purpose = 'Purpose required';
    }

    if (step === 1) {
      if (form.items.length === 0) newErrors.items = 'Add at least one item';
    }

    if (step === 2) {
      if (!form.deliveryDate) newErrors.deliveryDate = 'Delivery date required';
      if (!form.deliveryLocation) newErrors.deliveryLocation = 'Location required';
    }

    if (step === 3) {
      if (!form.budgetCode) newErrors.budgetCode = 'Budget code required';
      if (!form.approver) newErrors.approver = 'Approver required';
      if (!form.justification) newErrors.justification = 'Justification required';
    }

    if (step === 4) {
      if (!form.termsAccepted) newErrors.termsAccepted = 'Accept terms to proceed';
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

  const handleInputChange = (field: keyof RequisitionForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  // Item management
  const addItem = () => {
    if (!newItem.itemName || !newItem.quantity) return;
    const item: RequisitionItem = {
      id: Date.now().toString(),
      itemCode: newItem.itemCode || '',
      itemName: newItem.itemName || '',
      description: newItem.description || '',
      category: newItem.category || '',
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'Pcs',
      estimatedPrice: newItem.estimatedPrice || 0,
      totalPrice: (newItem.quantity || 1) * (newItem.estimatedPrice || 0),
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({
      itemCode: '',
      itemName: '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'Pcs',
      estimatedPrice: 0,
      totalPrice: 0,
    });
    setShowItemModal(false);
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  };

  const selectCatalogItem = (item: typeof itemCatalog[0]) => {
    setNewItem({
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      unit: item.unit,
      estimatedPrice: item.price,
      quantity: 1,
      totalPrice: item.price,
    });
  };

  const buildRequisitionDto = (): CreatePurchaseRequisitionDto => {
    const priorityMap: Record<string, PRPriority> = {
      low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
    };
    return {
      title: form.purpose || form.prNumber,
      description: form.notes || undefined,
      department: form.department,
      priority: priorityMap[form.priority] ?? 'Medium',
      requiredDate: form.deliveryDate || new Date().toISOString().split('T')[0],
      currency: form.currencyCode || 'INR',
      justification: form.justification || undefined,
      projectId: form.projectCode || undefined,
      budgetCode: form.budgetCode || undefined,
      items: form.items.map((it) => ({
        itemId: it.itemCode,
        quantity: Number(it.quantity ?? 0),
        estimatedUnitPrice: Number(it.estimatedPrice ?? 0),
        requiredDate: form.deliveryDate || new Date().toISOString().split('T')[0],
        suggestedVendorId: it.vendor || undefined,
        notes: it.notes || undefined,
      })),
    };
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    try {
      const created = await purchaseRequisitionService.createRequisition(buildRequisitionDto());
      await purchaseRequisitionService.submitRequisition((created as any).id);
      clearDraft();
      alert('Requisition submitted successfully!');
      router.push('/procurement/requisitions');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit requisition');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await purchaseRequisitionService.createRequisition(buildRequisitionDto());
      clearDraft();
      alert('Requisition saved as draft!');
      router.push('/procurement/requisitions');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save requisition');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Leave anyway?')) {
        router.push('/procurement/requisitions');
      }
    } else {
      router.push('/procurement/requisitions');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {/* Draft Recovery */}
      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
          onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
          lastSaved={lastSaved}
        />
      )}

      {/* Header */}
      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Requisitions</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Purchase Requisition</h1>
              <p className="text-gray-600 text-sm">{form.prNumber}</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <FormProgressIndicator completedFields={completionPercentage} totalFields={100} variant="bar" showPercentage label="Form completion" />
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(i) => { if (i <= currentStep) setCurrentStep(i); }}
          variant="circles"
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Priority
                  <HelpIcon {...FIELD_HELP.priority} />
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested By *</label>
                <input
                  type="text"
                  value={form.requestedBy}
                  onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestedBy ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Your full name"
                />
                {errors.requestedBy && <p className="text-xs text-red-500 mt-1">{errors.requestedBy}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.requestedByEmail}
                  onChange={(e) => handleInputChange('requestedByEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestedByEmail ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="your.email@company.com"
                />
                {errors.requestedByEmail && <p className="text-xs text-red-500 mt-1">{errors.requestedByEmail}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Purpose/Reason *
                  <HelpIcon {...FIELD_HELP.purpose} />
                </label>
                <textarea
                  value={form.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Describe why these items are needed..."
                />
                {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <input
                  type="text"
                  value={form.projectCode}
                  onChange={(e) => handleInputChange('projectCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PRJ-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
                <input
                  type="text"
                  value={form.costCenter}
                  onChange={(e) => handleInputChange('costCenter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CC-PROD-001"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Items to Procure</h3>
              <button
                onClick={() => setShowItemModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.items && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.items}</p>
              </div>
            )}

            {form.items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">No items added yet</p>
                <p className="text-sm text-gray-500">Click "Add Item" to start</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {form.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          {item.itemCode && <p className="text-xs text-gray-500">{item.itemCode}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.estimatedPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">Total:</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(form.estimatedTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Delivery Details */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Delivery Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required By Date *</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label>
                <select
                  value={form.deliveryLocation}
                  onChange={(e) => {
                    const loc = deliveryLocations.find((l) => l.id === e.target.value);
                    handleInputChange('deliveryLocation', e.target.value);
                    if (loc) handleInputChange('deliveryAddress', loc.address);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryLocation ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Location</option>
                  {deliveryLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {errors.deliveryLocation && <p className="text-xs text-red-500 mt-1">{errors.deliveryLocation}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name of contact at delivery location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={form.deliveryInstructions}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Budget & Approval */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Budget & Approval</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Budget Code *
                  <HelpIcon {...FIELD_HELP.budgetCode} />
                </label>
                <input
                  type="text"
                  value={form.budgetCode}
                  onChange={(e) => handleInputChange('budgetCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.budgetCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., BUD-2025-PROD-001"
                />
                {errors.budgetCode && <p className="text-xs text-red-500 mt-1">{errors.budgetCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Available</label>
                <input
                  type="number"
                  value={form.budgetAvailable}
                  onChange={(e) => handleInputChange('budgetAvailable', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Available budget amount"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Approver *
                  <HelpIcon {...FIELD_HELP.approver} />
                </label>
                <select
                  value={form.approver}
                  onChange={(e) => handleInputChange('approver', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.approver ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Approver</option>
                  {approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} - {a.role} (Limit: {formatCurrency(a.limit)})
                    </option>
                  ))}
                </select>
                {errors.approver && <p className="text-xs text-red-500 mt-1">{errors.approver}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Business Justification *
                  <HelpIcon {...FIELD_HELP.justification} />
                </label>
                <textarea
                  value={form.justification}
                  onChange={(e) => handleInputChange('justification', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.justification ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Explain the business need for this requisition..."
                />
                {errors.justification && <p className="text-xs text-red-500 mt-1">{errors.justification}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Options Considered</label>
                <textarea
                  value={form.alternativeOptions}
                  onChange={(e) => handleInputChange('alternativeOptions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What alternatives were considered..."
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-900 font-medium">Estimated Total</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(form.estimatedTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Requisition Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">PR Number:</span><span className="font-medium">{form.prNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Department:</span><span className="font-medium">{form.department}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Requested By:</span><span className="font-medium">{form.requestedBy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Priority:</span><span className={`font-medium capitalize ${form.priority === 'urgent' ? 'text-red-600' : form.priority === 'high' ? 'text-orange-600' : ''}`}>{form.priority}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Delivery & Budget</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Delivery Date:</span><span className="font-medium">{form.deliveryDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="font-medium">{deliveryLocations.find((l) => l.id === form.deliveryLocation)?.name || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Budget Code:</span><span className="font-medium">{form.budgetCode}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Amount:</span><span className="font-bold text-blue-600">{formatCurrency(form.estimatedTotal)}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-3">Items ({form.items.length})</h4>
              <div className="space-y-2">
                {form.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.itemName} x {item.quantity} {item.unit}</span>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label className="text-sm text-gray-700">
                  I confirm that all information is accurate and this requisition follows company procurement policies.
                </label>
                {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
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
              <span>Submit Requisition</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowItemModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Add Item</h3>
                <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Select from Catalog */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select from Catalog</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {itemCatalog.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => selectCatalogItem(item)}
                      className="p-2 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-sm"
                    >
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)}/{item.unit}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., STL-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.itemName}
                    onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {units.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={newItem.estimatedPrice}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input
                    type="text"
                    value={formatCurrency((newItem.quantity || 1) * (newItem.estimatedPrice || 0))}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowItemModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.itemName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
