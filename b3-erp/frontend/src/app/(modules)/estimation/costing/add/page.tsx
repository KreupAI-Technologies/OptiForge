'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { costEstimateService } from '@/services/estimation-cost-estimate.service';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Package,
  Percent,
  CheckCircle,
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  Calculator,
  DollarSign,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface CostItem {
  id: string;
  description: string;
  category: 'materials' | 'labor' | 'overhead' | 'equipment';
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

interface CostingFormData {
  boqNumber: string;
  projectName: string;
  clientName: string;
  currency: string;
  manufacturingOverheadPercent: number;
  administrativeOverheadPercent: number;
  profitMarginPercent: number;
  notes: string;
  items: CostItem[];
  totalMaterialCost: number;
  totalLaborCost: number;
  totalEquipmentCost: number;
  totalOverheadCost: number;
  subtotalCost: number;
  totalCost: number;
  finalPrice: number;
  marginAmount: number;
}

const units = ['MT', 'Kg', 'Cum', 'Sqm', 'Sqft', 'Rmt', 'No', 'Set', 'Ltr', 'Box', 'Pcs', 'Hrs', 'Days'];
const categories: Array<'materials' | 'labor' | 'overhead' | 'equipment'> = ['materials', 'labor', 'equipment', 'overhead'];
const currencies = ['INR', 'USD', 'EUR', 'GBP'];

const availableBOQs = [
  { id: 'BOQ-2025-001', name: 'Manufacturing Plant Expansion - Phase 2', client: 'Tata Steel Ltd.' },
  { id: 'BOQ-2025-002', name: 'Warehouse Construction Project', client: 'Mahindra Logistics' },
  { id: 'BOQ-2025-003', name: 'Factory Modernization', client: 'L&T Industries' },
];

export default function AddCostingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<CostingFormData>({
    boqNumber: '',
    projectName: '',
    clientName: '',
    currency: 'INR',
    manufacturingOverheadPercent: 15,
    administrativeOverheadPercent: 8,
    profitMarginPercent: 18,
    notes: '',
    items: [
      {
        id: '1',
        description: '',
        category: 'materials',
        quantity: 0,
        unit: 'No',
        unitCost: 0,
        totalCost: 0,
      }
    ],
    totalMaterialCost: 0,
    totalLaborCost: 0,
    totalEquipmentCost: 0,
    totalOverheadCost: 0,
    subtotalCost: 0,
    totalCost: 0,
    finalPrice: 0,
    marginAmount: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [savedProgress, setSavedProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    calculateAllCosts();
  }, [formData.items, formData.manufacturingOverheadPercent, formData.administrativeOverheadPercent, formData.profitMarginPercent]);

  const updateFormData = (field: keyof CostingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBOQSelection = (boqId: string) => {
    const selectedBOQ = availableBOQs.find(boq => boq.id === boqId);
    if (selectedBOQ) {
      updateFormData('boqNumber', selectedBOQ.id);
      updateFormData('projectName', selectedBOQ.name);
      updateFormData('clientName', selectedBOQ.client);
    }
  };

  const updateItem = (index: number, field: keyof CostItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitCost') {
      const item = updatedItems[index];
      updatedItems[index].totalCost = item.quantity * item.unitCost;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addNewItem = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      description: '',
      category: 'materials',
      quantity: 0,
      unit: 'No',
      unitCost: 0,
      totalCost: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      alert('At least one cost item is required');
      return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const duplicateItem = (index: number) => {
    const itemToCopy = { ...formData.items[index] };
    itemToCopy.id = Date.now().toString();
    const updatedItems = [...formData.items];
    updatedItems.splice(index + 1, 0, itemToCopy);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateAllCosts = () => {
    const items = formData.items;

    const materialCost = items.filter(i => i.category === 'materials').reduce((sum, i) => sum + i.totalCost, 0);
    const laborCost = items.filter(i => i.category === 'labor').reduce((sum, i) => sum + i.totalCost, 0);
    const equipmentCost = items.filter(i => i.category === 'equipment').reduce((sum, i) => sum + i.totalCost, 0);
    const overheadCost = items.filter(i => i.category === 'overhead').reduce((sum, i) => sum + i.totalCost, 0);

    const subtotal = materialCost + laborCost + equipmentCost + overheadCost;
    const manufacturingOverhead = subtotal * (formData.manufacturingOverheadPercent / 100);
    const administrativeOverhead = subtotal * (formData.administrativeOverheadPercent / 100);
    const totalCost = subtotal + manufacturingOverhead + administrativeOverhead;
    const marginAmount = totalCost * (formData.profitMarginPercent / 100);
    const finalPrice = totalCost + marginAmount;

    setFormData(prev => ({
      ...prev,
      totalMaterialCost: materialCost,
      totalLaborCost: laborCost,
      totalEquipmentCost: equipmentCost,
      totalOverheadCost: overheadCost,
      subtotalCost: subtotal,
      totalCost: totalCost,
      finalPrice: finalPrice,
      marginAmount: marginAmount,
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.boqNumber) {
        newErrors.boqNumber = 'Please select a BOQ';
      }
      if (!formData.projectName.trim()) {
        newErrors.projectName = 'Project name is required';
      }
    }

    if (step === 2) {
      if (formData.items.length === 0) {
        newErrors.items = 'At least one cost item is required';
      }
      formData.items.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`item_${index}_description`] = 'Description is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const buildEstimatePayload = () => ({
    title: formData.projectName,
    description: formData.notes,
    estimateType: 'Preliminary' as const,
    currency: formData.currency,
    customerName: formData.clientName,
    boqId: formData.boqNumber,
    materialCost: formData.totalMaterialCost ?? 0,
    laborCost: formData.totalLaborCost ?? 0,
    equipmentCost: formData.totalEquipmentCost ?? 0,
    overheadCost: formData.totalOverheadCost ?? 0,
    directCost: formData.subtotalCost ?? 0,
    contingencyPercentage: formData.profitMarginPercent ?? 0,
    totalCost: formData.totalCost ?? 0,
  });

  const buildItemsPayload = () =>
    (Array.isArray(formData.items) ? formData.items : []).map((item, index) => ({
      itemNumber: String(index + 1),
      description: item.description,
      category: item.category,
      costType: (item.category === 'materials'
        ? 'Material'
        : item.category === 'labor'
        ? 'Labor'
        : item.category === 'equipment'
        ? 'Equipment'
        : 'Overhead') as 'Material' | 'Labor' | 'Equipment' | 'Overhead' | 'Subcontractor',
      unit: item.unit,
      quantity: item.quantity ?? 0,
      unitCost: item.unitCost ?? 0,
      totalCost: item.totalCost ?? 0,
    }));

  const handleSaveProgress = async () => {
    setSubmitError(null);
    try {
      await costEstimateService.create(
        'default-company-id',
        buildEstimatePayload(),
        buildItemsPayload()
      );
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save progress');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setSubmitError('Please complete all required fields');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await costEstimateService.create(
        'default-company-id',
        buildEstimatePayload(),
        buildItemsPayload()
      );
      router.push('/estimation/costing');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create cost estimation');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: Building2 },
    { id: 2, name: 'Cost Items', icon: Package },
    { id: 3, name: 'Overheads & Margins', icon: Percent },
    { id: 4, name: 'Review & Submit', icon: CheckCircle },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {submitError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Cost Estimation</h1>
                <p className="text-sm text-gray-600">Multi-step costing with real-time calculations</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-3 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                      disabled={currentStep < step.id}
                      className={`flex items-center space-x-3 ${
                        currentStep === step.id
                          ? 'text-blue-600'
                          : currentStep > step.id
                          ? 'text-green-600 cursor-pointer'
                          : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          currentStep === step.id
                            ? 'border-blue-600 bg-blue-50'
                            : currentStep > step.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm hidden md:block">{step.name}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div
                          className={`h-1 rounded ${
                            currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Step 1: Basic Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select BOQ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.boqNumber}
                    onChange={(e) => handleBOQSelection(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.boqNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select a BOQ --</option>
                    {availableBOQs.map(boq => (
                      <option key={boq.id} value={boq.id}>
                        {boq.id} - {boq.name} ({boq.client})
                      </option>
                    ))}
                  </select>
                  {errors.boqNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.boqNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => updateFormData('projectName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.projectName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => updateFormData('clientName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateFormData('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Cost Items */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Step 2: Cost Items</h2>
                  </div>
                  <button
                    onClick={addNewItem}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description *</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Cost</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className={`w-full min-w-[200px] px-2 py-1 text-sm border rounded ${
                                errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={item.category}
                              onChange={(e) => updateItem(index, 'category', e.target.value)}
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              {units.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-32 px-2 py-1 text-sm text-right border border-gray-300 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{item.totalCost.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => duplicateItem(index)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 uppercase mb-1">Materials</p>
                    <p className="text-lg font-bold text-blue-900">₹{formData.totalMaterialCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-medium text-green-600 uppercase mb-1">Labor</p>
                    <p className="text-lg font-bold text-green-900">₹{formData.totalLaborCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs font-medium text-orange-600 uppercase mb-1">Equipment</p>
                    <p className="text-lg font-bold text-orange-900">₹{formData.totalEquipmentCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs font-medium text-purple-600 uppercase mb-1">Subtotal</p>
                    <p className="text-lg font-bold text-purple-900">₹{formData.subtotalCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Overheads & Margins */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Percent className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Step 3: Overheads & Profit Margin</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturing Overhead (%)
                    </label>
                    <input
                      type="number"
                      value={formData.manufacturingOverheadPercent}
                      onChange={(e) => updateFormData('manufacturingOverheadPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administrative Overhead (%)
                    </label>
                    <input
                      type="number"
                      value={formData.administrativeOverheadPercent}
                      onChange={(e) => updateFormData('administrativeOverheadPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      value={formData.profitMarginPercent}
                      onChange={(e) => updateFormData('profitMarginPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calculator className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Live Cost Calculation</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-sm text-gray-700">Subtotal</span>
                      <span className="text-sm font-semibold">₹{formData.subtotalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-sm text-gray-700">Manufacturing Overhead ({formData.manufacturingOverheadPercent}%)</span>
                      <span className="text-sm font-semibold">₹{(formData.subtotalCost * formData.manufacturingOverheadPercent / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-sm text-gray-700">Administrative Overhead ({formData.administrativeOverheadPercent}%)</span>
                      <span className="text-sm font-semibold">₹{(formData.subtotalCost * formData.administrativeOverheadPercent / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-gray-400">
                      <span className="text-base font-bold">Total Cost</span>
                      <span className="text-lg font-bold text-blue-900">₹{formData.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span className="text-sm text-green-700">Profit Margin ({formData.profitMarginPercent}%)</span>
                      <span className="text-sm font-semibold text-green-900">₹{formData.marginAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-blue-100 rounded-lg px-4">
                      <span className="text-lg font-bold text-blue-900">Final Quoted Price</span>
                      <span className="text-2xl font-bold text-blue-900">₹{formData.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Step 4: Review & Submit</h2>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cost Estimation Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Project Name</p>
                      <p className="text-base font-semibold text-gray-900">{formData.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Client Name</p>
                      <p className="text-base font-semibold text-gray-900">{formData.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Linked BOQ</p>
                      <p className="text-base font-semibold text-gray-900">{formData.boqNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Items</p>
                      <p className="text-base font-semibold text-gray-900">{formData.items.length} items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Final Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-bold">₹{formData.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin ({formData.profitMarginPercent}%):</span>
                      <span className="font-bold text-green-600">₹{formData.marginAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl pt-2 border-t-2 border-green-300">
                      <span className="font-bold">Final Quote Price:</span>
                      <span className="font-bold text-green-900">₹{formData.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Comments</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter any additional notes or comments"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveProgress}
              className={`flex items-center space-x-2 px-6 py-2 border rounded-lg transition-colors ${
                savedProgress
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Save className="h-5 w-5" />
              <span>{savedProgress ? 'Saved!' : 'Save Progress'}</span>
            </button>
            {currentStep === 4 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Costing'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
