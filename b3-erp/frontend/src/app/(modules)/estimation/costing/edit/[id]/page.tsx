'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { costEstimateService } from '@/services/estimation-cost-estimate.service';
import {
  ArrowLeft,
  Save,
  DollarSign,
  Package,
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  Calculator,
  Percent,
  TrendingUp,
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
  costingNumber: string;
  boqNumber: string;
  projectName: string;
  clientName: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  currency: string;
  manufacturingOverheadPercent: number;
  administrativeOverheadPercent: number;
  profitMarginPercent: number;
  notes: string;
  items: CostItem[];
  // Calculated fields
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

export default function EditCostingPage() {
  const router = useRouter();
  const params = useParams();
  const costingId = params.id as string;

  const [formData, setFormData] = useState<CostingFormData>({
    costingNumber: '',
    boqNumber: '',
    projectName: '',
    clientName: '',
    status: 'draft',
    currency: 'INR',
    manufacturingOverheadPercent: 15,
    administrativeOverheadPercent: 8,
    profitMarginPercent: 18,
    notes: '',
    items: [],
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await costEstimateService.findOne('default-company-id', costingId)) as any;
        if (!cancelled && raw) {
          const rawItems = Array.isArray(raw.items) ? raw.items : [];
          const mappedItems: CostItem[] = rawItems.map((it: any, idx: number) => {
            const rawCat = String(it.category ?? it.costType ?? '').toLowerCase();
            const category: CostItem['category'] =
              rawCat.includes('labor') || rawCat.includes('labour')
                ? 'labor'
                : rawCat.includes('equip')
                ? 'equipment'
                : rawCat.includes('overhead')
                ? 'overhead'
                : 'materials';
            return {
              id: it.id ?? String(idx + 1),
              description: it.description ?? '',
              category,
              quantity: it.quantity != null ? Number(it.quantity) : 0,
              unit: it.unit ?? 'No',
              unitCost: it.unitCost != null ? Number(it.unitCost) : 0,
              totalCost: it.totalCost != null ? Number(it.totalCost) : 0,
            };
          });
          setFormData((prev) => ({
            ...prev,
            costingNumber: raw.estimateNumber ?? prev.costingNumber,
            boqNumber: raw.boqId ?? prev.boqNumber,
            projectName: raw.title ?? prev.projectName,
            clientName: raw.customerName ?? prev.clientName,
            status:
              (String(raw.status ?? '').toLowerCase().replace(/\s+/g, '_') as CostingFormData['status']) ||
              prev.status,
            currency: raw.currency ?? prev.currency,
            notes: raw.description ?? prev.notes,
            profitMarginPercent:
              raw.contingencyPercentage != null ? Number(raw.contingencyPercentage) : prev.profitMarginPercent,
            items: mappedItems.length > 0 ? mappedItems : prev.items,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load costing');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [costingId]);

  useEffect(() => {
    calculateAllCosts();
  }, [formData.items, formData.manufacturingOverheadPercent, formData.administrativeOverheadPercent, formData.profitMarginPercent]);

  const updateFormData = (field: keyof CostingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateItem = (index: number, field: keyof CostItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate total cost
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

    // Calculate category totals
    const materialCost = items.filter(i => i.category === 'materials').reduce((sum, i) => sum + i.totalCost, 0);
    const laborCost = items.filter(i => i.category === 'labor').reduce((sum, i) => sum + i.totalCost, 0);
    const equipmentCost = items.filter(i => i.category === 'equipment').reduce((sum, i) => sum + i.totalCost, 0);
    const overheadCost = items.filter(i => i.category === 'overhead').reduce((sum, i) => sum + i.totalCost, 0);

    // Calculate subtotal (before overheads and margin)
    const subtotal = materialCost + laborCost + equipmentCost + overheadCost;

    // Apply manufacturing and administrative overheads
    const manufacturingOverhead = subtotal * (formData.manufacturingOverheadPercent / 100);
    const administrativeOverhead = subtotal * (formData.administrativeOverheadPercent / 100);
    const totalCost = subtotal + manufacturingOverhead + administrativeOverhead;

    // Apply profit margin
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one cost item is required';
    }
    if (formData.profitMarginPercent < 0 || formData.profitMarginPercent > 100) {
      newErrors.profitMarginPercent = 'Profit margin must be between 0 and 100';
    }

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitCost < 0) {
        newErrors[`item_${index}_unitCost`] = 'Unit cost cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSaveError('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await costEstimateService.update('default-company-id', costingId, {
        title: formData.projectName,
        description: formData.notes,
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
      router.push('/estimation/costing/view/' + costingId);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      materials: 'bg-blue-100 text-blue-700',
      labor: 'bg-green-100 text-green-700',
      equipment: 'bg-orange-100 text-orange-700',
      overhead: 'bg-purple-100 text-purple-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {isLoading && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Loading costing...
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {saveError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Cost Estimation</h1>
                <p className="text-sm text-gray-600">Costing ID: {costingId}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Costing Number</label>
                <input
                  type="text"
                  value={formData.costingNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Linked BOQ</label>
                <input
                  type="text"
                  value={formData.boqNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
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
          </div>

          {/* Cost Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Cost Items</h2>
              </div>
              <button
                onClick={addNewItem}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty *</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Cost *</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Cost</th>
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
                          className={`w-full min-w-[200px] px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter description"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          className={`w-24 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className={`w-32 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_${index}_unitCost`] ? 'border-red-500' : 'border-gray-300'
                          }`}
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
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                           
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                           
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

            {/* Category Totals */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-2">
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
                <p className="text-xs font-medium text-purple-600 uppercase mb-1">Overhead</p>
                <p className="text-lg font-bold text-purple-900">₹{formData.totalOverheadCost.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Overheads & Margins */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-center space-x-3 mb-3">
              <Percent className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Overheads & Profit Margin</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturing Overhead (%)
                </label>
                <input
                  type="number"
                  value={formData.manufacturingOverheadPercent}
                  onChange={(e) => updateFormData('manufacturingOverheadPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profit Margin (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.profitMarginPercent}
                  onChange={(e) => updateFormData('profitMarginPercent', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.profitMarginPercent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.profitMarginPercent && (
                  <p className="mt-1 text-xs text-red-500">{errors.profitMarginPercent}</p>
                )}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Cost Calculation Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-300">
                  <span className="text-sm text-gray-700">Subtotal (All Items)</span>
                  <span className="text-sm font-semibold text-gray-900">₹{formData.subtotalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-300">
                  <span className="text-sm text-gray-700">Manufacturing Overhead ({formData.manufacturingOverheadPercent}%)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{(formData.subtotalCost * formData.manufacturingOverheadPercent / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-300">
                  <span className="text-sm text-gray-700">Administrative Overhead ({formData.administrativeOverheadPercent}%)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{(formData.subtotalCost * formData.administrativeOverheadPercent / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b-2 border-gray-400">
                  <span className="text-base font-bold text-gray-900">Total Cost</span>
                  <span className="text-lg font-bold text-blue-900">₹{formData.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-300">
                  <span className="text-sm text-green-700">Profit Margin ({formData.profitMarginPercent}%)</span>
                  <span className="text-sm font-semibold text-green-900">₹{formData.marginAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-blue-100 rounded-lg px-4">
                  <span className="text-lg font-bold text-blue-900">Final Quoted Price</span>
                  <span className="text-2xl font-bold text-blue-900">₹{formData.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Comments</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any notes or comments"
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
